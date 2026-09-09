/**
 * Ingredient Scaling Utilities
 *
 * Handles dynamic ingredient proportions based on:
 * - Ingredient type (spice, oil, water vs. regular ingredients)
 * - Number of servings
 * - User preferences (optional)
 */

export interface ScalingPreferences {
  spiceMultiplier?: number; // Default: 1.8-2.1x
  oilMultiplier?: number; // Default: 1.8-2.1x
  waterMultiplier?: number; // Default: 1.8-2.1x
  defaultMultiplier?: number; // Default: 2x
}

const DEFAULT_PREFERENCES: ScalingPreferences = {
  spiceMultiplier: 1.95, // Middle of 1.8-2.1 range
  oilMultiplier: 1.9,
  waterMultiplier: 2.0,
  defaultMultiplier: 2.0,
};

// Keywords to identify spice ingredients
const SPICE_KEYWORDS = [
  "pepper",
  "chili",
  "chilli",
  "cayenne",
  "paprika",
  "cumin",
  "coriander",
  "turmeric",
  "garam masala",
  "curry",
  "cardamom",
  "cinnamon",
  "clove",
  "nutmeg",
  "ginger",
  "garlic",
  "mustard",
  "fenugreek",
  "red chili",
  "green chili",
  "spice",
  "masala",
];

// Keywords to identify oil/fat ingredients
const OIL_KEYWORDS = [
  "oil",
  "butter",
  "ghee",
  "fat",
  "shortening",
  "margarine",
  "lard",
  "cooking spray",
];

// Keywords to identify water/liquid ingredients
const WATER_KEYWORDS = ["water", "stock", "broth", "bouillon"];

/**
 * Determines the ingredient type for scaling purposes
 */
export function getIngredientType(
  ingredientName: string
): "spice" | "oil" | "water" | "regular" {
  const lowerName = ingredientName.toLowerCase();

  if (SPICE_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return "spice";
  }

  if (OIL_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return "oil";
  }

  if (WATER_KEYWORDS.some((keyword) => lowerName.includes(keyword))) {
    return "water";
  }

  return "regular";
}

/**
 * Gets the appropriate multiplier for an ingredient
 */
export function getScalingMultiplier(
  ingredientName: string,
  preferences: ScalingPreferences = {}
): number {
  const prefs = { ...DEFAULT_PREFERENCES, ...preferences };
  const type = getIngredientType(ingredientName);

  switch (type) {
    case "spice":
      return prefs.spiceMultiplier || DEFAULT_PREFERENCES.spiceMultiplier!;
    case "oil":
      return prefs.oilMultiplier || DEFAULT_PREFERENCES.oilMultiplier!;
    case "water":
      return prefs.waterMultiplier || DEFAULT_PREFERENCES.waterMultiplier!;
    default:
      return prefs.defaultMultiplier || DEFAULT_PREFERENCES.defaultMultiplier!;
  }
}

/**
 * Scales an ingredient amount for a different number of servings
 */
export function scaleIngredientAmount(
  amount: number,
  ingredientName: string,
  originalServings: number,
  newServings: number,
  preferences?: ScalingPreferences
): number {
  const servingRatio = newServings / originalServings;
  const multiplier = getScalingMultiplier(ingredientName, preferences);

  // Apply the ingredient-specific multiplier
  const scaledAmount = amount * servingRatio * multiplier;

  // Round to reasonable precision
  return Math.round(scaledAmount * 100) / 100;
}

/**
 * Parses a string amount (e.g., "1/2", "1.5", "2 1/4") to a decimal number
 */
export function parseAmount(amountStr: string): number {
  // Handle fractions like "1/2", "1 1/2", "2 1/4"
  const fractionMatch = amountStr.match(/(\d+)?\s*(\d+)\/(\d+)/);

  if (fractionMatch) {
    const whole = fractionMatch[1] ? parseInt(fractionMatch[1]) : 0;
    const numerator = parseInt(fractionMatch[2]);
    const denominator = parseInt(fractionMatch[3]);
    return whole + numerator / denominator;
  }

  // Handle decimals
  const decimal = parseFloat(amountStr);
  return isNaN(decimal) ? 0 : decimal;
}

/**
 * Formats a decimal amount back to a friendly string (with fractions)
 */
export function formatAmount(amount: number): string {
  if (amount === 0) return "0";

  const whole = Math.floor(amount);
  const fraction = amount - whole;

  // Common fractions
  const fractions: { [key: number]: string } = {
    0.25: "1/4",
    0.33: "1/3",
    0.5: "1/2",
    0.66: "2/3",
    0.75: "3/4",
  };

  // Find closest fraction
  let closestFraction = "";
  let minDiff = 0.1;

  for (const [decimal, frac] of Object.entries(fractions)) {
    const diff = Math.abs(fraction - parseFloat(decimal));
    if (diff < minDiff) {
      minDiff = diff;
      closestFraction = frac;
    }
  }

  if (closestFraction && minDiff < 0.05) {
    return whole > 0 ? `${whole} ${closestFraction}` : closestFraction;
  }

  // Return as decimal if no close fraction match
  return amount.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Scales an entire recipe's ingredients
 */
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface ScaledIngredient extends Ingredient {
  originalAmount: string;
  scaledAmount: string;
}

export function scaleRecipeIngredients(
  ingredients: Ingredient[],
  originalServings: number,
  newServings: number,
  preferences?: ScalingPreferences
): ScaledIngredient[] {
  return ingredients.map((ingredient) => {
    const numericAmount = parseAmount(ingredient.amount);
    const scaledNumeric = scaleIngredientAmount(
      numericAmount,
      ingredient.name,
      originalServings,
      newServings,
      preferences
    );

    return {
      ...ingredient,
      originalAmount: ingredient.amount,
      scaledAmount: formatAmount(scaledNumeric),
      amount: formatAmount(scaledNumeric),
    };
  });
}
