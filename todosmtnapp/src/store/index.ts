import { configureStore } from '@reduxjs/toolkit';
import todoReducer from './todoSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    todos: todoReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
