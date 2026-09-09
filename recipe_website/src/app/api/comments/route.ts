import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { isDemoMode } from "@/lib/demo";

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  recipeId: z.string(),
  parentId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = commentSchema.parse(body);

    if (isDemoMode()) {
      return NextResponse.json(
        {
          comment: {
            id: `demo-comment-${Date.now()}`,
            content: validatedData.content,
            userId: session.user.id,
            recipeId: validatedData.recipeId,
            parentId: validatedData.parentId || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              id: session.user.id,
              name: session.user.name,
              image: session.user.image,
            },
          },
          _demoMode: true,
          _message: "Demo mode: Comment not persisted",
        },
        { status: 201 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        userId: session.user.id,
        recipeId: validatedData.recipeId,
        parentId: validatedData.parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json(
        { error: "Recipe ID required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        recipeId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Failed to get comments" },
      { status: 500 }
    );
  }
}
