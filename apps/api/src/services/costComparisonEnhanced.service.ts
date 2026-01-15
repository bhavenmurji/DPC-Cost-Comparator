/**
 * Enhanced Cost Comparison Service with Healthcare.gov API Integration
 *
 * This service extends the original cost comparison with real marketplace data
 * from the Healthcare.gov API while maintaining fallback to estimates.
 */

import {
  ComparisonInput,
  ComparisonResult,
  CostBreakdown,
} from './costComparison.service'
import {
  getHealthcareGovClient,
  isHealthcareGovConfigured,
} from './healthcareGov.service'
import {
  transformToPlanSearchRequest,
  extractTraditionalCosts,
  extractCatastrophicCosts,
  calculateDPCFee,
  validatePlanResponse,
  ensureFipsLoaded,
  getFipsCacheStats,
} from '../utils/healthcareGovTransformer'
import { HealthcareGovPlan } from '../types/healthcareGov.types'
import {
  supportsHealthcareGovAPI,
  getMarketplaceInfo,
  getAPIUnavailableMessage,
} from '../utils/marketplaceStates'

/**
 * Enhanced comparison result with data source information
 */
export interface EnhancedComparisonResult extends ComparisonResult {
  dataSource: {
    traditional: 'api' | 'estimate'
    catastrophic: 'api' | 'estimate'
    lastUpdated?: Date
    marketplaceType?: 'federal' | 'state-based' | 'state-based-federal-platform'
    marketplaceName?: string
    apiUnavailableReason?: string
  }
  planDetails?: {
    traditionalPlan?: HealthcareGovPlan
    catastrophicPlan?: HealthcareGovPlan
  }
}

/**
 * Calculate comprehensive cost comparison with real API data
 */
export async function calculateEnhancedComparison(
  input: ComparisonInput,
  options: {
    income?: number
    year?: number
    useApiData?: boolean
  } = {}
): Promise<EnhancedComparisonResult> {
  // Check marketplace availability for this state
  const marketplaceInfo = getMarketplaceInfo(input.state)
  const canUseAPI = supportsHealthcareGovAPI(input.state) &&
                    options.useApiData !== false &&
                    isHealthcareGovConfigured()

  let traditional: CostBreakdown
  let dpc: CostBreakdown & { catastrophicPremium: number }
  let traditionalSource: 'api' | 'estimate' = 'estimate'
  let catastrophicSource: 'api' | 'estimate' = 'estimate'
  let traditionalPlan: HealthcareGovPlan | undefined
  let catastrophicPlan: HealthcareGovPlan | undefined
  let apiUnavailableReason: string | undefined

  if (!marketplaceInfo.supportsHealthcareGovAPI) {
    // State uses its own marketplace, log informative message
    console.log(`ℹ️  ${input.state} uses ${marketplaceInfo.name}, not Healthcare.gov`)
    console.log(`   Using cost estimates for ${input.state}`)
    apiUnavailableReason = marketplaceInfo.reason
  }

  if (canUseAPI) {
    try {
      // Fetch real data from Healthcare.gov API
      const { traditional: apiTraditional, catastrophic: apiCatastrophic } =
        await fetchRealPlanData(input, options)

      if (apiTraditional.plan) {
        traditional = apiTraditional.costs
        traditionalSource = 'api'
        traditionalPlan = apiTraditional.plan
      } else {
        traditional = calculateTraditionalCostsEstimate(input)
      }

      if (apiCatastrophic.plan) {
        dpc = apiCatastrophic.costs
        catastrophicSource = 'api'
        catastrophicPlan = apiCatastrophic.plan
      } else {
        dpc = calculateDPCCostsEstimate(input)
      }
    } catch (error) {
      console.error('Failed to fetch Healthcare.gov data, falling back to estimates')
      console.error('Error details:', JSON.stringify(error, null, 2))
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      traditional = calculateTraditionalCostsEstimate(input)
      dpc = calculateDPCCostsEstimate(input)
    }
  } else {
    // Use estimates
    traditional = calculateTraditionalCostsEstimate(input)
    dpc = calculateDPCCostsEstimate(input)
  }

  // Calculate savings
  const annualSavings = traditional.total - dpc.total
  const percentageSavings = (annualSavings / traditional.total) * 100

  // Recommend plan
  const recommendedPlan = annualSavings > 0 ? 'DPC_CATASTROPHIC' : 'TRADITIONAL'

  return {
    // Traditional costs
    traditionalPremium: traditional.premiums / 12,
    traditionalDeductible: traditional.deductible,
    traditionalOutOfPocket: traditional.outOfPocket,
    traditionalTotalAnnual: traditional.total,

    // DPC costs
    dpcMonthlyFee: dpc.premiums / 12,
    dpcAnnualFee: dpc.premiums,
    catastrophicPremium: dpc.catastrophicPremium || 0,
    catastrophicDeductible: dpc.deductible,
    catastrophicOutOfPocket: dpc.outOfPocket,
    dpcTotalAnnual: dpc.total,

    // Results
    annualSavings,
    percentageSavings,
    recommendedPlan,

    breakdown: {
      traditional,
      dpc,
    },

    // Data source information
    dataSource: {
      traditional: traditionalSource,
      catastrophic: catastrophicSource,
      lastUpdated: new Date(),
      marketplaceType: marketplaceInfo.type,
      marketplaceName: marketplaceInfo.name,
      apiUnavailableReason,
    },

    // Plan details (if from API)
    planDetails: traditionalPlan || catastrophicPlan ? {
      traditionalPlan,
      catastrophicPlan,
    } : undefined,
  }
}

/**
 * Fetch real plan data from Healthcare.gov API
 */
async function fetchRealPlanData(
  input: ComparisonInput,
  options: {
    income?: number
    year?: number
  }
): Promise<{
  traditional: { plan?: HealthcareGovPlan; costs: CostBreakdown }
  catastrophic: { plan?: HealthcareGovPlan; costs: CostBreakdown & { catastrophicPremium: number } }
}> {
  const client = getHealthcareGovClient()

  // Search for traditional plans (silver tier as benchmark)
  const traditionalRequest = transformToPlanSearchRequest(input, {
    metalLevel: ['silver'],
    year: options.year,
    income: options.income || 50000,
    limit: 5,
  })

  console.log('Healthcare.gov API Request (Traditional):', JSON.stringify(traditionalRequest, null, 2))

  const traditionalResponse = await client.searchPlans(traditionalRequest)
  const traditionalPlan = traditionalResponse.plans.find(validatePlanResponse)

  // Search for catastrophic plans
  const catastrophicRequest = transformToPlanSearchRequest(input, {
    metalLevel: ['catastrophic'],
    year: options.year,
    income: options.income || 50000,
    limit: 5,
  })

  const catastrophicResponse = await client.searchPlans(catastrophicRequest)
  const catastrophicPlan = catastrophicResponse.plans.find(validatePlanResponse)

  // Calculate DPC fee
  const dpcMonthlyFee = calculateDPCFee(input.chronicConditions.length)

  // Extract costs from plans or use estimates
  const traditionalCosts = traditionalPlan
    ? (extractTraditionalCosts(traditionalPlan, input) as CostBreakdown)
    : calculateTraditionalCostsEstimate(input)

  const catastrophicCosts = catastrophicPlan
    ? extractCatastrophicCosts(catastrophicPlan, dpcMonthlyFee)
    : calculateDPCCostsEstimate(input)

  return {
    traditional: {
      plan: traditionalPlan,
      costs: traditionalCosts,
    },
    catastrophic: {
      plan: catastrophicPlan,
      costs: catastrophicCosts,
    },
  }
}

/**
 * Calculate traditional insurance costs (estimate fallback)
 */
function calculateTraditionalCostsEstimate(input: ComparisonInput): CostBreakdown {
  // Base premium calculation
  const monthlyPremium = calculateTraditionalPremiumEstimate(input.age, input.state)
  const annualPremium = monthlyPremium * 12

  // Deductible
  const deductible = 1500

  // Copays
  const copayPerVisit = 35
  const totalCopays = input.annualDoctorVisits * copayPerVisit

  // Prescriptions
  const prescriptionCostPerMonth = 30
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
 * Calculate DPC + catastrophic costs (estimate fallback)
 */
function calculateDPCCostsEstimate(
  input: ComparisonInput
): CostBreakdown & { catastrophicPremium: number } {
  // DPC fee
  const dpcMonthlyFee = calculateDPCFee(input.chronicConditions.length)
  const dpcAnnualFee = dpcMonthlyFee * 12

  // Catastrophic premium
  const catastrophicMonthlyPremium = calculateCatastrophicPremiumEstimate(input.age, input.state)
  const catastrophicAnnualPremium = catastrophicMonthlyPremium * 12

  // Deductible
  const deductible = 8000

  // No copays with DPC
  const copays = 0

  // Prescriptions (reduced with DPC)
  const prescriptionCostPerMonth = 15
  const totalPrescriptions = input.prescriptionCount * prescriptionCostPerMonth * 12

  // Out of pocket
  const outOfPocket = totalPrescriptions

  // Total
  const total = dpcAnnualFee + catastrophicAnnualPremium + outOfPocket

  return {
    premiums: dpcAnnualFee,
    catastrophicPremium: catastrophicAnnualPremium,
    deductible,
    copays,
    prescriptions: totalPrescriptions,
    outOfPocket,
    total,
  }
}

/**
 * Estimate traditional premium by age and state
 */
function calculateTraditionalPremiumEstimate(age: number, state: string): number {
  let basePremium = 400

  if (age < 30) basePremium *= 0.8
  else if (age < 40) basePremium *= 0.9
  else if (age < 50) basePremium *= 1.0
  else if (age < 60) basePremium *= 1.3
  else basePremium *= 1.8

  const stateMultipliers: Record<string, number> = {
    CA: 1.2,
    NY: 1.3,
    FL: 1.1,
    TX: 0.9,
  }
  basePremium *= stateMultipliers[state] || 1.0

  return Math.round(basePremium)
}

/**
 * Estimate catastrophic premium by age and state
 */
function calculateCatastrophicPremiumEstimate(age: number, state: string): number {
  const traditionalPremium = calculateTraditionalPremiumEstimate(age, state)
  return Math.round(traditionalPremium * 0.3)
}

/**
 * Check if Healthcare.gov API is available
 */
export function checkApiAvailability(): {
  available: boolean
  message: string
} {
  if (!isHealthcareGovConfigured()) {
    return {
      available: false,
      message: 'Healthcare.gov API client not configured. Using estimates.',
    }
  }

  return {
    available: true,
    message: 'Healthcare.gov API is configured and available.',
  }
}
