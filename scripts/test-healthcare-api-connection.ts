/**
 * Test Healthcare.gov API Connection
 *
 * This script tests the connection to the Healthcare.gov API
 * using the configured API key.
 */

import 'dotenv/config'
import axios from 'axios'

const API_KEY = process.env.HEALTHCARE_GOV_API_KEY
const BASE_URL = process.env.HEALTHCARE_GOV_API_URL || 'https://marketplace.api.healthcare.gov'

async function testApiConnection() {
  console.log('='.repeat(60))
  console.log('Healthcare.gov API Connection Test')
  console.log('='.repeat(60))
  console.log()

  // Check if API key is configured
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    console.error('❌ API key not configured')
    console.error('   Set HEALTHCARE_GOV_API_KEY in .env file')
    process.exit(1)
  }

  console.log('✓ API key configured:', API_KEY.substring(0, 8) + '...')
  console.log('✓ Base URL:', BASE_URL)
  console.log()

  // Test 1: Health check / API endpoint availability
  console.log('Test 1: Testing API endpoint availability...')
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/states`, {
      params: { apikey: API_KEY },
      timeout: 10000,
    })

    console.log('✅ API connection successful!')
    console.log(`   Response status: ${response.status}`)

    if (response.data) {
      const states = Array.isArray(response.data) ? response.data : response.data.states
      if (states && states.length > 0) {
        console.log(`   Found ${states.length} states in response`)
        console.log(`   Sample states: ${states.slice(0, 3).map((s: any) => s.name || s).join(', ')}`)
      }
    }
  } catch (error: any) {
    console.error('❌ API connection failed')

    if (axios.isAxiosError(error)) {
      console.error(`   Status: ${error.response?.status || 'N/A'}`)
      console.error(`   Message: ${error.message}`)

      if (error.response?.status === 401) {
        console.error('   → API key may be invalid or expired')
      } else if (error.response?.status === 403) {
        console.error('   → API access forbidden - check API key permissions')
      } else if (error.response?.status === 404) {
        console.error('   → Endpoint not found - API may have changed')
      }

      if (error.response?.data) {
        console.error('   Response data:', JSON.stringify(error.response.data, null, 2))
      }
    } else {
      console.error('   Error:', error.message)
    }

    process.exit(1)
  }

  console.log()

  // Test 2: Try a simple plan search
  console.log('Test 2: Testing plan search endpoint...')
  try {
    const searchRequest = {
      household: {
        income: 50000,
        people: [
          {
            age: 30,
            aptc_eligible: true,
            uses_tobacco: false,
          },
        ],
      },
      place: {
        state: 'NC',
        countyfips: '37063',
        zipcode: '27701',
      },
      market: 'Individual',
      year: 2024,
    }

    const response = await axios.post(
      `${BASE_URL}/api/v1/plans/search`,
      searchRequest,
      {
        params: { apikey: API_KEY },
        timeout: 15000,
      }
    )

    console.log('✅ Plan search successful!')
    console.log(`   Response status: ${response.status}`)

    if (response.data && response.data.plans) {
      console.log(`   Found ${response.data.plans.length} plans`)

      if (response.data.plans.length > 0) {
        const plan = response.data.plans[0]
        console.log(`   Sample plan:`)
        console.log(`     - Name: ${plan.name}`)
        console.log(`     - Metal Level: ${plan.metal_level}`)
        console.log(`     - Type: ${plan.type}`)
        console.log(`     - Premium: $${plan.premium?.premium || 'N/A'}`)
      }
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error('⚠️  Plan search endpoint test failed (this is normal if endpoint differs)')
      console.error(`   Status: ${error.response?.status || 'N/A'}`)
      console.error(`   Message: ${error.message}`)

      // This is not a critical failure - the endpoint might have different requirements
      console.log('   Note: This is not critical if the main API connection works')
    } else {
      console.error('   Error:', error.message)
    }
  }

  console.log()
  console.log('='.repeat(60))
  console.log('✅ API Connection Test Complete')
  console.log('='.repeat(60))
  console.log()
  console.log('Next steps:')
  console.log('1. Start the development server: npm run dev')
  console.log('2. Test the comparison endpoint')
  console.log('3. Check docs/QUICKSTART_HEALTHCARE_API.md for usage examples')
  console.log()
}

// Run the test
testApiConnection().catch((error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
