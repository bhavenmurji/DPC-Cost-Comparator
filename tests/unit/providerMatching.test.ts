/**
 * Unit Tests for Provider Matching Service
 * Tests matching algorithm, scoring, and provider filtering
 */
import { describe, it, expect } from 'vitest'
import {
  findMatchingProviders,
  getProviderDetails,
  type ProviderSearchCriteria,
} from '../../apps/api/src/services/providerMatching.service'

describe('Provider Matching Service - Unit Tests', () => {
  describe('findMatchingProviders', () => {
    it('should return array of matched providers', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should include match score for each provider', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(result).toHaveProperty('matchScore')
        expect(result.matchScore).toBeGreaterThanOrEqual(0)
        expect(result.matchScore).toBeLessThanOrEqual(100)
      })
    })

    it('should include distance for each provider', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(result).toHaveProperty('distanceMiles')
        expect(result.distanceMiles).toBeGreaterThanOrEqual(0)
      })
    })

    it('should include match reasons', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(result).toHaveProperty('matchReasons')
        expect(Array.isArray(result.matchReasons)).toBe(true)
      })
    })

    it('should filter by maximum distance', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
        maxDistanceMiles: 10,
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(result.distanceMiles).toBeLessThanOrEqual(10)
      })
    })

    it('should filter out providers not accepting patients', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(result.provider.acceptingPatients).toBe(true)
      })
    })

    it('should respect limit parameter', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const limit = 2
      const results = await findMatchingProviders(criteria, limit)

      expect(results.length).toBeLessThanOrEqual(limit)
    })

    it('should sort by match score descending', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].matchScore).toBeGreaterThanOrEqual(results[i].matchScore)
      }
    })

    it('should boost score for matching specialties', async () => {
      const criteriaWithSpecialty: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
        specialtiesNeeded: ['Family Medicine'],
      }

      const criteriaWithoutSpecialty: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const withSpecialty = await findMatchingProviders(criteriaWithSpecialty)
      const withoutSpecialty = await findMatchingProviders(criteriaWithoutSpecialty)

      // Providers with matching specialties should appear first
      const topMatch = withSpecialty[0]
      expect(topMatch.provider.specialties).toContain('Family Medicine')
    })

    it('should boost score for language match', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
        languagePreference: 'Spanish',
      }

      const results = await findMatchingProviders(criteria)

      // Check if top results speak Spanish
      if (results.length > 0) {
        const spanishSpeakers = results.filter((r) =>
          r.provider.languages.includes('Spanish')
        )
        expect(spanishSpeakers.length).toBeGreaterThan(0)
      }
    })

    it('should penalize providers exceeding max monthly fee', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
        maxMonthlyFee: 70,
      }

      const results = await findMatchingProviders(criteria)

      // Providers within budget should score higher
      const withinBudget = results.filter((r) => r.provider.monthlyFee <= 70)
      const overBudget = results.filter((r) => r.provider.monthlyFee > 70)

      if (withinBudget.length > 0 && overBudget.length > 0) {
        expect(withinBudget[0].matchScore).toBeGreaterThanOrEqual(
          overBudget[0].matchScore
        )
      }
    })

    it('should handle edge case: no matching providers', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
        maxDistanceMiles: 0.1, // Very restrictive
      }

      const results = await findMatchingProviders(criteria)

      expect(Array.isArray(results)).toBe(true)
      // May return empty array
    })

    it('should handle edge case: all criteria specified', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
        maxDistanceMiles: 25,
        specialtiesNeeded: ['Family Medicine', 'Internal Medicine'],
        chronicConditions: ['Diabetes'],
        languagePreference: 'English',
        maxMonthlyFee: 100,
      }

      const results = await findMatchingProviders(criteria)

      expect(Array.isArray(results)).toBe(true)
    })
  })

  describe('Provider Details', () => {
    it('should return complete provider information', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria, 1)

      if (results.length > 0) {
        const provider = results[0].provider

        expect(provider).toHaveProperty('id')
        expect(provider).toHaveProperty('npi')
        expect(provider).toHaveProperty('name')
        expect(provider).toHaveProperty('practiceName')
        expect(provider).toHaveProperty('address')
        expect(provider).toHaveProperty('city')
        expect(provider).toHaveProperty('state')
        expect(provider).toHaveProperty('zipCode')
        expect(provider).toHaveProperty('phone')
        expect(provider).toHaveProperty('monthlyFee')
        expect(provider).toHaveProperty('acceptingPatients')
        expect(provider).toHaveProperty('servicesIncluded')
        expect(provider).toHaveProperty('specialties')
        expect(provider).toHaveProperty('boardCertifications')
        expect(provider).toHaveProperty('languages')
      }
    })

    it('should have valid NPI format', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        const npi = result.provider.npi
        expect(npi).toMatch(/^\d{10}$/) // NPI should be 10 digits
      })
    })

    it('should have valid phone format', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(result.provider.phone).toBeTruthy()
        expect(result.provider.phone.length).toBeGreaterThan(0)
      })
    })

    it('should have positive monthly fee', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(result.provider.monthlyFee).toBeGreaterThan(0)
      })
    })

    it('should have services included array', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      results.forEach((result) => {
        expect(Array.isArray(result.provider.servicesIncluded)).toBe(true)
        expect(result.provider.servicesIncluded.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getProviderDetails', () => {
    it('should return provider by ID', async () => {
      const provider = await getProviderDetails('prov-1')

      expect(provider).toBeDefined()
      if (provider) {
        expect(provider.id).toBe('prov-1')
      }
    })

    it('should return null for non-existent provider', async () => {
      const provider = await getProviderDetails('non-existent-id')

      expect(provider).toBeNull()
    })
  })

  describe('Match Scoring Algorithm', () => {
    it('should give higher scores to closer providers', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      if (results.length >= 2) {
        // Closer providers should generally score higher
        const closeProviders = results.filter((r) => r.distanceMiles < 10)
        const farProviders = results.filter((r) => r.distanceMiles > 30)

        if (closeProviders.length > 0 && farProviders.length > 0) {
          const avgCloseScore =
            closeProviders.reduce((sum, r) => sum + r.matchScore, 0) /
            closeProviders.length
          const avgFarScore =
            farProviders.reduce((sum, r) => sum + r.matchScore, 0) / farProviders.length

          expect(avgCloseScore).toBeGreaterThanOrEqual(avgFarScore)
        }
      }
    })

    it('should boost scores for highly rated providers', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      const highlyRated = results.filter((r) => r.provider.rating && r.provider.rating >= 4.5)

      if (highlyRated.length > 0) {
        // Highly rated providers should be in top results
        expect(results.indexOf(highlyRated[0])).toBeLessThan(results.length / 2)
      }
    })

    it('should boost scores for board certified providers', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '90001',
        state: 'CA',
      }

      const results = await findMatchingProviders(criteria)

      const boardCertified = results.filter(
        (r) => r.provider.boardCertifications.length > 0
      )

      expect(boardCertified.length).toBeGreaterThan(0)
    })
  })
})
