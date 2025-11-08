# Healthcare.gov API Integration Guide

## Overview

This document provides comprehensive instructions for integrating the Healthcare.gov Marketplace API into the DPC Cost Comparator application to retrieve real insurance plan data and premium calculations.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [API Key Registration](#api-key-registration)
3. [Environment Configuration](#environment-configuration)
4. [Service Architecture](#service-architecture)
5. [Usage Examples](#usage-examples)
6. [Error Handling](#error-handling)
7. [Caching Strategy](#caching-strategy)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ installed
- Healthcare.gov API key (free registration)
- Valid ZIP code to county FIPS code mapping
- Understanding of TypeScript and async/await patterns

## API Key Registration

### Step 1: Request API Key

1. Visit the CMS Developer Portal: https://developer.cms.gov/marketplace-api/key-request.html
2. Fill out the API key request form with:
   - Your name and email
   - Organization name
   - Intended use case (e.g., "Healthcare cost comparison tool")
   - Expected request volume
3. Accept the terms of service
4. Submit the form

You will receive your API key via email within 1-2 business days.

### Step 2: Verify API Access

Once you receive your API key, test it with a simple cURL request:

```bash
curl -X POST "https://marketplace.api.healthcare.gov/api/v1/plans/search?apikey=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "household": {
      "income": 50000,
      "people": [{"age": 30}]
    },
    "place": {
      "countyfips": "37063",
      "state": "NC",
      "zipcode": "27701"
    },
    "market": "Individual",
    "year": 2024
  }'
```

## Environment Configuration

### Step 1: Update `.env` File

Add the following variables to your `.env` file (copy from `.env.example` if needed):

```bash
# Healthcare.gov Marketplace API Configuration
HEALTHCARE_GOV_API_KEY=your_actual_api_key_here
HEALTHCARE_GOV_API_URL=https://marketplace.api.healthcare.gov
HEALTHCARE_GOV_API_TIMEOUT=10000
HEALTHCARE_GOV_CACHE_TTL=86400
HEALTHCARE_GOV_ENABLE_CACHE=true
```

### Step 2: Configuration Options

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `HEALTHCARE_GOV_API_KEY` | Your API key from CMS | None | Yes |
| `HEALTHCARE_GOV_API_URL` | Base API URL | `https://marketplace.api.healthcare.gov` | No |
| `HEALTHCARE_GOV_API_TIMEOUT` | Request timeout (ms) | `10000` | No |
| `HEALTHCARE_GOV_CACHE_TTL` | Cache time-to-live (seconds) | `86400` (24 hours) | No |
| `HEALTHCARE_GOV_ENABLE_CACHE` | Enable/disable caching | `true` | No |

## Service Architecture

### Core Components

1. **Type Definitions** (`healthcareGov.types.ts`)
   - Complete TypeScript interfaces for API requests/responses
   - Type-safe API interactions

2. **API Client Service** (`healthcareGov.service.ts`)
   - Singleton pattern for application-wide use
   - Automatic API key injection
   - Built-in caching mechanism
   - Comprehensive error handling

3. **Data Transformer** (`healthcareGovTransformer.ts`)
   - Converts our data models to API format
   - Extracts cost information from API responses
   - Handles ZIP to county FIPS mapping

4. **Enhanced Cost Comparison** (`costComparisonEnhanced.service.ts`)
   - Integrates API data with cost calculations
   - Automatic fallback to estimates when API unavailable
   - Data source tracking (API vs estimate)

### Data Flow

```
User Input (ZIP, age, etc.)
    ↓
ComparisonInput
    ↓
transformToPlanSearchRequest()
    ↓
Healthcare.gov API Client
    ↓
Cache Check → API Request → Response
    ↓
extractTraditionalCosts() / extractCatastrophicCosts()
    ↓
EnhancedComparisonResult
    ↓
User Display
```

## Usage Examples

### Basic Initialization

```typescript
import { initializeHealthcareGovClient } from './services/healthcareGov.service'

// Initialize the client (typically in app startup)
initializeHealthcareGovClient({
  apiKey: process.env.HEALTHCARE_GOV_API_KEY!,
  enableCache: true,
  cacheTTL: 86400, // 24 hours
})
```

### Search for Plans

```typescript
import { getHealthcareGovClient } from './services/healthcareGov.service'

const client = getHealthcareGovClient()

// Search for silver tier plans
const response = await client.searchPlans({
  household: {
    income: 50000,
    people: [
      {
        age: 30,
        aptc_eligible: true,
        uses_tobacco: false,
      },
    ],
  },
  place: {
    state: 'NC',
    countyfips: '37063',
    zipcode: '27701',
  },
  market: 'Individual',
  year: 2024,
  filter: {
    metal: ['silver'],
  },
  sort: 'premium',
  order: 'asc',
  limit: 10,
})

console.log(`Found ${response.total} plans`)
response.plans.forEach(plan => {
  console.log(`${plan.name}: $${plan.premium.premium}/month`)
})
```

### Search for Catastrophic Plans

```typescript
const catastrophicPlans = await client.searchCatastrophicPlans({
  household: {
    income: 40000,
    people: [{ age: 28 }],
  },
  place: {
    state: 'NC',
    countyfips: '37063',
    zipcode: '27701',
  },
  market: 'Individual',
  year: 2024,
})
```

### Get Plan Details

```typescript
const planDetails = await client.getPlanDetails({
  plan_id: '12345NC0123456-01',
  household: {
    income: 50000,
    people: [{ age: 30 }],
  },
  year: 2024,
})

console.log('Deductible:', planDetails.benefits.deductible.individual)
console.log('Max OOP:', planDetails.benefits.maximum_out_of_pocket.individual)
```

### Calculate Eligibility

```typescript
const eligibility = await client.getEligibilityEstimates({
  household: {
    income: 35000,
    people: [{ age: 30, aptc_eligible: true }],
  },
  place: {
    state: 'NC',
    countyfips: '37063',
    zipcode: '27701',
  },
  market: 'Individual',
  year: 2024,
})

console.log('APTC Amount:', eligibility.estimates.aptc)
console.log('CSR Variant:', eligibility.estimates.csr)
console.log('FPL Percentage:', eligibility.estimates.fpl_percent)
```

### Enhanced Cost Comparison

```typescript
import { calculateEnhancedComparison } from './services/costComparisonEnhanced.service'

const result = await calculateEnhancedComparison(
  {
    age: 30,
    zipCode: '27701',
    state: 'NC',
    chronicConditions: ['diabetes'],
    annualDoctorVisits: 6,
    prescriptionCount: 3,
  },
  {
    income: 50000,
    year: 2024,
    useApiData: true, // Use real API data
  }
)

console.log('Data Sources:')
console.log('- Traditional:', result.dataSource.traditional)
console.log('- Catastrophic:', result.dataSource.catastrophic)
console.log('Annual Savings:', result.annualSavings)
console.log('Recommended Plan:', result.recommendedPlan)
```

## Error Handling

### Common Error Scenarios

1. **Missing API Key**
```typescript
try {
  const client = new HealthcareGovApiClient({ apiKey: '' })
} catch (error) {
  // Error: "Healthcare.gov API key is required"
}
```

2. **Invalid Request Parameters**
```typescript
try {
  await client.searchPlans({ /* invalid params */ })
} catch (error) {
  if (error.status === 400) {
    console.error('Invalid request:', error.message)
  }
}
```

3. **Rate Limiting**
```typescript
try {
  await client.searchPlans(request)
} catch (error) {
  if (error.status === 429) {
    console.error('Rate limit exceeded, retry after:', error.details)
  }
}
```

4. **API Timeout**
```typescript
try {
  await client.searchPlans(request)
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Request timeout, falling back to estimates')
    // Use fallback logic
  }
}
```

### Graceful Fallback

The enhanced cost comparison service automatically falls back to estimates when the API is unavailable:

```typescript
const result = await calculateEnhancedComparison(input, {
  useApiData: true, // Will fallback to estimates on error
})

// Check data source
if (result.dataSource.traditional === 'estimate') {
  console.warn('Using estimated data - API unavailable')
}
```

## Caching Strategy

### How Caching Works

1. **In-Memory Cache**: Plans and responses are cached in memory
2. **Cache Keys**: Generated from request parameters (JSON stringified)
3. **TTL**: Default 24 hours (plans don't change daily)
4. **Cache Invalidation**: Automatic expiration after TTL

### Cache Management

```typescript
const client = getHealthcareGovClient()

// Get cache statistics
const stats = client.getCacheStats()
console.log('Cache size:', stats.size)
console.log('Cached keys:', stats.keys)

// Clear cache manually
client.clearCache()
```

### Disable Caching (for testing)

```typescript
const client = new HealthcareGovApiClient({
  apiKey: process.env.HEALTHCARE_GOV_API_KEY!,
  enableCache: false, // Disable caching
})
```

## Testing

### Run Integration Tests

```bash
# Run all tests
npm test

# Run Healthcare.gov API tests specifically
npm test tests/integration/healthcareGovApi.test.ts

# Run enhanced cost comparison tests
npm test tests/integration/costComparisonEnhanced.test.ts
```

### Test Coverage

Tests include:
- Client initialization and configuration
- Plan search functionality
- Catastrophic plan search
- Error handling scenarios
- Caching behavior
- Data transformation
- Cost calculations
- Fallback logic

### Mock Testing

Tests use mocked API responses to avoid hitting the real API:

```typescript
import { vi } from 'vitest'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = axios as any

mockedAxios.create.mockReturnValue({
  post: vi.fn().mockResolvedValue({ data: mockResponse }),
  // ...
})
```

## Troubleshooting

### Issue: API Key Not Working

**Symptoms**: 401 Unauthorized errors

**Solutions**:
1. Verify API key is correct in `.env` file
2. Check that key hasn't expired
3. Ensure no extra whitespace in key
4. Request new key if needed

### Issue: County FIPS Code Not Found

**Symptoms**: Empty results or "Invalid location" errors

**Solutions**:
1. Add ZIP to county mapping in `healthcareGovTransformer.ts`
2. Use Census Bureau Geocoding API for lookup
3. Check ZIP code is valid 5-digit format

### Issue: No Plans Returned

**Symptoms**: `plans: []` in response

**Solutions**:
1. Verify location has marketplace coverage
2. Check year is valid (current or next enrollment year)
3. Adjust filter criteria (metal level, plan type)
4. Try `catastrophic_override: true` for young adults

### Issue: Rate Limit Exceeded

**Symptoms**: 429 status code

**Solutions**:
1. Enable caching to reduce API calls
2. Increase cache TTL
3. Implement request queuing
4. Contact CMS for higher rate limits

### Issue: Cache Not Working

**Symptoms**: Multiple API calls for same request

**Solutions**:
1. Verify `HEALTHCARE_GOV_ENABLE_CACHE=true` in `.env`
2. Check cache TTL is reasonable (not 0)
3. Ensure request parameters are identical
4. Clear and reinitialize cache

## Rate Limits and Best Practices

### Rate Limits

- Healthcare.gov API rate limits are included in response headers
- Default limits vary by key tier
- Contact CMS for production tier limits

### Best Practices

1. **Enable Caching**: Always use caching in production
2. **Batch Requests**: Combine related requests when possible
3. **Error Handling**: Always handle errors gracefully with fallbacks
4. **Monitoring**: Log API usage and response times
5. **Attribution**: Display "Data provided by Healthcare.gov" as required
6. **Data Freshness**: Plans change annually - cache appropriately
7. **County Mapping**: Maintain accurate ZIP to county FIPS database

## Support and Resources

- **API Documentation**: https://developer.cms.gov/marketplace-api/
- **API Specification**: https://developer.cms.gov/marketplace-api/api-spec
- **Request API Key**: https://developer.cms.gov/marketplace-api/key-request.html
- **Support Email**: marketplace-api@cms-provider-directory.uservoice.com
- **Census FIPS Codes**: https://www.census.gov/library/reference/code-lists/ansi.html

## Data Attribution

When displaying plan data from Healthcare.gov, include the following attribution:

```html
<p>Plan data provided by <a href="https://www.healthcare.gov">Healthcare.gov</a></p>
```

## Next Steps

1. Register for API key
2. Configure environment variables
3. Test API connection with sample request
4. Update county FIPS mappings for your target markets
5. Run integration tests
6. Monitor API usage and performance
7. Implement error tracking and monitoring
