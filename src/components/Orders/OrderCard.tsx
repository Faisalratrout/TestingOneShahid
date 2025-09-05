import React from 'react';
import { Order } from '../../types';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
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
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="order-card" onClick={onClick}>
      <div className="order-card-header">
        <div className="order-info">
          <h3 className="order-id">Order #{order.id.slice(-8).toUpperCase()}</h3>
          <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div 
          className="order-status"
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>

      <div className="order-card-body">
        <div className="order-summary">
          <div className="item-count">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </div>
          <div className="order-total">
            ${order.totalAmount.toFixed(2)}
          </div>
        </div>

        <div className="order-items-preview">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="item-preview">
              <img 
                src={item.product.imageUrl} 
                alt={item.product.name}
                className="item-preview-image"
              />
              <span className="item-preview-name">
                {item.product.name} {item.quantity > 1 && `(x${item.quantity})`}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="more-items">
              +{order.items.length - 3} more
            </div>
          )}
        </div>
      </div>

      {order.shippingAddress && (
        <div className="order-card-footer">
          <div className="shipping-info">
            <span className="shipping-label">Ship to:</span>
            <span className="shipping-address">
              {order.shippingAddress.street}, {order.shippingAddress.city}
            </span>
          </div>
        </div>
      )}

      <div className="order-card-actions">
        <button className="view-details-btn">
          View Details →
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
