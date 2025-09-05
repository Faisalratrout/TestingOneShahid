import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import './Login.css';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch<AppDispatch>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Simulate signup success and auto login
    dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Sign Up</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
        </div>

        <button type="submit" className="login-button">
          Sign Up
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Already have an account?{' '}
            <button 
              type="button"
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#007bff', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onClick={() => window.location.reload()} // Simple way to go back to login
            >
              Sign In
            </button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
