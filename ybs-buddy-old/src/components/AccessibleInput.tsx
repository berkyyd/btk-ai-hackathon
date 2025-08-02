import React from 'react';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  helperText,
  required = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ');
  
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  const stateClasses = error 
    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500';
  const widthClass = fullWidth ? 'w-full' : '';
  
  const classes = `${baseClasses} ${stateClasses} ${widthClass} ${className}`;
  
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="gerekli">*</span>}
      </label>
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400" aria-hidden="true">
              {leftIcon}
            </span>
          </div>
        )}
        
        <input
          id={inputId}
          className={`${classes} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy || undefined}
          required={required}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400" aria-hidden="true">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p
          id={helperId}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default AccessibleInput; 