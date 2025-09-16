import React from 'react';
import './FormField.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'textarea';
  value: string;
  onChange: (name: string, value: string) => void;
  onBlur: (name: string) => void;
  errors?: string[];
  touched?: boolean;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  autoComplete?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  errors = [],
  touched = false,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  maxLength,
  autoComplete
}) => {
  const hasErrors = touched && errors.length > 0;
  const fieldId = `field-${name}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(name, e.target.value);
  };

  const handleBlur = () => {
    onBlur(name);
  };

  const inputProps = {
    id: fieldId,
    name,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    disabled,
    maxLength,
    autoComplete,
    className: `form-field__input ${hasErrors ? 'form-field__input--error' : ''}`,
    'aria-invalid': hasErrors,
    'aria-describedby': hasErrors ? `${fieldId}-error` : undefined
  };

  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="form-field__label">
        {label}
        {required && <span className="form-field__required" aria-label="required">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          {...inputProps}
          rows={rows}
        />
      ) : (
        <input
          {...inputProps}
          type={type}
        />
      )}
      
      {maxLength && (
        <div className="form-field__char-count">
          {value.length}/{maxLength}
        </div>
      )}
      
      {hasErrors && (
        <div id={`${fieldId}-error`} className="form-field__errors" role="alert">
          {errors.map((error, index) => (
            <span key={index} className="form-field__error">
              {error}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormField;
