import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppShell } from './components/layout';
import { DashboardView } from './components/views/DashboardView';
import { HandbookView } from './components/views/HandbookView';
import { LearningView } from './components/views/LearningView';
import { NotFoundView } from './components/views/NotFoundView';
import { ProjectsView } from './components/views/ProjectsView';
import { SettingsView } from './components/views/SettingsView';
import type { RouteId, UserProfile, WorkspaceSettings } from './types/foundation';
import {
  getBreadcrumbsForRoute,
  getNavItem,
  getNotFoundBreadcrumbs,
  resolveRoute,
} from './utils/navigation';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_WORKSPACE_SETTINGS,
  getInitials,
  loadWorkspaceSettings,
  saveWorkspaceSettings,
  type StorageWriteResult,
} from './utils/settings';

// Querystring ikut disimpan agar deep-link handbook (?item=<id>) tetap terbaca
// setelah navigasi SPA maupun popstate.
function getLocationUrl(): string {
  return `${window.location.pathname}${window.location.search}`;
}

export default function App() {
  const [settings, setSettings] = useState<WorkspaceSettings>(() => loadWorkspaceSettings());
  const [locationUrl, setLocationUrl] = useState<string>(getLocationUrl);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const handlePopState = () => {
      setLocationUrl(getLocationUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const persistSettings = useCallback(
    (next: WorkspaceSettings, notifyOnError = true): StorageWriteResult => {
      setSettings(next);
      const result = saveWorkspaceSettings(next);
      if (!result.ok && result.error) {
        if (notifyOnError) {
          setSessionNotice(result.error);
        }
      } else {
        setSessionNotice((prev) =>
          prev && prev.includes('localStorage') ? null : prev,
        );
      }
      return result;
    },
    [],
  );

  const resolution = useMemo(
    () => resolveRoute(locationUrl, settings.defaultRoute),
    [locationUrl, settings.defaultRoute],
  );

  const currentRoute: RouteId | null =
    resolution.kind === 'route' ? resolution.routeId : null;

  const handbookItemId = useMemo(() => {
    if (currentRoute !== 'handbook') return null;
    const value = new URLSearchParams(locationUrl.split('?')[1] ?? '').get('item');
    return value && value.trim() ? value : null;
  }, [currentRoute, locationUrl]);

  const handleNavigate = useCallback((routeId: RouteId) => {
    const target = getNavItem(routeId);
    if (getLocationUrl() !== target.path) {
      window.history.pushState({ routeId }, '', target.path);
    }
    setLocationUrl(target.path);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleOpenHandbookItem = useCallback((itemId: string) => {
    const target = `/handbook?item=${encodeURIComponent(itemId)}`;
    if (getLocationUrl() !== target) {
      window.history.pushState({ routeId: 'handbook', itemId }, '', target);
    }
    setLocationUrl(target);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleNavigateRoot = useCallback(() => {
    if (window.location.pathname !== '/') {
      window.history.pushState({ root: true }, '', '/');
    }
    setLocationUrl('/');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const handleToggleSidebar = useCallback(() => {
    persistSettings({ ...settings, sidebarCollapsed: !settings.sidebarCollapsed });
  }, [persistSettings, settings]);

  const handleToggleTheme = useCallback(() => {
    persistSettings({
      ...settings,
      theme: settings.theme === 'light' ? 'dark' : 'light',
    });
  }, [persistSettings, settings]);

  const handleSaveSettings = useCallback(
    (next: WorkspaceSettings) => persistSettings(next, false),
    [persistSettings],
  );

  const handleResetSettings = useCallback(
    () => persistSettings({ ...DEFAULT_WORKSPACE_SETTINGS }, false),
    [persistSettings],
  );

  const userProfile: UserProfile = useMemo(
    () => ({
      ...DEFAULT_USER_PROFILE,
      name: settings.displayName,
      initials: getInitials(settings.displayName),
    }),
    [settings.displayName],
  );

  const breadcrumbs = useMemo(() => {
    if (currentRoute === null) {
      return getNotFoundBreadcrumbs(settings.workspaceName);
    }
    return getBreadcrumbsForRoute(currentRoute, settings.workspaceName);
  }, [currentRoute, settings.workspaceName]);

  return (
    <AppShell
      workspaceName={settings.workspaceName}
      currentRoute={currentRoute}
      breadcrumbs={breadcrumbs}
      sidebarCollapsed={settings.sidebarCollapsed}
      theme={settings.theme}
      density={settings.density}
      user={userProfile}
      sessionNotice={sessionNotice}
      onDismissNotice={() => setSessionNotice(null)}
      onSessionNotice={setSessionNotice}
      onNavigate={handleNavigate}
      onNavigateRoot={handleNavigateRoot}
      onToggleSidebar={handleToggleSidebar}
      onToggleTheme={handleToggleTheme}
    >
      {currentRoute === 'dashboard' && (
        <DashboardView breadcrumbs={breadcrumbs} onNavigate={handleNavigate} />
      )}
      {currentRoute === 'learning' && (
        <LearningView breadcrumbs={breadcrumbs} onNavigate={handleNavigate} />
      )}
      {currentRoute === 'handbook' && (
        <HandbookView
          breadcrumbs={breadcrumbs}
          onNavigate={handleNavigate}
          deepLinkItemId={handbookItemId}
          onOpenHandbookItem={handleOpenHandbookItem}
        />
      )}
      {currentRoute === 'projects' && (
        <ProjectsView
          breadcrumbs={breadcrumbs}
          onNavigate={handleNavigate}
          onOpenHandbookItem={handleOpenHandbookItem}
        />
      )}
      {currentRoute === 'settings' && (
        <SettingsView
          breadcrumbs={breadcrumbs}
          settings={settings}
          onSaveSettings={handleSaveSettings}
          onResetSettings={handleResetSettings}
          onNavigate={handleNavigate}
        />
      )}
      {resolution.kind === 'not-found' && (
        <NotFoundView
          pathname={resolution.pathname}
          breadcrumbs={breadcrumbs}
          defaultRoute={settings.defaultRoute}
          onNavigate={handleNavigate}
          onNavigateRoot={handleNavigateRoot}
        />
      )}
    </AppShell>
  );
}
