export type RouteId = 'dashboard' | 'learning' | 'handbook' | 'projects' | 'settings';

export type ThemeMode = 'light' | 'dark';

export type DensityMode = 'comfortable' | 'compact';

export interface NavItem {
  id: RouteId;
  label: string;
  path: string;
  description: string;
}

export interface BreadcrumbItem {
  label: string;
  routeId?: RouteId;
  href?: string;
  current?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  initials: string;
}

export interface WorkspaceSettings {
  workspaceName: string;
  displayName: string;
  defaultRoute: RouteId;
  theme: ThemeMode;
  density: DensityMode;
  sidebarCollapsed: boolean;
  bio: string;
}

export type SemanticTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export type StatusKind = 'active' | 'pending' | 'warning' | 'error' | 'inactive';
