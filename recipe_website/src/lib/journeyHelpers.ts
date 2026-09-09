// Helper utilities for journey tracking and smart suggestions

export function getTimeOfDay(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snack";
  if (hour >= 17 && hour < 22) return "dinner";
  return "late-night";
}

export function getMealCourseByTime(): string {
  const timeOfDay = getTimeOfDay();
  const mapping: Record<string, string> = {
    breakfast: "BREAKFAST",
    lunch: "MAIN_COURSE",
    snack: "SNACK",
    dinner: "MAIN_COURSE",
    "late-night": "SNACK",
  };
  return mapping[timeOfDay] || "MAIN_COURSE";
}

export function parseEmotionTags(prompt: string): string[] {
  const emotionKeywords: Record<string, string[]> = {
    comfort: ["comfort", "cozy", "warm", "hearty", "homey"],
    light: ["light", "fresh", "healthy", "clean", "simple"],
    indulgent: ["indulgent", "rich", "decadent", "luxurious", "fancy"],
    quick: ["quick", "fast", "easy", "simple", "convenient"],
    spicy: ["spicy", "hot", "fiery", "tangy", "zesty"],
    sweet: ["sweet", "dessert", "sugary", "treat"],
    savory: ["savory", "salty", "umami", "meaty"],
  };

  const lowerPrompt = prompt.toLowerCase();
  const tags: string[] = [];

  for (const [tag, keywords] of Object.entries(emotionKeywords)) {
    if (keywords.some((keyword) => lowerPrompt.includes(keyword))) {
      tags.push(tag);
    }
  }

  return tags;
}

export function getIngredientSuggestions(
  selectedIngredients: string[],
  maxSuggestions: number = 5
): string[] {
  // Complementary ingredient suggestions based on what's already selected
  const complementaryPairs: Record<string, string[]> = {
    chicken: ["garlic", "onion", "tomatoes", "herbs", "lemon"],
    tomatoes: ["basil", "garlic", "onion", "olive oil", "mozzarella"],
    pasta: ["tomato sauce", "garlic", "olive oil", "parmesan", "basil"],
    rice: ["soy sauce", "vegetables", "eggs", "ginger", "garlic"],
    beef: ["onions", "garlic", "potatoes", "carrots", "herbs"],
    fish: ["lemon", "dill", "garlic", "butter", "capers"],
    potatoes: ["butter", "cheese", "bacon", "herbs", "sour cream"],
    eggs: ["cheese", "butter", "milk", "bread", "vegetables"],
  };

  const suggestions = new Set<string>();

  for (const ingredient of selectedIngredients) {
    const lowerIngredient = ingredient.toLowerCase();
    for (const [key, complements] of Object.entries(complementaryPairs)) {
      if (lowerIngredient.includes(key)) {
        complements.forEach((comp) => {
          if (
            !selectedIngredients.some((si) =>
              si.toLowerCase().includes(comp.toLowerCase())
            )
          ) {
            suggestions.add(comp);
          }
        });
      }
    }
  }

  return Array.from(suggestions).slice(0, maxSuggestions);
}

export function calculateServingAdjustment(
  originalServings: number,
  availableIngredients: string[],
  recipeIngredients: string[]
): number {
  // Calculate if serving size should be adjusted based on available ingredients
  const matchCount = availableIngredients.filter((ai) =>
    recipeIngredients.some(
      (ri) =>
        ri.toLowerCase().includes(ai.toLowerCase()) ||
        ai.toLowerCase().includes(ri.toLowerCase())
    )
  ).length;

  const matchRatio = matchCount / recipeIngredients.length;

  // If user has less than 70% of ingredients, suggest reducing servings
  if (matchRatio < 0.7 && originalServings > 2) {
    return Math.max(2, Math.floor(originalServings * 0.5));
  }

  return originalServings;
}

export function formatJourneyTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return "over a week ago";
}
