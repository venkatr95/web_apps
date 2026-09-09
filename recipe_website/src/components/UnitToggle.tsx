"use client";

import {
  convertRecipeIngredients,
  formatAmount,
  type Ingredient,
  type UnitSystem,
} from "@/lib/unitConversion";
import { useEffect, useState } from "react";

interface UnitToggleProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
}

export default function UnitToggle({
  ingredients,
  onIngredientsChange,
}: UnitToggleProps) {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("unitPreference") as UnitSystem;
    if (saved === "metric" || saved === "imperial") {
      setUnitSystem(saved);
      // Convert ingredients on initial load if preference is imperial
      if (saved === "imperial") {
        const converted = convertRecipeIngredients(ingredients, "imperial");
        onIngredientsChange(converted);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = (system: UnitSystem) => {
    setUnitSystem(system);
    localStorage.setItem("unitPreference", system);

    // Convert ingredients
    const converted = convertRecipeIngredients(ingredients, system);
    onIngredientsChange(converted);
  };

  return (
    <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => handleToggle("metric")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          unitSystem === "metric"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Metric (g, ml)
      </button>
      <button
        onClick={() => handleToggle("imperial")}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          unitSystem === "imperial"
            ? "bg-white text-orange-600 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Imperial (oz, cups)
      </button>
    </div>
  );
}

// Component to display converted ingredients
interface IngredientsListProps {
  ingredients: Ingredient[];
  unitSystem: UnitSystem;
}

export function IngredientsList({
  ingredients,
  unitSystem,
}: IngredientsListProps) {
  const [displayIngredients, setDisplayIngredients] = useState(ingredients);

  useEffect(() => {
    const converted = convertRecipeIngredients(ingredients, unitSystem);
    setDisplayIngredients(converted);
  }, [ingredients, unitSystem]);

  return (
    <ul className="space-y-2">
      {displayIngredients.map((ingredient, index) => (
        <li key={index} className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <span>
            <strong>
              {formatAmount(ingredient.amount)} {ingredient.unit}
            </strong>{" "}
            {ingredient.name}
          </span>
        </li>
      ))}
    </ul>
  );
}
