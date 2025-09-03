// Day 1 Super basic login form
// Just trying to get the auth working will make it prettier later
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('demo@example.com'); // Prefill for testing
  const [password, setPassword] = useState('password');
  
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation will improve this later
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login to E-Commerce Dashboard</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="demo-info">
          Demo credentials: demo@example.com / password
        </p>
      </div>
    </div>
  );
};

export default Login;
