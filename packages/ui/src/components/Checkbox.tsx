import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={generatedId}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-offset-0"
          {...props}
        />
        {label && (
          <label htmlFor={generatedId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
