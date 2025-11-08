-- Migration: Add geographic coordinates and indexes for DPC providers
-- This enables accurate distance-based searches using Haversine formula

-- Step 1: Ensure PostGIS extension is available (optional but recommended)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Step 2: Add indexes for geographic queries if not exist
CREATE INDEX IF NOT EXISTS idx_dpc_providers_coordinates
ON dpc_providers(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Step 3: Add index for state and zipcode combination
CREATE INDEX IF NOT EXISTS idx_dpc_providers_state_zip
ON dpc_providers(state, zipcode);

-- Step 4: Add index for accepting_patients
CREATE INDEX IF NOT EXISTS idx_dpc_providers_accepting
ON dpc_providers(accepting_patients)
WHERE accepting_patients = true;

-- Step 5: Add index for monthly_fee for cost filtering
CREATE INDEX IF NOT EXISTS idx_dpc_providers_monthly_fee
ON dpc_providers(monthly_fee);

-- Step 6: Add composite index for common queries
CREATE INDEX IF NOT EXISTS idx_dpc_providers_search
ON dpc_providers(state, accepting_patients, monthly_fee);

-- Step 7: Update existing providers without coordinates
-- (This is a placeholder - actual geocoding should be done via API or external script)
-- UPDATE dpc_providers
-- SET latitude = (geocode result), longitude = (geocode result)
-- WHERE latitude IS NULL AND longitude IS NULL;

-- Step 8: Add check constraints for valid coordinates
ALTER TABLE dpc_providers
ADD CONSTRAINT check_valid_latitude
CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE dpc_providers
ADD CONSTRAINT check_valid_longitude
CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Step 9: Create function for distance calculation (PostgreSQL with earthdistance)
-- Uncomment if earthdistance extension is available:
-- CREATE EXTENSION IF NOT EXISTS cube;
-- CREATE EXTENSION IF NOT EXISTS earthdistance;
--
-- CREATE OR REPLACE FUNCTION calculate_distance_miles(
--   lat1 DOUBLE PRECISION,
--   lon1 DOUBLE PRECISION,
--   lat2 DOUBLE PRECISION,
--   lon2 DOUBLE PRECISION
-- ) RETURNS DOUBLE PRECISION AS $$
--   SELECT (point(lon1, lat1) <@> point(lon2, lat2)) AS distance_miles;
-- $$ LANGUAGE SQL IMMUTABLE STRICT;

-- Step 10: Analyze tables for query optimization
ANALYZE dpc_providers;

-- Verification queries:
-- 1. Check providers with coordinates:
--    SELECT COUNT(*), COUNT(latitude), COUNT(longitude) FROM dpc_providers;
--
-- 2. Test geographic search:
--    SELECT id, practice_name, city, state,
--           latitude, longitude, monthly_membership_fee
--    FROM dpc_providers
--    WHERE latitude BETWEEN 30.0 AND 31.0
--      AND longitude BETWEEN -98.0 AND -97.0
--      AND accepting_patients = true
--    ORDER BY monthly_membership_fee
--    LIMIT 10;
