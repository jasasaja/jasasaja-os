import React from 'react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive';
}

export function Card({ variant = 'default', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-line',
        variant === 'default' && 'bg-surface shadow-xs',
        variant === 'subtle' && 'bg-surface-subtle/70',
        variant === 'interactive' &&
          'bg-surface shadow-xs transition-colors duration-150 hover:border-line-strong',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 py-4 sm:px-6 border-b border-line flex items-start justify-between gap-4', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(TYPOGRAPHY_CLASSES.cardHeading, className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm leading-normal text-ink-secondary mt-0.5', className)} {...props} />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-5 py-3.5 sm:px-6 border-t border-line flex flex-wrap items-center justify-between gap-2.5', className)}
      {...props}
    />
  );
}
