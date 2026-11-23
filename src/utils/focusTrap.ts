export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function isElementFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') {
    return false;
  }

  if (el.closest('[inert], [aria-hidden="true"]')) {
    return false;
  }

  if (el.tabIndex < 0) {
    return false;
  }

  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }

  if (el.getClientRects().length === 0) {
    return false;
  }

  return true;
}

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter(isElementFocusable);
}

export function isTopmostModal(el: HTMLElement): boolean {
  const modals = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]'));
  return modals.length === 0 || modals[modals.length - 1] === el;
}

/**
 * Computes whether Tab / Shift+Tab must wrap or clamp focus inside a modal container.
 * Returns the target element to focus (caller should preventDefault), or null when
 * native Tab traversal between interior elements should proceed unhindered.
 */
export function getNextTrapTarget<T>(
  focusables: readonly T[],
  activeElement: T | null,
  shiftKey: boolean,
  fallbackContainer: T | null = null,
): T | null {
  if (focusables.length === 0) {
    return fallbackContainer;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (focusables.length === 1) {
    return first;
  }

  const activeIndex = activeElement ? focusables.indexOf(activeElement) : -1;

  if (shiftKey) {
    if (activeIndex <= 0) {
      return last;
    }
    return null;
  }

  if (activeIndex === -1 || activeIndex >= focusables.length - 1) {
    return first;
  }

  return null;
}
