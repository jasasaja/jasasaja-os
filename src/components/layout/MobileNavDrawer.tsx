import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getFocusableElements, getNextTrapTarget, isTopmostModal } from '../../utils/focusTrap';
import { NAV_ITEMS, isNavItemActive } from '../../utils/navigation';
import { ROUTE_ICONS } from './Sidebar';
import { UserProfileMenu } from './UserProfileMenu';
import type { RouteId, ThemeMode, UserProfile } from '../../types/foundation';

export interface MobileNavDrawerProps {
  open: boolean;
  workspaceName: string;
  currentRoute: RouteId | null;
  theme: ThemeMode;
  user: UserProfile;
  onClose: () => void;
  onNavigate: (routeId: RouteId) => void;
  onToggleTheme: () => void;
  onSessionNotice?: (message: string) => void;
}

export function MobileNavDrawer({
  open,
  workspaceName,
  currentRoute,
  theme,
  user,
  onClose,
  onNavigate,
  onToggleTheme,
  onSessionNotice,
}: MobileNavDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const drawer = drawerRef.current;
      if (!drawer) return;
      if (closeButtonRef.current) {
        closeButtonRef.current.focus();
      } else {
        const focusables = getFocusableElements(drawer);
        (focusables[0] ?? drawer).focus();
      }
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      const drawer = drawerRef.current;
      if (!drawer || !isTopmostModal(drawer)) return;

      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getFocusableElements(drawer);
        const active = document.activeElement as HTMLElement | null;
        const nextTarget = getNextTrapTarget(focusables, active, event.shiftKey, drawer);
        if (nextTarget) {
          event.preventDefault();
          nextTarget.focus();
        }
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const drawer = drawerRef.current;
      if (!drawer || !isTopmostModal(drawer)) return;
      const target = event.target as Node | null;
      if (target && !drawer.contains(target)) {
        const focusables = getFocusableElements(drawer);
        (focusables[0] ?? drawer).focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocusIn);
      document.body.style.overflow = prevOverflow;
      if (previousFocusRef.current?.isConnected) {
        previousFocusRef.current.focus();
      }
    };
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden flex" role="presentation">
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={onClose}
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigasi mobile"
        tabIndex={-1}
        className="relative z-10 w-[280px] max-w-[85vw] h-dvh bg-surface border-r border-line shadow-overlay flex flex-col"
      >
        <div className="h-14 px-4 border-b border-line flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="h-7 w-7 rounded-lg bg-accent text-white text-xs font-bold inline-flex items-center justify-center shrink-0 tracking-tight"
              aria-hidden="true"
            >
              JS
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-ink whitespace-nowrap truncate">
              {workspaceName}
            </span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Tutup menu navigasi"
            className="min-h-11 min-w-11 -mr-2 inline-flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Navigasi utama mobile" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = ROUTE_ICONS[item.id];
            const active = isNavItemActive(currentRoute, item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'w-full min-h-11 flex items-center gap-3 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap',
                  active
                    ? 'bg-accent-soft text-accent-ink'
                    : 'text-ink-secondary hover:text-ink hover:bg-surface-subtle',
                )}
              >
                <Icon
                  className={cn('h-4 w-4 shrink-0', active ? 'text-accent' : 'text-ink-muted')}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-line shrink-0">
          <UserProfileMenu
            user={user}
            theme={theme}
            align="left"
            onToggleTheme={onToggleTheme}
            onNavigate={(routeId) => {
              onNavigate(routeId);
              onClose();
            }}
            onSessionNotice={onSessionNotice}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
