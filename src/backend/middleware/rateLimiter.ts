import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * Rate Limiting Middleware Configuration
 *
 * Implements tiered rate limiting to protect against DoS attacks,
 * brute force attempts, and API abuse.
 */

// Custom key generator for user-based rate limiting
const userKeyGenerator = (req: Request): string => {
  // Use user ID if authenticated, otherwise fall back to IP
  const user = (req as any).user;
  return user?.id || req.ip || 'unknown';
};

// IP-based key generator
const ipKeyGenerator = (req: Request): string => {
  return req.ip || 'unknown';
};

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: Request, res: Response) => {
  console.warn(`[RATE LIMIT] ${req.ip} exceeded limit on ${req.path}`);
  res.status(429).json({
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: res.getHeader('Retry-After'),
  });
};

// Skip successful requests handler (for auth endpoints)
const skipSuccessfulRequests = (req: Request, res: Response): boolean => {
  return res.statusCode < 400;
};

/**
 * General API Rate Limiter
 * Applies to all API endpoints by default
 * Limit: 100 requests per 15 minutes per IP
 */
export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: ipKeyGenerator,
  handler: rateLimitHandler,
  skip: (req: Request) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Authentication Rate Limiter (Stricter)
 * Protects login and registration endpoints from brute force attacks
 * Limit: 5 attempts per 15 minutes per IP
 * Only counts failed attempts (successful logins don't count)
 */
export const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 failed attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: (req: Request, res: Response) => {
    console.error(`[AUTH RATE LIMIT] ${req.ip} exceeded login attempts on ${req.path}`);
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Account temporarily locked due to too many failed login attempts. Please try again after 15 minutes.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

/**
 * Search Rate Limiter
 * Protects search and query-heavy endpoints
 * Limit: 30 requests per minute per IP
 */
export const searchLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: {
    error: 'Too many search requests',
    message: 'Too many search requests, please slow down',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
  handler: rateLimitHandler,
});

/**
 * Sensitive Operations Rate Limiter
 * For operations like password reset, email changes, profile updates
 * Limit: 10 requests per hour per user
 */
export const sensitiveOpLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 requests per hour
  message: {
    error: 'Too many sensitive operations',
    message: 'Too many sensitive operations attempted. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  handler: rateLimitHandler,
  skip: (req: Request) => {
    // Skip if user is not authenticated (they shouldn't reach this anyway)
    return !(req as any).user;
  },
});

/**
 * Strict Rate Limiter for Critical Operations
 * For highly sensitive operations like account deletion
 * Limit: 3 requests per day per user
 */
export const strictLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each user to 3 requests per day
  message: {
    error: 'Daily limit exceeded',
    message: 'You have exceeded the daily limit for this operation',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userKeyGenerator,
  handler: rateLimitHandler,
});

/**
 * Public Endpoint Rate Limiter (More Lenient)
 * For public-facing endpoints like documentation, info pages
 * Limit: 300 requests per 15 minutes per IP
 */
export const publicLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // more lenient for public endpoints
  message: {
    error: 'Too many requests',
    message: 'Please slow down your requests',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipKeyGenerator,
});

/**
 * Redis Store Configuration (For Production/Distributed Systems)
 *
 * To enable Redis-backed rate limiting for multiple server instances:
 *
 * 1. Install Redis store:
 *    npm install rate-limit-redis redis
 *
 * 2. Import and configure:
 *    import RedisStore from 'rate-limit-redis';
 *    import { createClient } from 'redis';
 *
 * 3. Create Redis client:
 *    const redisClient = createClient({
 *      url: process.env.REDIS_URL || 'redis://localhost:6379'
 *    });
 *
 * 4. Add store to rate limiters:
 *    store: new RedisStore({
 *      client: redisClient,
 *      prefix: 'rate-limit:',
 *    })
 */

/**
 * Whitelist Configuration
 *
 * To whitelist specific IPs (e.g., internal services, monitoring):
 */
const WHITELISTED_IPS = [
  // Add whitelisted IPs here
  // '127.0.0.1',
  // '::1',
];

export const isWhitelisted = (ip: string): boolean => {
  return WHITELISTED_IPS.includes(ip);
};

/**
 * Custom Rate Limiter Factory
 * Create custom rate limiters with specific configurations
 */
export const createCustomLimiter = (
  windowMs: number,
  max: number,
  message: string,
  useUserKey: boolean = false
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Rate limit exceeded',
      message,
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: useUserKey ? userKeyGenerator : ipKeyGenerator,
    handler: rateLimitHandler,
  });
};

export default {
  apiLimiter,
  authLimiter,
  searchLimiter,
  sensitiveOpLimiter,
  strictLimiter,
  publicLimiter,
  createCustomLimiter,
  isWhitelisted,
};
