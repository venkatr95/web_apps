import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import channelReducer from "./slices/channelSlice";
import recipeReducer from "./slices/recipeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    channels: channelReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
