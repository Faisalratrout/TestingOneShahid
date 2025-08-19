import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  token: null,
  refreshToken: null,
};

// Action types
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_TOKEN: 'SET_TOKEN',
  REFRESH_TOKEN_SUCCESS: 'REFRESH_TOKEN_SUCCESS',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        loading: false,
        error: null,
      };

    case AuthActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: action.payload,
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialState,
        loading: false,
      };

    case AuthActionTypes.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AuthActionTypes.SET_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };

    case AuthActionTypes.REFRESH_TOKEN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext({});

// Storage keys
const STORAGE_KEYS = {
  TOKEN: '@auth_token',
  REFRESH_TOKEN: '@auth_refresh_token',
  USER: '@auth_user',
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });

      const [token, refreshToken, userData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Validate token 
        const isTokenValid = await validateToken(token);
        
        if (isTokenValid) {
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user,
              token,
              refreshToken,
            },
          });
        } else {
          // Try to refresh token
          if (refreshToken) {
            const refreshResult = await refreshAuthToken(refreshToken);
            if (refreshResult.success) {
              dispatch({
                type: AuthActionTypes.LOGIN_SUCCESS,
                payload: {
                  user,
                  token: refreshResult.token,
                  refreshToken: refreshResult.refreshToken,
                },
              });
              await saveAuthData(user, refreshResult.token, refreshResult.refreshToken);
            } else {
              await clearAuthData();
              dispatch({ type: AuthActionTypes.LOGOUT });
            }
          } else {
            await clearAuthData();
            dispatch({ type: AuthActionTypes.LOGOUT });
          }
        }
      } else {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    }
  };

  // Login
  const login = async (credentials) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });

      // Simulate API call 
      const response = await mockLoginAPI(credentials);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        
        // Save to storage
        await saveAuthData(user, token, refreshToken);
        
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user, token, refreshToken },
        });

        return { success: true };
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: response.error,
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });

      // Simulate API call 
      const response = await mockRegisterAPI(userData);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        
        // Save to storage
        await saveAuthData(user, token, refreshToken);
        
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user, token, refreshToken },
        });

        return { success: true };
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: response.error,
        });
        return { success: false, error: response.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout
  const logout = async () => {
    try {
      
      // await logoutAPI(state.token);
      
      await clearAuthData();
      dispatch({ type: AuthActionTypes.LOGOUT });
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      await clearAuthData();
      dispatch({ type: AuthActionTypes.LOGOUT });
      return { success: true };
    }
  };

  // Update user profile
  const updateUser = async (userData) => {
    try {
      // replace with my  actual API
      const response = await mockUpdateUserAPI(userData, state.token);
      
      if (response.success) {
        const updatedUser = { ...state.user, ...response.data };
        
        // Update storage
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        
        dispatch({
          type: AuthActionTypes.UPDATE_USER,
          payload: updatedUser,
        });

        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await refreshAuthToken(state.refreshToken);
      
      if (response.success) {
        dispatch({
          type: AuthActionTypes.REFRESH_TOKEN_SUCCESS,
          payload: {
            token: response.token,
            refreshToken: response.refreshToken,
          },
        });

        // Update storage
        await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

        return { success: true, token: response.token };
      } else {
        // Refresh failed, logout user
        await logout();
        return { success: false, error: 'Session expired. Please login again.' };
      }
    } catch (error) {
      await logout();
      return { success: false, error: error.message };
    }
  };

  // Helper functions
  const saveAuthData = async (user, token, refreshToken) => {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user)),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken || ''),
    ]);
  };

  const clearAuthData = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  };

  const validateToken = async (token) => {
    try {
      // Simulate token validation  replace with my  actual API
      // const response = await validateTokenAPI(token);
      // return response.valid;
      
      // For now, just check if token exists and is not expired
      if (!token) return false;
      
      // Simple JWT expiration check (you should decode the actual JWT)
      const tokenData = parseJWT(token);
      if (tokenData && tokenData.exp) {
        return Date.now() < tokenData.exp * 1000;
      }
      
      return true; // Fallback for non-JWT tokens
    } catch (error) {
      return false;
    }
  };

  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  };

  // Context value
  const value = {
    // State
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Mock API functions (replace with my actual API calls)
const mockLoginAPI = async (credentials) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation
  if (credentials.email === 'test@example.com' && credentials.password === 'password') {
    return {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          avatar: null,
          createdAt: new Date().toISOString(),
        },
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      },
    };
  } else {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }
};

const mockRegisterAPI = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock validation
  if (userData.email && userData.password && userData.name) {
    return {
      success: true,
      data: {
        user: {
          id: Date.now().toString(),
          email: userData.email,
          name: userData.name,
          avatar: null,
          createdAt: new Date().toISOString(),
        },
        token: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
      },
    };
  } else {
    return {
      success: false,
      error: 'Missing required fields',
    };
  }
};

const mockUpdateUserAPI = async (userData, token) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    data: userData,
  };
};

const refreshAuthToken = async (refreshToken) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock refresh token validation
  if (refreshToken && refreshToken.startsWith('mock_refresh_token_')) {
    return {
      success: true,
      token: 'mock_jwt_token_' + Date.now(),
      refreshToken: 'mock_refresh_token_' + Date.now(),
    };
  } else {
    return {
      success: false,
      error: 'Invalid refresh token',
    };
  }
};

export default AuthContext;