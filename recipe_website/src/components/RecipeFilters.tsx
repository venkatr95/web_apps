"use client";

import { useLocale } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { FiFilter } from "react-icons/fi";
import Select from "./ui/Select";

interface RecipeFiltersProps {
  categories: Array<{ id: string; slug: string; name: string }>;
  cuisines: string[];
  difficulties: string[];
  translations: {
    filters: string;
    category: string;
    cuisine: string;
    difficulty: string;
    allCategories: string;
    allCuisines: string;
    allLevels: string;
  };
}

export default function RecipeFilters({
  categories,
  cuisines,
  difficulties,
  translations: t,
}: RecipeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/${locale}/recipes?${params.toString()}`);
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t.filters}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <Select
          label={t.category}
          value={searchParams.get("category") || ""}
          onChange={(e) => updateFilter("category", e.target.value)}
        >
          <option value="">{t.allCategories}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </Select>

        {/* Cuisine Filter */}
        <Select
          label={t.cuisine}
          value={searchParams.get("cuisine") || ""}
          onChange={(e) => updateFilter("cuisine", e.target.value)}
        >
          <option value="">{t.allCuisines}</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine} value={cuisine}>
              {cuisine}
            </option>
          ))}
        </Select>

        {/* Difficulty Filter */}
        <Select
          label={t.difficulty}
          value={searchParams.get("difficulty") || ""}
          onChange={(e) => updateFilter("difficulty", e.target.value)}
        >
          <option value="">{t.allLevels}</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
