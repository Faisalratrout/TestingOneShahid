import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <div className="loading-text">
        <h3>Loading Posts...</h3>
        <p>Please wait while we fetch the latest data</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;