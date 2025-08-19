import { ATM_CONFIG, TRANSACTION_TYPES } from './constants';
import { formatDate, formatTime } from './dateUtils';

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = ATM_CONFIG.CURRENCY_SYMBOL) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency}0.00`;
  }
  
  return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Format account number for display
 * @param {string} accountNumber - Account number
 * @param {boolean} masked - Whether to mask the number
 * @returns {string} Formatted account number
 */
export const formatAccountNumber = (accountNumber, masked = true) => {
  if (!accountNumber) return '';
  
  if (masked) {
    const lastFour = accountNumber.slice(-4);
    return `****${lastFour}`;
  }
  
  // Format as groups of 4 digits
  return accountNumber.replace(/\d{4}(?=\d)/g, '$& ');
};

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Format transaction type for display
 * @param {string} type - Transaction type
 * @returns {string} Formatted transaction type
 */
export const getTransactionTitle = (type) => {
  switch (type) {
    case TRANSACTION_TYPES.WITHDRAWAL:
      return 'Withdrawal';
    case TRANSACTION_TYPES.DEPOSIT:
      return 'Deposit';
    case TRANSACTION_TYPES.BALANCE_INQUIRY:
      return 'Balance Inquiry';
    case TRANSACTION_TYPES.TRANSFER:
      return 'Transfer';
    default:
      return 'Transaction';
  }
};

/**
 * Format transaction amount with sign
 * @param {number} amount - Transaction amount
 * @param {string} type - Transaction type
 * @returns {string} Formatted amount with sign
 */
export const formatTransactionAmount = (amount, type) => {
  if (!amount && type !== TRANSACTION_TYPES.BALANCE_INQUIRY) {
    return formatCurrency(0);
  }
  
  if (type === TRANSACTION_TYPES.BALANCE_INQUIRY) {
    return 'N/A';
  }
  
  const sign = type === TRANSACTION_TYPES.DEPOSIT ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(amount))}`;
};

/**
 * Format date and time together
 * @param {string|Date} dateTime - DateTime to format
 * @returns {Object} Formatted date and time
 */
export const formatDateTime = (dateTime) => {
  if (!dateTime) {
    return { date: '', time: '' };
  }
  
  return {
    date: formatDate(dateTime, 'short'),
    time: formatTime(dateTime)
  };
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string
 * @returns {number} Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  const cleaned = currencyString.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Capitalize first letter
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Format name for display
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} Formatted full name
 */
export const formatName = (firstName, lastName) => {
  const first = firstName ? capitalize(firstName.trim()) : '';
  const last = lastName ? capitalize(lastName.trim()) : '';
  
  if (first && last) {
    return `${first} ${last}`;
  } else if (first) {
    return first;
  } else if (last) {
    return last;
  }
  
  return '';
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  
  return parts.join(', ');
};

/**
 * Format duration in minutes to human readable
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 1) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format validation error messages
 * @param {Object} errors - Error object
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return '';
  }
  
  const errorMessages = Object.values(errors).filter(Boolean);
  return errorMessages.join('\n');
};

/**
 * Format search query for highlighting
 * @param {string} text - Text to format
 * @param {string} query - Search query
 * @returns {string} Formatted text with highlights
 */
export const highlightSearchText = (text, query) => {
  if (!text || !query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Remove special characters from string
 * @param {string} str - String to clean
 * @returns {string} Cleaned string
 */
export const removeSpecialChars = (str) => {
  if (!str) return '';
  return str.replace(/[^a-zA-Z0-9\s]/g, '');
};

/**
 * Format PIN for display (masked)
 * @param {string} pin - PIN to format
 * @returns {string} Masked PIN
 */
export const formatPIN = (pin) => {
  if (!pin) return '';
  return '•'.repeat(pin.length);
};

/**
 * Format card expiry date
 * @param {string} month - Month (MM)
 * @param {string} year - Year (YY or YYYY)
 * @returns {string} Formatted expiry date
 */
export const formatCardExpiry = (month, year) => {
  if (!month || !year) return '';
  
  const formattedMonth = month.toString().padStart(2, '0');
  const formattedYear = year.toString().slice(-2);
  
  return `${formattedMonth}/${formattedYear}`;
};

export default {
  formatCurrency,
  formatAccountNumber,
  formatPhoneNumber,
  formatPercentage,
  getTransactionTitle,
  formatTransactionAmount,
  formatDateTime,
  formatFileSize,
  formatNumber,
  parseCurrency,
  capitalize,
  formatName,
  formatAddress,
  formatDuration,
  truncateText,
  formatValidationErrors,
  highlightSearchText,
  removeSpecialChars,
  formatPIN,
  formatCardExpiry,
};