import type { ComponentType, FormEvent } from 'react';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  FolderKanban,
  GraduationCap,
  Info,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';
import {
  DEMO_ACTIVITY_ITEMS,
  computeOperationalSummary,
  createSampleActivityPreview,
  filterActivityByWidget,
  getPriorityFocusItem,
  type ActivityItem,
  type ActivityStatusFilter,
  type ActivityWidgetKind,
} from '../../utils/dashboardActivity';
import { PageHeader } from '../layout';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Dialog,
  EmptyState,
  Input,
  SearchInput,
  Select,
  StatusIndicator,
  Tabs,
} from '../ui';
import type { BreadcrumbItem, RouteId } from '../../types/foundation';

export interface DashboardViewProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (routeId: RouteId) => void;
}

const WIDGET_CONFIG: Array<{
  kind: ActivityWidgetKind;
  title: string;
  description: string;
  actionLabel: string;
  Icon: ComponentType<{ className?: string }>;
}> = [
  {
    kind: 'learning',
    title: 'Aktivitas Learning',
    description: 'Contoh · Learning Center',
    actionLabel: 'Buka Learning',
    Icon: GraduationCap,
  },
  {
    kind: 'projects',
    title: 'Milestone Project',
    description: 'Contoh · Project Workspace',
    actionLabel: 'Buka Projects',
    Icon: FolderKanban,
  },
  {
    kind: 'handbook',
    title: 'Pembaruan Handbook',
    description: 'Contoh · Engineering Handbook',
    actionLabel: 'Buka Handbook',
    Icon: BookOpen,
  },
];

export function DashboardView({ breadcrumbs, onNavigate }: DashboardViewProps) {
  const [simulatedEntries, setSimulatedEntries] = useState<ActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatusFilter>('all');

  // Prototype-only Add Sample Activity dialog state
  const [sampleDialogOpen, setSampleDialogOpen] = useState(false);
  const [draftWidget, setDraftWidget] = useState<ActivityWidgetKind>('learning');
  const [draftStatus, setDraftStatus] = useState<'active' | 'pending' | 'warning'>('active');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftMeta, setDraftMeta] = useState('');
  const [draftError, setDraftError] = useState<string | undefined>(undefined);

  const items = useMemo(
    () => [...simulatedEntries, ...DEMO_ACTIVITY_ITEMS],
    [simulatedEntries],
  );
  const summary = useMemo(() => computeOperationalSummary(items), [items]);
  const continueLearningItem = useMemo(
    () => getPriorityFocusItem(items, 'learning'),
    [items],
  );
  const activeProjectItem = useMemo(
    () => getPriorityFocusItem(items, 'projects'),
    [items],
  );
  const handbookFocusItem = useMemo(
    () => getPriorityFocusItem(items, 'handbook'),
    [items],
  );

  const widgetLists = useMemo(
    () => ({
      learning: filterActivityByWidget(items, 'learning', searchQuery, statusFilter),
      projects: filterActivityByWidget(items, 'projects', searchQuery, statusFilter),
      handbook: filterActivityByWidget(items, 'handbook', searchQuery, statusFilter),
    }),
    [items, searchQuery, statusFilter],
  );

  const totalVisible =
    widgetLists.learning.length + widgetLists.projects.length + widgetLists.handbook.length;
  const hasActiveFilters = searchQuery.trim().length > 0 || statusFilter !== 'all';

  const handleOpenSampleDialog = () => {
    setDraftError(undefined);
    setSampleDialogOpen(true);
  };

  const handleAddSampleActivity = (e: FormEvent) => {
    e.preventDefault();
    if (draftTitle.trim().length < 2) {
      setDraftError('Judul aktivitas contoh minimal 2 karakter.');
      return;
    }

    const preview = createSampleActivityPreview({
      widget: draftWidget,
      title: draftTitle,
      meta: draftMeta,
      status: draftStatus,
    });
    setSimulatedEntries((prev) => [preview, ...prev]);
    setDraftTitle('');
    setDraftMeta('');
    setDraftError(undefined);
    setSampleDialogOpen(false);
  };

  const learningOpen = summary.byWidget.learning.active + summary.byWidget.learning.attention;
  const projectsOpen = summary.byWidget.projects.active + summary.byWidget.projects.attention;
  const handbookOpen = summary.byWidget.handbook.active + summary.byWidget.handbook.attention;

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        title="Dashboard"
        description="Pratinjau aktivitas contoh dari Learning Center, Project Workspace, dan Engineering Handbook."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
        className="pb-4 mb-0"
        actions={
          <>
            <Button variant="outline" onClick={() => onNavigate('settings')}>
              Pengaturan Ruang Kerja
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenSampleDialog}
            >
              Tambah Aktivitas Contoh
            </Button>
          </>
        }
      />

      {/* Compact Priority Summary: 1 column on mobile/tablet, 3 columns on desktop */}
      <section aria-labelledby="operational-summary-heading">
        <h2 id="operational-summary-heading" className="sr-only">
          Ringkasan Prioritas Operasional (Data Contoh)
        </h2>
        <div className="rounded-xl border border-line bg-surface shadow-xs grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-line overflow-hidden">
          <button
            type="button"
            onClick={() => onNavigate('learning')}
            className="min-h-[44px] min-w-0 text-left px-3.5 py-2 lg:px-4 lg:py-3 hover:bg-surface-subtle/60 transition-colors cursor-pointer group"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary min-w-0">
                <GraduationCap className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                <span className="truncate">Lanjutkan Learning</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted tabular-nums self-start sm:self-auto">
                <span>
                  {summary.byWidget.learning.active} aktif · {learningOpen} terbuka
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink transition-colors shrink-0"
                  aria-hidden="true"
                />
              </span>
            </div>
            <p className="text-sm font-semibold text-ink truncate mt-1">
              {continueLearningItem ? continueLearningItem.title : 'Semua topik belajar sudah ditinjau'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="min-h-[44px] min-w-0 text-left px-3.5 py-2 lg:px-4 lg:py-3 hover:bg-surface-subtle/60 transition-colors cursor-pointer group"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary min-w-0">
                <FolderKanban className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                <span className="truncate">Project Aktif</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted tabular-nums self-start sm:self-auto">
                <span>
                  {summary.byWidget.projects.active} aktif · {projectsOpen} terbuka
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink transition-colors shrink-0"
                  aria-hidden="true"
                />
              </span>
            </div>
            <p className="text-sm font-semibold text-ink truncate mt-1">
              {activeProjectItem ? activeProjectItem.title : 'Tidak ada milestone proyek terbuka'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('handbook')}
            className="min-h-[44px] min-w-0 text-left px-3.5 py-2 lg:px-4 lg:py-3 hover:bg-surface-subtle/60 transition-colors cursor-pointer group"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary min-w-0">
                <BookOpen className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                <span className="truncate">Pembaruan Handbook</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted tabular-nums self-start sm:self-auto">
                <span>
                  {summary.byWidget.handbook.active} terkini · {handbookOpen} terbuka
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink transition-colors shrink-0"
                  aria-hidden="true"
                />
              </span>
            </div>
            <p className="text-sm font-semibold text-ink truncate mt-1">
              {handbookFocusItem ? handbookFocusItem.title : 'Semua dokumen handbook sudah ditinjau'}
            </p>
          </button>
        </div>
      </section>

      {/* Operational Filter & Sample Status Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
          <div className="w-full sm:max-w-xs">
            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Cari aktivitas contoh..."
              aria-label="Filter aliran aktivitas contoh"
            />
          </div>
          <Tabs
            ariaLabel="Filter item contoh berdasarkan status operasional"
            activeId={statusFilter}
            onChange={(id) => setStatusFilter(id as ActivityStatusFilter)}
            items={[
              { id: 'all', label: 'Semua' },
              { id: 'active', label: 'Aktif' },
              { id: 'attention', label: 'Perlu Perhatian' },
              { id: 'completed', label: 'Selesai' },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-3 gap-y-1 shrink-0">
          <p className={cn(TYPOGRAPHY_CLASSES.supporting, 'font-medium text-ink-muted tabular-nums')}>
            Pratinjau contoh: {totalVisible} dari {items.length} · {summary.activeCount} aktif ·{' '}
            {summary.attentionCount} perlu perhatian · {summary.completedCount} selesai
          </p>
          {(hasActiveFilters || simulatedEntries.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                if (simulatedEntries.length > 0 && !hasActiveFilters) {
                  setSimulatedEntries([]);
                }
              }}
            >
              {hasActiveFilters ? 'Atur Ulang Filter' : 'Hapus Contoh'}
            </Button>
          )}
        </div>
      </div>

      {/* Three Core Aggregated Activity Streams */}
      <section aria-labelledby="core-activity-heading">
        <h2 id="core-activity-heading" className="sr-only">
          Aliran Aktivitas Agregat (Pratinjau Contoh)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {WIDGET_CONFIG.map(({ kind, title, description, actionLabel, Icon }) => {
            const widgetItems = widgetLists[kind];
            const stats = summary.byWidget[kind];
            const openCount = stats.active + stats.attention;

            return (
              <Card key={kind} className="flex flex-col min-w-0">
                <CardHeader>
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="h-9 w-9 rounded-lg bg-surface-subtle border border-line text-ink-secondary inline-flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </div>
                  </div>
                  <span className={cn(TYPOGRAPHY_CLASSES.code, 'text-ink-muted shrink-0')}>
                    {openCount}/{stats.total}
                  </span>
                </CardHeader>

                <CardContent className="p-0 flex-1">
                  {widgetItems.length === 0 ? (
                    <EmptyState
                      title="Tidak ada item contoh yang cocok dengan filter"
                      description="Atur ulang pencarian atau filter status untuk melihat entri contoh dari modul ini."
                      actionLabel="Atur Ulang Filter"
                      onAction={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                      }}
                      className="py-10 border-0 rounded-none bg-transparent"
                    />
                  ) : (
                    <ul className="divide-y divide-line">
                      {widgetItems.map((item) => {
                        const isDone = item.status === 'inactive';

                        return (
                          <li
                            key={item.id}
                            className="px-5 py-3.5 flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  'text-sm font-medium leading-snug',
                                  isDone ? 'text-ink-muted' : 'text-ink',
                                )}
                              >
                                {item.title}
                              </p>
                              <p className={cn(TYPOGRAPHY_CLASSES.supporting, 'text-ink-muted mt-1')}>
                                {item.meta}
                              </p>
                              <div className="mt-1.5">
                                <StatusIndicator
                                  status={item.status}
                                  label={item.statusLabel}
                                  size="sm"
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>

                <CardFooter className="bg-surface-subtle/30">
                  <span className={cn(TYPOGRAPHY_CLASSES.supporting, 'text-ink-muted tabular-nums')}>
                    {openCount === 0
                      ? 'Semua item contoh selesai'
                      : `${stats.active} aktif · ${stats.attention} antrean`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    onClick={() => onNavigate(kind)}
                  >
                    {actionLabel}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Transparent Sample Data & Prototype Simulation Notice */}
      <aside
        aria-label="Pemberitahuan data contoh"
        className="rounded-xl border border-line bg-surface-subtle/60 px-4 py-3 flex items-start gap-3"
      >
        <Info className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" aria-hidden="true" />
        <p className={cn(TYPOGRAPHY_CLASSES.supporting, 'text-ink-secondary leading-relaxed')}>
          <strong className="font-semibold text-ink">Data Contoh/Demo:</strong> Entri yang
          ditampilkan di dashboard ini adalah contoh prototipe, bukan data pengguna yang tersimpan.{' '}
          <strong className="font-medium text-ink">Tambah Aktivitas Contoh</strong> hanya
          mensimulasikan entri pratinjau dalam memori—lesson Learning, dokumen Handbook, dan milestone
          Project yang nyata harus dibuat di modul masing-masing.
        </p>
      </aside>

      <Dialog
        open={sampleDialogOpen}
        onClose={() => setSampleDialogOpen(false)}
        title="Tambah Aktivitas Contoh (Simulasi)"
        description="Mensimulasikan entri contoh sementara di memori untuk melihat tampilan agregat dashboard."
        footer={
          <>
            <Button variant="outline" onClick={() => setSampleDialogOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="sample-activity-form" variant="primary">
              Tambah Entri Contoh
            </Button>
          </>
        }
      >
        <form id="sample-activity-form" onSubmit={handleAddSampleActivity} noValidate className="space-y-4">
          <div
            role="note"
            className="rounded-lg border border-line bg-surface-subtle/70 px-3.5 py-2.5 flex items-start gap-2.5"
          >
            <Info className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" aria-hidden="true" />
            <p className={cn(TYPOGRAPHY_CLASSES.supporting, 'text-ink-secondary leading-relaxed')}>
              Ini adalah simulasi prototipe dan tidak disimpan. Entri ini tidak membuat lesson
              Learning, dokumen Handbook, atau milestone Project yang nyata—pada aplikasi nyata, item
              dibuat di dalam modul masing-masing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Aliran Pratinjau"
              value={draftWidget}
              onChange={(e) => setDraftWidget(e.target.value as ActivityWidgetKind)}
              options={[
                { value: 'learning', label: 'Aktivitas Learning (Contoh)' },
                { value: 'projects', label: 'Milestone Project (Contoh)' },
                { value: 'handbook', label: 'Pembaruan Handbook (Contoh)' },
              ]}
            />

            <Select
              label="Status Contoh"
              value={draftStatus}
              onChange={(e) =>
                setDraftStatus(e.target.value as 'active' | 'pending' | 'warning')
              }
              options={[
                { value: 'active', label: 'Aktif (Contoh)' },
                { value: 'pending', label: 'Antrean (Contoh)' },
                { value: 'warning', label: 'Draft (Contoh)' },
              ]}
            />
          </div>

          <Input
            label="Judul Contoh"
            required
            placeholder="mis., Pratinjau catatan koneksi HTTP/3"
            value={draftTitle}
            onChange={(e) => {
              setDraftTitle(e.target.value);
              if (draftError) setDraftError(undefined);
            }}
            error={draftError}
          />

          <Input
            label="Konteks Contoh"
            placeholder="Opsional (mis., Jalur Systems · pratinjau 15 menit)"
            value={draftMeta}
            onChange={(e) => setDraftMeta(e.target.value)}
          />
        </form>
      </Dialog>
    </div>
  );
}
