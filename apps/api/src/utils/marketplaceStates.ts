/**
 * Healthcare Marketplace State Information
 * Identifies which states use federal marketplace vs state-based exchanges
 *
 * Updated for 2025 enrollment period
 */

/**
 * States that operate State-Based Exchanges (SBE) with their own platforms
 * These states do NOT use Healthcare.gov and are NOT accessible via the federal API
 */
export const STATE_BASED_EXCHANGES = [
  'CA', // Covered California
  'CO', // Connect for Health Colorado
  'CT', // Access Health CT
  'DC', // DC Health Link
  'ID', // Your Health Idaho
  'MA', // Massachusetts Health Connector
  'MD', // Maryland Health Connection
  'MN', // MNsure
  'NV', // Nevada Health Link
  'NJ', // Get Covered New Jersey
  'NY', // NY State of Health
  'PA', // Pennie
  'RI', // HealthSource RI
  'VT', // Vermont Health Connect
  'WA', // Washington Healthplanfinder
] as const

/**
 * States that use State-Based Exchanges on Federal Platform (SBE-FP)
 * These states manage their own marketplace but use Healthcare.gov for enrollment
 * They MAY be accessible via the federal API
 */
export const STATE_BASED_ON_FEDERAL_PLATFORM = [
  'AR', // Arkansas
  'KY', // Kentucky
  'ME', // Maine
  'NM', // New Mexico
  'OR', // Oregon
] as const

/**
 * All other states use the Federally Facilitated Marketplace (FFM)
 * These states ARE accessible via the Healthcare.gov API
 */
export const FEDERAL_MARKETPLACE_STATES = [
  'AL', 'AK', 'AZ', 'DE', 'FL', 'GA', 'HI', 'IL', 'IN', 'IA',
  'KS', 'LA', 'MI', 'MS', 'MO', 'MT', 'NE', 'NH', 'NC', 'ND',
  'OH', 'OK', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'WV', 'WI', 'WY',
] as const

export type StateCode = string

export interface MarketplaceInfo {
  type: 'federal' | 'state-based' | 'state-based-federal-platform'
  name: string
  website?: string
  supportsHealthcareGovAPI: boolean
  reason?: string
}

/**
 * Get marketplace information for a state
 */
export function getMarketplaceInfo(state: StateCode): MarketplaceInfo {
  const stateUpper = state.toUpperCase()

  // Check State-Based Exchanges (own platform)
  if (STATE_BASED_EXCHANGES.includes(stateUpper as any)) {
    const marketplaceNames: Record<string, string> = {
      CA: 'Covered California',
      CO: 'Connect for Health Colorado',
      CT: 'Access Health CT',
      DC: 'DC Health Link',
      ID: 'Your Health Idaho',
      MA: 'Massachusetts Health Connector',
      MD: 'Maryland Health Connection',
      MN: 'MNsure',
      NV: 'Nevada Health Link',
      NJ: 'Get Covered New Jersey',
      NY: 'NY State of Health',
      PA: 'Pennie',
      RI: 'HealthSource RI',
      VT: 'Vermont Health Connect',
      WA: 'Washington Healthplanfinder',
    }

    return {
      type: 'state-based',
      name: marketplaceNames[stateUpper] || `${stateUpper} State Marketplace`,
      supportsHealthcareGovAPI: false,
      reason: 'State operates its own marketplace platform separate from Healthcare.gov',
    }
  }

  // Check State-Based on Federal Platform
  if (STATE_BASED_ON_FEDERAL_PLATFORM.includes(stateUpper as any)) {
    return {
      type: 'state-based-federal-platform',
      name: `${stateUpper} State Marketplace (Federal Platform)`,
      supportsHealthcareGovAPI: true,
      reason: 'State uses Healthcare.gov platform but may have limited API access',
    }
  }

  // Federal Marketplace
  return {
    type: 'federal',
    name: 'Healthcare.gov',
    website: 'https://www.healthcare.gov',
    supportsHealthcareGovAPI: true,
  }
}

/**
 * Check if a state supports the Healthcare.gov API
 */
export function supportsHealthcareGovAPI(state: StateCode): boolean {
  return getMarketplaceInfo(state).supportsHealthcareGovAPI
}

/**
 * Get user-friendly message explaining why API data is unavailable
 */
export function getAPIUnavailableMessage(state: StateCode): string {
  const info = getMarketplaceInfo(state)

  if (info.type === 'state-based') {
    return `${state} uses ${info.name}, a state-run marketplace. Visit their website for official plan pricing.`
  }

  if (info.type === 'state-based-federal-platform') {
    return `${state} uses a state-based marketplace on the federal platform. API access may be limited.`
  }

  return `Marketplace data temporarily unavailable for ${state}.`
}
