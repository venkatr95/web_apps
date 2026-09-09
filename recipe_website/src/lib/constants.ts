export const APP_NAME = "RecipeHub";
export const APP_DESCRIPTION = "Discover & Share Amazing Recipes";

export const CUISINES = [
  "Italian",
  "Mexican",
  "Chinese",
  "Indian",
  "American",
  "French",
  "Japanese",
  "Thai",
  "Mediterranean",
  "Korean",
  "Greek",
  "Spanish",
] as const;

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

export const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Appetizers",
  "Snacks",
  "Beverages",
] as const;

export const DIETARY_TAGS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
  "Low-Carb",
  "High-Protein",
] as const;

export const ROUTES = {
  HOME: "/",
  RECIPES: "/recipes",
  CATEGORIES: "/categories",
  ABOUT: "/about",
  SIGNIN: "/auth/signin",
  SIGNUP: "/auth/signup",
  PROFILE: "/profile",
  MY_RECIPES: "/my-recipes",
  FAVORITES: "/favorites",
  NEW_RECIPE: "/recipes/new",
} as const;

export const ITEMS_PER_PAGE = 24;
export const FEATURED_RECIPES_COUNT = 6;
export const RELATED_RECIPES_COUNT = 4;
