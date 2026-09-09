import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Approve a recipe (Admin only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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

    // Find recipe
    const recipe = await prisma.recipe.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Approve and publish recipe
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        published: true,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send notification to recipe author
    // await sendApprovalNotification(updatedRecipe.author.email, recipe.title);

    return NextResponse.json(
      {
        recipe: updatedRecipe,
        message: "Recipe approved and published successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve recipe error:", error);
    return NextResponse.json(
      { error: "An error occurred while approving the recipe" },
      { status: 500 }
    );
  }
}

// Reject a recipe (Admin only)
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

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Find recipe
    const recipe = await prisma.recipe.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Reject recipe (unpublish)
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        approved: false,
        published: false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send rejection notification to recipe author
    // await sendRejectionNotification(updatedRecipe.author.email, recipe.title, reason);

    return NextResponse.json(
      {
        recipe: updatedRecipe,
        message: "Recipe rejected successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reject recipe error:", error);
    return NextResponse.json(
      { error: "An error occurred while rejecting the recipe" },
      { status: 500 }
    );
  }
}
