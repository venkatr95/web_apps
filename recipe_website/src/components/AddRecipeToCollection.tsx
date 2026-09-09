"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import Button from "./ui/Button";

interface AddRecipeToCollectionProps {
  collectionId: string;
}

export default function AddRecipeToCollection({
  collectionId,
}: AddRecipeToCollectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<
    Array<{
      id: string;
      title: string;
      slug: string;
      imageUrl: string;
      author?: { name: string };
    }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/recipes?search=${encodeURIComponent(searchQuery)}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddRecipe = async (recipeId: string) => {
    setIsAdding(recipeId);
    try {
      const response = await fetch(`/api/collections/${collectionId}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });

      if (response.ok) {
        router.refresh();
        setRecipes(recipes.filter((r) => r.id !== recipeId));
        if (recipes.length === 1) {
          setSearchQuery("");
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to add recipe");
      }
    } catch (error) {
      console.error("Error adding recipe:", error);
      alert("Failed to add recipe");
    } finally {
      setIsAdding(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search recipes to add..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </div>

      {recipes.length > 0 && (
        <div className="space-y-2">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div>
                <h4 className="font-medium text-gray-900">{recipe.title}</h4>
                <p className="text-sm text-gray-500">{recipe.author?.name}</p>
              </div>
              <button
                onClick={() => handleAddRecipe(recipe.id)}
                disabled={isAdding === recipe.id}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <FiPlus className="h-4 w-4" />
                {isAdding === recipe.id ? "Adding..." : "Add"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
