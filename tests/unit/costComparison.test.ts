/**
 * Unit Tests for Cost Comparison Service
 * Tests all cost calculation logic, edge cases, and business rules
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateComparison,
  estimateOutOfPocketCosts,
  type ComparisonInput,
} from '../../apps/api/src/services/costComparison.service'

describe('Cost Comparison Service - Unit Tests', () => {
  describe('calculateComparison', () => {
    it('should calculate costs for healthy young adult', async () => {
      const input: ComparisonInput = {
        age: 25,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 2,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)

      expect(result).toBeDefined()
      expect(result.traditionalTotalAnnual).toBeGreaterThan(0)
      expect(result.dpcTotalAnnual).toBeGreaterThan(0)
      expect(result.breakdown.traditional).toBeDefined()
      expect(result.breakdown.dpc).toBeDefined()
    })

    it('should calculate higher costs for older patients', async () => {
      const youngInput: ComparisonInput = {
        age: 25,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 2,
        prescriptionCount: 0,
      }

      const olderInput: ComparisonInput = {
        ...youngInput,
        age: 60,
      }

      const youngResult = await calculateComparison(youngInput)
      const olderResult = await calculateComparison(olderInput)

      expect(olderResult.traditionalTotalAnnual).toBeGreaterThan(
        youngResult.traditionalTotalAnnual
      )
    })

    it('should increase costs with chronic conditions', async () => {
      const healthyInput: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 4,
        prescriptionCount: 0,
      }

      const chronicInput: ComparisonInput = {
        ...healthyInput,
        chronicConditions: ['Diabetes', 'Hypertension'],
      }

      const healthyResult = await calculateComparison(healthyInput)
      const chronicResult = await calculateComparison(chronicInput)

      expect(chronicResult.dpcMonthlyFee).toBeGreaterThan(healthyResult.dpcMonthlyFee)
    })

    it('should calculate higher costs for frequent doctor visits', async () => {
      const lowVisitInput: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 2,
        prescriptionCount: 0,
      }

      const highVisitInput: ComparisonInput = {
        ...lowVisitInput,
        annualDoctorVisits: 12,
      }

      const lowVisitResult = await calculateComparison(lowVisitInput)
      const highVisitResult = await calculateComparison(highVisitInput)

      expect(highVisitResult.breakdown.traditional.copays).toBeGreaterThan(
        lowVisitResult.breakdown.traditional.copays
      )
    })

    it('should calculate prescription costs correctly', async () => {
      const noPrescriptionsInput: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 4,
        prescriptionCount: 0,
      }

      const prescriptionsInput: ComparisonInput = {
        ...noPrescriptionsInput,
        prescriptionCount: 3,
      }

      const noPrescriptionsResult = await calculateComparison(noPrescriptionsInput)
      const prescriptionsResult = await calculateComparison(prescriptionsInput)

      expect(prescriptionsResult.breakdown.traditional.prescriptions).toBeGreaterThan(
        noPrescriptionsResult.breakdown.traditional.prescriptions
      )
      expect(prescriptionsResult.breakdown.dpc.prescriptions).toBeGreaterThan(0)
    })

    it('should apply state-specific pricing multipliers', async () => {
      const caInput: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 4,
        prescriptionCount: 0,
      }

      const txInput: ComparisonInput = {
        ...caInput,
        state: 'TX',
        zipCode: '75001',
      }

      const caResult = await calculateComparison(caInput)
      const txResult = await calculateComparison(txInput)

      // CA should be more expensive than TX
      expect(caResult.traditionalPremium).toBeGreaterThan(txResult.traditionalPremium)
    })

    it('should recommend DPC when it saves money', async () => {
      const input: ComparisonInput = {
        age: 25,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 6,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)

      if (result.annualSavings > 0) {
        expect(result.recommendedPlan).toBe('DPC_CATASTROPHIC')
      } else {
        expect(result.recommendedPlan).toBe('TRADITIONAL')
      }
    })

    it('should calculate percentage savings correctly', async () => {
      const input: ComparisonInput = {
        age: 30,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 4,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)

      const expectedPercentage =
        (result.annualSavings / result.traditionalTotalAnnual) * 100

      expect(result.percentageSavings).toBeCloseTo(expectedPercentage, 1)
    })

    it('should handle edge case: age at minimum boundary (18)', async () => {
      const input: ComparisonInput = {
        age: 18,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 2,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)

      expect(result).toBeDefined()
      expect(result.traditionalTotalAnnual).toBeGreaterThan(0)
    })

    it('should handle edge case: age at maximum boundary (100)', async () => {
      const input: ComparisonInput = {
        age: 100,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 10,
        prescriptionCount: 5,
      }

      const result = await calculateComparison(input)

      expect(result).toBeDefined()
      expect(result.traditionalTotalAnnual).toBeGreaterThan(0)
    })

    it('should handle edge case: zero doctor visits', async () => {
      const input: ComparisonInput = {
        age: 30,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 0,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)

      expect(result.breakdown.traditional.copays).toBe(0)
    })

    it('should handle edge case: many chronic conditions', async () => {
      const input: ComparisonInput = {
        age: 50,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [
          'Diabetes',
          'Hypertension',
          'Asthma',
          'Arthritis',
          'High Cholesterol',
        ],
        annualDoctorVisits: 20,
        prescriptionCount: 10,
      }

      const result = await calculateComparison(input)

      expect(result).toBeDefined()
      expect(result.dpcMonthlyFee).toBeGreaterThan(75) // Should be higher for complex patient
    })
  })

  describe('estimateOutOfPocketCosts', () => {
    it('should return base costs for healthy individual', () => {
      const costs = estimateOutOfPocketCosts([], 4)
      expect(costs).toBeGreaterThan(0)
      expect(costs).toBeLessThan(1000)
    })

    it('should increase costs with chronic conditions', () => {
      const healthyCosts = estimateOutOfPocketCosts([], 4)
      const chronicCosts = estimateOutOfPocketCosts(['Diabetes', 'Hypertension'], 4)

      expect(chronicCosts).toBeGreaterThan(healthyCosts)
    })

    it('should increase costs with frequent visits', () => {
      const lowVisitCosts = estimateOutOfPocketCosts([], 4)
      const highVisitCosts = estimateOutOfPocketCosts([], 15)

      expect(highVisitCosts).toBeGreaterThan(lowVisitCosts)
    })

    it('should handle edge case: zero visits and conditions', () => {
      const costs = estimateOutOfPocketCosts([], 0)
      expect(costs).toBeGreaterThan(0) // Should have base costs
    })
  })

  describe('Cost Breakdown Structure', () => {
    it('should include all required fields in traditional breakdown', async () => {
      const input: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 4,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)
      const traditional = result.breakdown.traditional

      expect(traditional).toHaveProperty('premiums')
      expect(traditional).toHaveProperty('deductible')
      expect(traditional).toHaveProperty('copays')
      expect(traditional).toHaveProperty('prescriptions')
      expect(traditional).toHaveProperty('outOfPocket')
      expect(traditional).toHaveProperty('total')
    })

    it('should include all required fields in DPC breakdown', async () => {
      const input: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 4,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)
      const dpc = result.breakdown.dpc

      expect(dpc).toHaveProperty('premiums')
      expect(dpc).toHaveProperty('deductible')
      expect(dpc).toHaveProperty('copays')
      expect(dpc).toHaveProperty('prescriptions')
      expect(dpc).toHaveProperty('outOfPocket')
      expect(dpc).toHaveProperty('total')
    })

    it('should have zero copays in DPC breakdown', async () => {
      const input: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 10,
        prescriptionCount: 0,
      }

      const result = await calculateComparison(input)

      expect(result.breakdown.dpc.copays).toBe(0)
    })

    it('should have total equal to sum of components', async () => {
      const input: ComparisonInput = {
        age: 35,
        zipCode: '90001',
        state: 'CA',
        chronicConditions: [],
        annualDoctorVisits: 4,
        prescriptionCount: 2,
      }

      const result = await calculateComparison(input)
      const traditional = result.breakdown.traditional

      const calculatedTotal =
        traditional.premiums +
        traditional.deductible +
        traditional.copays +
        traditional.prescriptions

      expect(traditional.total).toBeCloseTo(calculatedTotal, 0)
    })
  })
})
