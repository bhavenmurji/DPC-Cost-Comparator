import React, { ReactNode, ReactElement } from 'react'

import ErrorFallback from './ErrorFallback'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactElement
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  errorBoundaryId?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorCount: number
  errorType: 'render' | 'network' | 'api' | 'unknown'
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      errorType: 'unknown',
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('Error caught by boundary:', error)
    console.error('Error info:', errorInfo)

    // Determine error type
    let errorType: 'render' | 'network' | 'api' | 'unknown' = 'unknown'
    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
      errorType = 'network'
    } else if (errorMessage.includes('api') || errorMessage.includes('request')) {
      errorType = 'api'
    } else {
      errorType = 'render'
    }

    this.setState(
      (prevState) => ({
        errorInfo,
        errorCount: prevState.errorCount + 1,
        errorType,
      }),
      () => {
        // Call external error handler if provided
        if (this.props.onError) {
          this.props.onError(error, errorInfo)
        }

        // Report to analytics (PostHog)
        this.reportErrorToAnalytics(error, errorType)

        // Alert user if error count is high
        if (this.state.errorCount > 3) {
          console.warn('Multiple errors detected. Consider refreshing the page.')
        }
      }
    )
  }

  private reportErrorToAnalytics(error: Error, errorType: string) {
    try {
      // Only report if analytics is available
      if (window.posthog) {
        window.posthog.capture('error_boundary_triggered', {
          error_message: error.message,
          error_type: errorType,
          error_stack: error.stack?.substring(0, 500), // Limit stack trace length
          boundary_id: this.props.errorBoundaryId || 'default',
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err) {
      // Silently fail if analytics reporting fails
      console.error('Failed to report error to analytics:', err)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorFallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            errorType={this.state.errorType}
            onReset={this.handleReset}
            errorCount={this.state.errorCount}
          />
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
