import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { getFocusableElements, getNextTrapTarget, isTopmostModal } from '../../utils/focusTrap';
import { TYPOGRAPHY_CLASSES } from '../../design-system/tokens';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'md',
  closeOnBackdrop = true,
  children,
  footer,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
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
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = getFocusableElements(panel);
      const preferred =
        panel.querySelector<HTMLElement>('[autofocus]') ?? focusables[0] ?? panel;
      preferred.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel || !isTopmostModal(panel)) return;

      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key === 'Tab') {
        const focusables = getFocusableElements(panel);
        const active = document.activeElement as HTMLElement | null;
        const nextTarget = getNextTrapTarget(focusables, active, event.shiftKey, panel);
        if (nextTarget) {
          event.preventDefault();
          nextTarget.focus();
        }
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const panel = panelRef.current;
      if (!panel || !isTopmostModal(panel)) return;
      const target = event.target as Node | null;
      if (target && !panel.contains(target)) {
        const focusables = getFocusableElements(panel);
        (focusables[0] ?? panel).focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('focusin', handleFocusIn);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('focusin', handleFocusIn);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-150"
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full rounded-xl bg-surface-elevated border border-line shadow-overlay',
          'flex flex-col max-h-[calc(100dvh-2rem)] overflow-hidden',
          SIZE_CLASSES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6 border-b border-line">
          <div className="min-w-0">
            <h2 id={titleId} className={TYPOGRAPHY_CLASSES.cardHeading}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="text-sm leading-normal text-ink-secondary mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="min-h-9 min-w-9 inline-flex items-center justify-center rounded-lg text-ink-muted hover:text-ink hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-4 sm:px-6 overflow-y-auto flex-1 text-sm text-ink">
          {children}
        </div>

        {footer && (
          <div className="px-5 py-3.5 sm:px-6 border-t border-line bg-surface-subtle/40 flex flex-wrap items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
