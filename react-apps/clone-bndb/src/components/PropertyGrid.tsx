import React from 'react';
import PropertyCard from './PropertyCard';
import { Property } from '../types';

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Alpine ambience with a breathtaking panorama!',
    location: 'Boden, Tirol, Austria',
    type: 'Entire home',
    host: {
      name: 'Eric',
      type: 'Superhost',
      rating: 5.0
    },
    images: [
      'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6',
      'https://images.unsplash.com/photo-1505015920881-0f83c2f7c95e'
    ],
    price: 358,
    originalPrice: 422,
    currency: '€',
    dates: {
      start: '2024-09-06',
      end: '2024-09-13'
    },
    rating: 5.0,
    favorite: false
  },
  {
    id: '2',
    title: 'Chalet Mountain VIEW',
    location: 'Oberau, Tirol, Austria',
    type: 'Entire rental unit',
    host: {
      name: 'Tamara',
      type: 'Superhost',
      rating: 4.98
    },
    images: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6',
      'https://images.unsplash.com/photo-1505015920881-0f83c2f7c95e'
    ],
    price: 400,
    currency: '€',
    dates: {
      start: '2024-06-15',
      end: '2024-06-20'
    },
    rating: 4.98,
    favorite: false
  }
];

const PropertyGrid: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {SAMPLE_PROPERTIES.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default PropertyGrid;