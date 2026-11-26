import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_WORKSPACE_SETTINGS,
  getInitials,
  normalizeSettings,
  saveWorkspaceSettings,
  validateWorkspaceSettings,
} from './settings';

test('getInitials computes deterministic 2-letter avatars', () => {
  assert.equal(getInitials('Jasasaja'), 'JA');
  assert.equal(getInitials('Ada Lovelace'), 'AL');
  assert.equal(getInitials('   '), 'JA');
});

test('normalizeSettings safely recovers invalid or partial inputs', () => {
  const normalized = normalizeSettings({
    workspaceName: '  Core Lab  ',
    theme: 'dark',
    defaultRoute: 'invalid-route' as never,
    sidebarCollapsed: true,
  });

  assert.equal(normalized.workspaceName, 'Core Lab');
  assert.equal(normalized.theme, 'dark');
  assert.equal(normalized.defaultRoute, DEFAULT_WORKSPACE_SETTINGS.defaultRoute);
  assert.equal(normalized.sidebarCollapsed, true);
});

test('validateWorkspaceSettings rejects empty names and long bios', () => {
  const errors = validateWorkspaceSettings({
    ...DEFAULT_WORKSPACE_SETTINGS,
    workspaceName: ' ',
    displayName: 'A',
    bio: 'x'.repeat(245),
  });

  assert.equal(errors.workspaceName, 'Nama ruang kerja wajib diisi.');
  assert.equal(errors.displayName, 'Nama tampilan minimal 2 karakter.');
  assert.equal(errors.bio, 'Ringkasan maksimal 240 karakter.');
});

test('validateWorkspaceSettings passes for valid defaults', () => {
  const errors = validateWorkspaceSettings(DEFAULT_WORKSPACE_SETTINGS);
  assert.deepEqual(errors, {});
});

test('saveWorkspaceSettings returns ok: true when storage succeeds and descriptive error when storage fails', () => {
  let writtenKey = '';
  let writtenValue = '';
  const okResult = saveWorkspaceSettings(DEFAULT_WORKSPACE_SETTINGS, {
    setItem(key, value) {
      writtenKey = key;
      writtenValue = value;
    },
  });
  assert.equal(okResult.ok, true);
  assert.match(writtenKey, /settings/);
  assert.match(writtenValue, /JASASAJA/);

  const unavailableResult = saveWorkspaceSettings(DEFAULT_WORKSPACE_SETTINGS, null);
  assert.equal(unavailableResult.ok, false);
  assert.match(unavailableResult.error ?? '', /localStorage browser tidak tersedia/i);

  const quotaErrorResult = saveWorkspaceSettings(DEFAULT_WORKSPACE_SETTINGS, {
    setItem() {
      throw new Error('QuotaExceededError');
    },
  });
  assert.equal(quotaErrorResult.ok, false);
  assert.match(quotaErrorResult.error ?? '', /QuotaExceededError/);
});
