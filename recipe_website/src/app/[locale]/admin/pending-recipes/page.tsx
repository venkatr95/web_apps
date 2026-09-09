import PendingRecipeCard from "@/components/admin/PendingRecipeCard";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getPendingRecipes() {
  const response = await fetch(`/api/admin/pending-recipes`, {
    headers: { cookie: cookies().toString() },
    cache: "no-store",
  });

  if (!response.ok) {
    return { recipes: [], total: 0 };
  }

  return response.json();
}

export default async function PendingRecipesPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("admin");

  // Check if user is admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const { recipes, total } = await getPendingRecipes();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("pendingRecipes.title")}</h1>
        <p className="text-muted-foreground">
          {t("pendingRecipes.subtitle", { count: total })}
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold mb-2">
            {t("pendingRecipes.noRecipes.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("pendingRecipes.noRecipes.description")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {recipes.map(
            (recipe: {
              id: string;
              slug: string;
              title: string;
              description: string;
              imageUrl?: string;
              createdAt: string;
              cookingTime: number;
              servings: number;
              author: {
                id: string;
                name: string;
                image?: string;
              };
            }) => (
              <PendingRecipeCard key={recipe.id} recipe={recipe} />
            )
          )}
        </div>
      )}
    </div>
  );
}
