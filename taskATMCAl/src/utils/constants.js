// Transaction Types
export const TRANSACTION_TYPES = {
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit',
  BALANCE_INQUIRY: 'balance_inquiry',
  TRANSFER: 'transfer',
};

// Account Types
export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
  CREDIT: 'credit',
};

// Account Status
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
};

// Event Categories
export const EVENT_CATEGORIES = {
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  ATM: 'atm',
  FINANCE: 'finance',
  OTHER: 'other',
};

// Event Priorities
export const EVENT_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: 'atmCalendarApp_userData',
  ACCOUNTS: 'atmCalendarApp_accounts',
  TRANSACTIONS: 'atmCalendarApp_transactions',
  EVENTS: 'atmCalendarApp_events',
  SETTINGS: 'atmCalendarApp_settings',
};

// App Configuration
export const APP_CONFIG = {
  MAX_PIN_ATTEMPTS: 3,
  SESSION_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  AUTO_LOGOUT_TIME: 5 * 60 * 1000, // 5 minutes of inactivity
  MAX_TRANSACTION_AMOUNT: 10000,
  MIN_TRANSACTION_AMOUNT: 1,
  DEFAULT_CURRENCY: 'USD',
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
};

// Validation Rules
export const VALIDATION_RULES = {
  PIN: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 6,
    PATTERN: /^\d+$/,
  },
  ACCOUNT_NUMBER: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 12,
    PATTERN: /^\d+$/,
  },
  AMOUNT: {
    MIN: 1,
    MAX: 10000,
    DECIMAL_PLACES: 2,
  },
  EVENT_TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
  EVENT_DESCRIPTION: {
    MAX_LENGTH: 500,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_PIN: 'Invalid PIN. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction.',
  INVALID_AMOUNT: 'Please enter a valid amount.',
  NETWORK_ERROR: 'Network error. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  INVALID_DATE: 'Please select a valid date.',
  REQUIRED_FIELD: 'This field is required.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_SUCCESS: 'Transaction completed successfully.',
  LOGIN_SUCCESS: 'Welcome back!',
  EVENT_CREATED: 'Event created successfully.',
  EVENT_UPDATED: 'Event updated successfully.',
  EVENT_DELETED: 'Event deleted successfully.',
  DATA_SAVED: 'Data saved successfully.',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
};

// Calendar Configuration
export const CALENDAR_CONFIG = {
  THEME: {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#2196F3',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#2196F3',
    dayTextColor: '#2d4150',
    textDisabledColor: '#d9e1e8',
    dotColor: '#2196F3',
    selectedDotColor: '#ffffff',
    arrowColor: '#2196F3',
    disabledArrowColor: '#d9e1e8',
    monthTextColor: '#2196F3',
    indicatorColor: '#2196F3',
  },
  MARKING_TYPE: 'multi-dot',
  FIRST_DAY: 1, // Monday
};

// ATM Configuration
export const ATM_CONFIG = {
  MAX_WITHDRAWAL_PER_DAY: 5000,
  MAX_DEPOSIT_PER_TRANSACTION: 10000,
  TRANSACTION_FEE: 0, // No fees for demo
  CURRENCY_SYMBOL: '$',
  BALANCE_REFRESH_INTERVAL: 30000, // 30 seconds
};

// Event Colors
export const EVENT_COLORS = {
  [EVENT_CATEGORIES.WORK]: '#2196F3',
  [EVENT_CATEGORIES.PERSONAL]: '#4CAF50',
  [EVENT_CATEGORIES.HEALTH]: '#FF5722',
  [EVENT_CATEGORIES.ATM]: '#f44336',
  [EVENT_CATEGORIES.FINANCE]: '#FF9800',
  [EVENT_CATEGORIES.OTHER]: '#9C27B0',
};

// Priority Colors
export const PRIORITY_COLORS = {
  [EVENT_PRIORITIES.LOW]: '#4CAF50',
  [EVENT_PRIORITIES.MEDIUM]: '#FF9800',
  [EVENT_PRIORITIES.HIGH]: '#FF5722',
  [EVENT_PRIORITIES.URGENT]: '#f44336',
};

// Animation Durations
export const ANIMATION_DURATION = {
  SHORT: 150,
  MEDIUM: 300,
  LONG: 500,
};

// Screen Names
export const SCREEN_NAMES = {
  ATM: 'ATM',
  CALENDAR: 'Calendar',
  HISTORY: 'History',
  ACCOUNTS: 'Accounts',
  SETTINGS: 'Settings',
  LOGIN: 'Login',
  TRANSACTION: 'Transaction',
  EVENT_DETAILS: 'EventDetails',
};

export default {
  TRANSACTION_TYPES,
  ACCOUNT_TYPES,
  ACCOUNT_STATUS,
  EVENT_CATEGORIES,
  EVENT_PRIORITIES,
  NOTIFICATION_TYPES,
  STORAGE_KEYS,
  APP_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CALENDAR_CONFIG,
  ATM_CONFIG,
  EVENT_COLORS,
  PRIORITY_COLORS,
  ANIMATION_DURATION,
  SCREEN_NAMES,
};