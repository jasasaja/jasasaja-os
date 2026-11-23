import { useState } from 'react';
import { ChevronUp, Info, Moon, Settings, Sun, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Dialog, Dropdown, StatusIndicator, type DropdownEntry } from '../ui';
import type { RouteId, ThemeMode, UserProfile } from '../../types/foundation';

export interface UserProfileMenuProps {
  user: UserProfile;
  theme: ThemeMode;
  compact?: boolean;
  align?: 'left' | 'right';
  onToggleTheme: () => void;
  onNavigate: (routeId: RouteId) => void;
  onSessionNotice?: (message: string) => void;
}

export function UserProfileMenu({
  user,
  theme,
  compact = false,
  align = 'left',
  onToggleTheme,
  onNavigate,
}: UserProfileMenuProps) {
  const [profileOpen, setProfileOpen] = useState(false);

  const menuItems: DropdownEntry[] = [
    {
      id: 'profile',
      label: 'Account & Auth Status',
      icon: <User className="h-4 w-4" />,
      onSelect: () => setProfileOpen(true),
    },
    {
      id: 'settings',
      label: 'Workspace Settings',
      icon: <Settings className="h-4 w-4" />,
      onSelect: () => onNavigate('settings'),
    },
    {
      id: 'theme',
      label: theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode',
      icon: theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
      onSelect: onToggleTheme,
    },
    {
      id: 'auth-info',
      label: 'Authentication Unavailable',
      icon: <Info className="h-4 w-4" />,
      dividerBefore: true,
      onSelect: () => setProfileOpen(true),
    },
  ];

  return (
    <>
      <Dropdown
        align={align}
        label={user.email}
        items={menuItems}
        className={compact ? 'inline-block' : 'w-full'}
        trigger={(triggerProps) => (
          <button
            type="button"
            {...triggerProps}
            aria-label={`User menu for ${user.name}`}
            className={cn(
              'flex items-center gap-3 rounded-lg transition-colors duration-150 cursor-pointer text-left',
              'hover:bg-surface-subtle focus-visible:bg-surface-subtle',
              compact
                ? 'min-h-10 p-1.5'
                : 'w-full min-h-11 px-2.5 py-2',
            )}
          >
            <span
              className="h-8 w-8 rounded-lg bg-accent-soft text-accent-ink border border-accent/20 text-xs font-semibold inline-flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              {user.initials}
            </span>
            {!compact && (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm leading-normal font-medium text-ink truncate">
                    {user.name}
                  </span>
                  <span className="block text-[13px] leading-normal text-ink-muted truncate">
                    {user.email}
                  </span>
                </span>
                <ChevronUp
                  className={cn(
                    'h-4 w-4 text-ink-muted shrink-0 transition-transform duration-150',
                    triggerProps['aria-expanded'] ? 'rotate-180' : '',
                  )}
                  aria-hidden="true"
                />
              </>
            )}
          </button>
        )}
      />

      <Dialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Workspace Profile & Authentication"
        description="Local operator identity for this foundation workspace."
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3.5 pb-4 border-b border-line">
            <div className="h-12 w-12 rounded-xl bg-accent-soft text-accent-ink border border-accent/20 text-base font-semibold flex items-center justify-center shrink-0">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-ink truncate">{user.name}</p>
              <p className="text-sm text-ink-secondary truncate">{user.email}</p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm leading-normal">
            <div>
              <dt className="text-[13px] leading-normal text-ink-muted">Role</dt>
              <dd className="font-medium text-ink mt-0.5">{user.role}</dd>
            </div>
            <div>
              <dt className="text-[13px] leading-normal text-ink-muted">Theme</dt>
              <dd className="font-medium text-ink mt-0.5 capitalize">{theme}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[13px] leading-normal text-ink-muted mb-1">Authentication</dt>
              <dd>
                <StatusIndicator status="inactive" label="Not available yet" size="sm" />
              </dd>
            </div>
          </dl>

          <p className="text-[13px] text-ink-secondary leading-relaxed pt-3 border-t border-line">
            Authentication and sign-out are not yet available in this foundation build. UI preferences are stored temporarily in browser localStorage and do not replace an application database.
          </p>
        </div>
      </Dialog>
    </>
  );
}
