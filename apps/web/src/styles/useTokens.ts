/**
 * React Hooks and Utilities for Design Tokens
 *
 * Provides convenient access to design tokens within React components
 * and helpful utilities for working with tokens.
 *
 * @example
 * import { useTokens, createButtonStyles } from '@/styles/useTokens'
 *
 * function MyComponent() {
 *   const tokens = useTokens()
 *   const buttonStyles = createButtonStyles('primary', 'md', tokens)
 *   return <button style={buttonStyles}>Click me</button>
 * }
 */

import { useMemo } from 'react'
import designTokens, {
  colors,
  spacing,
  typography,

  components,

} from './tokens'

/**
 * React Hook to access all design tokens with memoization
 * @returns All design tokens object
 */
export function useTokens() {
  return useMemo(() => designTokens, [])
}

/**
 * React Hook for accessing color tokens
 * @returns Color tokens object
 */
export function useColors() {
  return useMemo(() => colors, [])
}

/**
 * React Hook for accessing typography tokens
 * @returns Typography tokens object
 */
export function useTypography() {
  return useMemo(() => typography, [])
}

/**
 * React Hook for accessing spacing tokens
 * @returns Spacing tokens object
 */
export function useSpacing() {
  return useMemo(() => spacing, [])
}

/**
 * React Hook for accessing component-specific tokens
 * @returns Component tokens object
 */
export function useComponentTokens() {
  return useMemo(() => components, [])
}

/* ============================================================================
   STYLE BUILDER UTILITIES
   ============================================================================ */

/**
 * Create button styles from tokens
 * @param variant - Button variant ('primary' | 'secondary' | 'success' | 'error' | 'warning')
 * @param size - Button size ('sm' | 'md' | 'lg')
 * @param tokens - Design tokens object
 * @returns CSS properties object for the button
 */
export function createButtonStyles(
  variant: 'primary' | 'secondary' | 'success' | 'error' | 'warning' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md',
  tokensObj = designTokens,
): React.CSSProperties {
  const colorMap = {
    primary: tokensObj.colors.primary[600],
    secondary: tokensObj.colors.secondary[600],
    success: tokensObj.colors.success[600],
    error: tokensObj.colors.error[600],
    warning: tokensObj.colors.warning[600],
  }

  return {
    backgroundColor: colorMap[variant],
    color: '#fff',
    padding: components.button.padding[size],
    fontSize: components.button.fontSize[size],
    borderRadius: components.button.borderRadius,
    border: 'none',
    fontWeight: tokensObj.typography.fontWeight.semibold,
    cursor: 'pointer',
    height: components.button.height[size],
    transition: `${tokensObj.transitions.property.common} ${tokensObj.transitions.duration.base} ${tokensObj.transitions.timing.ease}`,
  }
}

/**
 * Create input field styles from tokens
 * @param tokensObj - Design tokens object
 * @returns CSS properties object for input
 */
export function createInputStyles(tokensObj = designTokens): React.CSSProperties {
  return {
    padding: components.input.padding,
    fontSize: components.input.fontSize,
    borderRadius: components.input.borderRadius,
    border: components.input.border,
    height: components.input.height,
    fontFamily: tokensObj.typography.fontFamily.sans,
    transition: `${tokensObj.transitions.property.colors} ${tokensObj.transitions.duration.base} ${tokensObj.transitions.timing.ease}`,
  }
}

/**
 * Create card styles from tokens
 * @param tokensObj - Design tokens object
 * @returns CSS properties object for card
 */
export function createCardStyles(tokensObj = designTokens): React.CSSProperties {
  return {
    padding: components.card.padding,
    borderRadius: components.card.borderRadius,
    border: components.card.border,
    boxShadow: components.card.shadow,
    backgroundColor: tokensObj.colors.semantic.background,
    transition: `${tokensObj.transitions.property.shadow} ${tokensObj.transitions.duration.base} ${tokensObj.transitions.timing.ease}`,
  }
}

/**
 * Create badge styles from tokens
 * @param variant - Badge variant color
 * @param tokensObj - Design tokens object
 * @returns CSS properties object for badge
 */
export function createBadgeStyles(
  variant: keyof typeof colors = 'primary',
  tokensObj = designTokens,
): React.CSSProperties {
  const colorVariant = tokensObj.colors[variant as keyof typeof colors] as any
  const baseColor = colorVariant?.[100] || tokensObj.colors.primary[100]
  const textColor = colorVariant?.[800] || tokensObj.colors.primary[800]

  return {
    padding: components.badge.padding,
    fontSize: components.badge.fontSize,
    borderRadius: components.badge.borderRadius,
    fontWeight: tokensObj.typography.fontWeight.semibold,
    backgroundColor: baseColor,
    color: textColor,
    display: 'inline-block',
  }
}

/**
 * Create semantic color styles for health-related UI
 * @param type - Health status type
 * @param tokensObj - Design tokens object
 * @returns Object with color and backgroundColor
 */
export function getHealthcareStatusColor(
  type: 'success' | 'error' | 'warning' | 'info',
  tokensObj = designTokens,
): React.CSSProperties {
  const colorMap = {
    success: {
      color: tokensObj.colors.success[700],
      backgroundColor: tokensObj.colors.success[50],
    },
    error: {
      color: tokensObj.colors.error[700],
      backgroundColor: tokensObj.colors.error[50],
    },
    warning: {
      color: tokensObj.colors.warning[700],
      backgroundColor: tokensObj.colors.warning[50],
    },
    info: {
      color: tokensObj.colors.info[700],
      backgroundColor: tokensObj.colors.info[50],
    },
  }

  return colorMap[type]
}

/**
 * Get spacing value as a CSS value
 * @param key - Spacing token key ('0' | '1' | '2' | ... | '96')
 * @returns Spacing value in rem
 */
export function getSpacing(key: keyof typeof spacing): string {
  return spacing[key as keyof typeof spacing]
}

/**
 * Get multiple spacing values for margin/padding shorthand
 * @param top - Top spacing
 * @param right - Right spacing (defaults to top)
 * @param bottom - Bottom spacing (defaults to top)
 * @param left - Left spacing (defaults to right)
 * @returns Shorthand spacing string
 */
export function createSpacing(
  top: keyof typeof spacing,
  right?: keyof typeof spacing,
  bottom?: keyof typeof spacing,
  left?: keyof typeof spacing,
): string {
  const r = right ?? top
  const b = bottom ?? top
  const l = left ?? r
  return `${spacing[top]} ${spacing[r]} ${spacing[b]} ${spacing[l]}`
}

/**
 * Create a hover effect with shadow transition
 * @param tokensObj - Design tokens object
 * @returns Object with hover styles
 */
export function createHoverShadow(tokensObj = designTokens) {
  return {
    transition: `${tokensObj.transitions.property.shadow} ${tokensObj.transitions.duration.base} ${tokensObj.transitions.timing.ease}`,
    cursor: 'pointer',
    '&:hover': {
      boxShadow: tokensObj.shadows.hover,
    },
  }
}

/**
 * Create focus ring styles for accessibility
 * @param tokensObj - Design tokens object
 * @returns Object with focus ring styles
 */
export function createFocusRing(tokensObj = designTokens) {
  return {
    outline: 'none',
    boxShadow: `0 0 0 3px ${tokensObj.colors.semantic.background}, 0 0 0 5px ${tokensObj.colors.primary[500]}`,
    transition: `box-shadow ${tokensObj.transitions.duration.base} ${tokensObj.transitions.timing.ease}`,
  }
}

/**
 * Create responsive spacing array for different breakpoints
 * @param mobile - Spacing for mobile
 * @param tablet - Spacing for tablet (defaults to mobile)
 * @param desktop - Spacing for desktop (defaults to tablet)
 * @returns Object with responsive spacing
 */
export function createResponsiveSpacing(
  mobile: keyof typeof spacing,
  tablet?: keyof typeof spacing,
  desktop?: keyof typeof spacing,
) {
  const t = tablet ?? mobile
  const d = desktop ?? t
  return {
    mobile: spacing[mobile],
    tablet: spacing[t],
    desktop: spacing[d],
  }
}

/**
 * Get color with opacity
 * @param color - Base color value
 * @param opacityValue - Opacity value (0-1 or '0'-'100')
 * @returns RGBA color string
 */
export function withOpacity(color: string, opacityValue: number | string): string {
  const opacity = typeof opacityValue === 'string' ? parseInt(opacityValue) / 100 : opacityValue
  // Simple hex to rgb conversion (basic implementation)
  const hex = color.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/**
 * Create a text truncation style
 * @param lines - Number of lines before truncation (1 for single line)
 * @returns CSS properties for text truncation
 */
export function createTextTruncation(lines: number = 1): React.CSSProperties {
  if (lines === 1) {
    return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }
  }
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }
}

/**
 * Create gradient background from token colors
 * @param color1 - First color
 * @param color2 - Second color
 * @param direction - Gradient direction (default: 'to right')
 * @returns CSS gradient string
 */
export function createGradient(
  color1: string,
  color2: string,
  direction: string = 'to right',
): string {
  return `linear-gradient(${direction}, ${color1}, ${color2})`
}

/**
 * Get color from healthcare pricing tier
 * @param price - Price in dollars
 * @param maxAffordable - Threshold for "affordable" (default: 50)
 * @param maxModerate - Threshold for "moderate" (default: 100)
 * @param maxExpensive - Threshold for "expensive" (default: 200)
 * @param tokensObj - Design tokens object
 * @returns Color string for the pricing tier
 */
export function getPricingColor(
  price: number,
  maxAffordable: number = 50,
  maxModerate: number = 100,
  maxExpensive: number = 200,
  tokensObj = designTokens,
): string {
  if (price <= maxAffordable) return tokensObj.healthcare.pricing.veryAffordable
  if (price <= maxModerate) return tokensObj.healthcare.pricing.affordable
  if (price <= maxExpensive) return tokensObj.healthcare.pricing.moderate
  if (price <= maxExpensive * 1.5) return tokensObj.healthcare.pricing.expensive
  return tokensObj.healthcare.pricing.veryExpensive
}

/**
 * Get provider rating color
 * @param rating - Rating from 0-5
 * @param tokensObj - Design tokens object
 * @returns Color string for the rating
 */
export function getRatingColor(rating: number, tokensObj = designTokens): string {
  if (rating >= 4.5) return tokensObj.healthcare.rating.excellent
  if (rating >= 3.5) return tokensObj.healthcare.rating.good
  if (rating >= 2.5) return tokensObj.healthcare.rating.average
  if (rating > 0) return tokensObj.healthcare.rating.poor
  return tokensObj.healthcare.rating.noRating
}

/* ============================================================================
   COMPOSITE STYLE BUILDERS
   ============================================================================ */

/**
 * Create complete styles for a provider card
 * @param tokensObj - Design tokens object
 * @returns CSS properties object for provider card
 */
export function createProviderCardStyles(tokensObj = designTokens): React.CSSProperties {
  return {
    ...createCardStyles(tokensObj),
    padding: tokensObj.spacing[6],
    marginBottom: tokensObj.spacing[4],
    cursor: 'pointer',
    transition: `all ${tokensObj.transitions.duration.base} ${tokensObj.transitions.timing.ease}`,
  }
}

/**
 * Create styles for a cost comparison header
 * @param tokensObj - Design tokens object
 * @returns CSS properties object
 */
export function createComparisonHeaderStyles(tokensObj = designTokens): React.CSSProperties {
  return {
    fontSize: tokensObj.typography.fontSize['2xl'],
    fontWeight: tokensObj.typography.fontWeight.bold,
    marginBottom: tokensObj.spacing[4],
    color: tokensObj.colors.semantic.textPrimary,
    fontFamily: tokensObj.typography.fontFamily.sans,
  }
}

/**
 * Create styles for cost display (large number)
 * @param tokensObj - Design tokens object
 * @returns CSS properties object
 */
export function createCostDisplayStyles(tokensObj = designTokens): React.CSSProperties {
  return {
    fontSize: tokensObj.typography.fontSize['5xl'],
    fontWeight: tokensObj.typography.fontWeight.bold,
    color: tokensObj.colors.semantic.textPrimary,
    lineHeight: tokensObj.typography.lineHeight.tight,
    fontFamily: tokensObj.typography.fontFamily.sans,
  }
}

/**
 * Create media query string for responsive design
 * @param breakpoint - Breakpoint key
 * @param minOrMax - Whether to use min-width or max-width
 * @param tokensObj - Design tokens object
 * @returns Media query string
 */
export function createMediaQuery(
  breakpoint: keyof typeof designTokens.breakpoints.pixel,
  minOrMax: 'min' | 'max' = 'min',
  tokensObj = designTokens,
): string {
  const size = tokensObj.breakpoints[breakpoint as keyof typeof tokensObj.breakpoints]
  if (typeof size !== 'string') return ''
  return `@media (${minOrMax}-width: ${size})`
}

export default {
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
}
