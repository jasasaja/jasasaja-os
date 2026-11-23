import React from 'react';
import { cn } from '../../utils/cn';
import type { SemanticTone } from '../../types/foundation';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: SemanticTone;
  size?: 'sm' | 'md';
}

const VARIANT_STYLES: Record<SemanticTone, string> = {
  neutral: 'bg-surface-subtle text-ink-secondary border-line',
  accent: 'bg-accent-soft text-accent-ink border-accent/25',
  success:
    'bg-[var(--status-success-soft)] text-[var(--status-success)] border-[var(--status-success-border)]',
  warning:
    'bg-[var(--status-warning-soft)] text-[var(--status-warning)] border-[var(--status-warning-border)]',
  danger:
    'bg-[var(--status-danger-soft)] text-[var(--status-danger)] border-[var(--status-danger-border)]',
  info: 'bg-[var(--status-info-soft)] text-[var(--status-info)] border-[var(--status-info-border)]',
};

const SIZE_STYLES: Record<'sm' | 'md', string> = {
  sm: 'px-2 py-0.5 text-[13px] leading-snug',
  md: 'px-2.5 py-0.5 text-[13px] leading-normal',
};

export function Badge({
  variant = 'neutral',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md border whitespace-nowrap shrink-0',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
