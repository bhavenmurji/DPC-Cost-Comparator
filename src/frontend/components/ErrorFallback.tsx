'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, WifiOff, AlertCircle } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Determine error type based on error message and properties
 */
function getErrorType(error: Error): 'network' | 'validation' | 'generic' {
  const errorMessage = error.message.toLowerCase();

  if (
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  ) {
    return 'network';
  }

  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('must be')
  ) {
    return 'validation';
  }

  return 'generic';
}

/**
 * ErrorFallback Component
 *
 * Provides user-friendly error messages based on error type.
 * Displays different UI based on whether the error is:
 * - Network related (connection issues)
 * - Validation related (invalid input data)
 * - Generic (unknown errors)
 */
export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const errorType = getErrorType(error);

  // Network Error UI
  if (errorType === 'network') {
    return (
      <Card className="max-w-lg mx-auto mt-8 border-orange-300 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <WifiOff className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-orange-900">Connection Lost</CardTitle>
          </div>
          <CardDescription>
            Unable to connect to the server. Please check your internet connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This could be because:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
              <li>Your internet connection is unstable</li>
              <li>The server is temporarily unavailable</li>
              <li>There is a network firewall blocking the request</li>
            </ul>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-3 bg-white rounded border border-orange-200">
                <summary className="cursor-pointer text-sm font-medium text-orange-900">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto text-red-800">
                  {error.message}
                  {'\n'}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={resetError} className="w-full" variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Validation Error UI
  if (errorType === 'validation') {
    return (
      <Card className="max-w-lg mx-auto mt-8 border-yellow-300 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-yellow-900">Invalid Data</CardTitle>
          </div>
          <CardDescription>
            There was a problem with the information you provided.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Please check your inputs and try again. Make sure all required fields are filled out correctly.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-3 bg-white rounded border border-yellow-200">
                <summary className="cursor-pointer text-sm font-medium text-yellow-900">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs overflow-x-auto text-red-800">
                  {error.message}
                  {'\n'}
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={resetError} className="w-full" variant="default">
            <RefreshCw className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Generic Error UI
  return (
    <Card className="max-w-lg mx-auto mt-8 border-red-300 bg-red-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <CardTitle className="text-red-900">Something Went Wrong</CardTitle>
        </div>
        <CardDescription>
          An unexpected error occurred. Please try again.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            We apologize for the inconvenience. The error has been logged and our team will investigate.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-3 bg-white rounded border border-red-200">
              <summary className="cursor-pointer text-sm font-medium text-red-900">
                Error Details (Development)
              </summary>
              <pre className="mt-2 text-xs overflow-x-auto text-red-800">
                {error.message}
                {'\n'}
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={resetError} className="flex-1" variant="default">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="flex-1"
          variant="outline"
        >
          Reload Page
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * Minimal Error Fallback for small component boundaries
 */
export function MinimalErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="p-4 border border-red-300 rounded bg-red-50 text-center">
      <AlertTriangle className="h-5 w-5 text-red-600 mx-auto mb-2" />
      <p className="text-sm text-red-900 mb-2">Unable to load this section</p>
      <Button onClick={resetError} size="sm" variant="outline">
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  );
}
