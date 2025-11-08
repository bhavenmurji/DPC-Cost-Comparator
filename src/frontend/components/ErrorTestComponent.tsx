'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorTestComponent
 *
 * A component for testing error boundaries in development.
 * Provides buttons to trigger different types of errors.
 *
 * ONLY USE IN DEVELOPMENT - Remove or disable in production
 */
export function ErrorTestComponent() {
  const [count, setCount] = useState(0);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const throwRenderError = () => {
    throw new Error('Test render error: This is a simulated component error');
  };

  const throwNetworkError = () => {
    throw new Error('Network error: Failed to fetch data from server');
  };

  const throwValidationError = () => {
    throw new Error('Validation error: Invalid input data provided');
  };

  const throwAsyncError = async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    throw new Error('Async error: Failed to complete asynchronous operation');
  };

  return (
    <Card className="mb-6 border-yellow-500 bg-yellow-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-yellow-900">Error Boundary Test Component</CardTitle>
        </div>
        <CardDescription>
          Development only - Test error boundaries by triggering different error types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setCount(count + 1)}
              variant="outline"
              size="sm"
            >
              Normal Click (Count: {count})
            </Button>
            <Button
              onClick={throwRenderError}
              variant="destructive"
              size="sm"
            >
              Throw Render Error
            </Button>
            <Button
              onClick={throwNetworkError}
              variant="destructive"
              size="sm"
            >
              Throw Network Error
            </Button>
            <Button
              onClick={throwValidationError}
              variant="destructive"
              size="sm"
            >
              Throw Validation Error
            </Button>
            <Button
              onClick={() => throwAsyncError()}
              variant="destructive"
              size="sm"
            >
              Throw Async Error
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Click any error button to test the error boundary. The boundary should catch the error
            and display the appropriate fallback UI without crashing the entire app.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Component that conditionally throws error based on props
 */
interface ConditionalErrorProps {
  shouldError?: boolean;
  errorType?: 'network' | 'validation' | 'generic';
  children?: React.ReactNode;
}

export function ConditionalErrorComponent({
  shouldError = false,
  errorType = 'generic',
  children,
}: ConditionalErrorProps) {
  if (shouldError) {
    switch (errorType) {
      case 'network':
        throw new Error('Network error: Connection timeout');
      case 'validation':
        throw new Error('Validation error: Required field missing');
      default:
        throw new Error('Generic error: Something went wrong');
    }
  }

  return <>{children}</>;
}
