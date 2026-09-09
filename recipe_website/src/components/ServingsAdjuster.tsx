"use client";

import { formatAmount, parseAmount } from "@/lib/ingredientScaling";
import { useMemo, useState } from "react";

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface ServingsAdjusterProps {
  originalServings: number;
  ingredients: Ingredient[];
}

export default function ServingsAdjuster({
  originalServings,
  ingredients,
}: ServingsAdjusterProps) {
  const [servings, setServings] = useState<number>(
    Math.max(1, originalServings || 1)
  );

  const factor = useMemo(() => {
    const oldYield = Math.max(1, originalServings || 1);
    const newYield = Math.max(1, servings || 1);
    return newYield / oldYield;
  }, [servings, originalServings]);

  const scaledIngredients = useMemo(() => {
    return ingredients.map((ingredient) => {
      const base = parseAmount(String(ingredient.amount ?? "0"));
      const scaled = base * factor;
      return {
        ...ingredient,
        amount: formatAmount(scaled),
      };
    });
  }, [ingredients, factor]);

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Persons
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) =>
              setServings(Math.max(1, parseInt(e.target.value || "1")))
            }
            className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label="Number of persons"
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Original: {originalServings} • Factor: {factor.toFixed(2)}
          </span>
        </div>
      </div>

      <ul className="space-y-3">
        {scaledIngredients.map((ingredient) => (
          <li key={ingredient.id} className="flex items-start gap-2">
            <span className="text-primary-600 dark:text-primary-400 mt-1.5">
              •
            </span>
            <span className="flex-1 text-gray-700 dark:text-gray-300">
              <span className="font-medium">
                {ingredient.amount} {ingredient.unit}
              </span>{" "}
              {ingredient.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
