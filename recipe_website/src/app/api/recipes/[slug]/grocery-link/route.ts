import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") || "swiggy";

  try {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        ingredients: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Build ingredient list
    const ingredientNames = recipe.ingredients.map((ing) => ing.name);
    const searchQuery = `${recipe.title} ingredients: ${ingredientNames
      .slice(0, 5)
      .join(", ")}`;
    const encodedQuery = encodeURIComponent(searchQuery);

    // Generate platform-specific deep links
    let url = "";

    switch (platform) {
      case "swiggy":
        // Swiggy Instamart search URL
        url = `https://www.swiggy.com/instamart/search?query=${encodedQuery}`;
        break;
      case "blinkit":
        // Blinkit search URL
        url = `https://blinkit.com/s/?q=${encodedQuery}`;
        break;
      case "ubereats":
        // Uber Eats search URL
        url = `https://www.ubereats.com/search?q=${encodedQuery}`;
        break;
      default:
        url = `https://www.swiggy.com/instamart/search?query=${encodedQuery}`;
    }

    return NextResponse.json({ url, ingredients: ingredientNames });
  } catch (error) {
    console.error("Error generating grocery link:", error);
    return NextResponse.json(
      { error: "Failed to generate grocery link" },
      { status: 500 }
    );
  }
}
