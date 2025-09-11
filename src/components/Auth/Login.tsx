import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginUser, registerUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import './Login.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
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
      alert(t('validation.fillAllFields'));
      return;
    }
    
    if (isSignupMode) {
      // Signup validation
      if (!name.trim()) {
        alert(t('validation.enterName'));
        return;
      }
      if (password !== confirmPassword) {
        alert(t('validation.passwordsNotMatch'));
        return;
      }
      if (password.length < 6) {
        alert(t('validation.passwordMinLength'));
        return;
      }
      if (!/\S+@\S+\.\S+/.test(email)) {
        alert(t('validation.invalidEmail'));
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
        <div className="login-header">
          <LanguageSwitcher />
        </div>
        <h2>{isSignupMode ? t('auth.signupTitle') : t('auth.loginTitle')}</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isSignupMode && (
            <div className="form-group">
              <label htmlFor="name">{t('auth.fullName')}:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder={t('auth.enterFullName')}
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder={t('auth.enterEmail')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder={t('auth.enterPassword')}
            />
          </div>
          
          {isSignupMode && (
            <div className="form-group">
              <label htmlFor="confirmPassword">{t('auth.confirmPassword')}:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                placeholder={t('auth.confirmYourPassword')}
              />
            </div>
          )}
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? (isSignupMode ? t('auth.signingUp') : t('auth.loggingIn')) : (isSignupMode ? t('auth.signup') : t('auth.login'))}
          </button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isSignupMode ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}
            {' '}
            <button 
              type="button" 
              onClick={toggleMode} 
              disabled={isLoading}
              className="toggle-link"
            >
              {isSignupMode ? t('auth.login') : t('auth.signup')}
            </button>
          </p>
        </div>
        
        {!isSignupMode && (
          <p className="demo-info">
            {t('auth.createAccount')}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
