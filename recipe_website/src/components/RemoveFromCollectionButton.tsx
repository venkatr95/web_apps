'use client';

import { useRouter } from 'next/navigation';
import { FiTrash } from 'react-icons/fi';

interface RemoveFromCollectionButtonProps {
  collectionId: string;
  recipeId: string;
}

export default function RemoveFromCollectionButton({
  collectionId,
  recipeId,
}: RemoveFromCollectionButtonProps) {
  const router = useRouter();

  const handleRemove = async () => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/recipes`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to remove recipe');
        return;
      }
      router.refresh();
    } catch {
      alert('Failed to remove recipe');
    }
  };

  return (
    <button
      onClick={handleRemove}
      className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/80 backdrop-blur border border-gray-200 text-red-600 rounded hover:bg-white"
      title="Remove from list"
      aria-label="Remove recipe from this list"
    >
      <FiTrash className="h-4 w-4" />
      Remove
    </button>
  );
}
