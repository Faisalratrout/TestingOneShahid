// Enhanced store with all slices Auth/ Products/ Cart/ Orders
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productsSlice from './slices/productsSlice';
import cartSlice from './slices/cartSlice';
import ordersSlice from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productsSlice,
    cart: cartSlice,
    orders: ordersSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
