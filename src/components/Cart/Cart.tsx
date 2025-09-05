import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { closeCart, removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import './Cart.css';

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const { items, isOpen, totalItems, totalAmount } = useSelector((state: RootState) => state.cart);

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
  };

  const handleCheckout = () => {
    alert(`Ready to checkout!\n\nItems: ${totalItems}\nTotal: ${formatPrice(totalAmount)}\n\nCheckout flow coming soon!`);
    dispatch(closeCart());
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  return (
    <div className="cart-overlay" onClick={() => dispatch(closeCart())}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2 className="cart-title">Shopping Cart</h2>
          <button 
            className="cart-close"
            onClick={() => dispatch(closeCart())}
          >
            ×
          </button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div className="cart-empty-text">Your cart is empty</div>
              <div className="cart-empty-subtext">Add some products</div>
            </div>
          ) : (
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-price">{formatPrice(item.product.price * item.quantity)}</div>
                    
                    <div className="cart-item-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                      
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.id)}
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-total-items">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="cart-total-amount">
                <span>Total:</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
            </div>

            <div className="cart-actions">
              <button 
                className="checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              <button 
                className="continue-shopping-btn"
                onClick={() => dispatch(closeCart())}
              >
                Continue Shopping
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
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
