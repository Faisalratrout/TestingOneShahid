import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  joinDate: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    autoSave: boolean;
    completionSound: boolean;
  };
  stats: {
    totalTasks: number;
    completedTasks: number;
    streakDays: number;
    lastActiveDate: string;
  };
}

interface UserState {
  profile: UserProfile;
  isProfileModalOpen: boolean;
}

const initialState: UserState = {
  profile: {
    id: '1',
    name: 'User',
    email: 'user@example.com',
    avatar: 'U',
    avatarColor: '#667eea',
    joinDate: new Date().toISOString(),
    preferences: {
      theme: 'light',
      notifications: true,
      autoSave: true,
      completionSound: true,
    },
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString(),
    },
  },
  isProfileModalOpen: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserProfile['preferences']>>) => {
      state.profile.preferences = { ...state.profile.preferences, ...action.payload };
    },
    updateStats: (state, action: PayloadAction<Partial<UserProfile['stats']>>) => {
      state.profile.stats = { ...state.profile.stats, ...action.payload };
    },
    incrementTotalTasks: (state) => {
      state.profile.stats.totalTasks += 1;
      state.profile.stats.lastActiveDate = new Date().toISOString();
    },
    incrementCompletedTasks: (state) => {
      state.profile.stats.completedTasks += 1;
      state.profile.stats.lastActiveDate = new Date().toISOString();
    },
    decrementCompletedTasks: (state) => {
      if (state.profile.stats.completedTasks > 0) {
        state.profile.stats.completedTasks -= 1;
      }
    },
    decrementTotalTasks: (state) => {
      if (state.profile.stats.totalTasks > 0) {
        state.profile.stats.totalTasks -= 1;
      }
    },
    updateStreak: (state, action: PayloadAction<number>) => {
      state.profile.stats.streakDays = action.payload;
    },
    openProfileModal: (state) => {
      state.isProfileModalOpen = true;
    },
    closeProfileModal: (state) => {
      state.isProfileModalOpen = false;
    },
    loadUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    resetUserProfile: (state) => {
      state.profile = initialState.profile;
      state.isProfileModalOpen = false;
    },
    initializeUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile.name === 'User' && state.profile.email === 'user@example.com') {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
});

export const {
  updateProfile,
  updatePreferences,
  updateStats,
  incrementTotalTasks,
  incrementCompletedTasks,
  decrementCompletedTasks,
  decrementTotalTasks,
  updateStreak,
  openProfileModal,
  closeProfileModal,
  loadUserProfile,
  resetUserProfile,
  initializeUserProfile,
} = userSlice.actions;

export default userSlice.reducer;
