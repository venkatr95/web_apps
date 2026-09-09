import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    // Get the current recipe
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Get category IDs from current recipe
    const categoryIds = recipe.categories.map((rc) => rc.categoryId);

    // Find similar recipes using multiple criteria
    const suggestions = await prisma.recipe.findMany({
      where: {
        AND: [
          { id: { not: recipe.id } }, // Exclude current recipe
          { published: true },
          {
            OR: [
              { cuisine: recipe.cuisine }, // Same cuisine
              { difficulty: recipe.difficulty }, // Same difficulty
              {
                categories: {
                  some: {
                    categoryId: {
                      in: categoryIds, // Same categories
                    },
                  },
                },
              },
            ],
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      take: 8,
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
    });

    // Calculate average rating for each suggestion
    const suggestionsWithRatings = suggestions.map((suggestion) => {
      const avgRating =
        suggestion.reviews.length > 0
          ? suggestion.reviews.reduce((sum, review) => sum + review.rating, 0) /
            suggestion.reviews.length
          : 0;

      return {
        id: suggestion.id,
        title: suggestion.title,
        slug: suggestion.slug,
        description: suggestion.description,
        imageUrl: suggestion.imageUrl,
        prepTime: suggestion.prepTime,
        cookTime: suggestion.cookTime,
        totalTime: suggestion.totalTime,
        servings: suggestion.servings,
        difficulty: suggestion.difficulty,
        cuisine: suggestion.cuisine,
        author: suggestion.author,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: suggestion.reviews.length,
        favoritesCount: suggestion._count.favorites,
      };
    });

    return NextResponse.json({
      suggestions: suggestionsWithRatings,
      basedOn: {
        cuisine: recipe.cuisine,
        difficulty: recipe.difficulty,
        categories: recipe.categories.map((rc) => rc.category.name),
      },
    });
  } catch (error) {
    console.error("Error fetching recipe suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
