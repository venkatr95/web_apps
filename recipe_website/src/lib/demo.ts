// Demo mode configuration and utilities
// This allows the app to work without a database or credentials

export const DEMO_MODE =
  !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("demo");

export const DEMO_USER = {
  id: "demo-user-123",
  email: "demo@example.com",
  name: "Demo User",
  image: null,
  password: null, // No password required for demo
  pin: null,
  role: "USER" as const,
  bio: "Welcome to the recipe website demo!",
  website: null,
  location: "Demo City",
  preferences: { units: "metric", dietaryRestrictions: [] },
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const DEMO_RECIPES = [
  {
    id: "recipe-1",
    title: "Classic Margherita Pizza",
    slug: "classic-margherita-pizza",
    description:
      "A traditional Italian pizza with fresh mozzarella, tomatoes, and basil.",
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    prepTime: 20,
    cookTime: 15,
    totalTime: 35,
    servings: 4,
    difficulty: "EASY",
    cuisine: "ITALIAN",
    category: "WORLD_RECIPES",
    mealCourse: "MAIN_COURSE",
    country: "ITALY",
    instructions:
      "1. Prepare the dough\n2. Add sauce and toppings\n3. Bake at 475°F for 12-15 minutes",
    published: true,
    featured: true,
    views: 1250,
    likes: 89,
    saves: 45,
    authorId: DEMO_USER.id,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "recipe-2",
    title: "Butter Chicken",
    slug: "butter-chicken",
    description:
      "Creamy and rich North Indian curry with tender chicken in tomato-butter sauce.",
    imageUrl:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800",
    prepTime: 30,
    cookTime: 40,
    totalTime: 70,
    servings: 6,
    difficulty: "MEDIUM",
    cuisine: "NORTH_INDIAN",
    category: "INDIAN_RECIPES",
    mealCourse: "DINNER",
    country: "INDIA",
    instructions:
      "1. Marinate chicken\n2. Cook in tandoor or oven\n3. Prepare sauce\n4. Combine and simmer",
    published: true,
    featured: true,
    views: 2100,
    likes: 156,
    saves: 78,
    authorId: DEMO_USER.id,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "recipe-3",
    title: "Chocolate Chip Cookies",
    slug: "chocolate-chip-cookies",
    description: "Soft and chewy cookies loaded with chocolate chips.",
    imageUrl:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800",
    prepTime: 15,
    cookTime: 12,
    totalTime: 27,
    servings: 24,
    difficulty: "EASY",
    cuisine: "AMERICAN",
    category: "COOKIE_BISCUIT_RECIPES",
    mealCourse: "SNACK",
    country: "UNITED_STATES",
    instructions:
      "1. Mix butter and sugars\n2. Add eggs and vanilla\n3. Mix in flour and chips\n4. Bake at 350°F for 10-12 minutes",
    published: true,
    featured: false,
    views: 890,
    likes: 67,
    saves: 34,
    authorId: DEMO_USER.id,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
];

export const DEMO_INGREDIENTS = {
  "recipe-1": [
    {
      id: "ing-1",
      name: "Pizza dough",
      amount: "1",
      unit: "ball",
      order: 1,
      recipeId: "recipe-1",
    },
    {
      id: "ing-2",
      name: "Tomato sauce",
      amount: "1",
      unit: "cup",
      order: 2,
      recipeId: "recipe-1",
    },
    {
      id: "ing-3",
      name: "Mozzarella cheese",
      amount: "8",
      unit: "oz",
      order: 3,
      recipeId: "recipe-1",
    },
    {
      id: "ing-4",
      name: "Fresh basil leaves",
      amount: "10",
      unit: "leaves",
      order: 4,
      recipeId: "recipe-1",
    },
  ],
  "recipe-2": [
    {
      id: "ing-5",
      name: "Chicken breast",
      amount: "2",
      unit: "lbs",
      order: 1,
      recipeId: "recipe-2",
    },
    {
      id: "ing-6",
      name: "Yogurt",
      amount: "1",
      unit: "cup",
      order: 2,
      recipeId: "recipe-2",
    },
    {
      id: "ing-7",
      name: "Butter",
      amount: "4",
      unit: "tbsp",
      order: 3,
      recipeId: "recipe-2",
    },
    {
      id: "ing-8",
      name: "Heavy cream",
      amount: "1",
      unit: "cup",
      order: 4,
      recipeId: "recipe-2",
    },
    {
      id: "ing-9",
      name: "Tomato puree",
      amount: "2",
      unit: "cups",
      order: 5,
      recipeId: "recipe-2",
    },
  ],
  "recipe-3": [
    {
      id: "ing-10",
      name: "Butter",
      amount: "1",
      unit: "cup",
      order: 1,
      recipeId: "recipe-3",
    },
    {
      id: "ing-11",
      name: "Brown sugar",
      amount: "1",
      unit: "cup",
      order: 2,
      recipeId: "recipe-3",
    },
    {
      id: "ing-12",
      name: "Eggs",
      amount: "2",
      unit: "large",
      order: 3,
      recipeId: "recipe-3",
    },
    {
      id: "ing-13",
      name: "Flour",
      amount: "2.5",
      unit: "cups",
      order: 4,
      recipeId: "recipe-3",
    },
    {
      id: "ing-14",
      name: "Chocolate chips",
      amount: "2",
      unit: "cups",
      order: 5,
      recipeId: "recipe-3",
    },
  ],
};

export const DEMO_NUTRITION = {
  "recipe-1": {
    id: "nutr-1",
    recipeId: "recipe-1",
    calories: 285,
    protein: 12,
    carbohydrates: 35,
    fat: 10,
    fiber: 2,
    sugar: 3,
    sodium: 590,
    cholesterol: 25,
    vitaminA: 450,
    vitaminC: 8,
    vitaminD: 0,
    vitaminB12: 0.5,
    iron: 2.5,
    calcium: 250,
    potassium: 180,
    allergens: JSON.stringify(["dairy", "gluten"]),
    dietaryFlags: JSON.stringify(["vegetarian"]),
  },
  "recipe-2": {
    id: "nutr-2",
    recipeId: "recipe-2",
    calories: 520,
    protein: 35,
    carbohydrates: 18,
    fat: 35,
    fiber: 3,
    sugar: 8,
    sodium: 780,
    cholesterol: 125,
    vitaminA: 850,
    vitaminC: 15,
    vitaminD: 0.8,
    vitaminB12: 1.2,
    iron: 3.5,
    calcium: 180,
    potassium: 650,
    allergens: JSON.stringify(["dairy"]),
    dietaryFlags: JSON.stringify(["gluten-free"]),
  },
  "recipe-3": {
    id: "nutr-3",
    recipeId: "recipe-3",
    calories: 180,
    protein: 2,
    carbohydrates: 24,
    fat: 9,
    fiber: 1,
    sugar: 14,
    sodium: 125,
    cholesterol: 20,
    vitaminA: 80,
    vitaminC: 0,
    vitaminD: 0.1,
    vitaminB12: 0.1,
    iron: 1.2,
    calcium: 15,
    potassium: 60,
    allergens: JSON.stringify(["dairy", "eggs", "gluten"]),
    dietaryFlags: JSON.stringify(["vegetarian"]),
  },
};

export const DEMO_CATEGORIES = [
  {
    id: "cat-1",
    name: "Italian",
    slug: "italian",
    description: "Italian cuisine recipes",
  },
  {
    id: "cat-2",
    name: "Indian",
    slug: "indian",
    description: "Indian cuisine recipes",
  },
  {
    id: "cat-3",
    name: "Desserts",
    slug: "desserts",
    description: "Sweet treats and desserts",
  },
];

// Helper to check if demo mode is active
export function isDemoMode(): boolean {
  return DEMO_MODE;
}

// Get demo user for authentication
export function getDemoUser() {
  return DEMO_USER;
}

// Get demo recipes
export function getDemoRecipes() {
  return DEMO_RECIPES.map((recipe) => ({
    ...recipe,
    author: DEMO_USER,
    ingredients:
      DEMO_INGREDIENTS[recipe.id as keyof typeof DEMO_INGREDIENTS] || [],
    nutritionInfo:
      DEMO_NUTRITION[recipe.id as keyof typeof DEMO_NUTRITION] || null,
    reviews: [],
    favorites: [],
    categories: [],
    _count: {
      favorites: recipe.saves,
      reviews: Math.floor(recipe.views / 50),
    },
  }));
}

// Get single demo recipe by slug
export function getDemoRecipe(slug: string) {
  const recipe = DEMO_RECIPES.find((r) => r.slug === slug);
  if (!recipe) return null;

  return {
    ...recipe,
    author: DEMO_USER,
    ingredients:
      DEMO_INGREDIENTS[recipe.id as keyof typeof DEMO_INGREDIENTS] || [],
    nutritionInfo:
      DEMO_NUTRITION[recipe.id as keyof typeof DEMO_NUTRITION] || null,
    reviews: [
      {
        id: "review-1",
        rating: 5,
        comment: "Amazing recipe! Made it for dinner and everyone loved it.",
        userId: DEMO_USER.id,
        user: { name: "Jane Smith", image: null },
        recipeId: recipe.id,
        createdAt: new Date("2024-03-15"),
      },
      {
        id: "review-2",
        rating: 4,
        comment: "Great taste, will make again!",
        userId: DEMO_USER.id,
        user: { name: "John Doe", image: null },
        recipeId: recipe.id,
        createdAt: new Date("2024-03-20"),
      },
    ],
    favorites: [],
    categories: [],
    comments: [],
    collections: [],
    _count: {
      favorites: recipe.saves,
      reviews: 2,
    },
  };
}
