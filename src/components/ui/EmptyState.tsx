import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12 rounded-xl border border-dashed border-line-strong bg-surface',
        className,
      )}
    >
      <div
        className="h-11 w-11 rounded-lg bg-surface-subtle border border-line text-ink-secondary flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className={TYPOGRAPHY_CLASSES.cardHeading}>{title}</h3>
      <p className="text-sm text-ink-secondary max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {actionLabel && onAction && (
            <Button variant="primary" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
