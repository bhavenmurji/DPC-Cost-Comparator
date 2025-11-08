/**
 * Healthcare.gov API Configuration
 *
 * Initializes the Healthcare.gov API client from environment variables
 */

import { initializeHealthcareGovClient } from '../services/healthcareGov.service'

/**
 * Initialize Healthcare.gov API client with environment configuration
 */
export function configureHealthcareGovApi(): void {
  const apiKey = process.env.HEALTHCARE_GOV_API_KEY

  // Check if API key is configured
  if (!apiKey || apiKey === 'your_api_key_here') {
    console.warn('⚠️  Healthcare.gov API key not configured')
    console.warn('   Cost comparisons will use estimates instead of real plan data')
    console.warn('   Get an API key at: https://developer.cms.gov/marketplace-api/key-request.html')
    return
  }

  try {
    // Initialize the API client
    initializeHealthcareGovClient({
      apiKey,
      baseUrl: process.env.HEALTHCARE_GOV_API_URL,
      timeout: parseInt(process.env.HEALTHCARE_GOV_API_TIMEOUT || '10000', 10),
      enableCache: process.env.HEALTHCARE_GOV_ENABLE_CACHE !== 'false',
      cacheTTL: parseInt(process.env.HEALTHCARE_GOV_CACHE_TTL || '86400', 10),
    })

    console.log('✅ Healthcare.gov API client initialized successfully')
    console.log(`   Base URL: ${process.env.HEALTHCARE_GOV_API_URL || 'https://marketplace.api.healthcare.gov'}`)
    console.log(`   Caching: ${process.env.HEALTHCARE_GOV_ENABLE_CACHE !== 'false' ? 'Enabled' : 'Disabled'}`)
  } catch (error) {
    console.error('❌ Failed to initialize Healthcare.gov API client:', error)
    console.warn('   Cost comparisons will use estimates instead of real plan data')
  }
}

/**
 * Get Healthcare.gov API configuration status
 */
export function getHealthcareGovStatus(): {
  configured: boolean
  baseUrl?: string
  cacheEnabled?: boolean
  cacheTTL?: number
} {
  const apiKey = process.env.HEALTHCARE_GOV_API_KEY

  if (!apiKey || apiKey === 'your_api_key_here') {
    return { configured: false }
  }

  return {
    configured: true,
    baseUrl: process.env.HEALTHCARE_GOV_API_URL || 'https://marketplace.api.healthcare.gov',
    cacheEnabled: process.env.HEALTHCARE_GOV_ENABLE_CACHE !== 'false',
    cacheTTL: parseInt(process.env.HEALTHCARE_GOV_CACHE_TTL || '86400', 10),
  }
}
