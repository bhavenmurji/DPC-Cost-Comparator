#!/usr/bin/env npx tsx

/**
 * Practice Website Fee Extractor CLI
 *
 * Scrapes individual practice websites to extract membership fees.
 *
 * Usage:
 *   npm run scrape:fees              # Extract fees for providers without them
 *   npm run scrape:fees -- --all     # Re-extract for all providers
 *   npm run scrape:fees -- --dry-run # Preview without updating
 *   npm run scrape:fees -- --help
 */

import { practiceWebsiteScraper } from '../apps/api/src/services/practiceWebsiteScraper.service'

interface CLIOptions {
  limit?: number
  start?: number
  dryRun?: boolean
  all?: boolean
  report?: boolean
  help?: boolean
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      options.help = true
    } else if (arg === '--dry-run' || arg === '-d') {
      options.dryRun = true
    } else if (arg === '--all' || arg === '-a') {
      options.all = true
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10)
    } else if (arg === '--start' || arg === '-s') {
      options.start = parseInt(args[++i], 10)
    } else if (arg === '--report' || arg === '-r') {
      options.report = true
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
Practice Website Fee Extractor
==============================

Extracts membership fees from individual DPC practice websites.

Usage:
  npm run scrape:fees [options]

Options:
  -h, --help          Show this help message
  -l, --limit <n>     Limit the number of providers to process
  -s, --start <n>     Start from a specific index
  -d, --dry-run       Preview extraction without updating database
  -a, --all           Process all providers (not just those without fees)
  -r, --report        Show fee extraction statistics only

Extraction Process:
  1. Fetches the practice homepage
  2. Checks meta tags (og:description, description)
  3. Scans page title and headers (H1, H2, H3)
  4. Tries common pricing pages (/pricing, /membership, /fees, etc.)
  5. Uses regex patterns to extract monthly/annual/enrollment fees

Pricing Patterns Detected:
  - "$99/month", "$150/mo", "$99 per month"
  - "$1,200/year", "$1000 annually"
  - "enrollment fee: $100", "one-time fee: $50"
  - "family: $250/month", "household: $300"

Examples:
  npm run scrape:fees                     # Extract for providers without fees
  npm run scrape:fees -- --all            # Re-extract for all providers
  npm run scrape:fees -- --limit 20       # Process only 20 providers
  npm run scrape:fees -- --dry-run        # Preview without changes
  npm run scrape:fees -- --report         # Show statistics

Estimated Times:
  10 providers:  ~1 minute
  50 providers:  ~5 minutes
  100 providers: ~10 minutes

Note: Run this AFTER scraping the DPCA directory and running the matcher.
`)
}

async function main(): Promise<void> {
  const options = parseArgs()

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  console.log('='.repeat(60))
  console.log('Practice Website Fee Extractor')
  console.log('='.repeat(60))
  console.log()

  try {
    if (options.report) {
      console.log('Generating fee report...\n')
      const report = await practiceWebsiteScraper.generateFeeReport()

      console.log('Fee Extraction Statistics:')
      console.log(`  Total DPCA providers:  ${report.totalDPCA}`)
      console.log(`  With website:          ${report.withWebsite}`)
      console.log(`  With fees:             ${report.withFees}`)
      console.log(`  Without fees:          ${report.withoutFees}`)
      console.log()
      console.log('Fee Range:')
      console.log(`  Min:  $${report.feeRange.min}/month`)
      console.log(`  Max:  $${report.feeRange.max}/month`)
      console.log(`  Avg:  $${report.feeRange.avg.toFixed(2)}/month`)

      process.exit(0)
    }

    const result = await practiceWebsiteScraper.extractPricingForAllProviders({
      limit: options.limit,
      startFrom: options.start,
      dryRun: options.dryRun,
      onlyWithoutFees: !options.all,
    })

    console.log()
    console.log('='.repeat(60))
    console.log('Summary')
    console.log('='.repeat(60))
    console.log(`  Success:  ${result.success}`)
    console.log(`  Failed:   ${result.failed}`)
    console.log(`  Skipped:  ${result.skipped}`)
    console.log(`  Total:    ${result.total}`)
    console.log()

    if (options.dryRun) {
      console.log('(Dry run - no changes were made to the database)')
    }

    // Show confidence breakdown
    const confidenceLevels: Record<string, number> = {}
    for (const r of result.results) {
      if (r.success && r.pricing) {
        const level = r.pricing.confidence
        confidenceLevels[level] = (confidenceLevels[level] || 0) + 1
      }
    }

    if (Object.keys(confidenceLevels).length > 0) {
      console.log('\nConfidence Breakdown:')
      for (const [level, count] of Object.entries(confidenceLevels)) {
        console.log(`  ${level}: ${count}`)
      }
    }

    // Show source breakdown
    const sources: Record<string, number> = {}
    for (const r of result.results) {
      if (r.success && r.pricing) {
        sources[r.pricing.source] = (sources[r.pricing.source] || 0) + 1
      }
    }

    if (Object.keys(sources).length > 0) {
      console.log('\nSource Breakdown:')
      for (const [source, count] of Object.entries(sources)) {
        console.log(`  ${source}: ${count}`)
      }
    }

    process.exit(result.failed > result.success ? 1 : 0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
