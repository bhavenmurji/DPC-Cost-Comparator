# Error Boundary System Documentation

## Overview

The DPC Cost Comparator now has a robust error boundary system that gracefully handles runtime errors in the React frontend. The system provides user-friendly error messages, automatic error reporting to analytics (PostHog), and recovery mechanisms.

## Architecture

### Components

#### 1. ErrorBoundary (`apps/web/src/components/ErrorBoundary.tsx`)

A React Error Boundary class component that:

- **Catches Errors**: Catches JavaScript errors anywhere in the component tree
- **Logs Errors**: Logs detailed error information to console and analytics
- **Categorizes Errors**: Identifies error types (render, network, API, unknown)
- **Tracks Error Count**: Monitors repeated errors in the same boundary
- **Reports to Analytics**: Sends error events to PostHog with error details
- **Provides Recovery**: Offers reset functionality to recover from errors

**Key Features:**
- Error type detection based on error message
- Custom error handler callback support
- Configurable fallback UI
- Unique boundary identification for targeted error tracking
- Automatic analytics reporting with stack trace truncation

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactElement              // Custom error UI (optional)
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void  // Custom handler
  errorBoundaryId?: string              // Unique identifier for tracking
}
```

#### 2. ErrorFallback (`apps/web/src/components/ErrorFallback.tsx`)

A user-friendly error display component that:

- **Shows Error Context**: Displays appropriate message based on error type
- **Provides Actions**: Offers "Try Again" and "Go Home" buttons
- **Development Mode**: Shows detailed error information in development
- **Production Mode**: Shows support contact information in production
- **Error Count Warning**: Alerts users when multiple errors occur
- **Beautiful UI**: Clean, centered card design with emojis

**Error Types Handled:**
- **Network Errors**: Connection issues
- **API Errors**: Server-side problems
- **Render Errors**: Component rendering failures
- **Unknown Errors**: Catch-all category

**Visual Design:**
- Responsive card layout
- Type-specific emoji icons
- Color-coded visual feedback
- Development error details collapsible section
- Support contact information for production

### Integration Points

#### Root Level (`apps/web/src/main.tsx`)

The ErrorBoundary wraps the entire application at the root level:

```typescript
<ErrorBoundary errorBoundaryId="root">
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ErrorBoundary>
```

**Purpose:** Catches any unhandled errors throughout the entire app lifecycle

#### Page Level - Provider Search (`apps/web/src/pages/ProviderSearch.tsx`)

Two separate error boundaries protect critical components:

```typescript
// Map View Error Boundary
<ErrorBoundary errorBoundaryId="provider-map">
  <ProviderMap {...props} />
</ErrorBoundary>

// Provider List Error Boundary
<ErrorBoundary errorBoundaryId="provider-list">
  <div style={styles.results}>
    {/* Provider list rendering */}
  </div>
</ErrorBoundary>
```

**Purpose:** Isolates map and list failures, preventing one from breaking the other

#### Results Display (`apps/web/src/App.tsx`)

```typescript
<ErrorBoundary errorBoundaryId="comparison-results">
  <ComparisonResults {...props} />
</ErrorBoundary>
```

**Purpose:** Protects cost comparison results display from rendering errors

## Error Handling Flow

```
1. Error Occurs
   ↓
2. ErrorBoundary.componentDidCatch()
   ├─ Log to console
   ├─ Extract error details
   ├─ Determine error type
   └─ Report to PostHog analytics
   ↓
3. Update State (hasError = true)
   ↓
4. Render ErrorFallback UI
   ├─ Show user-friendly message
   ├─ Provide recovery actions
   └─ Show dev details (if development mode)
   ↓
5. User Action
   ├─ Try Again → onReset() → Clear error state → Re-render
   └─ Go Home → Navigate to "/" → Fresh start
```

## Analytics Integration

### PostHog Event: `error_boundary_triggered`

Automatically reported when an error is caught:

```typescript
{
  error_message: string              // The error message
  error_type: string                 // 'render' | 'network' | 'api' | 'unknown'
  error_stack: string                // First 500 chars of stack trace
  boundary_id: string                // Unique boundary identifier
  timestamp: string                  // ISO timestamp
}
```

**Benefits:**
- Track error patterns and frequency
- Identify critical failure points
- Monitor error trends over time
- Correlate errors with user actions
- Alert on error spikes

## Development vs Production

### Development Mode

```typescript
// Detailed error information displayed
- Error message
- Component stack trace
- Full stack trace
- Collapsible details section
```

### Production Mode

```typescript
// User-friendly messages
- Generic error description
- Support contact information
- No technical details revealed
```

The mode is determined by `import.meta.env.PROD`

## Usage Examples

### Basic Error Boundary Wrapper

```typescript
import ErrorBoundary from './components/ErrorBoundary'

function MyComponent() {
  return (
    <ErrorBoundary errorBoundaryId="my-feature">
      <ComplexFeature />
    </ErrorBoundary>
  )
}
```

### Custom Fallback UI

```typescript
import ErrorBoundary from './components/ErrorBoundary'
import CustomErrorUI from './components/CustomErrorUI'

function MyComponent() {
  return (
    <ErrorBoundary
      errorBoundaryId="custom"
      fallback={<CustomErrorUI />}
    >
      <ComplexFeature />
    </ErrorBoundary>
  )
}
```

### Custom Error Handler

```typescript
import ErrorBoundary from './components/ErrorBoundary'

function MyComponent() {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Custom logging to your service
    logToCustomService(error, errorInfo)
  }

  return (
    <ErrorBoundary
      errorBoundaryId="tracked"
      onError={handleError}
    >
      <ComplexFeature />
    </ErrorBoundary>
  )
}
```

## Error Type Detection

The system automatically detects error types based on error messages:

| Error Type | Detection Keywords | Common Causes |
|-----------|-------------------|---------------|
| Network | 'fetch', 'network' | Connection failures, offline mode |
| API | 'api', 'request' | Server errors, 4xx/5xx responses |
| Render | (default) | Invalid JSX, state mutations, hooks |
| Unknown | - | Unexpected errors |

## Limitations and Considerations

### What Error Boundaries DO NOT Catch

1. **Event Handler Errors** - Use try-catch in handlers instead
2. **Asynchronous Code** - Use .catch() or try-catch in async/await
3. **Server-Side Rendering** - Only client-side React errors
4. **Error Boundary Errors** - If ErrorBoundary itself throws, it won't catch it
5. **Non-React Code** - Plain JavaScript errors in other libraries

### Best Practices

1. **Strategic Placement**: Place boundaries at multiple levels for granular control
2. **Unique IDs**: Always provide unique `errorBoundaryId` for tracking
3. **Custom Handlers**: Add custom error handlers for sensitive operations
4. **Test Error States**: Verify error UI displays correctly
5. **Monitor Analytics**: Watch PostHog for error patterns
6. **Update Messages**: Keep error messages user-friendly and helpful
7. **Fallback Content**: Provide meaningful fallback for each boundary

## Recovery Strategies

### User Actions

1. **Try Again Button**: Resets error state and re-renders component
2. **Go Home Button**: Navigates to home page for fresh start
3. **Manual Refresh**: Browser refresh clears all state

### Automatic Recovery

- Error boundaries automatically reset when:
  - Parent component re-renders with different props
  - User navigates to a different page
  - Time-based recovery (if implemented)

## Testing Error Boundaries

### Manual Testing

```typescript
// Temporarily add error in component to test boundary
throw new Error('Test error message')

// Then remove after testing
```

### Component Testing

```typescript
import { render } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

describe('ErrorBoundary', () => {
  it('catches errors and displays fallback UI', () => {
    const ThrowError = () => {
      throw new Error('Test error')
    }

    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    )

    expect(getByText(/Something Went Wrong/i)).toBeInTheDocument()
  })
})
```

## Troubleshooting

### Error Not Being Caught

**Problem**: Error appears in console but ErrorFallback doesn't show

**Solutions**:
- Ensure ErrorBoundary is in the component tree
- Check that error occurs in render method (not event handlers)
- Verify ErrorBoundary ID is present
- Check browser console for "Error boundary failed" messages

### Analytics Not Reporting

**Problem**: Error occurs but PostHog doesn't capture event

**Solutions**:
- Verify PostHog is initialized (check console for "📊 Analytics initialized")
- Ensure VITE_POSTHOG_KEY is set in .env
- Check PostHog network requests in DevTools
- Verify error is being caught by boundary

### Fallback UI Not Rendering

**Problem**: ErrorFallback component doesn't display

**Solutions**:
- Check that errorBoundaryId is provided
- Verify fallback prop is correct type
- Check for CSS issues (try disabling styles)
- Open browser DevTools for rendering errors

## Future Enhancements

Potential improvements to the error boundary system:

1. **Error Retry Logic**: Automatic retry with exponential backoff
2. **Error Reporting Service**: Send errors to Sentry or similar
3. **Error Recovery Strategies**: Custom recovery logic per boundary
4. **Error History**: Track and display previous errors
5. **User Feedback**: Capture user reports about errors
6. **Error Context**: Include URL, user info, session data
7. **Error Aggregation**: Group similar errors in analytics
8. **Smart Recovery**: ML-based recovery suggestions

## Files Modified/Created

### New Files
- `apps/web/src/components/ErrorBoundary.tsx` - Main error boundary class
- `apps/web/src/components/ErrorFallback.tsx` - Error UI display component
- `apps/web/src/types/window.d.ts` - Window interface types
- `docs/ERROR_BOUNDARY_SYSTEM.md` - This documentation

### Modified Files
- `apps/web/src/main.tsx` - Added root ErrorBoundary wrapper
- `apps/web/src/App.tsx` - Added ErrorBoundary around ComparisonResults
- `apps/web/src/pages/ProviderSearch.tsx` - Added ErrorBoundaries around Map and List

## Support

For issues with the error boundary system:

1. Check the browser console for detailed error information
2. Review PostHog analytics for error patterns
3. Enable development mode to see full error details
4. Test with the custom error handler for additional logging
5. Open an issue with error details and reproduction steps
