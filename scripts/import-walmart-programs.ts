#!/usr/bin/env tsx

/**
 * Import Walmart Pharmacy Programs to Database
 *
 * Imports Walmart $4/$10 generic medication program to the database.
 * This provides accurate pricing for 30+ common generic medications.
 *
 * Usage:
 *   npm run import:walmart
 */

import { prescriptionPricingService } from '../apps/api/src/services/prescriptionPricing.service.js'

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║   Walmart Pharmacy Program Import                ║')
  console.log('╚═══════════════════════════════════════════════════╝')
  console.log('')

  try {
    console.log('📦 Importing Walmart $4/$10 program to database...')
    console.log('')

    await prescriptionPricingService.importWalmartProgramToDatabase()

    console.log('')
    console.log('╔═══════════════════════════════════════════════════╗')
    console.log('║              Import Complete! ✅                  ║')
    console.log('╚═══════════════════════════════════════════════════╝')
    console.log('')
    console.log('Imported Data:')
    console.log('  • Program: Walmart $4 Prescriptions')
    console.log('  • Medications: 30+ common generics')
    console.log('  • Pricing: $4 (30-day) / $10 (90-day)')
    console.log('')
    console.log('Next Steps:')
    console.log('  1. Test: npm run test:prescriptions')
    console.log('  2. View: npx prisma studio')
    console.log('  3. API: Test prescription pricing endpoints')
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
