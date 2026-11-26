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
        title="Halaman Tidak Ditemukan"
        description="Jalur yang diminta tidak cocok dengan rute ruang kerja."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
      />

      <section aria-labelledby="not-found-heading">
        <h2 id="not-found-heading" className="sr-only">
          Detail Rute Fallback
        </h2>
        <EmptyState
          icon={<Compass className="h-5 w-5" />}
          title="Rute tidak dikenal"
          description={`Tidak ada modul yang terdaftar di "${pathname}". Kembali ke Dashboard atau buka rute default yang dikonfigurasi (${defaultRoute}).`}
          actionLabel="Ke Dashboard"
          onAction={() => onNavigate('dashboard')}
          secondaryActionLabel="Buka Rute Default"
          onSecondaryAction={onNavigateRoot}
        />
      </section>
    </div>
  );
}
