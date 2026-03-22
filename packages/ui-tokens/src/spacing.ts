/**
 * Spacing scale based on a 4px base unit.
 * Keys represent the multiplier; values are pixel-equivalent rem strings.
 */
export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  7: '1.75rem',   // 28px
  8: '2rem',      // 32px
  9: '2.25rem',   // 36px
  10: '2.5rem',   // 40px
  11: '2.75rem',  // 44px
  12: '3rem',     // 48px
  14: '3.5rem',   // 56px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  28: '7rem',     // 112px
  32: '8rem',     // 128px
  36: '9rem',     // 144px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
  72: '18rem',    // 288px
  80: '20rem',    // 320px
  96: '24rem',    // 384px
} as const;

/** Named semantic spacing aliases for common layout patterns. */
export const semanticSpacing = {
  /** Tight spacing for dense UI — 4px */
  xs: spacing[1],
  /** Small spacing — 8px */
  sm: spacing[2],
  /** Medium spacing — 16px */
  md: spacing[4],
  /** Large spacing — 24px */
  lg: spacing[6],
  /** Extra-large spacing — 32px */
  xl: spacing[8],
  /** 2x extra-large spacing — 48px */
  '2xl': spacing[12],
  /** 3x extra-large spacing — 64px */
  '3xl': spacing[16],
  /** Page-level gutter — 16px (mobile), scales up */
  pageGutter: spacing[4],
  /** Card inner padding — 16px */
  cardPadding: spacing[4],
  /** Section vertical gap — 24px */
  sectionGap: spacing[6],
  /** Component vertical gap — 12px */
  componentGap: spacing[3],
  /** Input height — 48px */
  inputHeight: spacing[12],
  /** Button horizontal padding — 20px */
  buttonPaddingX: spacing[5],
  /** Button vertical padding — 12px */
  buttonPaddingY: spacing[3],
} as const;

export type SpacingKey = keyof typeof spacing;
export type SemanticSpacingKey = keyof typeof semanticSpacing;
