'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from './ui/Input';
import Button from './ui/Button';
import { FiX } from 'react-icons/fi';

const shoppingListSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    recipeIds: z.array(z.string()).min(1, 'Select at least one recipe'),
});

type ShoppingListFormData = z.infer<typeof shoppingListSchema>;

interface Recipe {
    id: string;
    title: string;
    slug: string;
}

interface ShoppingListFormProps {
    recipes: Recipe[];
}

export default function ShoppingListForm({ recipes }: ShoppingListFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ShoppingListFormData>({
        resolver: zodResolver(shoppingListSchema),
        defaultValues: {
            recipeIds: [],
        },
    });

    const toggleRecipe = (recipeId: string) => {
        setSelectedRecipes(prev =>
            prev.includes(recipeId)
                ? prev.filter(id => id !== recipeId)
                : [...prev, recipeId]
        );
    };

    const onSubmit = async (data: ShoppingListFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/shopping-lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    recipeIds: selectedRecipes,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create shopping list');
            }

            const list = await response.json();
            router.push(`/shopping-lists/${list.id}`);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <Input
                label="Shopping List Name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="e.g., Weekly Groceries"
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Recipes
                </label>
                {recipes.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
                        {recipes.map((recipe) => (
                            <label
                                key={recipe.id}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedRecipes.includes(recipe.id)}
                                    onChange={() => toggleRecipe(recipe.id)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-900">{recipe.title}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">
                        No recipes available. Create or favorite some recipes first.
                    </p>
                )}
                {selectedRecipes.length === 0 && (
                    <p className="text-sm text-red-600 mt-2">
                        Please select at least one recipe
                    </p>
                )}
            </div>

            {selectedRecipes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedRecipes.map((recipeId) => {
                        const recipe = recipes.find(r => r.id === recipeId);
                        return (
                            <span
                                key={recipeId}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                            >
                                {recipe?.title}
                                <button
                                    type="button"
                                    onClick={() => toggleRecipe(recipeId)}
                                    className="hover:text-primary-900"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button type="submit" disabled={isLoading || selectedRecipes.length === 0}>
                    {isLoading ? 'Creating...' : 'Create Shopping List'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/shopping-lists')}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
