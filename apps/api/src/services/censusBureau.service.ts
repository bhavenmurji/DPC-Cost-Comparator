/**
 * Census Bureau Geocoding Service
 *
 * Provides ZIP code to County FIPS code lookup using the US Census Bureau's
 * free Geocoding API. This enables Healthcare.gov plan lookups for any US ZIP code.
 *
 * API Documentation: https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.pdf
 *
 * Rate Limits:
 * - Free tier: ~2,500 requests/day (undocumented but observed)
 * - No API key required
 * - Batch endpoint available for bulk lookups
 */

import axios, { AxiosInstance } from 'axios'

/**
 * Census Bureau Geocoding response structures
 */
interface CensusGeographyResult {
  COUNTY: string       // County FIPS code (3 digits)
  STATE: string        // State FIPS code (2 digits)
  TRACT: string        // Census tract
  BLOCK: string        // Census block
  BASENAME: string     // County name
  NAME: string         // Full county name with state
  LSADC: string        // Legal/Statistical Area Description Code
  FUNCSTAT: string     // Functional status
  GEOID: string        // Full GEOID (state + county)
}

interface CensusAddressMatch {
  tigerLine: {
    side: string
    tigerLineId: string
  }
  geographies: {
    Counties?: CensusGeographyResult[]
    'Census Tracts'?: CensusGeographyResult[]
    States?: Array<{ STATE: string; NAME: string }>
  }
  coordinates: {
    x: number
    y: number
  }
  addressComponents: {
    zip: string
    streetName: string
    city: string
    state: string
  }
  matchedAddress: string
}

interface CensusGeocodingResponse {
  result: {
    input: {
      address: {
        address: string
      }
      benchmark: {
        id: string
        benchmarkName: string
        benchmarkDescription: string
      }
      vintage: {
        id: string
        vintageName: string
        vintageDescription: string
      }
    }
    addressMatches: CensusAddressMatch[]
  }
}

/**
 * FIPS lookup result
 */
export interface FipsLookupResult {
  countyFips: string      // Full 5-digit FIPS (state + county)
  stateFips: string       // 2-digit state FIPS
  countyName: string      // County name
  stateName: string       // State name
  stateAbbrev: string     // State abbreviation (derived)
  cached: boolean         // Whether this came from cache
}

/**
 * In-memory cache for FIPS lookups
 * Persists for application lifetime to minimize API calls
 */
const fipsCache = new Map<string, { result: FipsLookupResult; timestamp: number }>()

// Cache TTL: 30 days (FIPS codes rarely change)
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000

// Daily request counter (resets at midnight)
let dailyRequestCount = 0
let lastRequestDate = new Date().toDateString()

const MAX_DAILY_REQUESTS = 2400 // Keep buffer under 2,500 limit

/**
 * State abbreviation lookup from FIPS code
 */
const STATE_FIPS_TO_ABBREV: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY', '72': 'PR', '78': 'VI'
}

/**
 * Census Bureau Geocoding Service
 */
export class CensusBureauService {
  private client: AxiosInstance
  private readonly baseUrl = 'https://geocoding.geo.census.gov/geocoder'

  constructor() {
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 15000, // Census API can be slow
      headers: {
        'Accept': 'application/json',
      },
    })
  }

  /**
   * Look up County FIPS code from ZIP code
   *
   * @param zipCode - 5-digit US ZIP code
   * @returns FIPS lookup result or null if not found
   */
  async lookupFipsByZip(zipCode: string): Promise<FipsLookupResult | null> {
    // Validate ZIP format
    const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5)
    if (cleanZip.length !== 5) {
      console.warn(`[CensusBureau] Invalid ZIP code format: ${zipCode}`)
      return null
    }

    // Check cache first
    const cached = this.getFromCache(cleanZip)
    if (cached) {
      return cached
    }

    // Check rate limit
    if (!this.checkRateLimit()) {
      console.warn('[CensusBureau] Daily rate limit reached, using fallback')
      return null
    }

    try {
      // Use onelineaddress endpoint with just the ZIP code
      // Adding a generic street helps geocoder accuracy
      const response = await this.client.get<CensusGeocodingResponse>(
        '/geographies/onelineaddress',
        {
          params: {
            address: `${cleanZip}`,
            benchmark: 'Public_AR_Current',  // Current public benchmark
            vintage: 'Current_Current',       // Current vintage for geographies
            layers: 'Counties',               // We only need county data
            format: 'json',
          },
        }
      )

      this.incrementRequestCount()

      const matches = response.data?.result?.addressMatches
      if (!matches || matches.length === 0) {
        console.warn(`[CensusBureau] No address match for ZIP: ${cleanZip}`)
        return null
      }

      // Extract county geography from first match
      const firstMatch = matches[0]
      const counties = firstMatch.geographies?.Counties

      if (!counties || counties.length === 0) {
        console.warn(`[CensusBureau] No county data for ZIP: ${cleanZip}`)
        return null
      }

      const county = counties[0]
      const stateFips = county.STATE
      const countyCode = county.COUNTY
      const fullFips = `${stateFips}${countyCode}`

      const result: FipsLookupResult = {
        countyFips: fullFips,
        stateFips: stateFips,
        countyName: county.BASENAME || county.NAME,
        stateName: firstMatch.addressComponents?.state || '',
        stateAbbrev: STATE_FIPS_TO_ABBREV[stateFips] || '',
        cached: false,
      }

      // Cache the result
      this.setCache(cleanZip, result)

      console.log(`[CensusBureau] Resolved ZIP ${cleanZip} → ${result.countyName}, ${result.stateAbbrev} (FIPS: ${fullFips})`)

      return result
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[CensusBureau] API error for ZIP ${cleanZip}:`, {
          status: error.response?.status,
          message: error.message,
        })
      } else {
        console.error(`[CensusBureau] Unexpected error for ZIP ${cleanZip}:`, error)
      }
      return null
    }
  }

  /**
   * Batch lookup for multiple ZIP codes
   * Uses sequential requests with delay to avoid rate limiting
   *
   * @param zipCodes - Array of ZIP codes
   * @param delayMs - Delay between requests (default 100ms)
   * @returns Map of ZIP code to FIPS result
   */
  async batchLookupFips(
    zipCodes: string[],
    delayMs: number = 100
  ): Promise<Map<string, FipsLookupResult>> {
    const results = new Map<string, FipsLookupResult>()
    const uniqueZips = Array.from(new Set(zipCodes))

    for (const zip of uniqueZips) {
      const result = await this.lookupFipsByZip(zip)
      if (result) {
        results.set(zip, result)
      }

      // Delay between requests
      if (delayMs > 0) {
        await this.delay(delayMs)
      }
    }

    return results
  }

  /**
   * Get County FIPS for Healthcare.gov API
   * Returns just the 5-digit FIPS code string or null
   */
  async getCountyFipsForHealthcareGov(zipCode: string): Promise<string | null> {
    const result = await this.lookupFipsByZip(zipCode)
    return result?.countyFips || null
  }

  /**
   * Check if a ZIP code is in cache
   */
  isInCache(zipCode: string): boolean {
    const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5)
    return fipsCache.has(cleanZip)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number; dailyRequests: number } {
    return {
      size: fipsCache.size,
      hitRate: fipsCache.size > 0 ? 1 : 0, // Simplified
      dailyRequests: dailyRequestCount,
    }
  }

  /**
   * Pre-warm cache with common ZIP codes
   * Call during application startup
   */
  async prewarmCache(zipCodes: string[]): Promise<void> {
    console.log(`[CensusBureau] Pre-warming cache with ${zipCodes.length} ZIP codes...`)
    await this.batchLookupFips(zipCodes, 200) // Slower to be gentle on API
    console.log(`[CensusBureau] Cache pre-warm complete. Cache size: ${fipsCache.size}`)
  }

  /**
   * Clear the FIPS cache
   */
  clearCache(): void {
    fipsCache.clear()
    console.log('[CensusBureau] Cache cleared')
  }

  // Private helper methods

  private getFromCache(zipCode: string): FipsLookupResult | null {
    const entry = fipsCache.get(zipCode)
    if (!entry) return null

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      fipsCache.delete(zipCode)
      return null
    }

    return { ...entry.result, cached: true }
  }

  private setCache(zipCode: string, result: FipsLookupResult): void {
    fipsCache.set(zipCode, {
      result,
      timestamp: Date.now(),
    })
  }

  private checkRateLimit(): boolean {
    // Reset counter if it's a new day
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
let censusBureauInstance: CensusBureauService | null = null

/**
 * Get or create Census Bureau service instance
 */
export function getCensusBureauService(): CensusBureauService {
  if (!censusBureauInstance) {
    censusBureauInstance = new CensusBureauService()
  }
  return censusBureauInstance
}

/**
 * Convenience function: Look up FIPS by ZIP code
 */
export async function lookupCountyFipsByZip(zipCode: string): Promise<string | null> {
  const service = getCensusBureauService()
  return service.getCountyFipsForHealthcareGov(zipCode)
}
