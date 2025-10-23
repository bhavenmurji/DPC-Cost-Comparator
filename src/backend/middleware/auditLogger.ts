import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { logger } from '../utils/logger';

/**
 * HIPAA-compliant audit logging middleware
 * Logs all access to PHI (Protected Health Information)
 */
export const auditLogger = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Skip health checks and public routes
  if (req.path === '/api/health' || req.path.startsWith('/api/v1/auth')) {
    return next();
  }

  const auditLog = {
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    email: req.user?.email || 'anonymous',
    action: req.method,
    resource: req.path,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    requestBody: sanitizeBody(req.body),
  };

  // Log to dedicated audit log
  logger.info('AUDIT', auditLog);

  // In production, this would also write to a separate audit database table
  // that is append-only and has stricter retention policies (6+ years for HIPAA)

  next();
};

/**
 * Remove sensitive data from request body before logging
 */
function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'ssn', 'creditCard'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
