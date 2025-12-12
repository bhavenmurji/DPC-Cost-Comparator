/**
 * DPC Provider Repository
 * Database queries for DPC provider data
 */

import type { PrismaClient } from '@prisma/client'
import {
  calculateHaversineDistance,
  estimateCoordinatesFromZip,
  calculateBoundingBox,
  isValidCoordinates,
  type Coordinates,
} from '../utils/geoDistance'

// Lazy initialization of Prisma to handle environments where it's not available
let prisma: PrismaClient | null = null
let prismaInitialized = false

async function getPrisma(): Promise<PrismaClient | null> {
  if (prismaInitialized) return prisma
  prismaInitialized = true

  try {
    const { PrismaClient } = await import('@prisma/client')
    prisma = new PrismaClient()
    console.log('Prisma client initialized for DPC provider repository')
    return prisma
  } catch (error) {
    console.log('Prisma client not available, provider queries will return empty results')
    return null
  }
}

export interface ProviderSearchParams {
  zipCode: string
  maxDistanceMiles?: number
  state?: string
  specialties?: string[]
  languages?: string[]
  maxMonthlyFee?: number
  acceptingPatientsOnly?: boolean
}

export interface ProviderWithDistance {
  id: string
  npi: string
  name: string
  practiceName: string
  address: string
  city: string
  state: string
  zipCode: string
  latitude: number | null
  longitude: number | null
  phone: string
  email: string | null
  website: string | null
  monthlyFee: number
  familyFee: number | null
  acceptingPatients: boolean
  servicesIncluded: string[]
  specialties: string[]
  boardCertifications: string[]
  languages: string[]
  rating: number | null
  reviewCount: number
  distanceMiles: number
}

/**
 * Search for DPC providers within a geographic area
 */
export async function searchProvidersNearby(
  params: ProviderSearchParams
): Promise<ProviderWithDistance[]> {
  const maxDistance = params.maxDistanceMiles || 50
  const userCoords = estimateCoordinatesFromZip(params.zipCode)

  if (!userCoords) {
    throw new Error(`Invalid ZIP code: ${params.zipCode}`)
  }

  console.log('🔍 User coordinates for ZIP', params.zipCode, ':', userCoords)

  // Calculate bounding box for efficient database query
  const bbox = calculateBoundingBox(userCoords, maxDistance)
  console.log('📦 Bounding box:', bbox)

  // Build query filters
  const whereClause: any = {
    AND: [
      // Accepting patients filter
      ...(params.acceptingPatientsOnly !== false
        ? [{ acceptingPatients: true }]
        : []),

      // Monthly fee filter
      ...(params.maxMonthlyFee
        ? [{ monthlyFee: { lte: params.maxMonthlyFee } }]
        : []),

      // State filter (if provided)
      ...(params.state ? [{ state: params.state }] : []),

      // Bounding box filter (if providers have coordinates)
      {
        OR: [
          // Providers with coordinates within bounding box
          {
            AND: [
              { latitude: { gte: bbox.minLat, lte: bbox.maxLat } },
              { longitude: { gte: bbox.minLon, lte: bbox.maxLon } },
            ],
          },
          // Providers without coordinates (will be filtered by ZIP code similarity)
          { latitude: null },
        ],
      },
    ],
  }

  // Specialty filter (at least one matching specialty)
  if (params.specialties && params.specialties.length > 0) {
    whereClause.AND.push({
      specialties: {
        hasSome: params.specialties,
      },
    })
  }

  // Language filter
  if (params.languages && params.languages.length > 0) {
    whereClause.AND.push({
      languages: {
        hasSome: params.languages,
      },
    })
  }

  // Log the complete where clause
  console.log('Database query whereClause:', JSON.stringify(whereClause, null, 2))

  // Fetch providers from database
  const db = await getPrisma()
  if (!db) {
    console.log('Database not available, returning empty provider list')
    return []
  }

  const providers = await db.dPCProvider.findMany({
    where: whereClause,
    select: {
      id: true,
      npi: true,
      name: true,
      practiceName: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      latitude: true,
      longitude: true,
      phone: true,
      email: true,
      website: true,
      monthlyFee: true,
      familyFee: true,
      acceptingPatients: true,
      servicesIncluded: true,
      specialties: true,
      boardCertifications: true,
      languages: true,
      rating: true,
      reviewCount: true,
    },
  })

  console.log(`📋 Database returned ${providers.length} providers before distance filtering`)

  // Calculate distances and filter
  const providersWithDistance = providers
    .map((provider) => {
      let distance: number

      if (
        provider.latitude !== null &&
        provider.longitude !== null &&
        isValidCoordinates({ latitude: provider.latitude, longitude: provider.longitude })
      ) {
        // Use Haversine formula for accurate distance
        distance = calculateHaversineDistance(userCoords, {
          latitude: provider.latitude,
          longitude: provider.longitude,
        })
      } else {
        // Fallback: estimate distance from ZIP code proximity
        distance = estimateDistanceFromZipCode(params.zipCode, provider.zipCode)
      }

      return {
        ...provider,
        distanceMiles: Math.round(distance * 10) / 10, // Round to 1 decimal
      }
    })
    .filter((provider) => provider.distanceMiles <= maxDistance)
    .sort((a, b) => a.distanceMiles - b.distanceMiles)

  return providersWithDistance
}

/**
 * Get a specific provider by ID
 */
export async function getProviderById(providerId: string): Promise<ProviderWithDistance | null> {
  const db = await getPrisma()
  if (!db) {
    return null
  }

  const provider = await db.dPCProvider.findUnique({
    where: { id: providerId },
    select: {
      id: true,
      npi: true,
      name: true,
      practiceName: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      latitude: true,
      longitude: true,
      phone: true,
      email: true,
      website: true,
      monthlyFee: true,
      familyFee: true,
      acceptingPatients: true,
      servicesIncluded: true,
      specialties: true,
      boardCertifications: true,
      languages: true,
      rating: true,
      reviewCount: true,
    },
  })

  if (!provider) {
    return null
  }

  return {
    ...provider,
    distanceMiles: 0, // Distance not relevant for direct lookup
  }
}

/**
 * Get providers by state
 */
export async function getProvidersByState(state: string, limit: number = 50) {
  const db = await getPrisma()
  if (!db) {
    return []
  }

  return await db.dPCProvider.findMany({
    where: {
      state: state.toUpperCase(),
      acceptingPatients: true,
    },
    select: {
      id: true,
      npi: true,
      name: true,
      practiceName: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      latitude: true,
      longitude: true,
      phone: true,
      email: true,
      website: true,
      monthlyFee: true,
      familyFee: true,
      acceptingPatients: true,
      servicesIncluded: true,
      specialties: true,
      boardCertifications: true,
      languages: true,
      rating: true,
      reviewCount: true,
    },
    orderBy: {
      rating: 'desc',
    },
    take: limit,
  })
}

/**
 * Fallback distance estimation from ZIP code proximity
 * Used when geographic coordinates are not available
 */
function estimateDistanceFromZipCode(zipCode1: string, zipCode2: string): number {
  const zip1 = parseInt(zipCode1)
  const zip2 = parseInt(zipCode2)

  if (isNaN(zip1) || isNaN(zip2)) {
    return 999 // Unknown distance
  }

  const diff = Math.abs(zip1 - zip2)

  // Rough estimation based on ZIP code proximity
  if (diff === 0) return 0
  if (diff < 5) return Math.random() * 3 + 1 // 1-4 miles
  if (diff < 10) return Math.random() * 5 + 3 // 3-8 miles
  if (diff < 50) return Math.random() * 15 + 8 // 8-23 miles
  if (diff < 100) return Math.random() * 20 + 20 // 20-40 miles
  if (diff < 500) return Math.random() * 30 + 40 // 40-70 miles

  return Math.random() * 50 + 70 // 70-120 miles
}

/**
 * Close Prisma connection (for graceful shutdown)
 */
export async function closeConnection() {
  if (prisma) {
    await prisma.$disconnect()
  }
}
