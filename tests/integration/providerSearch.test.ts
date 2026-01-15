/**
 * Integration tests for provider search functionality
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import {
  findMatchingProviders,
  getProviderDetails,
  type ProviderSearchCriteria,
} from '../../apps/api/src/services/providerMatching.service'
import {
  searchProvidersNearby,
  getProviderById,
} from '../../apps/api/src/repositories/dpcProvider.repository'

const prisma = new PrismaClient()

// Test data
const testProvider = {
  npi: 'TEST1234567890',
  name: 'Dr. Test Provider',
  practiceName: 'Test Direct Primary Care',
  address: '123 Test St',
  city: 'Austin',
  state: 'TX',
  zipCode: '78701',
  latitude: 30.2672,
  longitude: -97.7431,
  phone: '512-555-TEST',
  email: 'test@testdpc.com',
  website: 'https://testdpc.com',
  monthlyFee: 75,
  familyFee: 150,
  servicesIncluded: ['Unlimited visits', 'Telemedicine'],
  specialties: ['Family Medicine'],
  boardCertifications: ['American Board of Family Medicine'],
  languages: ['English', 'Spanish'],
  acceptingPatients: true,
  rating: 4.8,
  reviewCount: 100,
}

describe('Provider Search Integration Tests', () => {
  beforeAll(async () => {
    // Set mock data mode
    process.env.USE_MOCK_DATA = 'true'

    // Clean up any existing test data
    // await prisma.dPCProvider.deleteMany({
    //   where: { npi: testProvider.npi },
    // })

    // Create test provider
    // await prisma.dPCProvider.create({
    //   data: testProvider,
    // })
  })

  afterAll(async () => {
    // Clean up test data
    // await prisma.dPCProvider.deleteMany({
    //   where: { npi: testProvider.npi },
    // })

    await prisma.$disconnect()
  })

  // Skip repository tests as they require a running database
  describe.skip('Repository Layer', () => {
    it('should find providers by location', async () => {
      const results = await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 25,
        state: 'TX',
        acceptingPatientsOnly: true,
      })

      expect(results.length).toBeGreaterThan(0)
      expect(results[0].state).toBe('TX')
      expect(results[0].acceptingPatients).toBe(true)
    })

    it('should filter by monthly fee', async () => {
      const results = await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 25,
        maxMonthlyFee: 80,
      })

      results.forEach((provider) => {
        expect(provider.monthlyFee).toBeLessThanOrEqual(80)
      })
    })

    it('should filter by specialties', async () => {
      const results = await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 25,
        specialties: ['Family Medicine'],
      })

      results.forEach((provider) => {
        expect(provider.specialties).toContain('Family Medicine')
      })
    })

    it('should filter by languages', async () => {
      const results = await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 25,
        languages: ['Spanish'],
      })

      results.forEach((provider) => {
        expect(provider.languages).toContain('Spanish')
      })
    })

    it('should calculate distances accurately', async () => {
      const results = await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 50,
      })

      results.forEach((provider) => {
        expect(provider.distanceMiles).toBeLessThanOrEqual(50)
        expect(provider.distanceMiles).toBeGreaterThanOrEqual(0)
      })

      // Should be sorted by distance
      for (let i = 1; i < results.length; i++) {
        expect(results[i].distanceMiles).toBeGreaterThanOrEqual(
          results[i - 1].distanceMiles
        )
      }
    })

    it('should get provider by ID', async () => {
      // First find a provider
      const providers = await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 25,
      })

      expect(providers.length).toBeGreaterThan(0)

      const provider = await getProviderById(providers[0].id)

      expect(provider).not.toBeNull()
      expect(provider?.id).toBe(providers[0].id)
      expect(provider?.npi).toBe(providers[0].npi)
    })
  })

  describe('Service Layer', () => {
    it('should find matching providers with scoring', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '78701',
        state: 'TX',
        maxDistanceMiles: 25,
      }

      const results = await findMatchingProviders(criteria, 10)

      expect(results.length).toBeGreaterThan(0)

      results.forEach((match) => {
        expect(match.matchScore).toBeGreaterThanOrEqual(0)
        expect(match.matchScore).toBeLessThanOrEqual(100)
        expect(match.matchReasons).toBeDefined()
        expect(Array.isArray(match.matchReasons)).toBe(true)
      })
    })

    it('should prioritize closer providers', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '78701',
        state: 'TX',
        maxDistanceMiles: 50,
      }

      const results = await findMatchingProviders(criteria, 10)

      // First result should have higher or equal score than last
      if (results.length > 1) {
        expect(results[0].matchScore).toBeGreaterThanOrEqual(
          results[results.length - 1].matchScore
        )
      }
    })

    it.skip('should boost score for specialty matches', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '78701',
        state: 'TX',
        maxDistanceMiles: 25,
        specialtiesNeeded: ['Family Medicine'],
      }

      const results = await findMatchingProviders(criteria, 10)

      const withSpecialty = results.filter((r) =>
        r.provider.specialties.includes('Family Medicine')
      )

      if (withSpecialty.length > 0) {
        expect(withSpecialty[0].matchReasons).toContain(
          expect.stringMatching(/Specializes in.*Family Medicine/i)
        )
      }
    })

    it.skip('should boost score for language matches', async () => {
      const criteria: ProviderSearchCriteria = {
        zipCode: '78701',
        state: 'TX',
        maxDistanceMiles: 25,
        languagePreference: 'Spanish',
      }

      const results = await findMatchingProviders(criteria, 10)

      const withSpanish = results.filter((r) =>
        r.provider.languages.includes('Spanish')
      )

      if (withSpanish.length > 0) {
        expect(withSpanish[0].matchReasons).toContain(
          expect.stringMatching(/Speaks Spanish/i)
        )
      }
    })

    it.skip('should get provider details', async () => {
      const providers = await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 25,
      })

      expect(providers.length).toBeGreaterThan(0)

      const details = await getProviderDetails(providers[0].id)

      expect(details).not.toBeNull()
      expect(details?.id).toBe(providers[0].id)
      expect(details?.name).toBeDefined()
      expect(details?.practiceName).toBeDefined()
    })
  })

  describe.skip('Error Handling', () => {
    it('should handle invalid ZIP codes gracefully', async () => {
      await expect(async () => {
        await searchProvidersNearby({
          zipCode: 'INVALID',
          maxDistanceMiles: 25,
        })
      }).rejects.toThrow()
    })

    it('should return null for non-existent provider ID', async () => {
      const provider = await getProviderById('non-existent-id')
      expect(provider).toBeNull()
    })

    it('should handle empty search results', async () => {
      const results = await searchProvidersNearby({
        zipCode: '99999',
        maxDistanceMiles: 1,
      })

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(0)
    })
  })

  describe.skip('Performance', () => {
    it('should complete search within reasonable time', async () => {
      const start = Date.now()

      await searchProvidersNearby({
        zipCode: '78701',
        maxDistanceMiles: 50,
      })

      const duration = Date.now() - start

      // Should complete within 100ms
      expect(duration).toBeLessThan(100)
    })
  })
})
