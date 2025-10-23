export interface InsurancePlan {
  type: 'traditional' | 'dpc';
  monthlyPremium: number;
  deductible: number;
  coinsurance: number;
  copay: number;
  outOfPocketMax: number;
  dpcMonthlyFee?: number;
}

export interface HealthcareUsage {
  primaryCareVisits: number;
  specialistVisits: number;
  urgentCareVisits: number;
  erVisits: number;
  prescriptions: number;
  labTests: number;
  imaging: number;
}

export interface UserProfile {
  zipCode: string;
  age: number;
  familySize: number;
  chronicConditions: string[];
}

export interface CostComparison {
  traditional: {
    totalAnnualCost: number;
    breakdown: {
      premiums: number;
      outOfPocket: number;
      prescriptions: number;
      preventiveCare: number;
    };
  };
  dpc: {
    totalAnnualCost: number;
    breakdown: {
      dpcMembership: number;
      catastrophicInsurance: number;
      outOfPocket: number;
      prescriptions: number;
    };
  };
  savings: number;
  savingsPercentage: number;
}

export interface DPCProvider {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website?: string;
  monthlyFee: number;
  familyMonthlyFee?: number;
  servicesIncluded: string[];
  acceptingPatients: boolean;
  distance?: number;
  rating?: number;
  reviewCount?: number;
}

export interface ComparisonRequest {
  currentPlan: InsurancePlan;
  usage: HealthcareUsage;
  profile: UserProfile;
}

export interface ComparisonResponse {
  comparison: CostComparison;
  providers: DPCProvider[];
  recommendations: string[];
}
