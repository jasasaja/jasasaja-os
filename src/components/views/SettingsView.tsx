import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, RotateCcw, Save } from 'lucide-react';
import {
  DEFAULT_WORKSPACE_SETTINGS,
  validateWorkspaceSettings,
  type SettingsValidationErrors,
  type StorageWriteResult,
} from '../../utils/settings';
import { PageHeader } from '../layout';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  Input,
  Select,
  StatusIndicator,
  Textarea,
} from '../ui';
import type { BreadcrumbItem, DensityMode, RouteId, ThemeMode, WorkspaceSettings } from '../../types/foundation';

export interface SettingsViewProps {
  breadcrumbs: BreadcrumbItem[];
  settings: WorkspaceSettings;
  onSaveSettings: (next: WorkspaceSettings) => StorageWriteResult;
  onResetSettings: () => StorageWriteResult;
  onNavigate: (routeId: RouteId) => void;
}

export function SettingsView({
  breadcrumbs,
  settings,
  onSaveSettings,
  onResetSettings,
  onNavigate,
}: SettingsViewProps) {
  const [draft, setDraft] = useState<WorkspaceSettings>(settings);
  const [errors, setErrors] = useState<SettingsValidationErrors>({});
  const [saveFeedback, setSaveFeedback] = useState<{
    kind: 'saved' | 'error';
    message: string;
  } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);

  const clearFeedbackTimer = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  useEffect(() => clearFeedbackTimer, [clearFeedbackTimer]);

  const applyStorageFeedback = (result: StorageWriteResult, successMessage: string) => {
    clearFeedbackTimer();
    if (result.ok) {
      setSaveFeedback({ kind: 'saved', message: successMessage });
      feedbackTimerRef.current = window.setTimeout(() => {
        feedbackTimerRef.current = null;
        setSaveFeedback(null);
      }, 3500);
    } else {
      setSaveFeedback({
        kind: 'error',
        message:
          result.error ??
          'Gagal menyimpan preferensi sementara ke penyimpanan browser.',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateWorkspaceSettings(draft);
    setErrors(validation);
    if (Object.keys(validation).length > 0) {
      clearFeedbackTimer();
      setSaveFeedback(null);
      return;
    }
    const result = onSaveSettings(draft);
    applyStorageFeedback(result, 'Preferensi sementara tersimpan');
  };

  const handleConfirmReset = () => {
    const result = onResetSettings();
    setDraft(DEFAULT_WORKSPACE_SETTINGS);
    setErrors({});
    setResetOpen(false);
    applyStorageFeedback(result, 'Preferensi default dipulihkan');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Konfigurasi preferensi UI sementara di browser seperti nama ruang kerja, tema, halaman awal, dan kerapatan tata letak."
        breadcrumbs={breadcrumbs}
        onNavigate={onNavigate}
        actions={
          <Button
            variant="outline"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            onClick={() => setResetOpen(true)}
          >
            Atur Ulang ke Default
          </Button>
        }
      />

      {saveFeedback?.kind === 'error' && (
        <div
          role="alert"
          className="px-4 py-3 rounded-xl border border-[var(--status-danger-border)] bg-[var(--status-danger-soft)] text-sm text-[var(--status-danger)] flex items-start gap-2.5"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{saveFeedback.message}</span>
        </div>
      )}

      <section aria-labelledby="settings-preferences-heading">
        <h2 id="settings-preferences-heading" className="sr-only">
          Formulir Preferensi Ruang Kerja
        </h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Identitas Ruang Kerja</CardTitle>
                <CardDescription>
                  Ditampilkan di header sidebar, breadcrumb, dan menu profil lokal.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nama Ruang Kerja"
                required
                value={draft.workspaceName}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, workspaceName: e.target.value }));
                  if (errors.workspaceName) {
                    setErrors((prev) => ({ ...prev, workspaceName: undefined }));
                  }
                }}
                error={errors.workspaceName}
                hint="2–40 characters."
              />

              <Input
                label="Nama Tampilan Operator"
                required
                value={draft.displayName}
                onChange={(e) => {
                  setDraft((prev) => ({ ...prev, displayName: e.target.value }));
                  if (errors.displayName) {
                    setErrors((prev) => ({ ...prev, displayName: undefined }));
                  }
                }}
                error={errors.displayName}
              />

              <Textarea
                label="Ringkasan Ruang Kerja"
                value={draft.bio}
                onChange={(e) => setDraft((prev) => ({ ...prev, bio: e.target.value }))}
                maxLength={240}
                showCount
                error={errors.bio}
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>Tampilan &amp; Tata Letak</CardTitle>
                <CardDescription>
                  Disimpan sementara di localStorage browser (bukan database aplikasi).
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-1">
              <Select
                label="Tampilan Tema"
                value={draft.theme}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, theme: e.target.value as ThemeMode }))
                }
                options={[
                  { value: 'light', label: 'Terang (Engineering Slate)' },
                  { value: 'dark', label: 'Gelap (Deep Slate)' },
                ]}
              />

              <Select
                label="Kerapatan Tata Letak"
                value={draft.density}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, density: e.target.value as DensityMode }))
                }
                options={[
                  { value: 'comfortable', label: 'Nyaman (Spasi standar)' },
                  { value: 'compact', label: 'Kompak (Spasi vertikal lebih rapat)' },
                ]}
              />

              <Select
                label="Modul Awal Default"
                value={draft.defaultRoute}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, defaultRoute: e.target.value as RouteId }))
                }
                options={[
                  { value: 'dashboard', label: 'Dashboard' },
                  { value: 'learning', label: 'Learning' },
                  { value: 'handbook', label: 'Handbook' },
                  { value: 'projects', label: 'Projects' },
                  { value: 'settings', label: 'Settings' },
                ]}
                hint="Modul pertama yang dibuka saat mengunjungi root ruang kerja (/)."
              />
            </CardContent>
            <CardFooter className="bg-surface-subtle/30">
              {saveFeedback?.kind === 'saved' ? (
                <StatusIndicator status="active" label={saveFeedback.message} size="sm" />
              ) : saveFeedback?.kind === 'error' ? (
                <StatusIndicator status="error" label="Gagal menulis penyimpanan" size="sm" />
              ) : (
                <span className="text-[13px] leading-normal text-ink-muted">
                  Preferensi browser sementara (bukan database)
                </span>
              )}
              <Button type="submit" variant="primary" leftIcon={<Save className="h-4 w-4" />}>
                Simpan Perubahan
              </Button>
            </CardFooter>
          </Card>
        </div>
        </form>
      </section>

      <ConfirmationDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleConfirmReset}
        title="Atur ulang preferensi ruang kerja?"
        description="Ini mengembalikan nama ruang kerja JASASAJA default, tema terang, kerapatan nyaman, dan halaman awal Dashboard."
        confirmLabel="Konfirmasi Atur Ulang"
        variant="danger"
      />
    </div>
  );
}
