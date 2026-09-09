import FollowButton from "@/components/FollowButton";
import RecipeCard from "@/components/RecipeCard";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiCalendar, FiGlobe, FiMapPin } from "react-icons/fi";

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.id === id;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      recipes: {
        where: { published: true },
        include: {
          author: { select: { name: true } },
          reviews: { select: { rating: true } },
          categories: { include: { category: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      _count: {
        select: {
          recipes: { where: { published: true } },
          followers: true,
          following: true,
          favorites: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const isFollowing = session?.user
    ? await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: id,
          },
        },
      })
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto container-padding py-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center text-4xl font-heading font-bold text-primary-600">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                    {user.name}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>

                {!isOwnProfile && session?.user && (
                  <FollowButton userId={id} initialFollowing={!!isFollowing} />
                )}

                {isOwnProfile && (
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>

              {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <FiMapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1">
                    <FiGlobe className="h-4 w-4" />
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <FiCalendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count.recipes}
                  </div>
                  <div className="text-sm text-gray-600">Recipes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count.followers}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {user._count.following}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                {isOwnProfile && (
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {user._count.favorites}
                    </div>
                    <div className="text-sm text-gray-600">Favorites</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes */}
      <div className="max-w-7xl mx-auto container-padding py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-heading font-bold text-gray-900">
            {isOwnProfile ? "My Recipes" : `${user.name}'s Recipes`}
          </h2>
          {isOwnProfile && (
            <div className="flex gap-3">
              <Link
                href="/profile/ai-recipe-generator"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                AI Recipe Generator
              </Link>
              <Link
                href="/profile/billing"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Credits & Purchases
              </Link>
              <Link
                href="/recipes/new"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Create Recipe
              </Link>
            </div>
          )}
        </div>

        {user.recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {user.recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {isOwnProfile
                ? "You haven't created any recipes yet."
                : "No recipes yet."}
            </p>
            {isOwnProfile && (
              <Link
                href="/recipes/new"
                className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Create your first recipe →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
