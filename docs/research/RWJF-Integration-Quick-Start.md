# RWJF HIX Compare Integration - Quick Start Guide

**For Developers:** Fast-track implementation guide

---

## Prerequisites Checklist

- [ ] Legal clearance from RWJF ([email protected])
- [ ] Healthcare.gov API key from https://developer.cms.gov/marketplace-api/
- [ ] PostgreSQL database access
- [ ] Node.js/TypeScript environment set up
- [ ] Review full research report: `RWJF-HIX-Compare-Integration-Strategy.md`

---

## Phase 1: Database Schema (Day 1)

### 1.1 Create Migration File

**File:** `/src/backend/database/migrations/003_add_rwjf_fields.sql`

```sql
-- Add RWJF-specific fields to insurance_plans table
ALTER TABLE insurance_plans
ADD COLUMN IF NOT EXISTS hios_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS issuer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS plan_variant VARCHAR(100),
ADD COLUMN IF NOT EXISTS actuarial_value DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS service_area VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_simple_choice BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_child_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_on_marketplace BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS data_source VARCHAR(50) DEFAULT 'MANUAL',
ADD COLUMN IF NOT EXISTS plan_year INTEGER,
ADD COLUMN IF NOT EXISTS last_updated_from_source TIMESTAMP WITH TIME ZONE,

-- Network-specific fields
ADD COLUMN IF NOT EXISTS deductible_in_network_individual DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS deductible_in_network_family DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS oop_max_in_network_individual DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS oop_max_in_network_family DECIMAL(10,2),

-- Drug coverage
ADD COLUMN IF NOT EXISTS generic_drug_copay DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS preferred_brand_copay DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS specialty_drug_copay DECIMAL(10,2),

-- Premium variations by age (JSONB)
ADD COLUMN IF NOT EXISTS premium_by_age JSONB;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_insurance_plans_hios_id ON insurance_plans(hios_id);
CREATE INDEX IF NOT EXISTS idx_insurance_plans_data_source ON insurance_plans(data_source);
CREATE INDEX IF NOT EXISTS idx_insurance_plans_plan_year ON insurance_plans(plan_year);
CREATE INDEX IF NOT EXISTS idx_insurance_plans_year_source ON insurance_plans(plan_year, data_source);
```

### 1.2 Run Migration

```bash
cd /home/bmurji/Development/DPC-Cost-Comparator
psql -U your_db_user -d dpc_comparator -f src/backend/database/migrations/003_add_rwjf_fields.sql
```

---

## Phase 2: RWJF ETL Pipeline (Days 2-4)

### 2.1 Install Dependencies

```bash
npm install csv-parser @types/csv-parser --save
```

### 2.2 Create ETL Service

**File:** `/src/backend/services/rwjf-etl.service.ts`

```typescript
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { db } from '../database/connection';
import { logger } from '../utils/logger';

export interface RWJFPlanRecord {
  HIOSID: string;
  IssuerName: string;
  PlanMarketingName: string;
  PlanType: string;
  MetalLevel: string;
  IndividualRate: string;
  DeductibleIndividualInNetwork: string;
  OOPMaxIndividualInNetwork: string;
  // Add more fields as needed
}

export class RWJFETLService {
  /**
   * Import RWJF CSV file into database
   */
  async importCSV(filePath: string, year: number): Promise<{
    imported: number;
    skipped: number;
    errors: number;
  }> {
    logger.info(`Starting RWJF import from ${filePath} for year ${year}`);

    const records: any[] = [];
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: RWJFPlanRecord) => {
          try {
            const transformed = this.transformRow(row, year);
            if (this.validateRow(transformed)) {
              records.push(transformed);
            } else {
              skipped++;
            }
          } catch (error) {
            logger.error('Error transforming row:', error);
            errors++;
          }
        })
        .on('end', async () => {
          try {
            imported = await this.bulkInsert(records);
            logger.info(`Import complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);
            resolve({ imported, skipped, errors });
          } catch (error) {
            logger.error('Bulk insert failed:', error);
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  /**
   * Transform RWJF CSV row to database format
   */
  private transformRow(row: RWJFPlanRecord, year: number): any {
    return {
      hios_id: row.HIOSID?.trim(),
      issuer_name: row.IssuerName?.trim(),
      plan_name: row.PlanMarketingName?.trim(),
      plan_type: this.mapPlanType(row.PlanType),
      metal_tier: this.mapMetalTier(row.MetalLevel),
      monthly_premium: this.parseDecimal(row.IndividualRate),
      deductible_in_network_individual: this.parseDecimal(row.DeductibleIndividualInNetwork),
      oop_max_in_network_individual: this.parseDecimal(row.OOPMaxIndividualInNetwork),
      data_source: 'RWJF',
      plan_year: year,
      is_active: true,
    };
  }

  /**
   * Validate transformed row
   */
  private validateRow(row: any): boolean {
    const required = ['hios_id', 'plan_name', 'monthly_premium'];
    return required.every(field => row[field] !== null && row[field] !== undefined);
  }

  /**
   * Bulk insert records into database
   */
  private async bulkInsert(records: any[]): Promise<number> {
    if (records.length === 0) return 0;

    const batchSize = 1000;
    let totalInserted = 0;

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const query = `
        INSERT INTO insurance_plans (
          hios_id, issuer_name, plan_name, plan_type, metal_tier,
          monthly_premium, deductible_in_network_individual,
          oop_max_in_network_individual, data_source, plan_year,
          is_active, created_at, updated_at
        )
        VALUES ${batch.map((_, idx) => {
          const offset = idx * 13;
          return `($${offset+1}, $${offset+2}, $${offset+3}, $${offset+4}, $${offset+5},
                   $${offset+6}, $${offset+7}, $${offset+8}, $${offset+9}, $${offset+10},
                   $${offset+11}, NOW(), NOW())`;
        }).join(', ')}
        ON CONFLICT (hios_id, plan_year) DO UPDATE SET
          issuer_name = EXCLUDED.issuer_name,
          plan_name = EXCLUDED.plan_name,
          monthly_premium = EXCLUDED.monthly_premium,
          updated_at = NOW()
      `;

      const values = batch.flatMap(r => [
        r.hios_id, r.issuer_name, r.plan_name, r.plan_type, r.metal_tier,
        r.monthly_premium, r.deductible_in_network_individual,
        r.oop_max_in_network_individual, r.data_source, r.plan_year,
        r.is_active
      ]);

      await db.query(query, values);
      totalInserted += batch.length;
      logger.info(`Inserted batch ${i / batchSize + 1}: ${batch.length} records`);
    }

    return totalInserted;
  }

  // Helper functions
  private parseDecimal(value: string): number | null {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }

  private mapPlanType(type: string): string {
    const mapping: { [key: string]: string } = {
      'HMO': 'HMO',
      'PPO': 'PPO',
      'EPO': 'EPO',
      'POS': 'POS',
    };
    return mapping[type?.toUpperCase()] || type;
  }

  private mapMetalTier(tier: string): string {
    const mapping: { [key: string]: string } = {
      'BRONZE': 'Bronze',
      'SILVER': 'Silver',
      'GOLD': 'Gold',
      'PLATINUM': 'Platinum',
      'CATASTROPHIC': 'Catastrophic',
    };
    return mapping[tier?.toUpperCase()] || tier;
  }
}
```

### 2.3 Create CLI Import Script

**File:** `/src/backend/scripts/import-rwjf.ts`

```typescript
import { RWJFETLService } from '../services/rwjf-etl.service';
import { logger } from '../utils/logger';

async function main() {
  const filePath = process.argv[2];
  const year = parseInt(process.argv[3]);

  if (!filePath || !year) {
    console.error('Usage: npm run import-rwjf <csv-file-path> <year>');
    process.exit(1);
  }

  const etl = new RWJFETLService();

  try {
    const result = await etl.importCSV(filePath, year);
    console.log(`✅ Import successful:`, result);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();
```

### 2.4 Add NPM Script

**File:** `package.json` (add to scripts section)

```json
{
  "scripts": {
    "import-rwjf": "ts-node src/backend/scripts/import-rwjf.ts"
  }
}
```

### 2.5 Test Import

```bash
# Download sample RWJF CSV from hix-compare.org
# Then run:
npm run import-rwjf ./data/rwjf-2024-plans.csv 2024
```

---

## Phase 3: Healthcare.gov API Integration (Days 5-7)

### 3.1 Create API Service

**File:** `/src/backend/services/healthcaregov-api.service.ts`

```typescript
import axios, { AxiosInstance } from 'axios';
import { db } from '../database/connection';
import { logger } from '../utils/logger';

export class HealthcareGovAPIService {
  private api: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.HEALTHCAREGOV_API_KEY || '';
    this.api = axios.create({
      baseURL: 'https://marketplace.api.healthcare.gov',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Fetch plans for a specific state and year
   */
  async fetchPlans(state: string, year: number, zipCode?: string): Promise<any[]> {
    try {
      const response = await this.api.get('/api/v1/plans/search', {
        params: {
          state,
          year,
          zipcode: zipCode,
        },
      });
      return response.data.plans || [];
    } catch (error) {
      logger.error(`Failed to fetch plans for ${state}:`, error);
      return [];
    }
  }

  /**
   * Sync plans from API to database
   */
  async syncPlans(state: string, year: number): Promise<number> {
    logger.info(`Syncing plans for ${state}, year ${year}`);

    const plans = await this.fetchPlans(state, year);
    let synced = 0;

    for (const plan of plans) {
      try {
        const transformed = this.transformPlan(plan, year);
        await this.upsertPlan(transformed);
        synced++;
      } catch (error) {
        logger.error(`Failed to sync plan ${plan.id}:`, error);
      }
    }

    logger.info(`Synced ${synced} plans for ${state}`);
    return synced;
  }

  /**
   * Transform API response to database format
   */
  private transformPlan(plan: any, year: number): any {
    return {
      hios_id: plan.id,
      issuer_name: plan.issuer?.name,
      plan_name: plan.name,
      plan_type: plan.type,
      metal_tier: plan.metalLevel,
      monthly_premium: parseFloat(plan.premium),
      deductible_in_network_individual: parseFloat(plan.deductible?.individual),
      oop_max_in_network_individual: parseFloat(plan.oopMax?.individual),
      data_source: 'HEALTHCAREGOV',
      plan_year: year,
      last_updated_from_source: new Date(),
    };
  }

  /**
   * Insert or update plan in database
   */
  private async upsertPlan(plan: any): Promise<void> {
    const query = `
      INSERT INTO insurance_plans (
        hios_id, issuer_name, plan_name, plan_type, metal_tier,
        monthly_premium, deductible_in_network_individual,
        oop_max_in_network_individual, data_source, plan_year,
        last_updated_from_source, is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, NOW(), NOW())
      ON CONFLICT (hios_id, plan_year) DO UPDATE SET
        issuer_name = EXCLUDED.issuer_name,
        plan_name = EXCLUDED.plan_name,
        monthly_premium = EXCLUDED.monthly_premium,
        last_updated_from_source = EXCLUDED.last_updated_from_source,
        updated_at = NOW()
      WHERE insurance_plans.data_source = 'HEALTHCAREGOV'
    `;

    await db.query(query, [
      plan.hios_id, plan.issuer_name, plan.plan_name, plan.plan_type,
      plan.metal_tier, plan.monthly_premium, plan.deductible_in_network_individual,
      plan.oop_max_in_network_individual, plan.data_source, plan.plan_year,
      plan.last_updated_from_source,
    ]);
  }
}
```

### 3.2 Create Sync Job

**File:** `/src/backend/jobs/sync-plans.job.ts`

```typescript
import * as cron from 'node-cron';
import { HealthcareGovAPIService } from '../services/healthcaregov-api.service';
import { logger } from '../utils/logger';

const STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export function startPlanSyncJob() {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    logger.info('Starting daily plan sync job');

    const api = new HealthcareGovAPIService();
    const currentYear = new Date().getFullYear();
    let totalSynced = 0;

    for (const state of STATES) {
      try {
        const synced = await api.syncPlans(state, currentYear);
        totalSynced += synced;
        logger.info(`✅ ${state}: ${synced} plans synced`);
      } catch (error) {
        logger.error(`❌ ${state}: Sync failed`, error);
      }
    }

    logger.info(`Plan sync complete: ${totalSynced} total plans synced`);
  });

  logger.info('Plan sync job scheduled (daily at 2 AM)');
}
```

### 3.3 Start Job on Server Boot

**File:** `/src/backend/server.ts` (add to startup)

```typescript
import { startPlanSyncJob } from './jobs/sync-plans.job';

// After server initialization
startPlanSyncJob();
```

---

## Phase 4: Service Layer Updates (Days 8-9)

### 4.1 Update Insurance Plan Model

**File:** `/src/backend/models/InsurancePlan.model.ts` (extend existing)

```typescript
export interface InsurancePlanFilters {
  // Existing filters
  planType?: string;
  metalTier?: string;
  maxPremium?: number;
  maxDeductible?: number;

  // New filters
  state?: string;
  year?: number;
  dataSource?: 'RWJF' | 'HEALTHCAREGOV' | 'MANUAL';
  isOnMarketplace?: boolean;
}

// Add new method
static async findByYear(year: number, filters?: InsurancePlanFilters): Promise<InsurancePlan[]> {
  let query = 'SELECT * FROM insurance_plans WHERE plan_year = $1 AND is_active = true';
  const values: any[] = [year];
  let paramCount = 2;

  // Add filters...

  // Prioritize Healthcare.gov API data
  query += ' ORDER BY CASE WHEN data_source = $' + paramCount + ' THEN 1 ELSE 2 END, monthly_premium ASC';
  values.push('HEALTHCAREGOV');

  const result = await db.query<InsurancePlan>(query, values);
  return result.rows;
}
```

---

## Phase 5: Testing (Days 10-11)

### 5.1 Unit Tests

**File:** `/tests/unit/rwjf-etl.test.ts`

```typescript
import { RWJFETLService } from '../../src/backend/services/rwjf-etl.service';

describe('RWJFETLService', () => {
  let service: RWJFETLService;

  beforeEach(() => {
    service = new RWJFETLService();
  });

  it('should transform RWJF row correctly', () => {
    const row = {
      HIOSID: '12345XX1234567',
      IssuerName: 'Blue Cross',
      PlanMarketingName: 'Gold PPO',
      // ... more fields
    };

    const transformed = service['transformRow'](row, 2024);

    expect(transformed.hios_id).toBe('12345XX1234567');
    expect(transformed.issuer_name).toBe('Blue Cross');
    expect(transformed.plan_year).toBe(2024);
  });

  it('should validate required fields', () => {
    const validRow = {
      hios_id: '123',
      plan_name: 'Test Plan',
      monthly_premium: 450,
    };

    expect(service['validateRow'](validRow)).toBe(true);
  });
});
```

### 5.2 Integration Test

```bash
# Test full workflow
npm run import-rwjf ./test-data/sample-plans.csv 2024
npm run test:integration
```

---

## Phase 6: Deployment (Day 12)

### 6.1 Environment Variables

```bash
# .env
HEALTHCAREGOV_API_KEY=your-api-key-here
DATABASE_URL=postgresql://user:pass@localhost:5432/dpc_comparator
```

### 6.2 Deploy Checklist

- [ ] Run database migration
- [ ] Import RWJF historical data (2014-2024)
- [ ] Configure Healthcare.gov API key
- [ ] Start sync job
- [ ] Verify data in database
- [ ] Test API endpoints
- [ ] Monitor logs for errors

### 6.3 Monitoring Queries

```sql
-- Check data freshness
SELECT data_source, plan_year, MAX(last_updated_from_source), COUNT(*)
FROM insurance_plans
GROUP BY data_source, plan_year
ORDER BY plan_year DESC;

-- Check data quality
SELECT plan_year,
       COUNT(*) as total,
       COUNT(monthly_premium) as has_premium,
       COUNT(deductible_in_network_individual) as has_deductible
FROM insurance_plans
WHERE plan_year >= 2024
GROUP BY plan_year;
```

---

## Quick Commands

```bash
# Import RWJF data
npm run import-rwjf ./data/rwjf-2024.csv 2024

# Manually trigger sync
ts-node src/backend/scripts/sync-all-states.ts

# Check import status
psql -d dpc_comparator -c "SELECT data_source, COUNT(*) FROM insurance_plans GROUP BY data_source;"

# Tail sync logs
tail -f logs/plan-sync.log
```

---

## Troubleshooting

### Issue: CSV parsing fails
- Check CSV encoding (should be UTF-8)
- Verify column names match data dictionary
- Check for special characters in data

### Issue: API rate limiting
- Implement exponential backoff
- Add delay between state syncs
- Cache API responses

### Issue: Database conflicts
- Check HIOS ID uniqueness constraint
- Verify plan_year is set correctly
- Review ON CONFLICT clause logic

---

## Resources

- **Full Report:** `/docs/research/RWJF-HIX-Compare-Integration-Strategy.md`
- **RWJF Website:** https://hix-compare.org
- **API Docs:** https://developer.cms.gov/marketplace-api/
- **Contact:** [email protected]

---

**Next Steps After Implementation:**
1. Monitor data quality daily
2. Set up alerting for sync failures
3. Document any CSV format changes
4. Plan for 2026 data import (next year)
