/**
 * Provider Matching Service
 * Matches users with nearby DPC providers based on location and needs
 */

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
  npi: string
  name: string
  practiceName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email?: string
  website?: string
  monthlyFee: number
  familyFee?: number
  acceptingPatients: boolean
  servicesIncluded: string[]
  specialties: string[]
  boardCertifications: string[]
  languages: string[]
  rating?: number
  reviewCount: number
  latitude?: number
  longitude?: number
}

/**
 * Find and rank DPC providers based on criteria
 */
export async function findMatchingProviders(
  criteria: ProviderSearchCriteria,
  limit: number = 10
): Promise<MatchedProviderResult[]> {
  // In production, this would query the database
  // For now, we'll return mock data with realistic scoring

  const mockProviders = generateMockProviders(criteria.state, criteria.zipCode)

  // Calculate match scores for each provider
  const scoredProviders = mockProviders.map((provider) => {
    const distance = calculateDistance(criteria.zipCode, provider.zipCode)
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
 * Calculate distance between two ZIP codes (simplified)
 * In production, use actual geocoding and distance calculation
 */
function calculateDistance(zipCode1: string, zipCode2: string): number {
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
  // In production, query database
  const mockProviders = generateMockProviders('CA', '90001')
  return mockProviders.find((p) => p.id === providerId) || null
}
