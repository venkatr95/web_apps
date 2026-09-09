'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiClock, FiStar, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Recipe {
    id: string;
    title: string;
    slug: string;
    description: string;
    imageUrl: string;
    prepTime: number;
    cookTime: number;
    totalTime: number;
    servings: number;
    difficulty: string;
    cuisine: string;
    author: {
        id: string;
        name: string | null;
        image: string | null;
    };
    averageRating: number;
    reviewCount: number;
    favoritesCount: number;
}

interface SuggestedRecipesProps {
    recipeSlug: string;
}

export default function SuggestedRecipes({ recipeSlug }: SuggestedRecipesProps) {
    const [suggestions, setSuggestions] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const response = await fetch(`/api/recipes/${recipeSlug}/suggestions`);
                if (response.ok) {
                    const data = await response.json();
                    setSuggestions(data.suggestions);
                }
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, [recipeSlug]);

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('suggestions-container');
        if (container) {
            const scrollAmount = 320; // Card width + gap
            const newPosition = direction === 'left'
                ? scrollPosition - scrollAmount
                : scrollPosition + scrollAmount;

            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setScrollPosition(newPosition);
        }
    };

    if (loading) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80" />
                    ))}
                </div>
            </div>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>

            <div className="relative">
                {/* Scroll buttons */}
                {suggestions.length > 4 && (
                    <>
                        <button
                            onClick={() => scroll('left')}
                            disabled={scrollPosition === 0}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Scroll left"
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50"
                            aria-label="Scroll right"
                        >
                            <FiChevronRight className="text-xl" />
                        </button>
                    </>
                )}

                {/* Scrollable container */}
                <div
                    id="suggestions-container"
                    className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {suggestions.map((recipe) => (
                        <Link
                            key={recipe.id}
                            href={`/recipes/${recipe.slug}`}
                            className="flex-shrink-0 w-80 snap-start"
                        >
                            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative h-48">
                                    <Image
                                        src={recipe.imageUrl}
                                        alt={recipe.title}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold">
                                        {recipe.difficulty}
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <FiClock />
                                            <span>{recipe.totalTime}m</span>
                                        </div>
                                        {recipe.averageRating > 0 && (
                                            <div className="flex items-center gap-1">
                                                <FiStar className="text-yellow-500 fill-yellow-500" />
                                                <span>{recipe.averageRating}</span>
                                                <span className="text-gray-400">({recipe.reviewCount})</span>
                                            </div>
                                        )}
                                        {recipe.favoritesCount > 0 && (
                                            <div className="flex items-center gap-1">
                                                <FiHeart className="text-red-500" />
                                                <span>{recipe.favoritesCount}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        {recipe.author.image && (
                                            <Image
                                                src={recipe.author.image}
                                                alt={recipe.author.name || 'Author'}
                                                width={24}
                                                height={24}
                                                className="rounded-full"
                                            />
                                        )}
                                        <span className="text-gray-600">
                                            {recipe.author.name || 'Anonymous'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
