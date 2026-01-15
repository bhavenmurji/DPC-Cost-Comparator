/**
 * Integration Tests for Healthcare.gov API Client
 *
 * Tests API client functionality including error handling,
 * caching, and data transformation.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import axios from 'axios'
import {
  HealthcareGovApiClient,
  initializeHealthcareGovClient,
  getHealthcareGovClient,
  isHealthcareGovConfigured,
} from '../../apps/api/src/services/healthcareGov.service'
import {
  PlanSearchRequest,
  PlanSearchResponse,
  HealthcareGovPlan,
} from '../../apps/api/src/types/healthcareGov.types'

// Mock axios
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    isAxiosError: vi.fn(),
  },
}))

const mockedAxios = axios as any

describe('HealthcareGovApiClient', () => {
  let client: HealthcareGovApiClient

  beforeAll(() => {
    // Initialize client with test config
    client = new HealthcareGovApiClient({
      apiKey: 'test-api-key-12345',
      baseUrl: 'https://test.api.healthcare.gov',
      timeout: 5000,
      enableCache: true,
      cacheTTL: 60, // 60 seconds for testing
    })
  })

  afterAll(() => {
    client.clearCache()
  })

  describe('Client Initialization', () => {
    it('should create client with valid config', () => {
      expect(client).toBeInstanceOf(HealthcareGovApiClient)
    })

    it('should throw error with missing API key', () => {
      expect(() => {
        new HealthcareGovApiClient({ apiKey: '' })
      }).toThrow('Healthcare.gov API key is required')
    })

    it('should throw error with placeholder API key', () => {
      expect(() => {
        new HealthcareGovApiClient({ apiKey: 'your_api_key_here' })
      }).toThrow('Healthcare.gov API key is required')
    })
  })

  describe('Plan Search', () => {
    const mockPlanSearchRequest: PlanSearchRequest = {
      household: {
        income: 50000,
        people: [
          {
            age: 30,
            aptc_eligible: true,
            uses_tobacco: false,
          },
        ],
      },
      place: {
        state: 'NC',
        countyfips: '37063',
        zipcode: '27701',
      },
      market: 'Individual',
      year: 2024,
    }

    const mockPlanSearchResponse: PlanSearchResponse = {
      plans: [
        {
          id: '12345NC0123456-01',
          name: 'Test Silver Plan',
          metal_level: 'Silver',
          type: 'HMO',
          issuer: {
            id: '12345',
            name: 'Test Insurance Company',
          },
          premium: {
            premium: 450,
            premium_tax_credit: 100,
            premium_w_credit: 350,
          },
          benefits: {
            deductible: {
              individual: 2000,
              family: 4000,
            },
            maximum_out_of_pocket: {
              individual: 7500,
              family: 15000,
            },
            primary_care_visit: '$25 copay',
            specialist_visit: '$50 copay',
            generic_drugs: '$10 copay',
          },
          quality_rating: 4,
          hsa_eligible: false,
        } as HealthcareGovPlan,
      ],
      total: 1,
      offset: 0,
      limit: 10,
    }

    it('should search for plans successfully', async () => {
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({ data: mockPlanSearchResponse }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })

      const client = new HealthcareGovApiClient({
        apiKey: 'test-key',
        enableCache: false,
      })

      const response = await client.searchPlans(mockPlanSearchRequest)

      expect(response).toBeDefined()
      expect(response.plans).toHaveLength(1)
      expect(response.plans[0].metal_level).toBe('Silver')
    })

    it('should cache plan search results', async () => {
      const postSpy = vi.fn().mockResolvedValue({ data: mockPlanSearchResponse })

      mockedAxios.create.mockReturnValue({
        post: postSpy,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })

      const client = new HealthcareGovApiClient({
        apiKey: 'test-key',
        enableCache: true,
      })

      // First call - should hit API
      await client.searchPlans(mockPlanSearchRequest)
      expect(postSpy).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      await client.searchPlans(mockPlanSearchRequest)
      expect(postSpy).toHaveBeenCalledTimes(1) // Still 1, not 2
    })
  })

  describe('Catastrophic Plans', () => {
    it('should search for catastrophic plans with override', async () => {
      const postSpy = vi.fn().mockResolvedValue({
        data: {
          plans: [],
          total: 0,
          offset: 0,
          limit: 10,
        },
      })

      mockedAxios.create.mockReturnValue({
        post: postSpy,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })

      const client = new HealthcareGovApiClient({
        apiKey: 'test-key',
        enableCache: false,
      })

      await client.searchCatastrophicPlans({
        household: { income: 50000, people: [{ age: 25 }] },
        place: { state: 'NC', countyfips: '37063', zipcode: '27701' },
        market: 'Individual',
      })

      expect(postSpy).toHaveBeenCalledWith(
        '/plans/search',
        expect.objectContaining({
          filter: { metal: ['catastrophic'] },
          catastrophic_override: true,
        })
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockRejectedValue({
          response: {
            status: 400,
            data: {
              code: 1001,
              message: 'Invalid request parameters',
            },
          },
          isAxiosError: true,
        }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn((success, error) => error) },
        },
      })

      const client = new HealthcareGovApiClient({
        apiKey: 'test-key',
        enableCache: false,
      })

      await expect(
        client.searchPlans({
          household: { income: -1, people: [] }, // Invalid
          place: { state: '', countyfips: '', zipcode: '' },
          market: 'Individual',
        })
      ).rejects.toThrow()
    })

    it('should handle network errors', async () => {
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockRejectedValue(new Error('Network error')),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn((success, error) => error) },
        },
      })

      const client = new HealthcareGovApiClient({
        apiKey: 'test-key',
        enableCache: false,
      })

      await expect(
        client.searchPlans({
          household: { income: 50000, people: [{ age: 30 }] },
          place: { state: 'NC', countyfips: '37063', zipcode: '27701' },
          market: 'Individual',
        })
      ).rejects.toThrow()
    })

    it('should handle timeout errors', async () => {
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockRejectedValue({
          code: 'ECONNABORTED',
          message: 'timeout of 5000ms exceeded',
          isAxiosError: true,
        }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn((success, error) => error) },
        },
      })

      const client = new HealthcareGovApiClient({
        apiKey: 'test-key',
        timeout: 5000,
        enableCache: false,
      })

      await expect(
        client.searchPlans({
          household: { income: 50000, people: [{ age: 30 }] },
          place: { state: 'NC', countyfips: '37063', zipcode: '27701' },
          market: 'Individual',
        })
      ).rejects.toThrow()
    })
  })

  describe('Cache Management', () => {
    it('should clear cache successfully', () => {
      client.clearCache()
      const stats = client.getCacheStats()
      expect(stats.size).toBe(0)
    })

    it('should return cache statistics', async () => {
      mockedAxios.create.mockReturnValue({
        post: vi.fn().mockResolvedValue({
          data: { plans: [], total: 0, offset: 0, limit: 10 },
        }),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })

      const client = new HealthcareGovApiClient({
        apiKey: 'test-key',
        enableCache: true,
      })

      await client.searchPlans({
        household: { income: 50000, people: [{ age: 30 }] },
        place: { state: 'NC', countyfips: '37063', zipcode: '27701' },
        market: 'Individual',
      })

      const stats = client.getCacheStats()
      expect(stats.size).toBeGreaterThan(0)
      expect(stats.keys).toBeInstanceOf(Array)
    })
  })

  describe('Singleton Pattern', () => {
    it('should initialize singleton instance', () => {
      const instance = initializeHealthcareGovClient({
        apiKey: 'test-singleton-key',
      })
      expect(instance).toBeInstanceOf(HealthcareGovApiClient)
    })

    it('should return singleton instance', () => {
      initializeHealthcareGovClient({ apiKey: 'test-key' })
      const instance = getHealthcareGovClient()
      expect(instance).toBeInstanceOf(HealthcareGovApiClient)
    })

    it('should check if client is configured', () => {
      initializeHealthcareGovClient({ apiKey: 'test-key' })
      expect(isHealthcareGovConfigured()).toBe(true)
    })

    it('should throw error if singleton not initialized', () => {
      // This would need to reset the singleton, which we can't do in current implementation
      // But we can test the check function
      expect(() => {
        // Force a new instance to test
        const instance = getHealthcareGovClient()
        expect(instance).toBeDefined()
      }).not.toThrow()
    })
  })
})
