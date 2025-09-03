// Day 1 Basic API service  simple mock implementation
// Will add real API calls later as we iterate
import { LoginCredentials, User, Product, Order } from '../types';

// Mock API service for authentication
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    // Simple mock delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo credentials for Day 1
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      const user: User = {
        id: '1',
        name: 'Demo User',
        email: credentials.email,
        role: 'user'
      };
      const token = 'mock-jwt-token-' + Date.now();
      return { user, token };
    }
    
    throw new Error('Invalid email or password');
  },

  verifyToken: async (token: string): Promise<User> => {
    // Simple mock token verification
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (token && token.startsWith('mock-jwt-token-')) {
      return {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'user'
      };
    }
    
    throw new Error('Invalid or expired token');
  }
};

// Placeholder API services for future implementation
export const productsAPI = {
  getProducts: async (): Promise<Product[]> => {
    // Day 1 placeholder  will implement later
    await new Promise(resolve => setTimeout(resolve, 800));
    return [];
  },

  getProduct: async (id: string): Promise<Product> => {
    // Day 1 placeholder will implement later
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Product API not implemented yet');
  }
};

export const ordersAPI = {
  getOrders: async (): Promise<Order[]> => {
    // Day 1 placeholder  will implement later
    await new Promise(resolve => setTimeout(resolve, 800));
    return [];
  },

  getOrder: async (id: string): Promise<Order> => {
    // Day 1 placeholder  will implement later
    await new Promise(resolve => setTimeout(resolve, 500));
    throw new Error('Orders API not implemented yet');
  }
};
