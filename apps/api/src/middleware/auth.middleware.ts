/**
 * Authentication Middleware
 * JWT-based authentication for API endpoints
 */
import { Request, Response, NextFunction } from 'express'

export interface AuthUser {
  id: string
  email: string
  role: string
}

/**
 * Verify JWT token and attach user to request
 * In production, implement full JWT verification
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized - No token provided',
    })
  }

  const token = authHeader.substring(7)

  try {
    // In production: Verify JWT token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    // req.user = decoded as AuthUser

    // For now, accept any token for testing
    ;(req as any).user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'USER',
    }

    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized - Invalid token',
    })
  }
}

/**
 * Optional authentication - attaches user if token is present
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      // In production: Verify JWT token
      ;(req as any).user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'USER',
      }
    } catch (error) {
      // Invalid token, continue without user
    }
  }

  next()
}

/**
 * Require specific role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized - No user',
      })
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({
        error: 'Forbidden - Insufficient permissions',
      })
    }

    next()
  }
}
