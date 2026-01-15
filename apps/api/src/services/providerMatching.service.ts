/**
 * Provider Matching Service
 * Matches users with nearby DPC providers based on location and needs
 */

import {
  searchProvidersNearby,
  getProviderById,
  type ProviderSearchParams,
  type ProviderWithDistance,
} from '../repositories/dpcProvider.repository'

export interface ProviderSearchCriteria {
  zipCode: string
  state: string
  maxDistanceMiles?: number
  specialtiesNeeded?: string[]
  chronicConditions?: string[]
  languagePreference?: string
  maxMonthlyFee?: number
}

export interface MatchedProviderResult {
  provider: DPCProviderInfo
  distanceMiles: number
  matchScore: number
  matchReasons: string[]
}

export interface DPCProviderInfo {
  id: string
  npi: string | null
  name: string
  practiceName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email?: string | null
  website?: string | null
  monthlyFee: number
  familyFee?: number | null
  acceptingPatients: boolean
  servicesIncluded: string[]
  specialties: string[]
  boardCertifications: string[]
  languages: string[]
  rating?: number | null
  reviewCount: number
  latitude?: number | null
  longitude?: number | null
}

/**
 * Find and rank DPC providers based on criteria
 */
export async function findMatchingProviders(
  criteria: ProviderSearchCriteria,
  limit: number = 10
): Promise<MatchedProviderResult[]> {
  // Check if we should use mock data (for development/testing)
  console.log('🔍 Provider Search - USE_MOCK_DATA:', process.env.USE_MOCK_DATA)
  console.log('🔍 Provider Search - Criteria:', JSON.stringify(criteria, null, 2))

  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('⚠️  Using MOCK provider data')
    return findMatchingProvidersMock(criteria, limit)
  }

  console.log('✅ Searching REAL providers from database')

  try {
    // Search database for providers
    const searchParams: ProviderSearchParams = {
      zipCode: criteria.zipCode,
      maxDistanceMiles: criteria.maxDistanceMiles || 50,
      state: criteria.state,
      specialties: criteria.specialtiesNeeded,
      languages: criteria.languagePreference ? [criteria.languagePreference] : undefined,
      maxMonthlyFee: criteria.maxMonthlyFee,
      acceptingPatientsOnly: true,
    }

    console.log('📍 Database search params:', JSON.stringify(searchParams, null, 2))
    const providers = await searchProvidersNearby(searchParams)
    console.log(`✅ Found ${providers.length} providers from database`)

    // Calculate match scores for each provider
    const scoredProviders = providers.map((provider) => {
      const matchScore = calculateMatchScore(provider, criteria, provider.distanceMiles)
      const matchReasons = generateMatchReasons(provider, criteria, provider.distanceMiles)

      return {
        provider: mapProviderToInfo(provider),
        distanceMiles: provider.distanceMiles,
        matchScore,
        matchReasons,
      }
    })

    // Sort by match score and limit results
    const sorted = scoredProviders
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return sorted
  } catch (error) {
    console.error('Error searching providers from database:')
    console.error('Error name:', (error as any).name)
    console.error('Error message:', (error as any).message)
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    // Temporarily throw to see full error
    throw error
  }
}

/**
 * Mock provider matching (fallback for development)
 */
function findMatchingProvidersMock(
  criteria: ProviderSearchCriteria,
  limit: number = 10
): MatchedProviderResult[] {
  const mockProviders = generateMockProviders(criteria.state, criteria.zipCode)

  // Calculate match scores for each provider
  const scoredProviders = mockProviders.map((provider) => {
    const distance = calculateDistanceMock(criteria.zipCode, provider.zipCode)
    const matchScore = calculateMatchScore(provider, criteria, distance)
    const matchReasons = generateMatchReasons(provider, criteria, distance)

    return {
      provider,
      distanceMiles: distance,
      matchScore,
      matchReasons,
    }
  })

  // Filter by distance and sort by match score
  const maxDistance = criteria.maxDistanceMiles || 50
  const filtered = scoredProviders
    .filter((match) => match.distanceMiles <= maxDistance)
    .filter((match) => match.provider.acceptingPatients)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)

  return filtered
}

/**
 * Map database provider to DPCProviderInfo interface
 */
function mapProviderToInfo(provider: ProviderWithDistance): DPCProviderInfo {
  return {
    id: provider.id,
    npi: provider.npi,
    name: provider.name,
    practiceName: provider.practiceName,
    address: provider.address,
    city: provider.city,
    state: provider.state,
    zipCode: provider.zipCode,
    phone: provider.phone,
    email: provider.email || undefined,
    website: provider.website || undefined,
    monthlyFee: provider.monthlyFee,
    familyFee: provider.familyFee || undefined,
    acceptingPatients: provider.acceptingPatients,
    servicesIncluded: provider.servicesIncluded,
    specialties: provider.specialties,
    boardCertifications: provider.boardCertifications,
    languages: provider.languages,
    rating: provider.rating || undefined,
    reviewCount: provider.reviewCount,
    latitude: provider.latitude || undefined,
    longitude: provider.longitude || undefined,
  }
}

/**
 * Calculate match score (0-100) for a provider
 */
function calculateMatchScore(
  provider: DPCProviderInfo,
  criteria: ProviderSearchCriteria,
  distance: number
): number {
  let score = 100

  // Distance penalty (closer is better)
  if (distance > 25) {
    score -= 20
  } else if (distance > 10) {
    score -= 10
  } else if (distance > 5) {
    score -= 5
  }

  // Monthly fee consideration
  if (criteria.maxMonthlyFee && provider.monthlyFee > criteria.maxMonthlyFee) {
    score -= 15
  }

  // Specialties bonus
  if (criteria.specialtiesNeeded && criteria.specialtiesNeeded.length > 0) {
    const matchingSpecialties = provider.specialties.filter((s) =>
      criteria.specialtiesNeeded?.includes(s)
    )
    score += matchingSpecialties.length * 10
  }

  // Language match bonus
  if (criteria.languagePreference) {
    if (provider.languages.includes(criteria.languagePreference)) {
      score += 10
    }
  }

  // Rating bonus
  if (provider.rating && provider.rating >= 4.5) {
    score += 10
  } else if (provider.rating && provider.rating >= 4.0) {
    score += 5
  }

  // Board certification bonus
  if (provider.boardCertifications.length > 0) {
    score += 5
  }

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score))
}

/**
 * Generate human-readable match reasons
 */
function generateMatchReasons(
  provider: DPCProviderInfo,
  criteria: ProviderSearchCriteria,
  distance: number
): string[] {
  const reasons: string[] = []

  // Distance
  if (distance < 5) {
    reasons.push('Very close to your location')
  } else if (distance < 15) {
    reasons.push('Conveniently located nearby')
  }

  // Rating
  if (provider.rating && provider.rating >= 4.5) {
    reasons.push('Highly rated by patients')
  }

  // Specialties
  if (criteria.specialtiesNeeded && criteria.specialtiesNeeded.length > 0) {
    const matchingSpecialties = provider.specialties.filter((s) =>
      criteria.specialtiesNeeded?.includes(s)
    )
    if (matchingSpecialties.length > 0) {
      reasons.push(`Specializes in ${matchingSpecialties.join(', ')}`)
    }
  }

  // Language
  if (criteria.languagePreference && provider.languages.includes(criteria.languagePreference)) {
    reasons.push(`Speaks ${criteria.languagePreference}`)
  }

  // Accepting patients
  if (provider.acceptingPatients) {
    reasons.push('Currently accepting new patients')
  }

  // Board certified
  if (provider.boardCertifications.length > 0) {
    reasons.push('Board certified')
  }

  // Affordable
  if (provider.monthlyFee < 80) {
    reasons.push('Affordable monthly fee')
  }

  return reasons
}

/**
 * Calculate distance between two ZIP codes (mock - for development only)
 * Real distance calculation is handled by the repository layer using Haversine formula
 */
function calculateDistanceMock(zipCode1: string, zipCode2: string): number {
  // Simplified: estimate based on ZIP code proximity
  const diff = Math.abs(parseInt(zipCode1) - parseInt(zipCode2))

  if (diff === 0) return 0
  if (diff < 10) return Math.random() * 5 + 2 // 2-7 miles
  if (diff < 50) return Math.random() * 15 + 10 // 10-25 miles
  if (diff < 100) return Math.random() * 20 + 25 // 25-45 miles

  return Math.random() * 30 + 50 // 50-80 miles
}

/**
 * Generate mock DPC providers for testing
 * In production, this would query the database
 */
function generateMockProviders(state: string, nearZipCode: string): DPCProviderInfo[] {
  const baseZip = parseInt(nearZipCode)

  return [
    {
      id: 'prov-1',
      npi: '1234567890',
      name: 'Dr. Sarah Johnson',
      practiceName: 'Johnson Family Medicine DPC',
      address: '123 Main Street',
      city: 'Springfield',
      state,
      zipCode: nearZipCode,
      phone: '555-0100',
      email: 'contact@johnsonfamilydpc.com',
      website: 'https://johnsonfamilydpc.com',
      monthlyFee: 75,
      familyFee: 150,
      acceptingPatients: true,
      servicesIncluded: [
        'Unlimited office visits',
        'Same-day appointments',
        'Telemedicine',
        'Basic lab work',
        'Chronic disease management',
      ],
      specialties: ['Family Medicine', 'Internal Medicine'],
      boardCertifications: ['American Board of Family Medicine'],
      languages: ['English', 'Spanish'],
      rating: 4.8,
      reviewCount: 127,
    },
    {
      id: 'prov-2',
      npi: '2345678901',
      name: 'Dr. Michael Chen',
      practiceName: 'Chen Comprehensive Care',
      address: '456 Oak Avenue',
      city: 'Springfield',
      state,
      zipCode: (baseZip + 5).toString(),
      phone: '555-0200',
      website: 'https://chendpc.com',
      monthlyFee: 85,
      acceptingPatients: true,
      servicesIncluded: [
        'Unlimited visits',
        '24/7 text access',
        'Annual wellness exam',
        'Minor procedures',
      ],
      specialties: ['Internal Medicine', 'Preventive Medicine'],
      boardCertifications: ['American Board of Internal Medicine'],
      languages: ['English', 'Mandarin'],
      rating: 4.6,
      reviewCount: 89,
    },
    {
      id: 'prov-3',
      npi: '3456789012',
      name: 'Dr. Emily Rodriguez',
      practiceName: 'Rodriguez Direct Primary Care',
      address: '789 Elm Street',
      city: 'Riverside',
      state,
      zipCode: (baseZip + 12).toString(),
      phone: '555-0300',
      email: 'info@rodriguezdpc.com',
      website: 'https://rodriguezdpc.com',
      monthlyFee: 65,
      familyFee: 130,
      acceptingPatients: true,
      servicesIncluded: [
        'Unlimited office visits',
        'Telemedicine',
        'Basic procedures',
        'Health coaching',
      ],
      specialties: ['Family Medicine'],
      boardCertifications: ['American Board of Family Medicine'],
      languages: ['English', 'Spanish'],
      rating: 4.9,
      reviewCount: 203,
    },
  ]
}

/**
 * Get detailed provider information
 */
export async function getProviderDetails(providerId: string): Promise<DPCProviderInfo | null> {
  // Check if we should use mock data
  if (process.env.USE_MOCK_DATA === 'true') {
    const mockProviders = generateMockProviders('CA', '90001')
    return mockProviders.find((p) => p.id === providerId) || null
  }

  try {
    const provider = await getProviderById(providerId)
    if (!provider) {
      return null
    }
    return mapProviderToInfo(provider)
  } catch (error) {
    console.error('Error fetching provider from database:', error)
    // Fallback to mock data
    const mockProviders = generateMockProviders('CA', '90001')
    return mockProviders.find((p) => p.id === providerId) || null
  }
}
