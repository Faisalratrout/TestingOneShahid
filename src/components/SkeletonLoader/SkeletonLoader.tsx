import React from 'react';
import './SkeletonLoader.css';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'text' | 'circle';
  count?: number;
  height?: string;
  width?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type, 
  count = 1, 
  height = '20px', 
  width = '100%' 
}) => {
    // rendering different skeletons based on type prop
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-subtitle"></div>
              <div className="skeleton-line skeleton-price"></div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="skeleton-list-item">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-text">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        );
      case 'circle':
        return <div className="skeleton-circle" style={{ width: height, height }}></div>;
      case 'text':
      default:
        return <div className="skeleton-line" style={{ width, height }}></div>;
    }
  };
  // skelton type switch case , key added to avoid react key warning
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }, (_, index) => ( // key added , to avoid react key warning
        <div key={index} className="skeleton-item"> 
          {renderSkeleton()}
        </div>
      ))} 
    </div>
  );
};

export default SkeletonLoader;
