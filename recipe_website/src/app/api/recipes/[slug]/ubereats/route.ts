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

    // Generate Uber Eats restaurant search URL
    const searchQuery = encodeURIComponent(recipe.title);
    const url = `https://www.ubereats.com/search?q=${searchQuery}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error generating Uber Eats link:", error);
    return NextResponse.json(
      { error: "Failed to generate Uber Eats link" },
      { status: 500 }
    );
  }
}
