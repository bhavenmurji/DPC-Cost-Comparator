#!/usr/bin/env npx tsx

/**
 * DPCA Provider Matcher CLI
 *
 * Matches DPCA providers to DPC Frontier data to inherit fee information.
 *
 * Usage:
 *   npm run match:dpca              # Match all with default threshold (85%)
 *   npm run match:dpca -- --dry-run # Preview matches without updating
 *   npm run match:dpca -- --threshold 70
 *   npm run match:dpca -- --help
 */

import { providerMatcher } from '../apps/api/src/services/providerMatcher.service'

interface CLIOptions {
  threshold?: number
  dryRun?: boolean
  help?: boolean
  report?: boolean
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
    } else if (arg === '--threshold' || arg === '-t') {
      options.threshold = parseInt(args[++i], 10)
    } else if (arg === '--report' || arg === '-r') {
      options.report = true
    }
  }

  return options
}

function printHelp(): void {
  console.log(`
DPCA Provider Matcher
=====================

Matches DPCA providers to DPC Frontier records to inherit fee data.

Usage:
  npm run match:dpca [options]

Options:
  -h, --help              Show this help message
  -t, --threshold <n>     Minimum confidence % to auto-inherit fees (default: 85)
  -d, --dry-run           Preview matches without updating the database
  -r, --report            Generate a matching report only

Matching Algorithm:
  Tier 1 (100%): Exact website URL match
  Tier 2 (95%):  Exact address match
  Tier 3 (85%):  Name similarity > 0.8 + same city/state
  Tier 4 (70%):  Name similarity > 0.6 + same state + within 10 miles

Examples:
  npm run match:dpca                      # Match with 85% threshold
  npm run match:dpca -- --threshold 70    # Include fuzzy matches
  npm run match:dpca -- --dry-run         # Preview without changes
  npm run match:dpca -- --report          # Just show statistics

Note: Run this AFTER scraping the DPCA directory.
`)
}

async function main(): Promise<void> {
  const options = parseArgs()

  if (options.help) {
    printHelp()
    process.exit(0)
  }

  console.log('='.repeat(60))
  console.log('DPCA Provider Matcher')
  console.log('='.repeat(60))
  console.log()

  try {
    if (options.report) {
      console.log('Generating match report...\n')
      const report = await providerMatcher.generateMatchReport()

      console.log('DPCA Provider Statistics:')
      console.log(`  Total DPCA providers:  ${report.totalDPCA}`)
      console.log(`  With fees:             ${report.withFees}`)
      console.log(`  Without fees:          ${report.withoutFees}`)
      console.log(`  With website:          ${report.withWebsite}`)
      console.log(`  Matched to Frontier:   ${report.matchedToFrontier}`)

      process.exit(0)
    }

    const result = await providerMatcher.matchAllProviders({
      threshold: options.threshold,
      dryRun: options.dryRun,
    })

    console.log()
    console.log('='.repeat(60))
    console.log('Summary')
    console.log('='.repeat(60))
    console.log(`  Matched:        ${result.matched}`)
    console.log(`  Unmatched:      ${result.unmatched}`)
    console.log(`  Fees inherited: ${result.feesInherited}`)
    console.log()

    if (options.dryRun) {
      console.log('(Dry run - no changes were made to the database)')
    }

    // Show match type breakdown
    const matchTypes: Record<string, number> = {}
    for (const r of result.results) {
      matchTypes[r.matchType] = (matchTypes[r.matchType] || 0) + 1
    }

    console.log('\nMatch Type Breakdown:')
    for (const [type, count] of Object.entries(matchTypes)) {
      console.log(`  ${type}: ${count}`)
    }

    process.exit(0)
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  }
}

main()
