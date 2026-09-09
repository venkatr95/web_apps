import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { FiPlus } from "react-icons/fi";

export default async function FavListsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/favLists");
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
            href={`/${locale}/favLists/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="h-5 w-5" />
            {t("collections.create")}
          </Link>
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/favLists/${c.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {c.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {c._count.recipes} recipes
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  Your saved recipes list
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-dashed border-gray-300">
            <p className="text-gray-600 mb-4">{t("collections.noCollections")}</p>
            <Link
              href={`/${locale}/favLists/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              {t("collections.createFirst")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
