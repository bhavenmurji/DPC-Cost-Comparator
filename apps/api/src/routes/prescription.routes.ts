import { Router } from 'express'
import { z } from 'zod'
import { prescriptionPricingService } from '../services/prescriptionPricing.service.js'

const router = Router()

// Validation schemas
const medicationSearchSchema = z.object({
  query: z.string().min(1),
})

const medicationPricingSchema = z.object({
  medicationName: z.string().min(1),
  genericName: z.string().optional(),
  strength: z.string().optional(),
})

const multiMedicationCostSchema = z.object({
  medications: z.array(z.string()).min(1).max(20),
})

/**
 * GET /api/prescriptions/search
 * Search for medications
 */
router.get('/search', async (req, res) => {
  try {
    const params = medicationSearchSchema.parse({
      query: req.query.q || req.query.query,
    })

    const results = await prescriptionPricingService.searchMedications(params.query)

    res.json({
      success: true,
      count: results.length,
      query: params.query,
      medications: results,
    })
  } catch (error) {
    console.error('Error searching medications:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid search query',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to search medications',
    })
  }
})

/**
 * GET /api/prescriptions/pricing
 * Get pricing for a single medication
 */
router.get('/pricing', async (req, res) => {
  try {
    const params = medicationPricingSchema.parse({
      medicationName: req.query.name || req.query.medicationName,
      genericName: req.query.genericName,
      strength: req.query.strength,
    })

    const pricing = await prescriptionPricingService.getMedicationPricing(
      params.medicationName,
      params.genericName,
      params.strength
    )

    res.json({
      success: true,
      medication: pricing,
    })
  } catch (error) {
    console.error('Error fetching medication pricing:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch medication pricing',
    })
  }
})

/**
 * POST /api/prescriptions/calculate-costs
 * Calculate total costs for multiple medications
 */
router.post('/calculate-costs', async (req, res) => {
  try {
    const params = multiMedicationCostSchema.parse(req.body)

    const costSummary = await prescriptionPricingService.calculatePrescriptionCosts(params.medications)

    res.json({
      success: true,
      summary: costSummary,
    })
  } catch (error) {
    console.error('Error calculating prescription costs:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to calculate prescription costs',
    })
  }
})

/**
 * GET /api/prescriptions/walmart-program
 * Get information about Walmart $4 program
 */
router.get('/walmart-program', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const program = await prisma.pharmacySavingsProgram.findUnique({
      where: { id: 'walmart-4-dollar' },
      include: {
        medications: {
          take: 100,
          orderBy: {
            drugName: 'asc',
          },
        },
      },
    })

    if (!program) {
      return res.status(404).json({
        success: false,
        error: 'Walmart $4 program not found. Please run: npm run import:walmart',
      })
    }

    res.json({
      success: true,
      program: {
        id: program.id,
        name: program.programName,
        pharmacy: program.pharmacyChain,
        type: program.programType,
        requiresMembership: program.requiresMembership,
        medicationCount: program.medications.length,
        medications: program.medications.map((med) => ({
          id: med.id,
          name: med.drugName,
          genericName: med.genericName,
          strength: med.dosage,
          form: med.form,
          price30Day: med.price30Day,
          price90Day: med.price90Day,
        })),
        lastVerified: program.lastVerified,
      },
    })
  } catch (error) {
    console.error('Error fetching Walmart program:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Walmart program',
    })
  }
})

/**
 * GET /api/prescriptions/programs
 * Get all pharmacy savings programs
 */
router.get('/programs', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const programs = await prisma.pharmacySavingsProgram.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            medications: true,
          },
        },
      },
    })

    res.json({
      success: true,
      count: programs.length,
      programs: programs.map((program) => ({
        id: program.id,
        name: program.programName,
        pharmacy: program.pharmacyChain,
        type: program.programType,
        requiresMembership: program.requiresMembership,
        membershipCost: program.membershipCost,
        medicationCount: program._count.medications,
        lastVerified: program.lastVerified,
      })),
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pharmacy programs',
    })
  }
})

export default router
