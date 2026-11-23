import React, { useId } from 'react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightElement, id, required, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-ink flex items-center gap-1"
          >
            <span>{label}</span>
            {required && (
              <span className="text-[var(--status-danger)]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className="pointer-events-none absolute left-3 text-ink-muted inline-flex items-center"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full min-h-10 rounded-lg bg-surface text-sm text-ink placeholder:text-ink-muted',
              'border transition-colors duration-150',
              error
                ? 'border-[var(--status-danger)] focus-visible:outline-[var(--status-danger)]'
                : 'border-line-strong hover:border-ink-muted focus-visible:border-accent',
              leftIcon ? 'pl-9' : 'px-3',
              rightElement ? 'pr-9' : 'pr-3',
              'py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-subtle',
              className,
            )}
            {...props}
          />

          {rightElement && (
            <span className="absolute right-2.5 inline-flex items-center">
              {rightElement}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} className={cn(TYPOGRAPHY_CLASSES.supporting, 'font-medium text-[var(--status-danger)]')} role="alert">
            {error}
          </p>
        )}
        {!error && hint && (
          <p id={hintId} className={cn(TYPOGRAPHY_CLASSES.supporting, 'text-ink-muted')}>
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
