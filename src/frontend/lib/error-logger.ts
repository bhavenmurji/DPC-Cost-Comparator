import React from 'react';

/**
 * Error logging configuration
 */
interface ErrorLogConfig {
  error: Error;
  errorInfo?: React.ErrorInfo;
  level?: 'root' | 'feature' | 'component';
  timestamp: string;
  userAgent: string;
  context?: Record<string, any>;
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Determine error severity based on level and error type
 */
function getErrorSeverity(level?: string, error?: Error): ErrorSeverity {
  // Root level errors are critical
  if (level === 'root') {
    return ErrorSeverity.CRITICAL;
  }

  // Network errors at feature level are high priority
  if (level === 'feature' && error?.message.toLowerCase().includes('network')) {
    return ErrorSeverity.HIGH;
  }

  // Validation errors are medium priority
  if (error?.message.toLowerCase().includes('validation')) {
    return ErrorSeverity.MEDIUM;
  }

  // Component level errors are lower priority
  if (level === 'component') {
    return ErrorSeverity.LOW;
  }

  return ErrorSeverity.MEDIUM;
}

/**
 * Sanitize error data to remove any potentially sensitive information
 */
function sanitizeErrorData(config: ErrorLogConfig): ErrorLogConfig {
  const sanitized = { ...config };

  // Remove potential PHI (Protected Health Information) from error messages
  const phiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
  ];

  let sanitizedMessage = sanitized.error.message;
  phiPatterns.forEach((pattern) => {
    sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
  });

  sanitized.error = new Error(sanitizedMessage);
  sanitized.error.stack = config.error.stack;

  return sanitized;
}

/**
 * Log error to backend service
 */
async function sendErrorToBackend(config: ErrorLogConfig): Promise<void> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const response = await fetch(`${API_URL}/api/errors/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: config.error.message,
        stack: config.error.stack,
        componentStack: config.errorInfo?.componentStack,
        level: config.level,
        severity: getErrorSeverity(config.level, config.error),
        timestamp: config.timestamp,
        userAgent: config.userAgent,
        context: config.context,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to send error to backend:', response.statusText);
    }
  } catch (error) {
    // Silently fail if error logging fails to prevent infinite error loops
    console.warn('Error logging failed:', error);
  }
}

/**
 * Log error to console in development
 */
function logToConsole(config: ErrorLogConfig): void {
  const severity = getErrorSeverity(config.level, config.error);

  console.group(`🔴 Error Boundary [${config.level}] - ${severity.toUpperCase()}`);
  console.error('Error:', config.error);
  console.error('Error Info:', config.errorInfo);
  console.error('Timestamp:', config.timestamp);
  console.error('User Agent:', config.userAgent);
  if (config.context) {
    console.error('Context:', config.context);
  }
  console.groupEnd();
}

/**
 * Main error logging function
 *
 * In development: Logs to console with detailed information
 * In production: Sends sanitized error data to backend service
 */
export function logErrorToService(config: ErrorLogConfig): void {
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    logToConsole(config);
  }

  // Sanitize data before sending to backend
  const sanitizedConfig = sanitizeErrorData(config);

  // Send to backend in production (and optionally in development)
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_ERROR_LOGGING === 'true') {
    sendErrorToBackend(sanitizedConfig);
  }
}

/**
 * Create an error with additional context
 */
export function createContextualError(
  message: string,
  context?: Record<string, any>
): Error {
  const error = new Error(message);
  (error as any).context = context;
  return error;
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorMessage?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        throw createContextualError(
          errorMessage || error.message,
          { originalError: error.message }
        );
      }
      throw error;
    }
  }) as T;
}
