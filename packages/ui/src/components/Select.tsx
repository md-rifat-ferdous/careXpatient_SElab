import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
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
      <select
        id={generatedId}
        className={`px-4 py-2 border rounded-xl text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface appearance-none
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'}`}
        {...props}
      >
        <option value="" disabled hidden>
          Select an option
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
