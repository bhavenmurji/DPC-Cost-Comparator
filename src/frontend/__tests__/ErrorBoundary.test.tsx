import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorBoundary, withErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorFallback, MinimalErrorFallback } from '@/components/ErrorFallback';
import * as errorLogger from '@/lib/error-logger';

// Mock the error logger
jest.mock('@/lib/error-logger', () => ({
  logErrorToService: jest.fn(),
}));

// Suppress console.error for tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

// Component that throws an error
interface ThrowErrorProps {
  shouldThrow?: boolean;
  errorMessage?: string;
}

function ThrowError({ shouldThrow = true, errorMessage = 'Test error' }: ThrowErrorProps) {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should catch errors and display fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });

    it('should not render children when error is caught', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should call error logging service when error is caught', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowError errorMessage="Logging test error" />
        </ErrorBoundary>
      );

      expect(errorLogger.logErrorToService).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Logging test error',
          }),
          level: 'component',
        })
      );
    });

    it('should include error info in logging call', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorLogger.logErrorToService).toHaveBeenCalledWith(
        expect.objectContaining({
          errorInfo: expect.any(Object),
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('Custom Error Handler', () => {
    it('should call custom onError handler when provided', () => {
      const onErrorMock = jest.fn();

      render(
        <ErrorBoundary onError={onErrorMock}>
          <ThrowError errorMessage="Custom handler test" />
        </ErrorBoundary>
      );

      expect(onErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Custom handler test',
        }),
        expect.any(Object)
      );
    });
  });

  describe('Error Reset', () => {
    it('should reset error state when reset button is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error UI should be shown
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();

      // Click the "Try Again" button
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Original content should be shown
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback Component', () => {
    const CustomFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
      <div>
        <h1>Custom Error UI</h1>
        <p>{error.message}</p>
        <button onClick={resetError}>Reset</button>
      </div>
    );

    it('should render custom fallback when provided', () => {
      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError errorMessage="Custom fallback test" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.getByText('Custom fallback test')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Levels', () => {
    it('should handle root level errors', () => {
      render(
        <ErrorBoundary level="root">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorLogger.logErrorToService).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'root',
        })
      );
    });

    it('should handle feature level errors', () => {
      render(
        <ErrorBoundary level="feature">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorLogger.logErrorToService).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'feature',
        })
      );
    });

    it('should handle component level errors', () => {
      render(
        <ErrorBoundary level="component">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorLogger.logErrorToService).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'component',
        })
      );
    });
  });
});

describe('ErrorFallback', () => {
  const mockResetError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Network Errors', () => {
    it('should display network error UI for fetch errors', () => {
      const error = new Error('Failed to fetch data from server');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText('Connection Lost')).toBeInTheDocument();
      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
    });

    it('should display network error UI for connection errors', () => {
      const error = new Error('Network connection timeout');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText('Connection Lost')).toBeInTheDocument();
    });
  });

  describe('Validation Errors', () => {
    it('should display validation error UI for invalid data', () => {
      const error = new Error('Validation failed: Invalid email address');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText('Invalid Data')).toBeInTheDocument();
      expect(screen.getByText(/check your inputs/i)).toBeInTheDocument();
    });

    it('should display validation error UI for required field errors', () => {
      const error = new Error('Required field is missing');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText('Invalid Data')).toBeInTheDocument();
    });
  });

  describe('Generic Errors', () => {
    it('should display generic error UI for unknown errors', () => {
      const error = new Error('Something unexpected happened');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
      expect(screen.getByText(/unexpected error occurred/i)).toBeInTheDocument();
    });
  });

  describe('Reset Functionality', () => {
    it('should call resetError when Try Again is clicked', () => {
      const error = new Error('Test error');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(tryAgainButton);

      expect(mockResetError).toHaveBeenCalledTimes(1);
    });

    it('should reload page when Reload Page is clicked', () => {
      const reloadMock = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      const error = new Error('Test error');
      render(<ErrorFallback error={error} resetError={mockResetError} />);

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      fireEvent.click(reloadButton);

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });
  });
});

describe('MinimalErrorFallback', () => {
  const mockResetError = jest.fn();

  it('should render minimal error UI', () => {
    const error = new Error('Test error');
    render(<MinimalErrorFallback error={error} resetError={mockResetError} />);

    expect(screen.getByText('Unable to load this section')).toBeInTheDocument();
  });

  it('should call resetError when Retry is clicked', () => {
    const error = new Error('Test error');
    render(<MinimalErrorFallback error={error} resetError={mockResetError} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    expect(mockResetError).toHaveBeenCalledTimes(1);
  });
});

describe('withErrorBoundary HOC', () => {
  const TestComponent = ({ name }: { name: string }) => <div>Hello {name}</div>;

  it('should wrap component with error boundary', () => {
    const WrappedComponent = withErrorBoundary(TestComponent);
    render(<WrappedComponent name="World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const ErrorComponent = () => {
      throw new Error('HOC test error');
    };

    const WrappedComponent = withErrorBoundary(ErrorComponent);
    render(<WrappedComponent />);

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
  });

  it('should pass error boundary props to wrapper', () => {
    const onErrorMock = jest.fn();
    const ErrorComponent = () => {
      throw new Error('HOC props test');
    };

    const WrappedComponent = withErrorBoundary(ErrorComponent, {
      level: 'component',
      onError: onErrorMock,
    });

    render(<WrappedComponent />);

    expect(onErrorMock).toHaveBeenCalled();
    expect(errorLogger.logErrorToService).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'component',
      })
    );
  });
});
