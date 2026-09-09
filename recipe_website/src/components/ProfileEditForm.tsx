'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from './ui/Input';
import Button from './ui/Button';

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    location: z.string().max(100).optional(),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        bio: string | null;
        location: string | null;
        website: string | null;
    };
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || '',
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            setSuccess(true);
            router.refresh();

            setTimeout(() => {
                router.push(`/profile/${user.id}`);
            }, 1500);
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

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                    Profile updated successfully! Redirecting...
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                </label>
                <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <Input
                label="Name"
                {...register('name')}
                error={errors.name?.message}
                placeholder="Your name"
            />

            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                </label>
                <textarea
                    id="bio"
                    {...register('bio')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                    <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
                )}
            </div>

            <Input
                label="Location"
                {...register('location')}
                error={errors.location?.message}
                placeholder="City, Country"
            />

            <Input
                label="Website"
                type="url"
                {...register('website')}
                error={errors.website?.message}
                placeholder="https://yourwebsite.com"
            />

            <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(`/profile/${user.id}`)}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
