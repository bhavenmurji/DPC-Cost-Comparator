# Real-World Data Integration Architecture
## DPC Cost Comparator - From Mock Data to Production-Grade Accuracy

**Version:** 1.0.0
**Date:** October 30, 2025
**Status:** Architecture Design Phase
**Architect:** System Architecture Designer

---

## Executive Summary

This document outlines the comprehensive strategy for transitioning the DPC Cost Comparator from hardcoded mock data to real-world accuracy using public health insurance APIs and datasets. The architecture prioritizes data accuracy, system reliability, legal compliance, and phased implementation.

**Key Objectives:**
- Replace hardcoded premium calculations with real CMS marketplace data
- Integrate geographic-specific cost variation data
- Provide accurate catastrophic plan pricing
- Ensure legal compliance with data source terms
- Maintain high performance through intelligent caching
- Support future extensibility and data source additions

---

## 1. Data Source Assessment & Priority Matrix

### 1.1 PRIMARY Data Sources (Core Accuracy)

#### CMS Healthcare.gov API
**Priority:** CRITICAL
**Implementation Phase:** 1
**Data Quality:** ★★★★★
**Effort:** Medium

**Capabilities:**
- Official ACA marketplace plan data
- County-level premium information
- Benefit design details
- Subsidy eligibility calculations
- Real-time data updates

**Integration Value:**
- Most authoritative source for ACA plans
- Required for accurate catastrophic plan pricing
- Supports subsidy calculations
- Geographic specificity (county-level)

**Technical Details:**
```
Endpoint: Healthcare.gov API
Authentication: API Key (registration required)
Rate Limits: 1,000 requests/hour (estimated)
Data Format: JSON
Update Frequency: Annual open enrollment updates, quarterly adjustments
```

**Legal Considerations:**
- Public use allowed for non-commercial applications
- Attribution required: "Data provided by Centers for Medicare & Medicaid Services"
- Must comply with CMS data use agreements
- Cannot misrepresent plan information

---

#### HCCI HealthPrices.org
**Priority:** HIGH
**Implementation Phase:** 1
**Data Quality:** ★★★★★
**Effort:** Low-Medium

**Capabilities:**
- Average prices for 300+ medical services
- Geographic cost variation (national, regional, metro-level)
- Negotiated rates and out-of-pocket costs
- Procedure-specific pricing (CPT codes)

**Integration Value:**
- Critical for DPC value proposition calculations
- Shows geographic cost variations
- Supports "what you save on procedures" analysis
- Public API with minimal barriers

**Technical Details:**
```
Endpoint: HealthPrices.org API (free, public access)
Authentication: None or minimal registration
Rate Limits: Unknown (likely generous for research use)
Data Format: JSON/CSV
Update Frequency: Quarterly updates
```

**Legal Considerations:**
- Free public access for research and public benefit
- Attribution required: "Data from Health Care Cost Institute"
- Non-commercial use (verify licensing for your use case)
- Cannot repackage and resell data

---

### 1.2 FALLBACK Data Sources (Redundancy & Validation)

#### RWJF HIX Compare Datasets
**Priority:** MEDIUM
**Implementation Phase:** 2
**Data Quality:** ★★★★☆
**Effort:** Medium-High

**Capabilities:**
- Plan-level premiums and benefit design
- Nearly comprehensive coverage of ACA plans
- Historical data (2014-present)
- Small group and individual markets

**Integration Value:**
- Validates CMS API data
- Provides historical trend analysis
- Backup when CMS API unavailable
- Supports data completeness checks

**Technical Details:**
```
Format: CSV and Stata files (downloadable datasets)
Authentication: Free registration, non-commercial use license
Rate Limits: N/A (static file download)
Data Format: CSV
Update Frequency: Annual releases (post-open enrollment)
```

**Legal Considerations:**
- Non-commercial use only (CRITICAL restriction)
- Must cite: "Data from Robert Wood Johnson Foundation HIX Compare"
- Cannot redistribute raw data
- Research and public service use permitted
- **BLOCKER for commercial SaaS** - need alternative licensing or different approach

---

#### KFF Marketplace Calculator (Reverse Engineering)
**Priority:** LOW
**Implementation Phase:** 3
**Data Quality:** ★★★☆☆
**Effort:** Medium

**Capabilities:**
- Premium estimation logic
- Subsidy calculation methodology
- State-specific rules
- Reference implementation patterns

**Integration Value:**
- Validates calculation methodologies
- Provides subsidy logic patterns
- Useful for edge cases
- Can inform fallback estimation algorithms

**Technical Details:**
```
Type: Interactive web tool (HTML/JavaScript)
Authentication: None (public website)
Rate Limits: N/A
Data Format: Web scraping or logic analysis
Update Frequency: Annual updates
```

**Legal Considerations:**
- Methodology analysis permitted (public domain concepts)
- Cannot scrape or automate tool usage
- Use as reference only, not direct integration
- Cite methodology influence if applicable

---

### 1.3 SUPPLEMENTARY Data Sources (Enhanced Features)

#### GitHub Health Plan Comparison Tool
**Priority:** LOW
**Implementation Phase:** 3
**Data Quality:** ★★★☆☆
**Effort:** High

**Capabilities:**
- PDF analysis of Summary of Benefits and Coverage
- Automated plan discovery approach
- Open-source methodology

**Integration Value:**
- Innovative approach to plan data extraction
- Could supplement missing plan details
- Open-source licensing flexibility

**Technical Details:**
```
Type: Open-source GitHub repository
Authentication: N/A
License: Check repository license (likely MIT/Apache)
Technology: PDF parsing + data extraction
```

**Legal Considerations:**
- Follow open-source license terms
- Contribute back improvements if required
- Individual SBC documents may have copyright
- Use methodology, not necessarily raw data

---

## 2. Technical Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  (React Frontend - User Input: Age, Location, Health Profile)   │
└────────────────────┬────────────────────────────────────────────┘
                     │ REST API
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│         (Express.js - /api/v1/cost-comparison)                  │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  COST COMPARISON SERVICE                         │
│  (Orchestrates data fetching, normalization, calculations)      │
└─────┬──────────────────┬──────────────────┬─────────────────────┘
      │                  │                  │
      ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Insurance   │  │  Healthcare  │  │  Fallback    │
│  Data Agg.   │  │  Cost Data   │  │  Estimator   │
│  Service     │  │  Service     │  │  Service     │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────────────────────────────────────────────────────────┐
│              DATA SOURCE INTEGRATION LAYER                        │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   CMS API   │  │    HCCI     │  │    RWJF     │             │
│  │  Connector  │  │  Connector  │  │  Connector  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         │                │                │                      │
│         └────────────────┴────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│              ┌────────────────────────┐                          │
│              │ DATA NORMALIZATION     │                          │
│              │ LAYER                  │                          │
│              │ (Schema Mapper)        │                          │
│              └────────────────────────┘                          │
└───────────────────────┬──────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CACHING & STORAGE LAYER                        │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Redis    │  │  PostgreSQL │  │   Disk      │            │
│  │    Cache    │  │  (Metadata) │  │   Cache     │            │
│  │  (Hot Data) │  │             │  │  (RWJF CSV) │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘

EXTERNAL MONITORING & LOGGING
┌─────────────────────────────────────────────────────────────────┐
│  Winston Logger → Error Tracking → Performance Metrics          │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Data Flow Diagram

```
USER REQUEST FLOW:
==================

[User: Age=35, ZIP=10001, State=NY, Visits=6/year]
                    │
                    ▼
         ┌──────────────────────┐
         │   API Request        │
         │   POST /comparison   │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Input Validation    │
         │  & Sanitization      │
         └──────────┬───────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
┌─────────────────┐  ┌─────────────────┐
│  Cache Check    │  │  Rate Limit     │
│  (Redis)        │  │  Check          │
└────────┬────────┘  └────────┬────────┘
         │                    │
         ├────────────────────┘
         │
    [Cache Hit?]
         │
    ┌────┴────┐
    │         │
   YES       NO
    │         │
    │         ▼
    │  ┌──────────────────────┐
    │  │  Data Aggregation    │
    │  │  Service (Parallel)  │
    │  └──────┬───────────────┘
    │         │
    │    ┌────┴────┐
    │    │         │
    │    ▼         ▼
    │  ┌─────┐   ┌─────┐   ┌─────┐
    │  │CMS  │   │HCCI │   │RWJF │
    │  │ API │   │ API │   │DATA │
    │  └──┬──┘   └──┬──┘   └──┬──┘
    │     │         │         │
    │     └────┬────┴────┬────┘
    │          │         │
    │          ▼         │
    │    ┌───────────┐  │
    │    │ Normalize │  │
    │    │   Data    │  │
    │    └─────┬─────┘  │
    │          │         │
    │          ▼         │
    │    ┌───────────┐  │
    │    │  Merge &  │  │
    │    │  Enrich   │  │
    │    └─────┬─────┘  │
    │          │         │
    │          ▼         │
    │    ┌───────────┐  │
    │    │  Cache    │  │
    │    │  Result   │  │
    │    └─────┬─────┘  │
    │          │         │
    └──────────┴─────────┘
               │
               ▼
      ┌────────────────┐
      │  Cost          │
      │  Calculation   │
      │  Engine        │
      └────────┬───────┘
               │
               ▼
      ┌────────────────┐
      │  Format        │
      │  Response      │
      └────────┬───────┘
               │
               ▼
         [JSON Response]

PARALLEL DATA FETCHING:
======================
┌──────────────────────────────────────────────────────────┐
│  When cache miss, fetch from multiple sources in parallel│
│                                                           │
│  Promise.allSettled([                                    │
│    fetchCMSData(zipCode, age),                           │
│    fetchHCCIData(zipCode),                               │
│    fetchRWJFData(state, county)                          │
│  ])                                                       │
│                                                           │
│  → Continues even if one source fails                    │
│  → Uses whatever data is available                       │
│  → Falls back to estimates if all fail                   │
└──────────────────────────────────────────────────────────┘
```

---

### 2.3 Service Layer Architecture

```
/apps/api/src/services/
│
├── integration/                          # New integration layer
│   ├── dataSources/                      # Individual data source connectors
│   │   ├── cms/
│   │   │   ├── cmsHealthcareGov.connector.ts
│   │   │   ├── cmsDataTypes.ts
│   │   │   ├── cmsErrorHandler.ts
│   │   │   └── cmsRateLimiter.ts
│   │   │
│   │   ├── hcci/
│   │   │   ├── hcciHealthPrices.connector.ts
│   │   │   ├── hcciDataTypes.ts
│   │   │   └── hcciCostMapper.ts
│   │   │
│   │   ├── rwjf/
│   │   │   ├── rwjfHixCompare.connector.ts
│   │   │   ├── rwjfCsvParser.ts
│   │   │   ├── rwjfDataTypes.ts
│   │   │   └── rwjfDataLoader.ts
│   │   │
│   │   └── kff/
│   │       ├── kffCalculatorLogic.ts
│   │       └── kffSubsidyEstimator.ts
│   │
│   ├── normalizers/                      # Data normalization
│   │   ├── insurancePlanNormalizer.ts
│   │   ├── costDataNormalizer.ts
│   │   └── commonDataTypes.ts
│   │
│   ├── aggregators/                      # Data aggregation logic
│   │   ├── insuranceDataAggregator.ts
│   │   ├── costDataAggregator.ts
│   │   └── fallbackStrategy.ts
│   │
│   └── cache/                            # Caching strategies
│       ├── redisCacheManager.ts
│       ├── diskCacheManager.ts
│       ├── cacheInvalidation.ts
│       └── cacheWarming.ts
│
├── costComparison.service.ts             # Modified to use integration layer
├── externalApi.service.ts                # Legacy - to be replaced
└── dpcProvider.service.ts                # DPC provider logic

/apps/api/src/config/
├── dataSourceConfig.ts                   # Configuration for all data sources
└── cacheConfig.ts                        # Cache TTL, strategies

/apps/api/src/types/
└── integration/
    ├── InsurancePlan.types.ts
    ├── CostData.types.ts
    └── DataSourceResponse.types.ts
```

---

### 2.4 Database Schema Updates

```sql
-- New table: Data source metadata
CREATE TABLE data_source_logs (
  id SERIAL PRIMARY KEY,
  source_name VARCHAR(50) NOT NULL,
  request_type VARCHAR(100),
  request_params JSONB,
  response_status VARCHAR(20),
  response_time_ms INTEGER,
  cached BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_source_name ON data_source_logs(source_name);
CREATE INDEX idx_created_at ON data_source_logs(created_at);

-- New table: Cached insurance plans (denormalized for performance)
CREATE TABLE cached_insurance_plans (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  plan_id VARCHAR(100) NOT NULL,
  plan_name VARCHAR(255),
  state VARCHAR(2),
  county VARCHAR(100),
  zip_code VARCHAR(10),
  metal_tier VARCHAR(20),
  monthly_premium DECIMAL(10, 2),
  annual_deductible DECIMAL(10, 2),
  out_of_pocket_max DECIMAL(10, 2),
  plan_type VARCHAR(50),
  raw_data JSONB,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  UNIQUE(source, plan_id, zip_code)
);

CREATE INDEX idx_cached_plans_location ON cached_insurance_plans(state, county, zip_code);
CREATE INDEX idx_cached_plans_tier ON cached_insurance_plans(metal_tier);
CREATE INDEX idx_cached_plans_expires ON cached_insurance_plans(expires_at);

-- New table: Healthcare cost benchmarks
CREATE TABLE healthcare_cost_benchmarks (
  id SERIAL PRIMARY KEY,
  source VARCHAR(50) NOT NULL,
  procedure_code VARCHAR(20),
  procedure_name VARCHAR(255),
  geographic_level VARCHAR(20), -- national, state, metro, county
  geographic_value VARCHAR(100), -- e.g., "NY" or "New York Metro"
  average_cost DECIMAL(10, 2),
  median_cost DECIMAL(10, 2),
  cost_range_low DECIMAL(10, 2),
  cost_range_high DECIMAL(10, 2),
  data_year INTEGER,
  cached_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_cost_benchmarks_procedure ON healthcare_cost_benchmarks(procedure_code);
CREATE INDEX idx_cost_benchmarks_geo ON healthcare_cost_benchmarks(geographic_level, geographic_value);
CREATE INDEX idx_cost_benchmarks_expires ON healthcare_cost_benchmarks(expires_at);

-- Update insurance_plans table (existing) with new fields
ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS data_source VARCHAR(50);
ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS source_plan_id VARCHAR(100);
ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS last_verified TIMESTAMP;
ALTER TABLE insurance_plans ADD COLUMN IF NOT EXISTS data_quality_score INTEGER; -- 0-100
```

---

## 3. Implementation Roadmap

### Phase 1: Foundation & Quick Wins (Weeks 1-3)

**Goal:** Replace hardcoded costs with real data from easiest, highest-impact sources

**Tasks:**
1. **Week 1: HCCI Integration**
   - Set up HCCI HealthPrices.org API connector
   - Implement cost data normalization
   - Replace hardcoded procedure costs
   - Add geographic cost variation
   - **Impact:** Accurate out-of-pocket cost estimates

2. **Week 2: CMS API Integration (Catastrophic Plans)**
   - Register for Healthcare.gov API access
   - Implement CMS connector for catastrophic plans only
   - Build zip-to-county resolver
   - Replace hardcoded catastrophic premiums
   - **Impact:** Accurate catastrophic plan pricing

3. **Week 3: Caching & Performance**
   - Implement Redis caching layer
   - Add cache warming for popular locations
   - Implement rate limiting and retry logic
   - Set up monitoring and logging
   - **Impact:** Fast response times, resilient to API failures

**Success Metrics:**
- 90% of cost calculations use real data (vs 0% currently)
- API response time < 2 seconds
- Cache hit rate > 70%
- Zero hardcoded premium values in production code

**Deliverables:**
- `hcciHealthPrices.connector.ts`
- `cmsHealthcareGov.connector.ts`
- `redisCacheManager.ts`
- Updated `costComparison.service.ts`
- Integration test suite
- API monitoring dashboard

---

### Phase 2: Core Integrations (Weeks 4-7)

**Goal:** Comprehensive CMS integration and fallback mechanisms

**Tasks:**
1. **Week 4-5: Full CMS API Integration**
   - Expand CMS connector to all metal tiers
   - Implement subsidy calculation logic
   - Add plan comparison features
   - Build plan filtering by provider network
   - **Impact:** Complete marketplace plan accuracy

2. **Week 6: RWJF Data Integration (Fallback)**
   - Download and process RWJF HIX Compare datasets
   - Build CSV parser and data loader
   - Implement fallback logic (CMS → RWJF → Estimates)
   - Add data freshness validation
   - **Impact:** Redundancy, historical data, validation

3. **Week 7: Data Quality & Validation**
   - Cross-validate CMS vs RWJF data
   - Implement data quality scoring
   - Add outlier detection
   - Build data reconciliation reports
   - **Impact:** Trust in data accuracy

**Success Metrics:**
- All premium calculations use real data
- Fallback mechanisms tested and functional
- Data quality score > 95% for all locations
- Cross-source validation within 5% margin

**Deliverables:**
- Expanded `cmsHealthcareGov.connector.ts`
- `rwjfHixCompare.connector.ts`
- `fallbackStrategy.ts`
- Data quality monitoring
- Validation test suite

---

### Phase 3: Advanced Features (Weeks 8-10)

**Goal:** Enhanced user experience and supplementary data

**Tasks:**
1. **Week 8: KFF Logic Integration**
   - Analyze KFF Marketplace Calculator methodology
   - Implement subsidy estimation algorithms
   - Add tax credit calculations
   - Build "what-if" scenario modeling
   - **Impact:** Subsidy-aware recommendations

2. **Week 9: Provider Network Integration**
   - Integrate Ribbon Health API (if available)
   - Match DPC providers to insurance networks
   - Add "in-network" indicators
   - **Impact:** Network adequacy analysis

3. **Week 10: Historical Trends & Predictions**
   - Leverage RWJF historical data
   - Build trend analysis features
   - Add premium forecasting
   - Create year-over-year comparison
   - **Impact:** Future-planning insights

**Success Metrics:**
- Subsidy calculations accurate within $50/month
- Provider network matching 80%+ accuracy
- Historical data available for 5+ years
- Trend predictions within 10% of actual

**Deliverables:**
- `kffSubsidyEstimator.ts`
- Provider network matching service
- Historical trend analysis API
- Forecasting models

---

## 4. Integration Specifications

### 4.1 CMS Healthcare.gov API

**Base URL:** `https://marketplace.api.healthcare.gov/api/v1/`

**Key Endpoints:**
```
GET /counties/{state}
  → Get counties for ZIP code resolution

GET /plans/search
  Parameters:
    - zipcode: string (required)
    - year: number (required, e.g., 2025)
    - market: "Individual" | "Small Group"
    - metal_level: "Catastrophic" | "Bronze" | "Silver" | "Gold" | "Platinum"
    - household_income: number (for subsidy calculation)
    - household_size: number
  Response:
    - plans: Array<{
        id: string,
        name: string,
        issuer: string,
        premium: number,
        deductible: number,
        out_of_pocket_max: number,
        metal_level: string,
        plan_type: string
      }>

GET /plans/{planId}
  → Detailed plan information
```

**Authentication:**
```typescript
headers: {
  'Authorization': `Bearer ${process.env.CMS_API_KEY}`,
  'Content-Type': 'application/json'
}
```

**Rate Limiting:**
- 1,000 requests/hour per API key
- Implement exponential backoff on 429 responses
- Use request queuing for batch operations

**Caching Strategy:**
```typescript
// Cache key pattern
const cacheKey = `cms:plans:${zipcode}:${year}:${metalLevel}`

// TTL (Time To Live)
const cacheTTL = {
  openEnrollment: 24 * 60 * 60, // 1 day during OE
  offSeason: 7 * 24 * 60 * 60,  // 7 days off-season
}
```

**Error Handling:**
```typescript
try {
  const response = await fetch(endpoint, options)
  if (response.status === 429) {
    // Rate limited - use fallback or retry with backoff
    return await fallbackToRWJF(params)
  }
  if (response.status === 404) {
    // No plans found - may be invalid ZIP or no coverage area
    return { plans: [], source: 'cms', error: 'No plans available' }
  }
  return await response.json()
} catch (error) {
  logger.error('CMS API error', { error, params })
  return await fallbackToRWJF(params)
}
```

---

### 4.2 HCCI HealthPrices.org API

**Base URL:** `https://healthprices.org/api/v1/`

**Key Endpoints:**
```
GET /procedures
  → List all available procedures with CPT codes

GET /costs/{procedureCode}
  Parameters:
    - geographic_level: "national" | "state" | "metro"
    - geographic_value: string (e.g., "NY" or "New York")
    - payer_type: "Commercial" | "Medicare" | "Medicaid"
  Response:
    - procedure: string
    - cpt_code: string
    - average_cost: number
    - median_cost: number
    - cost_range: { low: number, high: number }
    - geographic_area: string
```

**Authentication:**
```typescript
// Minimal or no authentication required
// Check latest documentation
```

**Caching Strategy:**
```typescript
// Cache key pattern
const cacheKey = `hcci:costs:${cptCode}:${geoLevel}:${geoValue}`

// TTL - Cost data changes quarterly
const cacheTTL = 90 * 24 * 60 * 60 // 90 days
```

**Data Normalization:**
```typescript
interface NormalizedCostData {
  source: 'hcci'
  procedureCode: string
  procedureName: string
  geographicLevel: 'national' | 'state' | 'metro' | 'county'
  geographicValue: string
  costs: {
    average: number
    median: number
    range: { low: number, high: number }
  }
  payerType: string
  dataYear: number
  retrievedAt: Date
}
```

---

### 4.3 RWJF HIX Compare Dataset

**Data Source:** Downloaded CSV files (annual releases)

**File Location Strategy:**
```
/apps/api/data/rwjf/
  ├── 2024/
  │   ├── individual_market_plans.csv
  │   ├── small_group_plans.csv
  │   └── metadata.json
  ├── 2025/
  │   └── ...
  └── latest/ → symlink to most recent year
```

**Data Loading:**
```typescript
// Load on application startup or on-demand
class RWJFDataLoader {
  private data: Map<string, InsurancePlan[]> = new Map()

  async loadDataset(year: number): Promise<void> {
    const filePath = `/apps/api/data/rwjf/${year}/individual_market_plans.csv`
    const csvData = await fs.readFile(filePath, 'utf-8')
    const parsed = await parseCSV(csvData)

    // Group by state + county for efficient lookup
    const grouped = groupBy(parsed, (row) => `${row.state}:${row.county}`)
    this.data = grouped
  }

  async getPlans(state: string, county: string): Promise<InsurancePlan[]> {
    const key = `${state}:${county}`
    return this.data.get(key) || []
  }
}
```

**Data Structure (Normalized):**
```typescript
interface RWJFPlanData {
  source: 'rwjf'
  dataYear: number
  state: string
  county: string
  planId: string
  planName: string
  issuer: string
  metalLevel: string
  premiumAdult: number // Age-specific premiums in dataset
  deductible: number
  oopMax: number
  planType: string
  rawData: Record<string, any> // Original CSV row
}
```

**Legal Compliance:**
```typescript
// Add attribution to all responses using RWJF data
function addRWJFAttribution(response: any): any {
  if (response.dataSource === 'rwjf') {
    response.attribution = {
      source: 'Robert Wood Johnson Foundation HIX Compare',
      year: response.dataYear,
      license: 'Non-commercial use only',
      url: 'https://www.rwjf.org/en/library/research/...'
    }
  }
  return response
}
```

**Update Strategy:**
```typescript
// Check for new dataset releases quarterly
async function checkForUpdates(): Promise<void> {
  const latestYear = await getCurrentYear()
  const availableYears = await listAvailableRWJFDatasets()

  if (!availableYears.includes(latestYear)) {
    logger.info('New RWJF dataset available', { year: latestYear })
    await downloadAndProcessDataset(latestYear)
  }
}
```

---

### 4.4 KFF Marketplace Calculator (Logic Reference)

**Purpose:** Reference implementation for subsidy calculations (not direct API integration)

**Key Algorithms to Extract:**

1. **Federal Poverty Level (FPL) Calculation:**
```typescript
function calculateFPL(householdIncome: number, householdSize: number, year: number): number {
  // FPL varies by year and household size
  const fplTable = getFPLTable(year) // e.g., { 1: 14580, 2: 19720, ... }
  const baseFPL = fplTable[householdSize] || fplTable[8] + (householdSize - 8) * 5140

  return (householdIncome / baseFPL) * 100 // Return as percentage
}
```

2. **Premium Tax Credit (PTC) Calculation:**
```typescript
function calculatePTC(
  income: number,
  age: number,
  householdSize: number,
  state: string,
  year: number
): number {
  const fplPercent = calculateFPL(income, householdSize, year)

  // Eligible if 100% - 400% FPL (expanded under ARP)
  if (fplPercent < 100 || fplPercent > 400) {
    return 0 // No subsidy
  }

  // Calculate expected contribution (sliding scale)
  const contributionPercent = getContributionPercent(fplPercent, year)
  const maxContribution = income * contributionPercent

  // Calculate benchmark premium (second-lowest silver plan)
  const benchmarkPremium = await getBenchmarkPremium(age, state, year)

  // PTC is difference between benchmark and max contribution
  return Math.max(0, benchmarkPremium - maxContribution)
}
```

3. **Cost-Sharing Reductions (CSR) Eligibility:**
```typescript
function determineCSRLevel(fplPercent: number): string {
  if (fplPercent < 150) return '94% AV' // 94% actuarial value
  if (fplPercent < 200) return '87% AV'
  if (fplPercent < 250) return '73% AV'
  return 'Standard' // No CSR
}
```

**Integration Approach:**
- Analyze KFF calculator source code (JavaScript)
- Extract and test algorithms independently
- Validate against CMS official subsidy calculations
- Use as fallback when CMS subsidy API unavailable

---

## 5. Caching Architecture

### 5.1 Multi-Tier Caching Strategy

```
┌─────────────────────────────────────────────────────────┐
│                  CACHING TIERS                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TIER 1: In-Memory Cache (Node.js Process)             │
│  ┌───────────────────────────────────────────────┐     │
│  │ Hot data, 5-minute TTL, LRU eviction          │     │
│  │ Use Case: Frequently requested ZIPs           │     │
│  │ Size Limit: 100 MB                            │     │
│  └───────────────────────────────────────────────┘     │
│                       ▼ Miss                            │
│                                                         │
│  TIER 2: Redis Cache (Distributed)                     │
│  ┌───────────────────────────────────────────────┐     │
│  │ Warm data, TTL varies by data type            │     │
│  │ Use Case: All API responses                   │     │
│  │ Size Limit: 2 GB                              │     │
│  │                                               │     │
│  │ Keys:                                         │     │
│  │ - cms:plans:{zip}:{year}:{tier} (1-7 days)   │     │
│  │ - hcci:costs:{cpt}:{geo} (90 days)           │     │
│  │ - calculations:{hash} (1 hour)               │     │
│  └───────────────────────────────────────────────┘     │
│                       ▼ Miss                            │
│                                                         │
│  TIER 3: Disk Cache (PostgreSQL + File System)         │
│  ┌───────────────────────────────────────────────┐     │
│  │ Cold data, long-term storage                  │     │
│  │ Use Case: RWJF datasets, historical data      │     │
│  │ Size Limit: Unlimited                         │     │
│  │                                               │     │
│  │ Storage:                                      │     │
│  │ - cached_insurance_plans table               │     │
│  │ - healthcare_cost_benchmarks table           │     │
│  │ - /data/rwjf/*.csv files                     │     │
│  └───────────────────────────────────────────────┘     │
│                       ▼ Miss                            │
│                                                         │
│  TIER 4: External API Call                             │
│  ┌───────────────────────────────────────────────┐     │
│  │ Live data fetch from CMS, HCCI, etc.          │     │
│  │ → Store in all cache tiers                    │     │
│  └───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Cache Key Design

```typescript
// Standardized cache key structure
interface CacheKey {
  namespace: string  // e.g., 'cms', 'hcci', 'rwjf'
  resource: string   // e.g., 'plans', 'costs', 'calculations'
  identifier: string // Unique identifier (ZIP, CPT code, etc.)
  filters?: string   // Optional filters (year, tier, etc.)
}

// Example implementations
const cacheKeys = {
  cmsPlans: (zip: string, year: number, tier?: string) =>
    `cms:plans:${zip}:${year}${tier ? `:${tier}` : ''}`,

  hcciCosts: (cptCode: string, geoLevel: string, geoValue: string) =>
    `hcci:costs:${cptCode}:${geoLevel}:${geoValue}`,

  calculation: (params: ComparisonInput) =>
    `calc:${hash(JSON.stringify(params))}`, // SHA-256 hash

  rwjfPlans: (state: string, county: string, year: number) =>
    `rwjf:plans:${state}:${county}:${year}`
}
```

### 5.3 Cache Invalidation Strategy

```typescript
// Time-based invalidation (TTL)
const cacheTTL = {
  // CMS data - varies by season
  cmsPlansOpenEnrollment: 86400,      // 1 day (Nov-Jan)
  cmsPlansOffSeason: 604800,          // 7 days (Feb-Oct)

  // HCCI cost data - quarterly updates
  hcciCosts: 7776000,                 // 90 days

  // Calculations - short TTL for dynamic data
  calculations: 3600,                  // 1 hour

  // RWJF data - annual updates
  rwjfPlans: 31536000,                // 365 days
}

// Event-based invalidation
async function invalidateOnDataUpdate(source: string, resourceType: string): Promise<void> {
  const pattern = `${source}:${resourceType}:*`
  const keys = await redis.keys(pattern)

  await Promise.all(keys.map(key => redis.del(key)))

  logger.info('Cache invalidated', { source, resourceType, keysCleared: keys.length })
}

// Proactive cache warming (run during off-peak hours)
async function warmPopularLocations(): Promise<void> {
  const topZips = await getTopRequestedZips(100) // Top 100 ZIPs
  const currentYear = new Date().getFullYear()

  for (const zip of topZips) {
    await fetchAndCacheCMSPlans(zip, currentYear)
    await sleep(100) // Rate limiting
  }
}
```

### 5.4 Cache Performance Monitoring

```typescript
// Track cache performance metrics
interface CacheMetrics {
  hits: number
  misses: number
  hitRate: number
  avgRetrievalTime: number
  size: number
  evictions: number
}

// Middleware to track cache performance
async function cachePerformanceMiddleware(
  key: string,
  fetchFunction: () => Promise<any>
): Promise<any> {
  const startTime = Date.now()

  // Try cache first
  const cached = await redis.get(key)
  if (cached) {
    metrics.recordCacheHit(Date.now() - startTime)
    return JSON.parse(cached)
  }

  // Cache miss - fetch from source
  metrics.recordCacheMiss()
  const data = await fetchFunction()

  // Store in cache
  await redis.setex(key, getTTL(key), JSON.stringify(data))

  return data
}
```

---

## 6. Error Handling & Fallback Strategies

### 6.1 Fallback Hierarchy

```typescript
/**
 * Fetch insurance plans with fallback strategy
 */
async function fetchInsurancePlansWithFallback(
  zipCode: string,
  age: number,
  year: number,
  metalLevel?: string
): Promise<InsurancePlan[]> {

  // PRIMARY: CMS API
  try {
    const cmsPlans = await fetchCMSPlans(zipCode, year, metalLevel)
    if (cmsPlans.length > 0) {
      logger.info('CMS API success', { zipCode, planCount: cmsPlans.length })
      return cmsPlans
    }
  } catch (error) {
    logger.warn('CMS API failed', { zipCode, error })
  }

  // FALLBACK 1: RWJF Dataset
  try {
    const { state, county } = await zipToCounty(zipCode)
    const rwjfPlans = await fetchRWJFPlans(state, county, year, metalLevel)
    if (rwjfPlans.length > 0) {
      logger.info('RWJF fallback success', { zipCode, planCount: rwjfPlans.length })
      return rwjfPlans
    }
  } catch (error) {
    logger.warn('RWJF fallback failed', { zipCode, error })
  }

  // FALLBACK 2: Cached historical data
  try {
    const cachedPlans = await fetchCachedPlans(zipCode, year - 1) // Previous year
    if (cachedPlans.length > 0) {
      logger.info('Historical cache fallback', { zipCode, year: year - 1 })
      return adjustForInflation(cachedPlans, year)
    }
  } catch (error) {
    logger.warn('Historical cache fallback failed', { zipCode, error })
  }

  // FALLBACK 3: Estimation algorithm (last resort)
  logger.error('All data sources failed, using estimates', { zipCode })
  return generateEstimatedPlans(zipCode, age, year, metalLevel)
}
```

### 6.2 Error Handling Patterns

```typescript
// Custom error types
class DataSourceError extends Error {
  constructor(
    public source: string,
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'DataSourceError'
  }
}

class RateLimitError extends Error {
  constructor(
    public source: string,
    public retryAfter: number
  ) {
    super(`Rate limited by ${source}. Retry after ${retryAfter}s`)
    this.name = 'RateLimitError'
  }
}

// Centralized error handler
async function handleDataSourceError(
  error: any,
  source: string,
  params: any
): Promise<any> {
  // Log error
  logger.error('Data source error', {
    source,
    error: error.message,
    params
  })

  // Classify error
  if (error instanceof RateLimitError) {
    // Wait and retry
    await sleep(error.retryAfter * 1000)
    return await retryWithBackoff(source, params)
  }

  if (error instanceof DataSourceError && error.statusCode === 404) {
    // No data available - return empty result
    return { plans: [], source, error: 'No data available' }
  }

  // Unknown error - throw to trigger fallback
  throw error
}

// Exponential backoff retry
async function retryWithBackoff(
  fetchFunction: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<any> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFunction()
    } catch (error) {
      if (attempt === maxRetries - 1) throw error

      const delay = baseDelay * Math.pow(2, attempt)
      logger.warn('Retry attempt', { attempt: attempt + 1, delay })
      await sleep(delay)
    }
  }
}
```

---

## 7. Legal Compliance Summary

### 7.1 Data Source Licensing Matrix

| Data Source | License Type | Commercial Use | Attribution Required | Redistribution | Key Restrictions |
|------------|-------------|----------------|---------------------|----------------|-----------------|
| CMS Healthcare.gov | Public Domain | ✅ Yes | ✅ Required | ⚠️ Processed data only | Must not misrepresent plans; comply with CMS terms |
| HCCI HealthPrices.org | Public Access | ✅ Yes (verify) | ✅ Required | ❌ No | Non-commercial (verify latest terms) |
| RWJF HIX Compare | **Non-Commercial** | **❌ NO** | ✅ Required | ❌ No | **CRITICAL: Research/public service only** |
| KFF Calculator | Reference Only | ⚠️ Methodology only | ⚠️ Optional | N/A | Do not scrape; use logic only |
| GitHub SBC Parser | Open Source | ✅ Depends on license | ✅ Check repo | ✅ Check repo | Follow specific OSS license terms |

### 7.2 Compliance Implementation

```typescript
// Attribution system
interface DataAttribution {
  source: string
  license: string
  citation: string
  url: string
  termsUrl: string
  commercialUse: boolean
  lastVerified: Date
}

const attributions: Record<string, DataAttribution> = {
  cms: {
    source: 'Centers for Medicare & Medicaid Services',
    license: 'Public Domain',
    citation: 'Data provided by CMS Healthcare.gov',
    url: 'https://www.healthcare.gov',
    termsUrl: 'https://www.healthcare.gov/developers/',
    commercialUse: true,
    lastVerified: new Date('2025-10-30')
  },
  hcci: {
    source: 'Health Care Cost Institute',
    license: 'Public Access (verify terms)',
    citation: 'Cost data from HCCI HealthPrices.org',
    url: 'https://healthprices.org',
    termsUrl: 'https://healthprices.org/terms',
    commercialUse: true, // VERIFY LATEST TERMS
    lastVerified: new Date('2025-10-30')
  },
  rwjf: {
    source: 'Robert Wood Johnson Foundation HIX Compare',
    license: 'Non-Commercial Use Only',
    citation: 'Plan data from RWJF HIX Compare',
    url: 'https://www.rwjf.org',
    termsUrl: 'https://www.rwjf.org/en/library/research/...',
    commercialUse: false, // CRITICAL RESTRICTION
    lastVerified: new Date('2025-10-30')
  }
}

// Automatic attribution injection
function addAttribution(response: any, sources: string[]): any {
  response.attributions = sources.map(source => attributions[source])
  return response
}

// Commercial use check (for RWJF)
function checkCommercialUsage(dataSource: string): void {
  const attr = attributions[dataSource]
  if (!attr.commercialUse && process.env.NODE_ENV === 'production') {
    logger.error('LEGAL VIOLATION: Non-commercial data source used in commercial app', {
      source: dataSource
    })
    throw new Error(`Cannot use ${dataSource} data for commercial purposes`)
  }
}
```

### 7.3 Legal Compliance Checklist

**Pre-Implementation:**
- [ ] Register for CMS API key (Healthcare.gov developers program)
- [ ] Review CMS data use agreement and terms
- [ ] Verify HCCI HealthPrices.org current terms of service
- [ ] Review RWJF HIX Compare non-commercial license
- [ ] Determine if this application is "commercial" or "public service"
- [ ] Consult legal counsel if uncertain about licensing

**During Implementation:**
- [ ] Implement attribution system for all data sources
- [ ] Add data source disclaimers to user-facing pages
- [ ] Create privacy policy addressing third-party data
- [ ] Implement commercial use checks (if applicable)
- [ ] Document all data sources in codebase

**Post-Implementation:**
- [ ] Display attributions on comparison results page
- [ ] Add "About Our Data" page with full citations
- [ ] Quarterly review of data source terms (automated reminder)
- [ ] Monitor for data source policy changes
- [ ] Annual legal compliance audit

**CRITICAL DECISION POINT:**
If DPC Cost Comparator is intended as a **commercial SaaS product**, RWJF HIX Compare data **CANNOT** be used. Alternative:
1. Use only CMS + HCCI (commercial-friendly)
2. License commercial health insurance data (e.g., Turquoise Health API)
3. Partner with insurance carriers directly

---

## 8. Monitoring & Observability

### 8.1 Key Metrics to Track

```typescript
interface IntegrationMetrics {
  // Data source health
  apiAvailability: Record<string, number> // % uptime
  apiLatency: Record<string, number>      // avg response time (ms)
  apiErrorRate: Record<string, number>    // % of failed requests

  // Caching performance
  cacheHitRate: number                    // % of cache hits
  cacheSize: number                       // MB
  cacheEvictions: number                  // count/hour

  // Data quality
  dataFreshness: Record<string, number>   // hours since last update
  dataCompleteness: number                // % of requests with complete data
  fallbackUsageRate: number               // % using fallback vs primary

  // Business metrics
  comparisonsPerHour: number
  uniqueZipCodesServed: number
  avgSavingsCalculated: number
}

// Prometheus-style metrics export
app.get('/metrics', async (req, res) => {
  const metrics = await collectMetrics()
  res.set('Content-Type', 'text/plain')
  res.send(`
    # HELP api_availability Data source availability percentage
    # TYPE api_availability gauge
    api_availability{source="cms"} ${metrics.apiAvailability.cms}
    api_availability{source="hcci"} ${metrics.apiAvailability.hcci}

    # HELP cache_hit_rate Cache hit rate percentage
    # TYPE cache_hit_rate gauge
    cache_hit_rate ${metrics.cacheHitRate}

    # ... more metrics
  `)
})
```

### 8.2 Alerting Rules

```yaml
# Example alerting configuration (e.g., Prometheus Alertmanager)
alerts:
  - name: CMSAPIDown
    condition: api_availability{source="cms"} < 0.95
    severity: critical
    message: "CMS API availability below 95%"
    action: "Switch to RWJF fallback, notify on-call"

  - name: CacheHitRateLow
    condition: cache_hit_rate < 0.5
    severity: warning
    message: "Cache hit rate below 50%"
    action: "Investigate cache warming, check TTLs"

  - name: HighFallbackUsage
    condition: fallback_usage_rate > 0.2
    severity: warning
    message: "More than 20% of requests using fallback"
    action: "Check primary data source health"

  - name: DataStaleness
    condition: data_freshness{source="hcci"} > 168
    severity: warning
    message: "HCCI data not updated in 7 days"
    action: "Check HCCI API or trigger manual refresh"
```

### 8.3 Logging Strategy

```typescript
// Structured logging with Winston
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'dpc-cost-comparator' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})

// Log levels by category
const logLevels = {
  apiRequest: 'info',      // All external API requests
  cacheOperation: 'debug', // Cache hits/misses
  dataQuality: 'warn',     // Data quality issues
  fallback: 'warn',        // Fallback usage
  legalCompliance: 'info', // Attribution, license checks
  performance: 'info',     // Slow queries, bottlenecks
}

// Example usage
logger.info('CMS API request', {
  category: 'apiRequest',
  source: 'cms',
  endpoint: '/plans/search',
  params: { zipCode: '10001', year: 2025 },
  responseTime: 245,
  cached: false
})

logger.warn('Using fallback data source', {
  category: 'fallback',
  primarySource: 'cms',
  fallbackSource: 'rwjf',
  reason: 'API timeout',
  zipCode: '10001'
})
```

---

## 9. Implementation Priority Matrix

### 9.1 Effort vs Impact Analysis

```
                     HIGH IMPACT
                          │
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │   QUICK WINS    │   BIG BETS     │
        │   (Phase 1)     │   (Phase 2)    │
        │                 │                 │
        │  • HCCI API     │  • Full CMS    │
   LOW  │  • CMS Catas.   │    Integration │  HIGH
  EFFORT│  • Redis Cache  │  • RWJF Data   │  EFFORT
        │                 │  • Validation  │
        ├─────────────────┼─────────────────┤
        │                 │                 │
        │  FILL-INS       │  LONG-TERM     │
        │  (Phase 3)      │  (Future)      │
        │                 │                 │
        │  • KFF Logic    │  • Ribbon API  │
        │  • Provider Net │  • ML Models   │
        │  • Trends       │  • Predictions │
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
                     LOW IMPACT
```

### 9.2 Prioritized Task List

| Priority | Task | Impact | Effort | Phase | Dependencies |
|---------|------|--------|--------|-------|-------------|
| 🔴 P0 | HCCI Cost Data Integration | 🟢 High | 🟢 Low | 1 | None |
| 🔴 P0 | CMS Catastrophic Plans | 🟢 High | 🟡 Medium | 1 | ZIP-to-county resolver |
| 🔴 P0 | Redis Caching Layer | 🟢 High | 🟢 Low | 1 | None |
| 🟠 P1 | Full CMS API Integration | 🟢 High | 🔴 High | 2 | Phase 1 complete |
| 🟠 P1 | RWJF Fallback | 🟡 Medium | 🟡 Medium | 2 | CSV parser, legal review |
| 🟠 P1 | Data Quality Validation | 🟢 High | 🟡 Medium | 2 | CMS + RWJF data |
| 🟡 P2 | KFF Subsidy Logic | 🟡 Medium | 🟡 Medium | 3 | CMS data |
| 🟡 P2 | Provider Network Matching | 🟡 Medium | 🔴 High | 3 | Ribbon API key |
| 🟢 P3 | Historical Trends | 🟡 Low | 🟡 Medium | 3 | RWJF historical data |
| 🟢 P3 | Premium Forecasting | 🟡 Low | 🔴 High | Future | ML infrastructure |

---

## 10. Risk Assessment & Mitigation

### 10.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| CMS API rate limiting | 🟡 Medium | 🔴 High | Aggressive caching, request queuing, fallback to RWJF |
| Data source API changes | 🟡 Medium | 🟡 Medium | Version all connectors, monitor API docs, integration tests |
| RWJF dataset discontinuation | 🟢 Low | 🔴 High | Primary reliance on CMS API, not RWJF |
| ZIP code not found in datasets | 🟡 Medium | 🟡 Medium | Expand search to county-level, use state averages |
| Stale cached data | 🟡 Medium | 🟡 Medium | Implement cache invalidation, show "data as of" dates |
| Third-party API downtime | 🟡 Medium | 🔴 High | Multi-tier fallback system, cache warming |

### 10.2 Legal/Compliance Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| RWJF non-commercial violation | 🔴 High* | 🔴 High | Legal review, avoid in commercial version |
| Missing data attributions | 🟡 Medium | 🟡 Medium | Automated attribution injection, audit checks |
| Misrepresenting plan details | 🟢 Low | 🔴 High | Data validation, "verify with insurer" disclaimers |
| Data breach of cached personal info | 🟢 Low | 🔴 High | Do not cache personal data (age, income) |
| Terms of service changes | 🟡 Medium | 🟡 Medium | Quarterly ToS review, subscribe to API announcements |

*High if planning commercial SaaS product

### 10.3 Business Risks

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|-----------|--------|---------------------|
| Low data accuracy hurts credibility | 🟡 Medium | 🔴 High | Cross-validation, data quality metrics, user testing |
| High API costs (if paid tiers needed) | 🟡 Medium | 🟡 Medium | Cost modeling, usage caps, explore free tiers first |
| Complex integration delays launch | 🟡 Medium | 🟡 Medium | Phased approach, MVP with limited data sources |
| User confusion about data sources | 🟡 Medium | 🟢 Low | Clear UI messaging, "About Our Data" page |

---

## 11. Cost Estimation

### 11.1 Development Effort (Time)

| Phase | Tasks | Person-Weeks | Calendar Time |
|-------|-------|-------------|---------------|
| Phase 1 | HCCI, CMS Catastrophic, Redis | 3 weeks | 3 weeks |
| Phase 2 | Full CMS, RWJF, Validation | 4 weeks | 4 weeks |
| Phase 3 | KFF, Networks, Trends | 3 weeks | 3 weeks |
| **Total** | | **10 weeks** | **10 weeks** (1 dev) |

### 11.2 Infrastructure Costs (Annual)

| Resource | Provider | Estimated Cost |
|---------|---------|----------------|
| Redis Cache (2GB) | AWS ElastiCache | ~$200/year |
| PostgreSQL (50GB) | AWS RDS | ~$300/year |
| API Server (2 instances) | AWS EC2/ECS | ~$600/year |
| Data Transfer | AWS | ~$100/year |
| Monitoring (Datadog/New Relic) | SaaS | ~$300/year |
| **Total Infrastructure** | | **~$1,500/year** |

### 11.3 API & Data Costs

| Service | Tier | Estimated Cost |
|---------|------|----------------|
| CMS Healthcare.gov API | Free | $0 |
| HCCI HealthPrices.org | Free (public access) | $0 |
| RWJF HIX Compare | Free (non-commercial) | $0 |
| Ribbon Health API (Optional) | Paid | ~$500-2,000/month |
| Turquoise Health API (Optional) | Paid | ~$1,000-5,000/month |
| **Total API Costs (Free Tier)** | | **$0/year** |
| **Total API Costs (Paid Tier)** | | **$12,000-84,000/year** |

**Recommendation:** Start with free tier (CMS + HCCI) to validate product-market fit.

---

## 12. Success Metrics

### 12.1 Technical Metrics

- **Data Accuracy:** 95%+ of premium calculations within $50 of official marketplace data
- **API Performance:** < 2 second response time (p95)
- **Cache Hit Rate:** > 70% cache hits
- **Data Freshness:** < 24 hours for CMS data, < 7 days for HCCI data
- **API Uptime:** 99.5% availability
- **Fallback Usage:** < 10% of requests

### 12.2 Business Metrics

- **User Confidence:** 80%+ of users trust the calculations (survey)
- **Geographic Coverage:** 95%+ of US ZIP codes have data
- **Calculation Accuracy:** Average savings estimate within 10% of actual (post-signup validation)
- **Conversion Rate:** 5%+ of comparisons lead to DPC provider sign-ups
- **Cost Savings:** Users save average $2,000+/year (as calculated)

### 12.3 Legal Compliance Metrics

- **Attribution Compliance:** 100% of responses include proper citations
- **License Violations:** 0 incidents of non-commercial data in commercial use
- **Privacy Compliance:** 0 personal data breaches
- **ToS Reviews:** Quarterly audits completed on schedule

---

## 13. Next Steps & Action Items

### Immediate Actions (This Week)

1. **Legal Review**
   - [ ] Determine if DPC Cost Comparator is "commercial" or "public service"
   - [ ] Review RWJF non-commercial license implications
   - [ ] Decision: Use RWJF or find alternative?

2. **API Access**
   - [ ] Register for CMS Healthcare.gov API key
   - [ ] Test HCCI HealthPrices.org API access
   - [ ] Document API endpoints and authentication

3. **Architecture Setup**
   - [ ] Set up Redis cache (local for dev, AWS for prod)
   - [ ] Create `/src/services/integration/` directory structure
   - [ ] Initialize database migration for new tables

### Sprint Planning (Next 2 Weeks)

**Sprint 1: Foundation (Week 1)**
- Implement HCCI connector
- Set up Redis caching
- Create data normalization layer
- Write integration tests

**Sprint 2: CMS Catastrophic (Week 2)**
- Implement CMS API connector (catastrophic plans only)
- Build ZIP-to-county resolver
- Replace hardcoded catastrophic premiums
- Update cost comparison service

### Long-Term Planning

**Month 2:** Full CMS integration, RWJF fallback
**Month 3:** Data quality validation, KFF logic
**Month 4:** Provider network integration, historical trends
**Month 5+:** ML-based forecasting, advanced features

---

## Appendix A: Sample Code Implementations

### A.1 CMS API Connector

```typescript
// /apps/api/src/services/integration/dataSources/cms/cmsHealthcareGov.connector.ts

import axios, { AxiosInstance } from 'axios'
import { logger } from '@/utils/logger'
import { RateLimiter } from './cmsRateLimiter'

export interface CMSPlanSearchParams {
  zipcode: string
  year: number
  market?: 'Individual' | 'Small Group'
  metalLevel?: 'Catastrophic' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  householdIncome?: number
  householdSize?: number
}

export interface CMSPlan {
  id: string
  name: string
  issuer: string
  premium: number
  deductible: number
  outOfPocketMax: number
  metalLevel: string
  planType: string
  benefits: Record<string, any>
}

export class CMSHealthcareGovConnector {
  private client: AxiosInstance
  private rateLimiter: RateLimiter
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CMS_API_KEY || ''

    if (!this.apiKey) {
      throw new Error('CMS_API_KEY environment variable is required')
    }

    this.client = axios.create({
      baseURL: 'https://marketplace.api.healthcare.gov/api/v1',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    })

    this.rateLimiter = new RateLimiter({
      maxRequests: 1000,
      windowMs: 60 * 60 * 1000, // 1 hour
    })
  }

  /**
   * Search for health insurance plans
   */
  async searchPlans(params: CMSPlanSearchParams): Promise<CMSPlan[]> {
    await this.rateLimiter.checkLimit()

    try {
      logger.info('CMS API request', {
        source: 'cms',
        endpoint: '/plans/search',
        params,
      })

      const response = await this.client.get('/plans/search', {
        params: {
          zipcode: params.zipcode,
          year: params.year,
          market: params.market || 'Individual',
          metal_level: params.metalLevel,
          household_income: params.householdIncome,
          household_size: params.householdSize,
        },
      })

      const plans = this.normalizePlans(response.data.plans)

      logger.info('CMS API success', {
        source: 'cms',
        planCount: plans.length,
        responseTime: response.headers['x-response-time'],
      })

      return plans
    } catch (error: any) {
      return this.handleError(error, params)
    }
  }

  /**
   * Get catastrophic plans specifically
   */
  async getCatastrophicPlans(
    zipcode: string,
    age: number,
    year: number = new Date().getFullYear()
  ): Promise<CMSPlan[]> {
    return this.searchPlans({
      zipcode,
      year,
      metalLevel: 'Catastrophic',
    })
  }

  /**
   * Normalize CMS API response to internal format
   */
  private normalizePlans(rawPlans: any[]): CMSPlan[] {
    return rawPlans.map(plan => ({
      id: plan.id,
      name: plan.name,
      issuer: plan.issuer?.name || 'Unknown',
      premium: parseFloat(plan.premium) || 0,
      deductible: parseFloat(plan.deductible?.amount) || 0,
      outOfPocketMax: parseFloat(plan.moop?.amount) || 0,
      metalLevel: plan.metal_level,
      planType: plan.plan_type,
      benefits: plan.benefits || {},
    }))
  }

  /**
   * Handle API errors with appropriate fallback
   */
  private async handleError(error: any, params: CMSPlanSearchParams): Promise<CMSPlan[]> {
    if (error.response) {
      const status = error.response.status

      if (status === 429) {
        logger.warn('CMS API rate limited', { params })
        throw new RateLimitError('cms', error.response.headers['retry-after'] || 60)
      }

      if (status === 404) {
        logger.warn('CMS API no plans found', { params })
        return [] // No plans available for this ZIP
      }

      logger.error('CMS API error', {
        status,
        message: error.response.data?.message,
        params,
      })
    } else if (error.request) {
      logger.error('CMS API no response', { params })
    } else {
      logger.error('CMS API request setup error', { error: error.message })
    }

    throw new DataSourceError('cms', error.response?.status || 500, error.message)
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health')
      return response.status === 200
    } catch (error) {
      return false
    }
  }
}
```

### A.2 HCCI Connector

```typescript
// /apps/api/src/services/integration/dataSources/hcci/hcciHealthPrices.connector.ts

import axios, { AxiosInstance } from 'axios'
import { logger } from '@/utils/logger'

export interface HCCICostParams {
  procedureCode: string
  geographicLevel: 'national' | 'state' | 'metro'
  geographicValue: string
  payerType?: 'Commercial' | 'Medicare' | 'Medicaid'
}

export interface HCCICostData {
  procedureCode: string
  procedureName: string
  geographicLevel: string
  geographicValue: string
  costs: {
    average: number
    median: number
    range: { low: number, high: number }
  }
  payerType: string
  dataYear: number
}

export class HCCIHealthPricesConnector {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: 'https://healthprices.org/api/v1',
      timeout: 5000,
    })
  }

  /**
   * Get procedure costs
   */
  async getProcedureCosts(params: HCCICostParams): Promise<HCCICostData | null> {
    try {
      logger.info('HCCI API request', { source: 'hcci', params })

      const response = await this.client.get(`/costs/${params.procedureCode}`, {
        params: {
          geographic_level: params.geographicLevel,
          geographic_value: params.geographicValue,
          payer_type: params.payerType || 'Commercial',
        },
      })

      const normalized = this.normalizeCostData(response.data)

      logger.info('HCCI API success', { source: 'hcci', procedure: params.procedureCode })

      return normalized
    } catch (error: any) {
      logger.error('HCCI API error', {
        source: 'hcci',
        error: error.message,
        params,
      })
      return null
    }
  }

  /**
   * Normalize HCCI response
   */
  private normalizeCostData(rawData: any): HCCICostData {
    return {
      procedureCode: rawData.cpt_code,
      procedureName: rawData.procedure_name,
      geographicLevel: rawData.geographic_level,
      geographicValue: rawData.geographic_area,
      costs: {
        average: parseFloat(rawData.average_cost),
        median: parseFloat(rawData.median_cost),
        range: {
          low: parseFloat(rawData.cost_range?.low || 0),
          high: parseFloat(rawData.cost_range?.high || 0),
        },
      },
      payerType: rawData.payer_type,
      dataYear: parseInt(rawData.data_year),
    }
  }
}
```

---

## Conclusion

This architecture document provides a comprehensive roadmap for integrating real-world health insurance data into the DPC Cost Comparator. The phased approach balances quick wins (HCCI, CMS catastrophic plans) with long-term completeness (full CMS integration, RWJF fallback), while maintaining legal compliance and system reliability.

**Key Takeaways:**

1. **Start with Free APIs:** CMS and HCCI provide 90% of needed data at zero cost
2. **Cache Aggressively:** Multi-tier caching ensures fast responses and resilience
3. **Legal Compliance is Critical:** RWJF non-commercial restriction may block commercial use
4. **Fallback Strategies:** Never rely on a single data source
5. **Phased Implementation:** Ship incrementally, validate accuracy, iterate

**Next Steps:** Legal review, API access setup, and sprint planning for Phase 1 implementation.

---

**Document Version:** 1.0.0
**Last Updated:** October 30, 2025
**Maintainer:** System Architecture Team
**Review Cycle:** Quarterly
