/**
 * Direct Healthcare.gov API Integration Test
 * Tests the enhanced cost comparison with real API data
 */

import dotenv from 'dotenv'
import { initializeHealthcareGovClient } from './apps/api/src/services/healthcareGov.service.js'
import { calculateEnhancedComparison } from './apps/api/src/services/costComparisonEnhanced.service.js'

// Load environment variables
dotenv.config()

async function testApiIntegration() {
  console.log('\n==========================================================')
  console.log('  Healthcare.gov API Integration Test')
  console.log('==========================================================\n')

  // Step 1: Verify API key configuration
  console.log('Step 1: Verifying API configuration...')
  const apiKey = process.env.HEALTHCARE_GOV_API_KEY
  console.log(`  API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT FOUND'}`)
  console.log(`  Base URL: ${process.env.HEALTHCARE_GOV_API_URL || 'https://marketplace.api.healthcare.gov'}`)

  if (!apiKey || apiKey === 'your_api_key_here') {
    console.error('\n❌ ERROR: Healthcare.gov API key not configured!')
    console.error('   Please set HEALTHCARE_GOV_API_KEY in your .env file')
    process.exit(1)
  }

  // Step 2: Initialize the API client
  console.log('\nStep 2: Initializing Healthcare.gov API client...')
  try {
    initializeHealthcareGovClient({
      apiKey,
      baseUrl: process.env.HEALTHCARE_GOV_API_URL,
      timeout: parseInt(process.env.HEALTHCARE_GOV_API_TIMEOUT || '10000', 10),
      enableCache: process.env.HEALTHCARE_GOV_ENABLE_CACHE !== 'false',
      cacheTTL: parseInt(process.env.HEALTHCARE_GOV_CACHE_TTL || '86400', 10),
    })
    console.log('  ✅ API client initialized successfully')
  } catch (error) {
    console.error('  ❌ Failed to initialize API client:', error)
    process.exit(1)
  }

  // Step 3: Test cost comparison with real API data
  console.log('\nStep 3: Testing cost comparison calculation...')
  console.log('  Input: Age 35, ZIP 27701 (Durham, NC), 2 doctor visits/year')

  try {
    const result = await calculateEnhancedComparison(
      {
        age: 35,
        zipCode: '27701',
        state: 'NC',
        chronicConditions: [],
        annualDoctorVisits: 2,
        prescriptionCount: 0,
      },
      {
        income: 50000,
        year: 2025,
        useApiData: true,
      }
    )

    console.log('\n✅ Cost Comparison Results:')
    console.log('  ========================================')
    console.log('  Traditional Insurance:')
    console.log(`    Monthly Premium: $${result.traditionalPremium.toFixed(2)}`)
    console.log(`    Deductible: $${result.traditionalDeductible.toFixed(2)}`)
    console.log(`    Annual Total: $${result.traditionalTotalAnnual.toFixed(2)}`)
    console.log(`    Data Source: ${result.dataSource.traditional}`)

    console.log('\n  DPC + Catastrophic:')
    console.log(`    DPC Monthly Fee: $${result.dpcMonthlyFee.toFixed(2)}`)
    console.log(`    Catastrophic Premium: $${result.catastrophicPremium.toFixed(2)}/year`)
    console.log(`    Annual Total: $${result.dpcTotalAnnual.toFixed(2)}`)
    console.log(`    Data Source: ${result.dataSource.catastrophic}`)

    console.log('\n  Savings Analysis:')
    console.log(`    Annual Savings: $${result.annualSavings.toFixed(2)}`)
    console.log(`    Percentage Savings: ${result.percentageSavings.toFixed(1)}%`)
    console.log(`    Recommended Plan: ${result.recommendedPlan}`)

    if (result.planDetails?.traditionalPlan) {
      console.log('\n  Traditional Plan Details:')
      console.log(`    Plan Name: ${result.planDetails.traditionalPlan.name}`)
      console.log(`    Issuer: ${result.planDetails.traditionalPlan.issuer.name}`)
      console.log(`    Metal Level: ${result.planDetails.traditionalPlan.metal_level}`)
      console.log(`    Type: ${result.planDetails.traditionalPlan.type}`)
    }

    if (result.planDetails?.catastrophicPlan) {
      console.log('\n  Catastrophic Plan Details:')
      console.log(`    Plan Name: ${result.planDetails.catastrophicPlan.name}`)
      console.log(`    Issuer: ${result.planDetails.catastrophicPlan.issuer.name}`)
      console.log(`    Metal Level: ${result.planDetails.catastrophicPlan.metal_level}`)
    }

    console.log('\n==========================================================')
    console.log('✅ TEST PASSED: Healthcare.gov API integration working!')
    console.log('==========================================================\n')

  } catch (error) {
    console.error('\n❌ TEST FAILED: Error calculating comparison')
    console.error('Error details:', error)
    process.exit(1)
  }
}

// Run the test
testApiIntegration().catch(console.error)
