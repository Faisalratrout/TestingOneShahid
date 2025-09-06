// Orders Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { OrdersState, Order, CartItem } from '../../types';

// Create order from cart items
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: {
    items: CartItem[];
    total: number;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
    shippingAddress: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
  }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    
    const newOrder: Order = {
      id: 'order-' + Date.now(),
      userId: user.id,
      items: orderData.items,
      totalAmount: orderData.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      shippingAddress: {
        street: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        zipCode: orderData.shippingAddress.zipCode,
        country: orderData.shippingAddress.country,
      },
    };
    
    // Save order to localStorage
    const existingOrders = localStorage.getItem('userOrders');
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.push(newOrder);
    localStorage.setItem('userOrders', JSON.stringify(orders));
    
    return newOrder;
  }
);

// Fetch user orders
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    const allOrders = localStorage.getItem('userOrders');
    const orders: Order[] = allOrders ? JSON.parse(allOrders) : [];
    
    // Filter orders for current user
    return orders.filter(order => order.userId === user.id);
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async (data: { orderId: string; status: Order['status'] }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allOrders = localStorage.getItem('userOrders');
    const orders: Order[] = allOrders ? JSON.parse(allOrders) : [];
    
    const orderIndex = orders.findIndex(order => order.id === data.orderId);
    if (orderIndex !== -1) {
      orders[orderIndex].status = data.status;
      localStorage.setItem('userOrders', JSON.stringify(orders));
      return orders[orderIndex];
    }
    
    throw new Error('Order not found');
  }
);

const initialState: OrdersState = {
  orders: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    selectOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload); 
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create order';
      })

      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch orders';
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
        if (state.selectedOrder && state.selectedOrder.id === action.payload.id) {
          state.selectedOrder = action.payload;
        }
      });
  },
});

export const { selectOrder, clearSelectedOrder, clearError } = ordersSlice.actions;
export default ordersSlice.reducer;
