import { authOptions } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";
import { createDemoResponse, demoHandlers } from "@/lib/demoApi";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import { recipeSchema } from "@/lib/validations";
import type { CreateRecipeDTO } from "@/types/recipe.dto";
import type {
  Country,
  CuisineType,
  Difficulty,
  MealCourse,
  RecipeCategoryType,
} from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateRecipeDTO = await request.json();
    const validatedData = recipeSchema.parse(body);

    // Check user role for approval workflow
    const isAdmin = session.user.role === "ADMIN";

    // Generate unique slug
    let slug = generateSlug(validatedData.title);
    let slugExists = await prisma.recipe.findUnique({ where: { slug } });
    let counter = 1;

    while (slugExists) {
      slug = `${generateSlug(validatedData.title)}-${counter}`;
      slugExists = await prisma.recipe.findUnique({ where: { slug } });
      counter++;
    }

    // Get or create categories
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

    // Create recipe
    const recipe = await prisma.recipe.create({
      data: {
        title: validatedData.title,
        slug,
        description: validatedData.description,
        imageUrl: validatedData.imageUrl || "",
        prepTime: validatedData.prepTime,
        cookTime: validatedData.cookTime,
        totalTime:
          validatedData.totalTime ??
          validatedData.prepTime + validatedData.cookTime,
        servings: validatedData.servings,
        difficulty: validatedData.difficulty as Difficulty,
        cuisine: validatedData.cuisine
          .toUpperCase()
          .replace(/\s+/g, "_") as CuisineType,
        category: validatedData.category
          .toUpperCase()
          .replace(/\s+/g, "_") as RecipeCategoryType,
        mealCourse: validatedData.mealCourse as MealCourse,
        country: validatedData.country
          .toUpperCase()
          .replace(/\s+/g, "_") as Country,
        instructions: validatedData.instructions,
        published: isAdmin, // Auto-publish if admin, else needs approval
        approved: isAdmin, // Auto-approve if admin
        authorId: session.user.id,
        categories: {
          create: validCategoryIds.map((categoryId) => ({
            categoryId,
          })),
        },
        ingredients: {
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

    return NextResponse.json(
      { recipe, message: "Recipe created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create recipe error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "An error occurred while creating the recipe" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "24");
    const category = searchParams.get("category");
    const cuisine = searchParams.get("cuisine");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

    // Demo mode: return demo recipes
    if (isDemoMode()) {
      const recipes = await demoHandlers.getRecipes({
        search,
        cuisine,
        difficulty: difficulty?.toUpperCase(),
        category,
      });

      const start = (page - 1) * limit;
      const paginatedRecipes = recipes.slice(start, start + limit);

      return createDemoResponse({
        recipes: paginatedRecipes,
        pagination: {
          page,
          limit,
          total: recipes.length,
          totalPages: Math.ceil(recipes.length / limit),
        },
      });
    }

    const where: Record<string, unknown> = { published: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (cuisine) {
      where.cuisine = cuisine;
    }

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        include: {
          author: { select: { name: true } },
          reviews: { select: { rating: true } },
          categories: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.recipe.count({ where }),
    ]);

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get recipes error:", error);

    // Fallback to demo mode on database error
    const recipes = await demoHandlers.getRecipes();
    return createDemoResponse({
      recipes: recipes.slice(0, 24),
      pagination: {
        page: 1,
        limit: 24,
        total: recipes.length,
        totalPages: 1,
      },
    });
  }
}
