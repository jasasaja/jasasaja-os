import React, { useState } from 'react';
import { ArrowLeft, BookOpen, FolderKanban } from 'lucide-react';
import { PageHeader } from '../layout';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  LoadingState,
  StatusIndicator,
  TabPanel,
  Tabs,
} from '../ui';
import type { BreadcrumbItem, RouteId } from '../../types/foundation';

export interface ModuleScaffoldViewProps {
  routeId: 'handbook' | 'projects';
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (routeId: RouteId) => void;
}

const MODULE_META: Record<
  'handbook' | 'projects',
  {
    title: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
    plannedCapabilities: string[];
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  handbook: {
    title: 'Handbook',
    description:
      'Fondasi untuk panduan engineering pribadi, keputusan arsitektur, dan standar kerja.',
    Icon: BookOpen,
    plannedCapabilities: [
      'Indeks panduan engineering dan architecture decision record',
      'Pencarian sisi klien yang cepat pada artikel referensi pribadi',
      'Checklist reusable untuk system design dan code review',
    ],
    emptyTitle: 'Modul Handbook belum diaktifkan',
    emptyDescription:
      'Navigasi, breadcrumb, tipografi, serta primitive keadaan kosong dan memuat sudah siap menjadi fondasi Handbook.',
  },
  projects: {
    title: 'Projects',
    description:
      'Fondasi untuk proyek aktif, milestone, dan spesifikasi teknis.',
    Icon: FolderKanban,
    plannedCapabilities: [
      'Pemilih workspace proyek dengan pelacakan milestone dan status',
      'Draf spesifikasi yang terhubung ke standar Handbook',
      'Filter task, pencarian, dan alur konfirmasi',
    ],
    emptyTitle: 'Modul Project Workspace belum diaktifkan',
    emptyDescription:
      'Seluruh kontainer tata letak, kartu, dialog, dan breakpoint responsif sudah diverifikasi dan siap untuk tampilan Project Workspace.',
  },
};

export function ModuleScaffoldView({
  routeId,
  breadcrumbs,
  onNavigate,
}: ModuleScaffoldViewProps) {
  const [previewTab, setPreviewTab] = useState<'overview' | 'empty' | 'loading'>('overview');
  const meta = MODULE_META[routeId];
  const Icon = meta.Icon;

  return (
    <div className="space-y-6">
      <PageHeader
        title={meta.title}
        description={meta.description}
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
        actions={
          <Button
            variant="outline"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => onNavigate('dashboard')}
          >
            Kembali ke Dashboard
          </Button>
        }
      />

      <section aria-labelledby="module-scaffold-heading" className="space-y-6">
        <h2 id="module-scaffold-heading" className="sr-only">
          Workspace Fondasi {meta.title}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StatusIndicator status="pending" label="Fondasi Siap" />

        <Tabs
          ariaLabel={`${meta.title} scaffold preview modes`}
          activeId={previewTab}
          onChange={(id) => setPreviewTab(id as 'overview' | 'empty' | 'loading')}
          items={[
            { id: 'overview', label: 'Cakupan Modul' },
            { id: 'empty', label: 'Keadaan Kosong' },
            { id: 'loading', label: 'Keadaan Memuat' },
          ]}
        />
      </div>

      <TabPanel active={previewTab === 'overview'}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-lg bg-accent-soft text-accent-ink border border-accent/20 inline-flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>{meta.title} Workspace Container</CardTitle>
                <CardDescription>
                  Dibangun di atas shell, breadcrumb, dan primitive surface bersama.
                </CardDescription>
              </div>
            </div>
            <Badge variant="info">Target Fase 2</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-ink-secondary leading-relaxed">
              Tampilan ini menyediakan rute utama dan geometri tata letak untuk modul {meta.title} sambil menjaga logika bisnis tetap terpisah hingga sprint pengembangan modul masing-masing.
            </p>
            <div className="pt-2 border-t border-line">
              <p className="text-[13px] leading-normal font-medium text-ink-muted mb-2.5">Kapabilitas Terencana</p>
              <ul className="space-y-2 text-sm text-ink">
                {meta.plannedCapabilities.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-ink-muted select-none" aria-hidden="true">
                      ·
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel active={previewTab === 'empty'}>
        <EmptyState
          icon={<Icon className="h-5 w-5" />}
          title={meta.emptyTitle}
          description={meta.emptyDescription}
          actionLabel="Kembali ke Fondasi"
          onAction={() => onNavigate('dashboard')}
          secondaryActionLabel="Buka Pengaturan"
          onSecondaryAction={() => onNavigate('settings')}
        />
      </TabPanel>

      <TabPanel active={previewTab === 'loading'}>
        <LoadingState
          variant="skeleton-list"
          label={`Memuat workspace ${meta.title}...`}
          rows={4}
        />
      </TabPanel>
      </section>
    </div>
  );
}
