// Unit conversion utilities for recipe ingredients

export type UnitSystem = "metric" | "imperial";

export interface ConversionRule {
  from: string;
  to: string;
  factor: number;
}

// Common unit conversions
const CONVERSIONS: ConversionRule[] = [
  // Volume - Metric to Imperial
  { from: "ml", to: "fl oz", factor: 0.033814 },
  { from: "ml", to: "cup", factor: 0.00422675 },
  { from: "ml", to: "tbsp", factor: 0.067628 },
  { from: "ml", to: "tsp", factor: 0.202884 },
  { from: "l", to: "fl oz", factor: 33.814 },
  { from: "l", to: "cup", factor: 4.22675 },
  { from: "l", to: "pint", factor: 2.11338 },
  { from: "l", to: "quart", factor: 1.05669 },
  { from: "l", to: "gallon", factor: 0.264172 },

  // Volume - Imperial to Metric
  { from: "fl oz", to: "ml", factor: 29.5735 },
  { from: "cup", to: "ml", factor: 236.588 },
  { from: "tbsp", to: "ml", factor: 14.7868 },
  { from: "tsp", to: "ml", factor: 4.92892 },
  { from: "pint", to: "l", factor: 0.473176 },
  { from: "quart", to: "l", factor: 0.946353 },
  { from: "gallon", to: "l", factor: 3.78541 },

  // Weight - Metric to Imperial
  { from: "g", to: "oz", factor: 0.035274 },
  { from: "g", to: "lb", factor: 0.00220462 },
  { from: "kg", to: "oz", factor: 35.274 },
  { from: "kg", to: "lb", factor: 2.20462 },

  // Weight - Imperial to Metric
  { from: "oz", to: "g", factor: 28.3495 },
  { from: "lb", to: "g", factor: 453.592 },
  { from: "lb", to: "kg", factor: 0.453592 },
];

// Unit aliases (normalized names)
const UNIT_ALIASES: Record<string, string> = {
  // Metric volume
  milliliter: "ml",
  millilitre: "ml",
  milliliters: "ml",
  millilitres: "ml",
  liter: "l",
  litre: "l",
  liters: "l",
  litres: "l",

  // Imperial volume
  "fluid ounce": "fl oz",
  "fluid ounces": "fl oz",
  floz: "fl oz",
  cups: "cup",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  pints: "pint",
  quarts: "quart",
  gallons: "gallon",

  // Metric weight
  gram: "g",
  grams: "g",
  kilogram: "kg",
  kilograms: "kg",

  // Imperial weight
  ounce: "oz",
  ounces: "oz",
  pound: "lb",
  pounds: "lb",
};

// Normalize unit names
export function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();
  return UNIT_ALIASES[normalized] || normalized;
}

// Get preferred units for a system
export function getPreferredUnit(
  originalUnit: string,
  targetSystem: UnitSystem
): string {
  const normalized = normalizeUnit(originalUnit);

  // If already in target system, return as-is
  if (isMetric(normalized) && targetSystem === "metric") return normalized;
  if (isImperial(normalized) && targetSystem === "imperial") return normalized;

  // Find conversion
  const conversion = CONVERSIONS.find((c) => c.from === normalized);
  if (conversion) {
    // Choose most appropriate unit based on magnitude
    if (targetSystem === "imperial") {
      // For small amounts, use smaller units
      if (normalized === "ml" || normalized === "l") {
        return "cup"; // Default to cups for liquids
      }
      if (normalized === "g" || normalized === "kg") {
        return "oz"; // Default to oz for weight
      }
    }
    return conversion.to;
  }

  return normalized; // Return original if no conversion found
}

// Check if unit is metric
function isMetric(unit: string): boolean {
  const metricUnits = ["ml", "l", "g", "kg"];
  return metricUnits.includes(unit);
}

// Check if unit is imperial
function isImperial(unit: string): boolean {
  const imperialUnits = [
    "fl oz",
    "cup",
    "tbsp",
    "tsp",
    "pint",
    "quart",
    "gallon",
    "oz",
    "lb",
  ];
  return imperialUnits.includes(unit);
}

// Convert amount between units
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string
): number {
  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);

  if (normalizedFrom === normalizedTo) return amount;

  const conversion = CONVERSIONS.find(
    (c) => c.from === normalizedFrom && c.to === normalizedTo
  );

  if (!conversion) {
    console.warn(`No conversion found from ${fromUnit} to ${toUnit}`);
    return amount;
  }

  return amount * conversion.factor;
}

// Convert ingredient to target system
export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  order: number;
}

export function convertIngredient(
  ingredient: Ingredient,
  targetSystem: UnitSystem
): Ingredient {
  const amount = parseFloat(ingredient.amount);

  if (isNaN(amount)) {
    // Cannot convert non-numeric amounts
    return ingredient;
  }

  const targetUnit = getPreferredUnit(ingredient.unit, targetSystem);
  const convertedAmount = convertUnit(amount, ingredient.unit, targetUnit);

  // Round to reasonable precision
  const roundedAmount = Math.round(convertedAmount * 100) / 100;

  return {
    ...ingredient,
    amount: roundedAmount.toString(),
    unit: targetUnit,
  };
}

// Convert all recipe ingredients
export function convertRecipeIngredients(
  ingredients: Ingredient[],
  targetSystem: UnitSystem
): Ingredient[] {
  return ingredients.map((ing) => convertIngredient(ing, targetSystem));
}

// Format amount for display (handle fractions)
export function formatAmount(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return amount.toString();

  // Check for common fractions
  const fractions: Record<string, string> = {
    "0.25": "¼",
    "0.33": "⅓",
    "0.5": "½",
    "0.66": "⅔",
    "0.75": "¾",
  };

  const decimal = (num % 1).toFixed(2);
  const whole = Math.floor(num);

  if (fractions[decimal]) {
    return whole > 0 ? `${whole} ${fractions[decimal]}` : fractions[decimal];
  }

  // Round to 2 decimal places if not a whole number
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
}
