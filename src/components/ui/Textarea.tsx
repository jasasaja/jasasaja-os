import React, { useId } from 'react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  showCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      hint,
      error,
      showCount = false,
      maxLength,
      value,
      id,
      required,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hintId = hint ? `${textareaId}-hint` : undefined;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor={textareaId}
              className="text-sm font-medium text-ink flex items-center gap-1"
            >
              <span>{label}</span>
              {required && (
                <span className="text-[var(--status-danger)]" aria-hidden="true">
                  *
                </span>
              )}
            </label>
            {showCount && maxLength !== undefined && (
              <span className={cn(TYPOGRAPHY_CLASSES.code, 'text-ink-muted')}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-lg bg-surface text-sm text-ink placeholder:text-ink-muted',
            'px-3 py-2.5 border transition-colors duration-150 resize-y min-h-[88px]',
            error
              ? 'border-[var(--status-danger)] focus-visible:outline-[var(--status-danger)]'
              : 'border-line-strong hover:border-ink-muted focus-visible:border-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-subtle',
            className,
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
