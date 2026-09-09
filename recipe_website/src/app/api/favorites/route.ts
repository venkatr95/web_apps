import { authOptions } from "@/lib/auth";
import { DEMO_RECIPES, isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await request.json();

    if (isDemoMode()) {
      return NextResponse.json(
        {
          favorite: { id: "demo", userId: session.user.id, recipeId },
          message: "Added to favorites",
          _demoMode: true,
          _message: "Demo mode: Favorite not persisted",
        },
        { status: 201 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        recipeId,
      },
    });

    return NextResponse.json(
      { favorite, message: "Added to favorites" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipeId } = await request.json();

    if (isDemoMode()) {
      return NextResponse.json(
        {
          message: "Removed from favorites",
          _demoMode: true,
          _message: "Demo mode: Favorite removal not persisted",
        },
        { status: 200 }
      );
    }

    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
    });

    return NextResponse.json(
      { message: "Removed from favorites" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDemoMode()) {
      const demoFavorites = DEMO_RECIPES.slice(0, 2).map((recipe) => ({
        id: `demo-fav-${recipe.id}`,
        userId: session.user.id,
        recipeId: recipe.id,
        createdAt: new Date().toISOString(),
        recipe,
      }));

      return NextResponse.json({
        favorites: demoFavorites,
        _demoMode: true,
      });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        recipe: {
          include: {
            author: { select: { name: true } },
            reviews: { select: { rating: true } },
            categories: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Get favorites error:", error);
    return NextResponse.json(
      { error: "Failed to get favorites" },
      { status: 500 }
    );
  }
}
