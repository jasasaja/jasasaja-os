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
    title: 'Learning Activity',
    description: 'Sample · Learning Center',
    actionLabel: 'Open Learning',
    Icon: GraduationCap,
  },
  {
    kind: 'projects',
    title: 'Project Milestones',
    description: 'Sample · Project Workspace',
    actionLabel: 'Open Projects',
    Icon: FolderKanban,
  },
  {
    kind: 'handbook',
    title: 'Handbook Updates',
    description: 'Sample · Engineering Handbook',
    actionLabel: 'Open Handbook',
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
      setDraftError('Sample activity title must be at least 2 characters.');
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
        description="Sample activity preview aggregated from Learning Center, Project Workspace, and Engineering Handbook."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
        className="pb-4 mb-0"
        actions={
          <>
            <Button variant="outline" onClick={() => onNavigate('settings')}>
              Workspace Settings
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleOpenSampleDialog}
            >
              Add Sample Activity
            </Button>
          </>
        }
      />

      {/* Compact Priority Summary: 1 column on mobile/tablet, 3 columns on desktop */}
      <section aria-labelledby="operational-summary-heading">
        <h2 id="operational-summary-heading" className="sr-only">
          Priority Operational Summary (Sample Data)
        </h2>
        <div className="rounded-xl border border-line bg-surface shadow-xs grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-line overflow-hidden">
          <button
            type="button"
            onClick={() => onNavigate('learning')}
            className="min-h-[44px] min-w-0 text-left px-3.5 py-2 lg:px-4 lg:py-3 hover:bg-surface-subtle/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary min-w-0">
                <GraduationCap className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                <span className="truncate">Continue Learning</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted tabular-nums shrink-0">
                <span>
                  {summary.byWidget.learning.active} active · {learningOpen} open
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink transition-colors shrink-0"
                  aria-hidden="true"
                />
              </span>
            </div>
            <p className="text-sm font-semibold text-ink truncate mt-0.5 lg:mt-1">
              {continueLearningItem ? continueLearningItem.title : 'All study topics reviewed'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('projects')}
            className="min-h-[44px] min-w-0 text-left px-3.5 py-2 lg:px-4 lg:py-3 hover:bg-surface-subtle/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary min-w-0">
                <FolderKanban className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                <span className="truncate">Active Projects</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted tabular-nums shrink-0">
                <span>
                  {summary.byWidget.projects.active} active · {projectsOpen} open
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink transition-colors shrink-0"
                  aria-hidden="true"
                />
              </span>
            </div>
            <p className="text-sm font-semibold text-ink truncate mt-0.5 lg:mt-1">
              {activeProjectItem ? activeProjectItem.title : 'No open project milestones'}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('handbook')}
            className="min-h-[44px] min-w-0 text-left px-3.5 py-2 lg:px-4 lg:py-3 hover:bg-surface-subtle/60 transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-secondary min-w-0">
                <BookOpen className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                <span className="truncate">Handbook Updates</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted tabular-nums shrink-0">
                <span>
                  {summary.byWidget.handbook.active} current · {handbookOpen} open
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 text-ink-muted group-hover:text-ink transition-colors shrink-0"
                  aria-hidden="true"
                />
              </span>
            </div>
            <p className="hidden lg:block text-sm font-semibold text-ink truncate mt-1">
              {handbookFocusItem ? handbookFocusItem.title : 'All handbook docs reviewed'}
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
              placeholder="Search sample activity..."
              aria-label="Filter sample activity streams"
            />
          </div>
          <Tabs
            ariaLabel="Filter sample items by operational status"
            activeId={statusFilter}
            onChange={(id) => setStatusFilter(id as ActivityStatusFilter)}
            items={[
              { id: 'all', label: 'All' },
              { id: 'active', label: 'Active' },
              { id: 'attention', label: 'Attention' },
              { id: 'completed', label: 'Done' },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-3 gap-y-1 shrink-0">
          <p className={cn(TYPOGRAPHY_CLASSES.supporting, 'font-medium text-ink-muted tabular-nums')}>
            Sample preview: {totalVisible} of {items.length} · {summary.activeCount} active ·{' '}
            {summary.attentionCount} attention · {summary.completedCount} done
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
              {hasActiveFilters ? 'Reset Filters' : 'Reset Samples'}
            </Button>
          )}
        </div>
      </div>

      {/* Three Core Aggregated Activity Streams */}
      <section aria-labelledby="core-activity-heading">
        <h2 id="core-activity-heading" className="sr-only">
          Core Aggregated Activity Streams (Sample Preview)
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
                      title="No sample items match current filters"
                      description="Reset search or status filters to view the sample entries from this module."
                      actionLabel="Reset Filters"
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
                      ? 'All sample items completed'
                      : `${stats.active} active · ${stats.attention} queued`}
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
        aria-label="Sample data notice"
        className="rounded-xl border border-line bg-surface-subtle/60 px-4 py-3 flex items-start gap-3"
      >
        <Info className="h-4 w-4 text-ink-muted shrink-0 mt-0.5" aria-hidden="true" />
        <p className={cn(TYPOGRAPHY_CLASSES.supporting, 'text-ink-secondary leading-relaxed')}>
          <strong className="font-semibold text-ink">Sample / Demo Data:</strong> Entries shown on
          this dashboard are prototype samples, not saved user records.{' '}
          <strong className="font-medium text-ink">Add Sample Activity</strong> only simulates an
          in-memory preview entry—real Learning lessons, Handbook documents, and Project milestones
          must be created in their owning modules.
        </p>
      </aside>

      <Dialog
        open={sampleDialogOpen}
        onClose={() => setSampleDialogOpen(false)}
        title="Add Sample Activity (Simulation)"
        description="Simulates a temporary sample entry in memory to preview how dashboard aggregation renders."
        footer={
          <>
            <Button variant="outline" onClick={() => setSampleDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="sample-activity-form" variant="primary">
              Add Sample Entry
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
              This is a prototype simulation and is not saved. It does not create a real Learning
              lesson, Handbook document, or Project milestone—in the actual app, items are created
              inside their owning modules.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Preview Stream"
              value={draftWidget}
              onChange={(e) => setDraftWidget(e.target.value as ActivityWidgetKind)}
              options={[
                { value: 'learning', label: 'Learning Activity (Sample)' },
                { value: 'projects', label: 'Project Milestones (Sample)' },
                { value: 'handbook', label: 'Handbook Updates (Sample)' },
              ]}
            />

            <Select
              label="Sample Status"
              value={draftStatus}
              onChange={(e) =>
                setDraftStatus(e.target.value as 'active' | 'pending' | 'warning')
              }
              options={[
                { value: 'active', label: 'Active (Sample)' },
                { value: 'pending', label: 'Queued (Sample)' },
                { value: 'warning', label: 'Draft (Sample)' },
              ]}
            />
          </div>

          <Input
            label="Sample Title"
            required
            placeholder="e.g., Preview HTTP/3 connection notes"
            value={draftTitle}
            onChange={(e) => {
              setDraftTitle(e.target.value);
              if (draftError) setDraftError(undefined);
            }}
            error={draftError}
          />

          <Input
            label="Sample Context"
            placeholder="Optional (e.g., Systems Track · 15 min preview)"
            value={draftMeta}
            onChange={(e) => setDraftMeta(e.target.value)}
          />
        </form>
      </Dialog>
    </div>
  );
}
