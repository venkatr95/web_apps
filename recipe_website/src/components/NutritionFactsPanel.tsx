"use client";

import { useState } from "react";
import { FiActivity } from "react-icons/fi";

interface NutritionData {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  cholesterol?: number | null;
  vitaminA?: number | null;
  vitaminC?: number | null;
  vitaminD?: number | null;
  vitaminB12?: number | null;
  iron?: number | null;
  calcium?: number | null;
  potassium?: number | null;
  allergens?: string[] | null;
  dietaryFlags?: string[] | null;
}

interface NutritionFactsPanelProps {
  nutrition: NutritionData;
  servings: number;
}

export default function NutritionFactsPanel({
  nutrition,
  servings,
}: NutritionFactsPanelProps) {
  const [showExtended, setShowExtended] = useState(false);

  // Calculate macronutrient percentages for pie chart
  const totalMacros =
    nutrition.protein + nutrition.carbohydrates + nutrition.fat;
  const proteinPercent = (nutrition.protein / totalMacros) * 100;
  const carbsPercent = (nutrition.carbohydrates / totalMacros) * 100;
  const fatPercent = (nutrition.fat / totalMacros) * 100;

  // Parse allergens and dietary flags from JSON if needed
  const allergens = Array.isArray(nutrition.allergens)
    ? nutrition.allergens
    : nutrition.allergens
    ? JSON.parse(nutrition.allergens as string)
    : [];

  const dietaryFlags = Array.isArray(nutrition.dietaryFlags)
    ? nutrition.dietaryFlags
    : nutrition.dietaryFlags
    ? JSON.parse(nutrition.dietaryFlags as string)
    : [];

  return (
    <div className="bg-white border-2 border-gray-900 rounded-lg p-6 max-w-md">
      {/* FDA Nutrition Facts Label Style */}
      <div className="border-b-8 border-gray-900 pb-2 mb-3">
        <h2 className="text-3xl font-black">Nutrition Facts</h2>
        <div className="text-sm">{servings} servings per recipe</div>
      </div>

      <div className="border-b-4 border-gray-900 pb-2 mb-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-semibold">Serving size</span>
          <span className="text-xs">1 serving</span>
        </div>
      </div>

      <div className="border-b-8 border-gray-900 pb-3 mb-3">
        <div className="flex justify-between items-end">
          <span className="text-xs font-bold">Amount per serving</span>
        </div>
        <div className="flex justify-between items-end mt-1">
          <span className="text-4xl font-black">Calories</span>
          <span className="text-4xl font-black">{nutrition.calories}</span>
        </div>
      </div>

      <div className="border-b border-gray-400 pb-1 mb-2">
        <div className="text-xs font-bold text-right">% Daily Value*</div>
      </div>

      {/* Macronutrients */}
      <NutritionRow
        label="Total Fat"
        amount={`${nutrition.fat}g`}
        dailyValue={Math.round((nutrition.fat / 78) * 100)}
        bold
      />
      <NutritionRow
        label="Total Carbohydrate"
        amount={`${nutrition.carbohydrates}g`}
        dailyValue={Math.round((nutrition.carbohydrates / 275) * 100)}
        bold
      />
      {nutrition.fiber && (
        <NutritionRow
          label="Dietary Fiber"
          amount={`${nutrition.fiber}g`}
          dailyValue={Math.round((nutrition.fiber / 28) * 100)}
          indent
        />
      )}
      {nutrition.sugar && (
        <NutritionRow
          label="Total Sugars"
          amount={`${nutrition.sugar}g`}
          indent
        />
      )}
      <NutritionRow
        label="Protein"
        amount={`${nutrition.protein}g`}
        dailyValue={Math.round((nutrition.protein / 50) * 100)}
        bold
      />

      {/* Micronutrients */}
      {showExtended && (
        <>
          <div className="border-t-4 border-gray-900 pt-2 mt-2">
            {nutrition.cholesterol && (
              <NutritionRow
                label="Cholesterol"
                amount={`${nutrition.cholesterol}mg`}
                dailyValue={Math.round((nutrition.cholesterol / 300) * 100)}
              />
            )}
            {nutrition.sodium && (
              <NutritionRow
                label="Sodium"
                amount={`${nutrition.sodium}mg`}
                dailyValue={Math.round((nutrition.sodium / 2300) * 100)}
              />
            )}
          </div>

          <div className="border-t-4 border-gray-900 pt-2 mt-2">
            <div className="text-xs font-bold mb-2">Vitamins & Minerals</div>
            {nutrition.vitaminA && (
              <NutritionRow
                label="Vitamin A"
                amount={`${nutrition.vitaminA}mcg`}
                dailyValue={Math.round((nutrition.vitaminA / 900) * 100)}
              />
            )}
            {nutrition.vitaminC && (
              <NutritionRow
                label="Vitamin C"
                amount={`${nutrition.vitaminC}mg`}
                dailyValue={Math.round((nutrition.vitaminC / 90) * 100)}
              />
            )}
            {nutrition.vitaminD && (
              <NutritionRow
                label="Vitamin D"
                amount={`${nutrition.vitaminD}mcg`}
                dailyValue={Math.round((nutrition.vitaminD / 20) * 100)}
              />
            )}
            {nutrition.vitaminB12 && (
              <NutritionRow
                label="Vitamin B12"
                amount={`${nutrition.vitaminB12}mcg`}
                dailyValue={Math.round((nutrition.vitaminB12 / 2.4) * 100)}
              />
            )}
            {nutrition.iron && (
              <NutritionRow
                label="Iron"
                amount={`${nutrition.iron}mg`}
                dailyValue={Math.round((nutrition.iron / 18) * 100)}
              />
            )}
            {nutrition.calcium && (
              <NutritionRow
                label="Calcium"
                amount={`${nutrition.calcium}mg`}
                dailyValue={Math.round((nutrition.calcium / 1300) * 100)}
              />
            )}
            {nutrition.potassium && (
              <NutritionRow
                label="Potassium"
                amount={`${nutrition.potassium}mg`}
                dailyValue={Math.round((nutrition.potassium / 4700) * 100)}
              />
            )}
          </div>
        </>
      )}

      <div className="border-t-4 border-gray-900 pt-2 mt-2">
        <button
          onClick={() => setShowExtended(!showExtended)}
          className="text-sm text-blue-600 hover:underline font-semibold"
        >
          {showExtended ? "Show Less" : "Show All Nutrients"}
        </button>
      </div>

      <div className="border-t-4 border-gray-900 pt-2 mt-3">
        <div className="text-xs text-gray-600">
          * Percent Daily Values are based on a 2,000 calorie diet.
        </div>
      </div>

      {/* Macronutrient Pie Chart */}
      <div className="mt-6 pt-6 border-t border-gray-300">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <FiActivity />
          Macronutrient Distribution
        </h3>
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 200 200" className="w-32 h-32">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="60"
              strokeDasharray={`${(proteinPercent / 100) * 502.4} 502.4`}
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="60"
              strokeDasharray={`${(carbsPercent / 100) * 502.4} 502.4`}
              strokeDashoffset={-((proteinPercent / 100) * 502.4)}
              transform="rotate(-90 100 100)"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#ef4444"
              strokeWidth="60"
              strokeDasharray={`${(fatPercent / 100) * 502.4} 502.4`}
              strokeDashoffset={
                -(((proteinPercent + carbsPercent) / 100) * 502.4)
              }
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="flex-1 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
              <span>Protein: {proteinPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded-sm"></div>
              <span>Carbs: {carbsPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <span>Fat: {fatPercent.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dietary Flags & Allergens */}
      {(dietaryFlags.length > 0 || allergens.length > 0) && (
        <div className="mt-6 pt-6 border-t border-gray-300">
          {dietaryFlags.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-bold mb-2">Dietary Labels</h4>
              <div className="flex flex-wrap gap-2">
                {dietaryFlags.map((flag: string) => (
                  <span
                    key={flag}
                    className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full"
                  >
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {allergens.length > 0 && (
            <div>
              <h4 className="text-sm font-bold mb-2">Contains Allergens</h4>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen: string) => (
                  <span
                    key={allergen}
                    className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for nutrition rows
function NutritionRow({
  label,
  amount,
  dailyValue,
  bold = false,
  indent = false,
}: {
  label: string;
  amount: string;
  dailyValue?: number;
  bold?: boolean;
  indent?: boolean;
}) {
  return (
    <div
      className={`flex justify-between border-t border-gray-400 pt-1 pb-1 text-sm ${
        indent ? "pl-4" : ""
      }`}
    >
      <span className={bold ? "font-bold" : ""}>
        {label} {amount}
      </span>
      {dailyValue !== undefined && (
        <span className={bold ? "font-bold" : ""}>{dailyValue}%</span>
      )}
    </div>
  );
}
