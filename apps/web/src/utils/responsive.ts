// Responsive Design Utilities
// Breakpoints and responsive helper functions

export const breakpoints = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const

export type Breakpoint = keyof typeof breakpoints

// Media query helpers
export const mediaQuery = {
  mobile: `@media (max-width: ${breakpoints.mobile}px)`,
  tablet: `@media (max-width: ${breakpoints.tablet}px)`,
  desktop: `@media (min-width: ${breakpoints.desktop}px)`,
  wide: `@media (min-width: ${breakpoints.wide}px)`,
}

// Check if current viewport matches breakpoint
export const isBreakpoint = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= breakpoints[breakpoint]
}

// Get responsive value based on screen size
export const getResponsiveValue = <T>(values: {
  mobile?: T
  tablet?: T
  desktop?: T
  default: T
}): T => {
  if (typeof window === 'undefined') return values.default

  const width = window.innerWidth

  if (width <= breakpoints.mobile && values.mobile !== undefined) {
    return values.mobile
  }
  if (width <= breakpoints.tablet && values.tablet !== undefined) {
    return values.tablet
  }
  if (width >= breakpoints.desktop && values.desktop !== undefined) {
    return values.desktop
  }

  return values.default
}

// Responsive spacing scale
export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
} as const

// Responsive font sizes
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
} as const

// Common responsive styles
export const responsiveStyles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  mobileStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  desktopRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '2rem',
  },
  hideOnMobile: {
    display: 'none',
  },
  showOnMobile: {
    display: 'block',
  },
} as const

// React hook for responsive behavior
export const useMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false

  const [matches, setMatches] = React.useState(
    () => window.matchMedia(query).matches
  )

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Import React for hook
import React from 'react'

// Hook to detect mobile viewport
export const useIsMobile = (): boolean => {
  return useMediaQuery(`(max-width: ${breakpoints.tablet}px)`)
}

// Hook to detect tablet viewport
export const useIsTablet = (): boolean => {
  return useMediaQuery(
    `(min-width: ${breakpoints.mobile + 1}px) and (max-width: ${breakpoints.tablet}px)`
  )
}

// Hook to detect desktop viewport
export const useIsDesktop = (): boolean => {
  return useMediaQuery(`(min-width: ${breakpoints.desktop}px)`)
}

// Generate responsive padding/margin
export const responsiveSpace = (size: keyof typeof spacing) => ({
  padding: spacing[size],
  '@media (max-width: 768px)': {
    padding: spacing[size === 'xl' ? 'md' : 'sm'],
  },
})
