import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "25");
    const mealType = searchParams.get("mealType");

    const where: Record<string, unknown> = {
      published: true,
    };

    // Filter by meal type if specified
    if (mealType && mealType !== "ANY") {
      // Map generic meal types to mealCourse enum values
      const mealCourseMap: { [key: string]: string[] } = {
        BREAKFAST: [
          "INDIAN_BREAKFAST",
          "NORTH_INDIAN_BREAKFAST",
          "SOUTH_INDIAN_BREAKFAST",
          "WORLD_BREAKFAST",
        ],
        LUNCH: ["LUNCH", "MAIN_COURSE", "ONE_POT_DISH"],
        DINNER: ["DINNER", "MAIN_COURSE", "ONE_POT_DISH"],
        SNACK: ["SNACK", "APPETIZER"],
        DESSERT: ["DESSERT"],
      };

      const mealCourses = mealCourseMap[mealType];
      if (mealCourses) {
        where.mealCourse = {
          in: mealCourses,
        };
      }
    }

    const recipes = await prisma.recipe.findMany({
      where,
      take: limit,
      orderBy: [{ pageVisits: "desc" }, { views: "desc" }, { likes: "desc" }],
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
      },
    });

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error("Error fetching popular recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch popular recipes" },
      { status: 500 }
    );
  }
}
