import React from 'react';
import './FeaturedCard.css';

interface FeaturedCardProps {
  title: string;
  description: string;
  imageUrl: string;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ title, description, imageUrl }) => {
  return (
    <div className="featured-card">
      <img src={imageUrl} alt={title} className="featured-image" />
      <div className="featured-content">
        <h3 className="featured-title">{title}</h3>
        <p className="featured-description">{description}</p>
      </div>
    </div>
  );
};

export default FeaturedCard;
