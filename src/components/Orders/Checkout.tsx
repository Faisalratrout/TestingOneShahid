import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { createOrder } from '../../store/slices/ordersSlice';
import { clearCart } from '../../store/slices/cartSlice';
import './Checkout.css';

interface CheckoutProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isLoading } = useSelector((state: RootState) => state.orders);

  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!shippingAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingAddress.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to place an order');
      return;
    }

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createOrder({
        items,
        shippingAddress,
        totalAmount: totalAmount
      })).unwrap();
      
      dispatch(clearCart());
      onSuccess();
    } catch (error) {
      alert('Failed to place order. Please try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out.</p>
          <button onClick={onCancel} className="back-button">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <button onClick={onCancel} className="close-button">
          ✕
        </button>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          <div className="shipping-form">
            <h2>Shipping Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  value={shippingAddress.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className={errors.street ? 'error' : ''}
                  placeholder="123 Main Street"
                />
                {errors.street && <span className="error-message">{errors.street}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={errors.city ? 'error' : ''}
                    placeholder="New York"
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className={errors.state ? 'error' : ''}
                    placeholder="NY"
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={errors.zipCode ? 'error' : ''}
                    placeholder="10001"
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <select
                  id="country"
                  value={shippingAddress.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                >
                  <option value="United States">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={onCancel}
                  className="cancel-button"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="place-order-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Placing Order...' : `Place Order ($${totalAmount.toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {items.map((item) => (
                <div key={item.id} className="summary-item">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="summary-item-image"
                  />
                  <div className="summary-item-details">
                    <h4>{item.product.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    <span className="summary-item-price">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-breakdown">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${(totalAmount * 0.9).toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>${(totalAmount * 0.08).toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span>${(totalAmount * 0.02).toFixed(2)}</span>
              </div>
              <div className="summary-line total">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
