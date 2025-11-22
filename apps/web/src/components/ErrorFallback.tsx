import React from 'react'

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  errorType: 'render' | 'network' | 'api' | 'unknown'
  onReset: () => void
  errorCount?: number
}

export default function ErrorFallback({
  error,
  errorInfo,
  errorType,
  onReset,
  errorCount = 1,
}: ErrorFallbackProps) {
  const isDevelopment = !import.meta.env.PROD

  // Get user-friendly error message based on error type
  const getErrorTitle = () => {
    switch (errorType) {
      case 'network':
        return 'Connection Error'
      case 'api':
        return 'Server Error'
      case 'render':
        return 'Something Went Wrong'
      default:
        return 'An Error Occurred'
    }
  }

  // Get user-friendly error description
  const getErrorDescription = () => {
    switch (errorType) {
      case 'network':
        return 'We are having trouble connecting to the server. Please check your internet connection and try again.'
      case 'api':
        return 'Our service encountered an error. Our team has been notified. Please try again in a few moments.'
      case 'render':
        return 'An unexpected error occurred while displaying this page. We have been notified of the issue.'
      default:
        return 'Something unexpected happened. Please try refreshing the page or contact support if the problem persists.'
    }
  }

  // Get emoji based on error type
  const getErrorEmoji = () => {
    switch (errorType) {
      case 'network':
        return '🌐'
      case 'api':
        return '⚠️'
      case 'render':
        return '❌'
      default:
        return '⚠️'
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Error Icon */}
        <div style={styles.iconContainer}>
          <span style={styles.icon}>{getErrorEmoji()}</span>
        </div>

        {/* Error Title */}
        <h1 style={styles.title}>{getErrorTitle()}</h1>

        {/* Error Description */}
        <p style={styles.description}>{getErrorDescription()}</p>

        {/* Error Count Warning */}
        {errorCount && errorCount > 2 && (
          <div style={styles.warningBanner}>
            <span style={styles.warningIcon}>⚡</span>
            <p style={styles.warningText}>
              Multiple errors detected. If this continues, please try refreshing the page.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button onClick={onReset} style={styles.primaryButton}>
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={styles.secondaryButton}
          >
            Go Home
          </button>
        </div>

        {/* Development Error Details */}
        {isDevelopment && error && (
          <div style={styles.devSection}>
            <details style={styles.details}>
              <summary style={styles.summary}>
                Developer Information (Development Only)
              </summary>

              <div style={styles.errorDetails}>
                <h3 style={styles.detailsTitle}>Error Message</h3>
                <pre style={styles.preFormatted}>{error.message}</pre>

                {errorInfo?.componentStack && (
                  <>
                    <h3 style={styles.detailsTitle}>Component Stack</h3>
                    <pre style={styles.preFormatted}>{errorInfo.componentStack}</pre>
                  </>
                )}

                {error.stack && (
                  <>
                    <h3 style={styles.detailsTitle}>Stack Trace</h3>
                    <pre style={styles.preFormatted}>{error.stack}</pre>
                  </>
                )}
              </div>
            </details>
          </div>
        )}

        {/* Production Support Message */}
        {!isDevelopment && (
          <div style={styles.supportMessage}>
            <p style={styles.supportText}>
              Need help? Contact our support team at support@healthpartnershipx.com or call 1-800-HEALTH-X
            </p>
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div style={styles.decoration} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '1rem',
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    padding: '3rem 2rem',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
    zIndex: 10,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: '1.5rem',
  },
  icon: {
    fontSize: '4rem',
    display: 'inline-block',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.5px',
  },
  description: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: '0 0 1.5rem 0',
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fbbf24',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: '1.25rem',
    flexShrink: 0,
  },
  warningText: {
    fontSize: '0.9rem',
    color: '#92400e',
    margin: 0,
    textAlign: 'left',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  primaryButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e5e7eb',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  devSection: {
    marginTop: '2rem',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1.5rem',
  },
  details: {
    cursor: 'pointer',
    textAlign: 'left',
  },
  summary: {
    padding: '0.75rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.875rem',
    color: '#374151',
    userSelect: 'none',
  },
  errorDetails: {
    marginTop: '1rem',
    textAlign: 'left',
  },
  detailsTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  preFormatted: {
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '0.75rem',
    fontSize: '0.8rem',
    lineHeight: '1.4',
    overflow: 'auto',
    maxHeight: '250px',
    color: '#1a1a1a',
    fontFamily: 'monospace',
    margin: '0 0 0.5rem 0',
  },
  supportMessage: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '8px',
  },
  supportText: {
    fontSize: '0.875rem',
    color: '#166534',
    margin: 0,
    lineHeight: '1.5',
  },
  decoration: {
    position: 'absolute',
    top: '-100px',
    right: '-100px',
    width: '300px',
    height: '300px',
    backgroundColor: '#dbeafe',
    borderRadius: '50%',
    opacity: 0.5,
    zIndex: 0,
  },
}
