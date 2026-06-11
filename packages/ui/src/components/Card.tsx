import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-surface rounded-lg border border-border-soft hover:shadow-soft transition-shadow p-[20px] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
