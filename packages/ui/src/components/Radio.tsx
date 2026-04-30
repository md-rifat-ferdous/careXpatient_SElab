import React from 'react';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Radio: React.FC<RadioProps> = ({
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
          type="radio"
          id={generatedId}
          className="w-4 h-4 text-primary border-gray-300 focus:ring-primary focus:ring-offset-0"
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
