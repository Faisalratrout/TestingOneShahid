import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { verifyToken } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ToastContainer from './components/Toast/ToastContainer';
import SplashScreen from './components/SplashScreen/SplashScreen';
import './App.css';

function App() {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);
  const [showSplash, setShowSplash] = useState(true);
  const [appInitialized, setAppInitialized] = useState(false);

  // Set initial language direction
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  // Initialize app and handle splash screen
  useEffect(() => {
    const initializeApp = async () => {
      // Simulate app initialization time (minimum 2 seconds for splash screen)
      const startTime = Date.now();
      
      // Check if user is already logged in
      if (token && !user) {
        await dispatch(verifyToken(token));
      }
      
      // Ensure splash screen shows for at least 2 seconds
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);
      
      setTimeout(() => {
        setAppInitialized(true);
        setShowSplash(false);
      }, remainingTime);
    };

    initializeApp();
  }, [dispatch, token, user]);

  // Show splash screen during app initialization
  if (showSplash || !appInitialized) {
    return <SplashScreen isLoading={true} />;
  }

  // Show loading for auth operations after splash screen
  if (isLoading) {
    return (
      <div className="loading-container">
        <div>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} />} 
          />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
