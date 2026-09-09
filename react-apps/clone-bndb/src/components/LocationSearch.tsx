import React from 'react';
import { MapPin } from 'lucide-react';

interface Location {
  name: string;
  description: string;
  icon?: React.ReactNode;
}

interface LocationSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestedLocations: Location[] = [
  {
    name: 'Nearby',
    description: 'Find what\'s around you',
    icon: <MapPin className="w-6 h-6 text-gray-600" />,
  },
  {
    name: 'Paris, France',
    description: 'For sights like Eiffel Tower',
    icon: (
      <div className="w-6 h-6 flex items-center justify-center">
        <span className="text-lg">🗼</span>
      </div>
    ),
  },
  {
    name: 'Prague, Czechia',
    description: 'For its bustling nightlife',
    icon: (
      <div className="w-6 h-6 flex items-center justify-center">
        <span className="text-lg">🏰</span>
      </div>
    ),
  },
  {
    name: 'Vienna, Austria',
    description: 'For its stunning architecture',
    icon: (
      <div className="w-6 h-6 flex items-center justify-center">
        <span className="text-lg">⚜️</span>
      </div>
    ),
  },
  {
    name: 'Budapest, Hungary',
    description: 'For its top-notch dining',
    icon: (
      <div className="w-6 h-6 flex items-center justify-center">
        <span className="text-lg">🏛️</span>
      </div>
    ),
  },
  {
    name: 'Barcelona, Spain',
    description: 'Popular beach destination',
    icon: (
      <div className="w-6 h-6 flex items-center justify-center">
        <span className="text-lg">🏖️</span>
      </div>
    ),
  },
];

export const LocationSearch: React.FC<LocationSearchProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white rounded-3xl shadow-xl border mt-3 p-6 max-w-2xl mx-auto">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search destinations"
          className="w-full p-4 text-lg border rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200"
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Suggested destinations</h3>
        <div className="grid gap-2">
          {suggestedLocations.map((location) => (
            <button
              key={location.name}
              className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition duration-200"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                {location.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{location.name}</div>
                <div className="text-sm text-gray-500">{location.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};