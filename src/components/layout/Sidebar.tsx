import React from 'react';
import {
  BookOpen,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { NAV_ITEMS, isNavItemActive } from '../../utils/navigation';
import { Tooltip } from '../ui';
import { UserProfileMenu } from './UserProfileMenu';
import type { RouteId, ThemeMode, UserProfile } from '../../types/foundation';

export const ROUTE_ICONS: Record<RouteId, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  learning: GraduationCap,
  handbook: BookOpen,
  projects: FolderKanban,
  settings: Settings,
};

export interface SidebarProps {
  workspaceName: string;
  currentRoute: RouteId | null;
  collapsed: boolean;
  theme: ThemeMode;
  user: UserProfile;
  onNavigate: (routeId: RouteId) => void;
  onNavigateRoot: () => void;
  onToggleCollapse: () => void;
  onToggleTheme: () => void;
  onSessionNotice?: (message: string) => void;
}

export function Sidebar({
  workspaceName,
  currentRoute,
  collapsed,
  theme,
  user,
  onNavigate,
  onNavigateRoot,
  onToggleCollapse,
  onToggleTheme,
  onSessionNotice,
}: SidebarProps) {
  return (
    <aside
      aria-label="Workspace sidebar"
      className={cn(
        'hidden lg:flex flex-col shrink-0 border-r border-line bg-surface select-none',
        'transition-[width] duration-150 ease-out sticky top-0 h-dvh',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          'h-14 flex items-center border-b border-line shrink-0',
          collapsed ? 'justify-center px-2' : 'justify-between px-4',
        )}
      >
        {!collapsed && (
          <button
            type="button"
            onClick={onNavigateRoot}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer rounded-md py-1 px-1 -ml-1 hover:bg-surface-subtle transition-colors"
          >
            <span
              className="h-7 w-7 rounded-lg bg-accent text-white text-xs font-bold inline-flex items-center justify-center shrink-0 tracking-tight"
              aria-hidden="true"
            >
              JS
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-ink whitespace-nowrap truncate">
              {workspaceName}
            </span>
          </button>
        )}

        <Tooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="right">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            className="min-h-9 min-w-9 inline-flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </Tooltip>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ROUTE_ICONS[item.id];
          const active = isNavItemActive(currentRoute, item.id);

          const button = (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                'w-full min-h-10 flex items-center rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap',
                collapsed ? 'justify-center px-2' : 'gap-3 px-3',
                active
                  ? 'bg-accent-soft text-accent-ink'
                  : 'text-ink-secondary hover:text-ink hover:bg-surface-subtle',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  active ? 'text-accent' : 'text-ink-muted',
                )}
                aria-hidden="true"
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} content={item.label} side="right">
                {button}
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      {/* User Profile Area */}
      <div className={cn('p-3 border-t border-line shrink-0', collapsed && 'flex justify-center')}>
        <UserProfileMenu
          user={user}
          theme={theme}
          compact={collapsed}
          align="left"
          onToggleTheme={onToggleTheme}
          onNavigate={onNavigate}
          onSessionNotice={onSessionNotice}
        />
      </div>
    </aside>
  );
}
