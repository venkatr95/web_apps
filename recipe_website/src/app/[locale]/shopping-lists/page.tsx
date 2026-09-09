import Card from "@/components/ui/Card";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FiPlus, FiShoppingCart } from "react-icons/fi";

export default async function ShoppingListsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/shopping-lists");
  }

  const shoppingLists = await prisma.shoppingList.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { items: true },
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
              {t("shoppingList.title")}
            </h1>
            <p className="text-gray-600">{t("shoppingList.title")}</p>
          </div>
          <Link
            href={`/${locale}/shopping-lists/new`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <FiPlus className="h-5 w-5" />
            {t("shoppingList.create")}
          </Link>
        </div>

        {shoppingLists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shoppingLists.map((list) => (
              <Link key={list.id} href={`/${locale}/shopping-lists/${list.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <FiShoppingCart className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                      <h3 className="text-xl font-heading font-bold text-gray-900">
                        {list.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                      <span>
                        {list._count.items}{" "}
                        {list._count.items === 1 ? "item" : "items"}
                      </span>
                      <span>{formatDate(list.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FiShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t("shoppingList.noLists")}
            </h3>
            <p className="text-gray-600 mb-6">
              {t("shoppingList.createFirst")}
            </p>
            <Link
              href={`/${locale}/shopping-lists/new`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <FiPlus className="h-5 w-5" />
              {t("shoppingList.create")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
