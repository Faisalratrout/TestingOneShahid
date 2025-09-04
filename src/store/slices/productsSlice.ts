// Day 2 Products Redux Slice
// Handles product listing/ filtering/ and search functionality
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProductsState } from '../../types';
import { productsAPI } from '../../services/api';

// Async thunks for product operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters?: {
    category?: string;
    search?: string;
    sortBy?: 'name' | 'price' | 'rating' | 'newest';
    sortOrder?: 'asc' | 'desc';
  }) => {
    const products = await productsAPI.getProducts(filters);
    return products;
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    const categories = await productsAPI.getCategories();
    return categories;
  }
);

const initialState: ProductsState = {
  products: [],
  filteredProducts: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  filters: {
    category: 'all',
    priceRange: [0, 5000],
    inStock: null,
    rating: null,
  },
  sortBy: 'newest',
  sortOrder: 'desc',
  categories: ['all'],
  searchTerm: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCategory: (state, action) => {
      state.filters.category = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action) => {
      state.sortOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetFilters: (state) => {
      state.filters = {
        category: 'all',
        priceRange: [0, 5000],
        inStock: null,
        rating: null,
      };
      state.searchTerm = '';
      state.sortBy = 'newest';
      state.sortOrder = 'desc';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload;
        state.filteredProducts = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      });
  },
});

export const {
  setSearchTerm,
  setCategory,
  setSortBy,
  setSortOrder,
  clearError,
  resetFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
