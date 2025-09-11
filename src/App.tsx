import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { verifyToken } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ToastContainer from './components/Toast/ToastContainer';
import './App.css';

function App() {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);

  // Set initial language direction
  useEffect(() => {
    const currentLang = i18n.language || 'en';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  // Check if user is already logged in when app starts
  useEffect(() => {
    if (token && !user) {
      dispatch(verifyToken(token));
    }
  }, [dispatch, token, user]);

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
