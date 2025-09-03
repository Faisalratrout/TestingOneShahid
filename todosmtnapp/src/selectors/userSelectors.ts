import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectUserState = (state: RootState) => state.user;

export const selectUserProfile = createSelector(
  [selectUserState],
  (userState) => userState.profile
);

export const selectUserPreferences = createSelector(
  [selectUserProfile],
  (profile) => profile.preferences
);

export const selectUserStats = createSelector(
  [selectUserProfile],
  (profile) => profile.stats
);

export const selectIsProfileModalOpen = createSelector(
  [selectUserState],
  (userState) => userState.isProfileModalOpen
);

export const selectUserDisplayInfo = createSelector(
  [selectUserProfile],
  (profile) => ({
    name: profile.name,
    avatar: profile.avatar,
    avatarColor: profile.avatarColor,
    greeting: `Welcome back, ${profile.name.split(' ')[0]}!`
  })
);

export const selectUserCompletionRate = createSelector(
  [selectUserStats],
  (stats) => stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0
);

export const selectUserAchievements = createSelector(
  [selectUserStats],
  (stats) => ({
    isNewbie: stats.totalTasks === 0,
    isGettingStarted: stats.totalTasks > 0 && stats.totalTasks < 5,
    isRegular: stats.totalTasks >= 5 && stats.totalTasks < 25,
    isPowerUser: stats.totalTasks >= 25 && stats.totalTasks < 100,
    isExpert: stats.totalTasks >= 100,
    hasStreak: stats.streakDays > 0,
    isOnFire: stats.streakDays >= 7,
    isPerfectionist: stats.completedTasks === stats.totalTasks && stats.totalTasks > 0,
  })
);

export { selectUserState };
