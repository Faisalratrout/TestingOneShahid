import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
          <h2>{t('common.error')}! Something went wrong</h2>
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
        <h1>{t('products.title')}</h1>
        <p>Discover amazing products at great prices</p>
      </div>

      <div className="products-controls">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder={t('products.searchPlaceholder')}
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>
        </div>

        <div className="filter-section">
          <div className="category-filter">
            <label>{t('products.category')}:</label>
            <select 
              value={filters.category} 
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="category-select"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? t('products.allCategories') : 
                   t(`products.categories.${category}`, category)}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-section">
            <label>{t('common.sort')} by:</label>
            <div className="sort-buttons">
              {[
                { key: 'newest', label: t('products.sortOptions.newestFirst') },
                { key: 'name', label: t('products.sortOptions.nameAtoZ') },
                { key: 'price', label: t('products.price') },
                { key: 'rating', label: t('products.rating') }
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
            {t('common.clearFilters')}
          </button>
        </div>
      </div>

      <div className="products-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')} amazing products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h2>🔍 No products found</h2>
            <p>Try adjusting your search or filters</p>
            <button onClick={handleResetFilters} className="reset-button">
              {t('common.clearFilters')}
            </button>
          </div>
        ) : (
          <>
            <div className="products-meta">
              <p>{products.length} {products.length === 1 ? t('products.title').slice(0, -1) : t('products.title')} found</p>
            </div>
            
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
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
