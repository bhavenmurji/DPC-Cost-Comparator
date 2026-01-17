/**
 * Shared hook for city landing pages
 * Handles provider fetching and dynamic stats calculation
 */
import { useEffect, useState } from 'react'

export interface CityProvider {
  id: string
  name: string
  npi?: string
  city: string
  state: string
  monthlyFee: number
  acceptingPatients?: boolean
  phone?: string
  website?: string
}

export interface CityStats {
  providerCount: number
  avgMonthlyFee: number
  estimatedSavings: number
}

interface UseCityProvidersResult {
  providers: CityProvider[]
  stats: CityStats
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch providers and calculate stats for city landing pages
 *
 * @param zipCode - Central ZIP code for the city
 * @param radius - Search radius in miles (default 50)
 */
export function useCityProviders(zipCode: string, radius: number = 50): UseCityProvidersResult {
  const [providers, setProviders] = useState<CityProvider[]>([])
  const [stats, setStats] = useState<CityStats>({ providerCount: 0, avgMonthlyFee: 0, estimatedSavings: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/providers/search?zipCode=${zipCode}&radius=${radius}`
        )

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()

        // Fix: Access the providers array from the response object
        // API returns { success, count, providers: [...] }
        const providerList = data.providers || []
        setProviders(providerList.slice(0, 5))

        // Calculate dynamic stats from actual data
        const count = data.count || providerList.length
        const avgFee = providerList.length > 0
          ? Math.round(
              providerList.reduce((sum: number, p: CityProvider) => sum + (p.monthlyFee || 0), 0) /
              providerList.length
            )
          : 150 // Fallback average

        // Estimated savings vs traditional insurance
        // Traditional: ~$500/mo individual premium + $2000 deductible/copays = $8000/year
        // DPC: avgFee * 12
        const annualDpcCost = avgFee * 12
        const traditionalCost = 6000 + 2000 // Conservative estimate
        const savings = traditionalCost - annualDpcCost

        setStats({
          providerCount: count,
          avgMonthlyFee: avgFee,
          estimatedSavings: Math.max(savings, 0)
        })
      } catch (err) {
        console.error('Error fetching providers:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch providers')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [zipCode, radius])

  return { providers, stats, loading, error }
}
