import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

/**
 * Validate PIN
 * @param {string} pin - PIN to validate
 * @returns {Object} Validation result
 */
export const validatePIN = (pin) => {
  const errors = [];
  
  if (!pin) {
    errors.push('PIN is required');
    return { isValid: false, errors };
  }
  
  if (pin.length < VALIDATION_RULES.PIN.MIN_LENGTH) {
    errors.push(`PIN must be at least ${VALIDATION_RULES.PIN.MIN_LENGTH} digits`);
  }
  
  if (pin.length > VALIDATION_RULES.PIN.MAX_LENGTH) {
    errors.push(`PIN cannot be more than ${VALIDATION_RULES.PIN.MAX_LENGTH} digits`);
  }
  
  if (!VALIDATION_RULES.PIN.PATTERN.test(pin)) {
    errors.push('PIN must contain only numbers');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate transaction amount
 * @param {string|number} amount - Amount to validate
 * @param {number} availableBalance - Available balance for validation
 * @param {string} transactionType - Type of transaction
 * @returns {Object} Validation result
 */
export const validateTransactionAmount = (amount, availableBalance = 0, transactionType = '') => {
  const errors = [];
  
  if (!amount || amount === '') {
    errors.push('Amount is required');
    return { isValid: false, errors };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    errors.push('Amount must be a valid number');
    return { isValid: false, errors };
  }
  
  if (numAmount < VALIDATION_RULES.AMOUNT.MIN) {
    errors.push(`Minimum amount is $${VALIDATION_RULES.AMOUNT.MIN}`);
  }
  
  if (numAmount > VALIDATION_RULES.AMOUNT.MAX) {
    errors.push(`Maximum amount is $${VALIDATION_RULES.AMOUNT.MAX}`);
  }
  
  // Check decimal places
  const decimalPlaces = (numAmount.toString().split('.')[1] || []).length;
  if (decimalPlaces > VALIDATION_RULES.AMOUNT.DECIMAL_PLACES) {
    errors.push(`Amount can have maximum ${VALIDATION_RULES.AMOUNT.DECIMAL_PLACES} decimal places`);
  }
  
  // Check for withdrawal against balance
  if (transactionType === 'withdrawal' && numAmount > availableBalance) {
    errors.push(ERROR_MESSAGES.INSUFFICIENT_FUNDS);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate account number
 * @param {string} accountNumber - Account number to validate
 * @returns {Object} Validation result
 */
export const validateAccountNumber = (accountNumber) => {
  const errors = [];
  
  if (!accountNumber) {
    errors.push('Account number is required');
    return { isValid: false, errors };
  }
  
  if (accountNumber.length < VALIDATION_RULES.ACCOUNT_NUMBER.MIN_LENGTH) {
    errors.push(`Account number must be at least ${VALIDATION_RULES.ACCOUNT_NUMBER.MIN_LENGTH} digits`);
  }
  
  if (accountNumber.length > VALIDATION_RULES.ACCOUNT_NUMBER.MAX_LENGTH) {
    errors.push(`Account number cannot be more than ${VALIDATION_RULES.ACCOUNT_NUMBER.MAX_LENGTH} digits`);
  }
  
  if (!VALIDATION_RULES.ACCOUNT_NUMBER.PATTERN.test(accountNumber)) {
    errors.push('Account number must contain only numbers');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate event title
 * @param {string} title - Event title to validate
 * @returns {Object} Validation result
 */
export const validateEventTitle = (title) => {
  const errors = [];
  
  if (!title || title.trim() === '') {
    errors.push('Event title is required');
    return { isValid: false, errors };
  }
  
  const trimmedTitle = title.trim();
  
  if (trimmedTitle.length < VALIDATION_RULES.EVENT_TITLE.MIN_LENGTH) {
    errors.push(`Event title must be at least ${VALIDATION_RULES.EVENT_TITLE.MIN_LENGTH} character`);
  }
  
  if (trimmedTitle.length > VALIDATION_RULES.EVENT_TITLE.MAX_LENGTH) {
    errors.push(`Event title cannot be more than ${VALIDATION_RULES.EVENT_TITLE.MAX_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate event description
 * @param {string} description - Event description to validate
 * @returns {Object} Validation result
 */
export const validateEventDescription = (description) => {
  const errors = [];
  
  if (description && description.length > VALIDATION_RULES.EVENT_DESCRIPTION.MAX_LENGTH) {
    errors.push(`Description cannot be more than ${VALIDATION_RULES.EVENT_DESCRIPTION.MAX_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate date
 * @param {string} date - Date string to validate
 * @param {boolean} allowPastDates - Whether to allow past dates
 * @returns {Object} Validation result
 */
export const validateDate = (date, allowPastDates = true) => {
  const errors = [];
  
  if (!date) {
    errors.push('Date is required');
    return { isValid: false, errors };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    errors.push(ERROR_MESSAGES.INVALID_DATE);
    return { isValid: false, errors };
  }
  
  if (!allowPastDates) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateObj < today) {
      errors.push('Date cannot be in the past');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate time
 * @param {string} time - Time string to validate (HH:MM format)
 * @returns {Object} Validation result
 */
export const validateTime = (time) => {
  const errors = [];
  
  if (!time) {
    errors.push('Time is required');
    return { isValid: false, errors };
  }
  
  const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!timePattern.test(time)) {
    errors.push('Please enter time in HH:MM format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {Object} Validation result
 */
export const validateEmail = (email) => {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
    return { isValid: false, errors };
  }
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {Object} Validation result
 */
export const validatePhoneNumber = (phone) => {
  const errors = [];
  
  if (!phone) {
    errors.push('Phone number is required');
    return { isValid: false, errors };
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    errors.push('Phone number must be 10 digits');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} Validation result
 */
export const validateRequired = (value, fieldName = 'Field') => {
  const errors = [];
  
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    errors.push(`${fieldName} is required`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate multiple fields
 * @param {Object} fields - Object with field values and validation rules
 * @returns {Object} Combined validation result
 */
export const validateFields = (fields) => {
  let isValid = true;
  const fieldErrors = {};
  
  Object.keys(fields).forEach(fieldName => {
    const field = fields[fieldName];
    const { value, rules = [] } = field;
    
    let fieldIsValid = true;
    let errors = [];
    
    rules.forEach(rule => {
      const result = rule(value);
      if (!result.isValid) {
        fieldIsValid = false;
        errors = [...errors, ...result.errors];
      }
    });
    
    if (!fieldIsValid) {
      isValid = false;
      fieldErrors[fieldName] = errors;
    }
  });
  
  return {
    isValid,
    errors: fieldErrors
  };
};

/**
 * Check password strength
 * @param {string} password - Password to check
 * @returns {Object} Password strength result
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      level: 'none',
      suggestions: ['Password is required']
    };
  }
  
  let score = 0;
  const suggestions = [];
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    suggestions.push('Use at least 8 characters');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include uppercase letters');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include lowercase letters');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include numbers');
  }
  
  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    suggestions.push('Include special characters');
  }
  
  let level = 'weak';
  if (score >= 4) level = 'strong';
  else if (score >= 2) level = 'medium';
  
  return {
    score,
    level,
    suggestions
  };
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .substring(0, 1000); // Limit length
};

/**
 * Validate form data
 * @param {Object} formData - Form data to validate
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Validation result
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];
    
    rules.forEach(rule => {
      const result = rule(value, formData);
      if (!result.isValid) {
        if (!errors[fieldName]) {
          errors[fieldName] = [];
        }
        errors[fieldName] = [...errors[fieldName], ...result.errors];
        isValid = false;
      }
    });
  });
  
  return {
    isValid,
    errors
  };
};

export default {
  validatePIN,
  validateTransactionAmount,
  validateAccountNumber,
  validateEventTitle,
  validateEventDescription,
  validateDate,
  validateTime,
  validateEmail,
  validatePhoneNumber,
  validateRequired,
  validateFields,
  checkPasswordStrength,
  sanitizeInput,
  validateForm,
};