import * as React from 'react';
import { cn } from '../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Variant determines background/text colors.
   * Accepted values correspond to status badges in the design.
   */
  variant?: 'active' | 'approved' | 'pending' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children, ...props }) => {
  const baseClasses =
    'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium transition-colors';

  const variantClasses = {
    active: 'bg-primary/10 text-primary',
    approved: 'bg-emerald-100 text-emerald-600',
    pending: 'bg-amber-100 text-amber-600',
    default: 'bg-secondary/10 text-on-surface-variant',
  }[variant];

  return (
    <span className={cn(baseClasses, variantClasses, className)} {...props}>
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
