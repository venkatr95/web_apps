import DeleteShoppingListButton from "@/components/DeleteShoppingListButton";
import PrintButton from "@/components/PrintButton";
import ShoppingListItem from "@/components/ShoppingListItem";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface ShoppingListPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ShoppingListPage({
  params,
}: ShoppingListPageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/shopping-lists/${id}`);
  }

  const shoppingList = await prisma.shoppingList.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          recipe: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
      },
    },
  });

  if (!shoppingList) {
    notFound();
  }

  if (shoppingList.userId !== session.user.id) {
    redirect("/shopping-lists");
  }

  // Group items by category
  const itemsByCategory = shoppingList.items.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof shoppingList.items>);

  const categories = Object.keys(itemsByCategory).sort();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto container-padding">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                {shoppingList.name}
              </h1>
              <p className="text-gray-600">
                {shoppingList.items.length}{" "}
                {shoppingList.items.length === 1 ? "item" : "items"}
              </p>
            </div>

            <div className="flex gap-2">
              <PrintButton />
              <DeleteShoppingListButton listId={shoppingList.id} />
            </div>
          </div>
        </div>

        {/* Shopping List Items */}
        {categories.length > 0 ? (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-heading font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {category}
                </h2>
                <div className="space-y-2">
                  {itemsByCategory[category].map((item) => (
                    <ShoppingListItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No items in this shopping list
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
