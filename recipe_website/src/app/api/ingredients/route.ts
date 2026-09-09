import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET: Fetch ingredients for autocomplete
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    let ingredients;

    if (query) {
      // Search ingredients by name
      ingredients = await prisma.ingredientCatalog.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        orderBy: [{ usageCount: "desc" }, { name: "asc" }],
        take: limit,
      });
    } else {
      // Get most popular ingredients
      ingredients = await prisma.ingredientCatalog.findMany({
        orderBy: [{ usageCount: "desc" }, { name: "asc" }],
        take: limit,
      });
    }

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    return NextResponse.json(
      { error: "Failed to fetch ingredients" },
      { status: 500 }
    );
  }
}

// POST: Add new ingredients and increment usage count
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ingredients } = body;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "Ingredients array is required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const ingredientName of ingredients) {
      const name = ingredientName.trim();
      if (!name) continue;

      const slug = slugify(name);

      // Upsert ingredient and increment usage count
      const ingredient = await prisma.ingredientCatalog.upsert({
        where: { slug },
        update: {
          usageCount: {
            increment: 1,
          },
        },
        create: {
          name,
          slug,
          usageCount: 1,
        },
      });

      results.push(ingredient);
    }

    return NextResponse.json({
      message: "Ingredients processed successfully",
      count: results.length,
      ingredients: results,
    });
  } catch (error) {
    console.error("Error processing ingredients:", error);
    return NextResponse.json(
      { error: "Failed to process ingredients" },
      { status: 500 }
    );
  }
}
