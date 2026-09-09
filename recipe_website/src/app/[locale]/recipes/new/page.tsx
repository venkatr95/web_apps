"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { CUISINES, DIFFICULTIES } from "@/lib/constants";
import { recipeSchema, type RecipeInput } from "@/lib/validations";
import type { CreateIngredientDTO, CreateRecipeDTO } from "@/types/recipe.dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FiPlus, FiTrash2, FiUpload } from "react-icons/fi";

const CATEGORIES = [
  "INDIAN_RECIPES",
  "BABY_TODDLER_RECIPES",
  "WORLD_RECIPES",
  "DRINK_RECIPES",
  "DESSERT_RECIPES",
  "BASIC_ADVANCED_COOKING",
  "COOKIE_BISCUIT_RECIPES",
  "CAKE_RECIPES",
  "SNACK_RECIPES",
];

const MEAL_COURSES = [
  "APPETIZER",
  "DESSERT",
  "ONE_POT_DISH",
  "SOUTH_INDIAN_BREAKFAST",
  "SIDE_DISH",
  "LUNCH",
  "MAIN_COURSE",
  "WORLD_BREAKFAST",
  "BRUNCH",
  "NORTH_INDIAN_BREAKFAST",
  "INDIAN_BREAKFAST",
  "SNACK",
  "DINNER",
];

const COUNTRIES = [
  "INDIA",
  "ITALY",
  "CHINA",
  "MEXICO",
  "FRANCE",
  "THAILAND",
  "SRI_LANKA",
  "JAPAN",
  "GREECE",
  "NEPAL",
  "KOREA",
  "MYANMAR",
  "VIETNAM",
  "MALAYSIA",
  "UNITED_STATES",
  "SINGAPORE",
  "AFGHANISTAN",
  "BANGLADESH",
  "UNITED_KINGDOM",
  "PAKISTAN",
  "INDONESIA",
  "SWEDEN",
  "OTHER",
];

const UNITS = [
  "cups",
  "tbsp",
  "tsp",
  "oz",
  "lb",
  "g",
  "kg",
  "ml",
  "l",
  "piece",
  "pieces",
  "pinch",
  "handful",
  "clove",
  "cloves",
  "slice",
  "slices",
  "to taste",
  "as needed",
];

export default function NewRecipePage() {
  const router = useRouter();
  const session = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [steps, setSteps] = useState<
    Array<{ text: string; imageUrl?: string }>
  >(Array.from({ length: 7 }, () => ({ text: "", imageUrl: "" })));

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RecipeInput>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [{ name: "", amount: "", unit: "" }],
      categories: [],
      difficulty: "EASY",
    },
  });

  function buildInstructions(
    s: Array<{ text: string; imageUrl?: string }>
  ): string {
    return s
      .filter(
        (step) =>
          step.text.trim().length > 0 || (step.imageUrl || "").trim().length > 0
      )
      .map(
        (step) =>
          `${step.text.trim()}${
            step.imageUrl ? ` image: ${step.imageUrl.trim()}` : ""
          }`
      )
      .join("\n");
  }

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  // Handle mounting and authentication
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && session?.status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [isMounted, session?.status, router]);

  // Show loading during SSR or authentication check
  if (!isMounted || !session || session.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fetch("/api/uploads", { method: "POST", body: fd })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.url) {
          setImagePreview(data.url);
          setValue("imageUrl", data.url, { shouldValidate: true });
        }
      })
      .catch(() => {});
  };

  const handleStepChange = (index: number, value: string) => {
    const next = [...steps];
    next[index] = { ...next[index], text: value };
    setSteps(next);
    const joined = buildInstructions(next);
    setValue("instructions", joined, { shouldValidate: true });
  };

  const removeMainImage = () => {
    const toDelete = imagePreview;
    const clear = () => {
      setImagePreview("");
      setValue("imageUrl", "", { shouldValidate: true });
    };
    if (toDelete && toDelete.startsWith("/uploads/")) {
      fetch("/api/uploads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: toDelete }),
      })
        .catch(() => {})
        .finally(clear);
    } else {
      clear();
    }
  };

  const onSubmit = async (data: RecipeInput) => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Form data:", data); // Debug log

      const imageUrl = data.imageUrl;

      // Prepare DTO for API
      const createRecipeDTO: CreateRecipeDTO = {
        title: data.title,
        description: data.description,
        imageUrl: imageUrl || "",
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        difficulty: data.difficulty,
        cuisine: data.cuisine,
        category: data.category,
        mealCourse: data.mealCourse,
        country: data.country,
        instructions: data.instructions,
        categories: data.categories,
        ingredients: data.ingredients.map(
          (ing): CreateIngredientDTO => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit,
          })
        ),
        totalTime: data.prepTime + data.cookTime,
      };

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createRecipeDTO),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to create recipe");
        return;
      }

      router.push(`/recipes/${result.recipe.slug}`);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto container-padding">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
            Create New Recipe
          </h1>
          <p className="text-gray-600">
            Share your culinary creation with the community
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Validation Errors Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm font-semibold text-yellow-800 mb-2">
                  Please fix the following errors:
                </p>
                <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>
                      {field}: {error?.message?.toString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6 mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900">
                Basic Information
              </h2>

              <Input
                label="Recipe Title"
                placeholder="e.g., Classic Chocolate Chip Cookies"
                error={errors.title?.message}
                {...register("title")}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                  placeholder="Brief description of your recipe..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Select
                  label="Cuisine"
                  error={errors.cuisine?.message}
                  {...register("cuisine")}
                >
                  <option value="">Select cuisine</option>
                  {CUISINES.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </Select>

                <Select label="Difficulty" {...register("difficulty")}>
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {diff}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Select
                  label="Category"
                  error={errors.category?.message}
                  {...register("category")}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Meal Course"
                  error={errors.mealCourse?.message}
                  {...register("mealCourse")}
                >
                  <option value="">Select meal course</option>
                  {MEAL_COURSES.map((meal) => (
                    <option key={meal} value={meal}>
                      {meal.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>

                <Select
                  label="Country"
                  error={errors.country?.message}
                  {...register("country")}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="Prep Time (minutes)"
                  type="number"
                  min="1"
                  error={errors.prepTime?.message}
                  {...register("prepTime", { valueAsNumber: true })}
                />

                <Input
                  label="Cook Time (minutes)"
                  type="number"
                  min="1"
                  error={errors.cookTime?.message}
                  {...register("cookTime", { valueAsNumber: true })}
                />

                <Input
                  label="Servings"
                  type="number"
                  min="1"
                  error={errors.servings?.message}
                  {...register("servings", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Recipe Image
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                      <FiUpload className="h-5 w-5" />
                      <span className="text-sm font-medium">Upload Image</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  <span className="text-sm text-gray-500">or</span>

                  <Input
                    placeholder="Enter image URL"
                    className="flex-1"
                    error={errors.imageUrl?.message}
                    {...register("imageUrl")}
                  />
                  {imagePreview ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeMainImage}
                    >
                      Remove Image
                    </Button>
                  ) : null}
                </div>

                {(imagePreview || errors.imageUrl) && (
                  <div>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-md h-64 object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  Ingredients
                </h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    appendIngredient({ name: "", amount: "", unit: "" })
                  }
                >
                  <FiPlus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-3">
                {ingredientFields.map((field, index) => (
                  <div key={field.id} className="flex gap-3 items-start">
                    <div className="flex-1 grid md:grid-cols-3 gap-3">
                      <input
                        placeholder="Ingredient name"
                        className="h-11 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600"
                        {...register(`ingredients.${index}.name`)}
                      />
                      <input
                        placeholder="Amount"
                        className="h-11 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600"
                        {...register(`ingredients.${index}.amount`)}
                      />
                      <select
                        className="h-11 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600 bg-white"
                        {...register(`ingredients.${index}.unit`)}
                      >
                        <option value="">Select unit</option>
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                    {ingredientFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <FiTrash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.ingredients && (
                <p className="mt-2 text-sm text-red-600">
                  Please add at least one complete ingredient
                </p>
              )}
            </div>

            {/* Instructions */}
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Instructions
              </h2>
              <div className="space-y-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-1 flex flex-col items-start gap-2">
                        <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-primary-50 border border-gray-200">
                          {step.imageUrl ? (
                            <img
                              src={step.imageUrl}
                              alt={`Step ${idx + 1}`}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-primary-600">
                              <FiUpload className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            id={`new-step-file-${idx}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const prevUrl = steps[idx]?.imageUrl || "";
                              const fd = new FormData();
                              fd.append("file", file);
                              fetch("/api/uploads", {
                                method: "POST",
                                body: fd,
                              })
                                .then(async (res) => {
                                  const data = await res.json();
                                  if (res.ok && data.url) {
                                    const doSet = (url: string) => {
                                      const next = [...steps];
                                      next[idx] = {
                                        ...next[idx],
                                        imageUrl: url,
                                      };
                                      setSteps(next);
                                      const joined = buildInstructions(next);
                                      setValue("instructions", joined, {
                                        shouldValidate: true,
                                      });
                                    };
                                    if (
                                      prevUrl &&
                                      prevUrl.startsWith("/uploads/")
                                    ) {
                                      fetch("/api/uploads", {
                                        method: "DELETE",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ path: prevUrl }),
                                      })
                                        .catch(() => {})
                                        .finally(() => doSet(data.url));
                                    } else {
                                      doSet(data.url);
                                    }
                                  }
                                })
                                .catch(() => {});
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              const input = document.getElementById(
                                `new-step-file-${idx}`
                              ) as HTMLInputElement | null;
                              input?.click();
                            }}
                          >
                            {step.imageUrl ? "Replace Photo" : "Upload Photo"}
                          </Button>
                          {step.imageUrl ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                const toDelete = steps[idx].imageUrl;
                                const clear = () => {
                                  const next = [...steps];
                                  next[idx] = { ...next[idx], imageUrl: "" };
                                  setSteps(next);
                                  const joined = buildInstructions(next);
                                  setValue("instructions", joined, {
                                    shouldValidate: true,
                                  });
                                };
                                if (
                                  toDelete &&
                                  toDelete.startsWith("/uploads/")
                                ) {
                                  fetch("/api/uploads", {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ path: toDelete }),
                                  })
                                    .catch(() => {})
                                    .finally(clear);
                                } else {
                                  clear();
                                }
                              }}
                            >
                              Remove Photo
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Step {idx + 1}
                        </label>
                        <textarea
                          rows={3}
                          value={step.text}
                          onChange={(e) =>
                            handleStepChange(idx, e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                          placeholder="Describe this step..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <input type="hidden" {...register("instructions")} />
                {errors.instructions && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.instructions.message}
                  </p>
                )}
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Categories
              </h2>
              <p className="text-sm text-gray-600 mb-3">
                Select at least one category for your recipe
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "breakfast",
                  "lunch",
                  "dinner",
                  "dessert",
                  "appetizers",
                  "snacks",
                  "beverages",
                ].map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={cat}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                      {...register("categories")}
                    />
                    <span className="text-sm capitalize">{cat}</span>
                  </label>
                ))}
              </div>
              {errors.categories && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.categories.message}
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
              >
                Create Recipe
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
