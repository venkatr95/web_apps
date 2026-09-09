import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ShoppingListForm from '@/components/ShoppingListForm';

export default async function NewShoppingListPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect('/auth/signin?callbackUrl=/shopping-lists/new');
    }

    // Get user's recipes for the form
    const recipes = await prisma.recipe.findMany({
        where: { authorId: session.user.id, published: true },
        select: {
            id: true,
            title: true,
            slug: true,
        },
        orderBy: { title: 'asc' },
    });

    // Also get user's favorite recipes
    const favorites = await prisma.favorite.findMany({
        where: { userId: session.user.id },
        include: {
            recipe: {
                select: {
                    id: true,
                    title: true,
                    slug: true,
                },
            },
        },
    });

    const favoriteRecipes = favorites.map(f => f.recipe);

    // Combine and deduplicate
    const allRecipes = [...recipes];
    favoriteRecipes.forEach(fav => {
        if (!allRecipes.find(r => r.id === fav.id)) {
            allRecipes.push(fav);
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto container-padding">
                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">
                    Create Shopping List
                </h1>
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <ShoppingListForm recipes={allRecipes} />
                </div>
            </div>
        </div>
    );
}
