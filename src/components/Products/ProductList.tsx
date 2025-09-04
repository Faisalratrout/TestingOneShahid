// Day 2 Complete ProductList Component
// Features Product display/ search/ filtering/ sorting
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { 
  fetchProducts, 
  fetchCategories,
  setSearchTerm,
  setCategory,
  setSortBy,
  setSortOrder,
  resetFilters 
} from '../../store/slices/productsSlice';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    products, 
    isLoading, 
    error, 
    categories, 
    searchTerm,
    filters,
    sortBy,
    sortOrder 
  } = useSelector((state: RootState) => state.products);

  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Fetch products and categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts({
      category: filters.category,
      search: searchTerm,
      sortBy,
      sortOrder
    }));
  }, [dispatch, filters.category, searchTerm, sortBy, sortOrder]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearchTerm(localSearchTerm));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, dispatch]);

  const handleCategoryChange = (category: string) => {
    dispatch(setCategory(category));
  };

  const handleSortChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same sort field
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(newSortBy as 'name' | 'price' | 'rating' | 'newest'));
      dispatch(setSortOrder('desc'));
    }
  };

  const handleResetFilters = () => {
    setLocalSearchTerm('');
    dispatch(resetFilters());
  };

  if (error) {
    return (
      <div className="products-container">
        <div className="error-state">
          <h2> Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => dispatch(fetchProducts())}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Discover amazing products at great prices</p>
      </div>

      <div className="products-controls">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>

        <div className="filter-section">
          <div className="category-filter">
            <label>Category:</label>
            <select 
              value={filters.category} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-section">
            <label>Sort by:</label>
            <div className="sort-buttons">
              {[
                { key: 'newest', label: 'Newest' },
                { key: 'name', label: 'Name' },
                { key: 'price', label: 'Price' },
                { key: 'rating', label: 'Rating' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key)}
                  className={`sort-button ${sortBy === key ? 'active' : ''}`}
                >
                  {label} {sortBy === key && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleResetFilters} className="reset-button">
            Reset Filters
          </button>
        </div>
      </div>

      <div className="products-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading amazing products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h2>🔍 No products found</h2>
            <p>Try adjusting your search or filters</p>
            <button onClick={handleResetFilters} className="reset-button">
              Show All Products
            </button>
          </div>
        ) : (
          <>
            <div className="products-meta">
              <p>{products.length} product{products.length !== 1 ? 's' : ''} found</p>
            </div>
            
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onAddToCart={(productId) => {
                    // Placeholder for cart functionality
                    console.log('Adding to cart:', productId);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductList;
