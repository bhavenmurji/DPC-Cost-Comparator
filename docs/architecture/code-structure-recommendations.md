# Code Structure Recommendations
## Data Integration Implementation

**Date:** October 30, 2025
**Status:** Architecture Design

---

## Recommended File Structure

```
/home/bmurji/Development/DPC-Cost-Comparator/
│
├── apps/
│   └── api/
│       ├── src/
│       │   ├── services/
│       │   │   │
│       │   │   ├── integration/                    # NEW: Data integration layer
│       │   │   │   │
│       │   │   │   ├── dataSources/               # Individual data source connectors
│       │   │   │   │   │
│       │   │   │   │   ├── cms/                   # CMS Healthcare.gov
│       │   │   │   │   │   ├── cmsHealthcareGov.connector.ts
│       │   │   │   │   │   ├── cmsDataTypes.ts
│       │   │   │   │   │   ├── cmsErrorHandler.ts
│       │   │   │   │   │   ├── cmsRateLimiter.ts
│       │   │   │   │   │   ├── cmsCache.strategy.ts
│       │   │   │   │   │   └── __tests__/
│       │   │   │   │   │       ├── cmsConnector.test.ts
│       │   │   │   │   │       └── cmsMocks.ts
│       │   │   │   │   │
│       │   │   │   │   ├── hcci/                  # HCCI HealthPrices.org
│       │   │   │   │   │   ├── hcciHealthPrices.connector.ts
│       │   │   │   │   │   ├── hcciDataTypes.ts
│       │   │   │   │   │   ├── hcciCostMapper.ts
│       │   │   │   │   │   └── __tests__/
│       │   │   │   │   │       └── hcciConnector.test.ts
│       │   │   │   │   │
│       │   │   │   │   ├── rwjf/                  # RWJF HIX Compare
│       │   │   │   │   │   ├── rwjfHixCompare.connector.ts
│       │   │   │   │   │   ├── rwjfCsvParser.ts
│       │   │   │   │   │   ├── rwjfDataTypes.ts
│       │   │   │   │   │   ├── rwjfDataLoader.ts
│       │   │   │   │   │   └── __tests__/
│       │   │   │   │   │       ├── rwjfParser.test.ts
│       │   │   │   │   │       └── fixtures/
│       │   │   │   │   │           └── sample_hix_compare.csv
│       │   │   │   │   │
│       │   │   │   │   └── kff/                   # KFF Calculator Logic
│       │   │   │   │       ├── kffCalculatorLogic.ts
│       │   │   │   │       ├── kffSubsidyEstimator.ts
│       │   │   │   │       ├── fplTables.ts
│       │   │   │   │       └── __tests__/
│       │   │   │   │           └── subsidyCalculator.test.ts
│       │   │   │   │
│       │   │   │   ├── normalizers/              # Data normalization
│       │   │   │   │   ├── insurancePlanNormalizer.ts
│       │   │   │   │   ├── costDataNormalizer.ts
│       │   │   │   │   ├── commonDataTypes.ts
│       │   │   │   │   └── __tests__/
│       │   │   │   │       └── normalizer.test.ts
│       │   │   │   │
│       │   │   │   ├── aggregators/              # Data aggregation logic
│       │   │   │   │   ├── insuranceDataAggregator.ts
│       │   │   │   │   ├── costDataAggregator.ts
│       │   │   │   │   ├── fallbackStrategy.ts
│       │   │   │   │   └── __tests__/
│       │   │   │   │       └── aggregator.test.ts
│       │   │   │   │
│       │   │   │   ├── cache/                    # Caching strategies
│       │   │   │   │   ├── redisCacheManager.ts
│       │   │   │   │   ├── diskCacheManager.ts
│       │   │   │   │   ├── cacheInvalidation.ts
│       │   │   │   │   ├── cacheWarming.ts
│       │   │   │   │   └── __tests__/
│       │   │   │   │       └── cache.test.ts
│       │   │   │   │
│       │   │   │   ├── utils/                    # Integration utilities
│       │   │   │   │   ├── zipToCounty.ts
│       │   │   │   │   ├── rateLimiter.ts
│       │   │   │   │   ├── retryWithBackoff.ts
│       │   │   │   │   ├── dataValidation.ts
│       │   │   │   │   └── attribution.ts
│       │   │   │   │
│       │   │   │   ├── index.ts                  # Main integration exports
│       │   │   │   └── README.md                 # Integration layer docs
│       │   │   │
│       │   │   ├── costComparison.service.ts     # MODIFIED: Use integration layer
│       │   │   ├── dpcProvider.service.ts
│       │   │   └── externalApi.service.ts        # LEGACY: To be deprecated
│       │   │
│       │   ├── config/
│       │   │   ├── dataSourceConfig.ts           # NEW: Data source configuration
│       │   │   ├── cacheConfig.ts                # NEW: Cache strategies
│       │   │   └── database.ts
│       │   │
│       │   ├── types/
│       │   │   └── integration/                  # NEW: Integration types
│       │   │       ├── InsurancePlan.types.ts
│       │   │       ├── CostData.types.ts
│       │   │       ├── DataSourceResponse.types.ts
│       │   │       └── Attribution.types.ts
│       │   │
│       │   ├── migrations/                       # NEW: Database migrations
│       │   │   ├── 001_create_cached_plans.sql
│       │   │   ├── 002_create_cost_benchmarks.sql
│       │   │   └── 003_create_data_source_logs.sql
│       │   │
│       │   └── jobs/                             # NEW: Background jobs
│       │       ├── cacheWarmingJob.ts
│       │       ├── dataRefreshJob.ts
│       │       └── tosMonitoringJob.ts
│       │
│       └── data/                                 # NEW: Static data files
│           └── rwjf/
│               ├── 2024/
│               │   ├── individual_market_plans.csv
│               │   ├── small_group_plans.csv
│               │   └── metadata.json
│               ├── 2025/
│               │   └── ...
│               └── latest -> 2025/              # Symlink
│
├── docs/
│   └── architecture/
│       ├── data-integration-strategy.md         # This document
│       ├── implementation-priority-matrix.md
│       ├── legal-compliance-checklist.md
│       └── api-integration-guides/
│           ├── cms-api-guide.md
│           ├── hcci-api-guide.md
│           └── rwjf-data-guide.md
│
└── scripts/
    ├── download-rwjf-data.ts                    # NEW: RWJF data downloader
    ├── warm-cache.ts                            # NEW: Cache warming script
    └── validate-attributions.ts                 # NEW: Legal compliance check
```

---

## Key Design Patterns

### 1. Connector Pattern

All data sources follow a consistent connector interface:

```typescript
// apps/api/src/services/integration/dataSources/IDataSourceConnector.ts

export interface IDataSourceConnector<TParams, TResponse> {
  // Core methods
  fetch(params: TParams): Promise<TResponse>
  healthCheck(): Promise<boolean>

  // Metadata
  getSourceName(): string
  getAttribution(): Attribution
  isCommercialUseAllowed(): boolean
}

export interface Attribution {
  source: string
  license: string
  citation: string
  url: string
  termsUrl: string
  commercialUse: boolean
  lastVerified: Date
}
```

**Benefits:**
- Consistent API across all data sources
- Easy to add new data sources
- Simplifies testing and mocking
- Clear attribution requirements

---

### 2. Normalization Pattern

Convert diverse data formats to a common schema:

```typescript
// apps/api/src/services/integration/normalizers/commonDataTypes.ts

export interface NormalizedInsurancePlan {
  // Internal ID (hash of source + planId)
  id: string

  // Source tracking
  dataSource: 'cms' | 'rwjf' | 'kff' | 'fallback'
  sourcePlanId: string
  dataYear: number
  lastUpdated: Date

  // Plan details
  planName: string
  issuer: string
  metalTier: 'Catastrophic' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  planType: 'HMO' | 'PPO' | 'EPO' | 'POS'

  // Costs (monthly)
  monthlyPremium: number
  annualDeductible: number
  outOfPocketMax: number

  // Geographic
  state: string
  county: string
  zipCodes: string[]

  // Benefits (optional, varies by source)
  benefits?: {
    primaryCareVisit?: string
    specialistVisit?: string
    emergencyRoom?: string
    prescriptionDrugs?: string
  }

  // Raw data (for debugging)
  rawData: Record<string, any>

  // Attribution
  attribution: Attribution
}

export interface NormalizedCostData {
  // Internal ID
  id: string

  // Source tracking
  dataSource: 'hcci' | 'cms' | 'rwjf'
  dataYear: number
  lastUpdated: Date

  // Procedure details
  procedureCode: string // CPT code
  procedureName: string

  // Geographic
  geographicLevel: 'national' | 'state' | 'metro' | 'county'
  geographicValue: string // e.g., "NY" or "New York Metro"

  // Cost data
  costs: {
    average: number
    median: number
    percentile25: number
    percentile75: number
    range: { low: number, high: number }
  }

  // Context
  payerType: 'Commercial' | 'Medicare' | 'Medicaid' | 'All'
  sampleSize?: number

  // Attribution
  attribution: Attribution
}
```

**Benefits:**
- Single data model for frontend
- Easy to switch data sources
- Simplifies caching
- Clear field definitions

---

### 3. Aggregation Pattern

Combine multiple data sources with fallback logic:

```typescript
// apps/api/src/services/integration/aggregators/insuranceDataAggregator.ts

export class InsuranceDataAggregator {
  constructor(
    private cmsConnector: CMSHealthcareGovConnector,
    private rwjfConnector: RWJFHixCompareConnector,
    private cache: RedisCacheManager
  ) {}

  /**
   * Fetch insurance plans with multi-source fallback
   */
  async fetchPlans(params: {
    zipCode: string
    age: number
    year: number
    metalTier?: string
  }): Promise<NormalizedInsurancePlan[]> {

    // Check cache first
    const cached = await this.cache.get<NormalizedInsurancePlan[]>(
      cacheKeys.plans(params)
    )
    if (cached) {
      logger.info('Cache hit', { params })
      return cached
    }

    // PRIMARY: Try CMS API
    try {
      const cmsPlans = await this.cmsConnector.fetch(params)
      const normalized = cmsPlans.map(normalizeCMSPlan)

      if (normalized.length > 0) {
        await this.cache.set(cacheKeys.plans(params), normalized, TTL.cmsPlans)
        return normalized
      }
    } catch (error) {
      logger.warn('CMS API failed, trying fallback', { error })
    }

    // FALLBACK: Try RWJF data
    try {
      const { state, county } = await zipToCounty(params.zipCode)
      const rwjfPlans = await this.rwjfConnector.fetch({ state, county, year: params.year })
      const normalized = rwjfPlans.map(normalizeRWJFPlan)

      if (normalized.length > 0) {
        await this.cache.set(cacheKeys.plans(params), normalized, TTL.rwjfPlans)
        return normalized
      }
    } catch (error) {
      logger.warn('RWJF fallback failed', { error })
    }

    // LAST RESORT: Use estimates
    logger.error('All data sources failed, using estimates', { params })
    return generateEstimatedPlans(params)
  }
}
```

**Benefits:**
- Resilient to API failures
- Transparent fallback logic
- Centralized caching
- Easy to test

---

### 4. Cache Strategy Pattern

Multi-tier caching with TTL management:

```typescript
// apps/api/src/services/integration/cache/redisCacheManager.ts

export class RedisCacheManager {
  constructor(private redisClient: Redis) {}

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redisClient.get(key)
    if (!cached) return null

    return JSON.parse(cached) as T
  }

  /**
   * Set cached data with TTL
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redisClient.setex(key, ttl, JSON.stringify(value))
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidate(pattern: string): Promise<number> {
    const keys = await this.redisClient.keys(pattern)
    if (keys.length === 0) return 0

    await this.redisClient.del(...keys)
    return keys.length
  }

  /**
   * Warm cache for popular locations
   */
  async warm(zipCodes: string[]): Promise<void> {
    const year = new Date().getFullYear()

    for (const zipCode of zipCodes) {
      // Fetch and cache in parallel (rate-limited)
      await this.fetchAndCache(zipCode, year)
      await sleep(100) // Rate limiting
    }
  }
}

// Cache key generators
export const cacheKeys = {
  plans: (params: { zipCode: string, year: number, metalTier?: string }) =>
    `plans:${params.zipCode}:${params.year}${params.metalTier ? `:${params.metalTier}` : ''}`,

  costs: (procedureCode: string, geoLevel: string, geoValue: string) =>
    `costs:${procedureCode}:${geoLevel}:${geoValue}`,

  calculation: (params: any) =>
    `calc:${hash(JSON.stringify(params))}`
}

// Cache TTL configuration
export const TTL = {
  cmsPlans: 86400,        // 1 day during open enrollment
  rwjfPlans: 31536000,    // 365 days (annual data)
  hcciCosts: 7776000,     // 90 days (quarterly updates)
  calculations: 3600,     // 1 hour
}
```

**Benefits:**
- Consistent caching across data sources
- Easy TTL management
- Cache warming for performance
- Pattern-based invalidation

---

## Configuration Management

### Data Source Configuration

```typescript
// apps/api/src/config/dataSourceConfig.ts

import { config } from 'dotenv'
config()

export interface DataSourceConfig {
  name: string
  enabled: boolean
  apiKey?: string
  baseUrl?: string
  rateLimits?: {
    maxRequests: number
    windowMs: number
  }
  timeout?: number
  retries?: number
}

export const dataSourceConfig = {
  cms: {
    name: 'CMS Healthcare.gov',
    enabled: !!process.env.CMS_API_KEY,
    apiKey: process.env.CMS_API_KEY,
    baseUrl: 'https://marketplace.api.healthcare.gov/api/v1',
    rateLimits: {
      maxRequests: 1000,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
    timeout: 10000,
    retries: 3,
  } as DataSourceConfig,

  hcci: {
    name: 'HCCI HealthPrices.org',
    enabled: true, // No API key required (public API)
    baseUrl: 'https://healthprices.org/api/v1',
    timeout: 5000,
    retries: 2,
  } as DataSourceConfig,

  rwjf: {
    name: 'RWJF HIX Compare',
    enabled: process.env.ALLOW_NON_COMMERCIAL_DATA === 'true',
    // File-based, no API
  } as DataSourceConfig,

  ribbon: {
    name: 'Ribbon Health',
    enabled: !!process.env.RIBBON_HEALTH_API_KEY,
    apiKey: process.env.RIBBON_HEALTH_API_KEY,
    baseUrl: 'https://api.ribbonhealth.com/v1',
    timeout: 10000,
  } as DataSourceConfig,
}

// Validate configuration on startup
export function validateDataSourceConfig(): void {
  const enabledSources = Object.entries(dataSourceConfig)
    .filter(([_, config]) => config.enabled)
    .map(([name, _]) => name)

  if (enabledSources.length === 0) {
    throw new Error('No data sources enabled. Configure at least one API key.')
  }

  console.log('Enabled data sources:', enabledSources.join(', '))
}
```

### Environment Variables

```bash
# apps/api/.env.example

# CMS Healthcare.gov API
CMS_API_KEY=your_api_key_here

# HCCI HealthPrices.org (no key required, public API)
# (No configuration needed)

# RWJF HIX Compare (non-commercial data)
ALLOW_NON_COMMERCIAL_DATA=false  # Set to 'true' only if non-commercial use

# Redis Cache
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dpc_comparator

# Optional: Paid APIs
RIBBON_HEALTH_API_KEY=
TURQUOISE_HEALTH_API_KEY=

# Application
NODE_ENV=development
PORT=3000
```

---

## Testing Strategy

### Unit Tests

```typescript
// apps/api/src/services/integration/dataSources/cms/__tests__/cmsConnector.test.ts

import { CMSHealthcareGovConnector } from '../cmsHealthcareGov.connector'
import { cmsMocks } from './cmsMocks'

describe('CMSHealthcareGovConnector', () => {
  let connector: CMSHealthcareGovConnector

  beforeEach(() => {
    connector = new CMSHealthcareGovConnector('test_api_key')
  })

  describe('fetchPlans', () => {
    it('should fetch catastrophic plans for valid ZIP', async () => {
      // Mock HTTP client
      jest.spyOn(connector['client'], 'get').mockResolvedValue({
        data: cmsMocks.catastrophicPlansResponse,
        status: 200,
      })

      const plans = await connector.getCatastrophicPlans('10001', 35, 2025)

      expect(plans).toHaveLength(3)
      expect(plans[0].metalLevel).toBe('Catastrophic')
      expect(plans[0].premium).toBeGreaterThan(0)
    })

    it('should handle rate limiting with retry', async () => {
      jest.spyOn(connector['client'], 'get')
        .mockRejectedValueOnce({ response: { status: 429, headers: { 'retry-after': '1' } } })
        .mockResolvedValueOnce({ data: cmsMocks.catastrophicPlansResponse, status: 200 })

      const plans = await connector.getCatastrophicPlans('10001', 35, 2025)

      expect(plans).toHaveLength(3)
    })

    it('should return empty array for 404 (no plans available)', async () => {
      jest.spyOn(connector['client'], 'get').mockRejectedValue({ response: { status: 404 } })

      const plans = await connector.getCatastrophicPlans('99999', 35, 2025)

      expect(plans).toEqual([])
    })
  })

  describe('healthCheck', () => {
    it('should return true if API is healthy', async () => {
      jest.spyOn(connector['client'], 'get').mockResolvedValue({ status: 200 })

      const isHealthy = await connector.healthCheck()

      expect(isHealthy).toBe(true)
    })
  })
})
```

### Integration Tests

```typescript
// apps/api/src/services/integration/__tests__/integration.test.ts

import { InsuranceDataAggregator } from '../aggregators/insuranceDataAggregator'
import { CMSHealthcareGovConnector } from '../dataSources/cms/cmsHealthcareGov.connector'
import { RedisCacheManager } from '../cache/redisCacheManager'

describe('Integration: Insurance Data Aggregation', () => {
  let aggregator: InsuranceDataAggregator

  beforeAll(async () => {
    // Use real connectors but with test API keys / mock servers
    const cmsConnector = new CMSHealthcareGovConnector(process.env.TEST_CMS_API_KEY)
    const cacheManager = new RedisCacheManager(testRedisClient)

    aggregator = new InsuranceDataAggregator(cmsConnector, null, cacheManager)
  })

  it('should fetch and cache plans from CMS API', async () => {
    const plans = await aggregator.fetchPlans({
      zipCode: '10001',
      age: 35,
      year: 2025,
    })

    expect(plans.length).toBeGreaterThan(0)
    expect(plans[0].dataSource).toBe('cms')

    // Verify caching
    const cachedPlans = await aggregator.fetchPlans({
      zipCode: '10001',
      age: 35,
      year: 2025,
    })

    expect(cachedPlans).toEqual(plans) // Same data from cache
  })

  it('should fallback to RWJF if CMS fails', async () => {
    // Simulate CMS failure
    jest.spyOn(aggregator['cmsConnector'], 'fetch').mockRejectedValue(new Error('API error'))

    const plans = await aggregator.fetchPlans({
      zipCode: '10001',
      age: 35,
      year: 2025,
    })

    expect(plans[0].dataSource).toBe('rwjf')
  })
})
```

---

## Error Handling Standards

### Custom Error Classes

```typescript
// apps/api/src/services/integration/utils/errors.ts

export class DataSourceError extends Error {
  constructor(
    public source: string,
    public statusCode: number,
    message: string,
    public originalError?: any
  ) {
    super(message)
    this.name = 'DataSourceError'
  }
}

export class RateLimitError extends Error {
  constructor(
    public source: string,
    public retryAfter: number
  ) {
    super(`Rate limited by ${source}. Retry after ${retryAfter}s`)
    this.name = 'RateLimitError'
  }
}

export class DataValidationError extends Error {
  constructor(
    public source: string,
    public field: string,
    message: string
  ) {
    super(message)
    this.name = 'DataValidationError'
  }
}

export class LegalComplianceError extends Error {
  constructor(
    public source: string,
    message: string
  ) {
    super(message)
    this.name = 'LegalComplianceError'
  }
}
```

---

## Monitoring & Logging

### Structured Logging

```typescript
// apps/api/src/services/integration/utils/logger.ts

import winston from 'winston'

export const integrationLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'data-integration' },
  transports: [
    new winston.transports.File({ filename: 'logs/integration-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/integration.log' }),
  ],
})

// Log categories
export const logCategories = {
  apiRequest: (source: string, endpoint: string, params: any, responseTime: number) => {
    integrationLogger.info('API request', {
      category: 'apiRequest',
      source,
      endpoint,
      params,
      responseTime,
    })
  },

  cacheOperation: (operation: 'hit' | 'miss' | 'set', key: string) => {
    integrationLogger.debug('Cache operation', {
      category: 'cache',
      operation,
      key,
    })
  },

  fallback: (primarySource: string, fallbackSource: string, reason: string) => {
    integrationLogger.warn('Fallback triggered', {
      category: 'fallback',
      primarySource,
      fallbackSource,
      reason,
    })
  },

  legalCompliance: (check: string, result: 'pass' | 'fail', details: any) => {
    integrationLogger.info('Legal compliance check', {
      category: 'legal',
      check,
      result,
      details,
    })
  },
}
```

---

## Migration Path from Current Code

### Step 1: Create Integration Layer (Week 1)

1. Create directory structure:
   ```bash
   mkdir -p apps/api/src/services/integration/{dataSources,normalizers,aggregators,cache,utils}
   ```

2. Implement base interfaces:
   - `IDataSourceConnector.ts`
   - `commonDataTypes.ts`

3. Set up Redis cache:
   - Install `ioredis`: `npm install ioredis`
   - Implement `redisCacheManager.ts`

### Step 2: Migrate External API Service (Week 1-2)

1. Replace `externalApi.service.ts` contents:
   - Keep file for backward compatibility
   - Import new integration layer
   - Delegate to connectors

2. Update `costComparison.service.ts`:
   - Replace hardcoded calculations with aggregator calls
   - Use `NormalizedInsurancePlan` types

### Step 3: Implement Connectors (Week 2-3)

1. HCCI connector first (easiest, highest value)
2. CMS connector second (critical for accuracy)
3. RWJF loader third (fallback data)

### Step 4: Update Routes & Controllers (Week 3)

1. Update API routes to use new services
2. Add attribution to response DTOs
3. Add disclaimers to frontend

---

## Best Practices

### 1. Type Safety
- Use TypeScript strict mode
- Define interfaces for all data structures
- No `any` types in production code

### 2. Error Handling
- Always use try-catch for external API calls
- Log all errors with context
- Provide meaningful error messages to users

### 3. Testing
- Unit test every connector
- Integration test fallback logic
- Mock external APIs in tests
- Maintain > 80% code coverage

### 4. Performance
- Cache aggressively
- Use Promise.allSettled for parallel fetching
- Implement request queuing for rate limits
- Monitor slow queries

### 5. Security
- Never commit API keys
- Validate all input parameters
- Sanitize data before caching
- Use environment variables for secrets

### 6. Legal Compliance
- Automatic attribution injection
- Commercial use checks in production
- Quarterly ToS review reminders
- Audit logging for compliance

---

## Next Steps

1. **This Week:**
   - [ ] Create integration directory structure
   - [ ] Set up Redis locally
   - [ ] Implement base interfaces

2. **Next Week:**
   - [ ] Implement HCCI connector
   - [ ] Implement Redis cache manager
   - [ ] Write unit tests

3. **Week 3:**
   - [ ] Implement CMS connector
   - [ ] Update cost comparison service
   - [ ] Integration testing

---

**Document Owner:** Technical Lead
**Last Updated:** October 30, 2025
**Next Review:** After Phase 1 completion
