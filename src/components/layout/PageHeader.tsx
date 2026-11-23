import React from 'react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';
import { Breadcrumb } from './Breadcrumb';
import type { BreadcrumbItem, RouteId } from '../../types/foundation';

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  onNavigate?: (routeId: RouteId) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  onNavigate,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('pb-6 border-b border-line mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          items={breadcrumbs}
          onNavigate={onNavigate}
          className="mb-2.5 lg:hidden"
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className={TYPOGRAPHY_CLASSES.pageTitle}>
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-[15px] text-ink-secondary mt-1.5 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
