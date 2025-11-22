# Skeleton Components - Quick Reference Guide

## Created Components

### 1. Base Skeleton Component
**Location**: `apps/web/src/components/ui/skeleton.tsx`
**Purpose**: Reusable animated placeholder component
**Usage**:
```typescript
import { Skeleton } from './ui/skeleton'
<Skeleton className="h-12 w-full rounded" />
```

---

## Specialized Skeleton Components

### 2. ProviderCardSkeleton
**Location**: `apps/web/src/components/ProviderCardSkeleton.tsx`
**What it mimics**: ProviderCard component layout
**Where it's used**:
- `apps/web/src/pages/ProviderSearch.tsx` (3 cards in grid)

**Code Example**:
```typescript
import ProviderCardSkeleton from '../components/ProviderCardSkeleton'

{loading && (
  <div style={styles.skeletonContainer}>
    {[1, 2, 3].map((i) => (
      <ProviderCardSkeleton key={i} />
    ))}
  </div>
)}
```

---

### 3. MapSkeleton
**Location**: `apps/web/src/components/MapSkeleton.tsx`
**What it mimics**: Google Maps loading state
**Where it's used**:
- `apps/web/src/components/ProviderMap.tsx`

**Props**:
- `height` (string, optional): Height of skeleton (default: "600px")

**Code Example**:
```typescript
import MapSkeleton from './MapSkeleton'

if (!isLoaded) {
  return <MapSkeleton height="600px" />
}
```

---

### 4. ComparisonResultsSkeleton
**Location**: `apps/web/src/components/ComparisonResultsSkeleton.tsx`
**What it mimics**: Complete ComparisonResults page layout
**Where it's used**:
- `apps/web/src/App.tsx`

**Code Example**:
```typescript
import ComparisonResultsSkeleton from './components/ComparisonResultsSkeleton'

{loading ? (
  <ErrorBoundary errorBoundaryId="comparison-results-skeleton">
    <ComparisonResultsSkeleton />
  </ErrorBoundary>
) : (
  <ComparisonResults {...props} />
)}
```

---

### 5. ProviderDetailsSkeleton
**Location**: `apps/web/src/components/ProviderDetailsSkeleton.tsx`
**What it mimics**: ProviderDetails page layout
**Where it's used**:
- `apps/web/src/pages/ProviderDetails.tsx`

**Code Example**:
```typescript
import ProviderDetailsSkeleton from '../components/ProviderDetailsSkeleton'

if (loading) {
  return <ProviderDetailsSkeleton />
}
```

---

### 6. FeaturedProvidersSkeleton
**Location**: `apps/web/src/components/FeaturedProvidersSkeleton.tsx`
**What it mimics**: Featured providers section on city landing pages
**Where it's used**:
- `apps/web/src/pages/NewYorkDPC.tsx`
- `apps/web/src/pages/LosAngelesDPC.tsx`
- `apps/web/src/pages/ChicagoDPC.tsx`
- `apps/web/src/pages/SanDiegoDPC.tsx`
- `apps/web/src/pages/SanFranciscoDPC.tsx`

**Props**:
- `count` (number, optional): Number of provider skeletons (default: 5)

**Code Example**:
```typescript
import FeaturedProvidersSkeleton from '../components/FeaturedProvidersSkeleton'

{loading ? (
  <FeaturedProvidersSkeleton count={5} />
) : (
  <div style={styles.section}>
    {/* actual content */}
  </div>
)}
```

---

## Integration Summary

| Component | File Modified | Location in Code |
|-----------|---------------|-----------------|
| ProviderCardSkeleton | ProviderSearch.tsx | Lines 233-238 |
| MapSkeleton | ProviderMap.tsx | Line 159 |
| ComparisonResultsSkeleton | App.tsx | Lines 140-146 |
| ProviderDetailsSkeleton | ProviderDetails.tsx | Line 94 |
| FeaturedProvidersSkeleton | NewYorkDPC.tsx | Line 136 |
| FeaturedProvidersSkeleton | LosAngelesDPC.tsx | Line 136 |
| FeaturedProvidersSkeleton | ChicagoDPC.tsx | Line 136 |
| FeaturedProvidersSkeleton | SanDiegoDPC.tsx | Line 136 |
| FeaturedProvidersSkeleton | SanFranciscoDPC.tsx | Line 136 |

---

## Common Patterns Used

### Pattern 1: Simple Conditional
```typescript
if (loading) {
  return <SkeletonComponent />
}
return <ActualComponent />
```

### Pattern 2: Grid of Multiple Skeletons
```typescript
{loading && (
  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
    {[1, 2, 3].map((i) => (
      <SkeletonComponent key={i} />
    ))}
  </div>
)}
```

### Pattern 3: Conditional with ErrorBoundary
```typescript
{loading ? (
  <ErrorBoundary errorBoundaryId="skeleton-id">
    <SkeletonComponent />
  </ErrorBoundary>
) : (
  <ErrorBoundary errorBoundaryId="content-id">
    <ActualComponent {...props} />
  </ErrorBoundary>
)}
```

---

## Styling

All skeleton components use inline React.CSSProperties for consistency. The animation comes from Tailwind's `animate-pulse` class which provides:
- Smooth opacity fade (1 → 0.5 → 1)
- 2-second cycle
- Repeating animation

---

## Tips for Adding New Skeletons

1. **Analyze the target component layout**
   - Identify all sections (header, content, footer)
   - Note spacing and sizing

2. **Create skeleton matching the layout**
   - Use same column/row structure
   - Match element heights approximately
   - Use consistent spacing

3. **Apply animation**
   - Add `className="animate-pulse"` to placeholder elements
   - Or use `styles.skeletonElement` with Tailwind class

4. **Integrate into parent**
   - Wrap with `if (loading)` conditional
   - Pass props as needed (height, count, etc.)
   - Ensure proper error boundaries

---

## Performance Notes

- All skeleton components render instantly (no API calls)
- CSS animation is GPU-accelerated
- Components are removed from DOM when data loads
- No memory leaks (automatic cleanup)
- Loading time perceived as faster due to visual feedback

---

## Testing Skeletons

```typescript
// Test that skeleton appears while loading
render(<Component loading={true} />)
expect(screen.getByTestId('skeleton')).toBeInTheDocument()

// Test that skeleton disappears when loaded
render(<Component loading={false} />)
expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
expect(screen.getByTestId('content')).toBeInTheDocument()
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Skeleton doesn't match content | Compare layouts and adjust dimensions |
| Animation too fast/slow | Modify Tailwind animate-pulse duration |
| Skeleton shows at wrong time | Check loading state logic and async timing |
| Imports not found | Verify file paths match component structure |

---

**Last Updated**: November 21, 2025
**Status**: Complete and Production-Ready
