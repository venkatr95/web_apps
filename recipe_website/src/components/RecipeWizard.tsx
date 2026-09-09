"use client";

import {
  getIngredientSuggestions,
  getMealCourseByTime,
  parseEmotionTags,
} from "@/lib/journeyHelpers";
import { useWizardState } from "@/lib/wizardState";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiChevronRight,
  FiPlus,
  FiSearch,
  FiSliders,
  FiX,
} from "react-icons/fi";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";

interface RecipeWizardProps {
  onClose?: () => void;
  className?: string;
}

export default function RecipeWizard({
  onClose,
  className = "",
}: RecipeWizardProps) {
  const t = useTranslations("recipeWizard");
  const tc = useTranslations("common");
  const router = useRouter();
  const { wizardState, updateWizardState, clearWizardState, startJourney } =
    useWizardState();

  const [step, setStep] = useState(wizardState.currentStep || 1);
  const [dishPrompt, setDishPrompt] = useState(wizardState.dishPrompt || "");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    wizardState.selectedIngredients || []
  );
  const [filters, setFilters] = useState(
    wizardState.filters || {
      dietType: "",
      spiceLevel: "",
      calorieRange: [0, 2000],
      mealCourse: "",
      prepTime: 120,
    }
  );
  const [ingredientInput, setIngredientInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestedIngredients, setSuggestedIngredients] = useState<string[]>(
    []
  );
  const [autocompleteResults, setAutocompleteResults] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  // Check if wizard should open automatically (from resume journey)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("wizard") === "open") {
        // Wizard will stay open with restored state
      }
    }
  }, []);

  // Update ingredient suggestions when selected ingredients change
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      const suggestions = getIngredientSuggestions(selectedIngredients);
      setSuggestedIngredients(suggestions);
    } else {
      setSuggestedIngredients([]);
    }
  }, [selectedIngredients]);

  // Save state to storage whenever it changes
  useEffect(() => {
    updateWizardState({
      currentStep: step,
      dishPrompt,
      selectedIngredients,
      filters,
    });
  }, [step, dishPrompt, selectedIngredients, filters, updateWizardState]);

  const handleDishSearch = async () => {
    if (!dishPrompt.trim()) return;

    setIsSearching(true);
    startJourney(); // Mark journey as started

    // Parse emotion tags from prompt
    const emotionTags = parseEmotionTags(dishPrompt);
    const timeBasedMealCourse = getMealCourseByTime();

    // Update wizard state with parsed info
    updateWizardState({
      userPreferences: {
        emotionTag: emotionTags[0] || "any",
        timeOfDay: timeBasedMealCourse,
      },
    });

    try {
      // Check if it's a direct recipe name search
      const response = await fetch(
        `/api/recipes/search?q=${encodeURIComponent(dishPrompt)}&type=semantic`
      );
      const data = await response.json();

      if (data.recipes && data.recipes.length > 0) {
        // Save search results for journey tracking
        updateWizardState({
          searchResults: data.recipes.map((r: { slug: string }) => r.slug),
        });

        // Navigate to first matching recipe or results page
        if (data.recipes.length === 1) {
          router.push(`/recipes/${data.recipes[0].slug}`);
        } else {
          router.push(`/recipes?q=${encodeURIComponent(dishPrompt)}`);
        }
      } else {
        // No exact match, show ingredient selection
        setStep(2);
      }
    } catch (error) {
      console.error("Search error:", error);
      setStep(2); // Fallback to ingredient selection
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch autocomplete suggestions
  useEffect(() => {
    const fetchAutocomplete = async () => {
      if (ingredientInput.trim().length < 2) {
        setAutocompleteResults([]);
        setShowAutocomplete(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/ingredients?q=${encodeURIComponent(ingredientInput)}&limit=10`
        );
        const data = await response.json();
        setAutocompleteResults(data.ingredients || []);
        setShowAutocomplete(true);
      } catch (error) {
        console.error("Autocomplete error:", error);
      }
    };

    const debounce = setTimeout(fetchAutocomplete, 300);
    return () => clearTimeout(debounce);
  }, [ingredientInput]);

  const addIngredient = (ingredientName?: string) => {
    const name = ingredientName || ingredientInput.trim();
    if (name && !selectedIngredients.includes(name)) {
      setSelectedIngredients([...selectedIngredients, name]);
      setIngredientInput("");
      setShowAutocomplete(false);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== ingredient));
  };

  const handleFilterSearch = async () => {
    setIsSearching(true);

    try {
      // Save new ingredients to database
      if (selectedIngredients.length > 0) {
        await fetch("/api/ingredients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredients: selectedIngredients }),
        });
      }

      const params = new URLSearchParams();

      if (selectedIngredients.length > 0) {
        params.set("ingredients", selectedIngredients.join(","));
      }
      if (filters.dietType) params.set("dietType", filters.dietType);
      if (filters.spiceLevel) params.set("spiceLevel", filters.spiceLevel);
      if (filters.mealCourse) params.set("mealCourse", filters.mealCourse);
      if (filters.prepTime)
        params.set("maxPrepTime", filters.prepTime.toString());

      router.push(`/recipes?${params.toString()}`);
    } catch (error) {
      console.error("Filter search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const resetWizard = () => {
    setStep(1);
    setDishPrompt("");
    setSelectedIngredients([]);
    setFilters({
      dietType: "",
      spiceLevel: "",
      calorieRange: [0, 2000],
      mealCourse: "",
      prepTime: 120,
    });
    clearWizardState();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 md:p-8 ${className}`}>
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      )}

      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8 gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            step === 1 ? "bg-primary-600" : "bg-gray-300"
          }`}
        />
        <div
          className={`w-3 h-3 rounded-full ${
            step === 2 ? "bg-primary-600" : "bg-gray-300"
          }`}
        />
      </div>

      {/* Step 1: Initial Question */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-3">
              {t("step1.title")}
            </h2>
            <p className="text-gray-600">{t("step1.description")}</p>
          </div>

          <div className="flex gap-3">
            <Input
              type="text"
              placeholder={t("promptPlaceholder")}
              value={dishPrompt}
              onChange={(e) => setDishPrompt(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleDishSearch()}
              className="flex-1"
            />
            <Button
              onClick={handleDishSearch}
              disabled={!dishPrompt.trim() || isSearching}
              size="lg"
            >
              <FiSearch className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">{t("notSure")}</p>
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="w-full sm:w-auto"
            >
              {t("tellIngredients")}
              <FiChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {wizardState.currentStep > 1 && (
            <div className="text-center">
              <button
                onClick={resetWizard}
                className="text-sm text-primary-600 hover:text-primary-700 underline"
              >
                {t("startOver")}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Ingredient & Filter Selection */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-3">
              {t("step2.title")}
            </h2>
            <p className="text-gray-600">{t("subtitle")}</p>
          </div>

          {/* Ingredient Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("ingredientsLabel")}
            </label>
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder={t("step1.placeholder")}
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                  onFocus={() =>
                    ingredientInput.length >= 2 && setShowAutocomplete(true)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowAutocomplete(false), 200)
                  }
                  className="flex-1"
                />

                {/* Autocomplete Dropdown */}
                {showAutocomplete && autocompleteResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto backdrop-blur-xl">
                    {autocompleteResults.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() => addIngredient(ingredient.name)}
                        className="w-full px-4 py-2.5 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors text-gray-900 dark:text-gray-100"
                      >
                        {ingredient.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => addIngredient()} variant="outline">
                {tc("add")}
              </Button>
            </div>

            {/* Selected Ingredients */}
            {selectedIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedIngredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="hover:text-primary-900"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Suggested Ingredients */}
            {suggestedIngredients.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  {t("suggestedIngredients")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedIngredients.map((ingredient) => (
                    <button
                      key={ingredient}
                      onClick={() => {
                        if (!selectedIngredients.includes(ingredient)) {
                          setSelectedIngredients([
                            ...selectedIngredients,
                            ingredient,
                          ]);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-full text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      <FiPlus className="w-3 h-3" />
                      {ingredient}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <FiSliders className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t("filtersTitle")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Diet Type */}
              <Select
                label={t("dietType")}
                value={filters.dietType}
                onChange={(e) =>
                  setFilters({ ...filters, dietType: e.target.value })
                }
                options={[
                  { value: "", label: t("any") },
                  { value: "VEGETARIAN", label: t("step3.vegetarian") },
                  { value: "VEGAN", label: t("step3.vegan") },
                  { value: "NON_VEGETARIAN", label: "Non-Vegetarian" },
                  { value: "EGGETARIAN", label: "Eggetarian" },
                  { value: "PESCATARIAN", label: "Pescatarian" },
                  { value: "GLUTEN_FREE", label: t("step3.glutenFree") },
                  { value: "KETO", label: "Keto" },
                ]}
              />

              {/* Meal Course */}
              <Select
                label={t("mealType")}
                value={filters.mealCourse}
                onChange={(e) =>
                  setFilters({ ...filters, mealCourse: e.target.value })
                }
                options={[
                  { value: "", label: t("any") },
                  { value: "INDIAN_BREAKFAST", label: t("step2.breakfast") },
                  { value: "LUNCH", label: t("step2.lunch") },
                  { value: "DINNER", label: t("step2.dinner") },
                  { value: "DESSERT", label: t("step2.dessert") },
                  { value: "SNACK", label: t("step2.snack") },
                  { value: "APPETIZER", label: "Appetizer" },
                ]}
              />

              {/* Spice Level */}
              <Select
                label={t("spiceLevel")}
                value={filters.spiceLevel}
                onChange={(e) =>
                  setFilters({ ...filters, spiceLevel: e.target.value })
                }
                options={[
                  { value: "", label: t("any") },
                  { value: "1", label: t("spice.mild") },
                  { value: "2", label: t("spice.moderate") },
                  { value: "3", label: t("spice.mediumSpicy") },
                  { value: "4", label: t("spice.hot") },
                  { value: "5", label: t("spice.veryHot") },
                ]}
              />

              {/* Prep Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("maxPrepTime")}: {filters.prepTime} min
                </label>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={filters.prepTime}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      prepTime: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              {tc("back")}
            </Button>
            <Button
              onClick={handleFilterSearch}
              disabled={isSearching}
              className="flex-1"
            >
              {isSearching ? tc("loading") : t("findRecipes")}
              <FiChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
