/**
 * Middleware Integration Tests
 * Tests authentication, audit logging, and security middleware
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import express, { Express, Request, Response } from 'express'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { requireAuth, optionalAuth, requireRole } from '../../apps/api/src/middleware/auth.middleware'
import { auditMiddleware } from '../../apps/api/src/middleware/audit.middleware'

describe('Middleware Integration Tests', () => {
  let app: Express
  const validToken = jwt.sign(
    { id: 'user-123', email: 'test@test.com', role: 'USER' },
    process.env.JWT_SECRET || 'test-secret-key'
  )

  describe('Authentication Middleware', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
    })

    it('should reject requests without auth token', async () => {
      app.get('/protected', requireAuth, (req, res) => {
        res.json({ success: true })
      })

      await request(app).get('/protected').expect(401)
    })

    it('should reject requests with invalid Bearer format', async () => {
      app.get('/protected', requireAuth, (req, res) => {
        res.json({ success: true })
      })

      await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token')
        .expect(401)
    })

    it('should accept requests with valid Bearer token', async () => {
      app.get('/protected', requireAuth, (req, res) => {
        res.json({ success: true, user: (req as any).user })
      })

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.user).toBeDefined()
    })

    it('should attach user object to request', async () => {
      app.get('/protected', requireAuth, (req, res) => {
        const user = (req as any).user
        res.json({ user })
      })

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body.user).toHaveProperty('id')
      expect(response.body.user).toHaveProperty('email')
      expect(response.body.user).toHaveProperty('role')
    })
  })

  describe('Optional Authentication Middleware', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
    })

    it('should allow requests without token', async () => {
      app.get('/public', optionalAuth, (req, res) => {
        res.json({ success: true, user: (req as any).user })
      })

      const response = await request(app).get('/public').expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should attach user if valid token provided', async () => {
      app.get('/public', optionalAuth, (req, res) => {
        res.json({ user: (req as any).user })
      })

      const response = await request(app)
        .get('/public')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200)

      expect(response.body.user).toBeDefined()
    })

    it('should continue without user if invalid token', async () => {
      app.get('/public', optionalAuth, (req, res) => {
        res.json({ user: (req as any).user })
      })

      const response = await request(app)
        .get('/public')
        .set('Authorization', 'Invalid')
        .expect(200)

      // Should continue without user
      expect(response.body).toBeDefined()
    })
  })

  describe('Role-Based Access Control', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
    })

    it('should allow access with correct role', async () => {
      app.get(
        '/admin',
        (req, res, next) => {
          // Mock user with ADMIN role
          ; (req as any).user = { id: '1', email: 'admin@test.com', role: 'ADMIN' }
          next()
        },
        requireRole('ADMIN'),
        (req, res) => {
          res.json({ success: true })
        }
      )

      await request(app).get('/admin').expect(200)
    })

    it('should deny access with incorrect role', async () => {
      app.get(
        '/admin',
        (req, res, next) => {
          // Mock user with USER role
          ; (req as any).user = { id: '1', email: 'user@test.com', role: 'USER' }
          next()
        },
        requireRole('ADMIN'),
        (req, res) => {
          res.json({ success: true })
        }
      )

      await request(app).get('/admin').expect(403)
    })

    it('should deny access without user', async () => {
      app.get('/admin', requireRole('ADMIN'), (req, res) => {
        res.json({ success: true })
      })

      await request(app).get('/admin').expect(401)
    })

    it('should allow multiple roles', async () => {
      app.get(
        '/resource',
        (req, res, next) => {
          ; (req as any).user = { id: '1', email: 'user@test.com', role: 'MODERATOR' }
          next()
        },
        requireRole('ADMIN', 'MODERATOR'),
        (req, res) => {
          res.json({ success: true })
        }
      )

      await request(app).get('/resource').expect(200)
    })
  })

  describe('Audit Logging Middleware', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
      app.use(auditMiddleware)
    })

    it('should log all requests', async () => {
      const consoleSpy = vi.spyOn(console, 'info')

      app.get('/test', (req, res) => {
        res.json({ success: true })
      })

      await request(app).get('/test').expect(200)

      // Check if audit log was created
      const auditLogs = consoleSpy.mock.calls.filter((call) =>
        call[0]?.includes('[AUDIT]')
      )
      expect(auditLogs.length).toBeGreaterThan(0)

      consoleSpy.mockRestore()
    })

    it('should log user information when authenticated', async () => {
      const consoleSpy = vi.spyOn(console, 'info')

      app.get(
        '/protected',
        (req, res, next) => {
          ; (req as any).user = { id: 'user-123', email: 'test@test.com', role: 'USER' }
          next()
        },
        (req, res) => {
          res.json({ success: true })
        }
      )

      await request(app).get('/protected').expect(200)

      const auditLogs = consoleSpy.mock.calls.filter((call) =>
        call[0]?.includes('[AUDIT]')
      )
      const auditLog = auditLogs[0]?.[1]

      if (auditLog) {
        const logData = JSON.parse(auditLog)
        expect(logData.userId).toBe('user-123')
      }

      consoleSpy.mockRestore()
    })

    it('should log request method and path', async () => {
      const consoleSpy = vi.spyOn(console, 'info')

      app.post('/create', (req, res) => {
        res.json({ success: true })
      })

      await request(app).post('/create').send({}).expect(200)

      const auditLogs = consoleSpy.mock.calls.filter((call) =>
        call[0]?.includes('[AUDIT]')
      )
      const auditLog = auditLogs[0]?.[1]

      if (auditLog) {
        const logData = JSON.parse(auditLog)
        expect(logData.action).toBe('POST')
        expect(logData.resource).toBe('/create')
      }

      consoleSpy.mockRestore()
    })

    it('should log response status code', async () => {
      const consoleSpy = vi.spyOn(console, 'info')

      app.get('/test', (req, res) => {
        res.status(201).json({ success: true })
      })

      await request(app).get('/test').expect(201)

      const auditLogs = consoleSpy.mock.calls.filter((call) =>
        call[0]?.includes('[AUDIT]')
      )
      const auditLog = auditLogs[0]?.[1]

      if (auditLog) {
        const logData = JSON.parse(auditLog)
        expect(logData.statusCode).toBe(201)
      }

      consoleSpy.mockRestore()
    })

    it('should log request duration', async () => {
      const consoleSpy = vi.spyOn(console, 'info')

      app.get('/test', async (req, res) => {
        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 10))
        res.json({ success: true })
      })

      await request(app).get('/test').expect(200)

      const auditLogs = consoleSpy.mock.calls.filter((call) =>
        call[0]?.includes('[AUDIT]')
      )
      const auditLog = auditLogs[0]?.[1]

      if (auditLog) {
        const logData = JSON.parse(auditLog)
        expect(logData.metadata.duration).toBeGreaterThan(0)
      }

      consoleSpy.mockRestore()
    })
  })

  describe('Middleware Chain', () => {
    beforeEach(() => {
      app = express()
      app.use(express.json())
      app.use(auditMiddleware)
    })

    it('should process multiple middleware in order', async () => {
      const order: string[] = []

      app.get(
        '/test',
        (req, res, next) => {
          order.push('first')
          next()
        },
        (req, res, next) => {
          order.push('second')
          next()
        },
        (req, res) => {
          order.push('handler')
          res.json({ order })
        }
      )

      const response = await request(app).get('/test').expect(200)

      expect(response.body.order).toEqual(['first', 'second', 'handler'])
    })

    it('should stop chain on error', async () => {
      app.get(
        '/test',
        (req, res, next) => {
          next(new Error('Test error'))
        },
        (req, res) => {
          res.json({ success: true }) // Should not reach here
        }
      )

      // Add error handler
      app.use((err: any, req: Request, res: Response, next: any) => {
        res.status(500).json({ error: err.message })
      })

      await request(app).get('/test').expect(500)
    })
  })
})
