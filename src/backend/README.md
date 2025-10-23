# DPC Cost Comparator - Backend API

## Overview

HIPAA-compliant REST API for comparing Direct Primary Care (DPC) costs with traditional insurance plans.

## Architecture

### Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (access + refresh tokens)
- **Security**: Helmet, bcrypt, CORS, rate limiting
- **Logging**: Winston with HIPAA-compliant audit trails

### Directory Structure
```
src/backend/
├── config/
│   └── environment.ts       # Environment configuration
├── database/
│   ├── connection.ts        # PostgreSQL connection pool
│   └── schema.sql          # Complete database schema
├── middleware/
│   ├── auth.ts             # JWT authentication
│   ├── errorHandler.ts     # Global error handling
│   ├── requestLogger.ts    # Request logging
│   └── auditLogger.ts      # HIPAA audit logging
├── models/
│   ├── User.model.ts       # User data access layer
│   ├── InsurancePlan.model.ts
│   └── DPCProvider.model.ts
├── routes/
│   ├── auth.routes.ts      # Authentication endpoints
│   ├── user.routes.ts      # User management
│   ├── insurance.routes.ts # Insurance plan queries
│   ├── dpcProvider.routes.ts # DPC provider queries
│   ├── costComparison.routes.ts # Cost calculations
│   └── health.routes.ts    # Health checks
├── services/
│   └── cost-calculator.ts  # Cost comparison engine
├── utils/
│   ├── logger.ts           # Winston logger setup
│   └── errors.ts           # Custom error classes
└── server.ts               # Express app entry point
```

## Database Schema

### Core Tables
- **users** - User accounts with HIPAA compliance fields
- **user_sessions** - JWT session management
- **insurance_carriers** - Insurance company information
- **insurance_plans** - Plan details with costs
- **dpc_providers** - DPC practice information
- **cost_comparison_scenarios** - Saved user comparisons
- **cost_calculations** - Calculated cost breakdowns
- **audit_logs** - HIPAA-compliant access logs (6-year retention)

### Key Features
- UUID primary keys for security
- Soft deletes for user data
- Full-text search indexes
- Geospatial queries for provider location
- Automatic timestamp triggers
- Encrypted PHI fields

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and get tokens
- `POST /logout` - Invalidate session
- `POST /refresh` - Refresh access token
- `POST /verify-email` - Verify email with token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Complete password reset

### User Management (`/api/v1/users`)
- `GET /me` - Get current user profile
- `PATCH /me` - Update profile
- `DELETE /me` - Soft delete account

### Insurance Plans (`/api/v1/insurance`)
- `GET /carriers` - List insurance carriers
- `GET /plans` - List plans with filters
- `GET /plans/:id` - Get plan details
- `GET /search` - Search plans by name/carrier

### DPC Providers (`/api/v1/dpc-providers`)
- `GET /` - List providers with filters
- `GET /:id` - Get provider details
- `GET /search` - Search by location/name
- `GET /:id/reviews` - Get provider reviews

### Cost Comparison (`/api/v1/cost-comparison`)
- `POST /calculate` - Calculate costs (public)
- `GET /scenarios` - Get saved scenarios (auth)
- `POST /scenarios` - Save scenario (auth)
- `GET /scenarios/:id` - Get scenario details (auth)
- `PATCH /scenarios/:id` - Update scenario (auth)
- `DELETE /scenarios/:id` - Delete scenario (auth)

### Health Checks (`/api/health`)
- `GET /` - Basic health check
- `GET /ready` - Readiness probe
- `GET /live` - Liveness probe

## Environment Setup

### Prerequisites
```bash
# Install PostgreSQL 14+
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb dpc_comparator
```

### Configuration
1. Copy `.env.example` to `.env`
2. Update required values:
   ```bash
   # Generate secure keys
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For JWT_REFRESH_SECRET
   openssl rand -base64 32  # For ENCRYPTION_KEY
   ```

3. Configure database connection:
   ```env
   DATABASE_HOST=localhost
   DATABASE_NAME=dpc_comparator
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   ```

### Database Migration
```bash
# Run schema migration
npm run db:migrate

# Or manually
psql -U postgres -d dpc_comparator -f src/backend/database/schema.sql

# Reset database (drops and recreates)
npm run db:reset
```

## Running the Server

### Development
```bash
# Install dependencies
npm install

# Run with hot reload
npm run dev

# Server starts on http://localhost:3000
```

### Production
```bash
# Build TypeScript
npm run build

# Run compiled code
npm start
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Security Features

### HIPAA Compliance
- ✅ Audit logging of all PHI access
- ✅ Data encryption at rest (PostgreSQL pgcrypto)
- ✅ Encrypted sessions and tokens
- ✅ 6-year audit log retention
- ✅ Secure password hashing (bcrypt)
- ✅ Account lockout after failed attempts
- ✅ PHI access tracking

### Security Middleware
- **Helmet**: Sets security HTTP headers
- **CORS**: Configurable origin restrictions
- **Rate Limiting**: 100 requests per 15min per IP
- **Input Validation**: Schema validation with Zod
- **SQL Injection**: Parameterized queries
- **XSS Protection**: Content Security Policy

### Authentication Flow
1. User registers → Password hashed with bcrypt (12 rounds)
2. Login → Returns JWT access token (15min) + refresh token (7d)
3. Access token expires → Use refresh token to get new access token
4. Logout → Revokes session in database
5. Failed attempts → Account locks after 5 failures (30min)

## Cost Calculation Engine

### Service: `CostCalculatorService`

Calculates three scenarios:
1. **Insurance Only** - Traditional insurance costs
2. **DPC Only** - Direct Primary Care without insurance
3. **Insurance + DPC** - Combined approach

### Input: Health Profile
```typescript
{
  age: number,
  hasChronicConditions: boolean,
  chronicConditions?: string[],
  estimatedAnnualVisits: number,
  estimatedSpecialistVisits: number,
  estimatedPrescriptions: number,
  estimatedLabWork: number
}
```

### Output: Cost Breakdown
```typescript
{
  insuranceOnly: {
    totalAnnualCost: number,
    breakdown: {
      premiums: number,
      deductible: number,
      copays: number,
      coinsurance: number,
      prescriptions: number,
      labWork: number
    }
  },
  dpcOnly: { ... },
  insurancePlusDpc: { ... },
  bestOption: 'insurance_only' | 'dpc_only' | 'insurance_plus_dpc',
  potentialSavings: number,
  savingsPercentage: number
}
```

## Error Handling

### Custom Error Classes
- `AppError` - Base operational error
- `ValidationError` - 400 Bad Request
- `NotFoundError` - 404 Not Found
- `UnauthorizedError` - 401 Unauthorized
- `ForbiddenError` - 403 Forbidden
- `ConflictError` - 409 Conflict
- `DatabaseError` - 500 Internal Server Error

### Response Format
```json
{
  "success": false,
  "error": "User-friendly message",
  "errorCode": "VALIDATION_ERROR",
  "stack": "..." // Only in development
}
```

## Logging

### Winston Logger
- **Console**: Development with colors
- **File**: Combined logs (5MB rotation, 5 files)
- **Error File**: Error-only logs
- **Audit**: HIPAA-compliant audit trail

### Log Levels
- `error` - Application errors
- `warn` - Client errors (4xx)
- `info` - Request/response, business events
- `debug` - Database queries, detailed flow

## Performance

### Database
- Connection pooling (max 20 connections)
- Prepared statements (SQL injection protection)
- Indexes on frequently queried fields
- Full-text search for providers

### Caching (Future)
- Redis for session storage
- Query result caching
- Rate limit counters

## Deployment

### Docker (Recommended)
```dockerfile
# Coming soon - Dockerfile
```

### Environment Variables Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate secure `JWT_SECRET` (32+ chars)
- [ ] Generate secure `JWT_REFRESH_SECRET` (32+ chars)
- [ ] Generate secure `ENCRYPTION_KEY` (32+ chars)
- [ ] Configure `DATABASE_*` connection
- [ ] Set `CORS_ALLOWED_ORIGINS` to frontend URLs
- [ ] Enable `DATABASE_SSL=true` for production
- [ ] Configure email provider (SendGrid/SMTP)
- [ ] Set `SENTRY_DSN` for error tracking

### Health Checks
- **Liveness**: `GET /api/health/live` - Returns 200 if server running
- **Readiness**: `GET /api/health/ready` - Returns 200 if DB connected

## Next Steps

### Controllers (To be implemented by Tester agent)
- [ ] Auth controller with validation
- [ ] User controller with authorization
- [ ] Insurance controller with filtering
- [ ] DPC Provider controller with geospatial queries
- [ ] Cost Comparison controller with calculator integration

### Testing (To be implemented by Tester agent)
- [ ] Unit tests for models
- [ ] Integration tests for routes
- [ ] Authentication flow tests
- [ ] Cost calculation algorithm tests
- [ ] Database migration tests

### Additional Features
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] OAuth integration (Google, Apple)
- [ ] WebSocket for real-time updates
- [ ] File upload for documents
- [ ] Admin panel endpoints

## API Documentation

Swagger/OpenAPI documentation will be available at:
- Development: `http://localhost:3000/api-docs`
- Production: `https://api.dpc-comparator.com/api-docs`

## Support

For backend issues or questions:
1. Check logs in `/logs` directory
2. Verify database connection: `npm run db:migrate`
3. Check environment variables: `.env`
4. Review audit logs for HIPAA compliance

## License

Proprietary - All rights reserved
