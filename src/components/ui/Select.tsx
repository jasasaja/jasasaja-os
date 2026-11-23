import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, placeholder, id, required, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            className={cn(
              'w-full min-h-10 appearance-none rounded-lg bg-surface text-sm text-ink',
              'pl-3 pr-9 py-2 border transition-colors duration-150 cursor-pointer',
              error
                ? 'border-[var(--status-danger)] focus-visible:outline-[var(--status-danger)]'
                : 'border-line-strong hover:border-ink-muted focus-visible:border-accent',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-subtle',
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <ChevronDown
            className="pointer-events-none absolute right-3 h-4 w-4 text-ink-muted"
            aria-hidden="true"
          />
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

Select.displayName = 'Select';
