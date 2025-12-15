import type { PrismaClient } from '@prisma/client'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Lazy initialization of Prisma to handle environments where it's not available
let prisma: PrismaClient | null = null
let prismaInitialized = false

async function getPrisma(): Promise<PrismaClient | null> {
  if (prismaInitialized) return prisma
  prismaInitialized = true

  try {
    const { PrismaClient } = await import('@prisma/client')
    prisma = new PrismaClient()
    console.log('Prisma client initialized for prescription pricing')
    return prisma
  } catch (error) {
    console.log('Prisma client not available, using static/file data for prescriptions')
    return null
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================
// Types for pharmacy programs
// ============================================

export interface PharmacyPriceResult {
  pharmacy: string
  programName: string
  price: number
  quantity?: number
  supplyDays: number
  price90Day?: number | null
  isFree: boolean
  requiresMembership: boolean
  membershipCost?: number
  notes?: string
}

export interface MedicationPricing {
  medicationName: string
  genericName: string
  strength?: string
  form?: string
  category?: string
  conditions?: string[]
  pharmacyPrices: PharmacyPriceResult[]
  lowestPrice: PharmacyPriceResult | null
  savingsVsRetail?: number
}

export interface PrescriptionCostSummary {
  medications: MedicationPricing[]
  totalMonthly: number
  totalAnnual: number
  bestOverallStrategy: {
    description: string
    monthlyCost: number
    annualCost: number
    pharmaciesUsed: string[]
  }
  byPharmacy: {
    [pharmacy: string]: {
      medicationCount: number
      monthlyCost: number
      annualCost: number
      membershipRequired: boolean
      membershipCost: number
    }
  }
  recommendations: string[]
}

// Interfaces for JSON data structure
interface PharmacyProgram {
  id: string
  name: string
  pharmacy: string
  type: string
  requiresMembership: boolean
  membershipCost?: number
  membershipCostFamily?: number
  membershipPeriod?: string
  website?: string
  description?: string
  coverage?: string
  stores?: string[]
  pricingModel?: string
  note?: string
  pricing?: {
    '30day': number
    '90day': number
  }
  medications: PharmacyMedication[]
}

interface PharmacyMedication {
  name: string
  genericName: string
  strength: string
  form: string
  category: string
  conditions?: string[]
  tier?: string
  // Walmart format
  price30Day?: number
  price90Day?: number | null
  // Cost Plus format
  quantity?: number
  manufacturerCost?: number
  markup?: number
  pharmacyFee?: number
  totalPrice?: number
  // Costco format
  price?: number
  // Publix/Meijer format
  supplyDays?: number
}

interface PharmacyProgramsData {
  programs: PharmacyProgram[]
  metadata: {
    lastUpdated: string
    sources: string[]
    disclaimer: string
    notes: {
      [key: string]: string
    }
  }
}

// ============================================
// Prescription Pricing Service
// ============================================

export class PrescriptionPricingService {
  private programsData: PharmacyProgramsData | null = null
  private dataLoaded = false

  constructor() {
    this.loadPharmacyPrograms()
  }

  /**
   * Load all pharmacy programs from JSON file
   */
  private async loadPharmacyPrograms(): Promise<void> {
    if (this.dataLoaded) return

    try {
      const dataPath = path.join(__dirname, '../../../../data/pharmacy-programs.json')
      const fileContent = await fs.readFile(dataPath, 'utf-8')
      this.programsData = JSON.parse(fileContent)
      this.dataLoaded = true
      console.log(`✅ Loaded ${this.programsData?.programs.length || 0} pharmacy programs`)
    } catch (error) {
      console.error('❌ Error loading pharmacy programs data:', error)
      // Try alternate path
      try {
        const alternatePath = path.join(process.cwd(), 'data/pharmacy-programs.json')
        const fileContent = await fs.readFile(alternatePath, 'utf-8')
        this.programsData = JSON.parse(fileContent)
        this.dataLoaded = true
        console.log(`✅ Loaded ${this.programsData?.programs.length || 0} pharmacy programs (alternate path)`)
      } catch (altError) {
        console.error('❌ Could not load pharmacy programs from any path')
        this.programsData = null
      }
    }
  }

  /**
   * Get all available pharmacy programs
   */
  async getAvailablePrograms(): Promise<
    Array<{
      id: string
      name: string
      pharmacy: string
      type: string
      requiresMembership: boolean
      membershipCost?: number
      description?: string
      coverage?: string
      medicationCount: number
    }>
  > {
    await this.loadPharmacyPrograms()

    if (!this.programsData) {
      return []
    }

    return this.programsData.programs.map((program) => ({
      id: program.id,
      name: program.name,
      pharmacy: program.pharmacy,
      type: program.type,
      requiresMembership: program.requiresMembership,
      membershipCost: program.membershipCost,
      description: program.description,
      coverage: program.coverage,
      medicationCount: program.medications.length,
    }))
  }

  /**
   * Search all pharmacy programs for a medication
   */
  async searchMedicationPrices(medicationName: string): Promise<PharmacyPriceResult[]> {
    await this.loadPharmacyPrograms()

    if (!this.programsData) {
      return []
    }

    const searchTerm = medicationName.toLowerCase().trim()
    const results: PharmacyPriceResult[] = []

    for (const program of this.programsData.programs) {
      const matchedMeds = program.medications.filter(
        (med) =>
          med.name.toLowerCase().includes(searchTerm) ||
          med.genericName.toLowerCase().includes(searchTerm)
      )

      for (const med of matchedMeds) {
        const priceResult = this.convertToPriceResult(program, med)
        if (priceResult) {
          results.push(priceResult)
        }
      }
    }

    // Sort by price (lowest first), with free options at the top
    return results.sort((a, b) => {
      if (a.isFree && !b.isFree) return -1
      if (!a.isFree && b.isFree) return 1
      return a.price - b.price
    })
  }

  /**
   * Convert pharmacy medication data to standardized price result
   */
  private convertToPriceResult(program: PharmacyProgram, med: PharmacyMedication): PharmacyPriceResult | null {
    let price = 0
    let supplyDays = 30
    let price90Day: number | null = null
    let isFree = false
    let notes: string | undefined

    switch (program.type) {
      case 'GENERIC_DISCOUNT':
        // Walmart $4 or Kroger style
        price = med.price30Day ?? program.pricing?.['30day'] ?? 4
        price90Day = med.price90Day ?? program.pricing?.['90day'] ?? null
        isFree = price === 0 || med.tier === 'free'
        if (med.tier === 'free') {
          notes = 'FREE with membership'
        }
        break

      case 'TRANSPARENT_PRICING':
        // Cost Plus Drugs style
        price = med.totalPrice ?? 0
        supplyDays = med.quantity ? Math.round(med.quantity / 1) : 90 // Assume 1 pill/day
        if (med.manufacturerCost) {
          notes = `Manufacturer cost: $${med.manufacturerCost.toFixed(2)} + 15% + $5 fee`
        }
        break

      case 'MEMBERSHIP_DISCOUNT':
        // Costco style
        price = med.price ?? 0
        supplyDays = med.quantity ?? 90
        break

      case 'FREE_PROGRAM':
        // Publix/Meijer style
        price = 0
        isFree = true
        supplyDays = med.supplyDays ?? 30
        notes = program.coverage ? `Available in: ${program.coverage}` : undefined
        break

      default:
        price = med.price30Day ?? med.price ?? 0
    }

    return {
      pharmacy: program.pharmacy,
      programName: program.name,
      price: price,
      supplyDays: supplyDays,
      price90Day: price90Day,
      isFree: isFree,
      requiresMembership: program.requiresMembership,
      membershipCost: program.membershipCost,
      notes: notes,
    }
  }

  /**
   * Get comprehensive pricing for a single medication
   */
  async getMedicationPricing(
    medicationName: string,
    genericName?: string,
    strength?: string
  ): Promise<MedicationPricing> {
    const searchName = genericName || medicationName
    const pharmacyPrices = await this.searchMedicationPrices(searchName)

    // Also check database for cached pricing
    const db = await getPrisma()
    if (db) {
      try {
        const cachedPrice = await db.prescriptionPrice.findFirst({
          where: {
            OR: [
              { drugName: { contains: medicationName, mode: 'insensitive' } },
              { genericName: genericName },
            ],
          },
          orderBy: {
            cachedAt: 'desc',
          },
        })

        if (cachedPrice && !pharmacyPrices.find((p) => p.pharmacy === cachedPrice.source)) {
          pharmacyPrices.push({
            pharmacy: cachedPrice.source,
            programName: `${cachedPrice.source} Price`,
            price: cachedPrice.price,
            supplyDays: 30,
            isFree: false,
            requiresMembership: false,
          })
        }
      } catch (error) {
        console.log('Database query failed, using file data only')
      }
    }

    // Find category and conditions from first match
    let category: string | undefined
    let conditions: string[] | undefined

    if (this.programsData) {
      for (const program of this.programsData.programs) {
        const matchedMed = program.medications.find(
          (med) =>
            med.name.toLowerCase().includes(searchName.toLowerCase()) ||
            med.genericName.toLowerCase().includes(searchName.toLowerCase())
        )
        if (matchedMed) {
          category = matchedMed.category
          conditions = matchedMed.conditions
          break
        }
      }
    }

    const lowestPrice = pharmacyPrices.length > 0 ? pharmacyPrices[0] : null

    // Calculate savings vs typical retail price
    const typicalRetailPrice = 50 // Average retail price for generics
    const savingsVsRetail = lowestPrice ? typicalRetailPrice - lowestPrice.price : 0

    return {
      medicationName,
      genericName: genericName || medicationName,
      strength,
      category,
      conditions,
      pharmacyPrices,
      lowestPrice,
      savingsVsRetail: savingsVsRetail > 0 ? savingsVsRetail : 0,
    }
  }

  /**
   * Calculate total prescription costs for multiple medications
   */
  async calculatePrescriptionCosts(medications: string[]): Promise<PrescriptionCostSummary> {
    const pricingResults: MedicationPricing[] = []
    const byPharmacy: PrescriptionCostSummary['byPharmacy'] = {}

    // Get pricing for each medication
    for (const medName of medications) {
      const pricing = await this.getMedicationPricing(medName)
      pricingResults.push(pricing)

      // Track by pharmacy
      for (const pharmPrice of pricing.pharmacyPrices) {
        if (!byPharmacy[pharmPrice.pharmacy]) {
          byPharmacy[pharmPrice.pharmacy] = {
            medicationCount: 0,
            monthlyCost: 0,
            annualCost: 0,
            membershipRequired: pharmPrice.requiresMembership,
            membershipCost: pharmPrice.membershipCost || 0,
          }
        }
        byPharmacy[pharmPrice.pharmacy].medicationCount++
        const monthlyPrice =
          pharmPrice.supplyDays >= 90 ? pharmPrice.price / 3 : pharmPrice.price
        byPharmacy[pharmPrice.pharmacy].monthlyCost += monthlyPrice
      }
    }

    // Calculate annual costs for each pharmacy
    for (const pharmacy of Object.keys(byPharmacy)) {
      const data = byPharmacy[pharmacy]
      data.annualCost = data.monthlyCost * 12
      if (data.membershipRequired) {
        data.annualCost += data.membershipCost
      }
    }

    // Calculate best overall strategy (using lowest price for each medication)
    let bestMonthly = 0
    const pharmaciesUsed = new Set<string>()

    for (const pricing of pricingResults) {
      if (pricing.lowestPrice) {
        const monthlyPrice =
          pricing.lowestPrice.supplyDays >= 90
            ? pricing.lowestPrice.price / 3
            : pricing.lowestPrice.price
        bestMonthly += monthlyPrice
        pharmaciesUsed.add(pricing.lowestPrice.pharmacy)
      }
    }

    // Add membership costs for pharmacies that require it
    let membershipCosts = 0
    for (const pharmacy of pharmaciesUsed) {
      const data = byPharmacy[pharmacy]
      if (data?.membershipRequired) {
        membershipCosts += data.membershipCost
      }
    }

    const bestAnnual = bestMonthly * 12 + membershipCosts

    // Generate recommendations
    const recommendations = this.generateRecommendations(pricingResults, byPharmacy)

    return {
      medications: pricingResults,
      totalMonthly: bestMonthly,
      totalAnnual: bestAnnual,
      bestOverallStrategy: {
        description: this.describeBestStrategy(pricingResults),
        monthlyCost: bestMonthly,
        annualCost: bestAnnual,
        pharmaciesUsed: Array.from(pharmaciesUsed),
      },
      byPharmacy,
      recommendations,
    }
  }

  /**
   * Generate smart recommendations based on medication analysis
   */
  private generateRecommendations(
    pricingResults: MedicationPricing[],
    byPharmacy: PrescriptionCostSummary['byPharmacy']
  ): string[] {
    const recommendations: string[] = []

    // Check for free medications
    const freeMeds = pricingResults.filter((p) => p.lowestPrice?.isFree)
    if (freeMeds.length > 0) {
      const freePharmacies = [...new Set(freeMeds.map((m) => m.lowestPrice?.pharmacy))]
      recommendations.push(
        `${freeMeds.length} medication(s) available FREE at: ${freePharmacies.join(', ')}`
      )
    }

    // Check for $4 program availability
    const walmartAvailable = pricingResults.filter((p) =>
      p.pharmacyPrices.some((pp) => pp.pharmacy === 'Walmart' && pp.price <= 4)
    )
    if (walmartAvailable.length > 0) {
      recommendations.push(
        `${walmartAvailable.length} medication(s) available for $4 or less at Walmart`
      )
    }

    // Check for Cost Plus Drugs savings
    const costPlusAvailable = pricingResults.filter((p) =>
      p.pharmacyPrices.some((pp) => pp.pharmacy === 'Cost Plus Drugs')
    )
    if (costPlusAvailable.length > 0) {
      recommendations.push(
        `Cost Plus Drugs offers transparent pricing for ${costPlusAvailable.length} medication(s)`
      )
    }

    // Check if Kroger membership would be worth it
    const krogerData = byPharmacy['Kroger']
    if (krogerData && krogerData.medicationCount >= 2) {
      const krogerFreeMeds = pricingResults.filter((p) =>
        p.pharmacyPrices.some((pp) => pp.pharmacy === 'Kroger' && pp.isFree)
      )
      if (krogerFreeMeds.length > 0) {
        const potentialSavings = krogerFreeMeds.length * 4 * 12 // $4/month per med
        if (potentialSavings > 36) {
          recommendations.push(
            `Kroger Rx Savings Club ($36/year) could save you $${potentialSavings - 36}/year with ${krogerFreeMeds.length} FREE medications`
          )
        }
      }
    }

    // Geographic recommendations
    const publix = byPharmacy['Publix']
    if (publix && publix.medicationCount > 0) {
      recommendations.push(
        `Publix offers FREE medications in FL, GA, AL, SC, NC, TN, VA`
      )
    }

    const meijer = byPharmacy['Meijer']
    if (meijer && meijer.medicationCount > 0) {
      recommendations.push(`Meijer offers FREE medications in MI, OH, IN, IL, KY, WI`)
    }

    // Calculate potential savings
    const typicalInsuranceCopay = 15 // Average copay
    const totalInsuranceCost = pricingResults.length * typicalInsuranceCopay * 12
    const lowestPossibleCost = pricingResults.reduce((sum, p) => {
      if (p.lowestPrice) {
        const monthly =
          p.lowestPrice.supplyDays >= 90 ? p.lowestPrice.price / 3 : p.lowestPrice.price
        return sum + monthly * 12
      }
      return sum
    }, 0)

    const savings = totalInsuranceCost - lowestPossibleCost
    if (savings > 50) {
      recommendations.push(
        `Using discount programs could save you ~$${Math.round(savings)}/year vs typical insurance copays`
      )
    }

    return recommendations
  }

  /**
   * Describe the best strategy in plain language
   */
  private describeBestStrategy(pricingResults: MedicationPricing[]): string {
    const pharmacyCounts: { [key: string]: number } = {}

    for (const pricing of pricingResults) {
      if (pricing.lowestPrice) {
        const pharmacy = pricing.lowestPrice.pharmacy
        pharmacyCounts[pharmacy] = (pharmacyCounts[pharmacy] || 0) + 1
      }
    }

    const sortedPharmacies = Object.entries(pharmacyCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([pharmacy, count]) => `${pharmacy} (${count} medications)`)

    if (sortedPharmacies.length === 0) {
      return 'No discount programs found for these medications'
    }

    if (sortedPharmacies.length === 1) {
      return `Get all medications from ${sortedPharmacies[0]}`
    }

    return `Best prices at: ${sortedPharmacies.join(', ')}`
  }

  /**
   * Search medications across all programs
   */
  async searchMedications(searchTerm: string): Promise<MedicationPricing[]> {
    await this.loadPharmacyPrograms()

    if (!this.programsData) {
      return []
    }

    const normalizedSearch = searchTerm.toLowerCase().trim()
    const uniqueMeds = new Map<string, MedicationPricing>()

    for (const program of this.programsData.programs) {
      const matches = program.medications.filter(
        (med) =>
          med.name.toLowerCase().includes(normalizedSearch) ||
          med.genericName.toLowerCase().includes(normalizedSearch)
      )

      for (const med of matches) {
        const key = med.genericName.toLowerCase()
        if (!uniqueMeds.has(key)) {
          uniqueMeds.set(key, {
            medicationName: med.name,
            genericName: med.genericName,
            strength: med.strength,
            form: med.form,
            category: med.category,
            conditions: med.conditions,
            pharmacyPrices: [],
            lowestPrice: null,
          })
        }

        const priceResult = this.convertToPriceResult(program, med)
        if (priceResult) {
          uniqueMeds.get(key)!.pharmacyPrices.push(priceResult)
        }
      }
    }

    // Sort pharmacy prices and set lowest price for each medication
    const results = Array.from(uniqueMeds.values())
    for (const med of results) {
      med.pharmacyPrices.sort((a, b) => {
        if (a.isFree && !b.isFree) return -1
        if (!a.isFree && b.isFree) return 1
        return a.price - b.price
      })
      med.lowestPrice = med.pharmacyPrices[0] || null
    }

    return results.slice(0, 20)
  }

  /**
   * Get list of common medications (those available at multiple pharmacies)
   */
  async getCommonMedications(): Promise<
    Array<{
      name: string
      genericName: string
      category: string
      availableAt: string[]
      lowestPrice: number
      isFreeAnywhere: boolean
    }>
  > {
    await this.loadPharmacyPrograms()

    if (!this.programsData) {
      return []
    }

    const medMap = new Map<
      string,
      {
        name: string
        genericName: string
        category: string
        pharmacies: Set<string>
        lowestPrice: number
        isFreeAnywhere: boolean
      }
    >()

    for (const program of this.programsData.programs) {
      for (const med of program.medications) {
        const key = med.genericName.toLowerCase()
        const priceResult = this.convertToPriceResult(program, med)

        if (!medMap.has(key)) {
          medMap.set(key, {
            name: med.name,
            genericName: med.genericName,
            category: med.category,
            pharmacies: new Set(),
            lowestPrice: priceResult?.price ?? 999,
            isFreeAnywhere: priceResult?.isFree ?? false,
          })
        }

        const existing = medMap.get(key)!
        existing.pharmacies.add(program.pharmacy)
        if (priceResult && priceResult.price < existing.lowestPrice) {
          existing.lowestPrice = priceResult.price
        }
        if (priceResult?.isFree) {
          existing.isFreeAnywhere = true
        }
      }
    }

    // Filter to medications available at 2+ pharmacies and sort by availability
    return Array.from(medMap.values())
      .filter((med) => med.pharmacies.size >= 2)
      .sort((a, b) => b.pharmacies.size - a.pharmacies.size)
      .slice(0, 30)
      .map((med) => ({
        name: med.name,
        genericName: med.genericName,
        category: med.category,
        availableAt: Array.from(med.pharmacies),
        lowestPrice: med.lowestPrice,
        isFreeAnywhere: med.isFreeAnywhere,
      }))
  }

  /**
   * Legacy method for backward compatibility - search Walmart program
   */
  async searchWalmartProgram(
    medicationName: string
  ): Promise<{ price30Day: number; price90Day: number | null; available: boolean } | null> {
    await this.loadPharmacyPrograms()

    if (!this.programsData) {
      return null
    }

    const walmart = this.programsData.programs.find((p) => p.id === 'walmart-4-dollar')
    if (!walmart) {
      return null
    }

    const searchTerm = medicationName.toLowerCase().trim()
    const medication = walmart.medications.find(
      (med) =>
        med.name.toLowerCase().includes(searchTerm) ||
        med.genericName.toLowerCase().includes(searchTerm)
    )

    if (!medication) {
      return null
    }

    return {
      price30Day: medication.price30Day ?? 4,
      price90Day: medication.price90Day ?? 10,
      available: true,
    }
  }

  /**
   * Import pharmacy programs to database (for future use with real-time updates)
   */
  async importProgramsToDatabase(): Promise<void> {
    const db = await getPrisma()
    if (!db) {
      throw new Error('Database not available')
    }

    await this.loadPharmacyPrograms()

    if (!this.programsData) {
      throw new Error('Could not load pharmacy programs data')
    }

    console.log('Importing pharmacy programs to database...')

    for (const program of this.programsData.programs) {
      // Create or update the program
      const dbProgram = await db.pharmacySavingsProgram.upsert({
        where: { id: program.id },
        create: {
          id: program.id,
          programName: program.name,
          pharmacyChain: program.pharmacy,
          programType: program.type,
          requiresMembership: program.requiresMembership,
          membershipCost: program.membershipCost ?? null,
          membershipUrl: program.website ?? null,
          active: true,
          lastVerified: new Date(),
        },
        update: {
          programName: program.name,
          requiresMembership: program.requiresMembership,
          membershipCost: program.membershipCost ?? null,
          lastVerified: new Date(),
        },
      })

      console.log(`Created/updated program: ${dbProgram.programName}`)

      // Import medications
      let importedCount = 0
      for (const med of program.medications) {
        const medId = `${program.id}-${med.name.toLowerCase().replace(/\s+/g, '-')}`
        const priceResult = this.convertToPriceResult(program, med)

        await db.pharmacySavingsMedication.upsert({
          where: { id: medId },
          create: {
            id: medId,
            programId: program.id,
            drugName: med.name,
            genericName: med.genericName,
            dosage: med.strength,
            form: med.form,
            price30Day: priceResult?.price ?? 0,
            price90Day: priceResult?.price90Day ?? null,
          },
          update: {
            price30Day: priceResult?.price ?? 0,
            price90Day: priceResult?.price90Day ?? null,
          },
        })
        importedCount++
      }

      console.log(`  Imported ${importedCount} medications`)
    }

    console.log('✅ All pharmacy programs imported to database')
  }
}

// Export singleton instance
export const prescriptionPricingService = new PrescriptionPricingService()
