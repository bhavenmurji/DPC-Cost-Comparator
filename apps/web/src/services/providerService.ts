// Provider Service
// API calls for DPC provider data

import { apiClient } from './apiClient'

export interface Provider {
  id: string
  npi?: string
  name: string
  practiceName?: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email?: string
  website?: string
  monthlyFee: number
  familyFee?: number
  acceptingPatients?: boolean
  servicesIncluded?: string[]
  specialties?: string[]
  boardCertifications?: string[]
  languages?: string[]
  latitude?: number
  longitude?: number
  rating?: number
  reviewCount?: number
}

export interface ProviderSearchParams {
  zipCode: string
  radius: number
  specialties?: string[]
  maxMonthlyFee?: number
  acceptingPatients?: boolean
}

// API returns flat provider objects with distance, not nested structure
export interface ProviderSearchResult {
  id: string
  name: string
  npi?: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  website: string | null
  monthlyFee: number
  rating: number
  distance: number
  acceptingPatients?: boolean
  specialties?: string[]
  location: {
    latitude: number
    longitude: number
  }
  dataSource?: {
    source: string
    lastScraped: string
    dataQualityScore: number
  }
}

export interface ProviderSearchResponse {
  success: boolean
  providers: ProviderSearchResult[]
  count: number
  searchParams: {
    zipCode: string
    radius: number
    limit: number
    offset: number
  }
  coordinates: {
    lat: number
    lng: number
  }
}

export interface ProviderStatsResponse {
  success: boolean
  stats: {
    totalProviders: number
    providersByState: Record<string, number>
    averageMonthlyFee: number
    acceptingPatientsCount: number
  }
}

class ProviderService {
  async searchProviders(params: ProviderSearchParams): Promise<ProviderSearchResponse> {
    const queryParams = new URLSearchParams({
      zipCode: params.zipCode,
      radius: params.radius.toString(),
    })

    if (params.specialties && params.specialties.length > 0) {
      queryParams.append('specialties', params.specialties.join(','))
    }

    if (params.maxMonthlyFee) {
      queryParams.append('maxMonthlyFee', params.maxMonthlyFee.toString())
    }

    if (params.acceptingPatients !== undefined) {
      queryParams.append('acceptingPatients', params.acceptingPatients.toString())
    }

    return apiClient.get<ProviderSearchResponse>(`/api/providers/search?${queryParams}`)
  }

  async getProviderById(id: string): Promise<Provider> {
    const response = await apiClient.get<{ success: boolean; provider: Provider }>(`/api/providers/${id}`)
    return response.provider
  }

  async getProviderStats(): Promise<ProviderStatsResponse> {
    return apiClient.get<ProviderStatsResponse>('/api/providers/stats/summary')
  }
}

export const providerService = new ProviderService()
