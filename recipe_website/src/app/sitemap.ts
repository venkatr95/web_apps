import { DEMO_CATEGORIES, getDemoRecipes, isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  let recipes, categories;

  if (isDemoMode()) {
    recipes = getDemoRecipes().map((r) => ({
      slug: r.slug,
      updatedAt: new Date(),
    }));
    categories = DEMO_CATEGORIES.map((c) => ({ slug: c.slug }));
  } else {
    try {
      // Get all published recipes
      recipes = await prisma.recipe.findMany({
        where: { published: true },
        select: {
          slug: true,
          updatedAt: true,
        },
      });

      // Get all categories
      categories = await prisma.category.findMany({
        select: {
          slug: true,
        },
      });
    } catch (error) {
      console.warn("Database error in sitemap, using demo data:", error);
      recipes = getDemoRecipes().map((r) => ({
        slug: r.slug,
        updatedAt: new Date(),
      }));
      categories = DEMO_CATEGORIES.map((c) => ({ slug: c.slug }));
    }
  }

  const recipeUrls = recipes.map((recipe) => ({
    url: `${baseUrl}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/recipes?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...recipeUrls,
    ...categoryUrls,
  ];
}
