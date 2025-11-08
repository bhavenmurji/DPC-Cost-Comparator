/**
 * Authentication Middleware
 * JWT-based authentication for API endpoints
 */
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

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
    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthUser
    ;(req as any).user = decoded

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Unauthorized - Token expired',
      })
    } else if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Unauthorized - Invalid token',
      })
    }
    return res.status(401).json({
      error: 'Unauthorized - Authentication failed',
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
      // Verify JWT token if available
      if (process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as AuthUser
        ;(req as any).user = decoded
      }
    } catch (error) {
      // Invalid token, continue without user (optional auth)
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
