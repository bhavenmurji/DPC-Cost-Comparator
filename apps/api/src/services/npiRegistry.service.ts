/**
 * NPI Registry Service
 * Queries the CMS NPPES (National Plan and Provider Enumeration System) API
 * to find healthcare providers by location, specialty, or NPI number.
 *
 * API Documentation: https://npiregistry.cms.hhs.gov/api-page
 * No authentication required - free public API
 */

import axios from 'axios'

// Taxonomy codes for primary care / DPC relevant specialties
export const TAXONOMY_CODES = {
  FAMILY_MEDICINE: '207Q00000X',
  INTERNAL_MEDICINE: '207R00000X',
  GENERAL_PRACTICE: '208D00000X',
  PREVENTIVE_MEDICINE: '2083P0500X',
} as const

export interface NPIAddress {
  street: string
  street2?: string
  city: string
  state: string
  zip: string
  countryCode?: string
  phone?: string
  fax?: string
}

export interface NPIProvider {
  npi: string
  entityType: 'individual' | 'organization'
  name: string
  firstName?: string
  lastName?: string
  middleName?: string
  credential?: string
  gender?: string
  practiceAddress: NPIAddress
  mailingAddress?: NPIAddress
  taxonomies: Array<{
    code: string
    description: string
    primary: boolean
    state?: string
    license?: string
  }>
  otherNames?: string[]
  lastUpdated: string
}

interface NPISearchParams {
  city?: string
  state?: string
  zipCode?: string
  taxonomyDescription?: string
  firstName?: string
  lastName?: string
  organizationName?: string
  limit?: number
  skip?: number
}

interface NPIAPIResponse {
  result_count: number
  results: any[]
}

class NPIRegistryService {
  private apiUrl = 'https://npiregistry.cms.hhs.gov/api/'
  private requestDelay = 500 // 500ms between requests (respectful rate limiting)
  private cache = new Map<string, { data: NPIProvider[]; timestamp: number }>()
  private cacheTTL = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Search for providers by location
   */
  async searchByLocation(
    city: string,
    state: string,
    options?: {
      taxonomyDescription?: string
      limit?: number
    }
  ): Promise<NPIProvider[]> {
    const cacheKey = `loc:${city}:${state}:${options?.taxonomyDescription || ''}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const params: NPISearchParams = {
      city,
      state,
      taxonomyDescription: options?.taxonomyDescription || 'Family Medicine',
      limit: options?.limit || 50,
    }

    const results = await this.search(params)
    this.setCache(cacheKey, results)
    return results
  }

  /**
   * Search for providers by ZIP code
   */
  async searchByZip(
    zipCode: string,
    options?: {
      taxonomyDescription?: string
      limit?: number
    }
  ): Promise<NPIProvider[]> {
    const cacheKey = `zip:${zipCode}:${options?.taxonomyDescription || ''}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    // ZIP code should be 5 digits
    const zip5 = zipCode.substring(0, 5)

    const params: NPISearchParams = {
      zipCode: zip5,
      taxonomyDescription: options?.taxonomyDescription || 'Family Medicine',
      limit: options?.limit || 50,
    }

    const results = await this.search(params)
    this.setCache(cacheKey, results)
    return results
  }

  /**
   * Get a specific provider by NPI number
   */
  async getByNPI(npi: string): Promise<NPIProvider | null> {
    const cacheKey = `npi:${npi}`
    const cached = this.getFromCache(cacheKey)
    if (cached && cached.length > 0) return cached[0]

    try {
      await this.delay()

      const response = await axios.get<NPIAPIResponse>(this.apiUrl, {
        params: {
          version: '2.1',
          number: npi,
        },
        timeout: 10000,
      })

      if (response.data.result_count === 0) {
        return null
      }

      const provider = this.parseResult(response.data.results[0])
      this.setCache(cacheKey, [provider])
      return provider
    } catch (error) {
      console.error(`NPI lookup failed for ${npi}:`, error instanceof Error ? error.message : error)
      return null
    }
  }

  /**
   * Search for providers matching any primary care taxonomy
   */
  async searchPrimaryCareProviders(
    city: string,
    state: string,
    limit: number = 100
  ): Promise<NPIProvider[]> {
    const allProviders: NPIProvider[] = []
    const seen = new Set<string>()

    // Search for each primary care taxonomy
    for (const [, taxonomyCode] of Object.entries(TAXONOMY_CODES)) {
      try {
        const results = await this.search({
          city,
          state,
          taxonomyDescription: this.getTaxonomyDescription(taxonomyCode),
          limit: Math.min(limit, 50),
        })

        for (const provider of results) {
          if (!seen.has(provider.npi)) {
            seen.add(provider.npi)
            allProviders.push(provider)
          }
        }

        if (allProviders.length >= limit) break
      } catch (error) {
        // Continue with next taxonomy on error
        console.warn(`Failed to search taxonomy ${taxonomyCode}:`, error)
      }
    }

    return allProviders.slice(0, limit)
  }

  /**
   * Core search method
   */
  private async search(params: NPISearchParams): Promise<NPIProvider[]> {
    try {
      await this.delay()

      const queryParams: Record<string, string | number> = {
        version: '2.1',
        limit: params.limit || 50,
        skip: params.skip || 0,
      }

      if (params.city) queryParams.city = params.city
      if (params.state) queryParams.state = params.state
      if (params.zipCode) queryParams.postal_code = params.zipCode
      if (params.taxonomyDescription) queryParams.taxonomy_description = params.taxonomyDescription
      if (params.firstName) queryParams.first_name = params.firstName
      if (params.lastName) queryParams.last_name = params.lastName
      if (params.organizationName) queryParams.organization_name = params.organizationName

      const response = await axios.get<NPIAPIResponse>(this.apiUrl, {
        params: queryParams,
        timeout: 15000,
      })

      if (!response.data.results || response.data.result_count === 0) {
        return []
      }

      return response.data.results.map((r) => this.parseResult(r))
    } catch (error) {
      console.error('NPI search failed:', error instanceof Error ? error.message : error)
      return []
    }
  }

  /**
   * Parse NPI API result into our format
   */
  private parseResult(result: any): NPIProvider {
    const basic = result.basic || {}
    const addresses = result.addresses || []
    const taxonomies = result.taxonomies || []

    // Find practice location address (location_type = 1 = Practice Location)
    const practiceAddr = addresses.find((a: any) => a.address_purpose === 'LOCATION') || addresses[0] || {}
    const mailingAddr = addresses.find((a: any) => a.address_purpose === 'MAILING')

    const isOrganization = result.enumeration_type === 'NPI-2'

    return {
      npi: String(result.number),
      entityType: isOrganization ? 'organization' : 'individual',
      name: isOrganization
        ? basic.organization_name || 'Unknown Organization'
        : `${basic.first_name || ''} ${basic.last_name || ''}`.trim() || 'Unknown Provider',
      firstName: basic.first_name,
      lastName: basic.last_name,
      middleName: basic.middle_name,
      credential: basic.credential,
      gender: basic.gender,
      practiceAddress: {
        street: practiceAddr.address_1 || '',
        street2: practiceAddr.address_2,
        city: practiceAddr.city || '',
        state: practiceAddr.state || '',
        zip: practiceAddr.postal_code?.substring(0, 5) || '',
        countryCode: practiceAddr.country_code,
        phone: practiceAddr.telephone_number,
        fax: practiceAddr.fax_number,
      },
      mailingAddress: mailingAddr
        ? {
            street: mailingAddr.address_1 || '',
            street2: mailingAddr.address_2,
            city: mailingAddr.city || '',
            state: mailingAddr.state || '',
            zip: mailingAddr.postal_code?.substring(0, 5) || '',
            countryCode: mailingAddr.country_code,
            phone: mailingAddr.telephone_number,
            fax: mailingAddr.fax_number,
          }
        : undefined,
      taxonomies: taxonomies.map((t: any) => ({
        code: t.code || '',
        description: t.desc || '',
        primary: t.primary === true,
        state: t.state,
        license: t.license,
      })),
      otherNames: result.other_names?.map((n: any) => n.organization_name || `${n.first_name} ${n.last_name}`),
      lastUpdated: basic.last_updated || new Date().toISOString(),
    }
  }

  /**
   * Get taxonomy description from code
   */
  private getTaxonomyDescription(code: string): string {
    const descriptions: Record<string, string> = {
      '207Q00000X': 'Family Medicine',
      '207R00000X': 'Internal Medicine',
      '208D00000X': 'General Practice',
      '2083P0500X': 'Preventive Medicine',
    }
    return descriptions[code] || 'Family Medicine'
  }

  /**
   * Rate limiting delay
   */
  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.requestDelay))
  }

  /**
   * Cache helpers
   */
  private getFromCache(key: string): NPIProvider[] | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }
    return null
  }

  private setCache(key: string, data: NPIProvider[]): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton instance
let npiRegistryServiceInstance: NPIRegistryService | null = null

export function getNPIRegistryService(): NPIRegistryService {
  if (!npiRegistryServiceInstance) {
    npiRegistryServiceInstance = new NPIRegistryService()
  }
  return npiRegistryServiceInstance
}

export { NPIRegistryService }
