import RecipeCard from "@/components/RecipeCard";
import RecipeFilters from "@/components/RecipeFilters";
import RecipePagination from "@/components/RecipePagination";
import { DEMO_CATEGORIES, getDemoRecipes, isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { unstable_cache } from "next/cache";

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: t("recipes.title"),
    description: t("recipes.search"),
  };
}

export const revalidate = 600; // ISR: Revalidate every 10 minutes

interface SearchParams {
  category?: string;
  cuisine?: string;
  difficulty?: string;
  search?: string;
  page?: string;
  limit?: string;
}

async function getRecipes(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || "1");
  const limit = parseInt(searchParams.limit || "9");
  const skip = (page - 1) * limit;

  if (isDemoMode()) {
    let recipes = getDemoRecipes();

    // Apply filters to demo recipes
    if (searchParams.search) {
      const query = searchParams.search.toLowerCase();
      recipes = recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    if (searchParams.cuisine) {
      const cuisineUpper = searchParams.cuisine
        .toUpperCase()
        .replace(/\s+/g, "_");
      recipes = recipes.filter((r) => r.cuisine === cuisineUpper);
    }

    if (searchParams.difficulty) {
      const difficulty = searchParams.difficulty.toUpperCase();
      recipes = recipes.filter((r) => r.difficulty === difficulty);
    }

    const total = recipes.length;
    const paginatedRecipes = recipes.slice(skip, skip + limit);

    return { recipes: paginatedRecipes, total };
  }

  try {
    const where: Record<string, unknown> = {
      published: true,
      approved: true,
    };

    if (searchParams.search) {
      where.OR = [
        { title: { contains: searchParams.search, mode: "insensitive" } },
        { description: { contains: searchParams.search, mode: "insensitive" } },
      ];
    }

    if (searchParams.cuisine) {
      where.cuisine = searchParams.cuisine.toUpperCase().replace(/\s+/g, "_");
    }

    if (searchParams.difficulty) {
      where.difficulty = searchParams.difficulty.toUpperCase();
    }

    if (searchParams.category) {
      where.categories = {
        some: {
          category: {
            slug: searchParams.category,
          },
        },
      };
    }

    const getCachedList = unstable_cache(
      async () => {
        const [recipes, total] = await Promise.all([
          prisma.recipe.findMany({
            where,
            include: {
              author: { select: { name: true } },
              reviews: { select: { rating: true } },
              categories: {
                include: { category: true },
              },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          prisma.recipe.count({ where }),
        ]);
        return { recipes, total };
      },
      ["recipes:list", JSON.stringify(where), String(page), String(limit)],
      { revalidate: 60, tags: ["recipes:list"] }
    );
    const { recipes, total } = await getCachedList();

    return { recipes, total };
  } catch (error) {
    console.warn("Database error, using demo data:", error);
    let demoRecipes = getDemoRecipes();

    // Apply filters to demo recipes when database fails
    if (searchParams.search) {
      const query = searchParams.search.toLowerCase();
      demoRecipes = demoRecipes.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
      );
    }

    if (searchParams.cuisine) {
      const cuisineUpper = searchParams.cuisine
        .toUpperCase()
        .replace(/\s+/g, "_");
      demoRecipes = demoRecipes.filter((r) => r.cuisine === cuisineUpper);
    }

    if (searchParams.difficulty) {
      const difficulty = searchParams.difficulty.toUpperCase();
      demoRecipes = demoRecipes.filter((r) => r.difficulty === difficulty);
    }

    if (searchParams.category) {
      // Demo recipes might not have category relations, skip this filter for demo
    }

    const total = demoRecipes.length;
    const paginatedRecipes = demoRecipes.slice(skip, skip + limit);

    return {
      recipes: paginatedRecipes,
      total,
    };
  }
}

async function getCategories() {
  if (isDemoMode()) {
    return DEMO_CATEGORIES;
  }

  try {
    return await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Database error, using demo data:", error);
    return DEMO_CATEGORIES;
  }
}

export default async function RecipesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const resolvedSearchParams = await searchParams;

  const page = parseInt(resolvedSearchParams.page || "1");
  const limit = parseInt(resolvedSearchParams.limit || "9");

  const [{ recipes, total }, categories] = await Promise.all([
    getRecipes(resolvedSearchParams),
    getCategories(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, total);

  const cuisines = [
    "Italian",
    "Mexican",
    "Chinese",
    "Indian",
    "French",
    "Thai",
    "Continental",
    "North Indian",
    "South Indian",
  ];
  const difficulties = ["Easy", "Medium", "Hard"];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("recipes.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            {t("recipes.search")}
          </p>
        </div>

        {/* Filters */}
        <div
          data-ad-slot="recipes-top"
          data-ad-network="taboola"
          className="mb-6"
        >
          <div className="w-full h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm">
            Ad Placeholder
          </div>
        </div>
        <RecipeFilters
          categories={categories}
          cuisines={cuisines}
          difficulties={difficulties}
          translations={{
            filters: t("recipes.filters"),
            category: t("recipes.category"),
            cuisine: t("recipes.cuisine"),
            difficulty: t("recipes.difficulty"),
            allCategories: "All Categories",
            allCuisines: "All Cuisines",
            allLevels: "All Levels",
          }}
        />

        {/* Recipe Grid */}
        {recipes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {/* Pagination */}
            <RecipePagination
              currentPage={page}
              totalPages={totalPages}
              totalRecipes={total}
              itemsPerPage={limit}
              startIndex={startIndex}
              endIndex={endIndex}
            />
            <div
              data-ad-slot="recipes-bottom"
              data-ad-network="outbrain"
              className="mt-8"
            >
              <div className="w-full h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm">
                Ad Placeholder
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t("recipes.noRecipes")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
