/**
 * Border radius tokens.
 * Values are CSS border-radius strings.
 */
export const borderRadius = {
  /** No rounding — sharp corners */
  none: '0px',
  /** Minimal rounding — 2px */
  xs: '0.125rem',
  /** Small rounding for chips and tags — 4px */
  sm: '0.25rem',
  /** Default rounding for inputs and small cards — 6px */
  md: '0.375rem',
  /** Standard rounding for cards — 8px */
  lg: '0.5rem',
  /** Large rounding for modals and sheets — 12px */
  xl: '0.75rem',
  /** Extra-large rounding for panels — 16px */
  '2xl': '1rem',
  /** Maximum named rounding — 24px */
  '3xl': '1.5rem',
  /** Full pill/circle rounding */
  full: '9999px',
} as const;

/** Semantic border-radius aliases for common UI components. */
export const componentRadius = {
  /** Standard button radius */
  button: borderRadius.lg,
  /** Pill-style button or badge */
  buttonPill: borderRadius.full,
  /** Input field radius */
  input: borderRadius.md,
  /** Card radius */
  card: borderRadius.xl,
  /** Modal / bottom sheet radius (top corners) */
  modal: borderRadius['2xl'],
  /** Avatar / profile photo */
  avatar: borderRadius.full,
  /** Badge / chip */
  badge: borderRadius.full,
  /** Tooltip */
  tooltip: borderRadius.md,
  /** Tag / label */
  tag: borderRadius.sm,
  /** Progress bar */
  progressBar: borderRadius.full,
} as const;

export type BorderRadiusKey = keyof typeof borderRadius;
export type ComponentRadiusKey = keyof typeof componentRadius;
