import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { logout } from '../../store/slices/authSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { RootState, AppDispatch } from '../../store';
import ProductList from '../Products/ProductList';
import Orders from '../Orders/Orders';
import Analytics from '../Analytics/Analytics';
import Cart from '../Cart/Cart';
import CartButton from '../Cart/CartButton';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import Button from '../Button/Button';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
      dispatch(fetchProducts());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <Analytics />;
      case 'products':
        return <ProductList />;
      case 'orders':
        return <Orders />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="dashboard">
            <header className="dashboard-header">
        <div className="header-content">
          <h1>{t('dashboard.title')}</h1>
          <div className="user-section">
            <LanguageSwitcher />
            <span className="welcome-text">{t('common.welcome')}, {user?.name}!</span>
            <CartButton />
            <Button 
              variant="danger"
              size="sm"
              onClick={handleLogout}
            >
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <div className="nav-content">
          {[
            { 
              key: 'analytics', 
              label: `📊 ${t('dashboard.analytics')}`, 
              count: null 
            },
            { 
              key: 'products', 
              label: `🛍️ ${t('dashboard.products')}`, 
              count: null 
            },
            { 
              key: 'orders', 
              label: `📦 ${t('dashboard.orders')}`, 
              count: orders.length > 0 ? orders.length : null 
            }
          ].map(({ key, label, count }) => (
            <Button
              key={key}
              onClick={() => setActiveTab(key)}
              variant={activeTab === key ? 'primary' : 'ghost'}
              size="md"
              className={`nav-button ${activeTab === key ? 'active' : ''}`}
            >
              {label}
              {count && (
                <>
                  {' '}
                  <span 
                    className="count-badge"
                    aria-hidden="true"
                  >
                    {new Intl.NumberFormat(t('common.locale')).format(count)}
                  </span>
                </>
              )}
            </Button>
          ))}
        </div>
      </nav>

      <main className="dashboard-main">
        {renderContent()}
      </main>

      <div className="system-info">
        <p> Complete E-Commerce  Auth/ Products/ Cart/ Orders</p>
      </div>

      <Cart />
    </div>
  );
};

export default Dashboard;
