/**
 * Design Tokens for DPC Cost Comparator
 *
 * Centralized design system tokens for colors, typography, spacing, shadows,
 * borders, and other design elements. These tokens are used throughout the
 * application for consistent styling and can also be consumed by Tailwind CSS.
 *
 * Usage:
 * - Import and use in components: import { colors, spacing } from '@/styles/tokens'
 * - Use in Tailwind config: import tokens from '@/styles/tokens'
 *
 * @author DPC Cost Comparator Team
 */

/* ============================================================================
   COLOR TOKENS
   ============================================================================ */

export const colors = {
  // Primary Colors - Brand blue for main actions and primary UI elements
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Secondary Colors - Light grays for secondary actions and backgrounds
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Neutral/Gray Scale - For text, borders, and backgrounds
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0a0a0a',
  },

  // Success Colors - For positive actions, validations, and confirmations
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
    950: '#052e16',
  },

  // Error/Destructive Colors - For errors, warnings, and dangerous actions
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Warning Colors - For caution messages and attention needed
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Info Colors - For informational messages and neutral notifications
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Healthcare-Specific Colors
  healthcare: {
    doctorGreen: '#059669', // Vibrant green for healthcare/medical actions
    hospitalRed: '#dc2626', // Urgent/critical information
    pharmacyBlue: '#2563eb', // Pharmacy-related information
    prescriptionPurple: '#7c3aed', // Prescription-related UI
    clinicTeal: '#0891b2', // Clinic/facility information
    wellness: '#10b981', // Wellness and positive health outcomes
    caution: '#f59e0b', // Medical caution/warnings
  },

  // Semantic Color Aliases (for maintainability)
  semantic: {
    border: '#e5e7eb',
    background: '#ffffff',
    backgroundAlt: '#f9fafb',
    backgroundHover: '#f3f4f6',
    foreground: '#1a1a1a',
    foregroundAlt: '#666666',
    foregroundMuted: '#9ca3af',
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#9ca3af',
    textInverted: '#ffffff',
    focusRing: '#2563eb',
    divider: '#f3f4f6',
  },
} as const;

/* ============================================================================
   TYPOGRAPHY TOKENS
   ============================================================================ */

export const typography = {
  // Font Families
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      '"Noto Sans"',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Color Emoji"',
    ].join(', '),
    mono: [
      'ui-monospace',
      'SFMono-Regular',
      '"SF Mono"',
      'Menlo',
      'Consolas',
      '"Liberation Mono"',
      'monospace',
    ].join(', '),
    display: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(', '),
  },

  // Font Sizes (in rem units for scalability)
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  // Font Weights
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights (unitless for flexibility)
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/* ============================================================================
   SPACING TOKENS
   ============================================================================ */

export const spacing = {
  // Based on 0.25rem (4px) increments for Tailwind compatibility
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  28: '7rem', // 112px
  32: '8rem', // 128px
  36: '9rem', // 144px
  40: '10rem', // 160px
  44: '11rem', // 176px
  48: '12rem', // 192px
  52: '13rem', // 208px
  56: '14rem', // 224px
  60: '15rem', // 240px
  64: '16rem', // 256px
  72: '18rem', // 288px
  80: '20rem', // 320px
  96: '24rem', // 384px
} as const;

/* ============================================================================
   BORDER RADIUS TOKENS
   ============================================================================ */

export const borderRadius = {
  none: '0',
  sm: '0.125rem', // 2px - for subtle rounding
  base: '0.25rem', // 4px - minimal rounding
  md: '0.375rem', // 6px - standard rounding
  lg: '0.5rem', // 8px - default radius (from Tailwind config)
  xl: '0.75rem', // 12px - prominent rounding
  '2xl': '1rem', // 16px - very prominent
  '3xl': '1.5rem', // 24px - large cards
  full: '9999px', // 9999px - fully rounded (pills, circles)
} as const;

/* ============================================================================
   SHADOW TOKENS
   ============================================================================ */

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Semantic shadows for specific use cases
  hover: '0 4px 12px rgba(0, 0, 0, 0.15)',
  elevated: '0 10px 25px rgba(0, 0, 0, 0.1)',
  card: '0 1px 3px rgba(0, 0, 0, 0.1)',
  cardHover: '0 4px 12px rgba(0, 0, 0, 0.1)',

  // Healthcare-specific shadows
  successGlow: '0 4px 12px rgba(16, 185, 129, 0.2)', // Green success glow
  errorGlow: '0 4px 12px rgba(239, 68, 68, 0.2)', // Red error glow
  warningGlow: '0 4px 12px rgba(245, 158, 11, 0.2)', // Orange warning glow
  infoBorder: '0 4px 12px rgba(59, 130, 246, 0.2)', // Blue info glow
} as const;

/* ============================================================================
   BORDER TOKENS
   ============================================================================ */

export const borders = {
  // Border Widths
  width: {
    0: '0px',
    1: '1px',
    2: '2px',
    4: '4px',
    8: '8px',
  },

  // Common Border Styles
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
    double: 'double',
    none: 'none',
  },

  // Semantic Borders
  semantic: {
    default: `1px solid ${colors.semantic.border}`,
    light: `1px solid ${colors.neutral[200]}`,
    medium: `2px solid ${colors.semantic.border}`,
    strong: `2px solid ${colors.primary[600]}`,
    success: `2px solid ${colors.success[500]}`,
    error: `2px solid ${colors.error[500]}`,
    warning: `2px solid ${colors.warning[500]}`,
    info: `2px solid ${colors.info[500]}`,
  },
} as const;

/* ============================================================================
   BREAKPOINT TOKENS
   ============================================================================ */

export const breakpoints = {
  xs: '320px', // Extra small devices
  sm: '640px', // Small devices (phones)
  md: '768px', // Medium devices (tablets)
  lg: '1024px', // Large devices (desktops)
  xl: '1280px', // Extra large devices
  '2xl': '1536px', // Ultra-wide devices

  // Pixel values for direct use
  pixel: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Media query helpers
  mixin: {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
    largeDesktop: '(min-width: 1280px)',
  },
} as const;

/* ============================================================================
   Z-INDEX TOKENS
   ============================================================================ */

export const zIndex = {
  // Layering strategy
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,

  // Semantic naming
  auto: 'auto',
  underlay: 10,
  default: 1,
  raised: 10,
  floating: 100,
  overlay: 1000,
  maximized: 10000,
} as const;

/* ============================================================================
   ANIMATION/TRANSITION TOKENS
   ============================================================================ */

export const transitions = {
  // Duration values (in milliseconds)
  duration: {
    instant: '0ms',
    fast: '100ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
    slowest: '1000ms',
  },

  // Timing functions
  timing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    cubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Common transitions
  property: {
    none: 'none',
    all: 'all',
    common: 'color, background-color, border-color, box-shadow, opacity',
    colors: 'color, background-color, border-color',
    shadow: 'box-shadow',
    transform: 'transform',
  },
} as const;

/* ============================================================================
   COMPONENT-SPECIFIC TOKENS
   ============================================================================ */

export const components = {
  // Button tokens
  button: {
    padding: {
      xs: `${spacing[2]} ${spacing[3]}`,
      sm: `${spacing[2]} ${spacing[4]}`,
      md: `${spacing[2]} ${spacing[6]}`,
      lg: `${spacing[3]} ${spacing[8]}`,
      xl: `${spacing[3]} ${spacing[10]}`,
    },
    fontSize: {
      sm: typography.fontSize.sm,
      md: typography.fontSize.base,
      lg: typography.fontSize.lg,
    },
    borderRadius: borderRadius.md,
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
  },

  // Input tokens
  input: {
    padding: `${spacing[2]} ${spacing[4]}`,
    fontSize: typography.fontSize.base,
    borderRadius: borderRadius.md,
    border: borders.semantic.default,
    height: '2.5rem',
    focusRing: `2px solid ${colors.primary[500]}`,
  },

  // Card tokens
  card: {
    padding: spacing[6],
    borderRadius: borderRadius.lg,
    border: borders.semantic.default,
    shadow: shadows.card,
    shadowHover: shadows.cardHover,
  },

  // Badge tokens
  badge: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs,
    borderRadius: borderRadius.full,
    fontWeight: typography.fontWeight.semibold,
  },

  // Modal tokens
  modal: {
    borderRadius: borderRadius.xl,
    shadow: shadows['2xl'],
    padding: spacing[8],
  },

  // Tooltip tokens
  tooltip: {
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: typography.fontSize.xs,
    borderRadius: borderRadius.md,
    shadow: shadows.lg,
  },
} as const;

/* ============================================================================
   HEALTHCARE-SPECIFIC DESIGN TOKENS
   ============================================================================ */

export const healthcare = {
  // Plan comparison colors
  plans: {
    traditional: {
      color: colors.neutral[600],
      background: colors.neutral[50],
      border: colors.neutral[300],
    },
    dpc: {
      color: colors.success[700],
      background: colors.success[50],
      border: colors.success[300],
    },
    catastrophic: {
      color: colors.primary[700],
      background: colors.primary[50],
      border: colors.primary[300],
    },
  },

  // Provider rating colors
  rating: {
    excellent: colors.success[500], // 4.5-5.0
    good: colors.success[400], // 3.5-4.4
    average: colors.warning[500], // 2.5-3.4
    poor: colors.error[500], // 0-2.4
    noRating: colors.neutral[400],
  },

  // Medication pricing tiers
  pricing: {
    veryAffordable: colors.success[500],
    affordable: colors.success[400],
    moderate: colors.warning[500],
    expensive: colors.error[400],
    veryExpensive: colors.error[600],
  },

  // Insurance tiers (ACA metal tiers)
  metalTiers: {
    catastrophic: colors.neutral[600],
    bronze: colors.error[600],
    silver: colors.neutral[400],
    gold: colors.warning[500],
    platinum: colors.primary[600],
  },
} as const;

/* ============================================================================
   UTILITY TOKENS
   ============================================================================ */

export const opacity = {
  0: '0',
  5: '0.05',
  10: '0.1',
  20: '0.2',
  25: '0.25',
  30: '0.3',
  40: '0.4',
  50: '0.5',
  60: '0.6',
  70: '0.7',
  75: '0.75',
  80: '0.8',
  90: '0.9',
  95: '0.95',
  100: '1',
} as const;

export const cursor = {
  auto: 'auto',
  default: 'default',
  pointer: 'pointer',
  wait: 'wait',
  text: 'text',
  move: 'move',
  notAllowed: 'not-allowed',
  grab: 'grab',
  grabbing: 'grabbing',
} as const;

/* ============================================================================
   EXPORT ALL TOKENS AS A SINGLE OBJECT
   ============================================================================ */

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  borders,
  breakpoints,
  zIndex,
  transitions,
  components,
  healthcare,
  opacity,
  cursor,
} as const;

export default designTokens;
