import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, type InputProps } from './Input';
import { cn } from '../../utils/cn';

export interface SearchInputProps extends Omit<InputProps, 'type' | 'leftIcon' | 'rightElement'> {
  value: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  shortcutHint?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      onClear,
      shortcutHint,
      placeholder = 'Cari...',
      className,
      'aria-label': ariaLabel = 'Cari',
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onValueChange?.(e.target.value);
    };

    const handleClear = () => {
      onValueChange?.('');
      onClear?.();
    };

    return (
      <Input
        ref={ref}
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={props.label ? undefined : ariaLabel}
        leftIcon={<Search className="h-4 w-4" />}
        className={cn('[&::-webkit-search-cancel-button]:hidden', className)}
        rightElement={
          value ? (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Hapus pencarian"
              className="p-1 rounded-md text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : shortcutHint ? (
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[13px] leading-tight font-mono font-medium text-ink-muted bg-surface-subtle border border-line rounded">
              {shortcutHint}
            </kbd>
          ) : undefined
        }
        {...props}
      />
    );
  },
);

SearchInput.displayName = 'SearchInput';
