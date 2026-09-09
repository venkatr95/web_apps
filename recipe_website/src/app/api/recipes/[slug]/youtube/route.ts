import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Generate YouTube search URL
    const searchQuery = encodeURIComponent(`${recipe.title} recipe`);
    const url = `https://www.youtube.com/results?search_query=${searchQuery}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating YouTube link:", error);
    return NextResponse.json(
      { error: "Failed to generate YouTube link" },
      { status: 500 }
    );
  }
}
