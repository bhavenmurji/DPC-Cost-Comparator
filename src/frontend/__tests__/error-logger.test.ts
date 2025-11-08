import { logErrorToService, createContextualError, withErrorHandling } from '@/lib/error-logger';

// Mock fetch
global.fetch = jest.fn();

// Mock environment
const originalEnv = process.env.NODE_ENV;

describe('Error Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterAll(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('logErrorToService', () => {
    it('should send error to backend in production', async () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Production error');
      const config = {
        error,
        level: 'component' as const,
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
      };

      logErrorToService(config);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/errors/log'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('Production error'),
        })
      );
    });

    it('should not send to backend in development by default', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_ENABLE_ERROR_LOGGING;

      const error = new Error('Dev error');
      const config = {
        error,
        level: 'component' as const,
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
      };

      logErrorToService(config);

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should send to backend in development when explicitly enabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_ERROR_LOGGING = 'true';

      const error = new Error('Dev error with logging');
      const config = {
        error,
        level: 'component' as const,
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
      };

      logErrorToService(config);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should sanitize PHI from error messages', async () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Error with SSN 123-45-6789 and email test@example.com');
      const config = {
        error,
        level: 'component' as const,
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
      };

      logErrorToService(config);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.message).toContain('[REDACTED]');
      expect(body.message).not.toContain('123-45-6789');
      expect(body.message).not.toContain('test@example.com');
    });

    it('should include error severity in request', async () => {
      process.env.NODE_ENV = 'production';

      const error = new Error('Test error');
      const config = {
        error,
        level: 'root' as const,
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
      };

      logErrorToService(config);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);

      expect(body.severity).toBe('critical');
    });

    it('should handle backend errors gracefully', async () => {
      process.env.NODE_ENV = 'production';
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const error = new Error('Test error');
      const config = {
        error,
        level: 'component' as const,
        timestamp: new Date().toISOString(),
        userAgent: 'test-agent',
      };

      logErrorToService(config);

      // Wait for async operation
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error logging failed:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('createContextualError', () => {
    it('should create error with context', () => {
      const context = { userId: '123', action: 'submit' };
      const error = createContextualError('Test error', context);

      expect(error.message).toBe('Test error');
      expect((error as any).context).toEqual(context);
    });

    it('should create error without context', () => {
      const error = createContextualError('Test error');

      expect(error.message).toBe('Test error');
      expect((error as any).context).toBeUndefined();
    });
  });

  describe('withErrorHandling', () => {
    it('should wrap async function with error handling', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = withErrorHandling(successFn);

      const result = await wrappedFn();

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalled();
    });

    it('should catch and rethrow errors with context', async () => {
      const errorFn = jest.fn().mockRejectedValue(new Error('Original error'));
      const wrappedFn = withErrorHandling(errorFn, 'Custom error message');

      await expect(wrappedFn()).rejects.toThrow('Custom error message');
    });

    it('should preserve original error in context', async () => {
      const errorFn = jest.fn().mockRejectedValue(new Error('Original error'));
      const wrappedFn = withErrorHandling(errorFn);

      try {
        await wrappedFn();
      } catch (error: any) {
        expect(error.context.originalError).toBe('Original error');
      }
    });

    it('should pass arguments to wrapped function', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const wrappedFn = withErrorHandling(fn);

      await wrappedFn('arg1', 'arg2', 'arg3');

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });
  });
});
