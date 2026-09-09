/**
 * Update Recipe Fields Script
 *
 * This script adds default values for the new adaptive recommendation fields
 * Run with: npx tsx scripts/updateRecipeFields.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting recipe field updates...");

  const recipes = await prisma.recipe.findMany({
    include: {
      ingredients: true,
    },
  });

  console.log(`Found ${recipes.length} recipes to update`);

  let updated = 0;

  for (const recipe of recipes) {
    const emotionTags: string[] = [];
    const desc = recipe.description.toLowerCase();
    const title = recipe.title.toLowerCase();
    const combined = `${title} ${desc}`;

    // Detect emotion tags
    if (
      combined.includes("spicy") ||
      combined.includes("hot") ||
      combined.includes("chili")
    ) {
      emotionTags.push("spicy");
    }
    if (
      combined.includes("comfort") ||
      combined.includes("cozy") ||
      combined.includes("warm")
    ) {
      emotionTags.push("comforting");
    }
    if (
      combined.includes("fresh") ||
      combined.includes("light") ||
      combined.includes("refreshing")
    ) {
      emotionTags.push("refreshing");
    }
    if (
      combined.includes("rich") ||
      combined.includes("creamy") ||
      combined.includes("indulgent")
    ) {
      emotionTags.push("indulgent");
    }
    if (combined.includes("tangy") || combined.includes("sour")) {
      emotionTags.push("tangy");
    }
    if (combined.includes("sweet") && !combined.includes("bittersweet")) {
      emotionTags.push("sweet");
    }
    if (combined.includes("savory") || combined.includes("umami")) {
      emotionTags.push("savory");
    }
    if (combined.includes("healthy") || combined.includes("nutritious")) {
      emotionTags.push("healthy");
    }
    if (combined.includes("filling") || combined.includes("hearty")) {
      emotionTags.push("filling");
    }
    if (combined.includes("crispy") || combined.includes("crunchy")) {
      emotionTags.push("crispy");
    }

    // Set meal time ranges based on mealCourse
    let timeStart: string | undefined;
    let timeEnd: string | undefined;

    const mealCourse = recipe.mealCourse.toString();

    if (mealCourse.includes("BREAKFAST")) {
      timeStart = "06:00";
      timeEnd = "10:30";
    } else if (mealCourse === "LUNCH") {
      timeStart = "11:30";
      timeEnd = "14:30";
    } else if (mealCourse === "DINNER") {
      timeStart = "17:00";
      timeEnd = "22:00";
    } else if (mealCourse === "SNACK" || mealCourse === "APPETIZER") {
      timeStart = "15:00";
      timeEnd = "17:00";
    } else if (mealCourse === "DESSERT") {
      timeStart = "19:00";
      timeEnd = "22:00";
    } else if (mealCourse === "BRUNCH") {
      timeStart = "10:00";
      timeEnd = "14:00";
    }

    // Infer diet type if not set
    let dietType = recipe.dietType;
    if (!dietType) {
      // Check ingredients for non-veg markers
      const ingredientNames = recipe.ingredients
        .map((i) => i.name.toLowerCase())
        .join(" ");

      if (
        ingredientNames.includes("chicken") ||
        ingredientNames.includes("meat") ||
        ingredientNames.includes("fish") ||
        ingredientNames.includes("pork") ||
        ingredientNames.includes("beef")
      ) {
        dietType = "NON_VEGETARIAN";
      } else if (ingredientNames.includes("egg")) {
        dietType = "EGGETARIAN";
      } else {
        dietType = "VEGETARIAN";
      }
    }

    // Infer spice level
    let spiceLevel = recipe.spiceLevel;
    if (!spiceLevel) {
      const spiceIngredients = recipe.ingredients.filter(
        (i) =>
          i.name.toLowerCase().includes("chili") ||
          i.name.toLowerCase().includes("pepper") ||
          i.name.toLowerCase().includes("cayenne") ||
          i.name.toLowerCase().includes("spicy")
      );

      if (spiceIngredients.length === 0) {
        spiceLevel = 1; // Mild
      } else if (spiceIngredients.length === 1) {
        spiceLevel = 2; // Moderate
      } else if (spiceIngredients.length === 2) {
        spiceLevel = 3; // Medium
      } else {
        spiceLevel = 4; // Hot
      }

      // Check amounts for adjustment
      spiceIngredients.forEach((ing) => {
        const amount = parseFloat(ing.amount);
        if (amount > 2) {
          spiceLevel = Math.min(5, (spiceLevel || 1) + 1);
        }
      });
    }

    try {
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          emotionTags,
          mealTypeTimeRangeStart: timeStart,
          mealTypeTimeRangeEnd: timeEnd,
          pageVisits: recipe.views, // Bootstrap with existing views
          dietType,
          spiceLevel,
          complementRecipeIds: [], // Empty array, can be populated later
        },
      });

      updated++;

      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${recipes.length} recipes...`);
      }
    } catch (error) {
      console.error(`Error updating recipe ${recipe.id}:`, error);
    }
  }

  console.log(`\n✅ Successfully updated ${updated} recipes with new fields`);
  console.log("\nSummary:");
  console.log("- Added emotion tags based on description keywords");
  console.log("- Set meal time ranges based on meal course");
  console.log("- Inferred diet types from ingredients");
  console.log("- Calculated spice levels from ingredients");
  console.log("- Initialized pageVisits with existing views count");
}

main()
  .catch((error) => {
    console.error("Error running migration:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
