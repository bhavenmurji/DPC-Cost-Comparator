/**
 * Cost Comparison API Routes
 * With Zod validation middleware for security hardening
 * Enhanced with Healthcare.gov API integration
 */
import { Router } from 'express'
import { calculateEnhancedComparison, checkApiAvailability } from '../services/costComparisonEnhanced.service.js'
import { findMatchingProviders } from '../services/providerMatching.service.js'
import { validateBody, validateParams } from '../middleware/validation.js'
import {
  ComparisonInputSchema,
  ProviderSearchSchema,
  ProviderIdSchema,
} from '../validators/schemas.js'
import { searchLimiter, publicLimiter } from '../middleware/rateLimiter.js'

const router = Router()

/**
 * POST /api/comparison/calculate
 * Calculate cost comparison between traditional and DPC plans
 * Now with real Healthcare.gov API data when available
 * Validates input using Zod schema
 * Rate limited: 30 requests per minute (computation-heavy operation)
 */
router.post('/calculate', searchLimiter, validateBody(ComparisonInputSchema), async (req, res) => {
  try {
    // Data is already validated and sanitized by middleware
    const {
      age,
      zipCode,
      state,
      chronicConditions = [],
      annualDoctorVisits = 4,
      prescriptionCount = 0,
      currentPremium,
      currentDeductible,
      income,
      year,
    } = req.body

    // Calculate comparison with Healthcare.gov API data
    const result = await calculateEnhancedComparison(
      {
        age,
        zipCode,
        state,
        chronicConditions,
        annualDoctorVisits,
        prescriptionCount,
        currentPremium,
        currentDeductible,
      },
      {
        income: income || 50000, // Default to median household income
        year: year || new Date().getFullYear(),
        useApiData: true, // Always attempt to use real API data
      }
    )

    // Also find matching providers
    const providers = await findMatchingProviders({
      zipCode,
      state,
      maxDistanceMiles: 50,
      chronicConditions,
    }, 5)

    res.json({
      success: true,
      comparison: result,
      providers,
      dataSource: result.dataSource, // Include data source information
      planDetails: result.planDetails, // Include actual plan details if available
    })
  } catch (error) {
    console.error('Error calculating comparison:', error)
    res.status(500).json({
      error: 'Failed to calculate comparison',
    })
  }
})

/**
 * POST /api/comparison/providers
 * Find matching DPC providers
 * Validates input using Zod schema
 * Rate limited: 30 requests per minute (search operation)
 */
router.post('/providers', searchLimiter, validateBody(ProviderSearchSchema), async (req, res) => {
  try {
    // Data is already validated and sanitized by middleware
    const {
      zipCode,
      state,
      maxDistanceMiles = 50,
      specialtiesNeeded = [],
      chronicConditions = [],
      languagePreference,
      maxMonthlyFee,
      limit = 10,
    } = req.body

    const providers = await findMatchingProviders(
      {
        zipCode,
        state,
        maxDistanceMiles,
        specialtiesNeeded,
        chronicConditions,
        languagePreference,
        maxMonthlyFee,
      },
      limit
    )

    res.json({
      success: true,
      count: providers.length,
      providers,
    })
  } catch (error) {
    console.error('Error finding providers:', error)
    res.status(500).json({
      error: 'Failed to find providers',
    })
  }
})

/**
 * GET /api/comparison/providers/:id
 * Get detailed provider information
 * Validates provider ID format
 * Rate limited: 300 requests per 15 minutes (public endpoint)
 */
router.get('/providers/:id', publicLimiter, validateParams(ProviderIdSchema), async (req, res) => {
  try {
    // ID is already validated by middleware
    const { id } = req.params

    // In production, query database
    res.json({
      success: true,
      provider: {
        id,
        message: 'Provider details would be fetched from database',
      },
    })
  } catch (error) {
    console.error('Error fetching provider:', error)
    res.status(500).json({
      error: 'Failed to fetch provider details',
    })
  }
})

/**
 * GET /api/comparison/api-status
 * Check Healthcare.gov API availability status
 * Public endpoint to help users understand data sources
 */
router.get('/api-status', publicLimiter, async (_req, res) => {
  try {
    const status = checkApiAvailability()
    res.json({
      success: true,
      healthcareGov: status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error checking API status:', error)
    res.status(500).json({
      error: 'Failed to check API status',
    })
  }
})

export default router
