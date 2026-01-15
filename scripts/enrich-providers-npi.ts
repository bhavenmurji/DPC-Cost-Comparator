#!/usr/bin/env npx tsx
/**
 * Provider Enrichment Script
 *
 * Enriches DPC provider records with real data from NPI Registry
 * Uses reverse geocoding to convert coordinates → city/state/ZIP
 * Then queries NPI Registry for matching providers
 *
 * Usage:
 *   npx tsx scripts/enrich-providers-npi.ts           # Enrich all eligible providers
 *   npx tsx scripts/enrich-providers-npi.ts --limit 10  # Test with 10 providers
 *   npx tsx scripts/enrich-providers-npi.ts --batch 5   # Process in batches of 5
 */

import { getProviderEnrichmentService } from '../apps/api/src/services/providerEnrichment.service'

async function main() {
  const args = process.argv.slice(2)
  const limit = getArgValue(args, '--limit')
  const batchSize = getArgValue(args, '--batch') || 10
  const skipIfHasData = !args.includes('--force')

  console.log('═══════════════════════════════════════════════════════')
  console.log('  DPC Provider NPI Enrichment')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Limit: ${limit || 'all eligible providers'}`)
  console.log(`  Batch size: ${batchSize}`)
  console.log(`  Skip if has data: ${skipIfHasData}`)
  console.log('═══════════════════════════════════════════════════════\n')

  const enrichmentService = getProviderEnrichmentService()

  const startTime = Date.now()

  try {
    const stats = await enrichmentService.enrichAllProviders({
      limit: limit ? parseInt(String(limit), 10) : undefined,
      batchSize: parseInt(String(batchSize), 10),
      skipIfHasData,
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    console.log('\n═══════════════════════════════════════════════════════')
    console.log('  Enrichment Complete')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`  Total providers: ${stats.total}`)
    console.log(`  Processed: ${stats.processed}`)
    console.log(`  Successfully enriched: ${stats.enriched}`)
    console.log(`  Locations resolved: ${stats.locationResolved}`)
    console.log(`  NPI matched: ${stats.npiMatched}`)
    console.log(`  Failed: ${stats.failed}`)
    console.log(`  Duration: ${duration}s`)

    if (stats.errors.length > 0) {
      console.log('\n  Errors:')
      stats.errors.slice(0, 10).forEach((err) => console.log(`    - ${err}`))
      if (stats.errors.length > 10) {
        console.log(`    ... and ${stats.errors.length - 10} more`)
      }
    }

    console.log('═══════════════════════════════════════════════════════\n')

    process.exit(stats.failed > 0 && stats.enriched === 0 ? 1 : 0)
  } catch (error) {
    console.error('\n❌ Enrichment failed:', error)
    process.exit(1)
  }
}

function getArgValue(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag)
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1]
  }
  return undefined
}

main()
