import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiUsers, FiStar } from 'react-icons/fi';
import Card from './ui/Card';
import { formatTime, getDifficultyColor } from '@/lib/utils';
import FavoriteHeartButton from './FavoriteHeartButton';

interface RecipeCardProps {
    recipe: {
        id: string;
        slug: string;
        title: string;
        description: string;
        imageUrl: string;
        prepTime: number;
        cookTime: number;
        servings: number;
        difficulty: string;
        cuisine: string;
        author: {
            name: string | null;
        };
        reviews: {
            rating: number;
        }[];
    };
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
    const totalTime = recipe.prepTime + recipe.cookTime;
    const avgRating = recipe.reviews.length > 0
        ? (recipe.reviews.reduce((sum, r) => sum + r.rating, 0) / recipe.reviews.length).toFixed(1)
        : null;

    return (
        <Link href={`/recipes/${recipe.slug}`}>
            <Card hover className="overflow-hidden h-full transition-transform hover:scale-[1.02]">
                <div className="relative h-48 w-full overflow-hidden">
                    <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(recipe.difficulty)}`}>
                            {recipe.difficulty}
                        </span>
                    </div>
                    <div className="absolute top-3 left-3">
                        <FavoriteHeartButton recipeId={recipe.id} recipeTitle={recipe.title} />
                    </div>
                </div>

                <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium text-primary-600">{recipe.cuisine}</span>
                        {avgRating && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <FiStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{avgRating}</span>
                                    <span>({recipe.reviews.length})</span>
                                </div>
                            </>
                        )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {recipe.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {recipe.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <FiClock className="h-4 w-4" />
                            <span>{formatTime(totalTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FiUsers className="h-4 w-4" />
                            <span>{recipe.servings} servings</span>
                        </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            By <span className="font-medium text-gray-700">{recipe.author.name}</span>
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
