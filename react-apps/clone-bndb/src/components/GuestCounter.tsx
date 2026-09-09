import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface GuestCounterProps {
  value: number;
  onChange: (value: number) => void;
}

export const GuestCounter: React.FC<GuestCounterProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded-lg">
      <span>Guests</span>
      <div className="flex items-center space-x-4">
        <button
          className="p-1 rounded-full hover:bg-gray-100"
          onClick={() => onChange(Math.max(1, value - 1))}
        >
          <Minus size={16} />
        </button>
        <span>{value}</span>
        <button
          className="p-1 rounded-full hover:bg-gray-100"
          onClick={() => onChange(value + 1)}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};