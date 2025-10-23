/**
 * Cost Comparison Service
 * Core logic for comparing Traditional Insurance vs DPC + Catastrophic plans
 */

export interface ComparisonInput {
  age: number
  zipCode: string
  state: string
  chronicConditions: string[]
  annualDoctorVisits: number
  prescriptionCount: number
  currentPremium?: number
  currentDeductible?: number
}

export interface ComparisonResult {
  // Traditional insurance costs
  traditionalPremium: number
  traditionalDeductible: number
  traditionalOutOfPocket: number
  traditionalTotalAnnual: number

  // DPC + Catastrophic costs
  dpcMonthlyFee: number
  dpcAnnualFee: number
  catastrophicPremium: number
  catastrophicDeductible: number
  catastrophicOutOfPocket: number
  dpcTotalAnnual: number

  // Results
  annualSavings: number
  percentageSavings: number
  recommendedPlan: 'TRADITIONAL' | 'DPC_CATASTROPHIC'

  breakdown: {
    traditional: CostBreakdown
    dpc: CostBreakdown
  }
}

export interface CostBreakdown {
  premiums: number
  deductible: number
  copays: number
  prescriptions: number
  outOfPocket: number
  total: number
}

/**
 * Calculate comprehensive cost comparison
 */
export async function calculateComparison(
  input: ComparisonInput
): Promise<ComparisonResult> {
  // Calculate traditional insurance costs
  const traditional = calculateTraditionalCosts(input)

  // Calculate DPC + Catastrophic costs
  const dpc = calculateDPCCosts(input)

  // Determine savings
  const annualSavings = traditional.total - dpc.total
  const percentageSavings = (annualSavings / traditional.total) * 100

  // Recommend plan
  const recommendedPlan = annualSavings > 0 ? 'DPC_CATASTROPHIC' : 'TRADITIONAL'

  return {
    // Traditional costs
    traditionalPremium: traditional.premiums / 12, // Monthly
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
  }
}

/**
 * Calculate traditional insurance costs
 */
function calculateTraditionalCosts(input: ComparisonInput): CostBreakdown {
  // Base premium calculation (varies by age and location)
  const monthlyPremium = calculateTraditionalPremium(input.age, input.state)
  const annualPremium = monthlyPremium * 12

  // Deductible
  const deductible = 1500 // Average deductible

  // Copays for doctor visits
  const copayPerVisit = 35 // Average copay
  const totalCopays = input.annualDoctorVisits * copayPerVisit

  // Prescription costs
  const prescriptionCostPerMonth = 30 // Average generic prescription
  const totalPrescriptions = input.prescriptionCount * prescriptionCostPerMonth * 12

  // Out of pocket costs (before hitting max)
  const outOfPocket = totalCopays + totalPrescriptions

  // Total annual cost
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
 * Calculate DPC + Catastrophic insurance costs
 */
function calculateDPCCosts(
  input: ComparisonInput
): CostBreakdown & { catastrophicPremium: number } {
  // DPC monthly membership (typically $50-150/month)
  const dpcMonthlyFee = calculateDPCFee(input.chronicConditions.length)
  const dpcAnnualFee = dpcMonthlyFee * 12

  // Catastrophic insurance premium (much lower than traditional)
  const catastrophicMonthlyPremium = calculateCatastrophicPremium(input.age, input.state)
  const catastrophicAnnualPremium = catastrophicMonthlyPremium * 12

  // High deductible (but DPC covers primary care)
  const deductible = 8000 // Typical catastrophic deductible

  // No copays for DPC-covered services
  const copays = 0

  // Prescriptions - may be cheaper through DPC or need separate coverage
  // Assuming 50% discount through DPC negotiations
  const prescriptionCostPerMonth = 15
  const totalPrescriptions = input.prescriptionCount * prescriptionCostPerMonth * 12

  // Out of pocket (specialists, procedures not covered by DPC)
  const outOfPocket = totalPrescriptions

  // Total annual cost
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
 * Calculate traditional insurance premium based on age and state
 */
function calculateTraditionalPremium(age: number, state: string): number {
  // Base premium
  let basePremium = 400 // National average

  // Age adjustment (premiums increase with age)
  if (age < 30) {
    basePremium *= 0.8
  } else if (age < 40) {
    basePremium *= 0.9
  } else if (age < 50) {
    basePremium *= 1.0
  } else if (age < 60) {
    basePremium *= 1.3
  } else {
    basePremium *= 1.8
  }

  // State adjustment (some states are more expensive)
  const stateMultipliers: Record<string, number> = {
    CA: 1.2,
    NY: 1.3,
    FL: 1.1,
    TX: 0.9,
    // Add more states as needed
  }
  const stateMultiplier = stateMultipliers[state] || 1.0
  basePremium *= stateMultiplier

  return Math.round(basePremium)
}

/**
 * Calculate DPC membership fee
 */
function calculateDPCFee(chronicConditionCount: number): number {
  // Base DPC fee
  let fee = 75 // Average monthly DPC fee

  // Higher fees for complex patients
  if (chronicConditionCount > 2) {
    fee += 25
  } else if (chronicConditionCount > 0) {
    fee += 10
  }

  return fee
}

/**
 * Calculate catastrophic insurance premium
 */
function calculateCatastrophicPremium(age: number, state: string): number {
  // Catastrophic plans are typically 40-60% cheaper than traditional
  const traditionalPremium = calculateTraditionalPremium(age, state)
  return Math.round(traditionalPremium * 0.3) // 70% cheaper
}

/**
 * Estimate annual out-of-pocket costs based on health profile
 */
export function estimateOutOfPocketCosts(
  chronicConditions: string[],
  annualVisits: number
): number {
  // Base costs for healthy individual
  let costs = 500

  // Additional costs for chronic conditions
  costs += chronicConditions.length * 1000

  // Additional costs for frequent visits
  if (annualVisits > 6) {
    costs += (annualVisits - 6) * 150
  }

  return costs
}
