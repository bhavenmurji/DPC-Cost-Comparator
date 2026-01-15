/**
 * NADAC (National Average Drug Acquisition Cost) Service
 *
 * Provides real drug pricing data from CMS/Medicaid's NADAC database.
 * NADAC represents the average acquisition cost pharmacies pay for medications.
 *
 * Data Source: https://data.medicaid.gov/dataset/f38d0706-1239-442c-a3cc-40ef1b686ac0
 * - Updated weekly by CMS
 * - 1.6+ million drug records
 * - Covers generics and brand-name drugs
 * - Free, no API key required
 *
 * Pricing Notes:
 * - NADAC = wholesale/acquisition cost (what pharmacies pay)
 * - Retail prices typically have 20-40% markup + dispensing fee (~$10-15)
 * - Cash prices at discount pharmacies are often close to NADAC + $5-10
 */

import axios, { AxiosInstance } from 'axios'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * NADAC drug record from CMS API
 */
export interface NADACDrugRecord {
  ndc: string                    // 11-digit National Drug Code
  ndc_description: string        // Drug name with strength
  nadac_per_unit: string         // Price per unit (as string from API)
  effective_date: string         // When this price became effective
  pricing_unit: string           // EA (each), ML, GM, etc.
  pharmacy_type_indicator: string // C/I = Chain/Independent
  otc: string                    // Y/N - Over the counter
  classification_for_rate_setting: string // G = Generic, B = Brand
  as_of_date: string            // Data snapshot date
}

/**
 * Parsed drug pricing result
 */
export interface DrugPricing {
  ndc: string
  drugName: string
  nadacPerUnit: number          // Wholesale cost per unit
  pricingUnit: string
  estimatedRetailPerUnit: number // With markup
  estimated30DayWholesale: number
  estimated30DayRetail: number
  estimated90DayWholesale: number
  estimated90DayRetail: number
  isGeneric: boolean
  isOTC: boolean
  effectiveDate: string
  source: 'NADAC'
}

/**
 * Search results with metadata
 */
export interface NADACSearchResult {
  drugs: DrugPricing[]
  totalCount: number
  searchTerm: string
  cached: boolean
}

// In-memory cache for frequently searched drugs
const drugCache = new Map<string, { data: DrugPricing[]; timestamp: number }>()
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days (NADAC updates weekly)

// Typical pharmacy markup factors
const DISPENSING_FEE = 10.00          // Average dispensing fee
const GENERIC_MARKUP = 0.20           // 20% markup on generics
const BRAND_MARKUP = 0.15             // 15% markup on brands (lower margin)
const DISCOUNT_PHARMACY_MARKUP = 0.10 // 10% at Costco, Walmart, etc.

/**
 * NADAC Service Class
 */
export class NADACService {
  private client: AxiosInstance
  private readonly datasetId = 'f38d0706-1239-442c-a3cc-40ef1b686ac0'
  private readonly baseUrl = 'https://data.medicaid.gov/api/1/datastore/query'

  constructor() {
    this.client = axios.create({
      timeout: 30000, // NADAC API can be slow
      headers: {
        'Accept': 'application/json',
      },
    })
  }

  /**
   * Search for drugs by name
   *
   * @param searchTerm - Drug name to search (e.g., "metformin", "lisinopril 10 mg")
   * @param limit - Maximum results to return (default 20)
   * @returns Drug pricing results
   */
  async searchDrugs(searchTerm: string, limit: number = 20): Promise<NADACSearchResult> {
    const normalizedSearch = searchTerm.toUpperCase().trim()
    const cacheKey = `search:${normalizedSearch}:${limit}`

    // Check cache
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return {
        drugs: cached,
        totalCount: cached.length,
        searchTerm,
        cached: true,
      }
    }

    try {
      const url = new URL(`${this.baseUrl}/${this.datasetId}/0`)
      url.searchParams.set('limit', limit.toString())
      url.searchParams.set('conditions[0][property]', 'ndc_description')
      url.searchParams.set('conditions[0][value]', `%${normalizedSearch}%`)
      url.searchParams.set('conditions[0][operator]', 'LIKE')

      const response = await this.client.get<{
        results: NADACDrugRecord[]
        count: number
      }>(url.toString())

      const drugs = response.data.results.map(record => this.parseRecord(record))

      // Cache results
      this.setCache(cacheKey, drugs)

      return {
        drugs,
        totalCount: response.data.count,
        searchTerm,
        cached: false,
      }
    } catch (error) {
      console.error('[NADAC] Search error:', error)
      throw new Error(`Failed to search NADAC database: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Look up drug by exact NDC code
   *
   * @param ndc - 11-digit National Drug Code
   * @returns Drug pricing or null if not found
   */
  async lookupByNDC(ndc: string): Promise<DrugPricing | null> {
    const cleanNDC = ndc.replace(/[^0-9]/g, '')
    const cacheKey = `ndc:${cleanNDC}`

    // Check cache
    const cached = this.getFromCache(cacheKey)
    if (cached && cached.length > 0) {
      return cached[0]
    }

    try {
      const url = new URL(`${this.baseUrl}/${this.datasetId}/0`)
      url.searchParams.set('limit', '1')
      url.searchParams.set('conditions[0][property]', 'ndc')
      url.searchParams.set('conditions[0][value]', cleanNDC)
      url.searchParams.set('conditions[0][operator]', '=')

      const response = await this.client.get<{
        results: NADACDrugRecord[]
      }>(url.toString())

      if (response.data.results.length === 0) {
        return null
      }

      const drug = this.parseRecord(response.data.results[0])

      // Cache result
      this.setCache(cacheKey, [drug])

      return drug
    } catch (error) {
      console.error('[NADAC] NDC lookup error:', error)
      return null
    }
  }

  /**
   * Get pricing for multiple drugs at once
   *
   * @param drugNames - Array of drug names to search
   * @returns Map of drug name to pricing
   */
  async getPricingForMultipleDrugs(drugNames: string[]): Promise<Map<string, DrugPricing | null>> {
    const results = new Map<string, DrugPricing | null>()

    // Process in parallel with rate limiting
    const chunks = this.chunkArray(drugNames, 5) // 5 concurrent requests

    for (const chunk of chunks) {
      const promises = chunk.map(async (name) => {
        const searchResult = await this.searchDrugs(name, 1)
        return { name, pricing: searchResult.drugs[0] || null }
      })

      const chunkResults = await Promise.all(promises)
      chunkResults.forEach(({ name, pricing }) => {
        results.set(name, pricing)
      })

      // Small delay between chunks to be nice to the API
      await this.delay(100)
    }

    return results
  }

  /**
   * Get common drug categories with example pricing
   * Useful for displaying "typical costs" on the frontend
   */
  async getCommonDrugPricing(): Promise<Record<string, DrugPricing[]>> {
    const categories = {
      diabetes: ['metformin', 'glipizide', 'glimepiride'],
      bloodPressure: ['lisinopril', 'amlodipine', 'losartan'],
      cholesterol: ['atorvastatin', 'simvastatin', 'pravastatin'],
      thyroid: ['levothyroxine'],
      mentalHealth: ['sertraline', 'fluoxetine', 'escitalopram'],
      painRelief: ['ibuprofen', 'naproxen', 'acetaminophen'],
    }

    const results: Record<string, DrugPricing[]> = {}

    for (const [category, drugs] of Object.entries(categories)) {
      const categoryResults: DrugPricing[] = []

      for (const drug of drugs) {
        const searchResult = await this.searchDrugs(drug, 3)
        if (searchResult.drugs.length > 0) {
          // Get the cheapest generic option
          const cheapest = searchResult.drugs
            .filter(d => d.isGeneric)
            .sort((a, b) => a.nadacPerUnit - b.nadacPerUnit)[0]
          if (cheapest) {
            categoryResults.push(cheapest)
          }
        }
      }

      results[category] = categoryResults
    }

    return results
  }

  /**
   * Calculate retail price estimate from NADAC
   */
  calculateRetailPrice(
    nadacPerUnit: number,
    quantity: number,
    isGeneric: boolean,
    pharmacyType: 'retail' | 'discount' = 'retail'
  ): number {
    const markup = pharmacyType === 'discount'
      ? DISCOUNT_PHARMACY_MARKUP
      : (isGeneric ? GENERIC_MARKUP : BRAND_MARKUP)

    const subtotal = nadacPerUnit * quantity * (1 + markup)
    const total = subtotal + DISPENSING_FEE

    return Math.round(total * 100) / 100 // Round to 2 decimals
  }

  /**
   * Save pricing to database cache
   */
  async cachePricingToDatabase(drugs: DrugPricing[]): Promise<void> {
    for (const drug of drugs) {
      await prisma.prescriptionPrice.upsert({
        where: { ndc: drug.ndc },
        create: {
          ndc: drug.ndc,
          drugName: drug.drugName,
          genericName: drug.drugName, // NADAC doesn't separate brand/generic names
          dosage: drug.pricingUnit || 'unit',
          form: 'unknown',
          quantity: 30,
          zipCode: '00000', // NADAC is national pricing
          pharmacyName: 'NADAC',
          price: drug.estimated30DayRetail,
          source: 'NADAC',
          sourceId: drug.ndc,
          cachedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
        update: {
          price: drug.estimated30DayRetail,
          cachedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
    }
  }

  /**
   * Get cached pricing from database
   */
  async getCachedPricing(drugName: string): Promise<DrugPricing | null> {
    const cached = await prisma.prescriptionPrice.findFirst({
      where: {
        drugName: { contains: drugName, mode: 'insensitive' },
        source: 'NADAC',
        cachedAt: { gte: new Date(Date.now() - CACHE_TTL_MS) },
      },
      orderBy: { cachedAt: 'desc' },
    })

    if (!cached) return null

    // Convert database record back to DrugPricing
    return {
      ndc: cached.ndc || '',
      drugName: cached.drugName,
      nadacPerUnit: cached.price / 30, // Approximate from 30-day price
      pricingUnit: 'EA',
      estimatedRetailPerUnit: cached.price / 30,
      estimated30DayWholesale: cached.price * 0.8,
      estimated30DayRetail: cached.price,
      estimated90DayWholesale: cached.price * 0.8 * 3 * 0.9, // 10% discount
      estimated90DayRetail: cached.price * 3 * 0.9,
      isGeneric: true,
      isOTC: false,
      effectiveDate: cached.cachedAt.toISOString().split('T')[0],
      source: 'NADAC',
    }
  }

  // Private helper methods

  private parseRecord(record: NADACDrugRecord): DrugPricing {
    const nadacPerUnit = parseFloat(record.nadac_per_unit) || 0
    const isGeneric = record.classification_for_rate_setting === 'G'
    const isOTC = record.otc === 'Y'

    // Calculate estimated retail prices
    const retailMarkup = isGeneric ? GENERIC_MARKUP : BRAND_MARKUP
    const estimatedRetailPerUnit = nadacPerUnit * (1 + retailMarkup)

    // Standard quantities: 30-day and 90-day supplies (assuming 1 unit/day)
    const unitsPerMonth = 30
    const wholesale30 = nadacPerUnit * unitsPerMonth
    const retail30 = this.calculateRetailPrice(nadacPerUnit, unitsPerMonth, isGeneric, 'retail')
    const wholesale90 = nadacPerUnit * unitsPerMonth * 3
    const retail90 = this.calculateRetailPrice(nadacPerUnit, unitsPerMonth * 3, isGeneric, 'retail') * 0.9 // 10% 90-day discount

    return {
      ndc: record.ndc,
      drugName: record.ndc_description,
      nadacPerUnit,
      pricingUnit: record.pricing_unit,
      estimatedRetailPerUnit,
      estimated30DayWholesale: Math.round(wholesale30 * 100) / 100,
      estimated30DayRetail: retail30,
      estimated90DayWholesale: Math.round(wholesale90 * 100) / 100,
      estimated90DayRetail: Math.round(retail90 * 100) / 100,
      isGeneric,
      isOTC,
      effectiveDate: record.effective_date,
      source: 'NADAC',
    }
  }

  private getFromCache(key: string): DrugPricing[] | null {
    const entry = drugCache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      drugCache.delete(key)
      return null
    }

    return entry.data
  }

  private setCache(key: string, data: DrugPricing[]): void {
    drugCache.set(key, { data, timestamp: Date.now() })
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: drugCache.size,
      keys: Array.from(drugCache.keys()).slice(0, 20),
    }
  }

  /**
   * Clear in-memory cache
   */
  clearCache(): void {
    drugCache.clear()
    console.log('[NADAC] Cache cleared')
  }
}

// Singleton instance
let nadacInstance: NADACService | null = null

/**
 * Get or create NADAC service instance
 */
export function getNADACService(): NADACService {
  if (!nadacInstance) {
    nadacInstance = new NADACService()
  }
  return nadacInstance
}

/**
 * Convenience function: Search for drug pricing
 */
export async function searchDrugPricing(drugName: string): Promise<DrugPricing[]> {
  const service = getNADACService()
  const result = await service.searchDrugs(drugName)
  return result.drugs
}
