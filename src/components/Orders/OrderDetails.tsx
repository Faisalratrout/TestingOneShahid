import React from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { updateOrderStatus } from '../../store/slices/ordersSlice';
import { Order } from '../../types';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  const dispatch = useDispatch<AppDispatch>();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#6f42c1';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusUpdate = (newStatus: Order['status']) => {
    dispatch(updateOrderStatus({ orderId: order.id, status: newStatus }));
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'processing';
      case 'processing': return 'shipped';
      case 'shipped': return 'delivered';
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="order-details-container">
      <div className="order-details-header">
        <button onClick={onBack} className="back-button">
          ← Back to Orders
        </button>
        <div className="order-title">
          <h1>Order #{order.id.slice(-8).toUpperCase()}</h1>
          <div 
            className="order-status-badge"
            style={{ backgroundColor: getStatusColor(order.status) }}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </div>
        </div>
      </div>

      <div className="order-details-content">
        <div className="order-info-section">
          <h2>Order Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Order Date:</label>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-item">
              <label>Order ID:</label>
              <span>{order.id}</span>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <span className="status-text" style={{ color: getStatusColor(order.status) }}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <label>Total Amount:</label>
              <span className="total-amount">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="shipping-section">
          <h2>Shipping Address</h2>
          <div className="shipping-address">
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        <div className="items-section">
          <h2>Order Items ({order.items.length})</h2>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img src={item.product.imageUrl} alt={item.product.name} />
                </div>
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-description">{item.product.description}</p>
                  <div className="item-meta">
                    <span className="item-price">${item.product.price.toFixed(2)}</span>
                    <span className="item-quantity">Qty: {item.quantity}</span>
                    <span className="item-subtotal">
                      Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-summary-section">
          <h2>Order Summary</h2>
          <div className="summary-breakdown">
            <div className="summary-line">
              <span>Subtotal:</span>
              <span>${(order.totalAmount * 0.9).toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Tax:</span>
              <span>${(order.totalAmount * 0.08).toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span>Shipping:</span>
              <span>${(order.totalAmount * 0.02).toFixed(2)}</span>
            </div>
            <div className="summary-line total">
              <span>Total:</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {nextStatus && order.status !== 'cancelled' && order.status !== 'delivered' && (
          <div className="order-actions-section">
            <h2>Order Actions</h2>
            <div className="action-buttons">
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                className="update-status-button"
              >
                Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
              </button>
              {order.status === 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  className="cancel-order-button"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
