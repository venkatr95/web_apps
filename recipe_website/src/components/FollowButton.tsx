'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';

interface FollowButtonProps {
    userId: string;
    initialFollowing: boolean;
}

export default function FollowButton({ userId, initialFollowing }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleFollow = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/follow', {
                method: isFollowing ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ followingId: userId }),
            });

            if (response.ok) {
                setIsFollowing(!isFollowing);
                router.refresh();
            } else {
                console.error('Failed to follow/unfollow');
            }
        } catch (error) {
            console.error('Error following/unfollowing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {isFollowing ? (
                <>
                    <FiUserCheck className="h-4 w-4" />
                    Following
                </>
            ) : (
                <>
                    <FiUserPlus className="h-4 w-4" />
                    Follow
                </>
            )}
        </button>
    );
}
