import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Unable to load content',
  message,
  onRetry,
  retryLabel = 'Try Again',
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center text-center px-6 py-12 rounded-xl border border-[var(--status-danger-border)] bg-surface',
        className,
      )}
    >
      <div
        className="h-11 w-11 rounded-lg bg-[var(--status-danger-soft)] text-[var(--status-danger)] flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className={TYPOGRAPHY_CLASSES.cardHeading}>{title}</h3>
      <p className="text-sm text-ink-secondary max-w-md mt-1.5 leading-relaxed">
        {message}
      </p>
      {(onRetry || (secondaryActionLabel && onSecondaryAction)) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
          {onRetry && (
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="ghost" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
