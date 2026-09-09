import { create } from 'zustand';
import { Property, SearchFilters, User } from '../types';

interface StoreState {
  user: User | null;
  properties: Property[];
  searchFilters: SearchFilters;
  selectedProperty: Property | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setProperties: (properties: Property[]) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  setSelectedProperty: (property: Property | null) => void;
  setLoading: (loading: boolean) => void;
  toggleFavorite: (propertyId: string) => void;
}

const initialSearchFilters: SearchFilters = {
  location: '',
  checkIn: null,
  checkOut: null,
  guests: 1,
  priceRange: [0, 1000],
  type: [],
  amenities: [],
};

export const useStore = create<StoreState>((set) => ({
  user: null,
  properties: [],
  searchFilters: initialSearchFilters,
  selectedProperty: null,
  loading: false,
  setUser: (user) => set({ user }),
  setProperties: (properties) => set({ properties }),
  setSearchFilters: (filters) =>
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    })),
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  setLoading: (loading) => set({ loading }),
  toggleFavorite: (propertyId) =>
    set((state) => ({
      properties: state.properties.map((property) =>
        property.id === propertyId
          ? { ...property, favorite: !property.favorite }
          : property
      ),
    })),
}));