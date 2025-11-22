# Skeleton Components - Code Reference

Complete code snippets and structure for all skeleton components created.

---

## 1. Base Skeleton Component

**File**: `apps/web/src/components/ui/skeleton.tsx`

```typescript
import React from 'react'
import { cn } from '@/utils/cn'

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "animate-pulse rounded-md bg-muted",
      className
    )}
    {...props}
  />
))
Skeleton.displayName = "Skeleton"

export { Skeleton }
```

**Features**:
- Uses `cn()` utility for className merging
- Implements `React.forwardRef` for ref access
- Includes `displayName` for debugging
- Tailwind classes: `animate-pulse`, `rounded-md`, `bg-muted`

---

## 2. Provider Card Skeleton

**File**: `apps/web/src/components/ProviderCardSkeleton.tsx`

**Size**: ~180 lines
**Matches**: ProviderCard component layout

```typescript
import React from 'react'
import { Skeleton } from './ui/skeleton'

export default function ProviderCardSkeleton() {
  return (
    <div style={styles.card}>
      {/* Header Section */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Skeleton style={styles.nameSkeletons} />
          <Skeleton style={styles.ratingSkeletons} />
        </div>
        <Skeleton style={styles.badgeSkeletons} />
      </div>

      {/* Details Section - 4 Rows */}
      <div style={styles.details}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.row}>
            <span style={styles.icon}>{'  '}</span>
            <div style={styles.info}>
              <Skeleton style={styles.detailsLineSkeleton} />
              <Skeleton style={styles.detailsSubSkeleton} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div style={styles.footer}>
        <Skeleton style={styles.dataSourceSkeleton} />
        <div style={styles.buttonGroup}>
          <Skeleton style={styles.buttonSkeleton} />
          <Skeleton style={styles.buttonSkeleton} />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  // ... (complete styling object)
}
```

---

## 3. Map Skeleton

**File**: `apps/web/src/components/MapSkeleton.tsx`

**Size**: ~100 lines
**Matches**: Google Maps loading state

```typescript
import React from 'react'
import { Skeleton } from './ui/skeleton'

interface MapSkeletonProps {
  height?: string
}

export default function MapSkeleton({ height = '600px' }: MapSkeletonProps) {
  return (
    <div style={{ ...styles.container, height }}>
      <Skeleton style={styles.mapBackground} />
      <div style={styles.loadingOverlay}>
        <div style={styles.spinner} className="animate-spin" />
        <p style={styles.loadingText}>Loading map...</p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    zIndex: 10,
  },
  // ... (complete styling object)
}
```

**Props**:
- `height` (string): Container height, default "600px"

---

## 4. Comparison Results Skeleton

**File**: `apps/web/src/components/ComparisonResultsSkeleton.tsx`

**Size**: ~250 lines
**Matches**: Full ComparisonResults page layout

**Main Sections**:
1. Data Source Banner
2. Savings Card
3. Plan Comparison Cards (2 columns)
4. Benefits Section
5. Provider Cards Grid

```typescript
import React from 'react'
import { Skeleton } from './ui/skeleton'
import ProviderCardSkeleton from './ProviderCardSkeleton'

export default function ComparisonResultsSkeleton() {
  return (
    <div style={styles.container}>
      {/* Data Source Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerIcon} className="animate-pulse" />
        <div style={styles.bannerContent}>
          <Skeleton style={styles.bannerTitle} />
          <Skeleton style={styles.bannerText} />
        </div>
        <div style={styles.bannerBadges}>
          <Skeleton style={styles.badge} />
          <Skeleton style={styles.badge} />
        </div>
      </div>

      {/* Savings Card */}
      <div style={styles.savingsCard}>
        <Skeleton style={styles.savingsTitle} />
        <Skeleton style={styles.savingsAmount} />
        <Skeleton style={styles.savingsText} />
      </div>

      {/* Comparison Cards */}
      <div style={styles.comparisonContainer}>
        <div style={styles.planCard}>
          {/* Plan 1 skeletons */}
        </div>
        <div style={styles.planCard}>
          {/* Plan 2 skeletons */}
        </div>
      </div>

      {/* Benefits Section */}
      <div style={styles.benefitsCard}>
        <Skeleton style={styles.benefitsTitle} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.benefitItem}>
            <Skeleton style={styles.benefitCheck} />
            <Skeleton style={styles.benefitText} />
          </div>
        ))}
      </div>

      {/* Provider Cards */}
      <div style={styles.providersSection}>
        <Skeleton style={styles.providersTitle} />
        <div style={styles.providersGrid}>
          {[1, 2, 3].map((i) => (
            <ProviderCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  // ... (complete styling object - ~150 lines)
}
```

---

## 5. Provider Details Skeleton

**File**: `apps/web/src/components/ProviderDetailsSkeleton.tsx`

**Size**: ~220 lines
**Matches**: ProviderDetails page layout

**Main Sections**:
1. Back Button
2. Provider Header
3. Contact Grid
4. Details List
5. Services Tags
6. Pricing Grid
7. About Section
8. Action Buttons

```typescript
import React from 'react'
import { Skeleton } from './ui/skeleton'

export default function ProviderDetailsSkeleton() {
  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button style={styles.backButton} disabled>
        ← Back
      </button>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Skeleton style={styles.nameSkeleton} />
          <Skeleton style={styles.practiceSkeleton} />
        </div>
        <div style={styles.badges}>
          <Skeleton style={styles.badge} />
          <Skeleton style={styles.badge} />
        </div>
      </div>

      {/* Contact Grid */}
      <div style={styles.contactGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={styles.contactItem}>
            <Skeleton style={styles.contactLabel} />
            <Skeleton style={styles.contactValue} />
          </div>
        ))}
      </div>

      {/* Details List */}
      <div style={styles.detailsList}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={styles.detailsRow}>
            <Skeleton style={styles.detailsIcon} />
            <Skeleton style={styles.detailsText} />
          </div>
        ))}
      </div>

      {/* Services Tags */}
      <div style={styles.servicesSection}>
        <Skeleton style={styles.sectionTitle} />
        <div style={styles.servicesTags}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} style={styles.serviceTag} />
          ))}
        </div>
      </div>

      {/* Pricing Grid */}
      <div style={styles.pricingGrid}>
        {[1, 2].map((i) => (
          <div key={i} style={styles.pricingCard}>
            <Skeleton style={styles.pricingTitle} />
            <Skeleton style={styles.pricingAmount} />
          </div>
        ))}
      </div>

      {/* About Section */}
      <div style={styles.aboutSection}>
        <Skeleton style={styles.aboutTitle} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} style={styles.aboutLine} />
        ))}
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button style={styles.button} disabled>Book Appointment</button>
        <button style={styles.button} disabled>Send Message</button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  // ... (complete styling object - ~150 lines)
}
```

---

## 6. Featured Providers Skeleton

**File**: `apps/web/src/components/FeaturedProvidersSkeleton.tsx`

**Size**: ~100 lines
**Matches**: Featured providers grid on city pages

**Features**:
- Configurable provider count
- Each item includes: header, address, details, services, button

```typescript
import React from 'react'
import { Skeleton } from './ui/skeleton'

interface FeaturedProvidersSkeletonProps {
  count?: number
}

export default function FeaturedProvidersSkeleton({
  count = 5
}: FeaturedProvidersSkeletonProps) {
  return (
    <div style={styles.section}>
      <div style={styles.providersGrid}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={styles.providerItem}>
            {/* Header */}
            <div style={styles.itemHeader}>
              <Skeleton style={styles.itemName} />
              <Skeleton style={styles.itemBadge} />
            </div>

            {/* Address */}
            <Skeleton style={styles.itemAddress} />

            {/* Details */}
            <div style={styles.itemDetails}>
              <Skeleton style={styles.detailsLine} />
              <Skeleton style={styles.detailsLine} />
            </div>

            {/* Services */}
            <div style={styles.itemServices}>
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} style={styles.serviceTag} />
              ))}
            </div>

            {/* Button */}
            <Skeleton style={styles.itemButton} />
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: '2rem',
    backgroundColor: '#fafafa',
    borderRadius: '8px',
  },
  providersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  // ... (complete styling object - ~50 lines)
}
```

**Props**:
- `count` (number): Number of provider skeletons, default 5

---

## Integration Examples

### Example 1: ProviderSearch Integration
```typescript
// In ProviderSearch.tsx
import ProviderCardSkeleton from '../components/ProviderCardSkeleton'

{loading && (
  <div style={styles.skeletonContainer}>
    {[1, 2, 3].map((i) => (
      <ProviderCardSkeleton key={i} />
    ))}
  </div>
)}

const styles: Record<string, React.CSSProperties> = {
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '2rem',
  },
}
```

### Example 2: ProviderMap Integration
```typescript
// In ProviderMap.tsx
import MapSkeleton from './MapSkeleton'

if (!isLoaded) {
  return <MapSkeleton height="600px" />
}
```

### Example 3: App.tsx Integration
```typescript
// In App.tsx
import ComparisonResultsSkeleton from './components/ComparisonResultsSkeleton'

{loading ? (
  <ErrorBoundary errorBoundaryId="comparison-results-skeleton">
    <ComparisonResultsSkeleton />
  </ErrorBoundary>
) : (
  <ErrorBoundary errorBoundaryId="comparison-results">
    <ComparisonResults {...comparisonProps} />
  </ErrorBoundary>
)}
```

### Example 4: City Page Integration
```typescript
// In NewYorkDPC.tsx
import FeaturedProvidersSkeleton from '../components/FeaturedProvidersSkeleton'

{loading ? (
  <FeaturedProvidersSkeleton count={5} />
) : (
  <div style={styles.section}>
    <h2 style={styles.sectionTitle}>Featured New York Providers</h2>
    {providers.length > 0 ? (
      // provider list
    ) : (
      <p>No providers found</p>
    )}
  </div>
)}
```

---

## Styling Patterns

### Skeleton Styling Constants
```typescript
// Common dimensions
const SKELETON_HEIGHTS = {
  small: '12px',
  medium: '16px',
  large: '20px',
  button: '40px',
  card: '200px',
}

const SKELETON_COLORS = {
  background: '#f9fafb',
  border: '#e5e7eb',
  text: '#d1d5db',
  accent: '#10b981',
}

const SKELETON_SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
}
```

### Animation Classes
```css
/* From Tailwind animate-pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## TypeScript Type Definitions

```typescript
// Base skeleton props
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

// MapSkeleton props
interface MapSkeletonProps {
  height?: string
}

// FeaturedProvidersSkeleton props
interface FeaturedProvidersSkeletonProps {
  count?: number
}

// All other skeletons use default React component props
```

---

## Performance Optimization Tips

### 1. Avoid Unnecessary Re-renders
```typescript
// Memoize skeletons to prevent re-renders
const MemoizedProviderCardSkeleton = React.memo(ProviderCardSkeleton)
```

### 2. Lazy Load Skeletons if Needed
```typescript
// For large skeleton components
const MapSkeleton = lazy(() => import('./MapSkeleton'))
```

### 3. Use Key Props Correctly
```typescript
// Good: unique keys for list items
{[1, 2, 3].map((i) => (
  <ProviderCardSkeleton key={i} />
))}
```

---

## Accessibility Considerations

### ARIA Labels
```typescript
<div
  role="status"
  aria-label="Loading provider information"
  aria-live="polite"
>
  <ProviderCardSkeleton />
</div>
```

### Screen Reader Announcement
```typescript
// Let screen readers know content is loading
<div aria-busy="true" aria-label="Loading content...">
  <MapSkeleton />
</div>
```

---

## Browser Compatibility

All skeleton components use:
- CSS Flexbox (IE11+)
- CSS Grid (IE11+)
- CSS Animations (IE10+)
- React 16.8+ (hooks compatible)
- Tailwind CSS (all versions)

**Minimum Browser Versions**:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- IE 11 (with polyfills)

---

## Related Documentation

- `SKELETON_COMPONENTS_IMPLEMENTATION.md` - Complete architecture guide
- `SKELETON_QUICK_REFERENCE.md` - Quick lookup guide
- `SKELETON_IMPLEMENTATION_COMPLETE.md` - Project overview

---

**Last Updated**: November 21, 2025
**Status**: Complete and Production-Ready
**Version**: 1.0
