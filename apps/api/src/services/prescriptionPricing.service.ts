import { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getNADACService, DrugPricing as NADACDrugPricing } from './nadac.service'

const prisma = new PrismaClient()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface MedicationPricing {
  medicationName: string
  genericName: string
  strength?: string
  form?: string
  ndc?: string
  pricing: {
    nadac?: {
      wholesalePerUnit: number
      retail30Day: number
      retail90Day: number
      discountPharmacy30Day: number
      discountPharmacy90Day: number
      isGeneric: boolean
      effectiveDate: string
      source: 'NADAC'
    }
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
  bestPrice?: {
    source: string
    price30Day: number
    price90Day: number
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
   * Uses NADAC (CMS wholesale pricing) as primary source with Walmart $4 as a special case
   */
  async getMedicationPricing(
    medicationName: string,
    genericName?: string,
    strength?: string
  ): Promise<MedicationPricing> {
    const searchTerm = genericName || medicationName

    // Check Walmart $4 program first (often the best deal for covered drugs)
    const walmartPricing = await this.searchWalmartProgram(searchTerm)

    // Query NADAC for real wholesale pricing
    const nadacService = getNADACService()
    let nadacPricing: NADACDrugPricing | null = null

    try {
      const nadacResult = await nadacService.searchDrugs(searchTerm, 5)
      if (nadacResult.drugs.length > 0) {
        // Find the best match (preferring generics and lowest price)
        nadacPricing = nadacResult.drugs
          .filter(d => d.isGeneric)
          .sort((a, b) => a.nadacPerUnit - b.nadacPerUnit)[0]
          || nadacResult.drugs[0]
      }
    } catch (error) {
      console.warn('[PrescriptionPricing] NADAC lookup failed:', error)
    }

    const pricing: MedicationPricing = {
      medicationName,
      genericName: genericName || medicationName,
      strength,
      ndc: nadacPricing?.ndc,
      pricing: {},
    }

    // Add NADAC pricing if available
    if (nadacPricing) {
      // Calculate discount pharmacy prices (Costco, Walmart, etc.)
      const discountPharmacy30 = nadacService.calculateRetailPrice(
        nadacPricing.nadacPerUnit,
        30,
        nadacPricing.isGeneric,
        'discount'
      )
      const discountPharmacy90 = nadacService.calculateRetailPrice(
        nadacPricing.nadacPerUnit,
        90,
        nadacPricing.isGeneric,
        'discount'
      ) * 0.9 // 10% 90-day discount

      pricing.pricing.nadac = {
        wholesalePerUnit: nadacPricing.nadacPerUnit,
        retail30Day: nadacPricing.estimated30DayRetail,
        retail90Day: nadacPricing.estimated90DayRetail,
        discountPharmacy30Day: discountPharmacy30,
        discountPharmacy90Day: discountPharmacy90,
        isGeneric: nadacPricing.isGeneric,
        effectiveDate: nadacPricing.effectiveDate,
        source: 'NADAC',
      }

      // Add Costco estimate based on NADAC
      pricing.pricing.costco = {
        estimatedPrice: discountPharmacy30,
        requiresMembership: true,
        membershipCost: 60,
      }
    }

    // Add Walmart $4 pricing if available
    if (walmartPricing) {
      pricing.pricing.walmart4Dollar = walmartPricing
    }

    // Determine best price across all sources
    const prices: { source: string; price30: number; price90: number }[] = []

    if (walmartPricing?.available) {
      prices.push({
        source: 'Walmart $4 Program',
        price30: walmartPricing.price30Day,
        price90: walmartPricing.price90Day || walmartPricing.price30Day * 2.5,
      })
    }

    if (pricing.pricing.nadac) {
      prices.push({
        source: 'NADAC (Discount Pharmacy)',
        price30: pricing.pricing.nadac.discountPharmacy30Day,
        price90: pricing.pricing.nadac.discountPharmacy90Day,
      })
    }

    if (prices.length > 0) {
      const best = prices.sort((a, b) => a.price30 - b.price30)[0]
      pricing.bestPrice = {
        source: best.source,
        price30Day: best.price30,
        price90Day: best.price90,
      }
    } else {
      // Fallback to estimates if no real data
      pricing.pricing.estimated = {
        lowPrice: 10,
        highPrice: 100,
        averagePrice: 40,
        source: 'ESTIMATE',
      }
      pricing.bestPrice = {
        source: 'Estimate',
        price30Day: 40,
        price90Day: 100,
      }
    }

    // Calculate savings vs typical insurance copay ($20-30)
    const typicalCopay = 25
    if (pricing.bestPrice) {
      pricing.savingsVsInsurance = (typicalCopay - pricing.bestPrice.price30Day) * 12
    }

    return pricing
  }

  /**
   * Calculate total prescription costs for multiple medications
   * Now uses NADAC pricing as primary source with intelligent recommendations
   */
  async calculatePrescriptionCosts(medications: string[]): Promise<PrescriptionCostSummary> {
    const pricingResults: MedicationPricing[] = []
    let walmartAvailableCount = 0
    let nadacAvailableCount = 0
    let bestPriceMonthly = 0
    let discountPharmacyMonthly = 0
    let retailPharmacyMonthly = 0

    // Get pricing for each medication
    for (const medName of medications) {
      const pricing = await this.getMedicationPricing(medName)
      pricingResults.push(pricing)

      // Track Walmart availability
      if (pricing.pricing.walmart4Dollar?.available) {
        walmartAvailableCount++
      }

      // Track NADAC availability
      if (pricing.pricing.nadac) {
        nadacAvailableCount++
        discountPharmacyMonthly += pricing.pricing.nadac.discountPharmacy30Day
        retailPharmacyMonthly += pricing.pricing.nadac.retail30Day
      }

      // Use best price for totals
      if (pricing.bestPrice) {
        bestPriceMonthly += pricing.bestPrice.price30Day
      }
    }

    // Calculate totals using best available prices
    const totalMonthly = bestPriceMonthly
    const totalAnnual = totalMonthly * 12

    // Calculate Costco costs (discount pharmacy pricing)
    const costcoMembershipCost = 60
    const costcoMonthly = discountPharmacyMonthly
    const costcoAnnual = costcoMonthly * 12
    const costcoTotalAnnual = costcoAnnual + costcoMembershipCost

    // Calculate savings vs typical insurance copays ($20-30 per prescription)
    const typicalInsuranceCopay = 25
    const totalInsuranceMonthlyCost = medications.length * typicalInsuranceCopay
    const savingsVsInsurance = (totalInsuranceMonthlyCost * 12) - totalAnnual

    // Calculate savings vs retail pharmacy
    const retailAnnual = retailPharmacyMonthly * 12
    const savingsVsRetail = retailAnnual - totalAnnual

    // Generate smart recommendations
    const recommendations: string[] = []

    // NADAC data quality
    if (nadacAvailableCount === medications.length) {
      recommendations.push(
        `✓ Real pricing data found for all ${medications.length} medications from CMS NADAC database.`
      )
    } else if (nadacAvailableCount > 0) {
      recommendations.push(
        `Found real pricing for ${nadacAvailableCount} of ${medications.length} medications.`
      )
    }

    // Walmart $4 program recommendation
    if (walmartAvailableCount === medications.length) {
      recommendations.push(
        `🏆 All ${medications.length} medications qualify for Walmart's $4 program - best value!`
      )
    } else if (walmartAvailableCount > 0) {
      const walmartTotal = pricingResults
        .filter(p => p.pricing.walmart4Dollar?.available)
        .reduce((sum, p) => sum + (p.pricing.walmart4Dollar?.price30Day || 0), 0)
      recommendations.push(
        `${walmartAvailableCount} medications in Walmart $4 program = $${walmartTotal.toFixed(2)}/month`
      )
    }

    // Costco recommendation
    if (medications.length >= 2 && costcoTotalAnnual < totalAnnual) {
      recommendations.push(
        `💰 Costco pharmacy could save $${(totalAnnual - costcoTotalAnnual).toFixed(2)}/year (includes $60 membership)`
      )
    }

    // Insurance comparison
    if (savingsVsInsurance > 0) {
      recommendations.push(
        `📊 Paying cash saves $${savingsVsInsurance.toFixed(2)}/year vs typical insurance copays ($${typicalInsuranceCopay}/each)`
      )
    } else if (savingsVsInsurance < -100) {
      recommendations.push(
        `⚠️ For these medications, insurance may be cheaper than cash pricing.`
      )
    }

    // DPC-specific recommendation
    if (medications.length > 0) {
      const monthlyPerMed = totalMonthly / medications.length
      if (monthlyPerMed < 15) {
        recommendations.push(
          `✅ With DPC, your medications average $${monthlyPerMed.toFixed(2)}/month each - excellent for cash pay!`
        )
      }
    }

    return {
      medications: pricingResults,
      totalMonthly: Math.round(totalMonthly * 100) / 100,
      totalAnnual: Math.round(totalAnnual * 100) / 100,
      savingsPrograms: {
        walmart: {
          availableCount: walmartAvailableCount,
          monthlyCost: pricingResults
            .filter(p => p.pricing.walmart4Dollar?.available)
            .reduce((sum, p) => sum + (p.pricing.walmart4Dollar?.price30Day || 0), 0),
          annualCost: pricingResults
            .filter(p => p.pricing.walmart4Dollar?.available)
            .reduce((sum, p) => sum + (p.pricing.walmart4Dollar?.price30Day || 0) * 12, 0),
          savings: savingsVsInsurance > 0 ? savingsVsInsurance : 0,
        },
        costco: {
          estimatedMonthlyCost: costcoMonthly,
          estimatedAnnualCost: costcoAnnual,
          membershipCost: costcoMembershipCost,
          totalAnnualWithMembership: costcoTotalAnnual,
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
