import React, { useState, useCallback, memo, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  updateProfile, 
  updatePreferences
} from '../store/userSlice';
import AppStorage from '../utils/storage';
import './UserProfile.css';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = memo(({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector(state => state.user);
  
  const [editedProfile, setEditedProfile] = useState({
    name: profile.name,
    email: profile.email,
    avatar: profile.avatar,
    avatarColor: profile.avatarColor,
  });
  
  const [editedPreferences, setEditedPreferences] = useState(profile.preferences);

  const avatarColors = useMemo(() => [
    '#518EA6', '#B4D2D9', '#D9AF8B', 
    '#034159', '#025951', '#02735E',
  ], []);

  const handleProfileChange = useCallback((field: string, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePreferenceChange = useCallback((field: string, value: boolean | string) => {
    setEditedPreferences(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    dispatch(updateProfile(editedProfile));
    dispatch(updatePreferences(editedPreferences));
    onClose();
  }, [dispatch, editedProfile, editedPreferences, onClose]);

  const handleCancel = useCallback(() => {
    setEditedProfile({
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      avatarColor: profile.avatarColor,
    });
    setEditedPreferences(profile.preferences);
    onClose();
  }, [profile, onClose]);

  const generateInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const handleNameChange = useCallback((value: string) => {
    const newInitials = generateInitials(value);
    setEditedProfile(prev => ({ 
      ...prev, 
      name: value, 
      avatar: newInitials 
    }));
  }, [generateInitials]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const memberSince = useMemo(() => formatDate(profile.joinDate), [formatDate, profile.joinDate]);
  const lastActive = useMemo(() => {
    const lastActiveDate = new Date(profile.stats.lastActiveDate);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
      } else {
        return formatDate(profile.stats.lastActiveDate);
      }
    }
  }, [formatDate, profile.stats.lastActiveDate]);

  const handleExportData = useCallback(() => {
    try {
      const dataString = AppStorage.exportAppData();
      const blob = new Blob([dataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert(' Data exported successfully!');
    } catch (error) {
      alert('Failed to export data: ' + error);
    }
  }, []);

  const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataString = e.target?.result as string;
          const success = AppStorage.importAppData(dataString);
          if (success) {
            alert(' Data imported successfully! Please refresh the page.');
          } else {
            alert(' Failed to import data. Please check the file format.');
          }
        } catch (error) {
          alert(' Failed to import data: ' + error);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>User Profile</h2>
          <button 
            className="close-button" 
            onClick={handleCancel}
            aria-label="Close profile modal"
          >
            ✕
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h3>Profile Information</h3>
            
            <div className="avatar-section">
              <div 
                className="avatar-preview"
                style={{ backgroundColor: editedProfile.avatarColor }}
              >
                {editedProfile.avatar}
              </div>
              <div className="avatar-colors">
                {avatarColors.map(color => (
                  <button
                    key={color}
                    className={`color-option ${editedProfile.avatarColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleProfileChange('avatarColor', color)}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={editedProfile.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={editedProfile.email}
                onChange={(e) => handleProfileChange('email', e.target.value)}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="profile-section">
            <h3>Preferences</h3>
            
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={editedPreferences.notifications}
                  onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                />
                <span>Enable notifications</span>
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={editedPreferences.autoSave}
                  onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                />
                <span>Auto-save changes</span>
              </label>
            </div>

            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={editedPreferences.completionSound}
                  onChange={(e) => handlePreferenceChange('completionSound', e.target.checked)}
                />
                <span>Completion sound effects</span>
              </label>
            </div>
          </div>

          <div className="profile-section">
            <h3>Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{profile.stats.totalTasks}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{profile.stats.completedTasks}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{profile.stats.streakDays}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {profile.stats.totalTasks > 0 
                    ? Math.round((profile.stats.completedTasks / profile.stats.totalTasks) * 100)
                    : 0
                  }%
                </span>
                <span className="stat-label">Success Rate</span>
              </div>
            </div>
            
            <div className="profile-meta">
              <p><strong>Member since:</strong> {memberSince}</p>
              <p><strong>Last active:</strong> {lastActive}</p>
            </div>
          </div>

          <div className="profile-section">
            <h3>Data Management</h3>
            <div className="data-actions">
              <button className="export-btn" onClick={handleExportData}>
                📥 Export Data
              </button>
              <label className="import-btn">
                📤 Import Data
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <p className="data-info">
              Export your tasks and profile for backup, or import from a previous backup.
            </p>
          </div>
        </div>

        <div className="profile-actions">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
});

UserProfile.displayName = 'UserProfile';

export default UserProfile;
