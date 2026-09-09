import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";

import {
  setError,
  setLoading,
  setRecipes,
} from "../../store/slices/recipeSlice";
import { RootState } from "../../store/store";

import "../../styles/RecipeFeed.css";
import RecipeCard from "./RecipeCard";
import RecipeCardSkeleton from "./RecipeCardSkeleton";

const ITEMS_PER_PAGE = 12;

const RecipeFeed: React.FC = () => {
  const dispatch = useDispatch();
  const { recipes, loading, error } = useSelector(
    (state: RootState) => state.recipes,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  const loadMoreRecipes = async () => {
    if (loading || !hasMore) return;

    dispatch(setLoading(true));
    try {
      // TODO: Replace with actual API call
      const mockRecipes = Array.from({ length: ITEMS_PER_PAGE }, (_, i) => ({
        id: `${page}-${i}`,
        title: `Delicious Recipe ${page}-${i}`,
        description:
          "A wonderful recipe that will make your taste buds dance with joy. Perfect for any occasion and easy to prepare.",
        ingredients: ["ingredient 1", "ingredient 2"],
        instructions: ["step 1", "step 2"],
        cookingTime: 30,
        difficulty: ["easy", "medium", "hard"][
          Math.floor(Math.random() * 3)
        ] as "easy" | "medium" | "hard",
        image: `https://source.unsplash.com/random/800x600/?food&${page}-${i}`,
        authorId: "chef123",
        channelId: "channel1",
        likes: Math.floor(Math.random() * 1000),
        saves: Math.floor(Math.random() * 500),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      dispatch(setRecipes([...recipes, ...mockRecipes]));
      setHasMore(mockRecipes.length === ITEMS_PER_PAGE);
      setPage((prev) => prev + 1);
    } catch (err) {
      dispatch(
        setError(err instanceof Error ? err.message : "Failed to load recipes"),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreRecipes();
    }
  }, [inView]);

  if (error) {
    return (
      <div className="recipe-feed-error">
        <p className="recipe-feed-error-message">{error}</p>
        <button
          onClick={() => loadMoreRecipes()}
          className="recipe-feed-retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-feed">
      <div className="recipe-feed-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {loading && (
        <div className="recipe-feed-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      )}

      <div ref={ref} className="recipe-feed-loader" />

      {!hasMore && recipes.length > 0 && (
        <p className="recipe-feed-end-message">
          You've reached the end of the feed
        </p>
      )}
    </div>
  );
};

export default RecipeFeed;
