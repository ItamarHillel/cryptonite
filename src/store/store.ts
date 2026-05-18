import { configureStore } from '@reduxjs/toolkit';
import coinsReducer from './slices/coinsSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    coins: coinsReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
