'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from './ui/Input';
import Button from './ui/Button';

const collectionSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    isPublic: z.boolean(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface CollectionFormProps {
    collection?: {
        id: string;
        name: string;
        description: string | null;
        isPublic: boolean;
    };
}

export default function CollectionForm({ collection }: CollectionFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CollectionFormData>({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            name: collection?.name ?? '',
            description: collection?.description ?? '',
            isPublic: collection?.isPublic ?? false,
        },
    });

    const onSubmit = async (data: CollectionFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const isEdit = Boolean(collection?.id);
            const endpoint = isEdit ? `/api/collections/${collection!.id}` : '/api/collections';
            const method = isEdit ? 'PUT' : 'POST';
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || (isEdit ? 'Failed to update collection' : 'Failed to create collection'));
            }

            const res = await response.json();
            const nextId = (res.collection?.id || res.id || collection?.id)!;
            router.push(`/collections/${nextId}`);
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
                label="Collection Name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="e.g., Summer BBQ Recipes"
            />

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                </label>
                <textarea
                    id="description"
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your collection..."
                />
                {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="isPublic"
                    {...register('isPublic')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                    Make this collection public
                </label>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (collection ? 'Saving...' : 'Creating...') : (collection ? 'Save Changes' : 'Create Collection')}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(collection ? `/collections/${collection.id}` : '/collections')}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
