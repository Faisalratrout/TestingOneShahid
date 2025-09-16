
import { useState } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export const validateField = (value: any, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];

  // Required validation
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: true, errors: [] };
  }

  const stringValue = String(value).trim();

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`Must be at least ${rules.minLength} characters long`);
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`Must be no more than ${rules.maxLength} characters long`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push('Invalid format');
  }

  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !value.includes('@')) {
        return 'Email must contain @ symbol';
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 6,
    custom: (value: string) => {
      if (value && value.length >= 6) {
        const hasNumber = /\d/.test(value);
        const hasLetter = /[a-zA-Z]/.test(value);
        if (!hasNumber || !hasLetter) {
          return 'Password must contain both letters and numbers';
        }
      }
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    custom: (value: string) => {
      if (value && value.trim().length < 2) {
        return 'Name must contain at least 2 characters';
      }
      return null;
    }
  },
  phone: {
    pattern: /^\+?[\d\s\-()]+$/,
    minLength: 10,
    custom: (value: string) => {
      if (value) {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10) {
          return 'Phone number must have at least 10 digits';
        }
      }
      return null;
    }
  },
  address: {
    required: true,
    minLength: 10,
    maxLength: 200
  },
  cardNumber: {
    required: true,
    pattern: /^\d{16}$/,
    custom: (value: string) => {
      if (value && value.replace(/\s/g, '').length !== 16) {
        return 'Card number must be 16 digits';
      }
      return null;
    }
  },
  cvv: {
    required: true,
    pattern: /^\d{3,4}$/,
    custom: (value: string) => {
      if (value && (value.length < 3 || value.length > 4)) {
        return 'CVV must be 3 or 4 digits';
      }
      return null;
    }
  },
  expiryDate: {
    required: true,
    pattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
    custom: (value: string) => {
      if (value && value.includes('/')) {
        const [month, year] = value.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          return 'Card has expired';
        }
      }
      return null;
    }
  },
  price: {
    required: true,
    pattern: /^\d+(\.\d{1,2})?$/,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'Price must be a positive number';
      }
      if (num > 999999) {
        return 'Price is too high';
      }
      return null;
    }
  },
  quantity: {
    required: true,
    pattern: /^\d+$/,
    custom: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num <= 0) {
        return 'Quantity must be a positive number';
      }
      if (num > 1000) {
        return 'Quantity is too high';
      }
      return null;
    }
  }
};

// Validate multiple fields
export const validateForm = (formData: Record<string, any>, rules: Record<string, ValidationRule>): { isValid: boolean; errors: Record<string, string[]> } => {
  const errors: Record<string, string[]> = {};
  let isValid = true;

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const result = validateField(formData[fieldName], fieldRules);
    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }
  }

  return { isValid, errors };
};

export const useFormValidation = (initialData: Record<string, any>, rules: Record<string, ValidationRule>) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateSingleField = (fieldName: string, value: any) => {
    if (rules[fieldName]) {
      const result = validateField(value, rules[fieldName]);
      setErrors(prev => ({
        ...prev,
        [fieldName]: result.errors
      }));
      return result.isValid;
    }
    return true;
  };

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    if (touched[fieldName]) {
      validateSingleField(fieldName, value);
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    validateSingleField(fieldName, formData[fieldName]);
  };

  const validateAllFields = () => {
    const result = validateForm(formData, rules);
    setErrors(result.errors);
    
    const allTouched = Object.keys(rules).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    return result.isValid;
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
    setTouched({});
  };

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAllFields,
    resetForm,
    isFieldValid: (fieldName: string) => !errors[fieldName] || errors[fieldName].length === 0,
    hasErrors: Object.keys(errors).some(key => errors[key].length > 0)
  };
};
