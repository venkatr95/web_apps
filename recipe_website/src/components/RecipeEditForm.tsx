"use client";

import { CUISINES } from "@/lib/constants";
import type { CreateIngredientDTO, UpdateRecipeDTO } from "@/types/recipe.dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { FiPlus, FiX } from "react-icons/fi";
import { z } from "zod";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";

const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  amount: z.string().min(1, "Amount is required"),
  unit: z.string().optional(),
});

const recipeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  instructions: z
    .string()
    .min(50, "Instructions must be at least 50 characters"),
  prepTime: z.number().min(1, "Prep time must be at least 1 minute"),
  cookTime: z.number().min(1, "Cook time must be at least 1 minute"),
  servings: z.number().min(1, "Servings must be at least 1"),
  cuisine: z.string().optional(),
  difficulty: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "At least one ingredient is required"),
  categories: z.array(z.string()).optional(),
  category: z.string().min(2, "Category is required"),
  mealCourse: z.string().min(2, "Meal course is required"),
  country: z.string().min(2, "Country is required"),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeEditFormProps {
  recipe: {
    id: string;
    title: string;
    description: string;
    instructions: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    cuisine: string | null;
    difficulty: string | null;
    imageUrl: string | null;
    category?: string | null;
    mealCourse?: string | null;
    country?: string | null;
    slug: string;
    ingredients: Array<{
      id: string;
      name: string;
      amount: string;
      unit: string | null;
      order: number;
    }>;
    categories: Array<{
      category: {
        slug: string;
        name: string;
      };
    }>;
  };
}

export default function RecipeEditForm({ recipe }: RecipeEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function parseInstructions(text: string) {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((l) => l.length > 0)
      .map((instruction) => {
        const md = instruction.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
        const im = instruction.match(
          /image:\s*(https?:\/\/\S+|\/uploads\/\S+)/i
        );
        const url = md?.[1] || im?.[1] || "";
        const textOnly = instruction
          .replace(md?.[0] || "", "")
          .replace(im?.[0] || "", "")
          .trim();
        return { text: textOnly, imageUrl: url };
      });
  }

  function buildInstructions(
    steps: Array<{ text: string; imageUrl?: string }>
  ) {
    return steps
      .map(
        (s) =>
          `${s.text.trim()}${s.imageUrl ? ` image: ${s.imageUrl.trim()}` : ""}`
      )
      .join("\n");
  }

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      cuisine: recipe.cuisine || "",
      difficulty: recipe.difficulty || "",
      imageUrl: recipe.imageUrl || "",
      category: recipe.category || "",
      mealCourse: recipe.mealCourse || "",
      country: recipe.country || "",
      ingredients: recipe.ingredients.map((ing) => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit || "",
      })),
      categories: recipe.categories.map((c) => c.category.slug),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingredients",
  });

  const [steps, setSteps] = useState<
    Array<{ text: string; imageUrl?: string }>
  >(parseInstructions(recipe.instructions));

  useEffect(() => {
    const nextInstructions = buildInstructions(steps);
    setValue("instructions", nextInstructions, { shouldValidate: true });
  }, [steps, setValue]);

  const onSubmit = async (data: RecipeFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare UpdateRecipeDTO
      const updateRecipeDTO: UpdateRecipeDTO = {
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        prepTime: data.prepTime,
        cookTime: data.cookTime,
        servings: data.servings,
        cuisine: data.cuisine || undefined,
        difficulty:
          (data.difficulty as "EASY" | "MEDIUM" | "HARD") || undefined,
        imageUrl: data.imageUrl || undefined,
        category: data.category,
        mealCourse: data.mealCourse,
        country: data.country,
        ingredients: data.ingredients.map(
          (ing): CreateIngredientDTO => ({
            name: ing.name,
            amount: ing.amount,
            unit: ing.unit || "",
          })
        ),
        categories: data.categories,
      };

      const response = await fetch(`/api/recipes/${recipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateRecipeDTO),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update recipe");
      }

      const result = await response.json();
      const nextSlug =
        (result && (result.recipe?.slug || result.slug)) || recipe.slug;
      router.push(`/recipes/${nextSlug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Input
        label="Recipe Title"
        {...register("title")}
        error={errors.title?.message}
        placeholder="e.g., Classic Chocolate Chip Cookies"
      />

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          {...register("description")}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Brief description of the recipe..."
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Prep Time (minutes)"
          type="number"
          {...register("prepTime", { valueAsNumber: true })}
          error={errors.prepTime?.message}
          placeholder="15"
        />
        <Input
          label="Cook Time (minutes)"
          type="number"
          {...register("cookTime", { valueAsNumber: true })}
          error={errors.cookTime?.message}
          placeholder="30"
        />
        <Input
          label="Servings"
          type="number"
          {...register("servings", { valueAsNumber: true })}
          error={errors.servings?.message}
          placeholder="4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Cuisine" {...register("cuisine")}>
          <option value="">Select cuisine</option>
          {CUISINES.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </Select>

        <Select label="Difficulty" {...register("difficulty")}>
          <option value="">Select difficulty</option>
          {DIFFICULTIES.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Category"
          {...register("category")}
          error={errors.category?.message}
          placeholder="e.g., INDIAN_RECIPES"
        />
        <Input
          label="Meal Course"
          {...register("mealCourse")}
          error={errors.mealCourse?.message}
          placeholder="e.g., DINNER"
        />
        <Input
          label="Country"
          {...register("country")}
          error={errors.country?.message}
          placeholder="e.g., INDIA"
        />
      </div>

      <Input
        label="Image URL"
        type="url"
        {...register("imageUrl")}
        error={errors.imageUrl?.message}
        placeholder="https://example.com/image.jpg"
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Ingredients
          </label>
          <button
            type="button"
            onClick={() => append({ name: "", amount: "", unit: "" })}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <FiPlus className="h-4 w-4" />
            Add Ingredient
          </button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2"
            >
              <div className="sm:col-span-6">
                <input
                  {...register(`ingredients.${index}.name`)}
                  placeholder="Ingredient name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  {...register(`ingredients.${index}.amount`)}
                  placeholder="Amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  {...register(`ingredients.${index}.unit`)}
                  placeholder="Unit"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="sm:col-span-1 flex justify-end sm:justify-center">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {errors.ingredients && (
          <p className="text-sm text-red-600 mt-1">
            {errors.ingredients.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instructions (per step)
        </label>
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 p-4 space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-1">
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-primary-50 border border-gray-200">
                    {step.imageUrl ? (
                      <img
                        src={step.imageUrl}
                        alt={`Step ${idx + 1} image`}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <span className="text-sm">No photo</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      id={`step-file-${idx}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const prevUrl = steps[idx]?.imageUrl || "";
                        const fd = new FormData();
                        fd.append("file", file);
                        fetch("/api/uploads", { method: "POST", body: fd })
                          .then(async (res) => {
                            const data = await res.json();
                            if (res.ok && data.url) {
                              const doSet = (url: string) => {
                                const next = [...steps];
                                next[idx] = { ...next[idx], imageUrl: url };
                                setSteps(next);
                              };
                              if (prevUrl && prevUrl.startsWith("/uploads/")) {
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
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById(
                          `step-file-${idx}`
                        ) as HTMLInputElement | null;
                        input?.click();
                      }}
                      className="px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                      aria-label="Upload step image"
                    >
                      {step.imageUrl ? "Replace Photo" : "Upload Photo"}
                    </button>
                    {step.imageUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          const toDelete = steps[idx].imageUrl;
                          if (toDelete && toDelete.startsWith("/uploads/")) {
                            fetch("/api/uploads", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ path: toDelete }),
                            }).finally(() => {
                              const next = [...steps];
                              next[idx] = { ...next[idx], imageUrl: "" };
                              setSteps(next);
                            });
                          } else {
                            const next = [...steps];
                            next[idx] = { ...next[idx], imageUrl: "" };
                            setSteps(next);
                          }
                        }}
                        className="px-3 py-2 rounded-md border text-gray-700 hover:bg-gray-100"
                        aria-label="Remove step image"
                      >
                        Remove Photo
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="md:col-span-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">
                      Step {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = steps.filter((_, i) => i !== idx);
                        setSteps(next);
                      }}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                      aria-label="Delete step"
                      title="Delete step"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    value={step.text}
                    onChange={(e) => {
                      const next = [...steps];
                      next[idx] = { ...next[idx], text: e.target.value };
                      setSteps(next);
                    }}
                    rows={3}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe this step..."
                  />
                </div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSteps([...steps, { text: "", imageUrl: "" }])}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <FiPlus className="h-4 w-4" />
              Add Step
            </button>
          </div>
        </div>
        {errors.instructions && (
          <p className="text-sm text-red-600 mt-2">
            {errors.instructions.message}
          </p>
        )}
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Update Recipe"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push(`/recipes/${recipe.slug}`)}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
