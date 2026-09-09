'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiTrash2 } from 'react-icons/fi';

interface DeleteShoppingListButtonProps {
    listId: string;
}

export default function DeleteShoppingListButton({ listId }: DeleteShoppingListButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/shopping-lists/${listId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/shopping-lists');
                router.refresh();
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to delete shopping list');
            }
        } catch (error) {
            console.error('Error deleting shopping list:', error);
            alert('Failed to delete shopping list');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex gap-2">
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                </button>
                <button
                    onClick={() => setShowConfirm(false)}
                    disabled={isDeleting}
                    className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
            <FiTrash2 className="h-4 w-4" />
            Delete
        </button>
    );
}
