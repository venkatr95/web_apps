"use client";

import { useEffect, useState } from "react";
import { FiClock } from "react-icons/fi";
import RecipeCard from "./RecipeCard";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  mealCourse: string;
  pageVisits: number;
  author: {
    name: string;
  };
  reviews: {
    rating: number;
  }[];
}

interface PopularRecipesGridProps {
  initialRecipes?: Recipe[];
}

function getCurrentMealType(): string {
  const hour = new Date().getHours();

  // Breakfast: 6:00 - 10:30
  if (hour >= 6 && hour < 11) {
    return "BREAKFAST";
  }
  // Lunch: 11:30 - 14:30
  if (hour >= 11 && hour < 15) {
    return "LUNCH";
  }
  // Snack: 15:00 - 17:00
  if (hour >= 15 && hour < 17) {
    return "SNACK";
  }
  // Dinner: 17:00 - 22:00
  if (hour >= 17 && hour < 22) {
    return "DINNER";
  }
  // Late night / default
  return "ANY";
}

function getMealTypeLabel(mealType: string): string {
  const labels: { [key: string]: string } = {
    BREAKFAST: "Breakfast",
    LUNCH: "Lunch",
    SNACK: "Snacks",
    DINNER: "Dinner",
    ANY: "Popular",
  };
  return labels[mealType] || "Popular";
}

export default function PopularRecipesGrid({
  initialRecipes = [],
}: PopularRecipesGridProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [isLoading, setIsLoading] = useState(false);
  const [mealType, setMealType] = useState("");

  useEffect(() => {
    const currentMealType = getCurrentMealType();
    setMealType(currentMealType);

    // Fetch recipes for current meal type
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          limit: "25",
          sortBy: "pageVisits",
        });

        if (currentMealType !== "ANY") {
          params.set("mealType", currentMealType);
        }

        const response = await fetch(
          `/api/recipes/popular?${params.toString()}`
        );
        const data = await response.json();

        if (data.recipes) {
          setRecipes(data.recipes);
        }
      } catch (error) {
        console.error("Failed to fetch popular recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialRecipes.length === 0) {
      fetchRecipes();
    }
  }, [initialRecipes.length]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-900">
            {getMealTypeLabel(mealType)} Favorites
          </h2>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            Most popular recipes right now
          </p>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-gray-200 rounded-xl h-64"
            />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-600">
            No recipes found. Try adjusting your preferences!
          </p>
        </div>
      )}
    </div>
  );
}
