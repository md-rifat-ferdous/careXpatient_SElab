import React from 'react';

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
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
        <label htmlFor={generatedId} className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id={generatedId}
            className="sr-only peer"
            {...props}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          {label && (
            <span className="ml-3 text-sm font-medium text-text">
              {label}
            </span>
          )}
        </label>
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
