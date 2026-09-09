import RecipeCard from "@/components/RecipeCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function generateMetadata() {
  const t = await getTranslations();
  return {
    title: t("profile.myFavorites"),
  };
}

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      recipe: {
        include: {
          author: { select: { name: true } },
          reviews: { select: { rating: true } },
          categories: { include: { category: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
            {t("profile.myFavorites")}
          </h1>
          <p className="text-gray-600">
            {favorites.length} {t("recipes.title").toLowerCase()} saved
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {favorites.map((favorite) => (
              <RecipeCard key={favorite.id} recipe={favorite.recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              {t("recipes.noRecipes")}
            </p>
            <Link
              href={`/${locale}/recipes`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              {t("recipes.title")} →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
