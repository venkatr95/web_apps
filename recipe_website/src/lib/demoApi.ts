// API wrapper for demo mode
// Provides demo data when database is not available

import { NextResponse } from "next/server";
import { getDemoRecipe, getDemoRecipes, getDemoUser, isDemoMode } from "./demo";

export async function withDemoMode<T>(
  handler: () => Promise<T>,
  demoData: T
): Promise<T> {
  if (isDemoMode()) {
    return demoData;
  }

  try {
    return await handler();
  } catch (error) {
    console.warn("Database error, falling back to demo data:", error);
    return demoData;
  }
}

export function createDemoResponse(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(
    {
      ...data,
      _demoMode: isDemoMode(),
      _message: isDemoMode()
        ? "Running in demo mode - no database required"
        : undefined,
    },
    { status }
  );
}

// Demo API handlers
export const demoHandlers = {
  // Get all recipes
  async getRecipes(filters?: Record<string, unknown>) {
    const recipes = getDemoRecipes();

    // Apply simple filters
    let filtered = recipes;

    if (filters?.search && typeof filters.search === "string") {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search)
      );
    }

    if (filters?.cuisine) {
      filtered = filtered.filter((r) => r.cuisine === filters.cuisine);
    }

    if (filters?.difficulty) {
      filtered = filtered.filter((r) => r.difficulty === filters.difficulty);
    }

    return filtered;
  },

  // Get single recipe by slug
  async getRecipe(slug: string) {
    return getDemoRecipe(slug);
  },

  // Get current user
  async getCurrentUser(_sessionUserId?: string) {
    return getDemoUser();
  },

  // Check if recipe is favorited
  async isFavorited(_recipeId: string, _userId: string) {
    return false; // Demo mode: nothing favorited
  },

  // Get user favorites
  async getFavorites(_userId: string) {
    return []; // Demo mode: no favorites
  },

  // Get user collections
  async getCollections(_userId: string) {
    return []; // Demo mode: no collections
  },

  // Get user shopping lists
  async getShoppingLists(_userId: string) {
    return []; // Demo mode: no shopping lists
  },

  // Get notifications
  async getNotifications(userId: string) {
    return [
      {
        id: "notif-1",
        type: "info",
        content:
          "Welcome to demo mode! Sign up to save favorites and create collections.",
        read: false,
        link: "/auth/signin",
        createdAt: new Date(),
        userId: userId,
      },
    ];
  },

  // Demo mutations (return success but don't persist)
  async createFavorite(_recipeId: string, _userId: string) {
    return {
      id: "demo-favorite",
      recipeId: _recipeId,
      userId: _userId,
      createdAt: new Date(),
    };
  },

  async deleteFavorite(_recipeId: string, _userId: string) {
    return { success: true };
  },

  async createReview(data: Record<string, unknown>) {
    return {
      id: "demo-review",
      ...data,
      createdAt: new Date(),
      user: getDemoUser(),
    };
  },

  async createComment(data: Record<string, unknown>) {
    return {
      id: "demo-comment",
      ...data,
      createdAt: new Date(),
      user: getDemoUser(),
    };
  },

  async createCollection(data: Record<string, unknown>) {
    return {
      id: "demo-collection",
      ...data,
      userId: getDemoUser().id,
      createdAt: new Date(),
    };
  },

  async createShoppingList(data: Record<string, unknown>) {
    return {
      id: "demo-shopping-list",
      ...data,
      userId: getDemoUser().id,
      createdAt: new Date(),
    };
  },

  async followUser(_followerId: string, _followingId: string) {
    return {
      id: "demo-follow",
      followerId: _followerId,
      followingId: _followingId,
      createdAt: new Date(),
    };
  },

  async unfollowUser(_followerId: string, _followingId: string) {
    return { success: true };
  },
};
