import { Prisma } from "@prisma/client";

// Base Recipe DTO - matches database model
export interface RecipeDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cuisine: string;
  category: string;
  mealCourse: string;
  country: string;
  instructions: string;
  published: boolean;
  approved: boolean;
  featured: boolean;
  views: number;
  likes: number;
  saves: number;
  pageVisits: number;
  spiceLevel?: number | null;
  dietType?: string | null;
  complementRecipeIds: string[];
  mealTypeTimeRangeStart?: string | null;
  mealTypeTimeRangeEnd?: string | null;
  emotionTags: string[];
  origin?: string | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
}

// Recipe with Author DTO
export interface RecipeWithAuthorDTO extends RecipeDTO {
  author: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

// Recipe with Relations DTO - Full recipe data
export interface RecipeWithRelationsDTO extends RecipeWithAuthorDTO {
  ingredients: IngredientDTO[];
  categories: RecipeCategoryDTO[];
  reviews: ReviewDTO[];
  nutritionInfo: NutritionInfoDTO | null;
  comments: CommentDTO[];
  isFavorited?: boolean;
  reviewCount?: number;
  averageRating?: number;
}

// Ingredient DTO
export interface IngredientDTO {
  id: string;
  name: string;
  amount: string;
  unit: string;
  recipeId: string;
}

// Recipe Category DTO
export interface RecipeCategoryDTO {
  id: string;
  name: string;
  recipeId: string;
}

// Nutrition Info DTO
export interface NutritionInfoDTO {
  id: string;
  recipeId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  servingSize: string;
}

// Review DTO
export interface ReviewDTO {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  recipeId: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Comment DTO
export interface CommentDTO {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  recipeId: string;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

// Recipe Card DTO - Minimal data for lists/grids
export interface RecipeCardDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cuisine: string;
  views: number;
  likes: number;
  saves: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  averageRating?: number;
  reviewCount?: number;
  isFavorited?: boolean;
}

// Recipe Search Result DTO
export interface RecipeSearchResultDTO extends RecipeCardDTO {
  categories: string[];
  dietType?: string | null;
  spiceLevel?: number | null;
}

// Create Recipe DTO - Input for creating new recipe
export interface CreateRecipeDTO {
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  totalTime: number;
  servings: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  cuisine: string;
  category: string;
  mealCourse: string;
  country: string;
  instructions: string;
  categories: string[];
  ingredients: CreateIngredientDTO[];
  spiceLevel?: number;
  dietType?: string;
  emotionTags?: string[];
  origin?: string;
}

// Create Ingredient DTO
export interface CreateIngredientDTO {
  name: string;
  amount: string;
  unit: string;
}

// Update Recipe DTO - Input for updating recipe
export interface UpdateRecipeDTO {
  title?: string;
  description?: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  cuisine?: string;
  category?: string;
  mealCourse?: string;
  country?: string;
  instructions?: string;
  categories?: string[];
  ingredients?: CreateIngredientDTO[];
  published?: boolean;
  approved?: boolean;
  featured?: boolean;
  spiceLevel?: number;
  dietType?: string;
  emotionTags?: string[];
  origin?: string;
}

// Recipe Filter DTO
export interface RecipeFilterDTO {
  search?: string;
  cuisine?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  dietType?: string;
  mealCourse?: string;
  country?: string;
  categories?: string[];
  minPrepTime?: number;
  maxPrepTime?: number;
  minCookTime?: number;
  maxCookTime?: number;
  spiceLevel?: number;
  authorId?: string;
  featured?: boolean;
  published?: boolean;
}

// Recipe Pagination DTO
export interface RecipePaginationDTO {
  recipes: RecipeCardDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Recipe Stats DTO
export interface RecipeStatsDTO {
  totalRecipes: number;
  totalViews: number;
  totalLikes: number;
  totalSaves: number;
  averageRating: number;
  totalReviews: number;
  popularRecipes: RecipeCardDTO[];
  recentRecipes: RecipeCardDTO[];
}

// Shopping List Item DTO
export interface ShoppingListItemDTO {
  id: string;
  name: string;
  amount: string;
  unit: string;
  checked: boolean;
  recipeId?: string | null;
  recipe?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

// Collection DTO
export interface CollectionDTO {
  id: string;
  name: string;
  description: string | null;
  visibility: "PUBLIC" | "PRIVATE";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Collection with Recipes DTO
export interface CollectionWithRecipesDTO extends CollectionDTO {
  recipes: RecipeCardDTO[];
  recipeCount: number;
}

// Favorite DTO
export interface FavoriteDTO {
  id: string;
  userId: string;
  recipeId: string;
  createdAt: Date;
}

// Recipe recommendation DTO
export interface RecipeRecommendationDTO extends RecipeCardDTO {
  score: number;
  reason: string;
}

// Prisma type helpers
export type RecipeWithAuthor = Prisma.RecipeGetPayload<{
  include: { author: true };
}>;

export type RecipeWithIngredients = Prisma.RecipeGetPayload<{
  include: { ingredients: true };
}>;

export type RecipeWithAll = Prisma.RecipeGetPayload<{
  include: {
    author: true;
    ingredients: true;
    categories: true;
    reviews: { include: { user: true } };
    nutritionInfo: true;
    comments: { include: { user: true } };
  };
}>;
