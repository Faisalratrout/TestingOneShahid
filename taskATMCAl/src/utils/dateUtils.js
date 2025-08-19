import { APP_CONFIG } from './constants';

/**
 * Format date to display format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format string (optional)
 * @returns {string} Formatted date
 */
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options = {};
  
  switch (format) {
    case 'short':
      options.month = 'short';
      options.day = 'numeric';
      options.year = 'numeric';
      break;
    case 'long':
      options.weekday = 'long';
      options.year = 'numeric';
      options.month = 'long';
      options.day = 'numeric';
      break;
    case 'time':
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    case 'datetime':
      options.month = 'short';
      options.day = 'numeric';
      options.year = 'numeric';
      options.hour = '2-digit';
      options.minute = '2-digit';
      break;
    default:
      options.month = 'short';
      options.day = 'numeric';
      options.year = 'numeric';
  }

  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Format time to display format
 * @param {string|Date} date - Date/time to format
 * @param {boolean} use24Hour - Use 24-hour format
 * @returns {string} Formatted time
 */
export const formatTime = (date, use24Hour = false) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: !use24Hour
  };

  return dateObj.toLocaleTimeString('en-US', options);
};

/**
 * Get current date in ISO format
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time
 */
export const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

/**
 * Check if date is today
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Check if date is in the past
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dateObj < today;
};

/**
 * Check if date is in the future
 * @param {string|Date} date - Date to check
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  return dateObj > today;
};

/**
 * Add days to a date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to add
 * @returns {string} New date in ISO format
 */
export const addDays = (date, days) => {
  const dateObj = new Date(date);
  dateObj.setDate(dateObj.getDate() + days);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Subtract days from a date
 * @param {string|Date} date - Base date
 * @param {number} days - Number of days to subtract
 * @returns {string} New date in ISO format
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

/**
 * Get date range
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {Array} Array of dates in the range
 */
export const getDateRange = (startDate, endDate) => {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  while (start <= end) {
    dates.push(start.toISOString().split('T')[0]);
    start.setDate(start.getDate() + 1);
  }
  
  return dates;
};

/**
 * Get month name from date
 * @param {string|Date} date - Date
 * @returns {string} Month name
 */
export const getMonthName = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { month: 'long' });
};

/**
 * Get day name from date
 * @param {string|Date} date - Date
 * @returns {string} Day name
 */
export const getDayName = (date) => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Calculate age from birthdate
 * @param {string|Date} birthDate - Birth date
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get time difference in human readable format
 * @param {string|Date} date - Date to compare
 * @returns {string} Time difference (e.g., "2 hours ago", "in 3 days")
 */
export const getTimeDifference = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (Math.abs(diffSec) < 60) {
    return diffSec < 0 ? 'just now' : 'in a moment';
  } else if (Math.abs(diffMin) < 60) {
    return diffMin < 0 ? `${Math.abs(diffMin)} minutes ago` : `in ${diffMin} minutes`;
  } else if (Math.abs(diffHour) < 24) {
    return diffHour < 0 ? `${Math.abs(diffHour)} hours ago` : `in ${diffHour} hours`;
  } else {
    return diffDay < 0 ? `${Math.abs(diffDay)} days ago` : `in ${diffDay} days`;
  }
};

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string
 * @returns {Date|null} Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Validate date string
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  return parseDate(dateString) !== null;
};

/**
 * Get start of day
 * @param {string|Date} date - Date
 * @returns {Date} Start of day
 */
export const getStartOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get end of day
 * @param {string|Date} date - Date
 * @returns {Date} End of day
 */
export const getEndOfDay = (date) => {
  const dateObj = new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Get calendar month data
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @returns {Object} Calendar data
 */
export const getCalendarMonth = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const weeks = [];
  let currentWeek = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  
  // Add empty cells after the last day if needed
  while (currentWeek.length < 7) {
    currentWeek.push(null);
  }
  weeks.push(currentWeek);
  
  return {
    year,
    month,
    monthName: new Date(year, month).toLocaleDateString('en-US', { month: 'long' }),
    weeks,
    firstDay: firstDay.toISOString().split('T')[0],
    lastDay: lastDay.toISOString().split('T')[0]
  };
};

export default {
  formatDate,
  formatTime,
  getCurrentDate,
  getCurrentTime,
  isToday,
  isPastDate,
  isFutureDate,
  addDays,
  subtractDays,
  getDateRange,
  getMonthName,
  getDayName,
  calculateAge,
  getTimeDifference,
  parseDate,
  isValidDate,
  getStartOfDay,
  getEndOfDay,
  getCalendarMonth,
};