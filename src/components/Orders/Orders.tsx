import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { fetchOrders, selectOrder, clearSelectedOrder } from '../../store/slices/ordersSlice';
import OrderCard from './OrderCard';
import OrderDetails from './OrderDetails';
import './Orders.css';

const Orders: React.FC = () => {
  const { t } = useTranslation();
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
          <h2> Something went wrong</h2>
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
        <h1>{t('orders.myOrders')}</h1>
        <p>{t('orders.description')}</p>
      </div>

      <div className="orders-filters">
        <div className="filter-group">
          <label>{t('orders.filterByStatus')}:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="all">{t('orders.allOrders')}</option>
            <option value="pending">{t('orders.pending')}</option>
            <option value="processing">{t('orders.processing')}</option>
            <option value="shipped">{t('orders.shipped')}</option>
            <option value="delivered">{t('orders.delivered')}</option>
            <option value="cancelled">{t('orders.cancelled')}</option>
          </select>
        </div>
      </div>

      <div className="orders-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('orders.loading')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>{t('orders.noOrders')}</h2>
            <p>
              {filterStatus === 'all' 
                ? t('orders.noOrdersMessage')
                : t('orders.noOrdersWithStatus', { status: filterStatus })}
            </p>
            {filterStatus !== 'all' && (
              <button 
                onClick={() => setFilterStatus('all')}
                className="reset-filter-button"
              >
                {t('orders.showAllOrders')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="orders-meta">
              <p>{t('orders.ordersCount', { count: filteredOrders.length })}</p>
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
