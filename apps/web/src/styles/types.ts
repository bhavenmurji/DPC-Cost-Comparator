/**
 * TypeScript Type Definitions for Design Tokens
 *
 * Provides type safety and IDE autocomplete for design token values.
 * Import these types when creating typed utility functions or components.
 */

import {
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

/* ============================================================================
   COLOR TYPES
   ============================================================================ */

// Extract color shades (50, 100, 200, ..., 950)
export type ColorShade = keyof typeof colors.primary

// Color variants available
export type ColorVariant = keyof typeof colors

// Specific color groups
export type SemanticColorKey = keyof typeof colors.semantic
export type HealthcareColorKey = keyof typeof healthcare

// Full color value type
export type ColorValue = string

/* ============================================================================
   TYPOGRAPHY TYPES
   ============================================================================ */

export type FontFamily = keyof typeof typography.fontFamily
export type FontSize = keyof typeof typography.fontSize
export type FontWeight = keyof typeof typography.fontWeight
export type LineHeight = keyof typeof typography.lineHeight
export type LetterSpacing = keyof typeof typography.letterSpacing

/* ============================================================================
   SPACING TYPES
   ============================================================================ */

export type SpacingScale = keyof typeof spacing

// Common spacing values used in components
export type CommonSpacing = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16

/* ============================================================================
   BORDER RADIUS TYPES
   ============================================================================ */

export type BorderRadiusSize = keyof typeof borderRadius

/* ============================================================================
   SHADOW TYPES
   ============================================================================ */

export type ShadowSize = keyof typeof shadows

/* ============================================================================
   BORDER TYPES
   ============================================================================ */

export type BorderWidth = keyof typeof borders.width
export type BorderStyle = keyof typeof borders.style
export type SemanticBorder = keyof typeof borders.semantic

/* ============================================================================
   BREAKPOINT TYPES
   ============================================================================ */

export type Breakpoint = keyof typeof breakpoints.pixel

/* ============================================================================
   Z-INDEX TYPES
   ============================================================================ */

export type ZIndexLevel = keyof typeof zIndex

/* ============================================================================
   ANIMATION TYPES
   ============================================================================ */

export type TransitionDuration = keyof typeof transitions.duration
export type TransitionTiming = keyof typeof transitions.timing
export type TransitionProperty = keyof typeof transitions.property

/* ============================================================================
   COMPONENT TYPES
   ============================================================================ */

export type ButtonSize = keyof typeof components.button.padding
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning'

export type BadgeVariant = ColorVariant

export type ComponentType = 'button' | 'input' | 'card' | 'badge' | 'modal' | 'tooltip'

/* ============================================================================
   HEALTHCARE TYPES
   ============================================================================ */

export type HealthcareStatusColor = 'success' | 'error' | 'warning' | 'info'
export type PlanType = 'traditional' | 'dpc' | 'catastrophic'
export type RatingRange = 0 | 1 | 2 | 3 | 4 | 5
export type ACAMetalTier = 'catastrophic' | 'bronze' | 'silver' | 'gold' | 'platinum'

/* ============================================================================
   UTILITY TYPES
   ============================================================================ */

export type OpacityValue = keyof typeof opacity
export type CursorType = keyof typeof cursor

/* ============================================================================
   RESPONSIVE TYPES
   ============================================================================ */

export interface ResponsiveSpacing {
  mobile: string
  tablet: string
  desktop: string
}

export interface ResponsiveValue<T> {
  mobile: T
  tablet: T
  desktop: T
}

/* ============================================================================
   STYLE BUILDER RETURN TYPES
   ============================================================================ */

export type CSSProperties = React.CSSProperties

export interface ButtonStyleProps {
  variant: ButtonVariant
  size: ButtonSize
  disabled?: boolean
  fullWidth?: boolean
}

export interface CardStyleProps {
  elevated?: boolean
  interactive?: boolean
  bordered?: boolean
}

export interface BadgeStyleProps {
  variant: BadgeVariant
  size?: 'sm' | 'md' | 'lg'
}

export interface InputStyleProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  disabled?: boolean
  error?: boolean
  success?: boolean
}

/* ============================================================================
   TOKEN DEFINITIONS
   ============================================================================ */

/**
 * Complete design token object structure
 */
export interface DesignTokens {
  colors: typeof colors
  typography: typeof typography
  spacing: typeof spacing
  borderRadius: typeof borderRadius
  shadows: typeof shadows
  borders: typeof borders
  breakpoints: typeof breakpoints
  zIndex: typeof zIndex
  transitions: typeof transitions
  components: typeof components
  healthcare: typeof healthcare
  opacity: typeof opacity
  cursor: typeof cursor
}

/* ============================================================================
   THEME TYPES (for future dark mode support)
   ============================================================================ */

export type ThemeMode = 'light' | 'dark'

export interface Theme {
  mode: ThemeMode
  colors: typeof colors
  typography: typeof typography
  spacing: typeof spacing
}

/* ============================================================================
   CONSTRAINT TYPES (for narrowing values)
   ============================================================================ */

/**
 * Valid button sizes
 */
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const
export type ValidButtonSize = typeof BUTTON_SIZES[number]

/**
 * Valid button variants
 */
export const BUTTON_VARIANTS = ['primary', 'secondary', 'success', 'error', 'warning'] as const
export type ValidButtonVariant = typeof BUTTON_VARIANTS[number]

/**
 * Valid breakpoints
 */
export const VALID_BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
export type ValidBreakpoint = typeof VALID_BREAKPOINTS[number]

/**
 * Valid spacing scales
 */
export const VALID_SPACING = [
  0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
] as const
export type ValidSpacing = typeof VALID_SPACING[number]

/**
 * Valid font sizes
 */
export const VALID_FONT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'] as const
export type ValidFontSize = typeof VALID_FONT_SIZES[number]

/**
 * Valid border radius sizes
 */
export const VALID_BORDER_RADIUS = ['none', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', 'full'] as const
export type ValidBorderRadius = typeof VALID_BORDER_RADIUS[number]

/* ============================================================================
   HELPER TYPES FOR COMPONENT STYLING
   ============================================================================ */

/**
 * Map of color states for interactive components
 */
export interface ColorStateMap {
  default: string
  hover: string
  active: string
  disabled: string
  focus: string
}

/**
 * Complete button style configuration
 */
export interface ButtonConfig extends ButtonStyleProps {
  colors: ColorStateMap
  padding: string
  fontSize: string
  fontWeight: string
  borderRadius: string
  transition: string
  cursor: string
}

/**
 * Healthcare status configuration
 */
export interface HealthcareStatusConfig {
  type: HealthcareStatusColor
  color: string
  backgroundColor: string
  borderColor: string
  icon?: string
}

/**
 * Provider rating configuration
 */
export interface ProviderRatingConfig {
  rating: number
  color: string
  tier: 'excellent' | 'good' | 'average' | 'poor' | 'noRating'
}

/**
 * Pricing tier configuration
 */
export interface PricingTierConfig {
  price: number
  tier: 'veryAffordable' | 'affordable' | 'moderate' | 'expensive' | 'veryExpensive'
  color: string
}

/* ============================================================================
   EXPORT TYPE GUARDS
   ============================================================================ */

/**
 * Type guard to check if a value is a valid button size
 */
export function isValidButtonSize(value: unknown): value is ValidButtonSize {
  return typeof value === 'string' && BUTTON_SIZES.includes(value as ValidButtonSize)
}

/**
 * Type guard to check if a value is a valid button variant
 */
export function isValidButtonVariant(value: unknown): value is ValidButtonVariant {
  return typeof value === 'string' && BUTTON_VARIANTS.includes(value as ValidButtonVariant)
}

/**
 * Type guard to check if a value is a valid breakpoint
 */
export function isValidBreakpoint(value: unknown): value is ValidBreakpoint {
  return typeof value === 'string' && VALID_BREAKPOINTS.includes(value as ValidBreakpoint)
}

/**
 * Type guard to check if a value is valid spacing
 */
export function isValidSpacing(value: unknown): value is ValidSpacing {
  return typeof value === 'number' && VALID_SPACING.includes(value as ValidSpacing)
}

/**
 * Type guard to check if a value is a valid font size
 */
export function isValidFontSize(value: unknown): value is ValidFontSize {
  return typeof value === 'string' && VALID_FONT_SIZES.includes(value as ValidFontSize)
}

/**
 * Type guard to check if a value is a valid border radius
 */
export function isValidBorderRadius(value: unknown): value is ValidBorderRadius {
  return typeof value === 'string' && VALID_BORDER_RADIUS.includes(value as ValidBorderRadius)
}

/* ============================================================================
   GENERIC UTILITY TYPES
   ============================================================================ */

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

/**
 * Simplify complex type for better IntelliSense
 */
export type Simplify<T> = {
  [K in keyof T]: T[K]
} & {}

export default {} as unknown as DesignTokens
