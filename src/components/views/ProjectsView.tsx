import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, FolderKanban, LogIn, RefreshCw } from 'lucide-react';
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
  ErrorState,
  LoadingState,
  SearchInput,
} from '../ui';
import type { BreadcrumbItem, RouteId, SemanticTone } from '../../types/foundation';
import { apiFetch, isApiClientError } from '../../lib/api';

type ProjectStatus = 'Planned' | 'Active' | 'Completed' | 'Archived';
type MilestoneStatus = 'Planned' | 'In Progress' | 'Completed';
type TaskStatus = 'Todo' | 'In Progress' | 'Done' | 'Blocked';
type ContentStatus = 'Draft' | 'Approved' | 'Deprecated';

interface ProjectSummary {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  milestoneCount: number;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

interface HandbookReference {
  id: string;
  title: string;
  summary: string | null;
  status: ContentStatus;
  version: number;
  hasApprovedVersion: boolean;
}

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  targetDate: string | null;
  status: MilestoneStatus;
  createdAt: string;
  updatedAt: string;
}

interface ProjectTask {
  id: string;
  projectId: string;
  milestoneId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  handbookItemId: string | null;
  handbookItem: HandbookReference | null;
  lessonId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectDetail extends ProjectSummary {
  milestones: Milestone[];
  tasks: ProjectTask[];
}

interface AuthMeData {
  owner: { email: string; displayName: string };
}

interface ProjectsViewProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (routeId: RouteId) => void;
  onOpenHandbookItem: (itemId: string) => void;
}

type ViewState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string; code?: string }
  | { status: 'success'; data: T };

const STATUS_FILTERS: ReadonlyArray<{ value: ProjectStatus | ''; label: string }> = [
  { value: '', label: 'Semua' },
  { value: 'Planned', label: 'Planned' },
  { value: 'Active', label: 'Active' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Archived', label: 'Archived' },
];

const PROJECT_BADGES: Record<ProjectStatus, SemanticTone> = {
  Planned: 'warning',
  Active: 'success',
  Completed: 'info',
  Archived: 'neutral',
};

const MILESTONE_BADGES: Record<MilestoneStatus, SemanticTone> = {
  Planned: 'warning',
  'In Progress': 'info',
  Completed: 'success',
};

const TASK_BADGES: Record<TaskStatus, SemanticTone> = {
  Todo: 'neutral',
  'In Progress': 'info',
  Done: 'success',
  Blocked: 'danger',
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (isApiClientError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function buildProjectsPath(query: string, status: ProjectStatus | ''): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (status) params.set('status', status);
  const search = params.toString();
  return `/api/projects${search ? `?${search}` : ''}`;
}

export function ProjectsView({ breadcrumbs, onNavigate, onOpenHandbookItem }: ProjectsViewProps) {
  const [auth, setAuth] = useState<ViewState<AuthMeData>>({ status: 'loading' });
  const [projects, setProjects] = useState<ViewState<ProjectSummary[]>>({ status: 'loading' });
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProjectStatus | ''>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ViewState<ProjectDetail> | null>(null);

  const loadAuth = useCallback(async () => {
    setAuth({ status: 'loading' });
    try {
      const res = await apiFetch<{ data: AuthMeData }>('/api/auth/me');
      setAuth({ status: 'success', data: res.data });
    } catch (error) {
      if (isApiClientError(error) && error.status === 401) {
        setAuth({ status: 'error', message: error.message, code: 'UNAUTHENTICATED' });
        return;
      }
      setAuth({
        status: 'error',
        message: getErrorMessage(error, 'Gagal memeriksa sesi.'),
        code: isApiClientError(error) ? error.code : undefined,
      });
    }
  }, []);

  const loadProjects = useCallback(async () => {
    setProjects({ status: 'loading' });
    try {
      const res = await apiFetch<{ data: ProjectSummary[] }>(buildProjectsPath(query, status));
      setProjects({ status: 'success', data: res.data });
    } catch (error) {
      setProjects({
        status: 'error',
        message: getErrorMessage(error, 'Gagal memuat daftar project.'),
        code: isApiClientError(error) ? error.code : undefined,
      });
    }
  }, [query, status]);

  const loadDetail = useCallback(async (projectId: string) => {
    setDetail({ status: 'loading' });
    try {
      const res = await apiFetch<{ data: ProjectDetail }>(`/api/projects/${projectId}`);
      setDetail({ status: 'success', data: res.data });
    } catch (error) {
      setDetail({
        status: 'error',
        message: getErrorMessage(error, 'Gagal memuat detail project.'),
        code: isApiClientError(error) ? error.code : undefined,
      });
    }
  }, []);

  useEffect(() => {
    void loadAuth();
  }, [loadAuth]);

  useEffect(() => {
    if (auth.status === 'success') void loadProjects();
  }, [auth.status, loadProjects]);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (selectedProjectId) void loadDetail(selectedProjectId);
  }, [selectedProjectId, loadDetail]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDetail({ status: 'loading' });
  };

  const handleBackToList = () => {
    setSelectedProjectId(null);
    setDetail(null);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setQuery('');
    setStatus('');
  };

  if (auth.status === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader title="Projects" description="Memuat sesi..." breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
        <LoadingState label="Memeriksa sesi owner..." />
      </div>
    );
  }

  if (auth.status === 'error') {
    const unauthenticated = auth.code === 'UNAUTHENTICATED';
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projects"
          description="Project workspace dengan milestone, task, dan referensi handbook."
          breadcrumbs={breadcrumbs}
          onNavigate={onNavigate}
        />
        {unauthenticated ? (
          <EmptyState
            icon={<LogIn className="h-5 w-5" />}
            title="Login diperlukan"
            description="Sesi owner belum aktif. Masuk dengan Google untuk membuka Project Workspace."
            actionLabel="Masuk dengan Google"
            onAction={() => { window.location.href = '/api/auth/google/start'; }}
            secondaryActionLabel="Coba Lagi"
            onSecondaryAction={() => void loadAuth()}
          />
        ) : (
          <ErrorState message={auth.message} onRetry={() => void loadAuth()} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Project workspace dengan milestone, task, dan referensi handbook."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
        actions={
          selectedProjectId ? (
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={handleBackToList}>
              Semua Project
            </Button>
          ) : (
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => void loadProjects()}
            >
              Muat Ulang
            </Button>
          )
        }
      />

      {!selectedProjectId && (
        <section className="space-y-4" aria-label="Daftar project">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
            <SearchInput
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Cari nama atau deskripsi project..."
              aria-label="Cari project"
            />
            <div className="flex flex-wrap gap-2" aria-label="Filter status project">
              {STATUS_FILTERS.map((option) => (
                <Button
                  key={option.value}
                  size="sm"
                  variant={status === option.value ? 'primary' : 'outline'}
                  onClick={() => setStatus(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {projects.status === 'loading' && (
            <LoadingState variant="skeleton-list" rows={4} label="Memuat project..." />
          )}
          {projects.status === 'error' && (
            <ErrorState message={projects.message} onRetry={() => void loadProjects()} />
          )}
          {projects.status === 'success' && projects.data.length === 0 && (
            <EmptyState
              icon={<FolderKanban className="h-5 w-5" />}
              title="Tidak ada project"
              description="Tidak ada project yang cocok dengan pencarian atau filter saat ini."
              actionLabel="Hapus Filter"
              onAction={handleClearFilters}
              secondaryActionLabel="Muat Ulang"
              onSecondaryAction={() => void loadProjects()}
            />
          )}
          {projects.status === 'success' && projects.data.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {projects.data.map((project) => (
                <Card key={project.id} className="hover:border-accent/40 transition-colors">
                  <CardHeader>
                    <div className="space-y-1 min-w-0">
                      <CardTitle>{project.name}</CardTitle>
                      <CardDescription>{project.description || 'Tanpa deskripsi.'}</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleSelectProject(project.id)}>
                      Buka
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={PROJECT_BADGES[project.status]}>{project.status}</Badge>
                      <Badge variant="neutral">{project.milestoneCount} milestone</Badge>
                      <Badge variant="neutral">{project.taskCount} task</Badge>
                    </div>
                    <p className="text-xs text-ink-muted">Diperbarui: {formatTimestamp(project.updatedAt)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedProjectId && (
        <section className="space-y-4" aria-label="Detail project">
          {detail?.status === 'loading' && (
            <LoadingState variant="skeleton-list" rows={5} label="Memuat detail project..." />
          )}
          {detail?.status === 'error' && (
            <ErrorState message={detail.message} onRetry={() => void loadDetail(selectedProjectId)} />
          )}
          {detail?.status === 'success' && (
            <>
              <Card>
                <CardHeader>
                  <div className="space-y-1 min-w-0">
                    <CardTitle>{detail.data.name}</CardTitle>
                    <CardDescription>{detail.data.description || 'Tanpa deskripsi.'}</CardDescription>
                  </div>
                  <Badge variant={PROJECT_BADGES[detail.data.status]}>{detail.data.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-ink-muted">
                    {detail.data.milestones.length} milestone · {detail.data.tasks.length} task · Diperbarui {formatTimestamp(detail.data.updatedAt)}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                <section className="space-y-3" aria-label="Milestone project">
                  <h2 className="text-sm font-semibold text-ink">Milestone</h2>
                  {detail.data.milestones.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-line-strong bg-surface px-4 py-6 text-center text-sm text-ink-muted">
                      Project ini belum memiliki milestone.
                    </p>
                  ) : (
                    detail.data.milestones.map((milestone) => (
                      <div key={milestone.id} className="space-y-2 rounded-xl border border-line bg-surface p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-ink">{milestone.title}</p>
                          <Badge variant={MILESTONE_BADGES[milestone.status]}>{milestone.status}</Badge>
                        </div>
                        <p className="text-xs text-ink-muted">Target: {milestone.targetDate ?? '-'}</p>
                      </div>
                    ))
                  )}
                </section>

                <section className="space-y-3" aria-label="Task project">
                  <h2 className="text-sm font-semibold text-ink">Task</h2>
                  {detail.data.tasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-line-strong bg-surface px-4 py-6 text-center text-sm text-ink-muted">
                      Project ini belum memiliki task.
                    </p>
                  ) : (
                    detail.data.tasks.map((task) => {
                      const handbookItem = task.handbookItem;
                      const milestoneTitle = detail.data.milestones.find(
                        (milestone) => milestone.id === task.milestoneId,
                      )?.title;

                      return (
                        <div key={task.id} className="space-y-2 rounded-xl border border-line bg-surface p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-medium text-ink">{task.title}</p>
                            <Badge variant={TASK_BADGES[task.status]}>{task.status}</Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-ink-secondary leading-relaxed">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                            <span>Due: {task.dueDate ?? '-'}</span>
                            {milestoneTitle && <span>Milestone: {milestoneTitle}</span>}
                          </div>
                          {handbookItem && (
                            <div className="space-y-2 rounded-lg border border-line bg-surface-subtle p-3">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                                Referensi handbook
                              </p>
                              <p className="text-sm text-ink">{handbookItem.title}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant={
                                    handbookItem.status === 'Approved'
                                      ? 'success'
                                      : handbookItem.status === 'Draft'
                                        ? 'warning'
                                        : 'neutral'
                                  }
                                >
                                  {handbookItem.status}
                                </Badge>
                                <Badge variant="neutral">v{handbookItem.version}</Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<BookOpen className="h-3.5 w-3.5" />}
                                  onClick={() => onOpenHandbookItem(handbookItem.id)}
                                >
                                  Buka handbook
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </section>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
