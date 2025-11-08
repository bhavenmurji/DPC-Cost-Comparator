# API Rate Limiting Configuration

## Overview

This document describes the rate limiting implementation for the DPC Cost Comparator API. Rate limiting protects the application from:

- **Denial of Service (DoS) attacks**
- **Brute force authentication attempts**
- **API abuse and excessive usage**
- **Resource exhaustion**

## Implementation

Rate limiting is implemented using the `express-rate-limit` package with tiered protection levels based on endpoint sensitivity.

### Middleware Location

```
/src/backend/middleware/rateLimiter.ts
```

## Rate Limit Tiers

### 1. Authentication Limiter (`authLimiter`)

**Purpose:** Protect login and authentication endpoints from brute force attacks

**Configuration:**
- **Window:** 15 minutes
- **Max Requests:** 5 attempts per IP
- **Skip Successful:** Yes (only failed attempts count)
- **Key:** IP address

**Applied To:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`

**Response on Limit:**
```json
{
  "error": "Too many authentication attempts",
  "message": "Account temporarily locked due to too many failed login attempts. Please try again after 15 minutes.",
  "retryAfter": "900"
}
```

### 2. Search Limiter (`searchLimiter`)

**Purpose:** Protect search and computation-heavy operations

**Configuration:**
- **Window:** 1 minute
- **Max Requests:** 30 per IP
- **Key:** IP address

**Applied To:**
- `GET /api/v1/dpc-providers/search`
- `POST /api/comparison/calculate`
- `POST /api/comparison/providers`

**Response on Limit:**
```json
{
  "error": "Too many search requests",
  "message": "Too many search requests, please slow down",
  "retryAfter": "60"
}
```

### 3. Sensitive Operations Limiter (`sensitiveOpLimiter`)

**Purpose:** Protect sensitive account operations

**Configuration:**
- **Window:** 1 hour
- **Max Requests:** 10 per user
- **Key:** User ID (falls back to IP if not authenticated)

**Applied To:**
- `POST /api/v1/auth/verify-email`
- Email changes
- Profile updates
- Password changes

**Response on Limit:**
```json
{
  "error": "Too many sensitive operations",
  "message": "Too many sensitive operations attempted. Please try again later.",
  "retryAfter": "3600"
}
```

### 4. Strict Limiter (`strictLimiter`)

**Purpose:** Highly sensitive operations (not currently applied, available for future use)

**Configuration:**
- **Window:** 24 hours
- **Max Requests:** 3 per user
- **Key:** User ID

**Use Cases:**
- Account deletion
- Data exports
- Security settings changes

### 5. Public Limiter (`publicLimiter`)

**Purpose:** General protection for public endpoints

**Configuration:**
- **Window:** 15 minutes
- **Max Requests:** 300 per IP
- **Key:** IP address

**Applied To:**
- `GET /api/v1/dpc-providers`
- `GET /api/v1/dpc-providers/:id`
- `GET /api/v1/dpc-providers/:id/reviews`
- `GET /api/comparison/providers/:id`

**Response on Limit:**
```json
{
  "error": "Too many requests",
  "message": "Please slow down your requests",
  "retryAfter": "900"
}
```

### 6. General API Limiter (`apiLimiter`)

**Purpose:** Default protection for all API endpoints

**Configuration:**
- **Window:** 15 minutes
- **Max Requests:** 100 per IP
- **Key:** IP address
- **Skips:** Health check endpoints (`/health`, `/api/health`)

**Usage:**
Apply to the main Express app to protect all routes by default.

## Response Headers

All rate-limited responses include standardized headers:

```
RateLimit-Limit: 100
RateLimit-Remaining: 42
RateLimit-Reset: 1677649200
Retry-After: 900
```

## Production Configuration

### Redis Store (Recommended for Production)

For distributed systems with multiple server instances, use Redis for shared rate limit state:

```bash
npm install rate-limit-redis redis
```

**Configuration Example:**

```typescript
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

await redisClient.connect();

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rate-limit:',
  }),
  // ... other options
});
```

### Environment Variables

Create a `.env` file with:

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
SEARCH_RATE_LIMIT_MAX=30

# Redis (for production)
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=rate-limit:
```

## IP Whitelisting

To whitelist internal services or monitoring systems:

```typescript
import { isWhitelisted } from '../middleware/rateLimiter';

// In rateLimiter.ts
const WHITELISTED_IPS = [
  '127.0.0.1',     // localhost
  '::1',           // localhost IPv6
  '10.0.0.0/8',    // internal network (requires additional parsing)
];

// Use in skip function
skip: (req) => isWhitelisted(req.ip || '')
```

## Custom Rate Limiters

Create custom rate limiters for specific use cases:

```typescript
import { createCustomLimiter } from '../middleware/rateLimiter';

// Example: API key endpoints - 1000 requests per hour
const apiKeyLimiter = createCustomLimiter(
  60 * 60 * 1000,  // 1 hour
  1000,            // max requests
  'API key rate limit exceeded',
  false            // use IP-based key
);

router.get('/api/data', apiKeyLimiter, handler);
```

## Monitoring and Logging

Rate limit violations are logged:

```typescript
// In rateLimiter.ts
const rateLimitHandler = (req: Request, res: Response) => {
  console.warn(`[RATE LIMIT] ${req.ip} exceeded limit on ${req.path}`);

  // Add to monitoring system
  // metrics.increment('rate_limit.exceeded', { path: req.path });
};
```

### Recommended Monitoring

1. Track rate limit violations by endpoint
2. Alert on unusual spikes in violations
3. Monitor IPs with repeated violations
4. Track legitimate users hitting limits

## Testing

See `/tests/rate-limiting.test.ts` for test examples.

## Security Considerations

1. **Proxy Configuration:** Ensure `trust proxy` is configured correctly in Express to get real client IPs
2. **DDoS Protection:** Rate limiting alone is not sufficient for DDoS protection - use CDN/WAF
3. **Adaptive Limits:** Consider implementing dynamic rate limits based on user behavior
4. **Bypass Prevention:** Never expose rate limit reset times in a way that helps attackers

## Future Enhancements

1. **Dynamic Rate Limiting:** Adjust limits based on system load
2. **User-Based Tiers:** Different limits for free vs. paid users
3. **Geographic Limits:** Different limits by region
4. **Token Bucket Algorithm:** More sophisticated rate limiting
5. **Circuit Breaker:** Automatically block IPs with repeated violations

## Troubleshooting

### Issue: Legitimate Users Hitting Limits

**Solution:**
- Review limit configurations
- Implement user authentication for higher limits
- Add IP whitelisting for known good actors

### Issue: Rate Limiting Not Working in Cluster Mode

**Solution:**
- Implement Redis store for shared state
- Ensure all instances connect to same Redis

### Issue: False Positives from Corporate Networks

**Solution:**
- Use user-based keys when authenticated
- Increase limits for public endpoints
- Consider user agent analysis

## References

- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)
- [OWASP Rate Limiting Guide](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/rate-limiter/)
