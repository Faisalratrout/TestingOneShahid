// Day 1 Basic auth slice  just login/logout for now
// Will add more features later as I figure them out
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials } from '../../types';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    // Simple mock for Day 1 will make it real later
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: credentials.email,
        role: 'user' as const
      };
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', token);
      return { user: mockUser, token };
    }
    throw new Error('Invalid credentials');
  }
);

// Async thunk for verifying existing token
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (token: string) => {
    // Simple mock verification for Day 1
    await new Promise(resolve => setTimeout(resolve, 500));
    if (token.startsWith('mock-jwt-token-')) {
      return {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'user' as const
      };
    }
    throw new Error('Invalid token');
  }
);

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('authToken'), 
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('authToken'); 
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        localStorage.removeItem('authToken');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
