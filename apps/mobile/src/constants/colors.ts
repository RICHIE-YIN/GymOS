export const Colors = {
  // Primary blue palette
  primary: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutral
  white:   '#FFFFFF',
  black:   '#000000',
  gray: {
    50:  '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Semantic
  success:  '#22C55E',
  successLight: '#DCFCE7',
  warning:  '#F59E0B',
  warningLight: '#FEF3C7',
  error:    '#EF4444',
  errorLight: '#FEE2E2',
  info:     '#3B82F6',
  infoLight: '#DBEAFE',

  // Backgrounds
  background: '#F8FAFC',
  backgroundDark: '#0F172A',
  card: '#FFFFFF',
  cardDark: '#1E293B',
  border: '#E2E8F0',
  borderDark: '#334155',

  // Text
  textPrimary:   '#0F172A',
  textSecondary: '#64748B',
  textTertiary:  '#94A3B8',
  textInverse:   '#FFFFFF',

  // Fitness accent colors
  muscle:   '#8B5CF6', // violet
  energy:   '#F97316', // orange
  recovery: '#06B6D4', // cyan
  strength: '#EC4899', // pink

  // Macro colors
  protein:  '#3B82F6',
  carbs:    '#F59E0B',
  fat:      '#EF4444',
  calories: '#8B5CF6',

  // Gradients (start/end pairs)
  gradients: {
    primary:  ['#3B82F6', '#1D4ED8'],
    energy:   ['#F97316', '#EA580C'],
    success:  ['#22C55E', '#16A34A'],
    purple:   ['#8B5CF6', '#7C3AED'],
    sunset:   ['#F97316', '#EC4899'],
    ocean:    ['#06B6D4', '#3B82F6'],
  },
} as const;

export type ColorKey = keyof typeof Colors;
