import Card from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FiGlobe, FiLock, FiPlus } from "react-icons/fi";

export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/favLists`);
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/collections");
  }

  const collections = await prisma.collection.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { recipes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
              {t("collections.title")}
            </h1>
            <p className="text-gray-600">{t("collections.title")}</p>
          </div>
          <Link
            href={`/${locale}/collections/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="h-5 w-5" />
            {t("collections.create")}
          </Link>
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/${locale}/collections/${collection.id}`}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-heading font-bold text-gray-900">
                      {collection.name}
                    </h3>
                    {collection.isPublic ? (
                      <FiGlobe
                        className="h-5 w-5 text-green-600"
                        title="Public"
                      />
                    ) : (
                      <FiLock
                        className="h-5 w-5 text-gray-400"
                        title="Private"
                      />
                    )}
                  </div>

                  {collection.description && (
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                    <span>
                      {collection._count.recipes}{" "}
                      {collection._count.recipes === 1 ? "recipe" : "recipes"}
                    </span>
                    <span>{formatDate(collection.createdAt)}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FiPlus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t("collections.noCollections")}
            </h3>
            <p className="text-gray-600 mb-6">{t("collections.createFirst")}</p>
            <Link
              href={`/${locale}/collections/new`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              {t("collections.create")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
