import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { fetchProducts } from '../../store/slices/productsSlice';
import { RootState, AppDispatch } from '../../store';
import ProductList from '../Products/ProductList';
import Orders from '../Orders/Orders';
import Analytics from '../Analytics/Analytics';
import Cart from '../Cart/Cart';
import CartButton from '../Cart/CartButton';
import './Dashboard.css';

const Dashboard: React.FC = () => {
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
          <h1>E-Commerce Dashboard</h1>
          <div className="user-section">
            <span className="welcome-text">Welcome, {user?.name}!</span>
            <CartButton />
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <div className="nav-content">
          {[
            { 
              key: 'analytics', 
              label: '📊 Analytics', 
              count: null 
            },
            { 
              key: 'products', 
              label: '🛍️ Products', 
              count: null 
            },
            { 
              key: 'orders', 
              label: '📦 Orders', 
              count: orders.length > 0 ? orders.length : null 
            }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`nav-button ${activeTab === key ? 'active' : ''}`}
            >
              {label} {count && <span className="nav-count">{count}</span>}
            </button>
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
