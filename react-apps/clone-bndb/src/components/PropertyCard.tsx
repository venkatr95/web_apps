import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${property.id}`);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Handle favoriting logic here
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      {/* Image Carousel */}
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="object-cover w-full h-full transition group-hover:scale-105"
        />
        
        {/* Navigation Arrows */}
        <button
          onClick={prevImage}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white opacity-0 group-hover:opacity-70 flex items-center justify-center transition-opacity"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextImage}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white opacity-0 group-hover:opacity-70 flex items-center justify-center transition-opacity"
        >
          <ChevronRight size={20} />
        </button>

        {/* Navigation Dots */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {property.images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                currentImageIndex === index ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Favorite Button */}
        <button 
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-white/10"
          onClick={handleHeartClick}
        >
          <Heart 
            size={24}
            className={`${property.favorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>
      </div>

      {/* Property Details */}
      <div className="mt-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium">{property.location}</h3>
          <div className="flex items-center">
            <span className="text-sm">★ {property.rating}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm">{property.type}</p>
        <p className="text-gray-500 text-sm">
          {new Date(property.dates.start).toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          })} - {new Date(property.dates.end).toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          })}
        </p>
        <p className="mt-1">
          {property.originalPrice && (
            <span className="line-through text-gray-500 mr-2">
              {property.currency}{property.originalPrice}
            </span>
          )}
          <span className="font-semibold">{property.currency}{property.price}</span>
          <span className="text-gray-500"> night</span>
        </p>
      </div>
    </div>
  );
};

export default PropertyCard;