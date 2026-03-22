export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem',    // 48px
  '6xl': '3.75rem', // 60px
} as const;

export const fontWeights = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const lineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

export const fontFamilies = {
  sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
} as const;

/** Semantic text styles combining size, weight, and line height. */
export const textStyles = {
  displayLarge: { fontSize: fontSizes['5xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights.tight },
  displayMedium: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights.tight },
  displaySmall: { fontSize: fontSizes['3xl'], fontWeight: fontWeights.semibold, lineHeight: lineHeights.snug },
  headingLarge: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.semibold, lineHeight: lineHeights.snug },
  headingMedium: { fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, lineHeight: lineHeights.snug },
  headingSmall: { fontSize: fontSizes.lg, fontWeight: fontWeights.semibold, lineHeight: lineHeights.normal },
  bodyLarge: { fontSize: fontSizes.lg, fontWeight: fontWeights.normal, lineHeight: lineHeights.relaxed },
  bodyMedium: { fontSize: fontSizes.base, fontWeight: fontWeights.normal, lineHeight: lineHeights.normal },
  bodySmall: { fontSize: fontSizes.sm, fontWeight: fontWeights.normal, lineHeight: lineHeights.normal },
  caption: { fontSize: fontSizes.xs, fontWeight: fontWeights.normal, lineHeight: lineHeights.normal },
  label: { fontSize: fontSizes.sm, fontWeight: fontWeights.medium, lineHeight: lineHeights.normal },
  overline: { fontSize: fontSizes.xs, fontWeight: fontWeights.semibold, lineHeight: lineHeights.normal, letterSpacing: letterSpacings.widest },
  statLarge: { fontSize: fontSizes['4xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights.none },
  statMedium: { fontSize: fontSizes['2xl'], fontWeight: fontWeights.bold, lineHeight: lineHeights.none },
  statSmall: { fontSize: fontSizes.xl, fontWeight: fontWeights.semibold, lineHeight: lineHeights.none },
} as const;

export type FontSize = keyof typeof fontSizes;
export type FontWeight = keyof typeof fontWeights;
export type LineHeight = keyof typeof lineHeights;
export type TextStyle = keyof typeof textStyles;
