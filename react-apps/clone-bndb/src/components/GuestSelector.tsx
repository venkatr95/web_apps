import React from 'react';
import { Minus, Plus, Info } from 'lucide-react';

interface GuestSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuestType {
  label: string;
  description: string;
  count: number;
  info?: string;
}

export const GuestSelector: React.FC<GuestSelectorProps> = ({ isOpen, onClose }) => {
  const [guests, setGuests] = React.useState<Record<string, GuestType>>({
    adults: {
      label: 'Adults',
      description: 'Ages 13 or above',
      count: 0,
    },
    children: {
      label: 'Children',
      description: 'Ages 2–12',
      count: 0,
    },
    infants: {
      label: 'Infants',
      description: 'Under 2',
      count: 0,
    },
    pets: {
      label: 'Pets',
      description: 'Bringing a service animal?',
      count: 0,
      info: 'Service animals are not pets',
    },
  });

  if (!isOpen) return null;

  const handleIncrement = (type: string) => {
    setGuests((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        count: prev[type].count + 1,
      },
    }));
  };

  const handleDecrement = (type: string) => {
    if (guests[type].count > 0) {
      setGuests((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          count: prev[type].count - 1,
        },
      }));
    }
  };

  const totalGuests = Object.values(guests).reduce((sum, guest) => sum + guest.count, 0);

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-3xl shadow-xl border mt-3 p-6 max-w-xl mx-auto">
      {Object.entries(guests).map(([type, guest]) => (
        <div
          key={type}
          className="flex items-center justify-between py-4 border-b last:border-b-0"
        >
          <div>
            <div className="font-medium">{guest.label}</div>
            <div className="text-sm text-gray-500">{guest.description}</div>
            {guest.info && (
              <button className="text-sm underline flex items-center mt-1">
                <Info size={12} className="mr-1" />
                {guest.info}
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleDecrement(type)}
              className={`w-8 h-8 rounded-full border flex items-center justify-center ${
                guest.count === 0
                  ? 'border-gray-200 text-gray-200 cursor-not-allowed'
                  : 'border-gray-400 text-gray-400 hover:border-gray-700 hover:text-gray-700'
              }`}
              disabled={guest.count === 0}
            >
              <Minus size={16} />
            </button>
            <span className="w-6 text-center">{guest.count}</span>
            <button
              onClick={() => handleIncrement(type)}
              className="w-8 h-8 rounded-full border border-gray-400 text-gray-400 flex items-center justify-center hover:border-gray-700 hover:text-gray-700"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};