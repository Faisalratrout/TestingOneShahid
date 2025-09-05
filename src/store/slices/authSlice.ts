// Enhanced auth slice with real user registration and login
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthState, LoginCredentials } from '../../types';

// User registration interface
interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// Helper functions for user management
const getUsersFromStorage = () => {
  const users = localStorage.getItem('registeredUsers');
  return users ? JSON.parse(users) : [];
};

const saveUsersToStorage = (users: any[]) => {
  localStorage.setItem('registeredUsers', JSON.stringify(users));
};

// Async thunk for user registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsersFromStorage();
    
    // Check if user already exists
    const existingUser = users.find((user: any) => user.email === credentials.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: credentials.name,
      email: credentials.email,
      password: credentials.password, 
      role: 'user' as const
    };
    
    // Save user to storage
    users.push(newUser);
    saveUsersToStorage(users);
    
    // Create session
    const token = 'user-token-' + newUser.id + '-' + Date.now();
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role 
      }, 
      token 
    };
  }
);

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = getUsersFromStorage();
    
    // Find user with matching credentials
    const user = users.find((u: any) => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const token = 'user-token-' + user.id + '-' + Date.now();
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return { 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    };
  }
);

// Async thunk for verifying existing token
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (token: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if token is valid format
    if (!token.startsWith('user-token-')) {
      throw new Error('Invalid token format');
    }
    
    // Get current user from storage
    const currentUserData = localStorage.getItem('currentUser');
    if (!currentUserData) {
      throw new Error('No user session found');
    }
    
    const user = JSON.parse(currentUserData);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
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
      localStorage.removeItem('currentUser');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      })
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
      // Verify token cases
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
        localStorage.removeItem('currentUser');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
