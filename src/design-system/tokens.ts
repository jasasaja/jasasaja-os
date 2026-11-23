/**
 * Consolidated UI typography presets consumed across modules.
 *
 * Visual direction & CSS primitives live in `src/index.css`:
 * - Fonts (`--font-display`, `--font-sans`, `--font-mono`) with system fallbacks
 * - Line-heights (`--leading-tight` 1.25, `--leading-snug` 1.375, `--leading-normal` 1.5, `--leading-relaxed` 1.625)
 * - Spacing rhythm (4 / 8 / 12 / 16 / 24 / 32px) and radii (`rounded-md` 6px, `rounded-lg` 8px, `rounded-xl` 12px)
 */
export const MINIMUM_IMPORTANT_TEXT_PX = 13;

export const TYPOGRAPHY_CLASSES = {
  pageTitle: 'font-display text-2xl font-semibold tracking-[-0.02em] leading-tight text-ink',
  sectionHeading: 'font-display text-lg font-semibold tracking-[-0.015em] leading-snug text-ink',
  cardHeading: 'font-display text-base font-semibold tracking-[-0.01em] leading-snug text-ink',
  body: 'font-sans text-sm leading-normal',
  supporting: 'font-sans text-[13px] leading-normal',
  code: 'font-mono text-[13px] leading-normal tabular-nums',
} as const;
