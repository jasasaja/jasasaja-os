import React, { useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Breadcrumb } from './Breadcrumb';
import { MobileNavDrawer } from './MobileNavDrawer';
import { Sidebar } from './Sidebar';
import { UserProfileMenu } from './UserProfileMenu';
import { Tooltip } from '../ui';
import type { BreadcrumbItem, DensityMode, RouteId, ThemeMode, UserProfile } from '../../types/foundation';

export interface AppShellProps {
  workspaceName: string;
  currentRoute: RouteId | null;
  breadcrumbs: BreadcrumbItem[];
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  density: DensityMode;
  user: UserProfile;
  sessionNotice: string | null;
  onDismissNotice: () => void;
  onSessionNotice: (message: string) => void;
  onNavigate: (routeId: RouteId) => void;
  onNavigateRoot: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  children: React.ReactNode;
}

export function AppShell({
  workspaceName,
  currentRoute,
  breadcrumbs,
  sidebarCollapsed,
  theme,
  density,
  user,
  sessionNotice,
  onDismissNotice,
  onSessionNotice,
  onNavigate,
  onNavigateRoot,
  onToggleSidebar,
  onToggleTheme,
  children,
}: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh flex bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-white focus:text-sm focus:font-medium"
      >
        Skip to main content
      </a>

      <Sidebar
        workspaceName={workspaceName}
        currentRoute={currentRoute}
        collapsed={sidebarCollapsed}
        theme={theme}
        user={user}
        onNavigate={onNavigate}
        onNavigateRoot={onNavigateRoot}
        onToggleCollapse={onToggleSidebar}
        onToggleTheme={onToggleTheme}
        onSessionNotice={onSessionNotice}
      />

      <MobileNavDrawer
        open={mobileMenuOpen}
        workspaceName={workspaceName}
        currentRoute={currentRoute}
        theme={theme}
        user={user}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={onNavigate}
        onToggleTheme={onToggleTheme}
        onSessionNotice={onSessionNotice}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Utility Header (56px / h-14, keeps mobile sticky header < 7% of viewport) */}
        <header className="sticky top-0 z-30 h-14 bg-surface/95 backdrop-blur-sm border-b border-line px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden min-h-11 min-w-11 -ml-2 inline-flex items-center justify-center rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={onNavigateRoot}
              className="lg:hidden flex items-center gap-2 min-w-0 cursor-pointer whitespace-nowrap"
            >
              <span
                className="h-7 w-7 rounded-lg bg-accent text-white text-xs font-bold inline-flex items-center justify-center shrink-0"
                aria-hidden="true"
              >
                JS
              </span>
              <span className="font-display text-sm font-bold tracking-tight text-ink truncate">
                {workspaceName}
              </span>
            </button>

            <div className="hidden lg:block min-w-0">
              <Breadcrumb items={breadcrumbs} onNavigate={onNavigate} />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Tooltip
              content={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              side="bottom"
              align="end"
            >
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                className="min-h-10 min-w-10 inline-flex items-center justify-center rounded-lg border border-line bg-surface text-ink-secondary hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </Tooltip>

            <div className="lg:hidden">
              <UserProfileMenu
                user={user}
                theme={theme}
                compact
                align="right"
                onToggleTheme={onToggleTheme}
                onNavigate={onNavigate}
                onSessionNotice={onSessionNotice}
              />
            </div>
          </div>
        </header>

        {/* Main Content Container */}
        <main
          id="main-content"
          className={cn(
            'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
            density === 'compact' ? 'py-4 sm:py-5' : 'py-6 sm:py-8',
          )}
        >
          {sessionNotice && (
            <div
              role="status"
              className="mb-5 px-4 py-3 rounded-lg border border-line bg-surface flex items-center justify-between gap-3 text-sm text-ink-secondary"
            >
              <span>{sessionNotice}</span>
              <button
                type="button"
                onClick={onDismissNotice}
                className="text-[13px] leading-normal font-medium text-accent hover:underline whitespace-nowrap cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
