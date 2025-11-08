# Error Boundary Implementation

## Overview

This document describes the React Error Boundary implementation for the DPC Cost Comparator application. Error boundaries prevent component errors from crashing the entire application and provide graceful error handling with user-friendly fallback UIs.

## Architecture

### Components

#### 1. ErrorBoundary (`src/frontend/components/ErrorBoundary.tsx`)

The main error boundary component that catches JavaScript errors in the component tree.

**Features:**
- Catches errors using `componentDidCatch` lifecycle method
- Logs errors to backend service
- Supports different error boundary levels (root, feature, component)
- Provides error reset functionality
- Supports custom fallback components
- Custom error handlers via `onError` prop

**Props:**
```typescript
interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'root' | 'feature' | 'component';
}
```

**Usage:**
```tsx
<ErrorBoundary level="feature">
  <YourComponent />
</ErrorBoundary>
```

#### 2. ErrorFallback (`src/frontend/components/ErrorFallback.tsx`)

Provides user-friendly error UIs based on error type.

**Error Types:**
- **Network Errors**: Connection issues, fetch failures, timeouts
- **Validation Errors**: Invalid input, required fields, data validation
- **Generic Errors**: Unexpected errors

**Features:**
- Different UI for each error type
- Development mode shows detailed error information
- Retry functionality
- Page reload option for critical errors

**Components:**
- `ErrorFallback`: Full-featured error UI
- `MinimalErrorFallback`: Compact error UI for smaller components

#### 3. Error Logger (`src/frontend/lib/error-logger.ts`)

Handles error logging to backend services.

**Features:**
- Sanitizes PHI (Protected Health Information) from errors
- Environment-aware logging (development vs production)
- Error severity classification
- Backend integration via API
- Console logging in development

**Functions:**
```typescript
// Log error to service
logErrorToService(config: ErrorLogConfig): void

// Create error with additional context
createContextualError(message: string, context?: Record<string, any>): Error

// Wrap async functions with error handling
withErrorHandling<T>(fn: T, errorMessage?: string): T
```

### Error Boundary Levels

#### Root Level (`level="root"`)
- Wraps the entire application
- Catches critical errors that would crash the app
- Highest priority logging (CRITICAL)
- Location: `src/frontend/app/layout.tsx`

#### Feature Level (`level="feature"`)
- Wraps major features or page sections
- Prevents feature errors from affecting other parts
- High priority logging (HIGH)
- Examples:
  - Comparison Dashboard
  - Provider List

#### Component Level (`level="component"`)
- Wraps individual components
- Most granular error handling
- Lower priority logging (LOW to MEDIUM)
- Examples:
  - Insurance Form
  - Profile Form

## Implementation Details

### 1. Application Layout

**File:** `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/app/layout.tsx`

Root-level error boundary wraps the entire application:

```tsx
<ErrorBoundary level="root">
  <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    {/* App content */}
  </div>
</ErrorBoundary>
```

### 2. Feature Components

#### Comparison Dashboard
**File:** `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/comparison-dashboard.tsx`

```tsx
export function ComparisonDashboard({ comparison }: ComparisonDashboardProps) {
  return (
    <ErrorBoundary level="feature" fallback={MinimalErrorFallback}>
      <ComparisonDashboardContent comparison={comparison} />
    </ErrorBoundary>
  );
}
```

#### Provider List
**File:** `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/provider-list.tsx`

```tsx
export function ProviderList({ providers }: ProviderListProps) {
  return (
    <ErrorBoundary level="feature" fallback={MinimalErrorFallback}>
      <ProviderListContent providers={providers} />
    </ErrorBoundary>
  );
}
```

### 3. Form Components

#### Insurance Form
**File:** `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/insurance-form.tsx`

```tsx
export function InsuranceForm({ plan, onChange }: InsuranceFormProps) {
  return (
    <ErrorBoundary level="component" fallback={MinimalErrorFallback}>
      <InsuranceFormContent plan={plan} onChange={onChange} />
    </ErrorBoundary>
  );
}
```

## Error Logging

### Backend Integration

Errors are sent to the backend API endpoint:

**Endpoint:** `POST /api/errors/log`

**Payload:**
```typescript
{
  message: string;           // Error message (sanitized)
  stack: string;             // Stack trace
  componentStack?: string;   // React component stack
  level: 'root' | 'feature' | 'component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;         // ISO timestamp
  userAgent: string;         // Browser user agent
  context?: Record<string, any>;  // Additional context
}
```

### PHI Sanitization

The error logger automatically removes Protected Health Information:
- Social Security Numbers (XXX-XX-XXXX)
- Phone numbers (XXX-XXX-XXXX)
- Email addresses

Example:
```typescript
// Before: "Error with SSN 123-45-6789"
// After:  "Error with SSN [REDACTED]"
```

### Error Severity Classification

| Level | Error Type | Severity |
|-------|------------|----------|
| root | Any | CRITICAL |
| feature | Network | HIGH |
| feature | Other | MEDIUM |
| component | Validation | MEDIUM |
| component | Other | LOW |

## Testing

### Test Components

**File:** `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/ErrorTestComponent.tsx`

Development-only component for testing error boundaries:

```tsx
<ErrorTestComponent />
```

**Features:**
- Trigger different error types
- Test network errors
- Test validation errors
- Test async errors
- Only renders in development mode

### Unit Tests

#### Error Boundary Tests
**File:** `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/__tests__/ErrorBoundary.test.tsx`

**Coverage:**
- Basic error catching
- Error logging
- Custom error handlers
- Error reset functionality
- Custom fallback components
- Different error boundary levels
- Error fallback UI variants
- Higher-order component (HOC)

#### Error Logger Tests
**File:** `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/__tests__/error-logger.test.ts`

**Coverage:**
- Backend integration
- PHI sanitization
- Environment-specific behavior
- Error severity classification
- Contextual errors
- Async error wrapping

### Running Tests

```bash
# Run all tests
npm test

# Run error boundary tests only
npm test ErrorBoundary

# Run with coverage
npm test -- --coverage
```

## Usage Examples

### Basic Usage

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary level="component">
      <PotentiallyErrorProneComponent />
    </ErrorBoundary>
  );
}
```

### With Custom Fallback

```tsx
const CustomFallback = ({ error, resetError }) => (
  <div>
    <h2>Oops! {error.message}</h2>
    <button onClick={resetError}>Try Again</button>
  </div>
);

<ErrorBoundary fallback={CustomFallback}>
  <MyComponent />
</ErrorBoundary>
```

### With Error Handler

```tsx
const handleError = (error, errorInfo) => {
  // Custom error handling logic
  analytics.trackError(error);
};

<ErrorBoundary onError={handleError}>
  <MyComponent />
</ErrorBoundary>
```

### Using HOC

```tsx
import { withErrorBoundary } from '@/components/ErrorBoundary';

const MyComponent = () => <div>Content</div>;

export default withErrorBoundary(MyComponent, {
  level: 'component',
  onError: customHandler,
});
```

## Best Practices

### 1. Error Boundary Placement

- **Root Level**: Always wrap the entire app
- **Feature Level**: Wrap major features and pages
- **Component Level**: Wrap complex or error-prone components

### 2. Granular Boundaries

Use multiple error boundaries to prevent one component's error from affecting others:

```tsx
<ErrorBoundary level="feature">
  <ErrorBoundary level="component">
    <FormComponent />
  </ErrorBoundary>

  <ErrorBoundary level="component">
    <ChartComponent />
  </ErrorBoundary>
</ErrorBoundary>
```

### 3. Error Context

Provide context when throwing errors:

```tsx
import { createContextualError } from '@/lib/error-logger';

throw createContextualError('Failed to load data', {
  userId: user.id,
  action: 'fetchProfile',
});
```

### 4. Async Error Handling

Wrap async functions with error handling:

```tsx
import { withErrorHandling } from '@/lib/error-logger';

const fetchData = withErrorHandling(
  async () => {
    const response = await fetch('/api/data');
    return response.json();
  },
  'Failed to fetch data'
);
```

### 5. Development Testing

Use the test component during development:

```tsx
{process.env.NODE_ENV === 'development' && <ErrorTestComponent />}
```

## Environment Configuration

### Development

```env
NODE_ENV=development
# Optional: Enable error logging in development
NEXT_PUBLIC_ENABLE_ERROR_LOGGING=true
```

**Behavior:**
- Detailed error information displayed
- Errors logged to console
- Optional backend logging

### Production

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.production.com
```

**Behavior:**
- User-friendly error messages
- PHI sanitization
- Errors sent to backend
- No console logging

## Backend API Requirements

### Error Logging Endpoint

The frontend expects a backend endpoint for error logging:

**Endpoint:** `POST /api/errors/log`

**Request Body:**
```typescript
{
  message: string;
  stack: string;
  componentStack?: string;
  level: 'root' | 'feature' | 'component';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userAgent: string;
  context?: Record<string, any>;
}
```

**Response:**
```typescript
{
  success: boolean;
  errorId?: string;  // Optional error tracking ID
}
```

### Implementation Example

```typescript
// Backend error logging route
router.post('/api/errors/log', async (req, res) => {
  const { message, stack, level, severity, timestamp } = req.body;

  // Save to database
  await ErrorLog.create({
    message,
    stack,
    level,
    severity,
    timestamp,
    // ... other fields
  });

  // Alert on critical errors
  if (severity === 'critical') {
    await alertOps(message);
  }

  res.json({ success: true });
});
```

## Monitoring and Alerts

### Recommended Setup

1. **Error Dashboard**: Track error frequency and types
2. **Alerts**: Critical errors trigger immediate notifications
3. **Analytics**: Error patterns and user impact
4. **Sentry/Similar**: Integration with error tracking services

### Metrics to Monitor

- Error frequency by level
- Error types (network, validation, generic)
- Affected users
- Time to resolution
- Error recovery success rate

## Troubleshooting

### Error Boundary Not Catching Errors

**Issue:** Errors bypass the error boundary

**Solutions:**
- Errors must be thrown during render, not in event handlers
- Use try-catch in event handlers
- For async errors, use error state

```tsx
// ❌ Won't be caught by error boundary
const handleClick = () => {
  throw new Error('Event error');
};

// ✅ Will be caught
const handleClick = async () => {
  try {
    await riskyOperation();
  } catch (error) {
    setError(error);  // Update state to trigger re-render
  }
};
```

### Errors Not Logging to Backend

**Issue:** Errors not appearing in backend logs

**Solutions:**
- Check `NODE_ENV` and `NEXT_PUBLIC_ENABLE_ERROR_LOGGING`
- Verify API endpoint URL
- Check CORS configuration
- Review network tab for failed requests

### Error Details Not Showing in Development

**Issue:** Error details hidden even in development

**Solutions:**
- Verify `process.env.NODE_ENV === 'development'`
- Check browser console for suppressed errors
- Enable error details in fallback component

## Future Enhancements

### Planned Features

1. **Error Recovery Strategies**: Automatic retry with exponential backoff
2. **Error Analytics Dashboard**: Visual error tracking and trends
3. **User Feedback**: Allow users to report additional context
4. **Error Reproduction**: Capture user actions leading to error
5. **A/B Testing**: Test different error UIs for better UX

### Integration Opportunities

- Sentry integration for advanced error tracking
- LogRocket for session replay
- DataDog for APM and error monitoring
- Custom analytics dashboard

## Summary

The error boundary implementation provides:

- ✅ **Graceful degradation**: Errors don't crash the entire app
- ✅ **User-friendly UIs**: Context-aware error messages
- ✅ **Privacy protection**: PHI sanitization
- ✅ **Comprehensive logging**: Backend integration with context
- ✅ **Error recovery**: Reset functionality
- ✅ **Testing support**: Development test components
- ✅ **Granular control**: Multiple boundary levels

## Files Created/Modified

### Created Files
1. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/ErrorBoundary.tsx`
2. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/ErrorFallback.tsx`
3. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/lib/error-logger.ts`
4. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/ErrorTestComponent.tsx`
5. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/__tests__/ErrorBoundary.test.tsx`
6. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/__tests__/error-logger.test.ts`

### Modified Files
1. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/app/layout.tsx`
2. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/comparison-dashboard.tsx`
3. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/insurance-form.tsx`
4. `/home/bmurji/Development/DPC-Cost-Comparator/src/frontend/components/provider-list.tsx`
