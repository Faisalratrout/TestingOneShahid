import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { closeCart, removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/toastSlice';
import CheckoutModal from '../Checkout/CheckoutModal';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import Button from '../Button/Button';
import './Cart.css';

const Cart: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, isOpen, totalItems, totalAmount } = useSelector((state: RootState) => state.cart);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
    dispatch(addToast({
      message: t('cart.itemRemoved'),
      type: 'info',
    }));
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleClearCart = () => {
    if (window.confirm(t('cart.clearConfirm'))) {
      dispatch(clearCart());
      dispatch(addToast({
        message: t('cart.cleared'),
        type: 'info',
      }));
    }
  };

  return (
    <>
      <div className="cart-overlay" onClick={() => dispatch(closeCart())}>
        <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <h3>{t('cart.shoppingCart')}</h3>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => dispatch(closeCart())}
              aria-label="Close cart"
            >
              ×
            </Button>
          </div>

          <div className="cart-content">
            {items.length === 0 ? (
              <div className="empty-cart">
                <p>{t('cart.empty')}</p>
              </div>
            ) : (
              <>
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <OptimizedImage 
                      src={item.product.imageUrl} 
                      alt={item.product.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <h4 className="cart-item-name">{item.product.name}</h4>
                        <p className="cart-item-price">{formatPrice(item.product.price)}</p>
                      </div>
                      <div className="cart-item-controls">
                        <div className="quantity-controls">
                          <label>{t('cart.quantity')}:</label>
                          <div className="quantity-buttons">
                            <button 
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="quantity-value">{item.quantity}</span>
                            <button 
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button 
                          className="remove-btn"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {items.length > 0 && (
            <div className="cart-footer">
              <div className="cart-summary">
                <div className="cart-total-items">
                  <span>{t('cart.totalItems')}:</span>
                  <span>{totalItems}</span>
                </div>
                <div className="cart-total-amount">
                  <span>{t('cart.total')}:</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="cart-actions">
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  {t('cart.checkout')}
                </button>
                <button 
                  className="continue-shopping-btn"
                  onClick={() => dispatch(closeCart())}
                >
                  {t('cart.continueShopping')}
                </button>
                <button 
                  className="clear-cart-btn"
                  onClick={handleClearCart}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {t('cart.clear')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
};


export default Cart;
