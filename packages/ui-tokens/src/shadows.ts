/**
 * Shadow tokens for elevation levels across the UI.
 * Values are CSS box-shadow strings.
 */
export const shadows = {
  /** No shadow — flat surface */
  none: 'none',

  /** Subtle shadow for slightly raised elements (e.g. chips, tags) */
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',

  /** Default card shadow */
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.10), 0 1px 2px -1px rgba(0, 0, 0, 0.10)',

  /** Medium elevation for interactive cards */
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.10)',

  /** Large elevation for dropdowns and popovers */
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.10), 0 4px 6px -4px rgba(0, 0, 0, 0.10)',

  /** Extra-large shadow for modals and drawers */
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.10), 0 8px 10px -6px rgba(0, 0, 0, 0.10)',

  /** Maximum elevation for overlays */
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  /** Inner shadow for pressed / inset states */
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

/** Semantic shadow aliases for common UI components. */
export const componentShadows = {
  /** Standard card at rest */
  card: shadows.sm,
  /** Card in hovered/focused state */
  cardHover: shadows.md,
  /** Bottom sheet and drawer */
  drawer: shadows.xl,
  /** Dialog and modal */
  modal: shadows['2xl'],
  /** Floating action button */
  fab: shadows.lg,
  /** Primary button default */
  button: shadows.xs,
  /** Primary button pressed */
  buttonPressed: shadows.inner,
  /** Navigation bar / tab bar */
  navbar: shadows.sm,
  /** Dropdown / select menu */
  dropdown: shadows.lg,
  /** Tooltip */
  tooltip: shadows.md,
  /** Input field focus ring (use with outline) */
  inputFocus: '0 0 0 3px rgba(59, 130, 246, 0.30)',
} as const;

export type ShadowKey = keyof typeof shadows;
export type ComponentShadowKey = keyof typeof componentShadows;
