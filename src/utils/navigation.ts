import type { BreadcrumbItem, NavItem, RouteId } from '../types/foundation';

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    description: 'Ringkasan aktivitas ruang kerja untuk Learning Center, Handbook, dan Project Workspace.',
  },
  {
    id: 'learning',
    label: 'Learning',
    path: '/learning',
    description: 'Jalur belajar terstruktur, catatan aktif, dan antrean pengulangan berjadwal.',
  },
  {
    id: 'handbook',
    label: 'Handbook',
    path: '/handbook',
    description: 'Panduan engineering pribadi, keputusan arsitektur, dan standar kerja.',
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    description: 'Proyek aktif, pelacakan milestone, dan spesifikasi teknis.',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    description: 'Identitas ruang kerja, preferensi tampilan, dan konfigurasi tata letak.',
  },
] as const;

const ROUTE_BY_ID: Record<RouteId, NavItem> = {
  dashboard: NAV_ITEMS[0],
  learning: NAV_ITEMS[1],
  handbook: NAV_ITEMS[2],
  projects: NAV_ITEMS[3],
  settings: NAV_ITEMS[4],
};

export type RouteResolution =
  | { kind: 'route'; routeId: RouteId; isRoot: boolean }
  | { kind: 'not-found'; pathname: string };

export function getNavItem(routeId: RouteId): NavItem {
  return ROUTE_BY_ID[routeId] ?? NAV_ITEMS[0];
}

export function normalizePathname(pathname: string): string {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? '/';
  const trimmed = withoutQuery.trim().toLowerCase().replace(/\/+$/, '');
  return trimmed || '/';
}

export function resolveRoute(pathname: string, defaultRoute: RouteId = 'dashboard'): RouteResolution {
  const normalized = normalizePathname(pathname);

  if (normalized === '/') {
    return { kind: 'route', routeId: defaultRoute, isRoot: true };
  }

  if (normalized === '/dashboard') {
    return { kind: 'route', routeId: 'dashboard', isRoot: false };
  }

  const matched = NAV_ITEMS.find((item) => item.path === normalized);
  if (matched) {
    return { kind: 'route', routeId: matched.id, isRoot: false };
  }

  return { kind: 'not-found', pathname: pathname.trim() || '/' };
}

export function resolveRouteFromPath(pathname: string, defaultRoute: RouteId = 'dashboard'): RouteId {
  const resolved = resolveRoute(pathname, defaultRoute);
  return resolved.kind === 'route' ? resolved.routeId : 'dashboard';
}

export function isNavItemActive(currentRoute: RouteId | null, itemId: RouteId): boolean {
  return currentRoute !== null && currentRoute === itemId;
}

export function getBreadcrumbsForRoute(
  routeId: RouteId,
  workspaceName = 'JASASAJA OS',
  subSection?: string,
): BreadcrumbItem[] {
  const item = getNavItem(routeId);

  if (routeId === 'dashboard' && !subSection) {
    return [
      { label: workspaceName, routeId: 'dashboard' },
      { label: 'Dashboard', routeId: 'dashboard', current: true },
    ];
  }

  const trail: BreadcrumbItem[] = [{ label: workspaceName, routeId: 'dashboard' }];

  if (subSection) {
    trail.push({ label: item.label, routeId: item.id });
    trail.push({ label: subSection, current: true });
  } else {
    trail.push({ label: item.label, routeId: item.id, current: true });
  }

  return trail;
}

export function getNotFoundBreadcrumbs(workspaceName = 'JASASAJA OS'): BreadcrumbItem[] {
  return [
    { label: workspaceName, routeId: 'dashboard' },
    { label: 'Tidak Ditemukan', current: true },
  ];
}
