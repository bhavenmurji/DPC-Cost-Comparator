/**
 * Healthcare.gov API Data Transformer
 *
 * Transforms Healthcare.gov API responses into our application's data models
 * and provides mapping between our ComparisonInput and API request formats.
 *
 * FIPS Lookup Strategy:
 * 1. Check in-memory cache (populated by Census Bureau lookups)
 * 2. Check hardcoded fallback mappings
 * 3. Fall back to state's most populous county (for synchronous calls)
 * 4. For async calls, query Census Bureau Geocoding API
 */

import {
  ComparisonInput,
  CostBreakdown,
} from '../services/costComparison.service'
import {
  PlanSearchRequest,
  HealthcareGovPlan,
  HealthcareGovHousehold,
  HealthcareGovPlace,
} from '../types/healthcareGov.types'
import {
  getCensusBureauService,
  lookupCountyFipsByZip,
  FipsLookupResult,
} from '../services/censusBureau.service'

/**
 * Runtime FIPS cache - populated by Census Bureau API lookups
 * This supplements the hardcoded fallbacks and persists during app lifetime
 */
const RUNTIME_FIPS_CACHE: Map<string, string> = new Map()

/**
 * County FIPS code fallback lookup
 * Used when Census Bureau API is unavailable or rate-limited
 * Source: https://www.census.gov/library/reference/code-lists/ansi.html
 */
const COUNTY_FIPS_FALLBACK: Record<string, string> = {
  // North Carolina examples
  '27360': '37057', // Davidson County
  '27701': '37063', // Durham County
  '27511': '37183', // Wake County

  // California examples
  '90001': '06037', // Los Angeles County
  '90210': '06037', // Los Angeles County (Beverly Hills)
  '94102': '06075', // San Francisco County
  '92101': '06073', // San Diego County

  // New York examples
  '10001': '36061', // New York County (Manhattan)
  '11201': '36047', // Kings County (Brooklyn)

  // Texas examples
  '75201': '48113', // Dallas County
  '77001': '48201', // Harris County (Houston)
  '78701': '48453', // Travis County (Austin)

  // Florida examples
  '33101': '12086', // Miami-Dade County
  '32801': '12095', // Orange County (Orlando)
  '33601': '12057', // Hillsborough County (Tampa)

  // Additional common ZIP codes
  // (This serves as a fallback when Census API is unavailable)
}

/**
 * State abbreviation lookup by ZIP code prefix
 */
const STATE_BY_ZIP_PREFIX: Record<string, string> = {
  '27': 'NC', '28': 'NC', // North Carolina
  '90': 'CA', '91': 'CA', '92': 'CA', '93': 'CA', '94': 'CA', '95': 'CA', '96': 'CA', // California
  '10': 'NY', '11': 'NY', '12': 'NY', '13': 'NY', '14': 'NY', // New York
  '75': 'TX', '76': 'TX', '77': 'TX', '78': 'TX', '79': 'TX', // Texas
  '32': 'FL', '33': 'FL', '34': 'FL', // Florida
  // Add more as needed...
}

/**
 * Convert our ComparisonInput to Healthcare.gov API Place object
 */
export function transformToPlace(input: ComparisonInput): HealthcareGovPlace {
  const state = input.state || inferStateFromZip(input.zipCode)
  const countyfips = inferCountyFipsFromZip(input.zipCode)

  return {
    state,
    zipcode: input.zipCode,
    countyfips,
  }
}

/**
 * Convert our ComparisonInput to Healthcare.gov API Household object
 */
export function transformToHousehold(
  input: ComparisonInput,
  income: number = 50000
): HealthcareGovHousehold {
  return {
    income,
    people: [
      {
        age: input.age,
        aptc_eligible: true,
        uses_tobacco: false,
        gender: 'Male', // Default, could be added to input
      },
    ],
  }
}

/**
 * Create complete PlanSearchRequest from ComparisonInput
 */
export function transformToPlanSearchRequest(
  input: ComparisonInput,
  options: {
    metalLevel?: string[]
    year?: number
    income?: number
    limit?: number
  } = {}
): PlanSearchRequest {
  const place = transformToPlace(input)
  const household = transformToHousehold(input, options.income)

  return {
    household,
    place,
    market: 'Individual',
    year: options.year || new Date().getFullYear(),
    filter: options.metalLevel ? { metal: options.metalLevel } : undefined,
    sort: 'premium',
    order: 'asc',
    limit: options.limit || 10,
  }
}

/**
 * Extract traditional plan costs from Healthcare.gov plan data
 */
export function extractTraditionalCosts(
  plan: HealthcareGovPlan,
  input: ComparisonInput
): Partial<CostBreakdown> {
  const monthlyPremium = plan.premium.premium_w_credit || plan.premium.premium
  const annualPremium = monthlyPremium * 12

  // Extract deductible (use individual deductible)
  const deductible = plan.benefits.deductible.individual || 0

  // Estimate copays based on visit frequency
  const copayPerVisit = extractCopayAmount(plan.benefits.primary_care_visit)
  const totalCopays = input.annualDoctorVisits * copayPerVisit

  // Estimate prescription costs
  const prescriptionCostPerMonth = extractPrescriptionCost(plan.benefits.generic_drugs)
  const totalPrescriptions = input.prescriptionCount * prescriptionCostPerMonth * 12

  // Out of pocket
  const outOfPocket = totalCopays + totalPrescriptions

  // Total
  const total = annualPremium + deductible + outOfPocket

  return {
    premiums: annualPremium,
    deductible,
    copays: totalCopays,
    prescriptions: totalPrescriptions,
    outOfPocket,
    total,
  }
}

/**
 * Extract catastrophic plan costs from Healthcare.gov plan data
 * Returns CostBreakdown-compatible shape with additional catastrophic fields
 */
export function extractCatastrophicCosts(
  plan: HealthcareGovPlan,
  dpcMonthlyFee: number
): {
  premiums: number
  deductible: number
  copays: number
  prescriptions: number
  outOfPocket: number
  total: number
  catastrophicPremium: number
} {
  const monthlyPremium = plan.premium.premium_w_credit || plan.premium.premium
  const catastrophicPremium = monthlyPremium * 12

  const catastrophicDeductible = plan.benefits.deductible.individual || 0

  // With DPC, most primary care is covered, minimal out-of-pocket
  const catastrophicOutOfPocket = 0

  const dpcAnnualFee = dpcMonthlyFee * 12

  const total = catastrophicPremium + dpcAnnualFee + catastrophicOutOfPocket

  return {
    // CostBreakdown fields
    premiums: catastrophicPremium + dpcAnnualFee,
    deductible: catastrophicDeductible,
    copays: 0, // DPC covers primary care visits
    prescriptions: 0, // Not included in this calculation
    outOfPocket: catastrophicOutOfPocket,
    total,
    // Additional catastrophic field
    catastrophicPremium,
  }
}

/**
 * Extract copay amount from cost sharing string
 * Examples: "$35", "$35 copay", "30% coinsurance after deductible"
 */
function extractCopayAmount(costSharing?: string): number {
  if (!costSharing) return 35 // Default copay

  // Extract dollar amount
  const match = costSharing.match(/\$(\d+)/)
  if (match) {
    return parseInt(match[1], 10)
  }

  // If it's a percentage (coinsurance), estimate based on average visit cost
  if (costSharing.includes('%')) {
    const percentMatch = costSharing.match(/(\d+)%/)
    if (percentMatch) {
      const percent = parseInt(percentMatch[1], 10)
      const averageVisitCost = 200 // Average primary care visit
      return (averageVisitCost * percent) / 100
    }
  }

  return 35 // Default fallback
}

/**
 * Extract prescription cost from cost sharing string
 */
function extractPrescriptionCost(costSharing?: string): number {
  if (!costSharing) return 30 // Default generic cost

  // Extract dollar amount
  const match = costSharing.match(/\$(\d+)/)
  if (match) {
    return parseInt(match[1], 10)
  }

  // If it's a percentage, estimate
  if (costSharing.includes('%')) {
    const percentMatch = costSharing.match(/(\d+)%/)
    if (percentMatch) {
      const percent = parseInt(percentMatch[1], 10)
      const averageGenericCost = 50
      return (averageGenericCost * percent) / 100
    }
  }

  return 30 // Default fallback
}

/**
 * Infer state from ZIP code
 */
function inferStateFromZip(zipCode: string): string {
  const prefix = zipCode.substring(0, 2)
  return STATE_BY_ZIP_PREFIX[prefix] || 'NC' // Default to NC
}

/**
 * Infer county FIPS code from ZIP code (synchronous)
 *
 * Uses layered lookup strategy:
 * 1. Runtime cache (populated by Census Bureau API)
 * 2. Hardcoded fallback mappings
 * 3. State's most populous county as last resort
 */
function inferCountyFipsFromZip(zipCode: string): string {
  // 1. Check runtime cache (populated by async Census lookups)
  const cachedFips = RUNTIME_FIPS_CACHE.get(zipCode)
  if (cachedFips) {
    return cachedFips
  }

  // 2. Check hardcoded fallback
  if (COUNTY_FIPS_FALLBACK[zipCode]) {
    return COUNTY_FIPS_FALLBACK[zipCode]
  }

  // 3. Fallback to default by state (use most populous county)
  const state = inferStateFromZip(zipCode)
  const stateFipsDefaults: Record<string, string> = {
    'NC': '37063', // Durham County
    'CA': '06037', // Los Angeles County
    'NY': '36061', // New York County
    'TX': '48201', // Harris County
    'FL': '12086', // Miami-Dade County
    'IL': '17031', // Cook County (Chicago)
    'PA': '42101', // Philadelphia County
    'OH': '39035', // Cuyahoga County (Cleveland)
    'GA': '13121', // Fulton County (Atlanta)
    'MI': '26163', // Wayne County (Detroit)
    'AZ': '04013', // Maricopa County (Phoenix)
    'WA': '53033', // King County (Seattle)
    'MA': '25025', // Suffolk County (Boston)
    'CO': '08031', // Denver County
    'NV': '32003', // Clark County (Las Vegas)
    'OR': '41051', // Multnomah County (Portland)
    'MN': '27053', // Hennepin County (Minneapolis)
    'VA': '51760', // Richmond city
    'NJ': '34013', // Essex County (Newark)
    'MD': '24510', // Baltimore city
  }

  return stateFipsDefaults[state] || '37063' // Default to Durham, NC
}

/**
 * Calculate DPC fee based on chronic conditions
 */
export function calculateDPCFee(chronicConditionCount: number): number {
  let fee = 75 // Base DPC fee

  // Higher fees for complex patients
  if (chronicConditionCount > 2) {
    fee += 25
  } else if (chronicConditionCount > 0) {
    fee += 10
  }

  return fee
}

/**
 * Validate Healthcare.gov API response
 */
export function validatePlanResponse(plan: HealthcareGovPlan): boolean {
  return !!(
    plan.id &&
    plan.name &&
    plan.metal_level &&
    plan.premium &&
    plan.benefits &&
    plan.benefits.deductible
  )
}

/**
 * Format plan name for display
 */
export function formatPlanName(plan: HealthcareGovPlan): string {
  return `${plan.issuer.name} - ${plan.name} (${plan.metal_level})`
}

/**
 * Get plan details summary
 */
export function getPlanSummary(plan: HealthcareGovPlan): string {
  const premium = plan.premium.premium_w_credit || plan.premium.premium
  const deductible = plan.benefits.deductible.individual
  const moop = plan.benefits.maximum_out_of_pocket.individual

  return `Premium: $${premium}/mo | Deductible: $${deductible} | Max OOP: $${moop}`
}

/**
 * Lookup county FIPS by ZIP code (async)
 *
 * Uses the US Census Bureau Geocoding API to resolve ZIP codes to County FIPS.
 * Results are cached in RUNTIME_FIPS_CACHE for subsequent synchronous lookups.
 *
 * @param zipCode - 5-digit US ZIP code
 * @returns 5-digit County FIPS code or null if not found
 */
export async function lookupCountyFips(zipCode: string): Promise<string | null> {
  // 1. Check runtime cache first
  const cachedFips = RUNTIME_FIPS_CACHE.get(zipCode)
  if (cachedFips) {
    return cachedFips
  }

  // 2. Check hardcoded fallback
  if (COUNTY_FIPS_FALLBACK[zipCode]) {
    RUNTIME_FIPS_CACHE.set(zipCode, COUNTY_FIPS_FALLBACK[zipCode])
    return COUNTY_FIPS_FALLBACK[zipCode]
  }

  // 3. Query Census Bureau API
  try {
    const fips = await lookupCountyFipsByZip(zipCode)
    if (fips) {
      // Cache for future synchronous lookups
      RUNTIME_FIPS_CACHE.set(zipCode, fips)
      return fips
    }
  } catch (error) {
    console.warn(`[HealthcareGovTransformer] Census lookup failed for ZIP ${zipCode}:`, error)
  }

  // 4. Fall back to state default
  const defaultFips = inferCountyFipsFromZip(zipCode)
  return defaultFips
}

/**
 * Add ZIP/county mapping to the runtime cache
 */
export function addCountyFipsMapping(zipCode: string, countyFips: string): void {
  RUNTIME_FIPS_CACHE.set(zipCode, countyFips)
}

/**
 * Pre-load FIPS data for a ZIP code before making Healthcare.gov API calls
 * This ensures the synchronous inferCountyFipsFromZip has the correct data
 *
 * @param zipCode - 5-digit US ZIP code
 * @returns The resolved FIPS code
 */
export async function ensureFipsLoaded(zipCode: string): Promise<string> {
  // First try to load via Census Bureau API
  const fips = await lookupCountyFips(zipCode)
  return fips || inferCountyFipsFromZip(zipCode)
}

/**
 * Transform input to Place with async FIPS resolution
 * Use this instead of transformToPlace when you need accurate county data
 */
export async function transformToPlaceAsync(input: ComparisonInput): Promise<HealthcareGovPlace> {
  const state = input.state || inferStateFromZip(input.zipCode)

  // Pre-load FIPS via Census Bureau API
  const countyfips = await ensureFipsLoaded(input.zipCode)

  return {
    state,
    zipcode: input.zipCode,
    countyfips,
  }
}

/**
 * Get FIPS cache statistics
 */
export function getFipsCacheStats(): { size: number; entries: string[] } {
  return {
    size: RUNTIME_FIPS_CACHE.size,
    entries: Array.from(RUNTIME_FIPS_CACHE.keys()).slice(0, 20), // First 20 entries
  }
}
