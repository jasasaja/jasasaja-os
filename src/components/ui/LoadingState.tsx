import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton-cards' | 'skeleton-list';
  label?: string;
  rows?: number;
  className?: string;
}

export function LoadingState({
  variant = 'spinner',
  label = 'Memuat data ruang kerja...',
  rows = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'skeleton-cards') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}
      >
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-surface p-5 space-y-3 animate-pulse"
          >
            <div className="h-4 w-28 rounded bg-surface-subtle" />
            <div className="h-6 w-3/4 rounded bg-surface-subtle" />
            <div className="h-3.5 w-full rounded bg-surface-subtle" />
            <div className="h-3.5 w-2/3 rounded bg-surface-subtle" />
          </div>
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  if (variant === 'skeleton-list') {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={label}
        className={cn('rounded-xl border border-line bg-surface divide-y divide-line', className)}
      >
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-5 py-3.5 flex items-center justify-between gap-4 animate-pulse">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-4 w-48 max-w-full rounded bg-surface-subtle" />
              <div className="h-3 w-72 max-w-full rounded bg-surface-subtle" />
            </div>
            <div className="h-6 w-20 rounded-md bg-surface-subtle shrink-0" />
          </div>
        ))}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12 rounded-xl border border-line bg-surface',
        className,
      )}
    >
      <Loader2 className="h-6 w-6 text-accent animate-spin mb-3" aria-hidden="true" />
      <p className="text-sm font-medium text-ink-secondary">{label}</p>
    </div>
  );
}
