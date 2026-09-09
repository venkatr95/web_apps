import PopularRecipesGrid from "@/components/PopularRecipesGrid";
import RecipeWizard from "@/components/RecipeWizard";
import Button from "@/components/ui/Button";
import { DEMO_CATEGORIES, getDemoRecipes, isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export const revalidate = 3600; // Revalidate every hour (ISR)

async function getPopularRecipes() {
  if (isDemoMode()) {
    return getDemoRecipes().slice(0, 25);
  }

  try {
    return await prisma.recipe.findMany({
      where: { published: true },
      take: 25,
      orderBy: [{ pageVisits: "desc" }, { views: "desc" }],
      include: {
        author: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
    });
  } catch (error) {
    console.warn("Database error, using demo data:", error);
    return getDemoRecipes().slice(0, 25);
  }
}

async function getCategories() {
  if (isDemoMode()) {
    return DEMO_CATEGORIES;
  }

  try {
    return await prisma.category.findMany({
      take: 6,
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.warn("Database error, using demo data:", error);
    return DEMO_CATEGORIES;
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const [popularRecipes, categories] = await Promise.all([
    getPopularRecipes(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero Section with Wizard */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-balance">
              {t("hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-primary-50 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
          </div>

          {/* Recipe Wizard */}
          <div className="max-w-3xl mx-auto">
            <RecipeWizard />
          </div>
        </div>
      </section>

      {/* Popular Recipes Grid (5x5 Adaptive) */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto container-padding">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <PopularRecipesGrid initialRecipes={popularRecipes as any} />
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto container-padding">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t("categories.title")}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t("categories.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/${locale}/recipes?category=${category.slug}`}
                className="group"
              >
                <div className="relative h-32 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105">
                  {category.imageUrl && (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 16vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                    <span className="text-white font-semibold p-3 w-full text-center">
                      {category.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-4xl mx-auto container-padding text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("cta.description")}
          </p>
          <Link href={`/${locale}/auth/signup`}>
            <Button size="lg" variant="primary">
              {t("cta.joinButton")}
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
