# Healthcare.gov API Usage Examples

Complete code examples for common Healthcare.gov API operations in the DPC Cost Comparator.

## Table of Contents

- [Basic Setup](#basic-setup)
- [Search Plans](#search-plans)
- [Compare Costs](#compare-costs)
- [Advanced Filtering](#advanced-filtering)
- [Error Handling](#error-handling)
- [Caching](#caching)

## Basic Setup

### Initialize Client (server.ts)

```typescript
import { configureHealthcareGovApi } from './config/healthcareGov.config'

// Call this on server startup
configureHealthcareGovApi()
```

### Check if API is Available

```typescript
import { checkApiAvailability } from './services/costComparisonEnhanced.service'

const status = checkApiAvailability()
if (status.available) {
  console.log('Using real Healthcare.gov data')
} else {
  console.log('Using estimates:', status.message)
}
```

## Search Plans

### Search Silver Plans by ZIP Code

```typescript
import { getHealthcareGovClient } from './services/healthcareGov.service'

async function searchSilverPlans(zipCode: string, age: number) {
  const client = getHealthcareGovClient()

  const response = await client.searchPlans({
    household: {
      income: 50000,
      people: [{ age, aptc_eligible: true }],
    },
    place: {
      state: 'NC',
      countyfips: '37063',
      zipcode: zipCode,
    },
    market: 'Individual',
    year: 2024,
    filter: { metal: ['silver'] },
    sort: 'premium',
    order: 'asc',
    limit: 10,
  })

  return response.plans
}

// Usage
const plans = await searchSilverPlans('27701', 30)
console.log(`Found ${plans.length} silver plans`)
```

### Search Catastrophic Plans

```typescript
async function findCheapestCatastrophicPlan(zipCode: string, age: number) {
  const client = getHealthcareGovClient()

  const response = await client.searchCatastrophicPlans({
    household: {
      income: 40000,
      people: [{ age }],
    },
    place: {
      state: 'NC',
      countyfips: '37063',
      zipcode: zipCode,
    },
    market: 'Individual',
    year: 2024,
  })

  if (response.plans.length === 0) {
    return null
  }

  // Plans are already sorted by premium
  return response.plans[0]
}

// Usage
const cheapestPlan = await findCheapestCatastrophicPlan('27701', 28)
if (cheapestPlan) {
  console.log(`Cheapest catastrophic: $${cheapestPlan.premium.premium}/month`)
}
```

### Get Plan Details

```typescript
async function getPlanWithPremiumCalculation(planId: string, household: any) {
  const client = getHealthcareGovClient()

  const details = await client.getPlanDetails({
    plan_id: planId,
    household,
    year: 2024,
  })

  return {
    name: details.name,
    issuer: details.issuer.name,
    metalLevel: details.metal_level,
    premium: details.premium.premium,
    premiumWithCredit: details.premium.premium_w_credit,
    taxCredit: details.premium.premium_tax_credit,
    deductible: details.benefits.deductible.individual,
    maxOutOfPocket: details.benefits.maximum_out_of_pocket.individual,
    qualityRating: details.quality_rating,
  }
}

// Usage
const planDetails = await getPlanWithPremiumCalculation(
  '12345NC0123456-01',
  {
    income: 45000,
    people: [{ age: 30, aptc_eligible: true }],
  }
)
```

## Compare Costs

### Full Cost Comparison with Real Data

```typescript
import { calculateEnhancedComparison } from './services/costComparisonEnhanced.service'

async function compareTraditionalVsDPC(userInput: {
  age: number
  zipCode: string
  state: string
  chronicConditions: string[]
  annualDoctorVisits: number
  prescriptionCount: number
  income?: number
}) {
  const result = await calculateEnhancedComparison(
    {
      age: userInput.age,
      zipCode: userInput.zipCode,
      state: userInput.state,
      chronicConditions: userInput.chronicConditions,
      annualDoctorVisits: userInput.annualDoctorVisits,
      prescriptionCount: userInput.prescriptionCount,
    },
    {
      income: userInput.income || 50000,
      year: 2024,
      useApiData: true, // Use real API data
    }
  )

  return {
    savings: result.annualSavings,
    savingsPercent: result.percentageSavings,
    recommendation: result.recommendedPlan,
    dataSource: result.dataSource,
    traditional: {
      monthlyPremium: result.traditionalPremium,
      annualTotal: result.traditionalTotalAnnual,
      deductible: result.traditionalDeductible,
    },
    dpc: {
      monthlyFee: result.dpcMonthlyFee,
      catastrophicPremium: result.catastrophicPremium / 12,
      annualTotal: result.dpcTotalAnnual,
      deductible: result.catastrophicDeductible,
    },
  }
}

// Usage
const comparison = await compareTraditionalVsDPC({
  age: 35,
  zipCode: '27701',
  state: 'NC',
  chronicConditions: ['diabetes'],
  annualDoctorVisits: 8,
  prescriptionCount: 3,
  income: 55000,
})

console.log(`Annual Savings: $${comparison.savings}`)
console.log(`Recommendation: ${comparison.recommendation}`)
console.log(`Data from: ${comparison.dataSource.traditional}`)
```

### Compare Multiple Metal Tiers

```typescript
async function compareAllMetalTiers(zipCode: string, age: number, income: number) {
  const client = getHealthcareGovClient()

  const tiers = ['catastrophic', 'bronze', 'silver', 'gold', 'platinum']
  const results: Record<string, any> = {}

  for (const metal of tiers) {
    const response = await client.searchPlans({
      household: {
        income,
        people: [{ age, aptc_eligible: true }],
      },
      place: {
        state: 'NC',
        countyfips: '37063',
        zipcode: zipCode,
      },
      market: 'Individual',
      year: 2024,
      filter: { metal: [metal] },
      sort: 'premium',
      limit: 1,
    })

    if (response.plans.length > 0) {
      const plan = response.plans[0]
      results[metal] = {
        premium: plan.premium.premium_w_credit || plan.premium.premium,
        deductible: plan.benefits.deductible.individual,
        maxOOP: plan.benefits.maximum_out_of_pocket.individual,
      }
    }
  }

  return results
}

// Usage
const tierComparison = await compareAllMetalTiers('27701', 30, 50000)
console.log('Bronze:', tierComparison.bronze)
console.log('Silver:', tierComparison.silver)
console.log('Gold:', tierComparison.gold)
```

## Advanced Filtering

### Filter by Plan Type (HMO, PPO, etc.)

```typescript
async function searchPPOPlans(zipCode: string, age: number) {
  const client = getHealthcareGovClient()

  const response = await client.searchPlans({
    household: {
      income: 50000,
      people: [{ age }],
    },
    place: {
      state: 'NC',
      countyfips: '37063',
      zipcode: zipCode,
    },
    market: 'Individual',
    filter: {
      metal: ['silver', 'gold'],
      type: ['PPO'], // Only PPO plans
    },
    sort: 'premium',
    limit: 10,
  })

  return response.plans
}
```

### Filter by Premium Range

```typescript
async function searchAffordablePlans(
  zipCode: string,
  age: number,
  maxMonthlyPremium: number
) {
  const client = getHealthcareGovClient()

  const response = await client.searchPlans({
    household: {
      income: 50000,
      people: [{ age }],
    },
    place: {
      state: 'NC',
      countyfips: '37063',
      zipcode: zipCode,
    },
    market: 'Individual',
    filter: {
      premium: {
        max: maxMonthlyPremium,
      },
    },
    sort: 'quality_rating',
    order: 'desc',
  })

  return response.plans
}

// Usage
const affordablePlans = await searchAffordablePlans('27701', 30, 300)
console.log(`Found ${affordablePlans.length} plans under $300/month`)
```

### Filter by Quality Rating

```typescript
async function searchHighQualityPlans(zipCode: string, age: number) {
  const client = getHealthcareGovClient()

  const response = await client.searchPlans({
    household: {
      income: 50000,
      people: [{ age }],
    },
    place: {
      state: 'NC',
      countyfips: '37063',
      zipcode: zipCode,
    },
    market: 'Individual',
    filter: {
      quality_rating: 4, // 4+ stars
    },
    sort: 'premium',
  })

  return response.plans.filter((plan) => plan.quality_rating && plan.quality_rating >= 4)
}
```

## Error Handling

### Retry Logic with Exponential Backoff

```typescript
async function searchPlansWithRetry(request: any, maxRetries = 3) {
  const client = getHealthcareGovClient()

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.searchPlans(request)
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error
      }

      // Check if error is retryable
      if (error.status === 429 || error.status >= 500) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        console.log(`Retry attempt ${attempt} after ${delay}ms`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      } else {
        throw error // Don't retry client errors
      }
    }
  }
}
```

### Graceful Fallback to Estimates

```typescript
async function getPlansWithFallback(zipCode: string, age: number) {
  try {
    const client = getHealthcareGovClient()
    const response = await client.searchPlans({
      household: {
        income: 50000,
        people: [{ age }],
      },
      place: {
        state: 'NC',
        countyfips: '37063',
        zipcode: zipCode,
      },
      market: 'Individual',
    })

    return {
      plans: response.plans,
      dataSource: 'api' as const,
    }
  } catch (error) {
    console.warn('API failed, using estimates:', error)

    // Return estimated costs
    return {
      plans: [],
      dataSource: 'estimate' as const,
      estimatedPremium: calculateEstimatedPremium(age),
    }
  }
}
```

## Caching

### Check Cache Status

```typescript
import { getHealthcareGovClient } from './services/healthcareGov.service'

function getCacheInfo() {
  const client = getHealthcareGovClient()
  const stats = client.getCacheStats()

  console.log(`Cache size: ${stats.size} items`)
  console.log(`Cached keys: ${stats.keys.join(', ')}`)
}
```

### Clear Cache Manually

```typescript
function clearApiCache() {
  const client = getHealthcareGovClient()
  client.clearCache()
  console.log('Cache cleared')
}

// Clear cache daily at midnight
setInterval(clearApiCache, 24 * 60 * 60 * 1000)
```

### Bypass Cache for Fresh Data

```typescript
async function getLatestPlans(zipCode: string, age: number) {
  const client = getHealthcareGovClient()

  // Clear cache first
  client.clearCache()

  // This will fetch fresh data
  const response = await client.searchPlans({
    household: {
      income: 50000,
      people: [{ age }],
    },
    place: {
      state: 'NC',
      countyfips: '37063',
      zipcode: zipCode,
    },
    market: 'Individual',
  })

  return response.plans
}
```

## Complete API Route Example

```typescript
// routes/comparison.routes.ts
import { Router } from 'express'
import { calculateEnhancedComparison } from '../services/costComparisonEnhanced.service'

const router = Router()

router.post('/calculate', async (req, res) => {
  try {
    const { age, zipCode, state, chronicConditions, annualDoctorVisits, prescriptionCount, income } = req.body

    const result = await calculateEnhancedComparison(
      {
        age,
        zipCode,
        state,
        chronicConditions: chronicConditions || [],
        annualDoctorVisits: annualDoctorVisits || 4,
        prescriptionCount: prescriptionCount || 2,
      },
      {
        income: income || 50000,
        useApiData: true,
      }
    )

    res.json({
      success: true,
      data: result,
      meta: {
        dataSource: result.dataSource,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Comparison calculation error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to calculate comparison',
      message: error.message,
    })
  }
})

export default router
```

## Testing Examples

```typescript
// Test API connection
import { getHealthcareGovClient } from './services/healthcareGov.service'

async function testApiConnection() {
  try {
    const client = getHealthcareGovClient()
    const response = await client.searchPlans({
      household: {
        income: 50000,
        people: [{ age: 30 }],
      },
      place: {
        state: 'NC',
        countyfips: '37063',
        zipcode: '27701',
      },
      market: 'Individual',
      limit: 1,
    })

    console.log('✅ API connection successful')
    console.log(`Found ${response.total} plans`)
    return true
  } catch (error) {
    console.error('❌ API connection failed:', error)
    return false
  }
}

testApiConnection()
```

## Best Practices

1. **Always enable caching** in production to reduce API calls
2. **Handle errors gracefully** with fallback to estimates
3. **Validate ZIP codes** before making API requests
4. **Log API usage** for monitoring rate limits
5. **Update county FIPS mappings** for accurate results
6. **Display data attribution** as required by Healthcare.gov

---

For more information, see the [full integration guide](/docs/HEALTHCARE_GOV_API_INTEGRATION.md).
