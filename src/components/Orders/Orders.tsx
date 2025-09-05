import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchOrders, selectOrder, clearSelectedOrder } from '../../store/slices/ordersSlice';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';
import './Orders.css';

const Orders: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, selectedOrder, isLoading, error } = useSelector((state: RootState) => state.orders);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleOrderSelect = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      dispatch(selectOrder(order));
    }
  };

  const handleBackToOrders = () => {
    dispatch(clearSelectedOrder());
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-state">
          <h2>⚠️ Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => dispatch(fetchOrders())}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetails 
        order={selectedOrder} 
        onBack={handleBackToOrders} 
      />
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track and manage your order history</p>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label>Filter by status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No orders found</h2>
            <p>
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here!" 
                : `No orders with status "${filterStatus}" found.`}
            </p>
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="reset-filter-button"
              >
                Show All Orders
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="orders-meta">
              <p>{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found</p>
            </div>
            
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => handleOrderSelect(order.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
