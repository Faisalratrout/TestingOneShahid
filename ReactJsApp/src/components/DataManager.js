import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import DataCard from './DataCard';
import './DataManager.css';

const DataManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const API_URL = 'https://jsonplaceholder.typicode.com/posts'; //  API 

  const fetchData = async (isRetry = false) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }

      const response = await axios.get(API_URL, {
        timeout: 5000, // 5 second timeout
      });
      
      if (response.data && response.data.length > 0) {
        setPosts(response.data.slice(0, 12)); 
        setLastFetch(new Date().toLocaleTimeString());
        setRetryCount(0);
      } else {
        setPosts([]);
        setError('No data available from the API');
      }
    } catch (err) {
      console.error('API Error:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.response) {
        const status = err.response.status;
        const statusText = err.response.statusText;
        setError(`Server Error ${status}: ${statusText}. Failed to load data.`);
      } else if (err.request) {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError('An unexpected error occurred while fetching data.');
      }
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData(true);
  };

  const handleRetry = () => {
    fetchData(true);
  };

  return (
    <div className="data-manager">
      <header className="header">
        <h1 className="title"> Post Manager</h1>
        <p className="subtitle">Fetch and display posts from JSONPlaceholder API</p>
        
        <div className="controls">
          <button 
            className={`refresh-btn ${loading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh Data'}
          </button>
          
          {lastFetch && (
            <span className="last-fetch">
              Last updated: {lastFetch}
            </span>
          )}
        </div>
      </header>

      <main className="content">
        {loading && <LoadingSpinner />}
        
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={handleRetry}
            retryCount={retryCount}
          />
        )}
        
        {!loading && !error && posts.length === 0 && (
          <div className="no-data">
            <div className="no-data-icon"> </div>
            <h3>No Data Available</h3>
            <p>No posts were found. Try refreshing to fetch data again.</p>
            <button className="retry-btn" onClick={handleRefresh}>
              Try Again
            </button>
          </div>
        )}
        
        {!loading && !error && posts.length > 0 && (
          <div className="data-grid">
            <div className="data-count">
              Showing {posts.length} posts
            </div>
            <div className="cards-container">
              {posts.map(post => (
                <DataCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataManager;