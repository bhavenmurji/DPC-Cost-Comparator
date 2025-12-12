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
    const prices = results.map((med, index) => ({
      id: `med-${index}`,
      medicationName: med.medicationName,
      dosage: med.strength || params.dosage || 'Standard',
      quantity: params.quantity || 30,
      pharmacy: med.pricing.walmart4Dollar ? 'walmart' : 'goodrx',
      price: med.pricing.walmart4Dollar?.price30Day || med.pricing.estimated?.averagePrice || 40,
      savingsProgram: med.pricing.walmart4Dollar ? 'Walmart $4 Program' : undefined,
      lastUpdated: new Date(),
    }))

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

    // Build price comparison from different sources
    const prices: { pharmacy: string; price: number; savingsProgram?: string }[] = []

    // Add Walmart $4 price if available
    if (pricing.pricing.walmart4Dollar?.available) {
      prices.push({
        pharmacy: 'Walmart',
        price: pricing.pricing.walmart4Dollar.price30Day,
        savingsProgram: '$4 Prescription Program',
      })
    }

    // Add Costco price if available
    if (pricing.pricing.costco) {
      prices.push({
        pharmacy: 'Costco',
        price: pricing.pricing.costco.estimatedPrice,
        savingsProgram: pricing.pricing.costco.requiresMembership ? 'Membership Required' : undefined,
      })
    }

    // Add estimated prices for other pharmacies
    if (pricing.pricing.estimated) {
      const estimated = pricing.pricing.estimated
      prices.push(
        { pharmacy: 'CVS', price: estimated.highPrice * 0.95 },
        { pharmacy: 'Walgreens', price: estimated.highPrice * 0.9 },
        { pharmacy: 'GoodRx', price: estimated.lowPrice, savingsProgram: 'GoodRx Coupon' }
      )
    }

    // Sort by price ascending
    prices.sort((a, b) => a.price - b.price)

    // Calculate statistics
    const allPrices = prices.map((p) => p.price)
    const lowestPrice = Math.min(...allPrices)
    const averagePrice = allPrices.reduce((sum, p) => sum + p, 0) / allPrices.length

    const comparison = {
      medication: pricing.medicationName,
      dosage: pricing.strength || 'Standard',
      quantity: 30,
      prices,
      lowestPrice,
      averagePrice,
      potentialSavings: averagePrice - lowestPrice,
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
 * GET /api/pricing/prescriptions/common
 * Get list of common prescriptions for autocomplete
 */
router.get('/prescriptions/common', async (_req, res) => {
  try {
    // Common medications that are typically in discount programs
    const commonMedications = [
      'Metformin',
      'Lisinopril',
      'Atorvastatin',
      'Amlodipine',
      'Metoprolol',
      'Omeprazole',
      'Losartan',
      'Gabapentin',
      'Hydrochlorothiazide',
      'Sertraline',
      'Simvastatin',
      'Montelukast',
      'Escitalopram',
      'Levothyroxine',
      'Furosemide',
      'Pantoprazole',
      'Prednisone',
      'Fluticasone',
      'Amoxicillin',
      'Azithromycin',
    ]

    res.json(commonMedications)
  } catch (error) {
    console.error('Error fetching common prescriptions:', error)
    res.status(500).json({
      error: 'Failed to fetch common prescriptions',
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
