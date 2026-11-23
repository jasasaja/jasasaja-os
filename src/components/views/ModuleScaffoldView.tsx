import React, { useState } from 'react';
import { ArrowLeft, BookOpen, FolderKanban, GraduationCap } from 'lucide-react';
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
  routeId: 'learning' | 'handbook' | 'projects';
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (routeId: RouteId) => void;
}

const MODULE_META: Record<
  'learning' | 'handbook' | 'projects',
  {
    title: string;
    description: string;
    Icon: React.ComponentType<{ className?: string }>;
    plannedCapabilities: string[];
    emptyTitle: string;
    emptyDescription: string;
  }
> = {
  learning: {
    title: 'Learning',
    description:
      'Foundation shell for structured study tracks, technical reading logs, and review queues.',
    Icon: GraduationCap,
    plannedCapabilities: [
      'Curriculum track organization with progress summaries',
      'Markdown study notes linked to handbook references',
      'Spaced review schedule and concept mastery tracking',
    ],
    emptyTitle: 'Learning Center module not yet enabled',
    emptyDescription:
      'This route is wired into the application shell and responsive navigation. Domain features will be implemented in the next phase.',
  },
  handbook: {
    title: 'Handbook',
    description:
      'Foundation shell for personal engineering playbooks, architecture decisions, and standards.',
    Icon: BookOpen,
    plannedCapabilities: [
      'Indexed engineering guidelines and architecture decision records',
      'Fast client-side search across personal reference articles',
      'Reusable checklists for system design and code reviews',
    ],
    emptyTitle: 'Handbook module not yet enabled',
    emptyDescription:
      'Navigation, breadcrumbs, typography, and empty/loading primitives are ready to host the Handbook experience.',
  },
  projects: {
    title: 'Projects',
    description:
      'Foundation shell for active engineering builds, milestones, and technical specifications.',
    Icon: FolderKanban,
    plannedCapabilities: [
      'Project workspace switcher with milestone and status tracking',
      'Specification drafts linked to Handbook standards',
      'Task filtering, search, and confirmation workflows',
    ],
    emptyTitle: 'Project Workspace module not yet enabled',
    emptyDescription:
      'All layout containers, cards, dialogs, and responsive breakpoints are verified and ready for Project Workspace views.',
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
            Back to Dashboard
          </Button>
        }
      />

      <section aria-labelledby="module-scaffold-heading" className="space-y-6">
        <h2 id="module-scaffold-heading" className="sr-only">
          {meta.title} Foundation Workspace
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StatusIndicator status="pending" label="Foundation Scaffold Ready" />

        <Tabs
          ariaLabel={`${meta.title} scaffold preview modes`}
          activeId={previewTab}
          onChange={(id) => setPreviewTab(id as 'overview' | 'empty' | 'loading')}
          items={[
            { id: 'overview', label: 'Module Scope' },
            { id: 'empty', label: 'Empty State' },
            { id: 'loading', label: 'Loading State' },
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
                  Built on shared shell, breadcrumb, and surface primitives.
                </CardDescription>
              </div>
            </div>
            <Badge variant="info">Phase 2 Target</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-ink-secondary leading-relaxed">
              This view reserves the primary route and layout geometry for the {meta.title} module while keeping business logic decoupled until the dedicated module sprint.
            </p>
            <div className="pt-2 border-t border-line">
              <p className="text-[13px] leading-normal font-medium text-ink-muted mb-2.5">Planned Capabilities</p>
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
          actionLabel="Return to Foundation"
          onAction={() => onNavigate('dashboard')}
          secondaryActionLabel="Configure Settings"
          onSecondaryAction={() => onNavigate('settings')}
        />
      </TabPanel>

      <TabPanel active={previewTab === 'loading'}>
        <LoadingState
          variant="skeleton-list"
          label={`Loading ${meta.title} workspace...`}
          rows={4}
        />
      </TabPanel>
      </section>
    </div>
  );
}
