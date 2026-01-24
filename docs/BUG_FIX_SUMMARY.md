# Bug Fix Summary - Cost Calculator Not Working

**Date:** November 16, 2025
**Issue:** "Error: Failed to calculate comparison" when clicking "Compare Costs" button

---

## Problem Summary

The cost comparison calculator was returning a 400 Bad Request error when users submitted the form. The frontend appeared to work correctly, but the API was rejecting the requests.

---

## Root Cause

The API validation schema ([apps/api/src/validators/schemas.ts:113](../apps/api/src/validators/schemas.ts)) was using `.strict()` mode, which rejects any fields not explicitly defined in the schema. The frontend was sending two additional fields that weren't in the schema:

- `prescriptionCosts`
- `labTestCosts`

These fields come from the "Detailed Cost Analysis" feature in the [ComparisonForm component](../apps/web/src/components/ComparisonForm.tsx).

**Error message from API:**
```json
{
  "error": "Validation failed",
  "details": [{
    "field": "",
    "message": "Unrecognized key(s) in object: 'prescriptionCosts', 'labTestCosts'"
  }]
}
```

---

## Solution

Added the missing fields to the `ComparisonInputSchema` in [apps/api/src/validators/schemas.ts:115-121](../apps/api/src/validators/schemas.ts):

```typescript
// Advanced pricing fields (optional)
prescriptionCosts: moneySchema
  .max(10000, 'Prescription costs seem unreasonably high')
  .optional(),

labTestCosts: moneySchema
  .max(10000, 'Lab test costs seem unreasonably high')
  .optional(),
```

---

## Files Changed

1. **apps/api/src/validators/schemas.ts**
   - Added `prescriptionCosts` field (line 115-117)
   - Added `labTestCosts` field (line 119-121)

2. **apps/web/.env.local** (Created)
   - Added `VITE_API_URL=http://localhost:4000`
   - Added `VITE_GOOGLE_MAPS_API_KEY=[REDACTED - see .env]`
   - Note: Vite prefers `.env.local` over `.env` for local development

---

## Testing Results

**Before Fix:**
```
📤 Request: POST http://localhost:4000/api/comparison/calculate
📥 Response: 400 Bad Request
❌ Error: Validation failed
```

**After Fix:**
```
📤 Request: POST http://localhost:4000/api/comparison/calculate
📥 Response: 200 OK
✅ SUCCESS! Cost comparison completed
💰 Annual Savings: $3,944.00
📊 Traditional: $6,320/year
📊 DPC + Catastrophic: $2,376/year
🏥 Providers Found: 3
```

---

## How to Access the Application

1. **Frontend:** http://localhost:3002
2. **API:** http://localhost:4000
3. **API Health Check:** http://localhost:4000/health

---

## Sample Test Request

```bash
curl -X POST http://localhost:4000/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 32,
    "zipCode": "08000",
    "state": "NJ",
    "annualDoctorVisits": 4,
    "prescriptionCount": 1,
    "chronicConditions": [],
    "prescriptionCosts": 0,
    "labTestCosts": 0
  }'
```

---

## Key Learnings

1. **Strict Mode Validation:** When using Zod's `.strict()` mode, ALL fields sent from the frontend must be explicitly defined in the schema, even if they're optional.

2. **Vite Environment Variables:** Vite prefers `.env.local` over `.env` for local development. Always restart the Vite dev server after creating/modifying environment files.

3. **API Validation Errors:** 400 errors with validation messages indicate a schema mismatch between frontend and backend. Check the API logs for the exact error message.

4. **Mock Data Mode:** The API was running with `USE_MOCK_DATA=true` in [apps/api/.env](../apps/api/.env), which allows testing without a PostgreSQL database connection.

---

## Next Steps

The cost calculator is now fully functional! Users can:

- ✅ Enter their age, ZIP code, and state
- ✅ Specify doctor visits and prescription counts
- ✅ Select chronic conditions
- ✅ See detailed cost comparison between Traditional Insurance and DPC + Catastrophic
- ✅ View recommended DPC providers near them
- ✅ See annual savings calculations

**Ready for user testing!**
