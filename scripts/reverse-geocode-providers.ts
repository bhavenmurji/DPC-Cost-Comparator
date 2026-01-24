import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Google Maps API key from environment
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const RETRY_DELAY = 5000; // 5 seconds on rate limit
const MAX_RETRIES = 3;

interface GeocodeResult {
  success: boolean;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  error?: string;
}

interface Stats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: { providerId: string; error: string }[];
  samples: Array<{
    id: string;
    name: string;
    originalAddress: string;
    newAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }>;
}

/**
 * Reverse geocode a lat/lng to get address components
 */
async function reverseGeocode(lat: number, lng: number, retryCount = 0): Promise<GeocodeResult> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await axios.get(url, {
      timeout: 10000,
    });

    if (response.data.status === 'OVER_QUERY_LIMIT') {
      if (retryCount < MAX_RETRIES) {
        console.log(`Rate limited, waiting ${RETRY_DELAY}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return reverseGeocode(lat, lng, retryCount + 1);
      }
      return { success: false, error: 'Rate limit exceeded after retries' };
    }

    if (response.data.status !== 'OK' || !response.data.results.length) {
      return { success: false, error: `Geocoding failed: ${response.data.status}` };
    }

    const result = response.data.results[0];
    const components = result.address_components;

    // Extract address components
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zipCode = '';

    for (const component of components) {
      const types = component.types;

      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('locality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    }

    // Build full address
    const address = `${streetNumber} ${route}`.trim() || result.formatted_address.split(',')[0];

    return {
      success: true,
      address,
      city,
      state,
      zipCode,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      if (retryCount < MAX_RETRIES) {
        console.log(`Rate limited (429), waiting ${RETRY_DELAY}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return reverseGeocode(lat, lng, retryCount + 1);
      }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main execution function
 */
async function main() {
  console.log('='.repeat(80));
  console.log('DPC Provider Reverse Geocoding');
  console.log('='.repeat(80));
  console.log();

  const stats: Stats = {
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    samples: [],
  };

  try {
    // Get all providers with lat/lng
    console.log('Fetching providers from database...');
    const providers = await prisma.dPCProvider.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        npi: true,
        name: true,
        practiceName: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        latitude: true,
        longitude: true,
      },
    });

    stats.total = providers.length;
    console.log(`Found ${stats.total} providers with coordinates`);
    console.log();

    // Process each provider
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const progress = `[${i + 1}/${stats.total}]`;

      // Skip if already has REAL complete address data (not placeholder data)
      const hasRealAddress = provider.city && provider.city !== 'Unknown' &&
                             provider.state && provider.state !== 'XX' &&
                             provider.zipCode && provider.zipCode !== '00000' &&
                             provider.address && provider.address !== 'Unknown' && provider.address !== 'Address not available';

      if (hasRealAddress) {
        console.log(`${progress} SKIP: ${provider.practiceName} (already has complete address)`);
        stats.skipped++;
        continue;
      }

      console.log(`${progress} Processing: ${provider.practiceName}`);
      console.log(`  Current: ${provider.address}, ${provider.city}, ${provider.state} ${provider.zipCode}`);
      console.log(`  Coords: ${provider.latitude}, ${provider.longitude}`);

      // Reverse geocode
      const result = await reverseGeocode(provider.latitude!, provider.longitude!);

      if (result.success) {
        // Update database
        try {
          await prisma.dPCProvider.update({
            where: { id: provider.id },
            data: {
              address: result.address || provider.address,
              city: result.city || provider.city,
              state: result.state || provider.state,
              zipCode: result.zipCode || provider.zipCode,
            },
          });

          console.log(`  ✓ Updated: ${result.address}, ${result.city}, ${result.state} ${result.zipCode}`);
          stats.successful++;

          // Save first 10 samples
          if (stats.samples.length < 10) {
            stats.samples.push({
              id: provider.id,
              name: provider.practiceName,
              originalAddress: `${provider.address}, ${provider.city}, ${provider.state} ${provider.zipCode}`,
              newAddress: result.address || '',
              city: result.city || '',
              state: result.state || '',
              zipCode: result.zipCode || '',
            });
          }
        } catch (dbError) {
          const errorMsg = dbError instanceof Error ? dbError.message : 'Database update failed';
          console.log(`  ✗ Database error: ${errorMsg}`);
          stats.failed++;
          stats.errors.push({ providerId: provider.id, error: errorMsg });
        }
      } else {
        console.log(`  ✗ Geocoding failed: ${result.error}`);
        stats.failed++;
        stats.errors.push({ providerId: provider.id, error: result.error || 'Unknown error' });
      }

      stats.processed++;

      // Log progress every 100 providers
      if ((i + 1) % 100 === 0) {
        console.log();
        console.log('='.repeat(80));
        console.log(`PROGRESS UPDATE - ${i + 1}/${stats.total} providers processed`);
        console.log(`  Successful: ${stats.successful}`);
        console.log(`  Failed: ${stats.failed}`);
        console.log(`  Skipped: ${stats.skipped}`);
        console.log('='.repeat(80));
        console.log();
      }

      // Rate limiting - wait 1 second between requests
      if (i < providers.length - 1) {
        await sleep(RATE_LIMIT_DELAY);
      }
    }

    // Generate report
    await generateReport(stats);

  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Generate final report
 */
async function generateReport(stats: Stats) {
  console.log();
  console.log('='.repeat(80));
  console.log('REVERSE GEOCODING COMPLETE');
  console.log('='.repeat(80));
  console.log();
  console.log(`Total providers: ${stats.total}`);
  console.log(`Processed: ${stats.processed}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Success rate: ${((stats.successful / stats.processed) * 100).toFixed(2)}%`);
  console.log();

  const successRate = (stats.successful / stats.processed) * 100;
  const passedCriteria = successRate >= 95;

  const report = `# Reverse Geocoding Report

**Generated:** ${new Date().toISOString()}

## Summary

- **Total Providers:** ${stats.total}
- **Processed:** ${stats.processed}
- **Successful:** ${stats.successful}
- **Failed:** ${stats.failed}
- **Skipped:** ${stats.skipped} (already had complete address data)
- **Success Rate:** ${successRate.toFixed(2)}%
- **Success Criteria Met (≥95%):** ${passedCriteria ? '✓ YES' : '✗ NO'}

## Sample Enriched Data (First 10)

${stats.samples.map((sample, i) => `
### ${i + 1}. ${sample.name}

- **Provider ID:** ${sample.id}
- **Original Address:** ${sample.originalAddress}
- **New Address:** ${sample.newAddress}
- **City:** ${sample.city}
- **State:** ${sample.state}
- **ZIP Code:** ${sample.zipCode}
`).join('\n')}

## Errors Encountered

${stats.errors.length > 0 ? stats.errors.map((err, i) => `
${i + 1}. **Provider ID:** ${err.providerId}
   - **Error:** ${err.error}
`).join('\n') : 'No errors encountered.'}

## API Configuration

- **API:** Google Maps Geocoding API
- **Rate Limit:** 1 request per second
- **Retry Policy:** Up to 3 retries with 5-second delays on rate limits
- **Total API Calls:** ${stats.successful + stats.failed}
- **Estimated Runtime:** ${Math.floor((stats.successful + stats.failed) * RATE_LIMIT_DELAY / 1000 / 60)} minutes

## Database Updates

All successful geocoding results were written to the \`DPCProvider\` table with the following fields updated:
- \`address\`
- \`city\`
- \`state\`
- \`zipCode\`

## Next Steps

${passedCriteria ? `
✓ Geocoding successful! At least 95% of providers now have complete address data.

You can verify the data with:
\`\`\`sql
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN city IS NOT NULL AND state IS NOT NULL AND zipCode IS NOT NULL THEN 1 END) as complete,
  COUNT(CASE WHEN city IS NULL OR state IS NULL OR zipCode IS NULL THEN 1 END) as incomplete
FROM dpc_providers
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
\`\`\`
` : `
⚠ Success rate below 95% threshold. Consider:
1. Investigating failed providers (see errors above)
2. Manually verifying coordinates for failed entries
3. Re-running geocoding for failed providers only
4. Checking API key quotas and limits
`}

## Cost Estimate

- **API Calls Made:** ${stats.successful + stats.failed}
- **Google Maps Geocoding API:** $5.00 per 1,000 requests
- **Estimated Cost:** $${(((stats.successful + stats.failed) / 1000) * 5).toFixed(2)}

---
*Report generated by reverse-geocode-providers.ts*
`;

  const fs = await import('fs');
  const path = await import('path');
  const url = await import('url');

  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const reportPath = path.join(__dirname, '..', 'docs', 'REVERSE_GEOCODING_REPORT.md');

  // Ensure docs directory exists
  const docsDir = path.dirname(reportPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, report);
  console.log(`Report written to: ${reportPath}`);
}

// Run the script
main()
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
