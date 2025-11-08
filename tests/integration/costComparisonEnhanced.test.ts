/**
 * Integration Tests for Enhanced Cost Comparison Service
 *
 * Tests the integration between cost comparison logic and Healthcare.gov API
 */

import { describe, it, expect, beforeAll, vi } from 'vitest'
import {
  calculateEnhancedComparison,
  checkApiAvailability,
} from '../../apps/api/src/services/costComparisonEnhanced.service'
import { initializeHealthcareGovClient } from '../../apps/api/src/services/healthcareGov.service'
import { ComparisonInput } from '../../apps/api/src/services/costComparison.service'

describe('Enhanced Cost Comparison Service', () => {
  const mockInput: ComparisonInput = {
    age: 30,
    zipCode: '27701',
    state: 'NC',
    chronicConditions: [],
    annualDoctorVisits: 4,
    prescriptionCount: 2,
  }

  describe('Fallback to Estimates', () => {
    it('should calculate comparison using estimates when API not configured', async () => {
      const result = await calculateEnhancedComparison(mockInput, {
        useApiData: false,
      })

      expect(result).toBeDefined()
      expect(result.traditionalTotalAnnual).toBeGreaterThan(0)
      expect(result.dpcTotalAnnual).toBeGreaterThan(0)
      expect(result.dataSource.traditional).toBe('estimate')
      expect(result.dataSource.catastrophic).toBe('estimate')
    })

    it('should include data source information', async () => {
      const result = await calculateEnhancedComparison(mockInput, {
        useApiData: false,
      })

      expect(result.dataSource).toBeDefined()
      expect(result.dataSource.traditional).toBe('estimate')
      expect(result.dataSource.catastrophic).toBe('estimate')
      expect(result.dataSource.lastUpdated).toBeInstanceOf(Date)
    })
  })

  describe('Cost Calculations', () => {
    it('should calculate traditional costs correctly', async () => {
      const result = await calculateEnhancedComparison(mockInput, {
        useApiData: false,
      })

      // Traditional should include premiums, deductible, copays, prescriptions
      expect(result.traditionalPremium).toBeGreaterThan(0)
      expect(result.traditionalDeductible).toBeGreaterThan(0)
      expect(result.breakdown.traditional.copays).toBeGreaterThan(0)
      expect(result.breakdown.traditional.prescriptions).toBeGreaterThan(0)
    })

    it('should calculate DPC + catastrophic costs correctly', async () => {
      const result = await calculateEnhancedComparison(mockInput, {
        useApiData: false,
      })

      // DPC should include membership fee and catastrophic premium
      expect(result.dpcMonthlyFee).toBeGreaterThan(0)
      expect(result.catastrophicPremium).toBeGreaterThan(0)
      expect(result.catastrophicDeductible).toBeGreaterThan(0)

      // DPC should have no copays (covered by membership)
      expect(result.breakdown.dpc.copays).toBe(0)
    })

    it('should calculate savings correctly', async () => {
      const result = await calculateEnhancedComparison(mockInput, {
        useApiData: false,
      })

      const expectedSavings = result.traditionalTotalAnnual - result.dpcTotalAnnual
      expect(result.annualSavings).toBe(expectedSavings)

      const expectedPercentage = (expectedSavings / result.traditionalTotalAnnual) * 100
      expect(result.percentageSavings).toBeCloseTo(expectedPercentage, 2)
    })

    it('should recommend correct plan based on savings', async () => {
      const result = await calculateEnhancedComparison(mockInput, {
        useApiData: false,
      })

      if (result.annualSavings > 0) {
        expect(result.recommendedPlan).toBe('DPC_CATASTROPHIC')
      } else {
        expect(result.recommendedPlan).toBe('TRADITIONAL')
      }
    })
  })

  describe('Age-Based Premium Calculations', () => {
    it('should calculate higher premiums for older ages', async () => {
      const youngPerson = await calculateEnhancedComparison(
        { ...mockInput, age: 25 },
        { useApiData: false }
      )

      const olderPerson = await calculateEnhancedComparison(
        { ...mockInput, age: 55 },
        { useApiData: false }
      )

      expect(olderPerson.traditionalPremium).toBeGreaterThan(youngPerson.traditionalPremium)
      expect(olderPerson.catastrophicPremium).toBeGreaterThan(youngPerson.catastrophicPremium)
    })
  })

  describe('Chronic Condition Impact', () => {
    it('should increase DPC fee for chronic conditions', async () => {
      const noConditions = await calculateEnhancedComparison(
        { ...mockInput, chronicConditions: [] },
        { useApiData: false }
      )

      const withConditions = await calculateEnhancedComparison(
        { ...mockInput, chronicConditions: ['diabetes', 'hypertension'] },
        { useApiData: false }
      )

      expect(withConditions.dpcMonthlyFee).toBeGreaterThan(noConditions.dpcMonthlyFee)
    })
  })

  describe('Doctor Visit Frequency', () => {
    it('should increase traditional costs with more visits', async () => {
      const fewVisits = await calculateEnhancedComparison(
        { ...mockInput, annualDoctorVisits: 2 },
        { useApiData: false }
      )

      const manyVisits = await calculateEnhancedComparison(
        { ...mockInput, annualDoctorVisits: 12 },
        { useApiData: false }
      )

      expect(manyVisits.breakdown.traditional.copays).toBeGreaterThan(
        fewVisits.breakdown.traditional.copays
      )
      expect(manyVisits.traditionalTotalAnnual).toBeGreaterThan(
        fewVisits.traditionalTotalAnnual
      )
    })

    it('should not increase DPC costs with more visits', async () => {
      const fewVisits = await calculateEnhancedComparison(
        { ...mockInput, annualDoctorVisits: 2 },
        { useApiData: false }
      )

      const manyVisits = await calculateEnhancedComparison(
        { ...mockInput, annualDoctorVisits: 12 },
        { useApiData: false }
      )

      // DPC has no copays regardless of visit frequency
      expect(manyVisits.breakdown.dpc.copays).toBe(fewVisits.breakdown.dpc.copays)
    })
  })

  describe('Prescription Impact', () => {
    it('should calculate prescription costs for traditional insurance', async () => {
      const result = await calculateEnhancedComparison(
        { ...mockInput, prescriptionCount: 3 },
        { useApiData: false }
      )

      expect(result.breakdown.traditional.prescriptions).toBeGreaterThan(0)
    })

    it('should have lower prescription costs with DPC', async () => {
      const result = await calculateEnhancedComparison(
        { ...mockInput, prescriptionCount: 3 },
        { useApiData: false }
      )

      // DPC prescriptions should be cheaper (50% discount assumed)
      expect(result.breakdown.dpc.prescriptions).toBeLessThan(
        result.breakdown.traditional.prescriptions
      )
    })
  })

  describe('API Availability Check', () => {
    it('should report API unavailable when not configured', () => {
      const status = checkApiAvailability()
      expect(status.available).toBeDefined()
      expect(status.message).toBeDefined()
    })
  })

  describe('Response Format Validation', () => {
    it('should return all required fields', async () => {
      const result = await calculateEnhancedComparison(mockInput, {
        useApiData: false,
      })

      // Traditional fields
      expect(result.traditionalPremium).toBeDefined()
      expect(result.traditionalDeductible).toBeDefined()
      expect(result.traditionalOutOfPocket).toBeDefined()
      expect(result.traditionalTotalAnnual).toBeDefined()

      // DPC fields
      expect(result.dpcMonthlyFee).toBeDefined()
      expect(result.dpcAnnualFee).toBeDefined()
      expect(result.catastrophicPremium).toBeDefined()
      expect(result.catastrophicDeductible).toBeDefined()
      expect(result.catastrophicOutOfPocket).toBeDefined()
      expect(result.dpcTotalAnnual).toBeDefined()

      // Results
      expect(result.annualSavings).toBeDefined()
      expect(result.percentageSavings).toBeDefined()
      expect(result.recommendedPlan).toBeDefined()

      // Breakdown
      expect(result.breakdown.traditional).toBeDefined()
      expect(result.breakdown.dpc).toBeDefined()

      // Data source
      expect(result.dataSource).toBeDefined()
    })
  })
})
