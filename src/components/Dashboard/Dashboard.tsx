// Day 1 Super basic dashboard just a placeholder for now
// Will add real content tomorrow
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { RootState } from '../../store';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div style={{ padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: '1px solid #ddd',
        paddingBottom: '1rem'
      }}>
        <h1>E-Commerce Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem' }}>Welcome, {user?.name}!</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <main>
        <h2>Dashboard</h2>
        <p>Login successful! 🎉</p>
        <p>Tomorrow I'll add the products page...</p>
        
        <div style={{ 
          background: '#e7f3ff', 
          padding: '1rem', 
          borderRadius: '4px',
          marginTop: '1rem'
        }}>
          <h3>User Info:</h3>
          <p>ID: {user?.id}</p>
          <p>Email: {user?.email}</p>
          <p>Role: {user?.role}</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
