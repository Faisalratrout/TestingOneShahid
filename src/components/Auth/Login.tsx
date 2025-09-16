import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { loginUser, registerUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import FormField from '../FormField/FormField';
import Button from '../Button/Button';
import { useFormValidation, validationRules } from '../../utils/validation';
import './Login.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const loginValidation = useFormValidation(
    { email: '', password: '' },
    {
      email: validationRules.email,
      password: { required: true, minLength: 1 } 
    }
  );

  const signupValidation = useFormValidation(
    { name: '', email: '', password: '', confirmPassword: '' },
    {
      name: validationRules.name,
      email: validationRules.email,
      password: validationRules.password,
      confirmPassword: {
        required: true,
        custom: (value: string) => {
          if (value !== signupValidation.formData.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      }
    }
  );

  const currentValidation = isSignupMode ? signupValidation : loginValidation;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentValidation.validateAllFields()) {
      return;
    }
    
    if (isSignupMode) {
      const { name, email, password } = signupValidation.formData;
      dispatch(registerUser({ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password 
      }));
    } else {
      const { email, password } = loginValidation.formData;
      dispatch(loginUser({ 
        email: email.toLowerCase().trim(), 
        password 
      }));
    }
  };

  const toggleMode = () => {
    setIsSignupMode(!isSignupMode);
    loginValidation.resetForm();
    signupValidation.resetForm();
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
            <FormField
              label={t('auth.fullName')}
              name="name"
              type="text"
              value={signupValidation.formData.name}
              onChange={signupValidation.handleChange}
              onBlur={signupValidation.handleBlur}
              errors={signupValidation.errors.name}
              touched={signupValidation.touched.name}
              placeholder={t('auth.enterFullName')}
              required
              disabled={isLoading}
              autoComplete="name"
            />
          )}
          
          <FormField
            label={t('auth.email')}
            name="email"
            type="email"
            value={currentValidation.formData.email}
            onChange={currentValidation.handleChange}
            onBlur={currentValidation.handleBlur}
            errors={currentValidation.errors.email}
            touched={currentValidation.touched.email}
            placeholder={t('auth.enterEmail')}
            required
            disabled={isLoading}
            autoComplete="email"
          />
          
          <FormField
            label={t('auth.password')}
            name="password"
            type="password"
            value={currentValidation.formData.password}
            onChange={currentValidation.handleChange}
            onBlur={currentValidation.handleBlur}
            errors={currentValidation.errors.password}
            touched={currentValidation.touched.password}
            placeholder={t('auth.enterPassword')}
            required
            disabled={isLoading}
            autoComplete={isSignupMode ? "new-password" : "current-password"}
          />

          {isSignupMode && (
            <FormField
              label={t('auth.confirmPassword')}
              name="confirmPassword"
              type="password"
              value={signupValidation.formData.confirmPassword}
              onChange={signupValidation.handleChange}
              onBlur={signupValidation.handleBlur}
              errors={signupValidation.errors.confirmPassword}
              touched={signupValidation.touched.confirmPassword}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          )}
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading || currentValidation.hasErrors}
            isLoading={isLoading}
          >
            {isSignupMode ? t('auth.signup') : t('auth.login')}
          </Button>
        </form>
        
        <div className="auth-toggle">
          <p>
            {isSignupMode ? t('auth.alreadyHaveAccount') : t('auth.noAccount')}
            {' '}
            <Button
              type="button" 
              variant="ghost"
              size="sm"
              onClick={toggleMode} 
              disabled={isLoading}
            >
              {isSignupMode ? t('auth.login') : t('auth.signup')}
            </Button>
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
