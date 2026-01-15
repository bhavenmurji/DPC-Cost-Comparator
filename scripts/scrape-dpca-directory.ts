#!/usr/bin/env npx tsx

/**
 * DPC Alliance Directory Scraper CLI
 *
 * Usage:
 *   npm run scrape:dpca              # Full scrape (~312 providers)
 *   npm run scrape:dpca:test         # Test with 10 providers
 *   npm run scrape:dpca -- --limit 50
 *   npm run scrape:dpca -- --start 100 --limit 50
 *   npm run scrape:dpca -- --help
 */

import { dpcAllianceScraper } from '../apps/api/src/services/dpcAllianceScraper.service'

interface CLIOptions {
  limit?: number
  start?: number
  help?: boolean
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2)
  const options: CLIOptions = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--help' || arg === '-h') {
      options.help = true
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10)
    } else if (arg === '--start' || arg === '-s') {
      options.start = parseInt(args[++i], 10)
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
DPC Alliance Directory Scraper
==============================

Scrapes physician data from the DPC Alliance directory at:
https://www.dpcalliance.org/find-a-dpc-physician/

Usage:
  npm run scrape:dpca [options]

Options:
  -h, --help          Show this help message
  -l, --limit <n>     Limit the number of profiles to scrape
  -s, --start <n>     Start from a specific index (for resuming)

Examples:
  npm run scrape:dpca                    # Full scrape (~312 providers)
  npm run scrape:dpca -- --limit 10      # Test with 10 providers
  npm run scrape:dpca -- --start 50      # Resume from index 50
  npm run scrape:dpca -- -s 100 -l 50    # Scrape 50 providers starting at 100

Estimated Times:
  10 profiles:   ~30 seconds
  100 profiles:  ~5 minutes
  312 profiles:  ~15 minutes

Data Extracted:
  - Physician name and credentials
  - Practice address (street, city, state, zip)
  - Core specialties
  - Focused health areas
  - Additional services
  - Practice website (when available)

Note: Fee data is NOT available on DPCA profiles. Use the matcher
and practice website scraper to obtain pricing information.
`)
}

async function main(): Promise<void> {
  const options = parseArgs()

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  console.log('='.repeat(60))
  console.log('DPC Alliance Directory Scraper')
  console.log('='.repeat(60))
  console.log()

  try {
    const result = await dpcAllianceScraper.scrapeAllProfiles({
      limit: options.limit,
      startFrom: options.start,
    })

    console.log()
    console.log('='.repeat(60))
    console.log('Summary')
    console.log('='.repeat(60))
    console.log(`  Successful: ${result.success}`)
    console.log(`  Errors:     ${result.errors}`)
    console.log(`  Total:      ${result.total}`)
    console.log()

    if (result.errors > 0) {
      console.log('Some profiles had errors. Check the logs above for details.')
    }

    process.exit(result.errors > 0 ? 1 : 0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
