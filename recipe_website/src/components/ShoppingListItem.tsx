'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiCheck, FiSquare } from 'react-icons/fi';

interface ShoppingListItemProps {
    item: {
        id: string;
        name: string;
        amount: string;
        unit: string | null;
        category: string | null;
        checked: boolean;
        recipe: {
            title: string;
            slug: string;
        } | null;
    };
}

export default function ShoppingListItem({ item }: ShoppingListItemProps) {
    const [isChecked, setIsChecked] = useState(item.checked);

    const handleToggle = async () => {
        const newChecked = !isChecked;
        setIsChecked(newChecked);

        try {
            await fetch(`/api/shopping-lists/items/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ checked: newChecked }),
            });
        } catch (error) {
            console.error('Error updating item:', error);
            setIsChecked(!newChecked); // Revert on error
        }
    };

    return (
        <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-md transition-colors">
            <button
                onClick={handleToggle}
                className="flex-shrink-0 mt-1"
            >
                {isChecked ? (
                    <FiCheck className="h-5 w-5 text-green-600" />
                ) : (
                    <FiSquare className="h-5 w-5 text-gray-400" />
                )}
            </button>

            <div className="flex-1">
                <div className={`flex items-baseline gap-2 ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm">
                        {item.amount} {item.unit}
                    </span>
                </div>
                {item.recipe && (
                    <Link
                        href={`/recipes/${item.recipe.slug}`}
                        className="text-xs text-primary-600 hover:text-primary-700"
                    >
                        from {item.recipe.title}
                    </Link>
                )}
            </div>
        </div>
    );
}
