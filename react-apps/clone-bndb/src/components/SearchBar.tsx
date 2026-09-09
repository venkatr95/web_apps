import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useStore } from '../store';
import { DatePicker } from './DatePicker';
import { GuestCounter } from './GuestCounter';
import { FiltersDialog } from './FiltersDialog';

export const SearchBar: React.FC = () => {
  const { searchFilters, setSearchFilters } = useStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div
          className="flex-1 flex items-center border rounded-full py-2 px-4 shadow-sm hover:shadow-md transition cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="border-r px-4">{searchFilters.location || 'Anywhere'}</div>
          <div className="border-r px-4">
            {searchFilters.checkIn
              ? `${searchFilters.checkIn.toLocaleDateString()} - ${
                  searchFilters.checkOut?.toLocaleDateString() || 'Flexible'
                }`
              : 'Any week'}
          </div>
          <div className="px-4">
            {searchFilters.guests > 1 ? `${searchFilters.guests} guests` : 'Add guests'}
          </div>
          <div className="bg-[#FF385C] p-2 rounded-full text-white">
            <Search size={16} />
          </div>
        </div>

        <button
          className="ml-4 flex items-center space-x-2 border rounded-full px-4 py-3 hover:shadow-md transition"
          onClick={() => setIsFiltersOpen(true)}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
        </button>
      </div>

      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Where to?"
              className="w-full p-2 border rounded-lg"
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ location: e.target.value })}
            />
            <div className="flex gap-4">
              <DatePicker
                selected={searchFilters.checkIn}
                onChange={(date) => setSearchFilters({ checkIn: date })}
                placeholderText="Check in"
              />
              <DatePicker
                selected={searchFilters.checkOut}
                onChange={(date) => setSearchFilters({ checkOut: date })}
                placeholderText="Check out"
              />
            </div>
            <GuestCounter
              value={searchFilters.guests}
              onChange={(guests) => setSearchFilters({ guests })}
            />
          </div>
        </div>
      )}

      <FiltersDialog isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} />
    </div>
  );
};