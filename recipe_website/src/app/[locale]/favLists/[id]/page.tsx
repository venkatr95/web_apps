import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface FavListPageProps {
  params: Promise<{
    id: string;
    locale?: string;
  }>;
}

export default async function FavListPage({ params }: FavListPageProps) {
  const { id } = await params;
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
                {!c.isPublic && (
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                    Private
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                Created by {c.user?.name || "You"}
              </p>
            </div>
            <Link
              href="/favLists"
              className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-100 text-sm"
            >
              Back to Fav Lists
            </Link>
          </div>
        </div>

        {/* Recipes Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.slug}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {r.title}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {r.reviews.length > 0
                      ? `${(
                          r.reviews.reduce((a, b) => a + b.rating, 0) /
                          r.reviews.length
                        ).toFixed(1)}★`
                      : "No ratings"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {r.description || "No description"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">No recipes in this list yet</p>
            <Link
              href="/recipes"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Browse Recipes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
