import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover border border-transparent shadow-xs',
  secondary:
    'bg-surface-subtle text-ink hover:bg-line/70 border border-transparent',
  outline:
    'bg-surface text-ink border border-line-strong hover:bg-surface-subtle',
  ghost:
    'bg-transparent text-ink-secondary hover:text-ink hover:bg-surface-subtle border border-transparent',
  danger:
    'bg-[var(--status-danger)] text-white hover:opacity-90 border border-transparent shadow-xs',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-[13px] leading-normal gap-1.5 rounded-md',
  md: 'min-h-10 px-4 py-2 text-sm leading-normal gap-2 rounded-lg',
  lg: 'min-h-11 px-5 py-2.5 text-sm leading-normal gap-2 rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={cn(
          'inline-flex items-center justify-center font-medium whitespace-nowrap shrink-0',
          'transition-colors duration-150 ease-out cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
        ) : (
          leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span className="shrink-0 inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
