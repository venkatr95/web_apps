import { authOptions } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const collectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(true),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = collectionSchema.parse(body);

    if (isDemoMode()) {
      return NextResponse.json(
        {
          collection: {
            id: `demo-collection-${Date.now()}`,
            ...validatedData,
            userId: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          _demoMode: true,
          _message: "Demo mode: Collection not persisted",
        },
        { status: 201 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
      if (!session?.user || session.user.id !== userId) {
        where.isPublic = true;
      }
    } else if (session?.user) {
      where.userId = session.user.id;
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDemoMode()) {
      const demoCollections = [
        {
          id: "demo-collection-1",
          name: "My Favorites",
          description: "My favorite recipes collection",
          isPublic: true,
          userId: session?.user?.id || "demo-user",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          _count: { recipes: 2 },
        },
      ];

      return NextResponse.json({
        collections: demoCollections,
        _demoMode: true,
      });
    }

    const collections = await prisma.collection.findMany({
      where,
      include: {
        _count: {
          select: { recipes: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Get collections error:", error);
    return NextResponse.json(
      { error: "Failed to get collections" },
      { status: 500 }
    );
  }
}
