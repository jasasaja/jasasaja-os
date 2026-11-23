import { Compass } from 'lucide-react';
import { PageHeader } from '../layout';
import { EmptyState } from '../ui';
import type { BreadcrumbItem, RouteId } from '../../types/foundation';

export interface NotFoundViewProps {
  pathname: string;
  breadcrumbs: BreadcrumbItem[];
  defaultRoute: RouteId;
  onNavigate: (routeId: RouteId) => void;
  onNavigateRoot: () => void;
}

export function NotFoundView({
  pathname,
  breadcrumbs,
  defaultRoute,
  onNavigate,
  onNavigateRoot,
}: NotFoundViewProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Page Not Found"
        description="The requested path does not match a workspace route."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
      />

      <section aria-labelledby="not-found-heading">
        <h2 id="not-found-heading" className="sr-only">
          Route Fallback Details
        </h2>
        <EmptyState
          icon={<Compass className="h-5 w-5" />}
          title="Unknown route"
          description={`No module is registered at "${pathname}". Return to the Dashboard or open your configured default route (${defaultRoute}).`}
          actionLabel="Go to Dashboard"
          onAction={() => onNavigate('dashboard')}
          secondaryActionLabel="Open Default Route"
          onSecondaryAction={onNavigateRoot}
        />
      </section>
    </div>
  );
}
