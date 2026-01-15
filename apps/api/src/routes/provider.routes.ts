import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { getGeocodingService } from '../services/geocoding.service'

const router = Router()
const prisma = new PrismaClient()
const geocodingService = getGeocodingService()

// Validation schemas
const providerSearchSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/),
  radius: z.number().min(1).max(100).optional().default(25),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
})

const providerByIdSchema = z.object({
  id: z.string(),
})

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Get coordinates for a ZIP code using the geocoding service
 * Now supports all ~42,000 US ZIP codes via Zippopotam.us API
 */
async function getZipCodeCoordinates(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  return geocodingService.getZipCodeCoordinates(zipCode)
}

/**
 * GET /api/providers/search
 * Search for DPC providers by location
 * Now supports all ~42,000 US ZIP codes
 */
router.get('/search', async (req, res) => {
  try {
    const params = providerSearchSchema.parse({
      zipCode: req.query.zipCode,
      radius: req.query.radius ? Number(req.query.radius) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    })

    // Get coordinates and location info for ZIP code
    const geoResult = await geocodingService.getCoordinates(params.zipCode)
    const coordinates = geoResult ? { lat: geoResult.latitude, lng: geoResult.longitude } : null

    let providers

    if (coordinates) {
      // Search within radius
      const allProviders = await prisma.dPCProvider.findMany({
        include: {
          providerSource: true,
        },
      })

      // Calculate distances and filter
      providers = allProviders
        .map((provider) => {
          const distance = calculateDistance(
            coordinates.lat,
            coordinates.lng,
            provider.latitude || 0,
            provider.longitude || 0
          )
          return { ...provider, distance }
        })
        .filter((provider) => provider.distance <= params.radius)
        .sort((a, b) => a.distance - b.distance)
        .slice(params.offset, params.offset + params.limit)
    } else {
      // No coordinates available, return all providers with pagination
      providers = await prisma.dPCProvider.findMany({
        skip: params.offset,
        take: params.limit,
        include: {
          providerSource: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
    }

    res.json({
      success: true,
      count: providers.length,
      searchParams: params,
      searchLocation: geoResult ? {
        zipCode: params.zipCode,
        city: geoResult.city,
        state: geoResult.stateAbbrev,
        coordinates,
        cached: geoResult.cached,
      } : null,
      providers: providers.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        city: p.city,
        state: p.state,
        zipCode: p.zipCode,
        phone: p.phone,
        website: p.website,
        monthlyFee: p.monthlyFee,
        servicesOffered: p.servicesIncluded,
        rating: p.rating,
        verified: p.verified,
        distance: 'distance' in p ? p.distance : null,
        location: {
          latitude: p.latitude,
          longitude: p.longitude,
        },
        dataSource: p.providerSource
          ? {
              source: p.providerSource.source,
              lastScraped: p.providerSource.lastScraped,
              dataQualityScore: p.providerSource.dataQualityScore,
            }
          : null,
      })),
    })
  } catch (error) {
    // Use String() to avoid Node.js v25 inspect issues with Prisma errors
    console.error('Error searching providers:', error instanceof Error ? error.message : String(error))

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request parameters',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to search providers',
    })
  }
})

/**
 * GET /api/providers/:id
 * Get a single provider by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const params = providerByIdSchema.parse({
      id: req.params.id,
    })

    const provider = await prisma.dPCProvider.findUnique({
      where: { id: params.id },
      include: {
        providerSource: true,
      },
    })

    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found',
      })
    }

    res.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        address: provider.address,
        city: provider.city,
        state: provider.state,
        zipCode: provider.zipCode,
        phone: provider.phone,
        website: provider.website,
        monthlyFee: provider.monthlyFee,
        servicesOffered: provider.servicesOffered,
        rating: provider.rating,
        verified: provider.verified,
        location: {
          latitude: provider.latitude,
          longitude: provider.longitude,
        },
        dataSource: provider.providerSource
          ? {
              source: provider.providerSource.source,
              sourceUrl: provider.providerSource.sourceUrl,
              lastScraped: provider.providerSource.lastScraped,
              dataQualityScore: provider.providerSource.dataQualityScore,
              verified: provider.providerSource.verified,
            }
          : null,
        createdAt: provider.createdAt,
        updatedAt: provider.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching provider:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider ID',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch provider',
    })
  }
})

/**
 * GET /api/providers/stats
 * Get provider statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalProviders = await prisma.dPCProvider.count()
    const acceptingPatients = await prisma.dPCProvider.count({
      where: { acceptingPatients: true },
    })

    const providersByState = await prisma.dPCProvider.groupBy({
      by: ['state'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    })

    const averageFee = await prisma.dPCProvider.aggregate({
      _avg: {
        monthlyFee: true,
      },
    })

    res.json({
      success: true,
      stats: {
        totalProviders: totalProviders,
        acceptingPatientsCount: acceptingPatients,
        averageMonthlyFee: averageFee._avg.monthlyFee || 0,
        providersByState: providersByState.reduce((acc, s) => {
          acc[s.state] = s._count.id
          return acc
        }, {} as Record<string, number>),
      },
    })
  } catch (error) {
    console.error('Error fetching provider stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch provider statistics',
    })
  }
})

export default router
