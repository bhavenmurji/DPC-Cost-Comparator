# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ignite Health Partnerships** is a healthcare cost comparison platform that helps Americans compare Direct Primary Care (DPC) + Catastrophic insurance against Traditional Insurance plans. The platform provides real-time cost comparisons using actual data from Healthcare.gov, DPC provider directories, and pharmacy pricing programs.

## Development Commands

### Initial Setup
```bash
# Complete one-command setup (recommended)
./scripts/setup-complete.sh

# Manual setup
docker-compose up -d              # Start PostgreSQL
npm install                        # Install root dependencies
cd apps/api && npm install        # Install API dependencies
cd apps/web && npm install        # Install web dependencies
```

### Database Operations
```bash
# From apps/api directory
npx prisma generate              # Generate Prisma client
npx prisma migrate dev           # Run database migrations
npx prisma studio               # Open database GUI
npx prisma migrate dev --name <migration_name>  # Create new migration
```

### Running the Application
```bash
# Development (both web and API with hot reload)
npm run dev                      # Runs both workspaces concurrently
npm run dev:web                 # Web only (Vite dev server on port 5173)
npm run dev:api                 # API only (tsx watch on port 4000)

# Individual workspaces
cd apps/api && npm run dev      # API server with hot reload
cd apps/web && npm run dev      # React frontend with Vite
```

### Testing
```bash
# Run all tests
npm run test                    # All unit and integration tests
npm run test:unit              # Unit tests only
npm run test:integration       # Integration tests only
npm run test:e2e               # Playwright end-to-end tests
npm run test:watch             # Watch mode for development
npm run test:coverage          # Generate coverage report

# Security and compliance
npm run test:security          # Penetration testing
npm run test:hipaa            # HIPAA compliance tests
```

### Build and Deployment
```bash
npm run build                  # Build all workspaces
npm run lint                   # Lint all workspaces
npm run format                 # Format code with Prettier
```

### Data Management Scripts
```bash
# From apps/api directory
npm run import:walmart          # Import Walmart $4 prescription program
npm run scrape:dpc:test        # Test scraper with 10 providers
npm run scrape:dpc             # Scrape all 2,734 DPC providers (~73 min)
```

## Architecture

### Monorepo Structure
This is a npm workspaces monorepo with two main applications:

- **apps/api/** - Express.js REST API (TypeScript, Node.js)
- **apps/web/** - React frontend (TypeScript, Vite)

### API Architecture (`apps/api/src/`)

**Layered Architecture:**
- `routes/` - Express route definitions (comparison, prescription, provider)
- `controllers/` - Request/response handling and validation
- `services/` - Business logic layer
  - `costComparison.service.ts` - Basic cost calculations
  - `costComparisonEnhanced.service.ts` - Enhanced calculations with Healthcare.gov API
  - `healthcareGov.service.ts` - Healthcare.gov Marketplace API integration
  - `prescriptionPricing.service.ts` - Walmart, Costco, GoodRx pricing
  - `providerMatching.service.ts` - DPC provider search and matching
  - `dpcFrontierScraper.service.ts` - Web scraper for DPC provider data
- `repositories/` - Data access layer (Prisma)
- `middleware/` - Express middleware (auth, validation, rate limiting, error handling)
- `validators/` - Zod schemas for request validation
- `utils/` - Shared utilities (encryption, logging, geo calculations)

**Key Design Patterns:**
- Repository pattern for database access
- Service layer for business logic
- Middleware-based request processing
- Zod for runtime type validation
- Winston for structured logging

### Frontend Architecture (`apps/web/src/`)

- `pages/` - Route-level components (ProviderSearch, ProviderDetails)
- `components/` - Reusable UI components
  - `ComparisonForm.tsx` - Cost comparison input form
  - `ProviderCard.tsx` - DPC provider display
  - `ProviderMap.tsx` - Google Maps integration
  - `ProviderFilters.tsx` - Search filters
  - `PrescriptionPricing.tsx` - Medication pricing display
- `services/` - API client layer
  - `apiClient.ts` - Base HTTP client
  - `providerService.ts` - Provider API methods
  - `pricingService.ts` - Pricing API methods
- `hooks/` - React custom hooks
- `utils/` - Frontend utilities

### Database Schema (Prisma)

**Core Models:**
- `User` - Platform users with role-based access
- `UserProfile` - Demographics, health data, insurance details
- `DPCProvider` - 2,734 DPC practices with geographic data
- `CostComparison` - Saved cost comparison calculations
- `PrescriptionPrice` - Cached prescription pricing (GoodRx, Walmart, Costco)
- `PharmacySavingsProgram` - Walmart $4, Costco membership programs
- `LabTestPrice` - Lab test pricing from LabCorp, Quest, DPC affiliates
- `UserMedication` - User medication lists with cost tracking
- `SavedComparison` - Shareable comparison results

**Important Relationships:**
- Users have one UserProfile (1:1)
- Users have many CostComparisons (1:N)
- CostComparisons link to MatchedProviders (1:N)
- DPCProviders have quality scores and data sources
- Geographic search uses PostGIS functions for radius queries

## Environment Variables

**Required for API:**
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - API server port (default: 4000)
- `HEALTHCARE_GOV_API_KEY` - Marketplace API key (get from developer.cms.gov)

**Required for Web:**
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps JavaScript API key
- `VITE_API_URL` - API base URL (default: http://localhost:4000)

**Security (Production):**
- `JWT_SECRET` - 32+ character secret for JWT signing
- `ENCRYPTION_KEY` - 32+ character key for AES-256 encryption
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds (default: 12)

**See `.env.example` for complete configuration options**

## Data Sources

### Healthcare.gov Marketplace API
- **Purpose:** Real-time insurance plan pricing with subsidies
- **Coverage:** All 50 states, 5 metal tiers (Bronze, Silver, Gold, Platinum, Catastrophic)
- **Rate Limit:** Configured in `healthcareGov.service.ts`
- **Documentation:** apps/api/src/services/healthcareGov.service.ts

### DPC Frontier Scraper
- **Purpose:** Automated collection of 2,734 DPC provider listings
- **Data Quality:** Average score 75-85/100 with source tracking
- **Updates:** Run periodically via `npm run scrape:dpc`
- **Implementation:** apps/api/src/services/dpcFrontierScraper.service.ts

### Walmart $4 Prescription Program
- **Coverage:** 30+ common generic medications
- **Pricing:** $4 (30-day), $10 (90-day)
- **Categories:** Cardiovascular, diabetes, mental health, pain, antibiotics
- **Import:** Run `npm run import:walmart` to load data

## API Endpoints

**11 REST endpoints across 3 categories:**

### Providers (`/api/providers`)
- `GET /search` - Geographic search with radius filtering
- `GET /:id` - Provider details by ID
- `GET /statistics` - Provider statistics and coverage

### Prescriptions (`/api/prescriptions`)
- `GET /pricing` - Get medication pricing from multiple sources
- `POST /calculate-costs` - Calculate total prescription costs
- `GET /search` - Search medications by name
- `GET /programs` - List pharmacy savings programs
- `GET /walmart-programs` - Walmart $4 program medications

### Comparison (`/api/comparison`)
- `POST /calculate` - Compare DPC vs Traditional insurance costs

**See `docs/API_REFERENCE.md` for complete endpoint documentation**

## Testing Strategy

- **Unit Tests:** Service layer logic, utilities, calculations
- **Integration Tests:** API endpoints, database operations, Healthcare.gov API
- **E2E Tests:** User workflows with Playwright
- **Security Tests:** HIPAA compliance, penetration testing
- **Test Framework:** Vitest for unit/integration, Playwright for E2E

## Important Development Notes

### Geographic Search
- Uses PostGIS for efficient radius-based queries
- Distance calculations in `apps/api/src/utils/geoDistance.ts`
- Provider coordinates stored as latitude/longitude decimals
- Default search radius: 50 miles (configurable)

### Healthcare.gov API Integration
- Requires API key from https://developer.cms.gov
- Implements caching to reduce API calls (24-hour TTL)
- Handles APTC subsidy calculations based on income
- County-level plan accuracy

### Data Quality
- DPC providers have quality scores (0-100)
- Source tracking for all provider data
- Data validation on import
- Automatic deduplication by practice name + address

### Security & HIPAA Compliance
- AES-256 encryption for sensitive data
- JWT authentication with refresh tokens
- Rate limiting on all endpoints
- Audit logging for compliance
- Input validation with Zod schemas
- CORS configuration for production

## Common Workflows

### Adding a New API Endpoint
1. Define route in `apps/api/src/routes/`
2. Create controller in `apps/api/src/controllers/`
3. Implement service logic in `apps/api/src/services/`
4. Add repository methods if database access needed
5. Create Zod validator in `apps/api/src/validators/`
6. Add tests in `apps/api/src/__tests__/`
7. Update API documentation in `docs/API_REFERENCE.md`

### Adding a New Database Model
1. Update `apps/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_migration_name`
3. Run `npx prisma generate` to update client
4. Create repository in `apps/api/src/repositories/`
5. Add TypeScript types in `apps/api/src/types/`
6. Update relevant services

### Creating a Scraper for New Data Source
1. Follow pattern in `dpcFrontierScraper.service.ts`
2. Implement data quality scoring
3. Add source tracking
4. Create import script in `scripts/`
5. Add npm script to `apps/api/package.json`
6. Document in scraper guide

## Performance Considerations

- Database queries use indexes on frequently searched fields (zipCode, state)
- Geographic queries optimized with spatial indexes
- Healthcare.gov responses cached for 24 hours
- Prescription pricing cached in database
- Rate limiting prevents API abuse
- Connection pooling configured (20 max connections)

## Deployment

- **Database:** PostgreSQL 14+ required (uses PostGIS features)
- **Node.js:** >= 20.0.0
- **npm:** >= 10.0.0
- **Environment:** See `.env.example` for production configuration
- **Docker:** `docker-compose.yml` provided for local PostgreSQL
