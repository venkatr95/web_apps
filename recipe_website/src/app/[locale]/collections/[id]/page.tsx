import AddRecipeToCollection from "@/components/AddRecipeToCollection";
import CollectionForm from "@/components/CollectionForm";
import DeleteCollectionButton from "@/components/DeleteCollectionButton";
import RecipeCard from "@/components/RecipeCard";
import RemoveFromCollectionButton from "@/components/RemoveFromCollectionButton";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { FiGlobe, FiLock } from "react-icons/fi";

interface CollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { id } = await params;
  redirect(`/favLists/${id}`);
  const session = await getServerSession(authOptions);

  const collection = await prisma.collection.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      recipes: {
        include: {
          recipe: {
            include: {
              author: { select: { name: true } },
              reviews: { select: { rating: true } },
              categories: { include: { category: true } },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });

  if (!collection) {
    notFound();
  }

  const c = collection!;

  // Check if user has access to view this collection
  const isOwner = session?.user?.id === c.userId;
  if (!c.isPublic && !isOwner) {
    redirect("/favLists");
  }

  const recipes = c.recipes.map((cr) => cr.recipe);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Collection Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-heading font-bold text-gray-900">
                  {c.name}
                </h1>
                {c.isPublic ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    <FiGlobe className="h-4 w-4" />
                    Public
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    <FiLock className="h-4 w-4" />
                    Private
                  </span>
                )}
              </div>

              {c.description && (
                <p className="text-gray-600 mb-4">{c.description}</p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>By {c.user.name}</span>
                <span>•</span>
                <span>
                  {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
                </span>
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <DeleteCollectionButton collectionId={c.id} />
              </div>
            )}
          </div>
          {isOwner && (
            <div className="mt-6">
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-3">
                Edit Collection
              </h3>
              <CollectionForm
                collection={{
                  id: c.id,
                  name: c.name,
                  description: c.description,
                  isPublic: c.isPublic,
                }}
              />
            </div>
          )}
        </div>

        {/* Add Recipe Section */}
        {isOwner && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-heading font-bold text-gray-900 mb-4">
              Add Recipes to Collection
            </h2>
            <AddRecipeToCollection collectionId={c.id} />
          </div>
        )}

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Recipes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  {isOwner && (
                    <RemoveFromCollectionButton
                      collectionId={collection.id}
                      recipeId={recipe.id}
                    />
                  )}
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">
              No recipes in this collection yet
            </p>
            {isOwner && (
              <p className="text-gray-400">
                Use the form above to add recipes to your collection
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
