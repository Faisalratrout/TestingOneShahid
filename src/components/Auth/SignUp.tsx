import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../../store/slices/authSlice';
import { AppDispatch } from '../../store';
import './Login.css';

const SignUp: React.FC = () => {
  const { t } = useTranslation();
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
      setError(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordMinLength'));
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
        <h2>{t('auth.signUp')}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="name">{t('auth.fullName')}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t('auth.enterFullName')}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t('auth.email')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder={t('auth.enterEmail')}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t('auth.password')}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('auth.enterPassword')}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder={t('auth.confirmPasswordPlaceholder')}
            required
          />
        </div>

        <button type="submit" className="login-button">
          {t('auth.signUp')}
        </button>
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            {t('auth.alreadyHaveAccount')}{' '}
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
              {t('auth.signIn')}
            </button>
          </span>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
