import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { BreadcrumbItem, RouteId } from '../../types/foundation';

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (routeId: RouteId) => void;
  className?: string;
}

export function Breadcrumb({ items, onNavigate, className }: BreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex items-center gap-1.5 text-sm min-w-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.current;
          const isClickable = Boolean(!isLast && item.routeId && onNavigate);

          return (
            <li key={`${item.label}-${index}`} className="inline-flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-ink-muted shrink-0"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-ink truncate"
                >
                  {item.label}
                </span>
              ) : isClickable && item.routeId ? (
                <button
                  type="button"
                  onClick={() => onNavigate?.(item.routeId!)}
                  className="text-ink-muted hover:text-ink transition-colors truncate cursor-pointer rounded px-1 -mx-1 py-0.5 whitespace-nowrap"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-ink-muted truncate whitespace-nowrap">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
