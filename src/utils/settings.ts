import type { DensityMode, RouteId, ThemeMode, UserProfile, WorkspaceSettings } from '../types/foundation';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Jasasaja',
  email: 'csjasasaja@gmail.com',
  role: 'Principal Engineer',
  initials: 'JA',
};

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  workspaceName: 'JASASAJA',
  displayName: 'Jasasaja',
  defaultRoute: 'dashboard',
  theme: 'light',
  density: 'comfortable',
  sidebarCollapsed: false,
  bio: 'Personal operating system for structured learning, engineering standards, and project execution.',
};

const VALID_ROUTES = new Set<RouteId>(['dashboard', 'learning', 'handbook', 'projects', 'settings']);
const VALID_THEMES = new Set<ThemeMode>(['light', 'dark']);
const VALID_DENSITIES = new Set<DensityMode>(['comfortable', 'compact']);

export function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) {
    return 'JA';
  }
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function normalizeSettings(raw: Partial<WorkspaceSettings> | null | undefined): WorkspaceSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_WORKSPACE_SETTINGS };
  }

  const workspaceName =
    typeof raw.workspaceName === 'string' && raw.workspaceName.trim().length > 0
      ? raw.workspaceName.trim().slice(0, 40)
      : DEFAULT_WORKSPACE_SETTINGS.workspaceName;

  const displayName =
    typeof raw.displayName === 'string' && raw.displayName.trim().length > 0
      ? raw.displayName.trim().slice(0, 50)
      : DEFAULT_WORKSPACE_SETTINGS.displayName;

  const defaultRoute =
    raw.defaultRoute && VALID_ROUTES.has(raw.defaultRoute)
      ? raw.defaultRoute
      : DEFAULT_WORKSPACE_SETTINGS.defaultRoute;

  const theme =
    raw.theme && VALID_THEMES.has(raw.theme)
      ? raw.theme
      : DEFAULT_WORKSPACE_SETTINGS.theme;

  const density =
    raw.density && VALID_DENSITIES.has(raw.density)
      ? raw.density
      : DEFAULT_WORKSPACE_SETTINGS.density;

  const sidebarCollapsed =
    typeof raw.sidebarCollapsed === 'boolean'
      ? raw.sidebarCollapsed
      : DEFAULT_WORKSPACE_SETTINGS.sidebarCollapsed;

  const bio =
    typeof raw.bio === 'string'
      ? raw.bio.slice(0, 240)
      : DEFAULT_WORKSPACE_SETTINGS.bio;

  return {
    workspaceName,
    displayName,
    defaultRoute,
    theme,
    density,
    sidebarCollapsed,
    bio,
  };
}

export interface SettingsValidationErrors {
  workspaceName?: string;
  displayName?: string;
  bio?: string;
}

export function validateWorkspaceSettings(draft: WorkspaceSettings): SettingsValidationErrors {
  const errors: SettingsValidationErrors = {};

  if (!draft.workspaceName.trim()) {
    errors.workspaceName = 'Workspace name is required.';
  } else if (draft.workspaceName.trim().length < 2) {
    errors.workspaceName = 'Workspace name must be at least 2 characters.';
  }

  if (!draft.displayName.trim()) {
    errors.displayName = 'Display name is required.';
  } else if (draft.displayName.trim().length < 2) {
    errors.displayName = 'Display name must be at least 2 characters.';
  }

  if (draft.bio.length > 240) {
    errors.bio = 'Bio must be 240 characters or fewer.';
  }

  return errors;
}

const STORAGE_KEY = 'jasasaja.personal-os.settings.v1';

export interface StorageWriteResult {
  ok: boolean;
  error?: string;
}

export function loadWorkspaceSettings(): WorkspaceSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_WORKSPACE_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_WORKSPACE_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<WorkspaceSettings>;
    return normalizeSettings(parsed);
  } catch {
    return { ...DEFAULT_WORKSPACE_SETTINGS };
  }
}

export function saveWorkspaceSettings(
  settings: WorkspaceSettings,
  storage?: Pick<Storage, 'setItem'> | null,
): StorageWriteResult {
  const targetStorage =
    storage !== undefined
      ? storage
      : typeof window !== 'undefined'
        ? window.localStorage
        : null;

  if (!targetStorage) {
    return {
      ok: false,
      error:
        'Browser localStorage is unavailable. Preferences apply to the current session only.',
    };
  }

  try {
    targetStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return { ok: true };
  } catch (err) {
    const reason =
      err instanceof Error && err.message
        ? err.message
        : 'Storage access blocked or quota exceeded';
    return {
      ok: false,
      error: `Failed to save temporary preferences (${reason}). Changes apply to this session only.`,
    };
  }
}
