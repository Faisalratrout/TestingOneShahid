// Day 2 Product Card Component
// Displays individual product information in a card layout
import React from 'react';
import { Product } from '../../types';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product.id);
    } else {
      // Placeholder for Day 2
      alert(`Added ${product.name} to cart! (Cart functionality coming later)`);
    }
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
        <img 
          src={product.imageUrl} 
          alt={product.name}
          onError={(e) => {
            // Fallback image if the URL fails to load
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400';
          }}
        />
        {!product.inStock && <div className="out-of-stock-badge">Out of Stock</div>}
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          {renderStars(product.rating)}
          <span className="rating-text">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>
        
        <div className="product-footer">
          <div className="product-price">
            {formatPrice(product.price)}
          </div>
          
          <button 
            className={`add-to-cart-btn ${!product.inStock ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
        
        <div className="product-meta">
          <span className="product-category">{product.category}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
