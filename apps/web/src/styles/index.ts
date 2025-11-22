/**
 * Design Tokens & Styles Export Index
 *
 * Central export point for all design tokens and style utilities.
 * Import from this file for cleaner imports in components.
 *
 * @example
 * // Instead of:
 * import { colors, spacing } from '@/styles/tokens'
 * import { createButtonStyles } from '@/styles/useTokens'
 *
 * // You can use:
 * import { colors, spacing, createButtonStyles } from '@/styles'
 */

// Export all design tokens
export {
  default as designTokens,
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
} from './tokens'

// Export all token hooks and utilities
export {
  useTokens,
  useColors,
  useTypography,
  useSpacing,
  useComponentTokens,
  createButtonStyles,
  createInputStyles,
  createCardStyles,
  createBadgeStyles,
  getHealthcareStatusColor,
  getSpacing,
  createSpacing,
  createHoverShadow,
  createFocusRing,
  createResponsiveSpacing,
  withOpacity,
  createTextTruncation,
  createGradient,
  getPricingColor,
  getRatingColor,
  createProviderCardStyles,
  createComparisonHeaderStyles,
  createCostDisplayStyles,
  createMediaQuery,
} from './useTokens'
