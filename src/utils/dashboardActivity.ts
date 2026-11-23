import type { StatusKind } from '../types/foundation';

export type ActivityWidgetKind = 'learning' | 'handbook' | 'projects';

export type ActivityStatusFilter = 'all' | 'active' | 'attention' | 'completed';

export type SourceDomainModule =
  | 'Learning Center'
  | 'Engineering Handbook'
  | 'Project Workspace';

export interface ActivityItem {
  id: string;
  widget: ActivityWidgetKind;
  sourceModule: SourceDomainModule;
  title: string;
  meta: string;
  status: StatusKind;
  statusLabel: string;
  isSample: true;
}

export interface WidgetOperationalStats {
  total: number;
  active: number;
  attention: number;
  completed: number;
}

export interface OperationalSummary {
  total: number;
  activeCount: number;
  attentionCount: number;
  completedCount: number;
  byWidget: Record<ActivityWidgetKind, WidgetOperationalStats>;
}

/**
 * Foundation sample/demo preview items representing future aggregated records
 * from Learning Center, Engineering Handbook, and Project Workspace.
 * Not persisted user data and not backed by a separate dashboard database.
 */
export const DEMO_ACTIVITY_ITEMS: readonly ActivityItem[] = [
  // Sample entries from Learning Center
  {
    id: 'learn-1',
    widget: 'learning',
    sourceModule: 'Learning Center',
    title: 'Distributed Consensus & Raft Log Replication',
    meta: 'Systems Track · 25 min review',
    status: 'active',
    statusLabel: 'In Progress',
    isSample: true,
  },
  {
    id: 'learn-2',
    widget: 'learning',
    sourceModule: 'Learning Center',
    title: 'PostgreSQL MVCC & Index Scan Internals',
    meta: 'Database Track · Due today',
    status: 'pending',
    statusLabel: 'Queued',
    isSample: true,
  },
  {
    id: 'learn-3',
    widget: 'learning',
    sourceModule: 'Learning Center',
    title: 'TypeScript Variance & Conditional Inference',
    meta: 'Language Track · Completed',
    status: 'inactive',
    statusLabel: 'Reviewed',
    isSample: true,
  },

  // Sample entries from Engineering Handbook
  {
    id: 'doc-1',
    widget: 'handbook',
    sourceModule: 'Engineering Handbook',
    title: 'ADR-014: Shared UI Component Boundaries',
    meta: 'Architecture · Updated today',
    status: 'active',
    statusLabel: 'Current',
    isSample: true,
  },
  {
    id: 'doc-2',
    widget: 'handbook',
    sourceModule: 'Engineering Handbook',
    title: 'Frontend Accessibility & Focus Checklist',
    meta: 'Standards · Verified',
    status: 'active',
    statusLabel: 'Current',
    isSample: true,
  },
  {
    id: 'doc-3',
    widget: 'handbook',
    sourceModule: 'Engineering Handbook',
    title: 'Incident Postmortem Template v2',
    meta: 'Operations · Needs review',
    status: 'warning',
    statusLabel: 'Draft',
    isSample: true,
  },

  // Sample entries from Project Workspace
  {
    id: 'proj-1',
    widget: 'projects',
    sourceModule: 'Project Workspace',
    title: 'JASASAJA Personal OS — Shell & Tokens',
    meta: 'Milestone 1 · Core Foundation',
    status: 'active',
    statusLabel: 'Active',
    isSample: true,
  },
  {
    id: 'proj-2',
    widget: 'projects',
    sourceModule: 'Project Workspace',
    title: 'Learning Center Curriculum Schema',
    meta: 'Milestone 2 · Next sprint',
    status: 'pending',
    statusLabel: 'Planned',
    isSample: true,
  },
  {
    id: 'proj-3',
    widget: 'projects',
    sourceModule: 'Project Workspace',
    title: 'Handbook Markdown Indexing Pipeline',
    meta: 'Milestone 3 · Backlog',
    status: 'inactive',
    statusLabel: 'Backlog',
    isSample: true,
  },
];

export function matchesStatusFilter(
  status: StatusKind,
  filter: ActivityStatusFilter,
): boolean {
  switch (filter) {
    case 'all':
      return true;
    case 'active':
      return status === 'active';
    case 'attention':
      return status === 'pending' || status === 'warning';
    case 'completed':
      return status === 'inactive';
  }
}

export function filterActivityByWidget(
  items: readonly ActivityItem[],
  widget: ActivityWidgetKind,
  query: string,
  statusFilter: ActivityStatusFilter = 'all',
): ActivityItem[] {
  const normalized = query.trim().toLowerCase();
  return items.filter((item) => {
    if (item.widget !== widget) {
      return false;
    }
    if (!matchesStatusFilter(item.status, statusFilter)) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return (
      item.title.toLowerCase().includes(normalized) ||
      item.meta.toLowerCase().includes(normalized) ||
      item.statusLabel.toLowerCase().includes(normalized) ||
      item.sourceModule.toLowerCase().includes(normalized)
    );
  });
}

export function computeOperationalSummary(
  items: readonly ActivityItem[],
): OperationalSummary {
  const emptyStats = (): WidgetOperationalStats => ({
    total: 0,
    active: 0,
    attention: 0,
    completed: 0,
  });

  const byWidget: Record<ActivityWidgetKind, WidgetOperationalStats> = {
    learning: emptyStats(),
    handbook: emptyStats(),
    projects: emptyStats(),
  };

  let activeCount = 0;
  let attentionCount = 0;
  let completedCount = 0;

  for (const item of items) {
    const bucket = byWidget[item.widget];
    bucket.total += 1;

    if (item.status === 'active') {
      activeCount += 1;
      bucket.active += 1;
    } else if (item.status === 'pending' || item.status === 'warning') {
      attentionCount += 1;
      bucket.attention += 1;
    } else if (item.status === 'inactive') {
      completedCount += 1;
      bucket.completed += 1;
    }
  }

  return {
    total: items.length,
    activeCount,
    attentionCount,
    completedCount,
    byWidget,
  };
}

export function getPriorityFocusItem(
  items: readonly ActivityItem[],
  widget: ActivityWidgetKind,
): ActivityItem | null {
  const widgetItems = items.filter((item) => item.widget === widget);
  return (
    widgetItems.find((item) => item.status === 'active') ??
    widgetItems.find((item) => item.status === 'warning' || item.status === 'pending') ??
    null
  );
}

/**
 * Creates a temporary in-memory sample activity for prototype UI preview only.
 * Does not persist or create records in Learning Center, Handbook, or Projects.
 */
export function createSampleActivityPreview(input: {
  widget: ActivityWidgetKind;
  title: string;
  meta?: string;
  status?: 'active' | 'pending' | 'warning';
}): ActivityItem {
  const sourceByWidget: Record<ActivityWidgetKind, SourceDomainModule> = {
    learning: 'Learning Center',
    handbook: 'Engineering Handbook',
    projects: 'Project Workspace',
  };

  const defaultMeta: Record<ActivityWidgetKind, string> = {
    learning: 'Simulated sample · Learning track',
    handbook: 'Simulated sample · Handbook note',
    projects: 'Simulated sample · Project milestone',
  };

  const statusLabels: Record<'active' | 'pending' | 'warning', string> = {
    active: 'Active (Sample)',
    pending: 'Queued (Sample)',
    warning: 'Draft (Sample)',
  };

  const resolvedStatus = input.status ?? 'active';

  return {
    id: `sample-${input.widget}-${Date.now()}`,
    widget: input.widget,
    sourceModule: sourceByWidget[input.widget],
    title: input.title.trim(),
    meta: input.meta?.trim() ? input.meta.trim() : defaultMeta[input.widget],
    status: resolvedStatus,
    statusLabel: statusLabels[resolvedStatus],
    isSample: true,
  };
}
