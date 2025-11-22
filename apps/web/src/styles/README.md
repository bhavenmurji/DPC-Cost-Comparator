# Design System - Styles Directory

This directory contains the centralized design tokens and style utilities for the DPC Cost Comparator frontend application.

## Files

### `tokens.ts` (16KB)
The main design tokens file containing:
- **Color Palette**: Primary, secondary, neutral, semantic colors + healthcare-specific colors
- **Typography**: Font families, sizes, weights, line heights, letter spacing
- **Spacing**: 0.25rem-based scale (4px increments)
- **Border Radius**: From subtle (2px) to fully rounded pills
- **Shadows**: Elevation shadows + semantic shadows for healthcare UI
- **Borders**: Width and semantic border styles
- **Breakpoints**: Mobile, tablet, desktop responsive breakpoints
- **Z-Index**: Layer organization scale
- **Animations**: Duration and timing function tokens
- **Components**: Pre-built token combinations for buttons, inputs, cards, badges
- **Healthcare-Specific**: Plan colors, provider ratings, pricing tiers, ACA metal tiers

**Usage:**
```typescript
import { colors, spacing, typography } from '@/styles/tokens'
import designTokens from '@/styles/tokens'
```

### `useTokens.ts` (14KB)
React hooks and utility functions for working with tokens:
- **Hooks**: `useTokens()`, `useColors()`, `useTypography()`, `useSpacing()`, `useComponentTokens()`
- **Style Builders**: Functions to create button, input, card, and badge styles
- **Healthcare Utilities**: `getPricingColor()`, `getRatingColor()` for domain-specific styling
- **Spacing Utilities**: `getSpacing()`, `createSpacing()`, `createResponsiveSpacing()`
- **Composite Builders**: Pre-built complete styles for provider cards, comparison headers, cost displays

**Usage:**
```typescript
import { useTokens, createButtonStyles, getPricingColor } from '@/styles/useTokens'

// In components
const tokens = useTokens()
const buttonStyles = createButtonStyles('primary', 'md', tokens)
const priceColor = getPricingColor(price)
```

### `index.ts` (1.2KB)
Central export point for cleaner imports across the application:

**Usage:**
```typescript
// Clean imports from single source
import { colors, spacing, createButtonStyles, getRatingColor } from '@/styles'
```

### `TOKENS_GUIDE.md` (18KB)
Comprehensive documentation including:
- Getting started guide
- Complete reference for all token categories
- Usage examples for common patterns
- Best practices and migration guide
- Performance considerations
- Healthcare-specific token usage

### `README.md` (this file)
Overview of the styles directory structure and quick reference.

## Quick Start

### Import and Use Tokens

```typescript
// Option 1: Direct import from tokens
import { colors, spacing, typography } from '@/styles/tokens'

const myStyle = {
  color: colors.primary[600],
  padding: spacing[4],
  fontSize: typography.fontSize.lg,
}

// Option 2: Use hooks in React
import { useTokens, createButtonStyles } from '@/styles'

function MyButton() {
  const tokens = useTokens()
  const buttonStyles = createButtonStyles('primary', 'md', tokens)
  return <button style={buttonStyles}>Click me</button>
}

// Option 3: Unified import
import { colors, spacing, createCardStyles } from '@/styles'

const cardStyles = createCardStyles()
```

## Token Categories

### Colors
- **Primary** (blue): #2563eb - Main brand color
- **Secondary** (slate): #475569 - Secondary actions
- **Neutral** (gray): Full grayscale from white to black
- **Semantic**: Success (green), Error (red), Warning (orange), Info (blue)
- **Healthcare**: Plan colors, provider ratings, pricing tiers

### Typography
- Font families: sans (default), mono, display
- Font sizes: xs (12px) through 6xl (60px)
- Font weights: thin (100) through black (900)
- Line heights: none through loose (2)
- Letter spacing: tighter through widest

### Spacing
- Scale: 0 to 96 (0 to 384px) in 0.25rem increments
- 4px, 8px, 12px, 16px, 24px, 32px, etc.
- Use for padding, margin, gaps, width, height

### Shadows
- Elevation levels: sm through 2xl
- Semantic: card, hover, elevated, inner
- Healthcare: Success, error, warning, info glows

### Breakpoints
- xs: 320px (mobile)
- sm: 640px
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px
- 2xl: 1536px (ultra-wide)

### Z-Index
- -1 (hidden) to 10000 (maximized)
- Organized by layer: dropdown, sticky, fixed, modal, popover, tooltip

## Healthcare-Specific Features

### Plan Comparison Colors
```typescript
colors.healthcare.plans.traditional   // Gray
colors.healthcare.plans.dpc          // Green
colors.healthcare.plans.catastrophic // Blue
```

### Provider Ratings
```typescript
getRatingColor(4.8) // Returns green for excellent
getRatingColor(3.0) // Returns orange for average
```

### Medication Pricing
```typescript
getPricingColor(45)   // Very affordable (green)
getPricingColor(150)  // Moderate (orange)
getPricingColor(350)  // Very expensive (red)
```

### ACA Metal Tiers
```typescript
colors.healthcare.metalTiers.bronze     // Red
colors.healthcare.metalTiers.silver     // Gray
colors.healthcare.metalTiers.gold       // Orange
colors.healthcare.metalTiers.platinum   // Blue
```

## Common Patterns

### Button Variants
```typescript
createButtonStyles('primary', 'md')    // Primary button, medium size
createButtonStyles('success', 'lg')    // Success button, large size
createButtonStyles('error', 'sm')      // Error button, small size
```

### Component Styles
```typescript
createButtonStyles(variant, size)
createInputStyles()
createCardStyles()
createBadgeStyles(variant)
createProviderCardStyles()
createComparisonHeaderStyles()
createCostDisplayStyles()
```

### Healthcare Utilities
```typescript
getHealthcareStatusColor('success')    // Success colors
getHealthcareStatusColor('error')      // Error colors
getRatingColor(rating)                 // Rating colors
getPricingColor(price)                 // Pricing tier colors
```

### Spacing Utilities
```typescript
getSpacing(4)                          // '1rem'
createSpacing(4, 6, 4, 2)             // '1rem 1.5rem 1rem 0.5rem'
createResponsiveSpacing(2, 4, 8)      // { mobile, tablet, desktop }
```

## Integration with Tailwind CSS

The tokens are designed to work with Tailwind CSS. You can extend the Tailwind config with these tokens:

```javascript
// tailwind.config.js
import { colors, spacing, borderRadius } from './src/styles/tokens'

export default {
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius,
    },
  },
}
```

## Best Practices

1. **Always use tokens** - Never hardcode color or spacing values
2. **Use semantic tokens** - Prefer `colors.semantic.border` over `colors.neutral[300]`
3. **Use hooks in React** - Components benefit from memoization
4. **Compose from utilities** - Use `createButtonStyles()` instead of building manually
5. **Maintain consistency** - All UI should follow the token system
6. **Healthcare awareness** - Use healthcare-specific colors for domain features

## File Sizes

- `tokens.ts`: ~16 KB (main tokens file)
- `useTokens.ts`: ~14 KB (hooks and utilities)
- `index.ts`: ~1.2 KB (export barrel)
- `TOKENS_GUIDE.md`: ~18 KB (documentation)
- **Total**: ~49 KB (documentation not included in bundle)

## Migration from Inline Styles

Converting existing components to use tokens:

### Before
```typescript
const styles = {
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '0.875rem',
  }
}
```

### After
```typescript
import { createButtonStyles } from '@/styles'

const styles = {
  button: createButtonStyles('primary', 'md')
}
```

## Performance

- Tokens are exported as `const` for proper tree-shaking
- Use hooks for memoized access in React components
- Token objects are frozen to prevent mutations
- Import only what you need to minimize bundle size

## Support & Questions

For detailed information about:
- Token usage patterns
- Component-specific token combinations
- Healthcare-specific design decisions
- Migration guidelines

See `TOKENS_GUIDE.md` for comprehensive documentation.

## Version Info

- Design System Version: 1.0.0
- Last Updated: November 2024
- Tailwind Compatibility: v3.x+

---

**Key Insight:** Use the `@/styles` import path for the cleanest, most maintainable imports throughout your components.
