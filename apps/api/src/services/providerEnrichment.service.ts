/**
 * Provider Enrichment Service
 *
 * Enriches DPC provider records by:
 * 1. Reverse geocoding coordinates to get city/state/ZIP
 * 2. Querying NPI Registry for providers in that area
 * 3. Matching NPI data by proximity
 * 4. Updating provider records with real names, addresses, phones
 */

import { PrismaClient } from '@prisma/client'
import { getGeocodingService, ReverseGeoResult } from './geocoding.service'
import { getNPIRegistryService, NPIProvider } from './npiRegistry.service'

const prisma = new PrismaClient()
const geocodingService = getGeocodingService()
const npiService = getNPIRegistryService()

export interface EnrichmentResult {
  providerId: string
  success: boolean
  matched: boolean
  matchedNPI?: string
  matchedName?: string
  matchDistance?: number
  error?: string
  locationResolved?: {
    city: string
    state: string
    zip: string
  }
}

export interface EnrichmentStats {
  total: number
  processed: number
  enriched: number
  locationResolved: number
  npiMatched: number
  failed: number
  errors: string[]
}

interface EnrichmentOptions {
  limit?: number
  batchSize?: number
  radiusMiles?: number
  skipIfHasData?: boolean
}

class ProviderEnrichmentService {
  private readonly defaultRadius = 0.5 // miles for proximity matching
  private readonly requestDelay = 1200 // 1.2 seconds between requests (Nominatim rate limit: 1/sec)

  /**
   * Enrich a single provider with NPI data
   */
  async enrichProvider(providerId: string): Promise<EnrichmentResult> {
    try {
      const provider = await prisma.dPCProvider.findUnique({
        where: { id: providerId },
      })

      if (!provider) {
        return {
          providerId,
          success: false,
          matched: false,
          error: 'Provider not found',
        }
      }

      // Must have coordinates to enrich
      if (!provider.latitude || !provider.longitude) {
        return {
          providerId,
          success: false,
          matched: false,
          error: 'Provider has no coordinates',
        }
      }

      // Step 1: Reverse geocode to get city/state/zip
      const location = await geocodingService.reverseGeocode(
        provider.latitude,
        provider.longitude
      )

      if (!location) {
        return {
          providerId,
          success: true,
          matched: false,
          error: 'Could not reverse geocode location',
        }
      }

      await this.delay()

      // Step 2: Query NPI Registry for providers in this area
      const npiProviders = await this.findNPIMatches(
        location,
        provider.latitude,
        provider.longitude
      )

      if (npiProviders.length === 0) {
        // No NPI match, but we can still update location
        await prisma.dPCProvider.update({
          where: { id: providerId },
          data: {
            city: location.city || provider.city,
            state: location.stateAbbrev || provider.state,
            zipCode: location.zip || provider.zipCode,
          },
        })

        return {
          providerId,
          success: true,
          matched: false,
          locationResolved: {
            city: location.city,
            state: location.stateAbbrev,
            zip: location.zip,
          },
        }
      }

      // Step 3: Find best NPI match by proximity
      const match = this.findBestMatch(
        npiProviders,
        provider.latitude,
        provider.longitude
      )

      if (!match) {
        return {
          providerId,
          success: true,
          matched: false,
          locationResolved: {
            city: location.city,
            state: location.stateAbbrev,
            zip: location.zip,
          },
        }
      }

      // Step 4: Update provider with NPI data
      // Check if NPI is already used by another provider (same physician, multiple locations)
      const existingNPI = await prisma.dPCProvider.findFirst({
        where: {
          npi: match.provider.npi,
          id: { not: providerId },
        },
      })

      await prisma.dPCProvider.update({
        where: { id: providerId },
        data: {
          name: match.provider.name,
          address: match.provider.practiceAddress.street,
          city: match.provider.practiceAddress.city || location.city,
          state: match.provider.practiceAddress.state || location.stateAbbrev,
          zipCode: match.provider.practiceAddress.zip || location.zip,
          phone: match.provider.practiceAddress.phone || provider.phone,
          // Only set NPI if not already used by another provider
          ...(existingNPI ? {} : { npi: match.provider.npi }),
        },
      })

      return {
        providerId,
        success: true,
        matched: true,
        matchedNPI: match.provider.npi,
        matchedName: match.provider.name,
        matchDistance: match.distance,
        locationResolved: {
          city: match.provider.practiceAddress.city || location.city,
          state: match.provider.practiceAddress.state || location.stateAbbrev,
          zip: match.provider.practiceAddress.zip || location.zip,
        },
      }
    } catch (error) {
      console.error(`[Enrichment] Error enriching provider ${providerId}:`, error)
      return {
        providerId,
        success: false,
        matched: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * Enrich all providers (with options for limiting/batching)
   */
  async enrichAllProviders(options: EnrichmentOptions = {}): Promise<EnrichmentStats> {
    const {
      limit,
      batchSize = 10,
      skipIfHasData = true,
    } = options

    const stats: EnrichmentStats = {
      total: 0,
      processed: 0,
      enriched: 0,
      locationResolved: 0,
      npiMatched: 0,
      failed: 0,
      errors: [],
    }

    // Find providers needing enrichment
    const whereClause: Record<string, unknown> = {
      latitude: { not: null },
      longitude: { not: null },
    }

    if (skipIfHasData) {
      // Only enrich providers with placeholder names or unknown city
      whereClause.OR = [
        { name: { startsWith: 'DPC Practice' } },
        { city: 'Unknown' },
        { city: '' },
        { npi: null },
      ]
    }

    const providers = await prisma.dPCProvider.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'asc' },
    })

    stats.total = providers.length
    console.log(`[Enrichment] Starting enrichment for ${providers.length} providers...`)

    // Process in batches
    for (let i = 0; i < providers.length; i += batchSize) {
      const batch = providers.slice(i, i + batchSize)
      console.log(`[Enrichment] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(providers.length / batchSize)}`)

      for (const provider of batch) {
        const result = await this.enrichProvider(provider.id)
        stats.processed++

        if (result.success) {
          stats.enriched++
          if (result.locationResolved) {
            stats.locationResolved++
          }
          if (result.matched) {
            stats.npiMatched++
            console.log(`  ✓ ${provider.id.slice(0, 8)}... → ${result.matchedName} (${result.matchDistance?.toFixed(2)} mi)`)
          } else {
            console.log(`  ~ ${provider.id.slice(0, 8)}... → Location only (${result.locationResolved?.city}, ${result.locationResolved?.state})`)
          }
        } else {
          stats.failed++
          if (result.error) {
            stats.errors.push(`${provider.id}: ${result.error}`)
            console.log(`  ✗ ${provider.id.slice(0, 8)}... → ${result.error}`)
          }
        }

        // Rate limit delay between providers
        await this.delay()
      }
    }

    console.log(`[Enrichment] Complete: ${stats.npiMatched}/${stats.total} matched, ${stats.locationResolved} locations resolved`)
    return stats
  }

  /**
   * Find NPI providers near coordinates
   */
  private async findNPIMatches(
    location: ReverseGeoResult,
    lat: number,
    lng: number
  ): Promise<Array<{ provider: NPIProvider; distance: number }>> {
    const matches: Array<{ provider: NPIProvider; distance: number }> = []

    // Try searching by city/state first
    if (location.city && location.stateAbbrev) {
      const providers = await npiService.searchByLocation(
        location.city,
        location.stateAbbrev,
        { limit: 20 }
      )

      for (const provider of providers) {
        // Calculate distance from original coordinates
        const providerLat = this.extractLatFromAddress(provider)
        const providerLng = this.extractLngFromAddress(provider)

        // If we can't get provider coordinates, use address matching heuristics
        if (providerLat && providerLng) {
          const distance = geocodingService.calculateDistance(lat, lng, providerLat, providerLng)
          if (distance <= this.defaultRadius) {
            matches.push({ provider, distance })
          }
        }
      }
    }

    // If no matches and we have ZIP, try ZIP search
    if (matches.length === 0 && location.zip) {
      await this.delay()
      const providers = await npiService.searchByZip(location.zip, { limit: 20 })

      for (const provider of providers) {
        // For ZIP-based search, accept if address ZIP matches
        if (provider.practiceAddress.zip === location.zip) {
          matches.push({ provider, distance: 0.25 }) // Assume close match
        }
      }
    }

    return matches.sort((a, b) => a.distance - b.distance)
  }

  /**
   * Find the best matching NPI provider
   */
  private findBestMatch(
    candidates: Array<{ provider: NPIProvider; distance: number }>,
    _lat: number,
    _lng: number
  ): { provider: NPIProvider; distance: number } | null {
    if (candidates.length === 0) return null

    // Sort by:
    // 1. Primary taxonomy is Family Medicine (prefer DPC-relevant specialties)
    // 2. Distance (closer is better)
    const scored = candidates.map((c) => {
      let score = 0

      // Prefer Family Medicine taxonomy
      const hasFamilyMedicine = c.provider.taxonomies.some(
        t => t.code === '207Q00000X' && t.primary
      )
      if (hasFamilyMedicine) score += 100

      // Prefer individual providers over organizations
      if (c.provider.entityType === 'individual') score += 50

      // Distance penalty (closer = higher score)
      score -= c.distance * 20

      return { ...c, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored[0]
  }

  /**
   * Extract latitude from NPI provider address (would need geocoding)
   * For now, returns null - we rely on ZIP/address matching
   */
  private extractLatFromAddress(_provider: NPIProvider): number | null {
    // In a production system, you'd geocode the NPI address
    // For now, we'll use ZIP-based matching
    return null
  }

  /**
   * Extract longitude from NPI provider address
   */
  private extractLngFromAddress(_provider: NPIProvider): number | null {
    return null
  }

  /**
   * Rate limiting delay
   */
  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.requestDelay))
  }
}

// Singleton instance
let enrichmentServiceInstance: ProviderEnrichmentService | null = null

export function getProviderEnrichmentService(): ProviderEnrichmentService {
  if (!enrichmentServiceInstance) {
    enrichmentServiceInstance = new ProviderEnrichmentService()
  }
  return enrichmentServiceInstance
}

export { ProviderEnrichmentService }
