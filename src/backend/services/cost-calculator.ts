import { logger } from '../utils/logger';

export interface HealthProfile {
  age: number;
  hasChronicConditions: boolean;
  chronicConditions?: string[];
  estimatedAnnualVisits: number;
  estimatedSpecialistVisits: number;
  estimatedPrescriptions: number;
  estimatedLabWork: number;
}

export interface InsurancePlan {
  monthlyPremium: number;
  annualDeductible: number;
  outOfPocketMax: number;
  copayPrimaryCare?: number;
  copaySpecialist?: number;
  copayEmergency?: number;
  coinsurancePercentage?: number;
}

export interface DPCProvider {
  monthlyMembershipFee: number;
  familyMembershipFee?: number;
  enrollmentFee?: number;
  prescriptionDiscountAvailable: boolean;
  labWorkIncluded: boolean;
}

export interface CostBreakdown {
  premiums: number;
  deductible: number;
  copays: number;
  coinsurance: number;
  dpcMembership: number;
  dpcEnrollment: number;
  prescriptions: number;
  labWork: number;
  total: number;
}

export interface CostComparisonResult {
  insuranceOnly: {
    totalAnnualCost: number;
    breakdown: CostBreakdown;
  };
  dpcOnly: {
    totalAnnualCost: number;
    breakdown: CostBreakdown;
  };
  insurancePlusDpc: {
    totalAnnualCost: number;
    breakdown: CostBreakdown;
  };
  bestOption: 'insurance_only' | 'dpc_only' | 'insurance_plus_dpc';
  potentialSavings: number;
  savingsPercentage: number;
}

export class CostCalculatorService {
  // Average costs (can be customized or pulled from database)
  private static readonly AVERAGE_SPECIALIST_COST = 200;
  private static readonly AVERAGE_PRIMARY_CARE_COST = 150;
  private static readonly AVERAGE_LAB_WORK_COST = 100;
  private static readonly AVERAGE_PRESCRIPTION_COST = 50;
  private static readonly EMERGENCY_VISIT_COST = 1500;

  /**
   * Calculate total costs for insurance-only scenario
   */
  private static calculateInsuranceOnly(
    healthProfile: HealthProfile,
    plan: InsurancePlan
  ): { totalAnnualCost: number; breakdown: CostBreakdown } {
    const breakdown: CostBreakdown = {
      premiums: plan.monthlyPremium * 12,
      deductible: 0,
      copays: 0,
      coinsurance: 0,
      dpcMembership: 0,
      dpcEnrollment: 0,
      prescriptions: 0,
      labWork: 0,
      total: 0,
    };

    // Calculate primary care visits
    const primaryCareCost = healthProfile.estimatedAnnualVisits * (plan.copayPrimaryCare || this.AVERAGE_PRIMARY_CARE_COST);

    // Calculate specialist visits
    const specialistCost = healthProfile.estimatedSpecialistVisits * (plan.copaySpecialist || this.AVERAGE_SPECIALIST_COST);

    // Calculate lab work
    const labWorkCost = healthProfile.estimatedLabWork * this.AVERAGE_LAB_WORK_COST;

    // Calculate prescriptions
    const prescriptionCost = healthProfile.estimatedPrescriptions * this.AVERAGE_PRESCRIPTION_COST;

    // Sum of medical costs before insurance
    const totalMedicalCosts = primaryCareCost + specialistCost + labWorkCost + prescriptionCost;

    // Calculate deductible usage
    const deductibleMet = Math.min(totalMedicalCosts, plan.annualDeductible);
    breakdown.deductible = deductibleMet;

    // Calculate costs after deductible
    const costsAfterDeductible = Math.max(0, totalMedicalCosts - plan.annualDeductible);

    // Calculate coinsurance (patient pays percentage after deductible)
    const coinsuranceAmount = costsAfterDeductible * ((plan.coinsurancePercentage || 20) / 100);
    breakdown.coinsurance = Math.min(coinsuranceAmount, plan.outOfPocketMax - deductibleMet);

    // Set breakdown values
    breakdown.copays = 0; // Copays are included in the visit costs when deductible is met
    breakdown.prescriptions = healthProfile.estimatedPrescriptions * this.AVERAGE_PRESCRIPTION_COST * 0.3; // Assume 30% after insurance
    breakdown.labWork = 0; // Included in deductible/coinsurance calculation

    // Total out-of-pocket cannot exceed max
    const outOfPocket = Math.min(
      breakdown.deductible + breakdown.coinsurance + breakdown.prescriptions,
      plan.outOfPocketMax
    );

    breakdown.total = breakdown.premiums + outOfPocket;

    return { totalAnnualCost: breakdown.total, breakdown };
  }

  /**
   * Calculate total costs for DPC-only scenario (no insurance)
   */
  private static calculateDpcOnly(
    healthProfile: HealthProfile,
    provider: DPCProvider
  ): { totalAnnualCost: number; breakdown: CostBreakdown } {
    const breakdown: CostBreakdown = {
      premiums: 0,
      deductible: 0,
      copays: 0,
      coinsurance: 0,
      dpcMembership: provider.monthlyMembershipFee * 12,
      dpcEnrollment: provider.enrollmentFee || 0,
      prescriptions: 0,
      labWork: 0,
      total: 0,
    };

    // DPC covers primary care visits, so no additional cost there

    // Specialist visits (not typically covered by DPC)
    const specialistCost = healthProfile.estimatedSpecialistVisits * this.AVERAGE_SPECIALIST_COST;

    // Lab work
    breakdown.labWork = provider.labWorkIncluded
      ? 0
      : healthProfile.estimatedLabWork * this.AVERAGE_LAB_WORK_COST;

    // Prescriptions
    breakdown.prescriptions = provider.prescriptionDiscountAvailable
      ? healthProfile.estimatedPrescriptions * this.AVERAGE_PRESCRIPTION_COST * 0.5 // 50% discount
      : healthProfile.estimatedPrescriptions * this.AVERAGE_PRESCRIPTION_COST;

    breakdown.total =
      breakdown.dpcMembership +
      breakdown.dpcEnrollment +
      specialistCost +
      breakdown.labWork +
      breakdown.prescriptions;

    return { totalAnnualCost: breakdown.total, breakdown };
  }

  /**
   * Calculate total costs for insurance + DPC scenario
   */
  private static calculateInsurancePlusDpc(
    healthProfile: HealthProfile,
    plan: InsurancePlan,
    provider: DPCProvider
  ): { totalAnnualCost: number; breakdown: CostBreakdown } {
    const breakdown: CostBreakdown = {
      premiums: plan.monthlyPremium * 12,
      deductible: 0,
      copays: 0,
      coinsurance: 0,
      dpcMembership: provider.monthlyMembershipFee * 12,
      dpcEnrollment: provider.enrollmentFee || 0,
      prescriptions: 0,
      labWork: 0,
      total: 0,
    };

    // Primary care is covered by DPC (no copays or deductible for these visits)

    // Specialist visits use insurance
    const specialistCost = healthProfile.estimatedSpecialistVisits * (plan.copaySpecialist || this.AVERAGE_SPECIALIST_COST);

    // Calculate deductible (reduced because primary care doesn't count)
    const medicalCostsCountingTowardDeductible = specialistCost;
    const deductibleMet = Math.min(medicalCostsCountingTowardDeductible, plan.annualDeductible);
    breakdown.deductible = deductibleMet;

    // Calculate coinsurance on specialist visits after deductible
    const costsAfterDeductible = Math.max(0, specialistCost - plan.annualDeductible);
    const coinsuranceAmount = costsAfterDeductible * ((plan.coinsurancePercentage || 20) / 100);
    breakdown.coinsurance = Math.min(coinsuranceAmount, plan.outOfPocketMax - deductibleMet);

    // Lab work covered by DPC if included
    breakdown.labWork = provider.labWorkIncluded
      ? 0
      : healthProfile.estimatedLabWork * this.AVERAGE_LAB_WORK_COST * 0.2; // Assume insurance covers 80%

    // Prescriptions with DPC discount
    breakdown.prescriptions = provider.prescriptionDiscountAvailable
      ? healthProfile.estimatedPrescriptions * this.AVERAGE_PRESCRIPTION_COST * 0.4 // Better discount with both
      : healthProfile.estimatedPrescriptions * this.AVERAGE_PRESCRIPTION_COST * 0.3;

    breakdown.total =
      breakdown.premiums +
      breakdown.dpcMembership +
      breakdown.dpcEnrollment +
      breakdown.deductible +
      breakdown.coinsurance +
      breakdown.labWork +
      breakdown.prescriptions;

    return { totalAnnualCost: breakdown.total, breakdown };
  }

  /**
   * Main cost comparison method
   */
  public static calculateComparison(
    healthProfile: HealthProfile,
    insurancePlan: InsurancePlan,
    dpcProvider: DPCProvider
  ): CostComparisonResult {
    logger.info('Calculating cost comparison', {
      age: healthProfile.age,
      hasChronicConditions: healthProfile.hasChronicConditions,
    });

    // Calculate all three scenarios
    const insuranceOnly = this.calculateInsuranceOnly(healthProfile, insurancePlan);
    const dpcOnly = this.calculateDpcOnly(healthProfile, dpcProvider);
    const insurancePlusDpc = this.calculateInsurancePlusDpc(healthProfile, insurancePlan, dpcProvider);

    // Determine best option
    const costs = {
      insurance_only: insuranceOnly.totalAnnualCost,
      dpc_only: dpcOnly.totalAnnualCost,
      insurance_plus_dpc: insurancePlusDpc.totalAnnualCost,
    };

    const bestOption = Object.entries(costs).reduce((a, b) =>
      a[1] < b[1] ? a : b
    )[0] as 'insurance_only' | 'dpc_only' | 'insurance_plus_dpc';

    const bestCost = costs[bestOption];
    const worstCost = Math.max(...Object.values(costs));
    const potentialSavings = worstCost - bestCost;
    const savingsPercentage = (potentialSavings / worstCost) * 100;

    const result: CostComparisonResult = {
      insuranceOnly,
      dpcOnly,
      insurancePlusDpc,
      bestOption,
      potentialSavings,
      savingsPercentage,
    };

    logger.info('Cost comparison completed', {
      bestOption,
      potentialSavings,
      savingsPercentage: savingsPercentage.toFixed(2) + '%',
    });

    return result;
  }

  /**
   * Calculate insurance-only costs (for when no DPC provider selected)
   */
  public static calculateInsuranceOnlyScenario(
    healthProfile: HealthProfile,
    insurancePlan: InsurancePlan
  ): { totalAnnualCost: number; breakdown: CostBreakdown } {
    return this.calculateInsuranceOnly(healthProfile, insurancePlan);
  }

  /**
   * Calculate DPC-only costs (for when no insurance selected)
   */
  public static calculateDpcOnlyScenario(
    healthProfile: HealthProfile,
    dpcProvider: DPCProvider
  ): { totalAnnualCost: number; breakdown: CostBreakdown } {
    return this.calculateDpcOnly(healthProfile, dpcProvider);
  }
}

/**
 * Convenience function for API route handlers
 * Transforms frontend data format to calculator format
 */
export function calculateCostComparison(
  currentPlan: any,
  usage: any,
  profile: any
): CostComparisonResult {
  // Transform frontend data to calculator format
  const healthProfile: HealthProfile = {
    age: profile.age || 35,
    hasChronicConditions: (profile.chronicConditions && profile.chronicConditions.length > 0) || false,
    chronicConditions: profile.chronicConditions || [],
    estimatedAnnualVisits: usage.primaryCareVisits || 4,
    estimatedSpecialistVisits: usage.specialistVisits || 2,
    estimatedPrescriptions: usage.prescriptions || 3,
    estimatedLabWork: usage.labTests || 2,
  };

  const insurancePlan: InsurancePlan = {
    monthlyPremium: currentPlan.monthlyPremium || 500,
    annualDeductible: currentPlan.deductible || 3000,
    outOfPocketMax: currentPlan.outOfPocketMax || 8000,
    copayPrimaryCare: currentPlan.copay || 30,
    copaySpecialist: currentPlan.copay ? currentPlan.copay * 1.5 : 50,
    copayEmergency: 500,
    coinsurancePercentage: currentPlan.coinsurance || 20,
  };

  // Use default DPC provider settings
  const dpcProvider: DPCProvider = {
    monthlyMembershipFee: 75, // Average DPC membership
    familyMembershipFee: profile.familySize > 1 ? 150 : undefined,
    enrollmentFee: 50,
    prescriptionDiscountAvailable: true,
    labWorkIncluded: true,
  };

  return CostCalculatorService.calculateComparison(healthProfile, insurancePlan, dpcProvider);
}
