import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, LogIn, RefreshCw } from 'lucide-react';
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
import type { BreadcrumbItem, RouteId } from '../../types/foundation';
import { apiFetch, isApiClientError } from '../../lib/api';

type ContentStatus = 'Draft' | 'Approved' | 'Deprecated';
type SectionKey = 'purpose' | 'whenToUse' | 'procedure' | 'checklist' | 'templates' | 'deliverables';

interface HandbookCategory {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
}

interface VersionSummary {
  id: string;
  version: number;
  status: ContentStatus;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HandbookVersion extends VersionSummary {
  handbookItemId: string;
  contentJson: Record<string, unknown>;
  changeNote: string | null;
}

interface HandbookItemSummary {
  id: string;
  categoryId: string | null;
  title: string;
  summary: string | null;
  status: ContentStatus;
  version: number;
  activeVersion: VersionSummary | null;
  latestVersion: VersionSummary | null;
  createdAt: string;
  updatedAt: string;
}

interface HandbookItemDetail extends HandbookItemSummary {
  activeVersion: HandbookVersion | null;
  versions: HandbookVersion[];
}

interface AuthMeData {
  owner: { email: string; displayName: string };
}

interface HandbookViewProps {
  breadcrumbs: BreadcrumbItem[];
  onNavigate: (routeId: RouteId) => void;
  deepLinkItemId: string | null;
  onOpenHandbookItem: (itemId: string) => void;
}

type ViewState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string; code?: string }
  | { status: 'success'; data: T };

interface HandbookBlock {
  type?: unknown;
  text?: unknown;
  content?: unknown;
  data?: unknown;
  [key: string]: unknown;
}

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: 'purpose', label: 'Purpose' },
  { key: 'whenToUse', label: 'When to use' },
  { key: 'procedure', label: 'Procedure' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'templates', label: 'Templates/prompts' },
  { key: 'deliverables', label: 'Deliverables' },
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

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function statusBadgeVariant(status: ContentStatus): 'success' | 'warning' | 'neutral' {
  if (status === 'Approved') return 'success';
  if (status === 'Draft') return 'warning';
  return 'neutral';
}

function buildItemsPath(query: string, categoryId: string): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (categoryId) params.set('categoryId', categoryId);
  const search = params.toString();
  return `/api/handbook/items${search ? `?${search}` : ''}`;
}

// P3.5/P4.3: deep-link `/handbook?item=<id>` dikontrol oleh App agar navigasi nav
// yang sama membersihkan seleksi secara konsisten.

function readBlocks(content: Record<string, unknown>, key: SectionKey): HandbookBlock[] {
  const value = content[key];
  if (!Array.isArray(value)) return [];
  return value.filter((block): block is HandbookBlock => typeof block === 'object' && block !== null);
}

function readProvenance(content: Record<string, unknown>): { labels: string[]; sourceTitle: string | null } {
  const raw = content.provenance;
  if (typeof raw !== 'object' || raw === null) return { labels: [], sourceTitle: null };
  const value = raw as Record<string, unknown>;
  const labels = Array.isArray(value.labels)
    ? value.labels.filter((label): label is string => typeof label === 'string')
    : [];
  return { labels, sourceTitle: readString(value.sourceTitle) };
}

function getDisplayVersion(detail: HandbookItemDetail): { version: HandbookVersion; isApproved: boolean } | null {
  if (detail.activeVersion) {
    return { version: detail.activeVersion, isApproved: true };
  }
  const latest = detail.versions.reduce<HandbookVersion | null>(
    (current, version) => (!current || version.version > current.version ? version : current),
    null,
  );
  if (!latest) return null;
  return { version: latest, isApproved: latest.status === 'Approved' };
}

function renderBlock(block: HandbookBlock, index: number) {
  const type = readString(block.type) ?? 'block';
  const text = readString(block.text) ?? readString(block.content) ?? readString(block.data);

  if (!text) {
    return (
      <pre
        key={index}
        className="text-xs text-ink-secondary whitespace-pre-wrap break-words overflow-auto rounded-md bg-surface-subtle p-2"
      >
        {JSON.stringify(block, null, 2)}
      </pre>
    );
  }

  if (type === 'code') {
    return (
      <pre
        key={index}
        className="text-xs text-ink whitespace-pre-wrap break-words overflow-auto rounded-md border border-line bg-surface-subtle p-3"
      >
        {text}
      </pre>
    );
  }

  if (type === 'heading') {
    return (
      <p key={index} className="text-sm font-semibold text-ink">
        {text}
      </p>
    );
  }

  if (type === 'list') {
    return (
      <p key={index} className="flex gap-2 text-sm text-ink leading-relaxed">
        <span aria-hidden="true" className="text-ink-muted select-none">•</span>
        <span>{text}</span>
      </p>
    );
  }

  return (
    <p key={index} className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  );
}

export function HandbookView({ breadcrumbs, onNavigate, deepLinkItemId, onOpenHandbookItem }: HandbookViewProps) {
  const [auth, setAuth] = useState<ViewState<AuthMeData>>({ status: 'loading' });
  const [categories, setCategories] = useState<ViewState<HandbookCategory[]>>({ status: 'loading' });
  const [items, setItems] = useState<ViewState<HandbookItemSummary[]>>({ status: 'loading' });
  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const selectedItemId = deepLinkItemId;
  const [detail, setDetail] = useState<ViewState<HandbookItemDetail> | null>(null);

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

  const loadCategories = useCallback(async () => {
    setCategories({ status: 'loading' });
    try {
      const res = await apiFetch<{ data: HandbookCategory[] }>('/api/handbook/categories');
      setCategories({ status: 'success', data: res.data });
    } catch (error) {
      setCategories({ status: 'error', message: getErrorMessage(error, 'Gagal memuat kategori handbook.') });
    }
  }, []);

  const loadItems = useCallback(async () => {
    setItems({ status: 'loading' });
    try {
      const res = await apiFetch<{ data: HandbookItemSummary[] }>(buildItemsPath(query, categoryId));
      setItems({ status: 'success', data: res.data });
    } catch (error) {
      setItems({ status: 'error', message: getErrorMessage(error, 'Gagal memuat item handbook.') });
    }
  }, [query, categoryId]);

  const loadDetail = useCallback(async (id: string) => {
    setDetail({ status: 'loading' });
    try {
      const res = await apiFetch<{ data: HandbookItemDetail }>(`/api/handbook/items/${id}`);
      setDetail({ status: 'success', data: res.data });
    } catch (error) {
      setDetail({ status: 'error', message: getErrorMessage(error, 'Gagal memuat detail handbook.') });
    }
  }, []);

  useEffect(() => {
    void loadAuth();
  }, [loadAuth]);

  useEffect(() => {
    if (auth.status === 'success') void loadCategories();
  }, [auth.status, loadCategories]);

  useEffect(() => {
    if (auth.status === 'success') void loadItems();
  }, [auth.status, loadItems]);

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(searchInput.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (selectedItemId) {
      void loadDetail(selectedItemId);
      return;
    }
    setDetail(null);
  }, [selectedItemId, loadDetail]);

  const handleSelectItem = (id: string) => {
    setDetail({ status: 'loading' });
    onOpenHandbookItem(id);
  };

  const handleBackToList = () => {
    onNavigate('handbook');
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setQuery('');
    setCategoryId('');
  };

  if (auth.status === 'loading') {
    return (
      <div className="space-y-6">
        <PageHeader title="Handbook" description="Memuat sesi..." breadcrumbs={breadcrumbs} onNavigate={onNavigate} />
        <LoadingState label="Memeriksa sesi owner..." />
      </div>
    );
  }

  if (auth.status === 'error') {
    const unauthenticated = auth.code === 'UNAUTHENTICATED';
    return (
      <div className="space-y-6">
        <PageHeader
          title="Handbook"
          description="Indeks paket standar engineering dan status editorialnya."
          breadcrumbs={breadcrumbs}
          onNavigate={onNavigate}
        />
        {unauthenticated ? (
          <EmptyState
            icon={<LogIn className="h-5 w-5" />}
            title="Login diperlukan"
            description="Sesi owner belum aktif. Masuk dengan Google untuk membuka Engineering Handbook."
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

  const display = detail?.status === 'success' ? getDisplayVersion(detail.data) : null;
  const provenance = display ? readProvenance(display.version.contentJson) : null;
  const hasNewerDraft =
    display?.isApproved &&
    detail?.status === 'success' &&
    detail.data.latestVersion?.status === 'Draft' &&
    detail.data.latestVersion.version > display.version.version;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Handbook"
        description="Indeks paket standar engineering dan status editorialnya."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
        actions={
          selectedItemId ? (
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={handleBackToList}>
              Semua Item
            </Button>
          ) : (
            <Button
              variant="outline"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={() => { void loadCategories(); void loadItems(); }}
            >
              Muat Ulang
            </Button>
          )
        }
      />

      {!selectedItemId && (
        <section className="space-y-4" aria-label="Daftar handbook">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,240px)]">
            <SearchInput
              value={searchInput}
              onValueChange={setSearchInput}
              placeholder="Cari judul atau ringkasan..."
              aria-label="Cari item handbook"
            />
            <div className="flex flex-wrap gap-2" aria-label="Filter kategori">
              <Button size="sm" variant={categoryId === '' ? 'primary' : 'outline'} onClick={() => setCategoryId('')}>
                Semua
              </Button>
              {categories.status === 'success' &&
                categories.data.map((category) => (
                  <Button
                    key={category.id}
                    size="sm"
                    variant={categoryId === category.id ? 'primary' : 'outline'}
                    onClick={() => setCategoryId(category.id)}
                    title={category.description ?? undefined}
                  >
                    {category.name}
                  </Button>
                ))}
            </div>
          </div>

          {categories.status === 'loading' && <LoadingState variant="skeleton-list" rows={2} label="Memuat kategori..." />}
          {categories.status === 'error' && (
            <ErrorState message={categories.message} onRetry={() => void loadCategories()} />
          )}
          {categories.status === 'success' && categories.data.length === 0 && (
            <p className="text-sm text-ink-muted">Belum ada kategori handbook.</p>
          )}

          {items.status === 'loading' && <LoadingState variant="skeleton-list" label="Memuat item handbook..." rows={4} />}
          {items.status === 'error' && <ErrorState message={items.message} onRetry={() => void loadItems()} />}
          {items.status === 'success' && items.data.length === 0 && (
            <EmptyState
              icon={<BookOpen className="h-5 w-5" />}
              title="Tidak ada item handbook"
              description="Tidak ada item yang cocok dengan pencarian atau kategori saat ini."
              actionLabel="Hapus Filter"
              onAction={handleClearFilters}
              secondaryActionLabel="Muat Ulang"
              onSecondaryAction={() => void loadItems()}
            />
          )}
          {items.status === 'success' && items.data.length > 0 && (
            <div className="grid gap-4">
              {items.data.map((item) => (
                <Card key={item.id} className="hover:border-accent/40 transition-colors">
                  <CardHeader>
                    <div className="space-y-1 min-w-0">
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.summary || 'Tanpa ringkasan.'}</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleSelectItem(item.id)}>
                      Buka
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                      <Badge variant="neutral">v{item.version}</Badge>
                      {item.activeVersion ? (
                        <Badge variant="success">Standar aktif v{item.activeVersion.version}</Badge>
                      ) : (
                        <Badge variant="warning">Belum ada standar aktif</Badge>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">Diperbarui: {formatDate(item.updatedAt)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedItemId && (
        <section className="space-y-4" aria-label="Detail handbook">
          {detail?.status === 'loading' && <LoadingState variant="skeleton-list" label="Memuat detail handbook..." rows={5} />}
          {detail?.status === 'error' && (
            <ErrorState message={detail.message} onRetry={() => void loadDetail(selectedItemId)} />
          )}
          {detail?.status === 'success' && (
            <Card>
              <CardHeader>
                <div className="space-y-1 min-w-0">
                  <CardTitle>{detail.data.title}</CardTitle>
                  <CardDescription>{detail.data.summary || 'Tanpa ringkasan.'}</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={statusBadgeVariant(detail.data.status)}>{detail.data.status}</Badge>
                  <Badge variant="neutral">v{detail.data.version}</Badge>
                  {display?.isApproved ? (
                    <Badge variant="success">Standar aktif</Badge>
                  ) : (
                    <Badge variant="warning">Draft / pratinjau</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {!display && (
                  <p className="rounded-lg border border-[var(--status-warning-border)] bg-[var(--status-warning-soft)] px-3 py-2 text-sm text-[var(--status-warning)]">
                    Belum ada versi konten pada item ini.
                  </p>
                )}
                {display && !display.isApproved && (
                  <p className="rounded-lg border border-[var(--status-warning-border)] bg-[var(--status-warning-soft)] px-3 py-2 text-sm text-[var(--status-warning)]">
                    Versi terbaru masih Draft dan belum disetujui. Konten di bawah hanya pratinjau, bukan standar aktif.
                  </p>
                )}
                {display?.isApproved && hasNewerDraft && (
                  <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-soft)] px-3 py-2 text-sm text-[var(--status-info)]">
                    Menampilkan standar aktif v{display.version.version}. Terdapat draf lebih baru v{detail.data.latestVersion?.version} yang belum disetujui.
                  </p>
                )}

                {display && (
                  <>
                    <div className="space-y-2">
                      <p className="text-[13px] font-medium uppercase tracking-wide text-ink-muted">Sumber & provenance</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {provenance?.labels.map((label) => (
                          <Badge key={label} variant="accent">{label}</Badge>
                        ))}
                        {provenance?.sourceTitle && (
                          <span className="text-xs text-ink-secondary">{provenance.sourceTitle}</span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted">
                        Menampilkan v{display.version.version} · {display.version.status}
                        {display.version.approvedAt ? ` · Disetujui ${formatDate(display.version.approvedAt)}` : ''}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {SECTIONS.map((section) => {
                        const blocks = readBlocks(display.version.contentJson, section.key);
                        return (
                          <section key={section.key} className="space-y-2 rounded-xl border border-line p-4">
                            <h3 className="text-sm font-semibold text-ink">{section.label}</h3>
                            {blocks.length === 0 ? (
                              <p className="text-sm text-ink-muted">Bagian ini belum diisi.</p>
                            ) : (
                              blocks.map(renderBlock)
                            )}
                          </section>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-xs text-ink-muted">
                      <span>Riwayat versi: {detail.data.versions.length}</span>
                      {display.version.changeNote && <span>Catatan: {display.version.changeNote}</span>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      )}
    </div>
  );
}
