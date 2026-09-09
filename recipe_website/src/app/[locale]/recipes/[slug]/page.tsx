import CommentSection from "@/components/CommentSection";
import PrintButton from "@/components/PrintButton";
import RecipePageTracker from "@/components/RecipePageTracker";
import ResumeJourneyButton from "@/components/ResumeJourneyButton";
import ServingsAdjuster from "@/components/ServingsAdjuster";
import ShareButtons from "@/components/ShareButtons";
import { authOptions } from "@/lib/auth";
import { getDemoRecipe, isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import {
  calculateAverageRating,
  formatDate,
  formatTime,
  getDifficultyColor,
} from "@/lib/utils";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiClock, FiEdit, FiImage, FiStar, FiUsers } from "react-icons/fi";
import SaveRecipeMenu from "@/components/SaveRecipeMenu";

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getRecipe(slug: string) {
  // Check if demo mode
  if (isDemoMode()) {
    return getDemoRecipe(slug);
  }

  try {
    const getCached = unstable_cache(
      async () =>
        prisma.recipe.findUnique({
          where: { slug, published: true },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            categories: {
              include: {
                category: true,
              },
            },
            ingredients: {
              orderBy: { order: "asc" },
            },
            reviews: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            comments: {
              where: { parentId: null },
              include: {
                user: { select: { name: true } },
                replies: {
                  include: {
                    user: { select: { name: true } },
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
            nutritionInfo: true,
          },
        }),
      ["recipe", slug],
      { revalidate: 60, tags: ["recipe:" + slug] }
    );
    const recipe = await getCached();

    if (recipe) {
      // Increment views and page visits without blocking render
      prisma.recipe
        .update({
          where: { id: recipe.id },
          data: {
            views: { increment: 1 },
            pageVisits: { increment: 1 },
          },
        })
        .catch(() => {});
    }

    return recipe;
  } catch (error) {
    console.error("Database error, falling back to demo mode:", error);
    return getDemoRecipe(slug);
  }
}

export async function generateMetadata({
  params,
}: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) {
    return {
      title: "Recipe Not Found",
    };
  }

  return {
    title: recipe.title,
    description: recipe.description,
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      images: [recipe.imageUrl],
      type: "article",
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const recipe = await getRecipe(slug);
  const session = await getServerSession(authOptions);

  if (!recipe) {
    notFound();
  }

  const isAuthor = session?.user?.id === recipe.authorId;
  const isAdmin = session?.user?.role === "ADMIN";
  const canEdit = isAuthor || isAdmin;
  const avgRating = calculateAverageRating(recipe.reviews);
  const instructions = recipe.instructions.split("\n").filter((i) => i.trim());
  const parsedInstructions = instructions.map((instruction) => {
    const md = instruction.match(/!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/i);
    const im = instruction.match(/image:\s*(https?:\/\/\S+|\/uploads\/\S+)/i);
    const url = md?.[1] || im?.[1] || null;
    const text = instruction
      .replace(md?.[0] || "", "")
      .replace(im?.[0] || "", "")
      .trim();
    return { text, imageUrl: url };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Track recipe visit for journey resume */}
      <RecipePageTracker recipeSlug={recipe.slug} />

      {/* Header Image */}
      <div className="relative h-[300px] sm:h-[400px] w-full">
        <Image
          src={recipe.imageUrl}
          alt={recipe.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        {/* Recipe Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link
                href="/"
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                Home
              </Link>
              <span>/</span>
              <Link
                href="/recipes"
                className="hover:text-primary-600 dark:hover:text-primary-400"
              >
                Recipes
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                {recipe.title}
              </span>
            </div>
            <ResumeJourneyButton />
          </div>

          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
                {recipe.title}
              </h1>
              {canEdit && (
                <Link
                  href={`/recipes/${recipe.slug}/edit`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors mb-4"
                >
                  <FiEdit className="h-4 w-4" />
                  Edit Recipe
                </Link>
              )}
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4">
                {recipe.description}
              </p>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                {recipe.categories.map(({ category }) => (
                  <Link
                    key={category.id}
                    href={`/recipes?category=${category.slug}`}
                    className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded-full hover:bg-primary-100 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(
                    recipe.difficulty
                  )}`}
                >
                  {recipe.difficulty}
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                  {recipe.cuisine}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <SaveRecipeMenu recipeId={recipe.id} recipeTitle={recipe.title} />
            </div>
          </div>

          {/* Recipe Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="flex flex-col items-center">
                <FiClock className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Prep Time
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(recipe.prepTime)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <FiClock className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Cook Time
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {formatTime(recipe.cookTime)}
              </p>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <FiUsers className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Servings
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {recipe.servings}
              </p>
            </div>
            <div className="text-center">
              <div className="flex flex-col items-center">
                <FiStar className="h-5 w-5 text-gray-600 dark:text-gray-400 mb-1" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Rating
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {avgRating > 0
                  ? `${avgRating} (${recipe.reviews.length})`
                  : "No ratings"}
              </p>
            </div>
          </div>

          {/* Author & Actions */}
          <div className="pt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <FiUsers className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recipe by
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {recipe.author.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ShareButtons
                url={`${
                  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                }/recipes/${recipe.slug}`}
                title={recipe.title}
                description={recipe.description}
                imageUrl={recipe.imageUrl}
              />
              <PrintButton />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-3">
            <div
              data-ad-slot="recipe-top"
              data-ad-network="google-ads"
              className="mb-6"
            >
              <div className="w-full h-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm">
                Ad Placeholder
              </div>
            </div>
          </div>
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 lg:sticky lg:top-4">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-4">
                Ingredients
              </h2>
              <ServingsAdjuster
                originalServings={recipe.servings || 1}
                ingredients={recipe.ingredients.map((i) => ({
                  id: i.id,
                  name: i.name,
                  amount: String(i.amount),
                  unit: i.unit,
                }))}
              />

              {/* Nutrition Info */}
              {recipe.nutritionInfo && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Nutrition (per serving)
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Calories
                      </span>
                      <span className="font-medium">
                        {recipe.nutritionInfo.calories} kcal
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Protein
                      </span>
                      <span className="font-medium dark:text-gray-200">
                        {recipe.nutritionInfo.protein}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Carbs
                      </span>
                      <span className="font-medium dark:text-gray-200">
                        {recipe.nutritionInfo.carbohydrates}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Fat
                      </span>
                      <span className="font-medium">
                        {recipe.nutritionInfo.fat}g
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div
                data-ad-slot="recipe-sidebar"
                data-ad-network="outbrain"
                className="mt-6"
              >
                <div className="w-full h-40 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center text-sm">
                  Ad Placeholder
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-6">
                Instructions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse md:table block">
                  <tbody className="md:table-row-group block space-y-4">
                    {parsedInstructions.map((step, index) => (
                      <tr
                        key={index}
                        className="md:table-row block rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <td className="md:table-cell block md:w-40 p-2 align-top">
                          {step.imageUrl ? (
                            <div className="relative md:w-40 md:h-40 w-full h-48 rounded-lg overflow-hidden">
                              <Image
                                src={step.imageUrl}
                                alt={`Step ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="md:w-40 md:h-40 w-full h-48 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center">
                              <FiImage className="w-6 h-6" />
                            </div>
                          )}
                        </td>
                        <td className="md:table-cell block p-2 align-top">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            Step {index + 1}
                          </div>
                          <div className="text-gray-700 dark:text-gray-300">
                            {step.text.replace(/^\d+\.\s*/, "")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100 mb-6">
                Reviews ({recipe.reviews.length})
              </h2>
              {recipe.reviews.length > 0 ? (
                <div className="space-y-6">
                  {recipe.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">
                            {review.user.name}
                          </p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <FiStar
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {review.comment}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No reviews yet. Be the first to review this recipe!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection
            recipeId={recipe.id}
            initialComments={recipe.comments}
          />
        </div>
      </div>
    </div>
  );
}
