import { Router } from 'express'
import { z } from 'zod'
import { prescriptionPricingService } from '../services/prescriptionPricing.service.js'
import { labTestPricingService } from '../services/labTestPricing.service.js'

const router = Router()

// ============================================
// PRESCRIPTION PRICING ENDPOINTS
// ============================================

/**
 * GET /api/pricing/prescriptions
 * Search prescription prices by medication name
 */
router.get('/prescriptions', async (req, res) => {
  try {
    const schema = z.object({
      medicationName: z.string().min(1),
      zipCode: z.string().optional(),
      dosage: z.string().optional(),
      quantity: z.coerce.number().optional(),
    })

    const params = schema.parse({
      medicationName: req.query.medicationName,
      zipCode: req.query.zipCode,
      dosage: req.query.dosage,
      quantity: req.query.quantity,
    })

    const results = await prescriptionPricingService.searchMedications(params.medicationName)

    // Transform to match frontend PrescriptionPrice interface
    const prices = results.flatMap((med, medIndex) =>
      med.pharmacyPrices.map((pharmPrice, priceIndex) => ({
        id: `med-${medIndex}-${priceIndex}`,
        medicationName: med.medicationName,
        genericName: med.genericName,
        dosage: med.strength || params.dosage || 'Standard',
        quantity: pharmPrice.supplyDays || params.quantity || 30,
        pharmacy: pharmPrice.pharmacy.toLowerCase().replace(/\s+/g, '_'),
        price: pharmPrice.price,
        isFree: pharmPrice.isFree,
        savingsProgram: pharmPrice.programName,
        requiresMembership: pharmPrice.requiresMembership,
        membershipCost: pharmPrice.membershipCost,
        notes: pharmPrice.notes,
        lastUpdated: new Date(),
      }))
    )

    res.json(prices)
  } catch (error) {
    console.error('Error searching prescription prices:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to search prescription prices',
    })
  }
})

/**
 * GET /api/pricing/prescriptions/compare
 * Compare prescription prices across pharmacies
 */
router.get('/prescriptions/compare', async (req, res) => {
  try {
    const schema = z.object({
      medicationName: z.string().min(1),
      zipCode: z.string().optional(),
    })

    const params = schema.parse({
      medicationName: req.query.medicationName,
      zipCode: req.query.zipCode,
    })

    const pricing = await prescriptionPricingService.getMedicationPricing(params.medicationName)

    // Build price comparison from all pharmacies
    const prices = pricing.pharmacyPrices.map((p) => ({
      pharmacy: p.pharmacy,
      price: p.price,
      supplyDays: p.supplyDays,
      isFree: p.isFree,
      savingsProgram: p.programName,
      requiresMembership: p.requiresMembership,
      membershipCost: p.membershipCost,
      notes: p.notes,
    }))

    // Calculate statistics
    const allPrices = prices.map((p) => p.price)
    const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0
    const averagePrice = allPrices.length > 0 ? allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length : 0

    const comparison = {
      medication: pricing.medicationName,
      genericName: pricing.genericName,
      dosage: pricing.strength || 'Standard',
      category: pricing.category,
      conditions: pricing.conditions,
      prices,
      lowestPrice,
      averagePrice,
      potentialSavings: averagePrice - lowestPrice,
      isFreeAnywhere: prices.some((p) => p.isFree),
    }

    res.json(comparison)
  } catch (error) {
    console.error('Error comparing prescription prices:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to compare prescription prices',
    })
  }
})

/**
 * POST /api/pricing/prescriptions/calculate
 * Calculate total costs for multiple medications
 */
router.post('/prescriptions/calculate', async (req, res) => {
  try {
    const schema = z.object({
      medications: z.array(z.string()).min(1),
    })

    const params = schema.parse(req.body)
    const summary = await prescriptionPricingService.calculatePrescriptionCosts(params.medications)

    res.json(summary)
  } catch (error) {
    console.error('Error calculating prescription costs:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to calculate prescription costs',
    })
  }
})

/**
 * GET /api/pricing/prescriptions/common
 * Get list of common prescriptions with pricing info
 */
router.get('/prescriptions/common', async (_req, res) => {
  try {
    const commonMedications = await prescriptionPricingService.getCommonMedications()
    res.json(commonMedications)
  } catch (error) {
    console.error('Error fetching common prescriptions:', error)
    res.status(500).json({
      error: 'Failed to fetch common prescriptions',
    })
  }
})

/**
 * GET /api/pricing/programs
 * Get all available pharmacy discount programs
 */
router.get('/programs', async (_req, res) => {
  try {
    const programs = await prescriptionPricingService.getAvailablePrograms()
    res.json(programs)
  } catch (error) {
    console.error('Error fetching pharmacy programs:', error)
    res.status(500).json({
      error: 'Failed to fetch pharmacy programs',
    })
  }
})

// ============================================
// LAB TEST PRICING ENDPOINTS
// ============================================

/**
 * GET /api/pricing/lab-tests
 * Search lab test prices by name
 */
router.get('/lab-tests', async (req, res) => {
  try {
    const schema = z.object({
      testName: z.string().min(1),
      zipCode: z.string().optional(),
    })

    const params = schema.parse({
      testName: req.query.testName,
      zipCode: req.query.zipCode,
    })

    const results = await labTestPricingService.searchLabTests(params.testName)

    // Transform to match frontend LabTestPrice interface
    const prices = results.flatMap((test) =>
      test.prices.map((price, index) => ({
        id: `${test.testName}-${index}`,
        testName: test.testName,
        provider: price.provider.toLowerCase().replace(/\s+/g, '_') as
          | 'labcorp'
          | 'quest'
          | 'dpc_affiliate',
        price: price.withoutInsurance,
        withInsurance: price.withInsurance,
        withoutInsurance: price.withoutInsurance,
        lastUpdated: new Date(),
      }))
    )

    res.json(prices)
  } catch (error) {
    console.error('Error searching lab test prices:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to search lab test prices',
    })
  }
})

/**
 * GET /api/pricing/lab-tests/compare
 * Compare lab test prices across providers
 */
router.get('/lab-tests/compare', async (req, res) => {
  try {
    const schema = z.object({
      testName: z.string().min(1),
      zipCode: z.string().optional(),
    })

    const params = schema.parse({
      testName: req.query.testName,
      zipCode: req.query.zipCode,
    })

    const comparison = await labTestPricingService.compareLabTestPrices(params.testName, params.zipCode)

    res.json(comparison)
  } catch (error) {
    console.error('Error comparing lab test prices:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid request parameters',
        details: error.errors,
      })
    }

    res.status(500).json({
      error: 'Failed to compare lab test prices',
    })
  }
})

/**
 * GET /api/pricing/lab-tests/common
 * Get list of common lab tests for autocomplete
 */
router.get('/lab-tests/common', async (_req, res) => {
  try {
    const commonTests = await labTestPricingService.getCommonLabTests()
    res.json(commonTests)
  } catch (error) {
    console.error('Error fetching common lab tests:', error)
    res.status(500).json({
      error: 'Failed to fetch common lab tests',
    })
  }
})

export default router
