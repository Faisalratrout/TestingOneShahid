import React from 'react';
import { useTranslation } from 'react-i18next';
import { Order } from '../../types';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const ORDER_STATUS_COLORS = {
  pending: '#ffc107',
  processing: '#17a2b8',
  shipped: '#6f42c1',
  delivered: '#28a745',
  cancelled: '#dc3545',
  default: '#6c757d',
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const { t } = useTranslation();
  const getStatusColor = (status: string) => {
    return ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || ORDER_STATUS_COLORS.default;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusColor = getStatusColor(order.status);

  return (
    <div className="order-card" onClick={onClick}>
      <div className="order-card-header">
        <div className="order-info">
          <h3 className="order-id">Order #{order.id.slice(-8).toUpperCase()}</h3>
          <p className="order-date">{t('orders.placedOn')} {formatDate(order.createdAt)}</p>
        </div>
        <div 
          className="order-status"
          style={{ backgroundColor: statusColor }}
        >
          {t(`orders.${order.status}`)}
        </div>
      </div>

      <div className="order-card-body">
        <div className="order-summary">
          <div className="item-count">
            {order.items.length} {order.items.length === 1 ? t('orders.item') : t('orders.items')}
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
              +{order.items.length - 3} {t('orders.more')}
            </div>
          )}
        </div>
      </div>

      {order.shippingAddress && (
        <div className="order-card-footer">
          <div className="shipping-info">
            <span className="shipping-label">{t('orders.shipTo')}:</span>
            <span className="shipping-address">
              {order.shippingAddress.street}, {order.shippingAddress.city}
            </span>
          </div>
        </div>
      )}

      <div className="order-card-actions">
        <button className="view-details-btn">
          {t('orders.viewDetails')} →
        </button>
      </div>
    </div>
  );
};

export default OrderCard;
