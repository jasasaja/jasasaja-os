import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, MinusCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { StatusKind } from '../../types/foundation';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusKind;
  label: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  StatusKind,
  {
    colorClass: string;
    Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  }
> = {
  active: {
    colorClass: 'text-[var(--status-success)]',
    Icon: CheckCircle2,
  },
  pending: {
    colorClass: 'text-[var(--status-info)]',
    Icon: Clock,
  },
  warning: {
    colorClass: 'text-[var(--status-warning)]',
    Icon: AlertTriangle,
  },
  error: {
    colorClass: 'text-[var(--status-danger)]',
    Icon: AlertCircle,
  },
  inactive: {
    colorClass: 'text-ink-muted',
    Icon: MinusCircle,
  },
};

export function StatusIndicator({
  status,
  label,
  size = 'md',
  className,
  ...props
}: StatusIndicatorProps) {
  const { colorClass, Icon } = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium whitespace-nowrap shrink-0 leading-normal',
        size === 'sm' ? 'text-[13px]' : 'text-sm',
        className,
      )}
      {...props}
    >
      <Icon
        className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4', colorClass, 'shrink-0')}
        aria-hidden={true}
      />
      <span className="text-ink-secondary">{label}</span>
    </span>
  );
}
