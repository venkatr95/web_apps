"use client";

import { useCallback, useEffect, useState } from "react";

export interface WizardStateData {
  currentStep: number;
  dishPrompt: string;
  selectedIngredients: string[];
  filters: {
    dietType: string;
    spiceLevel: string;
    calorieRange: number[];
    mealCourse: string;
    prepTime: number;
  };
  // Journey tracking
  journeyStarted?: boolean;
  lastRecipeVisited?: string;
  journeyTimestamp?: number;
  searchResults?: string[];
  userPreferences?: {
    timeOfDay?: string;
    emotionTag?: string;
  };
}

const WIZARD_STATE_KEY = "recipe_wizard_state";

const defaultState: WizardStateData = {
  currentStep: 1,
  dishPrompt: "",
  selectedIngredients: [],
  filters: {
    dietType: "",
    spiceLevel: "",
    calorieRange: [0, 2000],
    mealCourse: "",
    prepTime: 120,
  },
  journeyStarted: false,
  journeyTimestamp: undefined,
  lastRecipeVisited: undefined,
  searchResults: [],
  userPreferences: {},
};

export function useWizardState() {
  const [wizardState, setWizardStateInternal] =
    useState<WizardStateData>(defaultState);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(WIZARD_STATE_KEY);
      if (saved) {
        try {
          setWizardStateInternal(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to parse wizard state:", error);
        }
      }
    }
  }, []);

  const updateWizardState = useCallback(
    (newState: Partial<WizardStateData>) => {
      setWizardStateInternal((prev) => {
        const updated = { ...prev, ...newState };
        if (typeof window !== "undefined") {
          localStorage.setItem(WIZARD_STATE_KEY, JSON.stringify(updated));
        }
        return updated;
      });
    },
    []
  );

  const clearWizardState = useCallback(() => {
    setWizardStateInternal(defaultState);
    if (typeof window !== "undefined") {
      localStorage.removeItem(WIZARD_STATE_KEY);
    }
  }, []);

  const hasActiveJourney = useCallback(() => {
    return !!(
      wizardState.journeyStarted &&
      (wizardState.dishPrompt ||
        wizardState.selectedIngredients.length > 0 ||
        wizardState.lastRecipeVisited)
    );
  }, [wizardState]);

  const trackRecipeVisit = useCallback(
    (recipeSlug: string) => {
      updateWizardState({
        lastRecipeVisited: recipeSlug,
        journeyTimestamp: Date.now(),
      });
    },
    [updateWizardState]
  );

  const startJourney = useCallback(() => {
    updateWizardState({
      journeyStarted: true,
      journeyTimestamp: Date.now(),
    });
  }, [updateWizardState]);

  return {
    wizardState,
    updateWizardState,
    clearWizardState,
    hasActiveJourney,
    trackRecipeVisit,
    startJourney,
  };
}
