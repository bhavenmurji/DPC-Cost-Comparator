# Design Tokens Guide

Complete reference for the DPC Cost Comparator design system tokens.

## Overview

Design tokens are the visual design atoms of the design system. They represent decisions about color, typography, spacing, shadows, and other design properties. Tokens are centralized in `tokens.ts` and can be imported directly or used through the `useTokens` hook.

## Table of Contents

- [Getting Started](#getting-started)
- [Color Tokens](#color-tokens)
- [Typography Tokens](#typography-tokens)
- [Spacing Tokens](#spacing-tokens)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Borders](#borders)
- [Breakpoints](#breakpoints)
- [Z-Index](#z-index)
- [Animations & Transitions](#animations--transitions)
- [Component Tokens](#component-tokens)
- [Healthcare-Specific Tokens](#healthcare-specific-tokens)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## Getting Started

### Import Tokens

```typescript
// Import entire tokens object
import designTokens from '@/styles/tokens'

// Import specific token categories
import { colors, spacing, typography } from '@/styles/tokens'

// Use hooks in React components
import { useTokens, useColors } from '@/styles/useTokens'

function MyComponent() {
  const tokens = useTokens()
  return <div style={{ color: tokens.colors.primary[600] }}>Hello</div>
}
```

### Use Hooks for Type Safety

```typescript
import { useTokens, createButtonStyles } from '@/styles/useTokens'

export function MyButton() {
  const tokens = useTokens()
  const buttonStyles = createButtonStyles('primary', 'md', tokens)

  return <button style={buttonStyles}>Click me</button>
}
```

## Color Tokens

### Primary Colors

The primary color palette is used for main actions, call-to-action buttons, and primary UI elements.

```typescript
import { colors } from '@/styles/tokens'

// Use specific shade
<div style={{ color: colors.primary[600] }}>Primary Text</div>

// All available shades
colors.primary = {
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950
}
```

**Color Shades Guide:**
- `50-200`: Light backgrounds
- `300-400`: Light text, hover states
- `500-600`: Interactive elements, buttons
- `700-800`: Primary text, main actions
- `900-950`: Dark text, emphasis

### Secondary Colors

Used for secondary actions and less prominent UI elements.

```typescript
colors.secondary[600] // Use for secondary buttons
colors.secondary[50]  // Use for secondary backgrounds
```

### Semantic Colors

Provide meaning-based colors for different types of messages.

```typescript
// Success - positive outcomes
colors.success[600]  // Button background
colors.success[50]   // Background

// Error - problems and failures
colors.error[600]    // Error button
colors.error[50]     // Error background

// Warning - caution and attention
colors.warning[600]  // Warning state
colors.warning[50]   // Warning background

// Info - neutral information
colors.info[600]     // Info state
colors.info[50]      // Info background
```

### Healthcare-Specific Colors

Specialized colors for healthcare domain.

```typescript
const { healthcare } = colors

// Plan comparison
healthcare.plans.traditional    // Traditional insurance
healthcare.plans.dpc           // DPC plans
healthcare.plans.catastrophic  // Catastrophic insurance

// Provider ratings
healthcare.rating.excellent  // 4.5-5.0 stars
healthcare.rating.good      // 3.5-4.4 stars
healthcare.rating.average   // 2.5-3.4 stars
healthcare.rating.poor      // 0-2.4 stars

// Medication pricing
healthcare.pricing.veryAffordable  // < $50
healthcare.pricing.affordable      // $50-100
healthcare.pricing.moderate        // $100-200
healthcare.pricing.expensive       // > $200
```

### Semantic Aliases

Use these for maintainability and consistency.

```typescript
colors.semantic.border           // Border color
colors.semantic.background       // Primary background
colors.semantic.backgroundAlt    // Alternative background
colors.semantic.foreground       // Text color
colors.semantic.textPrimary      // Main text
colors.semantic.textSecondary    // Secondary text
colors.semantic.textMuted        // Muted/placeholder text
colors.semantic.focusRing        // Focus ring color
```

## Typography Tokens

### Font Families

```typescript
import { typography } from '@/styles/tokens'

// Sans-serif (default for most text)
typography.fontFamily.sans

// Monospace (for code)
typography.fontFamily.mono

// Display (for large headings)
typography.fontFamily.display
```

### Font Sizes

```typescript
// Size scale from xs to 6xl
typography.fontSize = {
  xs: '0.75rem',     // 12px
  sm: '0.875rem',    // 14px
  base: '1rem',      // 16px
  lg: '1.125rem',    // 18px
  xl: '1.25rem',     // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
  '5xl': '3rem',     // 48px
  '6xl': '3.75rem',  // 60px
}

// Example
<h1 style={{ fontSize: typography.fontSize['3xl'] }}>Heading</h1>
<p style={{ fontSize: typography.fontSize.base }}>Body text</p>
```

### Font Weights

```typescript
typography.fontWeight = {
  thin: 100,
  extralight: 200,
  light: 300,
  normal: 400,        // Default
  medium: 500,
  semibold: 600,      // For strong emphasis
  bold: 700,          // For headings
  extrabold: 800,
  black: 900,
}

// Example
<span style={{ fontWeight: typography.fontWeight.semibold }}>
  Important text
</span>
```

### Line Heights

```typescript
typography.lineHeight = {
  none: 1,           // No space
  tight: 1.25,       // For compact text
  snug: 1.375,
  normal: 1.5,       // Default for body
  relaxed: 1.625,
  loose: 2,          // Extra space for readability
}

// Example
<p style={{ lineHeight: typography.lineHeight.relaxed }}>
  Paragraph with good spacing
</p>
```

## Spacing Tokens

Spacing is based on 0.25rem (4px) increments for consistent alignment.

```typescript
import { spacing } from '@/styles/tokens'

spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  // ... up to 96
}

// Padding
<div style={{ padding: spacing[4] }}>Content</div>

// Margin
<div style={{ marginBottom: spacing[6] }}>Content</div>

// Gaps
<div style={{ display: 'flex', gap: spacing[4] }}>Items</div>
```

### Using Spacing Utilities

```typescript
import { createSpacing, getSpacing } from '@/styles/useTokens'

// Get single spacing value
const padding = getSpacing(4) // '1rem'

// Create shorthand spacing
const padding = createSpacing(4, 6, 4, 2)
// Result: '1rem 1.5rem 1rem 0.5rem'
```

## Border Radius

```typescript
import { borderRadius } from '@/styles/tokens'

borderRadius = {
  none: '0',        // No rounding
  sm: '0.125rem',   // 2px - subtle
  base: '0.25rem',  // 4px - minimal
  md: '0.375rem',   // 6px - standard
  lg: '0.5rem',     // 8px - default/prominent
  xl: '0.75rem',    // 12px - very prominent
  '2xl': '1rem',    // 16px - large
  '3xl': '1.5rem',  // 24px - extra large
  full: '9999px',   // Fully rounded (pills/circles)
}

// Example
<div style={{ borderRadius: borderRadius.lg }}>Card</div>
<button style={{ borderRadius: borderRadius.full }}>Pill Button</button>
```

## Shadows

```typescript
import { shadows } from '@/styles/tokens'

// Semantic shadows
shadows.sm        // Subtle shadow for raised elements
shadows.base      // Default shadow
shadows.md        // Medium elevation
shadows.lg        // Large elevation
shadows.xl        // Extra large elevation
shadows['2xl']    // Maximum elevation

// Semantic use cases
shadows.card         // For card components
shadows.cardHover    // For card hover state
shadows.hover        // For interactive hover
shadows.elevated     // For modals/popovers
shadows.inner        // Inner shadow effect

// Healthcare-specific
shadows.successGlow  // Green glow for success
shadows.errorGlow    // Red glow for errors
shadows.warningGlow  // Orange glow for warnings
shadows.infoBorder   // Blue glow for info
```

## Borders

```typescript
import { borders } from '@/styles/tokens'

// Border widths
borders.width = {
  0: '0px',
  1: '1px',   // Default
  2: '2px',   // Prominent
  4: '4px',
  8: '8px',
}

// Semantic borders
borders.semantic.default   // Light gray border
borders.semantic.light     // Very light border
borders.semantic.success   // Green success border
borders.semantic.error     // Red error border
borders.semantic.warning   // Orange warning border
borders.semantic.info      // Blue info border

// Example
<div style={{ border: borders.semantic.default }}>Content</div>
```

## Breakpoints

```typescript
import { breakpoints } from '@/styles/tokens'

breakpoints = {
  xs: '320px',    // Extra small (phones)
  sm: '640px',    // Small
  md: '768px',    // Medium (tablets)
  lg: '1024px',   // Large (desktops)
  xl: '1280px',   // Extra large
  '2xl': '1536px', // Ultra-wide
}

// Using in media queries
const mobileQuery = `@media (max-width: ${breakpoints.md})`
const desktopQuery = `@media (min-width: ${breakpoints.lg})`
```

## Z-Index

```typescript
import { zIndex } from '@/styles/tokens'

zIndex = {
  hide: -1,           // Hidden elements
  base: 0,            // Default layer
  raised: 10,         // Slightly raised
  floating: 100,      // Floating elements
  dropdown: 1000,     // Dropdown menus
  sticky: 1020,       // Sticky headers
  fixed: 1030,        // Fixed positioning
  modalBackdrop: 1040, // Modal backdrop
  modal: 1050,        // Modal dialogs
  popover: 1060,      // Popovers
  tooltip: 1070,      // Tooltips
  maximized: 10000,   // Maximum layer
}

// Example
<div style={{ zIndex: zIndex.modal }}>Modal Content</div>
```

## Animations & Transitions

```typescript
import { transitions } from '@/styles/tokens'

// Duration values
transitions.duration = {
  instant: '0ms',
  fast: '100ms',     // Quick interactions
  base: '200ms',     // Default
  slow: '300ms',     // Prominent transitions
  slower: '500ms',   // Large changes
  slowest: '1000ms', // Significant changes
}

// Timing functions
transitions.timing = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  cubic: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

// Properties to animate
transitions.property = {
  all: 'all',
  common: 'color, background-color, border-color, box-shadow, opacity',
  colors: 'color, background-color, border-color',
  shadow: 'box-shadow',
  transform: 'transform',
}

// Example
const transition = `${transitions.property.common} ${transitions.duration.base} ${transitions.timing.ease}`
```

## Component Tokens

Pre-built token combinations for common components.

```typescript
import { components } from '@/styles/tokens'

// Button tokens
components.button.padding.md        // Padding for medium button
components.button.fontSize.md       // Font size for medium button
components.button.height.md         // Height for medium button
components.button.borderRadius      // Consistent rounding

// Input tokens
components.input.padding            // Padding for inputs
components.input.fontSize           // Font size for inputs
components.input.height             // Height for inputs
components.input.focusRing          // Focus ring style

// Card tokens
components.card.padding             // Card padding
components.card.borderRadius        // Card rounding
components.card.shadow              // Card shadow
components.card.shadowHover         // Hover shadow
```

## Healthcare-Specific Tokens

Special tokens for healthcare domain.

```typescript
import { healthcare } from '@/styles/tokens'

// Plan comparison colors
healthcare.plans.traditional.color
healthcare.plans.dpc.color
healthcare.plans.catastrophic.color

// Provider ratings
getRatingColor(4.8)  // Returns color for excellent rating

// Medication pricing
getPricingColor(75)  // Returns color for price tier
```

## Usage Examples

### Creating a Button Component

```typescript
import { createButtonStyles } from '@/styles/useTokens'

function MyButton({ variant = 'primary', size = 'md', children }) {
  const buttonStyles = createButtonStyles(variant, size)
  return <button style={buttonStyles}>{children}</button>
}

// Usage
<MyButton variant="success" size="lg">Save</MyButton>
<MyButton variant="error" size="md">Delete</MyButton>
```

### Creating a Card Component

```typescript
import { createCardStyles } from '@/styles/useTokens'

function Card({ children }) {
  const cardStyles = createCardStyles()
  return <div style={cardStyles}>{children}</div>
}
```

### Responsive Spacing

```typescript
import { createResponsiveSpacing } from '@/styles/useTokens'

const spacing = createResponsiveSpacing(
  2,    // Mobile: 0.5rem
  4,    // Tablet: 1rem
  8     // Desktop: 2rem
)
```

### Provider Card with Styling

```typescript
import { createProviderCardStyles, getRatingColor } from '@/styles/useTokens'
import { colors } from '@/styles/tokens'

function ProviderCard({ provider }) {
  const cardStyles = createProviderCardStyles()
  const ratingColor = getRatingColor(provider.rating)

  return (
    <div style={cardStyles}>
      <h3 style={{ color: colors.primary[700] }}>{provider.name}</h3>
      <p style={{ color: ratingColor }}>Rating: {provider.rating}/5</p>
    </div>
  )
}
```

### Cost Comparison Section

```typescript
import {
  colors,
  typography,
  createComparisonHeaderStyles,
  createCostDisplayStyles
} from '@/styles/useTokens'

function CostComparison({ traditional, dpc }) {
  return (
    <div>
      <h2 style={createComparisonHeaderStyles()}>Cost Comparison</h2>

      <div>
        <h3>Traditional Insurance</h3>
        <div style={createCostDisplayStyles()}>
          ${traditional.toLocaleString()}
        </div>
      </div>

      <div style={{ borderTop: `2px solid ${colors.success[500]}` }}>
        <h3 style={{ color: colors.success[700] }}>DPC + Catastrophic</h3>
        <div style={createCostDisplayStyles()}>
          ${dpc.toLocaleString()}
        </div>
      </div>
    </div>
  )
}
```

## Best Practices

### 1. Use Tokens Consistently

Always use tokens instead of hardcoding values:

```typescript
// Good
<div style={{ padding: spacing[4], color: colors.primary[600] }}>
  Content
</div>

// Avoid
<div style={{ padding: '1rem', color: '#2563eb' }}>
  Content
</div>
```

### 2. Use Semantic Tokens When Appropriate

```typescript
// Good - semantic meaning
<div style={{ color: colors.semantic.textPrimary }}>
  Main text
</div>

// Less ideal - specific color
<div style={{ color: colors.neutral[900] }}>
  Main text
</div>
```

### 3. Compose Styles from Utilities

```typescript
// Good - composed styles
const buttonStyles = createButtonStyles('primary', 'md')
<button style={buttonStyles}>Click</button>

// Avoid - manual composition
<button style={{
  backgroundColor: colors.primary[600],
  padding: `${spacing[2]} ${spacing[4]}`,
  // ... many more properties
}}>
  Click
</button>
```

### 4. Use Hooks in React Components

```typescript
// Good - memoized tokens
import { useTokens } from '@/styles/useTokens'

function Component() {
  const tokens = useTokens()
  return <div style={{ color: tokens.colors.primary[600] }}>Text</div>
}

// Avoid - repeated imports
function Component() {
  const color = colors.primary[600] // Not memoized
  return <div style={{ color }}>Text</div>
}
```

### 5. Use Healthcare-Specific Tokens for Domain Features

```typescript
// Good - semantic healthcare color
const statusColor = getRatingColor(provider.rating)
<span style={{ color: statusColor }}>{provider.rating}/5</span>

// Avoid - manual color selection
const colors = {
  excellent: '#10b981',
  good: '#84cc16',
  // ...
}
```

### 6. Create Reusable Component Styles

```typescript
// Create a styles file for each component
// styles/providerCardStyles.ts
export function useProviderCardStyles() {
  return createProviderCardStyles()
}

// Use in component
function ProviderCard() {
  const styles = useProviderCardStyles()
  return <div style={styles}>...</div>
}
```

### 7. Maintain Accessibility with Contrast

When choosing colors, ensure sufficient contrast:

```typescript
// Good - high contrast
<div style={{
  color: colors.neutral[900],      // Dark text
  backgroundColor: colors.primary[50] // Light background
}}>
  Content
</div>

// Avoid - low contrast
<div style={{
  color: colors.neutral[400],       // Light gray text
  backgroundColor: colors.neutral[300] // Light background
}}>
  Content
</div>
```

## Migration Guide

Converting hardcoded styles to tokens:

```typescript
// Before
const styles = {
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '600',
  }
}

// After
import { createButtonStyles } from '@/styles/useTokens'

const styles = {
  button: createButtonStyles('primary', 'md')
}
```

## Performance Considerations

- Tokens are exported as `const` for tree-shaking
- Use hooks (`useTokens`) for memoized access in React
- Token objects are immutable to prevent accidental mutations
- Import only what you need to reduce bundle size

```typescript
// Good - specific imports
import { colors, spacing } from '@/styles/tokens'

// Also good - namespace import
import * as tokens from '@/styles/tokens'
```

## Questions & Support

For questions about design tokens or design system decisions, refer to:

1. This guide
2. The `tokens.ts` file for complete definitions
3. The `useTokens.ts` file for utility functions
4. Component examples in the codebase

---

**Last Updated:** November 2024
**Design System Version:** 1.0.0
