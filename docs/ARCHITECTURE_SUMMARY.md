# DPC Cost Comparator - Architecture Summary

**Quick Reference Guide**  
**Last Updated**: October 30, 2025  
**Status**: Week 1 Complete, Ready for Week 2

---

## Quick Snapshot

| Metric | Value | Status |
|--------|-------|--------|
| **Deployment Readiness** | 60% | 🟡 In Progress |
| **Code Coverage** | ~70% | 🟡 Good |
| **Build Status** | FAILING | 🔴 Critical |
| **Unit Tests** | PASSING | ✅ Good |
| **Core Logic** | WORKING | ✅ Excellent |
| **Frontend Integration** | PARTIAL | 🟡 Incomplete |
| **Provider Matching** | STUBBED | ❌ Not Done |
| **Scenario Persistence** | STUBBED | ❌ Not Done |

---

## The Main Problem: Dual Architecture

The project has TWO parallel structures causing confusion:

### Primary Structure: `src/` (IN USE)
```
Backend:  Express + TypeScript + PostgreSQL (raw SQL)
Frontend: Next.js 14 + Radix UI + Tailwind
```
Status: Working, used for Week 1 demo

### Secondary Structure: `apps/` (NOT USED)
```
Backend:  Express + TypeScript + PostgreSQL (Prisma ORM)
Frontend: Vite + React 18
```
Status: Idle, causing build failures

**Week 2 Action**: Delete `apps/` folder, consolidate to `src/` only

---

## Critical Issues to Fix (Week 2)

### 1. Build Pipeline Broken 🔴
**Problem**: `npm run build` fails  
**Cause**: Missing `tsconfig.node.json` in `apps/web`  
**Fix**: Remove `apps/` folder (1 hour)

### 2. Dual Architecture 🔴
**Problem**: Two implementations competing  
**Impact**: Confusion, duplicate code, deployment issues  
**Fix**: Delete `apps/`, update monorepo config (4-6 hours)

### 3. Provider Matching Missing 🟠
**Problem**: Shows `providers: [], // TODO`  
**Impact**: Main feature incomplete  
**Fix**: Implement service (8-10 hours)

### 4. Frontend Not Connected 🟠
**Problem**: Forms don't submit to backend  
**Impact**: Only raw API works, UI flows broken  
**Fix**: Create API client, wire forms (6-8 hours)

### 5. Scenario Persistence Stubbed 🟠
**Problem**: All 5 routes return 501 Not Implemented  
**Impact**: Users can't save comparisons  
**Fix**: Implement CRUD endpoints (6-8 hours)

---

## What's Working Well ✅

1. **Cost Calculator Service** (src/backend/services/cost-calculator.ts)
   - Handles 3 scenarios: insurance only, DPC only, DPC+insurance
   - Accurate calculations with deductibles, copays, coinsurance
   - Automatic best option detection
   - Week 1 demo: $1,675 annual savings calculated correctly

2. **Unit Tests** (tests/unit/costComparison.test.ts)
   - 20+ test cases
   - Excellent coverage: age, conditions, visits, prescriptions, edge cases
   - All tests passing

3. **Database Schema** (src/backend/database/schema.sql)
   - 14KB, complete HIPAA-compliant schema
   - 15+ indexes for performance
   - Full-text search capability
   - Audit logging for compliance

4. **API Endpoints**
   - `/api/health` - Health check ✅
   - `/api/compare/calculate` - Cost calculation ✅
   - `/api/v1/cost-comparison/calculate` - Same with v1 routing ✅

5. **HIPAA Compliance Tests** (tests/security/hipaa-compliance.test.ts)
   - Data encryption ✅
   - Audit logging ✅
   - Access control ✅
   - Data minimization ✅
   - SQL injection/XSS prevention ✅
   - 6-year retention policy ✅

6. **Frontend Components**
   - Comparison dashboard (working)
   - UI component library (Radix UI - complete)
   - Form components (built, not connected)

7. **Security Configuration**
   - Helmet with CSP
   - Rate limiting (100 req/15min)
   - CORS properly configured
   - JWT authentication
   - bcrypt password hashing

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Frontend (src/frontend)                │
│  - Next.js 14                           │
│  - Radix UI + Tailwind                  │
│  - Forms (insurance, usage, profile)    │
│  - Comparison dashboard                 │
│  - Status: UI done, not connected       │
└──────────────────┬──────────────────────┘
                   │ API Calls (INCOMPLETE)
                   ↓
┌─────────────────────────────────────────┐
│  Backend (src/backend)                  │
│  - Express.js + TypeScript              │
│  - 6 route files                        │
│  - 3 model files (User, Insurance, DPC) │
│  - Cost calculator (WORKING)            │
│  - Provider matcher (STUBBED)           │
│  - Scenario CRUD (STUBBED)              │
└──────────────────┬──────────────────────┘
                   │ SQL Queries
                   ↓
┌─────────────────────────────────────────┐
│  Database (PostgreSQL)                  │
│  - schema.sql (14KB)                    │
│  - 7 main tables + audit_logs           │
│  - 15+ performance indexes              │
│  - Full-text search enabled             │
└─────────────────────────────────────────┘
```

---

## Current Implementation Status

### ✅ Complete
- Cost comparison algorithm (3 scenarios)
- Database schema and connection
- Unit test suite (20+ tests)
- HIPAA compliance test suite
- Security middleware (helmet, CORS, rate limiting)
- JWT authentication setup
- Frontend UI components
- Form field validation with Zod

### 🟡 Partial
- API route handlers (only calculate working)
- Frontend components (UI done, API integration missing)
- Environment configuration (ready but not all keys filled)
- Integration tests (exist but incomplete)

### ❌ Missing
- Provider matching algorithm
- Provider search API endpoints
- Scenario CRUD (save/load/update/delete)
- Frontend-to-backend form submissions
- Session management (Redis middleware)
- Email notifications (SendGrid)
- Healthcare API integration
- Provider database population

---

## Week 2 Priority Roadmap

### Priority 1 (Blockers) - 12-14 hours
1. **Fix build pipeline** (1 hour)
   - Remove `apps/` folder
   - Fix `tsconfig` issues
   - Verify `npm run build` works

2. **Consolidate architecture** (4-6 hours)
   - Delete secondary structure
   - Update package.json workspaces
   - Clean up duplicate code

3. **Implement provider matching** (8-10 hours)
   - Create service with geographic search
   - Add to cost comparison endpoint
   - Test with sample providers

### Priority 2 (High Value) - 16-18 hours
4. **Connect frontend to backend** (6-8 hours)
   - Create API client library
   - Wire form submissions
   - Add error handling & loading states

5. **Implement scenario persistence** (6-8 hours)
   - POST /scenarios (save)
   - GET /scenarios/:id (load)
   - PATCH /scenarios/:id (update)
   - DELETE /scenarios/:id (delete)

6. **Input validation** (4 hours)
   - Add Zod schemas to endpoints
   - Return proper 400 errors
   - Document request formats

### Priority 3 (Nice-to-Have) - 8-12 hours
7. **Session management** (4-6 hours)
   - Redis integration
   - Session middleware
   - Logout functionality

8. **Real data integration** (12-16 hours)
   - Research healthcare APIs
   - Integrate Ribbon Health or similar
   - Populate insurance plans table

---

## Testing Status

| Test Type | Status | Quality | Notes |
|-----------|--------|---------|-------|
| Unit | ✅ Passing | ⭐⭐⭐⭐⭐ | costComparison.test.ts excellent |
| Integration | ⚠️ Partial | ⭐⭐⭐ | Exists but incomplete |
| E2E | ⚠️ Exists | ⭐⭐⭐ | Playwright config unverified |
| Security | ✅ Complete | ⭐⭐⭐⭐ | HIPAA tests thorough |
| HIPAA | ✅ Complete | ⭐⭐⭐⭐ | Compliance tests detailed |

**Key Test File**:
- `/tests/unit/costComparison.test.ts` - 362 lines, 20 test cases, all passing

---

## Deployment Configuration

### Ready to Deploy ✅
- `render.yaml` - Complete and correct
- `.env.example` - All variables documented
- PostgreSQL configuration - Ready

### Not Ready ❌
- Build pipeline - Currently broken
- Frontend deployment - No config
- Email service - Not implemented
- Healthcare APIs - Keys not filled

### Deployment Path
```
1. Fix build (1 hour)
2. Consolidate architecture (5 hours)
3. Test locally (1 hour)
4. Deploy to Render (auto from git)
5. Verify in production (1 hour)
```

---

## Files to Know

### Critical Files
- `/src/backend/services/cost-calculator.ts` - Core algorithm (302 lines)
- `/src/backend/database/schema.sql` - Database schema (14KB)
- `/src/backend/server.ts` - Express setup (127 lines)
- `/src/frontend/components/comparison-dashboard.tsx` - Results UI (136 lines)
- `/tests/unit/costComparison.test.ts` - Unit tests (362 lines)

### Important Routes
- `/src/backend/routes/costComparison.routes.ts` - Main API (106 lines, has TODOs)
- `/src/backend/routes/auth.routes.ts` - Authentication (47 lines)
- `/src/backend/routes/health.routes.ts` - Health checks (18 lines)

### Configuration
- `/package.json` - Root config with workspaces
- `/.env.example` - Environment template (129 lines)
- `/render.yaml` - Deployment config (30 lines)
- `/src/backend/config/environment.ts` - Runtime config

---

## Environment Variables

**Essential** (Must have for production):
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=... (32+ chars)
JWT_REFRESH_SECRET=... (32+ chars)
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

**Security** (Recommended):
```
ENCRYPTION_KEY=... (32+ chars for AES-256)
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
HIPAA_COMPLIANCE=true
```

**Not Yet Implemented**:
```
SENDGRID_API_KEY=... (for email)
REDIS_URL=... (for sessions)
RIBBON_HEALTH_API_KEY=... (healthcare data)
TURQUOISE_HEALTH_API_KEY=... (healthcare data)
```

---

## Key Metrics

### Code Quality
- TypeScript: Yes, strict mode
- ESLint: Configured
- Prettier: Configured
- Tests: Vitest + Playwright + Supertest

### Performance Targets
- Cost calculation: <100ms
- API response: <500ms
- Database query: <200ms
- Page load: <3s

### Security Standards
- HIPAA compliance: Required
- HTTPS: Enforced in production
- CSP headers: Configured
- Rate limiting: 100 req/15min per IP
- JWT expiry: 15min access, 7day refresh

---

## Known Limitations

1. **Hardcoded Values** in calculator
   - Specialist visit: $200
   - Primary care: $150
   - DPC monthly: $75
   - Should pull from database

2. **No Real Data**
   - Uses average costs instead of insurance plans
   - No provider database (needs population)
   - No healthcare API integration

3. **Session Management**
   - Redis configured but not implemented
   - No persistent sessions
   - No auto-logout

4. **Email**
   - SendGrid configured but not used
   - Password reset not functional
   - Email verification not implemented

---

## Next Steps

**Immediate (Today)**:
- Review this analysis
- Prioritize Week 2 tasks
- Plan architecture consolidation

**This Week (Week 2)**:
- Fix build pipeline
- Remove `apps/` folder
- Implement provider matching
- Connect frontend to backend
- Add scenario persistence

**Beyond Week 2**:
- Healthcare API integration
- Session management
- Email notifications
- Provider ratings/reviews
- Real insurance plan data

---

## Questions & Support

### For Build Issues
Check: `render.yaml` and `Procfile` - both point to `src/backend`

### For Database Issues
Check: `/src/backend/database/schema.sql` and `.env` DATABASE_URL

### For API Issues
Check: `/src/backend/routes/` files and `/src/backend/middleware/`

### For Frontend Issues
Check: `/src/frontend/` and component imports

### For Cost Calculation
Check: `/src/backend/services/cost-calculator.ts` and tests

---

## Useful Commands

```bash
# Development
npm install                  # Install dependencies
npm run dev                 # Run both frontend and backend
npm run dev:backend         # Backend only
npm run dev:frontend        # Frontend only

# Testing
npm run test                # Run all tests
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests
npm run test:e2e            # E2E tests (Playwright)
npm run test:security       # Security tests
npm run test:hipaa          # HIPAA compliance

# Building
npm run build               # Build all (currently broken)
npm run lint                # Check code style
npm run format              # Auto-format code

# Database
cd src/backend
npm run db:create          # Create database
npm run db:migrate         # Run migrations
npm run db:reset           # Reset database
```

---

## Success Criteria for Week 2

- [ ] `npm run build` completes without errors
- [ ] No TypeScript compilation errors
- [ ] All unit tests passing
- [ ] Provider matching returns 3-5 providers
- [ ] Forms submit to backend successfully
- [ ] Users can save/load comparison scenarios
- [ ] Input validation prevents invalid data
- [ ] HIPAA compliance tests still passing
- [ ] API response time <500ms
- [ ] Code coverage >80%

---

**Status**: Week 1 demo complete with $1,675 savings proof of concept  
**Ready for**: Week 2 feature completion and deployment preparation  
**Timeline**: 32-42 hours of development to production-ready  
**Confidence**: High - solid foundation, clear roadmap

For detailed analysis, see: `/docs/ARCHITECTURE_ANALYSIS_WEEK2.md`
