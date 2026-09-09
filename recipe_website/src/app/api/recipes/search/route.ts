import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Semantic search endpoint for recipe recommendations
 * Supports:
 * 1. Recipe name search
 * 2. Emotion/mood-based search (e.g., "something comforting and spicy")
 * 3. Ingredient-based search
 * 4. Filter-based search
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const ingredients =
      searchParams.get("ingredients")?.split(",").filter(Boolean) || [];
    const dietType = searchParams.get("dietType");
    const spiceLevel = searchParams.get("spiceLevel");
    const mealCourse = searchParams.get("mealCourse");
    const maxPrepTime = searchParams.get("maxPrepTime");

    if (!query && ingredients.length === 0) {
      return NextResponse.json(
        { error: "Query or ingredients required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {
      published: true,
    };

    // Basic text search
    if (query) {
      // Check if query contains emotion words
      const emotionKeywords = [
        "comforting",
        "comfort",
        "cozy",
        "warm",
        "refreshing",
        "fresh",
        "light",
        "crispy",
        "indulgent",
        "rich",
        "creamy",
        "decadent",
        "spicy",
        "hot",
        "tangy",
        "savory",
        "sweet",
        "healthy",
        "nutritious",
        "filling",
      ];

      const lowerQuery = query.toLowerCase();
      const hasEmotion = emotionKeywords.some((keyword) =>
        lowerQuery.includes(keyword)
      );

      if (hasEmotion) {
        // Extract emotion tags and search in emotionTags array
        const matchedEmotions = emotionKeywords.filter((keyword) =>
          lowerQuery.includes(keyword)
        );

        where.OR = [
          {
            emotionTags: {
              hasSome: matchedEmotions,
            },
          },
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ];
      } else {
        // Standard text search
        where.OR = [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ];
      }
    }

    // Ingredient-based search
    if (ingredients.length > 0) {
      where.ingredients = {
        some: {
          name: {
            in: ingredients.map((i) => i.toLowerCase()),
            mode: "insensitive",
          },
        },
      };
    }

    // Filter by diet type
    if (dietType) {
      where.dietType = dietType;
    }

    // Filter by spice level
    if (spiceLevel) {
      where.spiceLevel = parseInt(spiceLevel);
    }

    // Filter by meal course
    if (mealCourse) {
      where.mealCourse = mealCourse;
    }

    // Filter by prep time
    if (maxPrepTime) {
      where.prepTime = {
        lte: parseInt(maxPrepTime),
      };
    }

    const recipes = await prisma.recipe.findMany({
      where,
      take: 20,
      orderBy: [{ pageVisits: "desc" }, { views: "desc" }],
      include: {
        author: {
          select: {
            name: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        ingredients: {
          select: {
            name: true,
            amount: true,
            unit: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    // Calculate ingredient match score for ingredient-based searches
    if (ingredients.length > 0) {
      const recipesWithScore = recipes.map((recipe) => {
        const recipeIngredients = recipe.ingredients.map((i) =>
          i.name.toLowerCase()
        );
        const matchedIngredients = ingredients.filter((ingredient) =>
          recipeIngredients.some((ri) => ri.includes(ingredient.toLowerCase()))
        );

        return {
          ...recipe,
          matchScore: matchedIngredients.length / ingredients.length,
          matchedIngredients,
        };
      });

      // Sort by match score
      recipesWithScore.sort((a, b) => b.matchScore - a.matchScore);

      return NextResponse.json({ recipes: recipesWithScore });
    }

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Error in semantic search:", error);
    return NextResponse.json(
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  }
}

/**
 * TODO: For production, integrate with OpenAI or similar LLM for:
 * 1. Better emotion/mood understanding
 * 2. Recipe embedding generation for semantic similarity
 * 3. Natural language query understanding
 *
 * Example integration:
 *
 * const response = await openai.embeddings.create({
 *   model: "text-embedding-ada-002",
 *   input: query,
 * });
 *
 * Then use vector similarity search with recipe embeddings
 */
