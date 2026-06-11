import React from 'react';
import { cn } from '../lib/utils';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'caption';
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
    h4: 'h4',
    body: 'p',
    small: 'p',
    caption: 'span',
  }[variant] || 'p';

  const styles = {
    h1: 'text-4xl md:text-5xl font-black font-display tracking-tight leading-tight text-text',
    h2: 'text-3xl md:text-4xl font-black font-display tracking-tight leading-snug text-text',
    h3: 'text-2xl md:text-3xl font-black font-display tracking-tight leading-normal text-text',
    h4: 'text-xl md:text-2xl font-black font-display tracking-tight leading-normal text-text',
    body: 'text-base font-medium leading-relaxed text-text',
    small: 'text-sm font-medium leading-normal text-text',
    caption: 'text-xs font-normal leading-normal text-text-muted',
  };

  return (
    // @ts-ignore
    <Component className={cn(styles[variant], className)} {...props}>
      {children}
    </Component>
  );
};
