import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Recipe } from "../../types/recipe";

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  selectedRecipe: Recipe | null;
}

const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
  selectedRecipe: null,
};

const recipeSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    setRecipes: (state, action: PayloadAction<Recipe[]>) => {
      state.recipes = action.payload;
    },
    addRecipe: (state, action: PayloadAction<Recipe>) => {
      state.recipes.push(action.payload);
    },
    updateRecipe: (state, action: PayloadAction<Recipe>) => {
      const index = state.recipes.findIndex(
        (recipe) => recipe.id === action.payload.id,
      );
      if (index !== -1) {
        state.recipes[index] = action.payload;
      }
    },
    deleteRecipe: (state, action: PayloadAction<string>) => {
      state.recipes = state.recipes.filter(
        (recipe) => recipe.id !== action.payload,
      );
    },
    setSelectedRecipe: (state, action: PayloadAction<Recipe | null>) => {
      state.selectedRecipe = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setRecipes,
  addRecipe,
  updateRecipe,
  deleteRecipe,
  setSelectedRecipe,
  setLoading,
  setError,
} = recipeSlice.actions;

export default recipeSlice.reducer;
