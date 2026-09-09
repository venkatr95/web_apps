import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { recipeSchema } from "@/lib/validations";
import type { UpdateRecipeDTO } from "@/types/recipe.dto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try to find by slug first, then by id (for backwards compatibility)
    const recipe = await prisma.recipe.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        ingredients: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error("Get recipe error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find by slug first, then by id
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      select: { id: true, authorId: true, slug: true, title: true },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if user is admin or recipe owner
    const isAdmin = session.user.role === "ADMIN";
    const isOwner = existingRecipe.authorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to edit this recipe" },
        { status: 403 }
      );
    }

    const body: UpdateRecipeDTO = await request.json();
    const validatedData = recipeSchema.parse(body);

    // Generate new slug if title changed
    let newSlug = existingRecipe.slug;
    if (validatedData.title !== existingRecipe.title) {
      newSlug = generateSlug(validatedData.title);
      let slugExists = await prisma.recipe.findFirst({
        where: { slug: newSlug, id: { not: existingRecipe.id } },
      });
      let counter = 1;

      while (slugExists) {
        newSlug = `${generateSlug(validatedData.title)}-${counter}`;
        slugExists = await prisma.recipe.findFirst({
          where: { slug: newSlug, id: { not: existingRecipe.id } },
        });
        counter++;
      }
    }

    // Get category IDs
    const categoryIds = await Promise.all(
      validatedData.categories.map(async (catSlug) => {
        const category = await prisma.category.findUnique({
          where: { slug: catSlug },
        });
        return category?.id;
      })
    );

    const validCategoryIds = categoryIds.filter(
      (id): id is string => id !== null
    );

    // Update recipe
    const recipe = await prisma.recipe.update({
      where: { id: existingRecipe.id },
      data: {
        title: validatedData.title,
        slug: newSlug,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        prepTime: validatedData.prepTime,
        cookTime: validatedData.cookTime,
        totalTime: validatedData.totalTime,
        servings: validatedData.servings,
        difficulty: validatedData.difficulty,
        cuisine: validatedData.cuisine as never,
        category: validatedData.category as never,
        mealCourse: validatedData.mealCourse as never,
        country: validatedData.country as never,
        instructions: validatedData.instructions,
        categories: {
          deleteMany: {},
          create: validCategoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        ingredients: {
          deleteMany: {},
          create: validatedData.ingredients.map((ing, index) => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
            order: index + 1,
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Invalidate caches for detail and list pages
    try {
      revalidateTag("recipe:" + existingRecipe.slug);
      revalidateTag("recipe:" + newSlug);
      revalidateTag("recipes:list");
    } catch {}

    return NextResponse.json(
      { recipe, message: "Recipe updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update recipe error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "An error occurred while updating the recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find by slug first, then by id
    const existingRecipe = await prisma.recipe.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      select: { id: true, authorId: true },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (existingRecipe.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.recipe.delete({
      where: { id: existingRecipe.id },
    });

    return NextResponse.json(
      { message: "Recipe deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete recipe error:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the recipe" },
      { status: 500 }
    );
  }
}
