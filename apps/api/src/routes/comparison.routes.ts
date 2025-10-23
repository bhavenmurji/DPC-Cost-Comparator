/**
 * Cost Comparison API Routes
 */
import { Router } from 'express'
import { calculateComparison } from '../services/costComparison.service.js'
import { findMatchingProviders } from '../services/providerMatching.service.js'

const router = Router()

/**
 * POST /api/comparison/calculate
 * Calculate cost comparison between traditional and DPC plans
 */
router.post('/calculate', async (req, res) => {
  try {
    const {
      age,
      zipCode,
      state,
      chronicConditions = [],
      annualDoctorVisits = 4,
      prescriptionCount = 0,
      currentPremium,
      currentDeductible,
    } = req.body

    // Validation
    if (!age || !zipCode || !state) {
      return res.status(400).json({
        error: 'Missing required fields: age, zipCode, state',
      })
    }

    if (age < 18 || age > 100) {
      return res.status(400).json({
        error: 'Age must be between 18 and 100',
      })
    }

    // Calculate comparison
    const result = await calculateComparison({
      age,
      zipCode,
      state,
      chronicConditions,
      annualDoctorVisits,
      prescriptionCount,
      currentPremium,
      currentDeductible,
    })

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
 */
router.post('/providers', async (req, res) => {
  try {
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

    // Validation
    if (!zipCode || !state) {
      return res.status(400).json({
        error: 'Missing required fields: zipCode, state',
      })
    }

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
 */
router.get('/providers/:id', async (req, res) => {
  try {
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

export default router
