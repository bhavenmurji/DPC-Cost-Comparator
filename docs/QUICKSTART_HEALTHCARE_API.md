# Healthcare.gov API Quick Start Guide

## Get Real Insurance Data in 5 Minutes

This quick start guide will help you integrate real insurance plan data from Healthcare.gov into your DPC Cost Comparator.

## Step 1: Register for API Key (2 minutes)

1. Go to: https://developer.cms.gov/marketplace-api/key-request.html
2. Fill out the form:
   - **Name**: Your name
   - **Email**: Your email address
   - **Organization**: Your company/project name
   - **Use Case**: "Healthcare cost comparison tool"
   - **Expected Volume**: "Low (<1000 requests/day)"
3. Accept terms and submit
4. Check your email for the API key (usually arrives within 1-2 business days)

## Step 2: Configure Environment (1 minute)

1. Open your `.env` file
2. Add your API key:

```bash
HEALTHCARE_GOV_API_KEY=your_actual_api_key_here
```

That's it! The other variables have sensible defaults.

## Step 3: Restart Your Server (30 seconds)

```bash
npm run dev
```

You should see:
```
✅ Healthcare.gov API client initialized successfully
   Base URL: https://marketplace.api.healthcare.gov
   Caching: Enabled
```

## Step 4: Test It Out (1 minute)

Make a request to your comparison endpoint:

```bash
curl -X POST http://localhost:3000/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "zipCode": "27701",
    "state": "NC",
    "chronicConditions": [],
    "annualDoctorVisits": 4,
    "prescriptionCount": 2
  }'
```

Check the response for `dataSource`:

```json
{
  "dataSource": {
    "traditional": "api",
    "catastrophic": "api",
    "lastUpdated": "2024-10-30T..."
  }
}
```

If you see `"api"`, you're using real Healthcare.gov data! 🎉

## What If I Don't Have an API Key Yet?

No problem! The system automatically falls back to estimates:

```json
{
  "dataSource": {
    "traditional": "estimate",
    "catastrophic": "estimate"
  }
}
```

Your application will work the same way, but with estimated costs instead of real marketplace data.

## Common Issues

### Issue: Still seeing "estimate" even with API key

**Check**:
1. API key is in `.env` file (not `.env.example`)
2. Server was restarted after adding the key
3. No typos in `HEALTHCARE_GOV_API_KEY` variable name
4. API key doesn't have extra quotes or spaces

### Issue: Getting 401 Unauthorized errors

**Solution**: Your API key might be expired or invalid. Request a new one.

### Issue: No plans found for my ZIP code

**Solution**: Add ZIP to county FIPS mapping in `healthcareGovTransformer.ts`:

```typescript
const COUNTY_FIPS_BY_ZIP: Record<string, string> = {
  '27701': '37063', // Your ZIP: County FIPS
}
```

Find county FIPS codes at: https://www.census.gov/library/reference/code-lists/ansi.html

## Next Steps

- Read the full integration guide: `/docs/HEALTHCARE_GOV_API_INTEGRATION.md`
- Run tests: `npm test tests/integration/healthcareGovApi.test.ts`
- Customize cost calculations in `costComparisonEnhanced.service.ts`
- Add more ZIP code mappings for your target markets

## Support

- API Documentation: https://developer.cms.gov/marketplace-api/
- Request API Key: https://developer.cms.gov/marketplace-api/key-request.html
- Support Email: marketplace-api@cms-provider-directory.uservoice.com

## Benefits of Using Real API Data

✅ **Accurate premiums** based on location and age
✅ **Real deductibles and copays** from actual plans
✅ **Subsidy calculations** (APTC/CSR) for eligible users
✅ **Plan quality ratings** and issuer information
✅ **Current year data** updated annually
✅ **Free to use** for cost comparison tools

Enjoy more accurate cost comparisons with real marketplace data!
