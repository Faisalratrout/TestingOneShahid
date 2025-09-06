import axios from 'axios';
import { LoginCredentials, User, Product, Order } from '../types';

//  axios 
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API service
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  verifyToken: async (token: string): Promise<User> => {
    const response = await api.post('/auth/verify', {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  }
};

// Mock product data
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest Apple smartphone with titanium design and A17 Pro chip',
    price: 999,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1592286162020-feacf065cdd3?w=400',
    inStock: true,
    rating: 4.8,
    reviews: 234,
    createdAt: '2025-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'MacBook Pro 16"',
    description: 'Professional laptop with M3 Pro chip for creative professionals',
    price: 2499,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    inStock: true,
    rating: 4.9,
    reviews: 156,
    createdAt: '2025-01-10T00:00:00Z'
  },
  {
    id: '3',
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Max Air cushioning',
    price: 150,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    inStock: true,
    rating: 4.6,
    reviews: 89,
    createdAt: '2025-01-08T00:00:00Z'
  },
  {
    id: '4',
    name: 'Sony WH-1000XM4',
    description: 'Premium noise-canceling wireless headphones',
    price: 349,
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    inStock: false,
    rating: 4.7,
    reviews: 445,
    createdAt: '2025-01-05T00:00:00Z'
  },
  {
    id: '5',
    name: 'Levi\'s 501 Original Jeans',
    description: 'Classic straight-fit jeans in vintage wash',
    price: 89,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1541840031508-326b77c9a17e?w=400',
    inStock: true,
    rating: 4.4,
    reviews: 267,
    createdAt: '2025-01-03T00:00:00Z'
  },
  {
    id: '6',
    name: 'Instant Pot Duo 7-in-1',
    description: 'Multi-functional pressure cooker and slow cooker',
    price: 99,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    inStock: true,
    rating: 4.5,
    reviews: 1203,
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: '7',
    name: 'Yoga Mat Premium',
    description: 'Non-slip exercise mat perfect for yoga and fitness',
    price: 45,
    category: 'Sports',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    inStock: true,
    rating: 4.3,
    reviews: 78,
    createdAt: '2024-12-28T00:00:00Z'
  },
  {
    id: '8',
    name: 'Coffee Maker Deluxe',
    description: 'Programmable 12-cup coffee maker with thermal carafe',
    price: 129,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    inStock: true,
    rating: 4.2,
    reviews: 134,
    createdAt: '2024-12-25T00:00:00Z'
  }
];

// Enhanced Products API with search and filter capabilities
export const productsAPI = {
  getProducts: async (filters?: {
    category?: string;
    search?: string;
    sortBy?: 'name' | 'price' | 'rating' | 'newest';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Product[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filteredProducts = [...MOCK_PRODUCTS];
    
    // Apply category filter
    if (filters?.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === filters.category?.toLowerCase()
      );
    }
    
    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      filteredProducts.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'rating':
            aValue = a.rating;
            bValue = b.rating;
            break;
          case 'newest':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    return filteredProducts;
  },

  getProduct: async (id: string): Promise<Product> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return product;
  },

  getCategories: async (): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const categorySet = new Set(MOCK_PRODUCTS.map(p => p.category));
    const categories = Array.from(categorySet);
    return ['all', ...categories.sort()];
  }
};

export const ordersAPI = {
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }
};
