import React from 'react';

export interface Property {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  amenities: string[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  host: {
    id: string;
    name: string;
    type: 'Individual host' | 'Business host';
    rating: number;
    image: string;
    description: string;
    joinedDate: string;
  };
  images: string[];
  price: number;
  currency: string;
  dates: {
    start: string;
    end: string;
  };
  rating: number;
  reviews: Review[];
  favorite: boolean;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  baths: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface SearchFilters {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  priceRange: [number, number];
  type: string[];
  amenities: string[];
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  favorites: string[];
}

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}