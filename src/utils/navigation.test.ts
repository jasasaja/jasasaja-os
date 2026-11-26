import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NAV_ITEMS,
  getBreadcrumbsForRoute,
  getNavItem,
  getNotFoundBreadcrumbs,
  isNavItemActive,
  resolveRoute,
} from './navigation';

test('NAV_ITEMS contains the five required primary routes with explicit module paths', () => {
  assert.deepEqual(
    NAV_ITEMS.map((item) => ({ label: item.label, path: item.path })),
    [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Learning', path: '/learning' },
      { label: 'Handbook', path: '/handbook' },
      { label: 'Projects', path: '/projects' },
      { label: 'Settings', path: '/settings' },
    ],
  );
});

test('resolveRoute honors defaultRoute on root /', () => {
  assert.deepEqual(resolveRoute('/', 'dashboard'), {
    kind: 'route',
    routeId: 'dashboard',
    isRoot: true,
  });
  assert.deepEqual(resolveRoute('/', 'learning'), {
    kind: 'route',
    routeId: 'learning',
    isRoot: true,
  });
  assert.deepEqual(resolveRoute('/', 'projects'), {
    kind: 'route',
    routeId: 'projects',
    isRoot: true,
  });
});

test('resolveRoute always opens dashboard on /dashboard regardless of defaultRoute', () => {
  assert.deepEqual(resolveRoute('/dashboard', 'learning'), {
    kind: 'route',
    routeId: 'dashboard',
    isRoot: false,
  });
  assert.deepEqual(resolveRoute('/dashboard/', 'settings'), {
    kind: 'route',
    routeId: 'dashboard',
    isRoot: false,
  });
});

test('resolveRoute opens direct module URLs regardless of defaultRoute', () => {
  assert.deepEqual(resolveRoute('/learning', 'dashboard'), {
    kind: 'route',
    routeId: 'learning',
    isRoot: false,
  });
  assert.deepEqual(resolveRoute('/Handbook/', 'projects'), {
    kind: 'route',
    routeId: 'handbook',
    isRoot: false,
  });
  assert.deepEqual(resolveRoute('/projects?tab=1', 'dashboard'), {
    kind: 'route',
    routeId: 'projects',
    isRoot: false,
  });
  assert.deepEqual(resolveRoute('/settings', 'dashboard'), {
    kind: 'route',
    routeId: 'settings',
    isRoot: false,
  });
});

test('resolveRoute returns consistent not-found resolution for unknown routes', () => {
  assert.deepEqual(resolveRoute('/unknown-path', 'learning'), {
    kind: 'not-found',
    pathname: '/unknown-path',
  });
  assert.deepEqual(resolveRoute('/learning/extra', 'dashboard'), {
    kind: 'not-found',
    pathname: '/learning/extra',
  });
});

test('breadcrumbs and active checks work for known and unknown routes', () => {
  const dashTrail = getBreadcrumbsForRoute('dashboard', 'JASASAJA');
  assert.equal(dashTrail[1].current, true);

  const notFoundTrail = getNotFoundBreadcrumbs('JASASAJA');
  assert.equal(notFoundTrail[1].label, 'Tidak Ditemukan');
  assert.equal(notFoundTrail[1].current, true);

  assert.equal(isNavItemActive('projects', 'projects'), true);
  assert.equal(isNavItemActive(null, 'dashboard'), false);
  assert.equal(getNavItem('dashboard').path, '/dashboard');
});
