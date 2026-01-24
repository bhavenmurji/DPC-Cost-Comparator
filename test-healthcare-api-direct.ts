/**
 * Direct Healthcare.gov API Test
 * Tests the API endpoint directly to diagnose issues
 */

import axios from 'axios'

const API_KEY = process.env.HEALTHCARE_GOV_API_KEY || ''
const BASE_URL = 'https://marketplace.api.healthcare.gov/api/v1'

if (!API_KEY) {
  console.error('HEALTHCARE_GOV_API_KEY environment variable is required')
  process.exit(1)
}

async function testHealthcareGovAPI() {
  console.log('🔍 Testing Healthcare.gov API directly...\n')

  const testRequest = {
    household: {
      income: 50000,
      people: [
        {
          age: 35,
          aptc_eligible: true,
          uses_tobacco: false,
          gender: 'Male',
        },
      ],
    },
    place: {
      state: 'CA',
      zipcode: '90210',
      countyfips: '06037',
    },
    market: 'Individual',
    year: 2025,
    filter: {
      metal: ['silver'],
    },
    sort: 'premium',
    order: 'asc',
    limit: 5,
  }

  console.log('📤 Request Payload:')
  console.log(JSON.stringify(testRequest, null, 2))
  console.log('\n')

  try {
    // Test 1: Basic API connectivity
    console.log('Test 1: Checking API connectivity...')
    const healthCheck = await axios.get(`${BASE_URL}/healthcheck`, {
      params: { apikey: API_KEY },
      timeout: 10000,
    })
    console.log('✅ API is reachable')
    console.log('Response:', healthCheck.data)
    console.log('\n')
  } catch (error: any) {
    console.error('❌ API connectivity test failed')
    console.error('Error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', error.response.data)
    }
    console.log('\n')
  }

  try {
    // Test 2: Plans search endpoint
    console.log('Test 2: Searching for plans...')
    const response = await axios.post(`${BASE_URL}/plans/search`, testRequest, {
      params: { apikey: API_KEY },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 15000,
    })

    console.log('✅ Plans search succeeded!')
    console.log('Status:', response.status)
    console.log('Plans found:', response.data.plans?.length || 0)

    if (response.data.plans && response.data.plans.length > 0) {
      console.log('\nFirst plan:')
      const firstPlan = response.data.plans[0]
      console.log('- ID:', firstPlan.id)
      console.log('- Name:', firstPlan.name)
      console.log('- Metal:', firstPlan.metal_level)
      console.log('- Premium:', firstPlan.premium)
      console.log('- Deductible:', firstPlan.deductible?.[0]?.amount)
    }
  } catch (error: any) {
    console.error('❌ Plans search failed')

    if (axios.isAxiosError(error)) {
      console.error('\n📋 Error Details:')
      console.error('- Status:', error.response?.status)
      console.error('- Status Text:', error.response?.statusText)
      console.error('- URL:', error.config?.url)
      console.error('- Method:', error.config?.method)

      console.error('\n📄 Response Data:')
      console.error(JSON.stringify(error.response?.data, null, 2))

      console.error('\n🔍 Request Details:')
      console.error('- Headers:', JSON.stringify(error.config?.headers, null, 2))
      console.error('- Params:', JSON.stringify(error.config?.params, null, 2))

      console.error('\n💡 Error Message:', error.message)

      if (error.code) {
        console.error('Error Code:', error.code)
      }
    } else if (error instanceof Error) {
      console.error('Generic Error:', error.message)
      console.error('Stack:', error.stack)
    } else {
      console.error('Unknown error:', error)
    }
  }
}

testHealthcareGovAPI()
  .then(() => {
    console.log('\n✅ Test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  })
