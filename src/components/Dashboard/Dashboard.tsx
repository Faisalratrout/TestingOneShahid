import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchOrders } from '../../store/slices/ordersSlice';
import { RootState, AppDispatch } from '../../store';
import ProductList from '../Products/ProductList';
import Orders from '../Orders/Orders';
import Cart from '../Cart/Cart';
import CartButton from '../Cart/CartButton';
import Checkout from '../Orders/Checkout';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders } = useSelector((state: RootState) => state.orders);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    if (user) {
      dispatch(fetchOrders());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductList />;
      case 'orders':
        return <Orders />;
      case 'analytics':
        return (
          <div className="tab-content">
            <h2>Analytics</h2>
            <p>Sales analytics and reports</p>
            <div className="coming-soon">
              <p>📊 Advanced analytics coming soon!</p>
            </div>
          </div>
        );
      default:
        return <ProductList />;
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
              key: 'products', 
              label: ' Products', 
              count: null 
            },
            { 
              key: 'orders', 
              label: ' Orders', 
              count: orders.length > 0 ? orders.length : null 
            },
            { 
              key: 'analytics', 
              label: ' Analytics', 
              count: 'Soon' 
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
