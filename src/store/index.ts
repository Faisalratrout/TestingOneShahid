// Day 1 Setting up the basic Redux store
// Just getting the auth slice working for now
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
