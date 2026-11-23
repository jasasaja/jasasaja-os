import React, { useId, useRef } from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({
  items,
  activeId,
  onChange,
  ariaLabel = 'Section tabs',
  className,
}: TabsProps) {
  const baseId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const enabledItems = items.filter((item) => !item.disabled);
    if (enabledItems.length === 0) return;

    const currentIndex = enabledItems.findIndex((item) => item.id === activeId);
    let nextItem: TabItem | undefined;

    if (event.key === 'ArrowRight') {
      nextItem = enabledItems[(currentIndex + 1) % enabledItems.length];
    } else if (event.key === 'ArrowLeft') {
      nextItem = enabledItems[(currentIndex - 1 + enabledItems.length) % enabledItems.length];
    } else if (event.key === 'Home') {
      nextItem = enabledItems[0];
    } else if (event.key === 'End') {
      nextItem = enabledItems[enabledItems.length - 1];
    }

    if (nextItem) {
      event.preventDefault();
      onChange(nextItem.id);
      const nextButton = listRef.current?.querySelector<HTMLButtonElement>(
        `#${CSS.escape(`${baseId}-tab-${nextItem.id}`)}`,
      );
      nextButton?.focus();
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex max-w-full overflow-x-auto items-center gap-1 p-1 rounded-lg bg-surface-subtle border border-line',
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            id={`${baseId}-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'min-h-9 inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap shrink-0 cursor-pointer',
              'transition-colors duration-150 disabled:opacity-45 disabled:cursor-not-allowed',
              isActive
                ? 'bg-surface text-ink shadow-xs'
                : 'text-ink-secondary hover:text-ink',
            )}
          >
            {item.icon && (
              <span className="shrink-0 inline-flex items-center" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  active: boolean;
}

export function TabPanel({ active, className, children, ...props }: TabPanelProps) {
  if (!active) {
    return null;
  }
  return (
    <div role="tabpanel" className={cn('mt-4', className)} {...props}>
      {children}
    </div>
  );
}
