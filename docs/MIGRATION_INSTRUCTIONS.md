# Database Migration Instructions

## Overview

This guide walks you through migrating from mock provider data to real database queries with geographic distance calculations.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 20+ and npm 10+
- Database connection configured in `.env`

## Step-by-Step Migration

### Step 1: Verify Database Connection

Ensure your `.env` file has the correct database URL:

```bash
# /home/bmurji/Development/DPC-Cost-Comparator/.env
DATABASE_URL="postgresql://username:password@localhost:5432/dpc_comparator"
```

Test the connection:

```bash
cd apps/api
npx prisma db pull
```

### Step 2: Run Database Migrations

Apply the database schema:

```bash
cd apps/api
npx prisma migrate dev --name add_provider_coordinates
```

If you have the standalone SQL migration file:

```bash
psql $DATABASE_URL -f prisma/migrations/add_provider_coordinates.sql
```

### Step 3: Seed Provider Data

Populate the database with sample providers:

```bash
cd /home/bmurji/Development/DPC-Cost-Comparator
npx tsx scripts/seed-providers.ts
```

Expected output:
```
Starting DPC provider seeding...
Created provider: Dr. Sarah Johnson in Austin, TX
Created provider: Dr. Michael Chen in Lakeway, TX
...
Provider seeding complete!

Summary:
Total providers: 10
Providers with coordinates: 10
Providers by state:
  TX: 5
  CA: 2
  NY: 1
  FL: 2
```

### Step 4: Add Coordinates to Existing Providers (Optional)

If you have existing providers without coordinates, you'll need to geocode them.

Option A: Manual SQL Update (for small datasets):

```sql
-- Example: Update specific provider
UPDATE dpc_providers
SET latitude = 30.2672, longitude = -97.7431
WHERE npi = '1234567890';
```

Option B: Use Geocoding Service (recommended for production):

```typescript
// Create /home/bmurji/Development/DPC-Cost-Comparator/scripts/geocode-existing-providers.ts
import { PrismaClient } from '@prisma/client'
// Import your geocoding service (Google Maps, Mapbox, etc.)

const prisma = new PrismaClient()

async function geocodeProviders() {
  const providers = await prisma.dPCProvider.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    }
  })

  console.log(`Found ${providers.length} providers without coordinates`)

  for (const provider of providers) {
    try {
      // Use your geocoding service here
      // const coords = await geocodeAddress(...)

      // await prisma.dPCProvider.update({
      //   where: { id: provider.id },
      //   data: { latitude: coords.lat, longitude: coords.lng }
      // })

      console.log(`Geocoded: ${provider.practiceName}`)
    } catch (error) {
      console.error(`Failed to geocode ${provider.practiceName}:`, error)
    }
  }
}

geocodeProviders()
```

### Step 5: Switch from Mock to Real Data

Update your environment configuration:

```bash
# .env
USE_MOCK_DATA=false  # Changed from true
```

Or remove the variable entirely (defaults to using database).

### Step 6: Verify Integration

Run the integration tests:

```bash
npm run test:integration tests/integration/providerSearch.test.ts
```

Expected output:
```
✓ Repository Layer
  ✓ should find providers by location
  ✓ should filter by monthly fee
  ✓ should filter by specialties
  ✓ should calculate distances accurately
✓ Service Layer
  ✓ should find matching providers with scoring
  ✓ should prioritize closer providers
```

### Step 7: Test API Endpoints

Start the API server:

```bash
npm run dev:api
```

Test the provider search endpoint:

```bash
curl http://localhost:3001/api/providers/search \
  -H "Content-Type: application/json" \
  -d '{
    "zipCode": "78701",
    "state": "TX",
    "maxDistanceMiles": 25
  }'
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "provider": {
        "id": "...",
        "name": "Dr. Sarah Johnson",
        "practiceName": "Austin Family DPC",
        "city": "Austin",
        "state": "TX",
        "monthlyFee": 75
      },
      "distanceMiles": 0.0,
      "matchScore": 95,
      "matchReasons": [
        "Very close to your location",
        "Currently accepting new patients",
        "Affordable monthly fee"
      ]
    }
  ]
}
```

## Verification Checklist

- [ ] Database connection successful
- [ ] Migrations applied without errors
- [ ] Sample providers seeded (at least 10)
- [ ] All providers have valid coordinates
- [ ] Integration tests passing
- [ ] API endpoint returns real data (not mock)
- [ ] Distance calculations are accurate
- [ ] Match scoring works correctly

## Troubleshooting

### Issue: "Database connection failed"

**Solution**: Verify PostgreSQL is running and credentials are correct:

```bash
pg_isready
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: "Table dpc_providers does not exist"

**Solution**: Run Prisma migrations:

```bash
cd apps/api
npx prisma migrate dev
```

### Issue: "No providers found in search"

**Possible causes:**
1. Database is empty - run seed script
2. Search radius too small - increase maxDistanceMiles
3. Coordinates are missing - run geocoding script
4. State filter mismatch - check state codes (TX, CA, etc.)

**Debugging query:**

```sql
-- Check providers in database
SELECT id, practice_name, city, state, zipcode,
       latitude, longitude, accepting_patients
FROM dpc_providers
WHERE state = 'TX'
LIMIT 10;
```

### Issue: "Distances are incorrect"

**Solution**: Verify coordinates are valid:

```sql
-- Check for invalid coordinates
SELECT id, practice_name, latitude, longitude
FROM dpc_providers
WHERE latitude IS NOT NULL
  AND (latitude < -90 OR latitude > 90
       OR longitude < -180 OR longitude > 180);
```

### Issue: "Performance is slow"

**Solution**: Ensure indexes are created:

```sql
-- Verify indexes
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE tablename = 'dpc_providers';
```

If missing, run:

```sql
CREATE INDEX idx_dpc_providers_coordinates
ON dpc_providers(latitude, longitude);

CREATE INDEX idx_dpc_providers_state_zip
ON dpc_providers(state, zipcode);
```

## Rollback Plan

If you need to revert to mock data:

1. Set environment variable:
   ```bash
   USE_MOCK_DATA=true
   ```

2. Restart the API server:
   ```bash
   npm run dev:api
   ```

The system will automatically fall back to mock data generation.

## Performance Optimization

### Enable Query Logging

Add to Prisma client initialization:

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
```

### Monitor Query Performance

```sql
-- Enable query timing
\timing on

-- Run test query
EXPLAIN ANALYZE
SELECT * FROM dpc_providers
WHERE latitude BETWEEN 30.0 AND 31.0
  AND longitude BETWEEN -98.0 AND -97.0
  AND accepting_patients = true
LIMIT 10;
```

### Add Database Connection Pooling

Already configured in `/home/bmurji/Development/DPC-Cost-Comparator/src/backend/database/connection.ts`:

```typescript
max: config.database.maxConnections, // Default: 10
idleTimeoutMillis: config.database.idleTimeoutMillis, // Default: 30000
```

## Next Steps

After successful migration:

1. **Add Real Geocoding**: Replace `estimateCoordinatesFromZip` with Google Maps or Mapbox API
2. **Implement Caching**: Add Redis for frequently searched locations
3. **Enable PostGIS**: For advanced geographic queries
4. **Add Monitoring**: Track query performance with Datadog/New Relic
5. **Implement Rate Limiting**: Protect search endpoints

## Production Deployment

Before deploying to production:

1. ✅ All tests passing
2. ✅ Database migrations tested in staging
3. ✅ Coordinates validated for all providers
4. ✅ Performance benchmarks met (<100ms for searches)
5. ✅ Error handling and logging configured
6. ✅ Monitoring and alerts set up
7. ✅ Backup and restore procedures documented

## Support

For issues or questions:
- Review `/home/bmurji/Development/DPC-Cost-Comparator/docs/database-integration-guide.md`
- Check integration tests for examples
- Review API logs for error details
