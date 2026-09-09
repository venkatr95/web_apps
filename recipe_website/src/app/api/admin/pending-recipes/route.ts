import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Get pending recipes for approval (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Get all pending recipes
    const pendingRecipes = await prisma.recipe.findMany({
      where: {
        approved: false,
        published: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        ingredients: {
          orderBy: { order: "asc" },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      recipes: pendingRecipes,
      total: pendingRecipes.length,
    });
  } catch (error) {
    console.error("Get pending recipes error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching pending recipes" },
      { status: 500 }
    );
  }
}
