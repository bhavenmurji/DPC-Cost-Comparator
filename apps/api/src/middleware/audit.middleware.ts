/**
 * Audit Logging Middleware for HIPAA Compliance
 * Logs all access to protected health information
 */
import { Request, Response, NextFunction } from 'express'

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
 * Log audit entry
 * In production, this should write to database and secure log storage
 */
function logAuditEntry(entry: AuditLogEntry) {
  // In production: Write to database
  // await prisma.auditLog.create({ data: entry })

  // For now, log to console with special format
  console.log('[AUDIT]', JSON.stringify(entry))
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
