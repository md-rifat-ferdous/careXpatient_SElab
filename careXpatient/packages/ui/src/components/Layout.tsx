import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  fluid?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  fluid = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${fluid ? 'w-full' : 'max-w-7xl'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({
  children,
  spacing = 'md',
  className = '',
  ...props
}) => {
  const spacings = {
    none: 'py-0',
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-20',
    lg: 'py-20 md:py-32',
    xl: 'py-32 md:py-48',
  };

  return (
    <section className={`${spacings[spacing]} ${className}`} {...props}>
      {children}
    </section>
  );
};
