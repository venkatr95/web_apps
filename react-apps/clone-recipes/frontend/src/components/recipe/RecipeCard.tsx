import { Bookmark, ChefHat, Clock, Heart } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

import "../../styles/RecipeCard.css";
import { Recipe } from "../../types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="recipe-card">
      <Link to={`/recipe/${recipe.id}`}>
        <img
          src={recipe.image}
          alt={recipe.title}
          className="recipe-card-image"
        />
      </Link>
      <div className="recipe-card-content">
        <div className="recipe-card-header">
          <span
            className={`recipe-card-difficulty recipe-card-difficulty-${recipe.difficulty}`}
          >
            {recipe.difficulty.charAt(0).toUpperCase() +
              recipe.difficulty.slice(1)}
          </span>
          <div className="recipe-card-time">
            <Clock className="recipe-card-time-icon" />
            <span className="text-sm">{recipe.cookingTime} min</span>
          </div>
        </div>

        <Link to={`/recipe/${recipe.id}`} className="block">
          <h3 className="recipe-card-title">{recipe.title}</h3>
        </Link>

        <p className="recipe-card-description">{recipe.description}</p>

        <div className="recipe-card-footer">
          <div className="recipe-card-author">
            <ChefHat className="recipe-card-author-icon" />
            <span className="recipe-card-author-name">
              By {recipe.authorId}
            </span>
          </div>
          <div className="recipe-card-actions">
            <button className="recipe-card-action-button like">
              <Heart className="recipe-card-action-icon" />
              <span className="recipe-card-action-count">{recipe.likes}</span>
            </button>
            <button className="recipe-card-action-button save">
              <Bookmark className="recipe-card-action-icon" />
              <span className="recipe-card-action-count">{recipe.saves}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
