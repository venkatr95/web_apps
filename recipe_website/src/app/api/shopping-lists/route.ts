import { authOptions } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const shoppingListSchema = z.object({
  name: z.string().min(1).max(100),
  recipeIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = shoppingListSchema.parse(body);

    if (isDemoMode()) {
      let items: Record<string, unknown>[] = [];
      if (validatedData.recipeIds && validatedData.recipeIds.length > 0) {
        // In demo mode, recipes don't have ingredients, so we create empty list
        items = [];
      }

      return NextResponse.json(
        {
          shoppingList: {
            id: `demo-list-${Date.now()}`,
            name: validatedData.name,
            userId: session.user.id,
            items,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          _demoMode: true,
          _message: "Demo mode: Shopping list not persisted",
        },
        { status: 201 }
      );
    }

    let items: Array<{
      name: string;
      amount: string;
      unit: string;
      recipeId: string;
      category: string;
    }> = [];

    if (validatedData.recipeIds && validatedData.recipeIds.length > 0) {
      const recipes = await prisma.recipe.findMany({
        where: {
          id: { in: validatedData.recipeIds },
        },
        include: {
          ingredients: true,
        },
      });

      items = recipes.flatMap((recipe) =>
        recipe.ingredients.map((ing) => ({
          name: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          recipeId: recipe.id,
          category: categorizeIngredient(ing.name),
        }))
      );
    }

    const shoppingList = await prisma.shoppingList.create({
      data: {
        name: validatedData.name,
        userId: session.user.id,
        items: {
          create: items,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ shoppingList }, { status: 201 });
  } catch (error) {
    console.error("Create shopping list error:", error);
    return NextResponse.json(
      { error: "Failed to create shopping list" },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDemoMode()) {
      const demoShoppingLists = [
        {
          id: "demo-list-1",
          name: "Weekly Groceries",
          userId: session.user.id,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({
        shoppingLists: demoShoppingLists,
        _demoMode: true,
      });
    }

    const shoppingLists = await prisma.shoppingList.findMany({
      where: { userId: session.user.id },
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
          orderBy: { category: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ shoppingLists });
  } catch (error) {
    console.error("Get shopping lists error:", error);
    return NextResponse.json(
      { error: "Failed to get shopping lists" },
      { status: 500 }
    );
  }
}

function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();

  if (/meat|chicken|beef|pork|lamb|turkey/i.test(lowerName)) return "Meat";
  if (/fish|salmon|tuna|shrimp|seafood/i.test(lowerName)) return "Seafood";
  if (/milk|cheese|yogurt|cream|butter/i.test(lowerName)) return "Dairy";
  if (/lettuce|tomato|onion|pepper|carrot|vegetable/i.test(lowerName))
    return "Produce";
  if (/apple|banana|orange|berry|fruit/i.test(lowerName)) return "Produce";
  if (/bread|pasta|rice|flour|cereal/i.test(lowerName)) return "Grains";
  if (/oil|vinegar|sauce|spice|salt|pepper/i.test(lowerName))
    return "Condiments";

  return "Other";
}
