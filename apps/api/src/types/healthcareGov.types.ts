/**
 * Healthcare.gov Marketplace API Type Definitions
 * API Documentation: https://developer.cms.gov/marketplace-api/api-spec
 *
 * This file contains TypeScript interfaces for the CMS Marketplace API
 * for retrieving real insurance plan and premium data.
 */

/**
 * API Request Types
 */

export interface HealthcareGovPlace {
  /** 2-letter state abbreviation (e.g., "NC", "CA") */
  state: string
  /** 5-digit county FIPS code (e.g., "37057") */
  countyfips: string
  /** 5-digit ZIP code (e.g., "27360") */
  zipcode: string
}

export interface HealthcareGovPerson {
  /** Age of the person (required if DOB not provided) */
  age?: number
  /** Date of birth in YYYY-MM-DD format */
  dob?: string
  /** Whether person is eligible for Advanced Premium Tax Credit */
  aptc_eligible?: boolean
  /** Gender: "Male", "Female", or other */
  gender?: string
  /** Whether person uses tobacco products */
  uses_tobacco?: boolean
  /** Whether person is currently pregnant */
  is_pregnant?: boolean
  /** Expected number of children */
  expected_children?: number
  /** Whether person is a parent or caretaker */
  is_parent?: boolean
}

export interface HealthcareGovHousehold {
  /** Annual household income (affects APTC/CSR) */
  income: number
  /** Array of household members */
  people: HealthcareGovPerson[]
  /** Coverage effective date in YYYY-MM-DD format */
  effective_date?: string
  /** Whether any household member received unemployment (2021+ affects APTC) */
  unemployment_received?: boolean
  /** Whether household has access to employer coverage */
  has_mec?: boolean
}

export interface PlanSearchFilter {
  /** Metal tier(s): "catastrophic", "bronze", "silver", "gold", "platinum" */
  metal?: string[]
  /** Plan type(s): "HMO", "PPO", "EPO", "POS" */
  type?: string[]
  /** Specific issuer ID(s) to filter by */
  issuer?: string[]
  /** Whether plan includes HSA */
  hsa_eligible?: boolean
  /** Minimum quality rating (1-5 stars) */
  quality_rating?: number
  /** Whether to include child dental coverage */
  child_dental?: boolean
  /** Premium range filter */
  premium?: {
    min?: number
    max?: number
  }
  /** Deductible range filter */
  deductible?: {
    min?: number
    max?: number
  }
}

export interface PlanSearchRequest {
  /** Household composition and income data (required) */
  household: HealthcareGovHousehold
  /** Location information (required) */
  place: HealthcareGovPlace
  /** Market type: "Individual" or "SHOP" (required) */
  market: 'Individual' | 'SHOP'
  /** Coverage year (defaults to current enrollment year) */
  year?: number
  /** Optional filtering criteria */
  filter?: PlanSearchFilter
  /** Sort by: "premium", "deductible", "oopc", "total_costs", "quality_rating" */
  sort?: 'premium' | 'deductible' | 'oopc' | 'total_costs' | 'quality_rating'
  /** Sort order: "asc" or "desc" */
  order?: 'asc' | 'desc'
  /** Pagination offset */
  offset?: number
  /** Results per page (max 100) */
  limit?: number
  /** Manual APTC override amount */
  aptc_override?: number
  /** Force specific CSR variant */
  csr_override?: string
  /** Show catastrophic plans (normally restricted by age/hardship) */
  catastrophic_override?: boolean
}

/**
 * API Response Types
 */

export interface PremiumBreakdown {
  /** Total premium before any credits */
  premium: number
  /** Advanced Premium Tax Credit amount */
  premium_tax_credit?: number
  /** Premium after APTC applied */
  premium_w_credit?: number
}

export interface Deductible {
  /** Individual deductible amount */
  individual: number
  /** Family deductible amount */
  family: number
  /** Combined medical and drug deductible */
  combined?: number
}

export interface MaximumOutOfPocket {
  /** Individual MOOP */
  individual: number
  /** Family MOOP */
  family: number
  /** Network type: "In Network", "Out of Network", or "Combined" */
  network_tier?: string
  /** CSR variant (affects MOOP for silver plans) */
  csr_variant?: string
}

export interface BenefitCoverage {
  /** Name of the benefit */
  name: string
  /** Whether benefit is covered */
  covered: boolean
  /** Cost sharing amount */
  cost_sharing?: string
  /** Additional explanation */
  explanation?: string
}

export interface PlanBenefits {
  /** Individual/family deductible */
  deductible: Deductible
  /** Maximum out-of-pocket costs */
  maximum_out_of_pocket: MaximumOutOfPocket
  /** Primary care visit copay */
  primary_care_visit?: string
  /** Specialist visit copay */
  specialist_visit?: string
  /** Emergency room copay */
  emergency_room?: string
  /** Urgent care copay */
  urgent_care?: string
  /** Generic drug copay */
  generic_drugs?: string
  /** Preferred brand drug copay */
  preferred_brand_drugs?: string
  /** Non-preferred brand drug copay */
  non_preferred_brand_drugs?: string
  /** Specialty drug copay */
  specialty_drugs?: string
  /** Full list of covered benefits */
  benefits?: BenefitCoverage[]
}

export interface HealthcareGovPlan {
  /** Unique plan ID (14-character HIOS ID + variant) */
  id: string
  /** Plan marketing name */
  name: string
  /** Metal tier: "Catastrophic", "Bronze", "Silver", "Gold", "Platinum" */
  metal_level: string
  /** Plan type: "HMO", "PPO", "EPO", "POS" */
  type: string
  /** Issuer information */
  issuer: {
    id: string
    name: string
  }
  /** Premium information */
  premium: PremiumBreakdown
  /** Plan benefits and cost sharing */
  benefits: PlanBenefits
  /** Quality rating (1-5 stars) */
  quality_rating?: number
  /** Whether plan is HSA eligible */
  hsa_eligible?: boolean
  /** Network size tier */
  network_tier?: string
  /** Plan ID for the previous year (for comparison) */
  last_year_plan_id?: string
  /** Whether plan is new for this year */
  is_new?: boolean
}

export interface PlanSearchResponse {
  /** Array of matching plans */
  plans: HealthcareGovPlan[]
  /** Total number of plans matching filter */
  total: number
  /** Pagination offset used */
  offset: number
  /** Number of results per page */
  limit: number
  /** Applied filters */
  filter?: PlanSearchFilter
}

/**
 * Eligibility and Subsidy Calculation Types
 */

export interface EligibilityEstimate {
  /** Advanced Premium Tax Credit annual amount */
  aptc: number
  /** Cost Sharing Reduction variant (for silver plans) */
  csr: string
  /** Estimated household income as % of Federal Poverty Level */
  fpl_percent: number
  /** Whether household is Medicaid/CHIP eligible */
  medicaid_chip?: boolean
  /** Whether household is eligible for catastrophic plans */
  catastrophic_eligible?: boolean
}

export interface EligibilityRequest {
  household: HealthcareGovHousehold
  place: HealthcareGovPlace
  market: 'Individual' | 'SHOP'
  year?: number
}

export interface EligibilityResponse {
  estimates: EligibilityEstimate
}

/**
 * Plan Details Request/Response
 */

export interface PlanDetailsRequest {
  /** Plan ID to retrieve */
  plan_id: string
  /** Household data for premium calculation */
  household?: HealthcareGovHousehold
  /** Year for plan data */
  year?: number
}

export interface PlanDetailsResponse extends HealthcareGovPlan {
  /** Detailed benefits information */
  benefits: PlanBenefits & {
    benefits: BenefitCoverage[]
  }
  /** Provider network information */
  provider_network?: {
    size: string
    url: string
  }
  /** Drug formulary URL */
  formulary_url?: string
  /** Summary of benefits and coverage URL */
  sbc_url?: string
}

/**
 * SLCSP (Second Lowest Cost Silver Plan) Types
 */

export interface SLCSPRequest {
  household: HealthcareGovHousehold
  place: HealthcareGovPlace
  year?: number
}

export interface SLCSPResponse {
  /** Second lowest cost silver plan premium */
  slcsp_premium: number
  /** SLCSP plan ID */
  plan_id?: string
}

/**
 * API Error Types
 */

export interface HealthcareGovError {
  /** HTTP status code */
  status: number
  /** Error code (1000-1017) */
  code: number
  /** Human-readable error message */
  message: string
  /** Additional error details */
  details?: Record<string, unknown>
}

/**
 * API Configuration
 */

export interface HealthcareGovConfig {
  /** API key for authentication */
  apiKey: string
  /** Base API URL (default: https://marketplace.api.healthcare.gov) */
  baseUrl?: string
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number
  /** Whether to enable caching (default: true) */
  enableCache?: boolean
  /** Cache TTL in seconds (default: 86400 - 24 hours) */
  cacheTTL?: number
}
