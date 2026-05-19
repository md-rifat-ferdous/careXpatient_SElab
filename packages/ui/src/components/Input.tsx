import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const generatedId = id || Math.random().toString(36).substr(2, 9);
  
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={generatedId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <input
        id={generatedId}
        className={`px-4 py-2 border rounded text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
          ${error ? 'border-alert-critical focus:ring-alert-critical/20 focus:border-alert-critical' : 'border-border-soft hover:border-gray-300'}`}
        {...props}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
