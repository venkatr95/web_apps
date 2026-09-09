import RecipeEditForm from "@/components/RecipeEditForm";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

interface EditRecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/recipes/${slug}/edit`);
  }

  const recipe = await prisma.recipe.findUnique({
    where: { slug },
    include: {
      ingredients: { orderBy: { order: "asc" } },
      categories: { include: { category: true } },
    },
  });

  if (!recipe) {
    notFound();
  }

  // Check authorization - author or admin can edit
  const isAdmin = session.user.role === "ADMIN";
  const isOwner = recipe.authorId === session.user.id;
  if (!isAdmin && !isOwner) {
    redirect(`/recipes/${slug}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto container-padding">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
          Edit Recipe
        </h1>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <RecipeEditForm recipe={recipe} />
        </div>
      </div>
    </div>
  );
}
