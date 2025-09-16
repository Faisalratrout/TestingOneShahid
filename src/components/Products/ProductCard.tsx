import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Product } from '../../types';
import { addToCart, updateQuantity, removeFromCart, openCart } from '../../store/slices/cartSlice';
import { addToast } from '../../store/slices/toastSlice';
import { RootState, AppDispatch } from '../../store';
import OptimizedImage from '../OptimizedImage/OptimizedImage';
import Button from '../Button/Button';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  
  // Find if this product is in the cart
  const cartItem = cartItems.find(item => item.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    dispatch(addToast({
      message: t('toasts.addedToCart', { product: product.name }),
      type: 'success',
    }));
  };

  const handleIncreaseQuantity = () => {
    if (cartItem) {
      dispatch(updateQuantity({ id: cartItem.id, quantity: cartItem.quantity + 1 }));
    } else {
      dispatch(addToCart(product));
    }
    dispatch(addToast({
      message: t('toasts.quantityUpdated', { product: product.name }),
      type: 'info',
    }));
  };

  const handleDecreaseQuantity = () => {
    if (cartItem) {
      if (cartItem.quantity > 1) {
        dispatch(updateQuantity({ id: cartItem.id, quantity: cartItem.quantity - 1 }));
        dispatch(addToast({
          message: t('toasts.quantityUpdated', { product: product.name }),
          type: 'info',
        }));
      } else {
        dispatch(removeFromCart(cartItem.id));
        dispatch(addToast({
          message: t('toasts.removedFromCart', { product: product.name }),
          type: 'warning',
        }));
      }
    }
  };

  const handleViewCart = () => {
    dispatch(openCart());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <div className="stars">
        {'★'.repeat(fullStars)}
        {hasHalfStar && '☆'}
        {'☆'.repeat(emptyStars)}
      </div>
    );
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <OptimizedImage 
          src={product.imageUrl} 
          alt={product.name}
          fallback="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400"
        />
        {!product.inStock && <div className="out-of-stock-badge">{t('products.outOfStock')}</div>}
        {quantity > 0 && <div className="in-cart-badge">{quantity} in cart</div>}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          {renderStars(product.rating)}
          <span className="rating-text">
            {product.rating} ({product.reviews} {t('products.reviews')})
          </span>
        </div>
        
        <div className="product-footer">
          <div className="product-price">
            {formatPrice(product.price)}
          </div>
          
          {quantity > 0 ? (
            <div className="quantity-controls">
              <div className="quantity-display">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleDecreaseQuantity}
                  aria-label="Decrease quantity"
                >
                  −
                </Button>
                <span className="quantity-number">{quantity}</span>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleIncreaseQuantity}
                  aria-label="Increase quantity"
                >
                  +
                </Button>
              </div>
              <Button 
                variant="secondary"
                size="sm"
                onClick={handleViewCart}
              >
                {t('cart.viewCart')}
              </Button>
            </div>
          ) : (
            <Button 
              variant="primary"
              size="md"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? t('products.addToCart') : t('products.outOfStock')}
            </Button>
          )}
        </div>
        
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
