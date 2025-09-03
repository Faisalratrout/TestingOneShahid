import React, { useState, useEffect, memo } from 'react';
import './WelcomeBackNotification.css';

interface WelcomeBackNotificationProps {
  userName: string;
  tasksCount: number;
  lastActiveDate: string;
  show: boolean;
}

const WelcomeBackNotification: React.FC<WelcomeBackNotificationProps> = memo(({
  userName,
  tasksCount,
  lastActiveDate,
  show
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const getTimeAgo = () => {
    const lastActive = new Date(lastActiveDate);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) {
        return 'yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return `on ${lastActive.toLocaleDateString()}`;
      }
    }
  };

  const getGreeting = () => {
    const firstName = userName.split(' ')[0];
    const timeAgo = getTimeAgo();
    
    if (timeAgo === 'just now') {
      return `Welcome back, ${firstName}!`;
    } else {
      return `Welcome back, ${firstName}! You were last here ${timeAgo}.`;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-notification">
      <div className="notification-content">
        <div className="notification-icon">👋</div>
        <div className="notification-text">
          <div className="greeting">{getGreeting()}</div>
          {tasksCount > 0 && (
            <div className="task-info">
              Your {tasksCount} task{tasksCount === 1 ? '' : 's'} {tasksCount === 1 ? 'is' : 'are'} ready for you.
            </div>
          )}
        </div>
        <button 
          className="close-notification"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
});

WelcomeBackNotification.displayName = 'WelcomeBackNotification';

export default WelcomeBackNotification;
