// Day 2 Enhanced Dashboard with Products
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import ProductList from '../Products/ProductList';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState('products');

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductList />;
      case 'orders':
        return (
          <div className="tab-content">
            <h2>Orders</h2>
            <p>Order management coming in Day 3</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="tab-content">
            <h2>Analytics</h2>
            <p>Sales analytics coming in Day 3</p>
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
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <nav className="dashboard-nav">
        <div className="nav-content">
          {[
            { key: 'products', label: ' Products', count: null },
            { key: 'orders', label: ' Orders', count: 'Coming Soon' },
            { key: 'analytics', label: ' Analytics', count: 'Coming Soon' }
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

      {activeTab === 'products' && (
        <div className="day-info">
          <p> Day 2 Complete / Product listing with search / filters / and sorting is working</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
