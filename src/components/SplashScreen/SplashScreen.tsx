import React from 'react';
import { useTranslation } from 'react-i18next';
import './SplashScreen.css';

interface SplashScreenProps {
  isLoading: boolean;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  const { t } = useTranslation();
  
  if (!isLoading) return null;

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="splash-logo">
          <div className="logo-icon">
            🛒
          </div>
          <h1 className="logo-text">{t('splash.title')}</h1>
        </div>
        
        <div className="loading-animation">
          <div className="loading-spinner"></div>
          <p className="loading-text">{t('splash.loading')}</p>
        </div>
        
        <div className="splash-footer">
          <p>{t('splash.poweredBy')}</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
