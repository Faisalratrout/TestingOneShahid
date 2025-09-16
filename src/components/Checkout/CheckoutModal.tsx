import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { createOrder } from '../../store/slices/ordersSlice';
import { clearCart, closeCart } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/toastSlice';
import FormField from '../FormField/FormField';
import { useFormValidation, validationRules } from '../../utils/validation';
import './CheckoutModal.css';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form validation
  const validation = useFormValidation(
    {
      fullName: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      paymentMethod: 'card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      nameOnCard: ''
    },
    {
      fullName: validationRules.name,
      email: validationRules.email,
      phone: validationRules.phone,
      address: validationRules.address,
      city: { required: true, minLength: 2, maxLength: 50 },
      state: { required: true, minLength: 2, maxLength: 50 },
      zipCode: { 
        required: true, 
        pattern: /^\d{5}(-\d{4})?$/,
        custom: (value: string) => {
          if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
            return 'ZIP code must be in format 12345 or 12345-6789';
          }
          return null;
        }
      },
      paymentMethod: { required: true },
      cardNumber: validationRules.cardNumber,
      expiryDate: validationRules.expiryDate,
      cvv: validationRules.cvv,
      nameOnCard: { 
        required: true, 
        minLength: 2, 
        pattern: /^[a-zA-Z\s]+$/,
        custom: (value: string) => {
          if (value && !/^[a-zA-Z\s]+$/.test(value)) {
            return 'Cardholder name can only contain letters and spaces';
          }
          return null;
        }
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validation.validateAllFields()) {
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        items: items,
        total: totalAmount,
        customerInfo: {
          name: validation.formData.fullName,
          email: validation.formData.email,
          phone: validation.formData.phone,
        },
        shippingAddress: {
          address: validation.formData.address,
          city: validation.formData.city,
          state: validation.formData.state,
          zipCode: validation.formData.zipCode,
          country: 'US',
        },
        paymentMethod: 'card',
      };

      await dispatch(createOrder(orderData)).unwrap();
      
      dispatch(clearCart());
      dispatch(closeCart());
      onClose();
      
      dispatch(addToast({
        message: t('checkout.orderSuccess'),
        type: 'success',
        duration: 5000
      }));
      
    } catch (error) {
      dispatch(addToast({
        message: t('checkout.orderError'),
        type: 'error',
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-header">
          <h2>{t('checkout.title')}</h2>
          <button className="checkout-close" onClick={onClose}>×</button>
        </div>

        <div className="checkout-content">
          <form onSubmit={handleSubmit}>
            <div className="checkout-section">
              <h3>{t('checkout.orderSummary')}</h3>
              <div className="order-summary">
                {items.map((item) => (
                  <div key={item.id} className="summary-item">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="summary-total">
                  <strong>{t('cart.total')}: {formatPrice(totalAmount)}</strong>
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h3>{t('checkout.shippingAddress')}</h3>
              <div className="form-row">
                <div className="form-group">
                  <FormField
                    type="text"
                    name="fullName"
                    label={t('checkout.fullName')}
                    value={validation.formData.fullName}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    errors={validation.errors.fullName}
                    touched={validation.touched.fullName}
                    required
                  />
                </div>
                <div className="form-group">
                  <FormField
                    type="email"
                    name="email"
                    label={t('checkout.email')}
                    value={validation.formData.email}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    errors={validation.errors.email}
                    touched={validation.touched.email}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <FormField
                    type="tel"
                    name="phone"
                    label={t('checkout.phone')}
                    value={validation.formData.phone}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    errors={validation.errors.phone}
                    touched={validation.touched.phone}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <FormField
                  type="text"
                  name="address"
                  label={t('checkout.address')}
                  value={validation.formData.address}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  errors={validation.errors.address}
                  touched={validation.touched.address}
                  placeholder={t('checkout.streetAddress')}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <FormField
                    type="text"
                    name="city"
                    label={t('checkout.city')}
                    value={validation.formData.city}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    errors={validation.errors.city}
                    touched={validation.touched.city}
                    required
                  />
                </div>
                <div className="form-group">
                  <FormField
                    type="text"
                    name="state"
                    label={t('checkout.state')}
                    value={validation.formData.state}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    errors={validation.errors.state}
                    touched={validation.touched.state}
                    required
                  />
                </div>
                <div className="form-group">
                  <FormField
                    type="text"
                    name="zipCode"
                    label={t('checkout.zipCode')}
                    value={validation.formData.zipCode}
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    errors={validation.errors.zipCode}
                    touched={validation.touched.zipCode}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="checkout-section">
              <h3>{t('checkout.paymentMethod')}</h3>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={validation.formData.paymentMethod === 'card'}
                    onChange={(e) => validation.handleChange('paymentMethod', e.target.value)}
                  />
                  <span>{t('checkout.creditCard')}</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={validation.formData.paymentMethod === 'paypal'}
                    onChange={(e) => validation.handleChange('paymentMethod', e.target.value)}
                  />
                  <span>{t('checkout.paypal')}</span>
                </label>
              </div>

              {validation.formData.paymentMethod === 'card' && (
                <>
                  <div className="form-group">
                    <FormField
                      type="text"
                      name="nameOnCard"
                      label={t('checkout.nameOnCard')}
                      value={validation.formData.nameOnCard}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      errors={validation.errors.nameOnCard}
                      touched={validation.touched.nameOnCard}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <FormField
                      type="text"
                      name="cardNumber"
                      label={t('checkout.cardNumber')}
                      value={validation.formData.cardNumber}
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      errors={validation.errors.cardNumber}
                      touched={validation.touched.cardNumber}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <FormField
                        type="text"
                        name="expiryDate"
                        label={t('checkout.expiryDate')}
                        value={validation.formData.expiryDate}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        errors={validation.errors.expiryDate}
                        touched={validation.touched.expiryDate}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <FormField
                        type="text"
                        name="cvv"
                        label={t('checkout.cvv')}
                        value={validation.formData.cvv}
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        errors={validation.errors.cvv}
                        touched={validation.touched.cvv}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="checkout-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isProcessing}
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn-place-order"
                disabled={isProcessing}
              >
                {isProcessing ? t('checkout.processing') : `${t('checkout.placeOrder')} - ${formatPrice(totalAmount)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
