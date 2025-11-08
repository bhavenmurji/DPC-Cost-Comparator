/**
 * Audit Logging Middleware for HIPAA Compliance
 * Logs all access to protected health information
 */
import { Request, Response, NextFunction } from 'express'
import { logger } from '../../../src/backend/utils/logger'

export interface AuditLogEntry {
  timestamp: string
  userId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  statusCode?: number
  metadata?: Record<string, any>
}

/**
 * Audit middleware - logs all requests
 */
export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()

  // Capture response
  const originalSend = res.send
  res.send = function (data): Response {
    res.send = originalSend

    // Log after response is sent
    const duration = Date.now() - startTime
    logAuditEntry({
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id,
      action: req.method,
      resource: req.path,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      statusCode: res.statusCode,
      metadata: {
        duration,
        query: req.query,
        // Don't log sensitive body data
      },
    })

    return originalSend.call(this, data)
  }

  next()
}

/**
 * Sanitize sensitive data before logging
 */
function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
  if (!metadata) return {}

  const sensitiveFields = [
    'password',
    'token',
    'ssn',
    'socialSecurityNumber',
    'dateOfBirth',
    'dob',
    'medicalRecordNumber',
    'mrn',
    'insurancePolicyNumber',
    'policyNumber',
    'chronicConditions',
    'healthConditions',
    'diagnosis',
    'prescription',
    'creditCard',
    'bankAccount',
    'apiKey',
    'secret',
  ]

  const sanitized = { ...metadata }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeMetadata(sanitized[key])
    }
  }

  return sanitized
}

/**
 * Log audit entry
 * HIPAA-compliant: Uses winston logger instead of console.log
 * Sensitive data is sanitized before logging
 */
function logAuditEntry(entry: AuditLogEntry) {
  // Sanitize metadata to prevent PHI leakage
  const sanitizedEntry = {
    ...entry,
    metadata: sanitizeMetadata(entry.metadata),
  }

  // Log to winston (file-based, encrypted, with rotation)
  // SECURITY: Never use console.log for PHI - violates HIPAA
  logger.info('[AUDIT]', sanitizedEntry)

  // TODO: Write to database using Prisma/pg client for permanent audit trail
  // This ensures HIPAA compliance with 6-year retention requirement
  // await prisma.auditLog.create({
  //   data: {
  //     userId: entry.userId,
  //     action: entry.action,
  //     resource: entry.resource,
  //     resourceId: entry.resourceId,
  //     ipAddress: entry.ipAddress,
  //     userAgent: entry.userAgent,
  //     statusCode: entry.statusCode,
  //     metadata: sanitizedEntry.metadata,
  //     timestamp: new Date(entry.timestamp),
  //   },
  // })
}

/**
 * Audit specific sensitive actions
 */
export function auditAction(
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    logAuditEntry({
      timestamp: new Date().toISOString(),
      userId: (req as any).user?.id,
      action,
      resource,
      resourceId,
      ipAddress: req.ip || req.socket.remoteAddress,
      userAgent: req.get('user-agent'),
      metadata,
    })
    next()
  }
}
