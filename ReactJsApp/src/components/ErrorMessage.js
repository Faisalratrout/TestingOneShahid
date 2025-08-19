import React from 'react';
import './ErrorMessage.css';

const ErrorMessage = ({ message, onRetry, retryCount }) => {
  return (
    <div className="error-container">
      <div className="error-icon">!!!</div>
      <div className="error-content">
        <h3>Oops! Something went wrong</h3>
        <p className="error-message">{message}</p>
        {retryCount > 0 && (
          <p className="retry-count">Retry attempts: {retryCount}</p>
        )}
        <button className="retry-btn" onClick={onRetry}>
           Try Again
        </button>
      </div>
    </div>
  );
};

export default ErrorMessage;