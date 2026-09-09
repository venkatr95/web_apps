// Analytics integration with PostHog
// Install: npm install posthog-js

import posthog from "posthog-js";

// Initialize PostHog (call this in your root layout or _app)
export function initAnalytics() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") posthog.debug();
      },
    });
  }
}

// Track recipe view
export function trackRecipeView(
  recipeId: string,
  recipeTitle: string,
  category: string
) {
  if (typeof window !== "undefined") {
    posthog.capture("recipe_viewed", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      category: category,
    });
  }
}

// Track recipe favorite
export function trackRecipeFavorite(
  recipeId: string,
  recipeTitle: string,
  action: "add" | "remove"
) {
  if (typeof window !== "undefined") {
    posthog.capture("recipe_favorited", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      action: action,
    });
  }
}

// Track cook mode start
export function trackCookModeStart(recipeId: string, recipeTitle: string) {
  if (typeof window !== "undefined") {
    posthog.capture("cook_mode_started", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    });
  }
}

// Track YouTube link click
export function trackYouTubeClick(recipeId: string, recipeTitle: string) {
  if (typeof window !== "undefined") {
    posthog.capture("youtube_search_clicked", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    });
  }
}

// Track grocery order
export function trackGroceryOrder(
  recipeId: string,
  recipeTitle: string,
  platform: string
) {
  if (typeof window !== "undefined") {
    posthog.capture("grocery_order_clicked", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      platform: platform,
    });
  }
}

// Track Uber Eats restaurant search
export function trackUberEatsSearch(recipeId: string, recipeTitle: string) {
  if (typeof window !== "undefined") {
    posthog.capture("ubereats_search_clicked", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    });
  }
}

// Track PDF download
export function trackPDFDownload(recipeId: string, recipeTitle: string) {
  if (typeof window !== "undefined") {
    posthog.capture("pdf_downloaded", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    });
  }
}

// Track recipe share
export function trackRecipeShare(
  recipeId: string,
  recipeTitle: string,
  platform: string
) {
  if (typeof window !== "undefined") {
    posthog.capture("recipe_shared", {
      recipe_id: recipeId,
      recipe_title: recipeTitle,
      platform: platform,
    });
  }
}

// Track recipe suggestion click
export function trackSuggestionClick(
  fromRecipeId: string,
  toRecipeId: string,
  toRecipeTitle: string,
  position: number
) {
  if (typeof window !== "undefined") {
    posthog.capture("suggestion_clicked", {
      from_recipe_id: fromRecipeId,
      to_recipe_id: toRecipeId,
      to_recipe_title: toRecipeTitle,
      position: position,
    });
  }
}

// Track unit conversion toggle
export function trackUnitConversion(from: string, to: string) {
  if (typeof window !== "undefined") {
    posthog.capture("unit_conversion_toggled", {
      from_system: from,
      to_system: to,
    });
  }
}

// Track nutrition filter usage
export function trackNutritionFilter(filterType: string, filterValue: unknown) {
  if (typeof window !== "undefined") {
    posthog.capture("nutrition_filter_applied", {
      filter_type: filterType,
      filter_value: filterValue,
    });
  }
}

// Track search
export function trackSearch(query: string, resultsCount: number) {
  if (typeof window !== "undefined") {
    posthog.capture("search_performed", {
      query: query,
      results_count: resultsCount,
    });
  }
}

// Track filter usage
export function trackFilter(filterType: string, filterValue: unknown) {
  if (typeof window !== "undefined") {
    posthog.capture("filter_applied", {
      filter_type: filterType,
      filter_value: filterValue,
    });
  }
}

// Track collection creation
export function trackCollectionCreated(
  collectionId: string,
  collectionName: string
) {
  if (typeof window !== "undefined") {
    posthog.capture("collection_created", {
      collection_id: collectionId,
      collection_name: collectionName,
    });
  }
}

// Track shopping list creation
export function trackShoppingListCreated(listId: string, recipeCount: number) {
  if (typeof window !== "undefined") {
    posthog.capture("shopping_list_created", {
      list_id: listId,
      recipe_count: recipeCount,
    });
  }
}

// Track user signup
export function trackUserSignup(userId: string, method: "email" | "oauth") {
  if (typeof window !== "undefined") {
    posthog.capture("user_signed_up", {
      user_id: userId,
      signup_method: method,
    });
  }
}

// Identify user for cohort analysis
export function identifyUser(userId: string, email: string, name?: string) {
  if (typeof window !== "undefined") {
    posthog.identify(userId, {
      email: email,
      name: name,
    });
  }
}

// Reset user identification (on logout)
export function resetUser() {
  if (typeof window !== "undefined") {
    posthog.reset();
  }
}
