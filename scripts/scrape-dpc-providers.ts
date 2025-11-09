#!/usr/bin/env tsx

/**
 * DPC Frontier Scraper CLI Tool
 *
 * Scrapes Direct Primary Care provider data from DPC Frontier mapper
 * and populates the database with real provider information.
 *
 * Usage:
 *   npm run scrape:dpc              # Scrape all providers
 *   npm run scrape:dpc -- --limit 10  # Scrape first 10 providers
 *   npm run scrape:dpc -- --limit 50 --start 100  # Scrape 50 providers starting from index 100
 */

import { dpcFrontierScraper } from '../apps/api/src/services/dpcFrontierScraper.service.js'

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

    switch (arg) {
      case '--limit':
      case '-l':
        options.limit = parseInt(args[++i], 10)
        break

      case '--start':
      case '-s':
        options.start = parseInt(args[++i], 10)
        break

      case '--help':
      case '-h':
        options.help = true
        break
    }
  }

  return options
}

function showHelp() {
  console.log(`
DPC Frontier Scraper - CLI Tool

Usage:
  npm run scrape:dpc [options]

Options:
  --limit, -l <number>   Limit number of providers to scrape
  --start, -s <number>   Start from this index (default: 0)
  --help, -h             Show this help message

Examples:
  # Scrape all providers (2,734 total, ~68 minutes)
  npm run scrape:dpc

  # Scrape first 10 providers (for testing)
  npm run scrape:dpc -- --limit 10

  # Scrape 100 providers starting from index 500
  npm run scrape:dpc -- --limit 100 --start 500

  # Resume scraping from index 1000
  npm run scrape:dpc -- --start 1000

Notes:
  - Respectful scraping: 1.5s delay between requests
  - Data saved to PostgreSQL database
  - Provider source tracking enabled
  - Data quality scores calculated automatically
  - Safe to interrupt and resume

Estimated Times:
  - 10 providers:   ~15 seconds
  - 100 providers:  ~2.5 minutes
  - 500 providers:  ~12.5 minutes
  - 2,734 providers: ~68 minutes
`)
}

async function main() {
  const options = parseArgs()

  if (options.help) {
    showHelp()
    process.exit(0)
  }

  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║   DPC Frontier Scraper - Ignite Health Partners  ║')
  console.log('╚═══════════════════════════════════════════════════╝')
  console.log('')

  try {
    const startTime = Date.now()

    await dpcFrontierScraper.scrapeAllPractices({
      limit: options.limit,
      startFrom: options.start || 0,
    })

    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2)

    console.log('')
    console.log('╔═══════════════════════════════════════════════════╗')
    console.log('║              Scraping Complete! ✅                ║')
    console.log('╚═══════════════════════════════════════════════════╝')
    console.log(`   Duration: ${duration} minutes`)
    console.log('')
    console.log('Next steps:')
    console.log('  1. Check database: npx prisma studio')
    console.log('  2. Test API: curl http://localhost:4000/api/providers')
    console.log('  3. Run comparison: Test with real provider data!')
    console.log('')

    process.exit(0)
  } catch (error) {
    console.error('')
    console.error('╔═══════════════════════════════════════════════════╗')
    console.error('║                 Error! ❌                         ║')
    console.error('╚═══════════════════════════════════════════════════╝')
    console.error(error)
    console.error('')
    process.exit(1)
  }
}

main()
