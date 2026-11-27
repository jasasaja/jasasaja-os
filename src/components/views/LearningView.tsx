import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, GraduationCap, LogIn, RefreshCw } from 'lucide-react';
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
  Select,
  StatusIndicator,
} from '../ui';
import type { BreadcrumbItem, RouteId } from '../../types/foundation';
import { apiFetch, isApiClientError } from '../../lib/api';

interface LearningPathSummary {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LearningLessonSummary {
  id: string;
  learningPathId: string | null;
  title: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LearningPathDetail extends LearningPathSummary {
  lessons: LearningLessonSummary[];
}

interface LessonVersion {
  id: string;
  lessonId: string;
  version: number;
  status: 'Draft' | 'Approved' | 'Deprecated';
  contentJson: { blocks?: Array<Record<string, unknown>>; [key: string]: unknown };
  changeNote: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LearningLessonDetail extends LearningLessonSummary {
  versions: LessonVersion[];
}

type ProgressStatus = 'Not Started' | 'In Progress' | 'Completed' | 'Mastered';

interface LessonProgress {
  id: string | null;
  lessonId: string;
  status: ProgressStatus;
  masteredAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AuthMeData {
  owner: { id: string; email: string; displayName: string };
  csrfToken: string;
}

interface LearningViewProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (routeId: RouteId) => void;
}

type ViewState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string; code?: string }
  | { status: 'success'; data: T };

const PROGRESS_OPTIONS: Array<{ value: ProgressStatus; label: string }> = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Mastered', label: 'Mastered' },
];

function getErrorMessage(error: unknown, fallback: string): string {
  if (isApiClientError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function versionBadgeVariant(status: LessonVersion['status']): 'neutral' | 'success' | 'warning' | 'info' {
  if (status === 'Approved') return 'success';
  if (status === 'Draft') return 'warning';
  return 'neutral';
}

function progressTone(status: ProgressStatus): 'active' | 'pending' | 'warning' | 'inactive' {
  if (status === 'Mastered') return 'active';
  if (status === 'Completed') return 'active';
  if (status === 'In Progress') return 'pending';
  return 'inactive';
}

function renderBlock(block: Record<string, unknown>, index: number) {
  const type = typeof block.type === 'string' ? block.type : 'block';
  const text =
    typeof block.text === 'string'
      ? block.text
      : typeof block.content === 'string'
        ? block.content
        : typeof block.data === 'string'
          ? block.data
          : null;

  return (
    <div key={index} className="rounded-lg border border-line bg-surface-subtle px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted mb-1">{type}</p>
      {text ? (
        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{text}</p>
      ) : (
        <pre className="text-xs text-ink-secondary whitespace-pre-wrap break-words overflow-auto">
          {JSON.stringify(block, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function LearningView({ breadcrumbs, onNavigate }: LearningViewProps) {
  const [auth, setAuth] = useState<ViewState<AuthMeData>>({ status: 'loading' });
  const [paths, setPaths] = useState<ViewState<LearningPathSummary[]>>({ status: 'loading' });
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [pathDetail, setPathDetail] = useState<ViewState<LearningPathDetail> | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [lessonDetail, setLessonDetail] = useState<ViewState<LearningLessonDetail> | null>(null);
  const [progress, setProgress] = useState<ViewState<LessonProgress> | null>(null);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressNotice, setProgressNotice] = useState<string | null>(null);

  const csrfToken = auth.status === 'success' ? auth.data.csrfToken : null;

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
      setAuth({ status: 'error', message: getErrorMessage(error, 'Gagal memeriksa sesi.'), code: isApiClientError(error) ? error.code : undefined });
    }
  }, []);

  const loadPaths = useCallback(async () => {
    setPaths({ status: 'loading' });
    try {
      const res = await apiFetch<{ data: LearningPathSummary[] }>('/api/learning/paths');
      setPaths({ status: 'success', data: res.data });
    } catch (error) {
      setPaths({ status: 'error', message: getErrorMessage(error, 'Gagal memuat learning paths.') });
    }
  }, []);

  const loadPathDetail = useCallback(async (pathId: string) => {
    setPathDetail({ status: 'loading' });
    setSelectedLessonId(null);
    setLessonDetail(null);
    setProgress(null);
    setProgressNotice(null);
    try {
      const res = await apiFetch<{ data: LearningPathDetail }>(`/api/learning/paths/${pathId}`);
      setPathDetail({ status: 'success', data: res.data });
    } catch (error) {
      setPathDetail({ status: 'error', message: getErrorMessage(error, 'Gagal memuat detail path.') });
    }
  }, []);

  const loadLesson = useCallback(async (lessonId: string) => {
    setLessonDetail({ status: 'loading' });
    setProgress({ status: 'loading' });
    setProgressNotice(null);
    try {
      const [lessonRes, progressRes] = await Promise.all([
        apiFetch<{ data: LearningLessonDetail }>(`/api/learning/lessons/${lessonId}`),
        apiFetch<{ data: LessonProgress }>(`/api/learning/lessons/${lessonId}/progress`),
      ]);
      setLessonDetail({ status: 'success', data: lessonRes.data });
      setProgress({ status: 'success', data: progressRes.data });
    } catch (error) {
      const message = getErrorMessage(error, 'Gagal memuat lesson.');
      setLessonDetail({ status: 'error', message });
      setProgress({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    void loadAuth();
  }, [loadAuth]);

  useEffect(() => {
    if (auth.status === 'success') {
      void loadPaths();
    }
  }, [auth.status, loadPaths]);

  useEffect(() => {
    if (selectedPathId) {
      void loadPathDetail(selectedPathId);
    }
  }, [selectedPathId, loadPathDetail]);

  useEffect(() => {
    if (selectedLessonId) {
      void loadLesson(selectedLessonId);
    }
  }, [selectedLessonId, loadLesson]);

  const handleSelectPath = (pathId: string) => {
    setSelectedPathId(pathId);
  };

  const handleBackToPaths = () => {
    setSelectedPathId(null);
    setPathDetail(null);
    setSelectedLessonId(null);
    setLessonDetail(null);
    setProgress(null);
    setProgressNotice(null);
  };

  const handleProgressChange = async (status: ProgressStatus) => {
    if (!selectedLessonId || !csrfToken) return;
    setProgressSaving(true);
    setProgressNotice(null);
    try {
      const res = await apiFetch<{ data: LessonProgress }>(`/api/learning/lessons/${selectedLessonId}/progress`, {
        method: 'PATCH',
        csrfToken,
        body: { status },
      });
      setProgress({ status: 'success', data: res.data });
      setProgressNotice('Progress diperbarui.');
    } catch (error) {
      setProgressNotice(getErrorMessage(error, 'Gagal memperbarui progress.'));
    } finally {
      setProgressSaving(false);
    }
  };

  if (auth.status === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader title="Learning" description="Memuat sesi..." breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
        <LoadingState label="Memeriksa sesi owner..." />
      </div>
    );
  }

  if (auth.status === 'error') {
    const unauth = auth.code === 'UNAUTHENTICATED';
    return (
      <div className="space-y-6">
        <PageHeader
          title="Learning"
          description="Jalur belajar terstruktur, lesson, dan progress."
          breadcrumbs={breadcrumbs}
          onNavigate={onNavigate}
        />
        {unauth ? (
          <EmptyState
            icon={<LogIn className="h-5 w-5" />}
            title="Login diperlukan"
            description="Sesi owner belum aktif. Masuk dengan Google untuk mengakses Learning Center."
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
        title="Learning"
        description="Learning path, lesson, versi konten, dan progress manual owner."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
        actions={
          selectedPathId ? (
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={handleBackToPaths}>
              Semua Paths
            </Button>
          ) : (
            <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => void loadPaths()}>
              Muat Ulang
            </Button>
          )
        }
      />

      {!selectedPathId && (
        <section className="space-y-4">
          {paths.status === 'loading' && <LoadingState variant="skeleton-list" label="Memuat learning paths..." rows={3} />}
          {paths.status === 'error' && <ErrorState message={paths.message} onRetry={() => void loadPaths()} />}
          {paths.status === 'success' && paths.data.length === 0 && (
            <EmptyState
              icon={<GraduationCap className="h-5 w-5" />}
              title="Belum ada learning path"
              description="Belum ada learning path di database. Buat path melalui API P1.2 atau seed data."
              actionLabel="Muat Ulang"
              onAction={() => void loadPaths()}
            />
          )}
          {paths.status === 'success' && paths.data.length > 0 && (
            <div className="grid gap-4">
              {paths.data.map((path) => (
                <Card key={path.id} className="hover:border-accent/40 transition-colors">
                  <CardHeader>
                    <div className="space-y-1 min-w-0">
                      <CardTitle>{path.title}</CardTitle>
                      <CardDescription>{path.description || 'Tidak ada deskripsi.'}</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => handleSelectPath(path.id)}>Buka</Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-ink-muted">Diperbarui: {formatDate(path.updatedAt)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedPathId && (
        <section className="space-y-4">
          {pathDetail?.status === 'loading' && <LoadingState variant="skeleton-list" label="Memuat detail path..." rows={4} />}
          {pathDetail?.status === 'error' && (
            <ErrorState message={pathDetail.message} onRetry={() => void loadPathDetail(selectedPathId)} />
          )}
          {pathDetail?.status === 'success' && (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>{pathDetail.data.title}</CardTitle>
                    <CardDescription>{pathDetail.data.description || 'Tidak ada deskripsi.'}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pathDetail.data.lessons.length === 0 ? (
                    <p className="text-sm text-ink-secondary">Belum ada lesson di path ini.</p>
                  ) : (
                    pathDetail.data.lessons.map((lesson) => {
                      const active = lesson.id === selectedLessonId;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => setSelectedLessonId(lesson.id)}
                          className={`w-full text-left rounded-lg border px-3 py-3 transition-colors ${active ? 'border-accent bg-accent-soft/30' : 'border-line hover:bg-surface-subtle'}`}
                        >
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-4 w-4 mt-0.5 text-ink-muted shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-ink">{lesson.title}</p>
                              <p className="text-xs text-ink-secondary mt-0.5 line-clamp-2">{lesson.summary || 'Tanpa ringkasan.'}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                {!selectedLessonId && (
                  <EmptyState
                    icon={<BookOpen className="h-5 w-5" />}
                    title="Pilih lesson"
                    description="Pilih lesson dari daftar untuk melihat versi konten dan mengubah progress manual."
                  />
                )}

                {selectedLessonId && lessonDetail?.status === 'loading' && <LoadingState label="Memuat lesson..." />}
                {selectedLessonId && lessonDetail?.status === 'error' && (
                  <ErrorState message={lessonDetail.message} onRetry={() => void loadLesson(selectedLessonId)} />
                )}

                {selectedLessonId && lessonDetail?.status === 'success' && (
                  <Card>
                    <CardHeader>
                      <div className="space-y-1">
                        <CardTitle>{lessonDetail.data.title}</CardTitle>
                        <CardDescription>{lessonDetail.data.summary || 'Tanpa ringkasan.'}</CardDescription>
                      </div>
                      {progress?.status === 'success' && (
                        <StatusIndicator status={progressTone(progress.data.status)} label={progress.data.status} />
                      )}
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-ink">Progress (manual owner / D1)</p>
                        {progress?.status === 'loading' && <p className="text-sm text-ink-secondary">Memuat progress...</p>}
                        {progress?.status === 'error' && <p className="text-sm text-[var(--status-danger)]">{progress.message}</p>}
                        {progress?.status === 'success' && (
                          <div className="max-w-xs">
                            <Select
                              label="Status"
                              options={PROGRESS_OPTIONS}
                              value={progress.data.status}
                              disabled={progressSaving || !csrfToken}
                              onChange={(e) => void handleProgressChange(e.target.value as ProgressStatus)}
                            />
                          </div>
                        )}
                        {progress?.status === 'success' && progress.data.masteredAt && (
                          <p className="text-xs text-ink-muted">Mastered at: {formatDate(progress.data.masteredAt)}</p>
                        )}
                        {progressNotice && <p className="text-xs text-ink-secondary">{progressNotice}</p>}
                        {!csrfToken && <p className="text-xs text-[var(--status-danger)]">CSRF token tidak tersedia; refresh sesi.</p>}
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-ink">Versi Konten (A1/B1)</p>
                        {lessonDetail.data.versions.length === 0 ? (
                          <p className="text-sm text-ink-secondary">Belum ada versi.</p>
                        ) : (
                          lessonDetail.data.versions.map((version) => (
                            <div key={version.id} className="rounded-xl border border-line p-4 space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant={versionBadgeVariant(version.status)}>v{version.version} · {version.status}</Badge>
                                {version.approvedAt && <span className="text-xs text-ink-muted">Approved: {formatDate(version.approvedAt)}</span>}
                                {version.changeNote && <span className="text-xs text-ink-muted">Note: {version.changeNote}</span>}
                              </div>
                              <div className="space-y-2">
                                {(version.contentJson.blocks ?? []).map((block, i) => renderBlock(block, i))}
                                {!version.contentJson.blocks?.length && (
                                  <pre className="text-xs text-ink-secondary whitespace-pre-wrap break-words overflow-auto">
                                    {JSON.stringify(version.contentJson, null, 2)}
                                  </pre>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {progress?.status === 'success' && progress.data.status === 'Mastered' && (
                        <div className="flex items-center gap-2 text-sm text-[var(--status-success)]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Lesson ditandai Mastered oleh owner (manual).</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
