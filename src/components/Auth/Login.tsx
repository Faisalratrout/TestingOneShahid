import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    
    if (isSignupMode) {
      // Signup validation
      if (!name.trim()) {
        alert('Please enter your name');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Dispatch registration
      dispatch(registerUser({ name: name.trim(), email: email.toLowerCase(), password }));
    } else {
      // Regular login
      dispatch(loginUser({ email: email.toLowerCase(), password }));
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    // Clear form when switching modes
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isSignupMode ? 'Sign Up for E-Commerce Dashboard' : 'Login to E-Commerce Dashboard'}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isSignupMode && (
            <div className="form-group">
              <label htmlFor="name">Full Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your full name"
              />
            </div>
          )}
          
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
          
          {isSignupMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder="Confirm your password"
              />
            </div>
          )}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? (isSignupMode ? 'Signing up...' : 'Logging in...') : (isSignupMode ? 'Sign Up' : 'Login')}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isSignupMode ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button 
              type="button" 
              onClick={toggleMode} 
              disabled={isLoading}
              className="toggle-link"
            >
              {isSignupMode ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
        
        {!isSignupMode && (
          <p className="demo-info">
            Create your account or login with your existing credentials
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
