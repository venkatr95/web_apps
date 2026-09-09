import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addRecipeSchema = z.object({
  recipeId: z.string(),
});
const removeRecipeSchema = z.object({
  recipeId: z.string(),
});
const getMembershipSchema = z.object({
  recipeId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { recipeId } = addRecipeSchema.parse(body);

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Check if already in collection
    const existing = await prisma.collectionRecipe.findUnique({
      where: {
        collectionId_recipeId: {
          collectionId: id,
          recipeId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Recipe already in collection" },
        { status: 400 }
      );
    }

    const collectionRecipe = await prisma.collectionRecipe.create({
      data: {
        collectionId: id,
        recipeId,
      },
    });

    return NextResponse.json(collectionRecipe, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Add recipe to collection error:", error);
    return NextResponse.json(
      { error: "Failed to add recipe to collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id },
    });
    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }
    if (collection.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { recipeId } = removeRecipeSchema.parse(body);

    await prisma.collectionRecipe.delete({
      where: {
        collectionId_recipeId: {
          collectionId: id,
          recipeId,
        },
      },
    });

    return NextResponse.json(
      { message: "Recipe removed from collection" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Remove recipe from collection error:", error);
    return NextResponse.json(
      { error: "Failed to remove recipe from collection" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");
    const validated = getMembershipSchema.safeParse({ recipeId });

    if (!validated.success) {
      return NextResponse.json({ error: "RecipeId required" }, { status: 400 });
    }

    const membership = await prisma.collectionRecipe.findUnique({
      where: {
        collectionId_recipeId: {
          collectionId: id,
          recipeId: validated.data.recipeId,
        },
      },
    });

    return NextResponse.json({ inCollection: Boolean(membership) });
  } catch (error) {
    console.error("Get collection membership error:", error);
    return NextResponse.json(
      { error: "Failed to check membership" },
      { status: 500 }
    );
  }
}
