import React, { useEffect, useId, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export interface DropdownEntry {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  dividerBefore?: boolean;
}

export interface DropdownProps {
  trigger: (props: {
    open: boolean;
    onClick: () => void;
    'aria-expanded': boolean;
    'aria-haspopup': 'menu';
    'aria-controls': string;
  }) => React.ReactNode;
  items: DropdownEntry[];
  align?: 'left' | 'right';
  label?: string;
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  label,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)') ?? [],
    );
    if (buttons.length === 0) return;

    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      buttons[(currentIndex + 1) % buttons.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      buttons[(currentIndex - 1 + buttons.length) % buttons.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      buttons[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      {trigger({
        open,
        onClick: () => setOpen((prev) => !prev),
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        'aria-controls': menuId,
      })}

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label ?? 'Menu aksi'}
          onKeyDown={handleMenuKeyDown}
          className={cn(
            'absolute z-40 mt-1.5 min-w-52 rounded-xl bg-surface-elevated border border-line shadow-overlay p-1.5',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {label && (
            <div className="px-2.5 py-1.5 text-[13px] leading-normal font-medium text-ink-muted border-b border-line mb-1">
              {label}
            </div>
          )}
          {items.map((item) => (
            <React.Fragment key={item.id}>
              {item.dividerBefore && <div className="my-1 border-t border-line" role="separator" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg text-left transition-colors cursor-pointer whitespace-nowrap',
                  'disabled:opacity-45 disabled:cursor-not-allowed',
                  item.danger
                    ? 'text-[var(--status-danger)] hover:bg-[var(--status-danger-soft)]'
                    : 'text-ink hover:bg-surface-subtle',
                )}
              >
                {item.icon && (
                  <span className="shrink-0 inline-flex items-center text-current opacity-80">
                    {item.icon}
                  </span>
                )}
                <span className="truncate">{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
