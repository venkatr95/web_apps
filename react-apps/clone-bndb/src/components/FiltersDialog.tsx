import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Wifi, ChefHat, Waves, Fan, Thermometer, Zap, Key, Dog, Award } from 'lucide-react';
import { useStore } from '../store';
import { PriceRangeSlider } from './PriceRangeSlider';

interface FiltersDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FiltersDialog: React.FC<FiltersDialogProps> = ({ isOpen, onClose }) => {
  const { searchFilters, setSearchFilters } = useStore();
  const [placeType, setPlaceType] = React.useState('any');
  const [priceRange, setPriceRange] = React.useState<[number, number]>([0, 1000]);
  const [rooms, setRooms] = React.useState({
    bedrooms: 'Any',
    beds: 'Any',
    bathrooms: 'Any',
  });

  const handleApplyFilters = () => {
    setSearchFilters({
      type: [placeType],
      priceRange: priceRange,
      bedrooms: rooms.bedrooms === 'Any' ? undefined : parseInt(rooms.bedrooms),
      beds: rooms.beds === 'Any' ? undefined : parseInt(rooms.beds),
      bathrooms: rooms.bathrooms === 'Any' ? undefined : parseInt(rooms.bathrooms),
    });
    onClose();
  };

  const handleClearAll = () => {
    setPlaceType('any');
    setPriceRange([0, 1000]);
    setRooms({
      bedrooms: 'Any',
      beds: 'Any',
      bathrooms: 'Any',
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl max-h-[calc(100vh-40px)] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X size={16} />
            </button>
            <h2 className="font-semibold">Filters</h2>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Type of place */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Type of place</h3>
              <div className="grid grid-cols-3 gap-2">
                {['Any type', 'Room', 'Entire home'].map((type) => (
                  <button
                    key={type}
                    className={`p-4 rounded-lg border ${
                      placeType === type.toLowerCase()
                        ? 'border-black'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setPlaceType(type.toLowerCase())}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Price range</h3>
              <p className="text-gray-600 mb-4">Nightly prices including fees and taxes</p>
              <PriceRangeSlider
                min={0}
                max={1000}
                value={priceRange}
                onChange={setPriceRange}
              />
            </div>

            {/* Rooms and beds */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Rooms and beds</h3>
              {Object.entries(rooms).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-4">
                  <span className="capitalize">{key}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                      onClick={() => setRooms({ ...rooms, [key]: 'Any' })}
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{value}</span>
                    <button
                      className="w-8 h-8 rounded-full border flex items-center justify-center"
                      onClick={() =>
                        setRooms({
                          ...rooms,
                          [key]: value === 'Any' ? '1' : String(parseInt(value) + 1),
                        })
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Amenities */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black">
                  <Wifi size={24} />
                  <span>Wifi</span>
                </button>
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black">
                  <ChefHat size={24} />
                  <span>Kitchen</span>
                </button>
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black">
                  <Waves size={24} />
                  <span>Washer</span>
                </button>
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black">
                  <Fan size={24} />
                  <span>Dryer</span>
                </button>
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black">
                  <Thermometer size={24} />
                  <span>Air conditioning</span>
                </button>
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black">
                  <Fan size={24} />
                  <span>Heating</span>
                </button>
              </div>
            </div>

            {/* Booking options */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Booking options</h3>
              <div className="space-y-4">
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black w-full">
                  <Zap size={24} />
                  <span>Instant Book</span>
                </button>
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black w-full">
                  <Key size={24} />
                  <span>Self check-in</span>
                </button>
                <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black w-full">
                  <Dog size={24} />
                  <span>Allows pets</span>
                </button>
              </div>
            </div>

            {/* Standout stays */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Standout stays</h3>
              <button className="flex items-center space-x-4 p-4 border rounded-lg hover:border-black w-full">
                <Award size={24} />
                <div className="text-left">
                  <div>Guest favorite</div>
                  <div className="text-sm text-gray-500">
                    The most loved homes on Airbnb
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex items-center justify-between sticky bottom-0 bg-white">
            <button
              className="font-semibold underline"
              onClick={handleClearAll}
            >
              Clear all
            </button>
            <button
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold"
              onClick={handleApplyFilters}
            >
              Show 1,000+ places
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};