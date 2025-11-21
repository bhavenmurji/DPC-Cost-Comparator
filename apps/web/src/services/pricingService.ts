// Pricing Service
// API calls for prescription and lab test pricing

import { apiClient } from './apiClient'

export interface PrescriptionPrice {
  id: string
  medicationName: string
  dosage: string
  quantity: number
  pharmacy: 'goodrx' | 'costco' | 'walmart' | 'cvs' | 'walgreens'
  price: number
  savingsProgram?: string
  lastUpdated: Date
}

export interface LabTestPrice {
  id: string
  testName: string
  provider: 'labcorp' | 'quest' | 'dpc_affiliate'
  price: number
  withInsurance?: number
  withoutInsurance: number
  lastUpdated: Date
}

export interface PrescriptionSearchParams {
  medicationName: string
  zipCode?: string
  dosage?: string
  quantity?: number
}

export interface LabTestSearchParams {
  testName: string
  zipCode?: string
}

export interface PrescriptionComparison {
  medication: string
  dosage: string
  quantity: number
  prices: {
    pharmacy: string
    price: number
    savingsProgram?: string
  }[]
  lowestPrice: number
  averagePrice: number
  potentialSavings: number
}

export interface LabTestComparison {
  testName: string
  prices: {
    provider: string
    withInsurance?: number
    withoutInsurance: number
  }[]
  lowestPrice: number
  averagePrice: number
  potentialSavings: number
}

class PricingService {
  async searchPrescriptionPrices(params: PrescriptionSearchParams): Promise<PrescriptionPrice[]> {
    const queryParams = new URLSearchParams({
      medicationName: params.medicationName,
    })

    if (params.zipCode) queryParams.append('zipCode', params.zipCode)
    if (params.dosage) queryParams.append('dosage', params.dosage)
    if (params.quantity) queryParams.append('quantity', params.quantity.toString())

    return apiClient.get<PrescriptionPrice[]>(`/api/pricing/prescriptions?${queryParams}`)
  }

  async searchLabTestPrices(params: LabTestSearchParams): Promise<LabTestPrice[]> {
    const queryParams = new URLSearchParams({
      testName: params.testName,
    })

    if (params.zipCode) queryParams.append('zipCode', params.zipCode)

    return apiClient.get<LabTestPrice[]>(`/api/pricing/lab-tests?${queryParams}`)
  }

  async comparePrescriptionPrices(
    medicationName: string,
    zipCode?: string
  ): Promise<PrescriptionComparison> {
    const queryParams = new URLSearchParams({ medicationName })
    if (zipCode) queryParams.append('zipCode', zipCode)

    return apiClient.get<PrescriptionComparison>(`/api/pricing/prescriptions/compare?${queryParams}`)
  }

  async compareLabTestPrices(testName: string, zipCode?: string): Promise<LabTestComparison> {
    const queryParams = new URLSearchParams({ testName })
    if (zipCode) queryParams.append('zipCode', zipCode)

    return apiClient.get<LabTestComparison>(`/api/pricing/lab-tests/compare?${queryParams}`)
  }

  async getCommonPrescriptions(): Promise<string[]> {
    return apiClient.get<string[]>('/api/pricing/prescriptions/common')
  }

  async getCommonLabTests(): Promise<string[]> {
    return apiClient.get<string[]>('/api/pricing/lab-tests/common')
  }
}

export const pricingService = new PricingService()
