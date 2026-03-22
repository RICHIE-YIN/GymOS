/**
 * Animation duration tokens in milliseconds.
 */
export const durations = {
  /** Instant — for zero-delay state updates (0ms) */
  instant: 0,
  /** Ultra-fast — micro-interactions like button presses (75ms) */
  ultraFast: 75,
  /** Fast — simple fades and color transitions (150ms) */
  fast: 150,
  /** Normal — default for most UI transitions (200ms) */
  normal: 200,
  /** Moderate — slide-ins and expanding elements (300ms) */
  moderate: 300,
  /** Slow — modal and drawer entrance (400ms) */
  slow: 400,
  /** Deliberate — complex layout changes (500ms) */
  deliberate: 500,
  /** Lazy — splash screens and onboarding (700ms) */
  lazy: 700,
} as const;

/**
 * CSS easing functions (cubic-bezier and keywords).
 */
export const easings = {
  /** Linear — constant speed, use sparingly */
  linear: 'linear',
  /** Ease in — starts slow, good for exits */
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Ease out — starts fast, good for entrances */
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Ease in-out — smooth both ends, default for most transitions */
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  /** Spring-like — slight overshoot for bouncy feel */
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  /** Decelerate — material design decelerate curve */
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  /** Accelerate — material design accelerate curve */
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Sharp — quick snappy transitions */
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
} as const;

/**
 * Pre-composed CSS transition shorthand strings for common use cases.
 * Combine with a CSS `transition` property.
 */
export const transitions = {
  /** Fast fade for hover states */
  fade: `opacity ${durations.fast}ms ${easings.easeInOut}`,
  /** Color and background transitions */
  colors: `color ${durations.fast}ms ${easings.easeInOut}, background-color ${durations.fast}ms ${easings.easeInOut}, border-color ${durations.fast}ms ${easings.easeInOut}`,
  /** Shadow transition for card hovers */
  shadow: `box-shadow ${durations.normal}ms ${easings.easeOut}`,
  /** Transform transition for slide/scale animations */
  transform: `transform ${durations.moderate}ms ${easings.easeOut}`,
  /** All properties — use sparingly */
  all: `all ${durations.normal}ms ${easings.easeInOut}`,
  /** Modal entrance */
  modal: `opacity ${durations.moderate}ms ${easings.easeOut}, transform ${durations.moderate}ms ${easings.spring}`,
  /** Drawer / bottom sheet */
  drawer: `transform ${durations.slow}ms ${easings.decelerate}`,
  /** Button press feedback */
  button: `transform ${durations.ultraFast}ms ${easings.easeIn}, box-shadow ${durations.ultraFast}ms ${easings.easeIn}, background-color ${durations.fast}ms ${easings.easeInOut}`,
  /** Progress bar fill */
  progress: `width ${durations.deliberate}ms ${easings.easeOut}`,
  /** Skeleton loading shimmer */
  shimmer: `background-position ${durations.lazy}ms ${easings.linear} infinite`,
} as const;

export type DurationKey = keyof typeof durations;
export type EasingKey = keyof typeof easings;
export type TransitionKey = keyof typeof transitions;
