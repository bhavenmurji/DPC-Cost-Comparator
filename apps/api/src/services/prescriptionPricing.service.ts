import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface MedicationPricing {
  medicationName: string
  genericName: string
  strength?: string
  form?: string
  pricing: {
    walmart4Dollar?: {
      price30Day: number
      price90Day: number | null
      available: boolean
    }
    costco?: {
      estimatedPrice: number
      requiresMembership: boolean
      membershipCost?: number
    }
    estimated?: {
      lowPrice: number
      highPrice: number
      averagePrice: number
      source: string
    }
  }
  savingsVsInsurance?: number
  category?: string
  conditions?: string[]
}

export interface PrescriptionCostSummary {
  medications: MedicationPricing[]
  totalMonthly: number
  totalAnnual: number
  savingsPrograms: {
    walmart: {
      availableCount: number
      monthlyCost: number
      annualCost: number
      savings: number
    }
    costco: {
      estimatedMonthlyCost: number
      estimatedAnnualCost: number
      membershipCost: number
      totalAnnualWithMembership: number
    }
  }
  recommendations: string[]
}

interface WalmartProgram {
  id: string
  name: string
  pharmacy: string
  type: string
  requiresMembership: boolean
  pricing: {
    '30day': number
    '90day': number
  }
  medications: Array<{
    name: string
    genericName: string
    strength: string
    form: string
    category: string
    conditions: string[]
    price30Day: number
    price90Day: number | null
  }>
}

interface ProgramData {
  programs: WalmartProgram[]
  metadata: {
    lastUpdated: string
    source: string
    disclaimer: string
    coverage: string
  }
}

export class PrescriptionPricingService {
  private walmartProgramData: ProgramData | null = null

  constructor() {
    this.loadWalmartProgram()
  }

  /**
   * Load Walmart $4 program data from JSON file
   */
  private async loadWalmartProgram(): Promise<void> {
    try {
      const dataPath = path.join(__dirname, '../../../../data/walmart-pharmacy-programs.json')
      const fileContent = await fs.readFile(dataPath, 'utf-8')
      this.walmartProgramData = JSON.parse(fileContent)
      console.log('✅ Loaded Walmart pharmacy program data')
    } catch (error) {
      console.error('❌ Error loading Walmart program data:', error)
      this.walmartProgramData = null
    }
  }

  /**
   * Search Walmart $4 program for medication
   */
  async searchWalmartProgram(medicationName: string): Promise<MedicationPricing['pricing']['walmart4Dollar'] | null> {
    if (!this.walmartProgramData) {
      await this.loadWalmartProgram()
    }

    if (!this.walmartProgramData) {
      return null
    }

    const walmart = this.walmartProgramData.programs.find((p) => p.id === 'walmart-4-dollar')
    if (!walmart) {
      return null
    }

    // Normalize search term
    const searchTerm = medicationName.toLowerCase().trim()

    // Search by medication name or generic name
    const medication = walmart.medications.find(
      (med) => med.name.toLowerCase().includes(searchTerm) || med.genericName.toLowerCase().includes(searchTerm)
    )

    if (!medication) {
      return null
    }

    return {
      price30Day: medication.price30Day,
      price90Day: medication.price90Day,
      available: true,
    }
  }

  /**
   * Get pricing for a single medication
   */
  async getMedicationPricing(
    medicationName: string,
    genericName?: string,
    strength?: string
  ): Promise<MedicationPricing> {
    // Check Walmart $4 program first
    const walmartPricing = await this.searchWalmartProgram(genericName || medicationName)

    // Check database for cached pricing
    const cachedPrice = await prisma.prescriptionPrice.findFirst({
      where: {
        OR: [{ drugName: { contains: medicationName, mode: 'insensitive' } }, { genericName: genericName }],
      },
      orderBy: {
        cachedAt: 'desc',
      },
    })

    const pricing: MedicationPricing = {
      medicationName,
      genericName: genericName || medicationName,
      strength,
      pricing: {},
    }

    // Add Walmart pricing if available
    if (walmartPricing) {
      pricing.pricing.walmart4Dollar = walmartPricing
    }

    // Add cached pricing if available
    if (cachedPrice) {
      if (cachedPrice.source === 'COSTCO') {
        pricing.pricing.costco = {
          estimatedPrice: cachedPrice.price,
          requiresMembership: false,
          membershipCost: 60,
        }
      } else {
        pricing.pricing.estimated = {
          lowPrice: cachedPrice.price * 0.8,
          highPrice: cachedPrice.price * 1.2,
          averagePrice: cachedPrice.price,
          source: cachedPrice.source,
        }
      }
    } else {
      // Provide rough estimates based on typical pricing
      pricing.pricing.estimated = {
        lowPrice: 10,
        highPrice: 100,
        averagePrice: 40,
        source: 'ESTIMATE',
      }
    }

    return pricing
  }

  /**
   * Calculate total prescription costs for multiple medications
   */
  async calculatePrescriptionCosts(medications: string[]): Promise<PrescriptionCostSummary> {
    const pricingResults: MedicationPricing[] = []
    let walmartAvailableCount = 0
    let walmartMonthlyCost = 0
    let estimatedMonthlyCost = 0

    // Get pricing for each medication
    for (const medName of medications) {
      const pricing = await this.getMedicationPricing(medName)
      pricingResults.push(pricing)

      // Calculate Walmart costs
      if (pricing.pricing.walmart4Dollar?.available) {
        walmartAvailableCount++
        walmartMonthlyCost += pricing.pricing.walmart4Dollar.price30Day
      } else if (pricing.pricing.estimated) {
        estimatedMonthlyCost += pricing.pricing.estimated.averagePrice
      }
    }

    // Calculate totals
    const totalWalmartMonthly = walmartMonthlyCost + estimatedMonthlyCost
    const totalWalmartAnnual = totalWalmartMonthly * 12

    // Estimate Costco costs (typically 10-20% cheaper than average)
    const estimatedCostcoMonthly = estimatedMonthlyCost * 0.85
    const estimatedCostcoAnnual = estimatedCostcoMonthly * 12
    const costcoMembershipCost = 60
    const costcoTotalAnnual = estimatedCostcoAnnual + costcoMembershipCost

    // Calculate savings vs typical insurance copays
    const typicalInsuranceCopay = 20 // Average copay per medication
    const totalInsuranceMonthlyCost = medications.length * typicalInsuranceCopay
    const savings = totalInsuranceMonthlyCost * 12 - totalWalmartAnnual

    // Generate recommendations
    const recommendations: string[] = []

    if (walmartAvailableCount === medications.length) {
      recommendations.push(
        `All ${medications.length} medications are available in Walmart's $4 program! This could save you significantly.`
      )
    } else if (walmartAvailableCount > 0) {
      recommendations.push(
        `${walmartAvailableCount} of ${medications.length} medications are available in Walmart's $4 program.`
      )
    }

    if (medications.length >= 3 && costcoTotalAnnual < totalWalmartAnnual) {
      recommendations.push(
        `Costco pharmacy might save you $${(totalWalmartAnnual - costcoTotalAnnual).toFixed(2)}/year (including $60 membership).`
      )
    }

    if (savings > 0) {
      recommendations.push(
        `Paying cash at Walmart could save you $${savings.toFixed(2)}/year vs typical insurance copays.`
      )
    }

    return {
      medications: pricingResults,
      totalMonthly: totalWalmartMonthly,
      totalAnnual: totalWalmartAnnual,
      savingsPrograms: {
        walmart: {
          availableCount: walmartAvailableCount,
          monthlyCost: totalWalmartMonthly,
          annualCost: totalWalmartAnnual,
          savings: savings > 0 ? savings : 0,
        },
        costco: {
          estimatedMonthlyCost: walmartMonthlyCost + estimatedCostcoMonthly,
          estimatedAnnualCost: (walmartMonthlyCost + estimatedCostcoMonthly) * 12,
          membershipCost: costcoMembershipCost,
          totalAnnualWithMembership: costcoTotalAnnual + walmartMonthlyCost * 12,
        },
      },
      recommendations,
    }
  }

  /**
   * Import Walmart program to database
   */
  async importWalmartProgramToDatabase(): Promise<void> {
    if (!this.walmartProgramData) {
      await this.loadWalmartProgram()
    }

    if (!this.walmartProgramData) {
      throw new Error('Could not load Walmart program data')
    }

    const walmart = this.walmartProgramData.programs.find((p) => p.id === 'walmart-4-dollar')
    if (!walmart) {
      throw new Error('Walmart $4 program not found in data')
    }

    console.log('Importing Walmart $4 program to database...')

    // Create the program
    const program = await prisma.pharmacySavingsProgram.upsert({
      where: { id: 'walmart-4-dollar' },
      create: {
        id: walmart.id,
        programName: walmart.name,
        pharmacyChain: walmart.pharmacy,
        programType: 'GENERIC_DISCOUNT',
        requiresMembership: walmart.requiresMembership,
        membershipCost: null,
        membershipUrl: null,
        active: true,
        lastVerified: new Date(),
      },
      update: {
        lastVerified: new Date(),
      },
    })

    console.log(`✅ Created/updated program: ${program.programName}`)

    // Import medications
    let importedCount = 0
    for (const med of walmart.medications) {
      await prisma.pharmacySavingsMedication.upsert({
        where: {
          id: `walmart-4-${med.name.toLowerCase().replace(/\s+/g, '-')}`,
        },
        create: {
          id: `walmart-4-${med.name.toLowerCase().replace(/\s+/g, '-')}`,
          programId: program.id,
          drugName: med.name,
          genericName: med.genericName,
          dosage: med.strength,
          form: med.form,
          price30Day: med.price30Day,
          price90Day: med.price90Day,
        },
        update: {
          price30Day: med.price30Day,
          price90Day: med.price90Day,
        },
      })
      importedCount++
    }

    console.log(`✅ Imported ${importedCount} medications to database`)
  }

  /**
   * Search medications in database by name
   */
  async searchMedications(searchTerm: string): Promise<MedicationPricing[]> {
    const medications = await prisma.pharmacySavingsMedication.findMany({
      where: {
        OR: [
          { drugName: { contains: searchTerm, mode: 'insensitive' } },
          { genericName: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      include: {
        program: true,
      },
      take: 10,
    })

    return medications.map((med) => ({
      medicationName: med.drugName,
      genericName: med.genericName,
      strength: med.dosage || undefined,
      form: med.form || undefined,
      pricing: {
        walmart4Dollar: {
          price30Day: med.price30Day,
          price90Day: med.price90Day,
          available: true,
        },
      },
    }))
  }
}

// Export singleton instance
export const prescriptionPricingService = new PrescriptionPricingService()
