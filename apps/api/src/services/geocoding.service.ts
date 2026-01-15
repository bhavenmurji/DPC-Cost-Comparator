/**
 * Geocoding Service
 *
 * Provides ZIP code to coordinates lookup for provider search.
 * Uses free APIs with caching to minimize external requests.
 *
 * Data Sources:
 * 1. Zippopotam.us - Free ZIP to lat/lng (primary)
 * 2. FCC Area API - Coordinate validation
 *
 * Coverage: All ~42,000 US ZIP codes
 */

import axios from 'axios'

/**
 * Geographic coordinates result
 */
export interface GeoCoordinates {
  latitude: number
  longitude: number
  city: string
  state: string
  stateAbbrev: string
  country: string
  cached: boolean
}

/**
 * Reverse geocoding result
 */
export interface ReverseGeoResult {
  city: string
  state: string
  stateAbbrev: string
  zip: string
  county?: string
  street?: string
  cached: boolean
}

/**
 * In-memory cache for geocoding results
 * ZIP codes don't move, so we can cache aggressively
 */
const geocodeCache = new Map<string, { data: GeoCoordinates; timestamp: number }>()

/**
 * Separate cache for reverse geocoding (coordinates → location)
 */
const reverseGeocodeCache = new Map<string, { data: ReverseGeoResult; timestamp: number }>()

/**
 * US state abbreviations lookup
 */
const STATE_ABBREVIATIONS: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
}

// Cache TTL: 90 days (ZIP code locations are stable)
const CACHE_TTL_MS = 90 * 24 * 60 * 60 * 1000

// Rate limiting
let dailyRequestCount = 0
let lastRequestDate = new Date().toDateString()
const MAX_DAILY_REQUESTS = 10000 // Zippopotam.us is generous

/**
 * Geocoding Service Class
 */
export class GeocodingService {
  private readonly zippopotamUrl = 'https://api.zippopotam.us/us'

  /**
   * Get coordinates for a US ZIP code
   *
   * @param zipCode - 5-digit US ZIP code
   * @returns Coordinates or null if not found
   */
  async getCoordinates(zipCode: string): Promise<GeoCoordinates | null> {
    // Validate ZIP format
    const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5)
    if (cleanZip.length !== 5) {
      console.warn(`[Geocoding] Invalid ZIP code format: ${zipCode}`)
      return null
    }

    // Check cache first
    const cached = this.getFromCache(cleanZip)
    if (cached) {
      return cached
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      console.warn('[Geocoding] Daily rate limit reached')
      return null
    }

    try {
      const response = await axios.get<{
        'post code': string
        country: string
        'country abbreviation': string
        places: Array<{
          'place name': string
          longitude: string
          state: string
          'state abbreviation': string
          latitude: string
        }>
      }>(`${this.zippopotamUrl}/${cleanZip}`, {
        timeout: 5000,
      })

      this.incrementRequestCount()

      if (!response.data.places || response.data.places.length === 0) {
        console.warn(`[Geocoding] No location data for ZIP: ${cleanZip}`)
        return null
      }

      const place = response.data.places[0]
      const result: GeoCoordinates = {
        latitude: parseFloat(place.latitude),
        longitude: parseFloat(place.longitude),
        city: place['place name'],
        state: place.state,
        stateAbbrev: place['state abbreviation'],
        country: response.data.country,
        cached: false,
      }

      // Cache the result
      this.setCache(cleanZip, result)

      console.log(`[Geocoding] Resolved ZIP ${cleanZip} → ${result.city}, ${result.stateAbbrev} (${result.latitude}, ${result.longitude})`)

      return result
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          // ZIP code doesn't exist
          console.warn(`[Geocoding] ZIP code not found: ${cleanZip}`)
        } else {
          console.error(`[Geocoding] API error for ZIP ${cleanZip}:`, error.message)
        }
      } else {
        console.error(`[Geocoding] Unexpected error for ZIP ${cleanZip}:`, error)
      }
      return null
    }
  }

  /**
   * Get coordinates in the format expected by provider routes
   */
  async getZipCodeCoordinates(zipCode: string): Promise<{ lat: number; lng: number } | null> {
    const coords = await this.getCoordinates(zipCode)
    if (!coords) return null

    return {
      lat: coords.latitude,
      lng: coords.longitude,
    }
  }

  /**
   * Reverse geocode coordinates to get city, state, ZIP
   * Uses OpenStreetMap Nominatim API (free, no auth required)
   *
   * @param lat - Latitude
   * @param lng - Longitude
   * @returns Location data or null if not found
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeoResult | null> {
    // Round coordinates for cache key (4 decimals = ~11m precision)
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`

    // Check cache first
    const cached = this.getFromReverseCache(cacheKey)
    if (cached) {
      return cached
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      console.warn('[ReverseGeo] Daily rate limit reached')
      return null
    }

    try {
      // Nominatim requires a User-Agent header
      const response = await axios.get<{
        address?: {
          city?: string
          town?: string
          village?: string
          municipality?: string
          hamlet?: string
          county?: string
          state?: string
          postcode?: string
          road?: string
          house_number?: string
        }
        error?: string
      }>('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'DPC-Comparator/1.0 (healthcare cost comparison tool)',
        },
        timeout: 5000,
      })

      this.incrementRequestCount()

      if (response.data.error || !response.data.address) {
        console.warn(`[ReverseGeo] No address found for ${lat}, ${lng}`)
        return null
      }

      const addr = response.data.address
      const stateFull = addr.state || ''
      const stateAbbrev = STATE_ABBREVIATIONS[stateFull] || stateFull.substring(0, 2).toUpperCase()

      // City can be in multiple fields depending on population
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || ''

      const result: ReverseGeoResult = {
        city,
        state: stateFull,
        stateAbbrev,
        zip: addr.postcode?.substring(0, 5) || '',
        county: addr.county,
        street: addr.road ? `${addr.house_number || ''} ${addr.road}`.trim() : undefined,
        cached: false,
      }

      // Cache the result
      this.setReverseCache(cacheKey, result)

      console.log(`[ReverseGeo] Resolved (${lat.toFixed(4)}, ${lng.toFixed(4)}) → ${result.city}, ${result.stateAbbrev} ${result.zip}`)

      return result
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[ReverseGeo] API error for (${lat}, ${lng}):`, error.message)
      } else {
        console.error(`[ReverseGeo] Unexpected error:`, error)
      }
      return null
    }
  }

  /**
   * Batch geocode multiple ZIP codes
   */
  async batchGeocode(zipCodes: string[]): Promise<Map<string, GeoCoordinates | null>> {
    const results = new Map<string, GeoCoordinates | null>()
    const uniqueZips = Array.from(new Set(zipCodes))

    for (const zip of uniqueZips) {
      const coords = await this.getCoordinates(zip)
      results.set(zip, coords)

      // Small delay between requests
      await this.delay(50)
    }

    return results
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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
   * Check if ZIP code is in cache
   */
  isInCache(zipCode: string): boolean {
    const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5)
    return geocodeCache.has(cleanZip)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; reverseSize: number; dailyRequests: number } {
    return {
      size: geocodeCache.size,
      reverseSize: reverseGeocodeCache.size,
      dailyRequests: dailyRequestCount,
    }
  }

  /**
   * Pre-warm cache with common ZIP codes
   */
  async prewarmCache(zipCodes: string[]): Promise<void> {
    console.log(`[Geocoding] Pre-warming cache with ${zipCodes.length} ZIP codes...`)
    await this.batchGeocode(zipCodes)
    console.log(`[Geocoding] Cache pre-warm complete. Size: ${geocodeCache.size}`)
  }

  /**
   * Clear the geocode cache
   */
  clearCache(): void {
    geocodeCache.clear()
    console.log('[Geocoding] Cache cleared')
  }

  // Private helper methods

  private getFromCache(zipCode: string): GeoCoordinates | null {
    const entry = geocodeCache.get(zipCode)
    if (!entry) return null

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      geocodeCache.delete(zipCode)
      return null
    }

    return { ...entry.data, cached: true }
  }

  private setCache(zipCode: string, data: GeoCoordinates): void {
    geocodeCache.set(zipCode, {
      data,
      timestamp: Date.now(),
    })
  }

  private getFromReverseCache(key: string): ReverseGeoResult | null {
    const entry = reverseGeocodeCache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      reverseGeocodeCache.delete(key)
      return null
    }

    return { ...entry.data, cached: true }
  }

  private setReverseCache(key: string, data: ReverseGeoResult): void {
    reverseGeocodeCache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  private checkRateLimit(): boolean {
    const today = new Date().toDateString()
    if (today !== lastRequestDate) {
      dailyRequestCount = 0
      lastRequestDate = today
    }
    return dailyRequestCount < MAX_DAILY_REQUESTS
  }

  private incrementRequestCount(): void {
    dailyRequestCount++
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Singleton instance
let geocodingInstance: GeocodingService | null = null

/**
 * Get or create geocoding service instance
 */
export function getGeocodingService(): GeocodingService {
  if (!geocodingInstance) {
    geocodingInstance = new GeocodingService()
  }
  return geocodingInstance
}

/**
 * Convenience function: Get coordinates for a ZIP code
 */
export async function geocodeZipCode(zipCode: string): Promise<{ lat: number; lng: number } | null> {
  const service = getGeocodingService()
  return service.getZipCodeCoordinates(zipCode)
}

/**
 * Convenience function: Calculate distance between ZIP codes
 */
export async function distanceBetweenZipCodes(zip1: string, zip2: string): Promise<number | null> {
  const service = getGeocodingService()
  const coords1 = await service.getCoordinates(zip1)
  const coords2 = await service.getCoordinates(zip2)

  if (!coords1 || !coords2) return null

  return service.calculateDistance(
    coords1.latitude,
    coords1.longitude,
    coords2.latitude,
    coords2.longitude
  )
}
