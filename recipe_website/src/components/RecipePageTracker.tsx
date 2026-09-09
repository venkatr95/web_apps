"use client";

import { useWizardState } from "@/lib/wizardState";
import { useEffect } from "react";

interface RecipePageTrackerProps {
  recipeSlug: string;
}

export default function RecipePageTracker({
  recipeSlug,
}: RecipePageTrackerProps) {
  const { trackRecipeVisit } = useWizardState();

  useEffect(() => {
    // Track this recipe visit for journey resume
    trackRecipeVisit(recipeSlug);
  }, [recipeSlug, trackRecipeVisit]);

  return null; // This component doesn't render anything
}
