// Day 1: Setting up basic app with Redux and routing
// Just getting login to work first, will add more pages later
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyToken } from './store/slices/authSlice';
import { RootState, AppDispatch } from './store';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading } = useSelector((state: RootState) => state.auth);

  // Check if user is already logged in when app starts
  useEffect(() => {
    if (token && !user) {
      dispatch(verifyToken(token));
    }
  }, [dispatch, token, user]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
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
      </div>
    </Router>
  );
}

export default App;
