import React from 'react';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  as?: React.ElementType;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  as,
  className = '',
  ...props
}) => {
  const Component = as || {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    body: 'p',
    caption: 'span',
  }[variant] as React.ElementType;

  const styles = {
    h1: 'text-4xl md:text-5xl font-semibold leading-tight text-text',
    h2: 'text-3xl md:text-4xl font-semibold leading-snug text-text',
    h3: 'text-2xl md:text-3xl font-semibold leading-normal text-text',
    body: 'text-base font-normal leading-relaxed text-text',
    caption: 'text-sm font-normal leading-normal text-text-muted',
  };

  return (
    <Component className={`${styles[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
};
