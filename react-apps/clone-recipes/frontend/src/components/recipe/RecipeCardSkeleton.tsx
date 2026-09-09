import React from 'react';
import '../../styles/RecipeCardSkeleton.css';

const RecipeCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-header">
          <div className="skeleton-difficulty" />
          <div className="skeleton-time" />
        </div>

        <div className="skeleton-title" />
        <div className="skeleton-description-line" />
        <div className="skeleton-description-line-short" />

        <div className="skeleton-footer">
          <div className="skeleton-author" />
          <div className="skeleton-actions">
            <div className="skeleton-action" />
            <div className="skeleton-action" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCardSkeleton;
