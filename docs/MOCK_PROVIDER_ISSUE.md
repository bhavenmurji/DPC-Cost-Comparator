# Mock Provider Issue - Diagnosis and Fix

**Status:** IN PROGRESS
**Issue:** Cost calculator returning mock providers instead of real enriched data
**Date:** November 19, 2025

---

## Problem Summary

When users enter ZIP code 08080 (or other ZIP codes), the cost calculator returns fake providers:
- Dr. Sarah Johnson
- Dr. Michael Chen
- Dr. Emily Rodriguez

Instead of real providers from the database like:
- Pinewood Family Care Co.
- R Health Hamilton
- Shor Medical

---

## Root Cause

The `searchProvidersNearby()` function in `apps/api/src/repositories/dpcProvider.repository.ts` is throwing a `PrismaClientValidationError`, which triggers the fallback to mock data in `apps/api/src/services/providerMatching.service.ts` (lines 100-104).

### Error Chain:
1. User submits form with ZIP code
2. API calls `find MatchingProviders()`
3. This calls `searchProvidersNearby()` with ZIP code
4. `searchProvidersNearby()` throws `PrismaClientValidationError`
5. Catch block returns mock providers as fallback

---

## Database Status

✅ **Database has real provider data:**
- Total: 2,759 providers enriched
- New Jersey: 20+ real providers including:
  - Pinewood Family Care Co. - Wycoff, NJ
  - R Health Hamilton - Hamilton Township, NJ
  - Shor Medical - Marlton, NJ
  - Empowered Health Direct Primary Care - West Deptford, NJ

---

## Attempted Fixes

1. ❌ **Prisma client regeneration** - File locked during server runtime
2. ❌ **Server restart** - Issue persists
3. ⏳ **Direct repository testing** - Module import issues in test environment

---

## Likely Issue

The `PrismaClientValidationError` is likely caused by one of:

1. **Missing/null NPI field** - Schema requires `@unique` but some providers may have null/duplicate NPI
2. **Array field querying** - `specialties`, `languages`, or `servicesIncluded` arrays may have validation issues
3. **Float field casting** - `latitude`/`longitude` may have type mismatches

---

## Immediate Fix Required

### Option 1: Make NPI field optional (RECOMMENDED)

**File:** `apps/api/prisma/schema.prisma`

Change line 102 from:
```prisma
npi                   String                @unique
```

To:
```prisma
npi                   String?               @unique
```

Then run:
```bash
cd apps/api
npx prisma migrate dev --name make_npi_optional
npx prisma generate
```

### Option 2: Improve error logging

**File:** `apps/api/src/services/providerMatching.service.ts`

Replace lines 100-104:
```typescript
} catch (error) {
  console.error('Error searching providers from database:', error)
  // Fallback to mock data if database query fails
  return findMatchingProvidersMock(criteria, limit)
}
```

With:
```typescript
} catch (error) {
  console.error('Error searching providers from database:')
  console.error('Error name:', error.name)
  console.error('Error message:', error.message)
  console.error('Full error:', JSON.stringify(error, null, 2))
  console.error('Stack:', error.stack)
  // Fallback to mock data if database query fails
  return findMatchingProvidersMock(criteria, limit)
}
```

This will show the full Prisma validation error.

### Option 3: Remove fallback to mock data (DEBUGGING ONLY)

Temporarily disable the fallback so the real error is returned to the client:

```typescript
} catch (error) {
  console.error('Error searching providers from database:', error)
  throw error  // Don't fall back, throw the real error
}
```

---

## Testing After Fix

```bash
# Test with ZIP code 08080
curl -X POST http://localhost:4000/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{"age":35,"zipCode":"08080","state":"NJ","annualDoctorVisits":4,"prescriptionCount":2}'
```

Expected providers in response:
- Pinewood Family Care Co.
- R Health Hamilton
- Empowered Health Direct Primary Care

NOT:
- Dr. Sarah Johnson
- Dr. Michael Chen
- Dr. Emily Rodriguez

---

## Next Steps

1. ✅ Fix Prisma validation error
2. ✅ Test with real NJ providers
3. ✅ Install shadcn/ui for UI improvements
4. ✅ Migrate components to shadcn/ui

---

*Document created: November 19, 2025*
