/**
 * Healthcare.gov Marketplace API Client Service
 *
 * This service handles all interactions with the CMS Healthcare.gov API
 * including plan search, premium calculations, and eligibility estimates.
 *
 * API Documentation: https://developer.cms.gov/marketplace-api/
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import {
  HealthcareGovConfig,
  PlanSearchRequest,
  PlanSearchResponse,
  PlanDetailsRequest,
  PlanDetailsResponse,
  EligibilityRequest,
  EligibilityResponse,
  SLCSPRequest,
  SLCSPResponse,
  HealthcareGovError,
} from '../types/healthcareGov.types'

/**
 * Healthcare.gov API Client
 */
export class HealthcareGovApiClient {
  private client: AxiosInstance
  private cache: Map<string, { data: unknown; timestamp: number }>
  private config: Required<HealthcareGovConfig>

  constructor(config: HealthcareGovConfig) {
    // Set defaults
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://marketplace.api.healthcare.gov',
      timeout: config.timeout || 10000,
      enableCache: config.enableCache !== false,
      cacheTTL: config.cacheTTL || 86400, // 24 hours default
    }

    // Validate API key
    if (!this.config.apiKey || this.config.apiKey === 'your_api_key_here') {
      throw new Error('Healthcare.gov API key is required. Get one at https://developer.cms.gov/marketplace-api/key-request.html')
    }

    // Initialize cache
    this.cache = new Map()

    // Create axios instance
    this.client = axios.create({
      baseURL: `${this.config.baseUrl}/api/v1`,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    // Add request interceptor for API key
    this.client.interceptors.request.use((config) => {
      // Add API key as query parameter
      config.params = {
        ...config.params,
        apikey: this.config.apiKey,
      }
      return config
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleApiError(error))
      }
    )
  }

  /**
   * Search for insurance plans
   */
  async searchPlans(request: PlanSearchRequest): Promise<PlanSearchResponse> {
    const cacheKey = `plans:${JSON.stringify(request)}`

    // Check cache
    const cached = this.getFromCache<PlanSearchResponse>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await this.client.post<PlanSearchResponse>('/plans/search', request)

      // Cache the response
      this.setCache(cacheKey, response.data)

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Get detailed plan information
   */
  async getPlanDetails(request: PlanDetailsRequest): Promise<PlanDetailsResponse> {
    const cacheKey = `plan:${request.plan_id}:${JSON.stringify(request.household || {})}`

    // Check cache
    const cached = this.getFromCache<PlanDetailsResponse>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const endpoint = `/plans/${request.plan_id}`

      // Use POST if household data provided for premium calculation
      const response = request.household
        ? await this.client.post<PlanDetailsResponse>(endpoint, {
            household: request.household,
            year: request.year,
          })
        : await this.client.get<PlanDetailsResponse>(endpoint, {
            params: { year: request.year },
          })

      // Cache the response
      this.setCache(cacheKey, response.data)

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Calculate eligibility estimates (APTC and CSR)
   */
  async getEligibilityEstimates(request: EligibilityRequest): Promise<EligibilityResponse> {
    const cacheKey = `eligibility:${JSON.stringify(request)}`

    // Check cache
    const cached = this.getFromCache<EligibilityResponse>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await this.client.post<EligibilityResponse>(
        '/households/eligibility/estimates',
        request
      )

      // Cache the response
      this.setCache(cacheKey, response.data)

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Get Second Lowest Cost Silver Plan (used for APTC calculation)
   */
  async getSLCSP(request: SLCSPRequest): Promise<SLCSPResponse> {
    const cacheKey = `slcsp:${JSON.stringify(request)}`

    // Check cache
    const cached = this.getFromCache<SLCSPResponse>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await this.client.post<SLCSPResponse>(
        '/households/slcsp',
        request
      )

      // Cache the response
      this.setCache(cacheKey, response.data)

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Get lowest cost bronze plan
   */
  async getLowestCostBronzePlan(request: SLCSPRequest): Promise<SLCSPResponse> {
    const cacheKey = `lcbp:${JSON.stringify(request)}`

    // Check cache
    const cached = this.getFromCache<SLCSPResponse>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const response = await this.client.post<SLCSPResponse>(
        '/households/lcbp',
        request
      )

      // Cache the response
      this.setCache(cacheKey, response.data)

      return response.data
    } catch (error) {
      throw this.handleApiError(error)
    }
  }

  /**
   * Search for catastrophic plans specifically
   */
  async searchCatastrophicPlans(request: Omit<PlanSearchRequest, 'filter'>): Promise<PlanSearchResponse> {
    return this.searchPlans({
      ...request,
      filter: {
        metal: ['catastrophic'],
      },
      catastrophic_override: true,
    })
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: unknown): HealthcareGovError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ code?: number; message?: string }>

      return {
        status: axiosError.response?.status || 500,
        code: axiosError.response?.data?.code || 9999,
        message: axiosError.response?.data?.message || axiosError.message || 'Unknown API error',
        details: axiosError.response?.data,
      }
    }

    if (error instanceof Error) {
      return {
        status: 500,
        code: 9999,
        message: error.message,
      }
    }

    return {
      status: 500,
      code: 9999,
      message: 'Unknown error occurred',
    }
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    if (!this.config.enableCache) {
      return null
    }

    const cached = this.cache.get(key)
    if (!cached) {
      return null
    }

    // Check if cache is expired
    const now = Date.now()
    const age = (now - cached.timestamp) / 1000 // Age in seconds

    if (age > this.config.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: unknown): void {
    if (!this.config.enableCache) {
      return
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }
}

/**
 * Singleton instance for application-wide use
 */
let apiClientInstance: HealthcareGovApiClient | null = null

/**
 * Initialize the Healthcare.gov API client
 */
export function initializeHealthcareGovClient(config: HealthcareGovConfig): HealthcareGovApiClient {
  apiClientInstance = new HealthcareGovApiClient(config)
  return apiClientInstance
}

/**
 * Get the Healthcare.gov API client instance
 */
export function getHealthcareGovClient(): HealthcareGovApiClient {
  if (!apiClientInstance) {
    throw new Error('Healthcare.gov API client not initialized. Call initializeHealthcareGovClient() first.')
  }
  return apiClientInstance
}

/**
 * Helper function to check if API client is configured
 */
export function isHealthcareGovConfigured(): boolean {
  return apiClientInstance !== null
}
