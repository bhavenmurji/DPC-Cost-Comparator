import { useState, useEffect } from 'react'
import { providerService, ProviderSearchResult } from '../services/providerService'
import ProviderCard from '../components/ProviderCard'
import ProviderCardSkeleton from '../components/ProviderCardSkeleton'
import ProviderMap from '../components/ProviderMap'
import ProviderFilters, { FilterOptions } from '../components/ProviderFilters'
import ErrorBoundary from '../components/ErrorBoundary'
import { analytics } from '../utils/analytics'

export default function ProviderSearch() {
  const [zipCode, setZipCode] = useState('')
  const [radius, setRadius] = useState(25)
  const [results, setResults] = useState<ProviderSearchResult[]>([])
  const [filteredResults, setFilteredResults] = useState<ProviderSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [totalProviders, setTotalProviders] = useState<number | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [showMap, setShowMap] = useState(true)

  // Load provider stats on mount
  useEffect(() => {
    loadProviderStats()
  }, [])

  const loadProviderStats = async () => {
    try {
      const stats = await providerService.getProviderStats()
      if (stats.success) {
        setTotalProviders(stats.stats.totalProviders)
      }
    } catch (err) {
      console.error('Failed to load provider stats:', err)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!zipCode || zipCode.length !== 5) {
      setError('Please enter a valid 5-digit ZIP code')
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const response = await providerService.searchProviders({
        zipCode,
        radius,
        acceptingPatients: true,
      })

      setResults(response.providers)
      setFilteredResults(response.providers)

      // Track successful provider search
      analytics.trackProviderSearch({
        zipCode,
        radius,
        resultsCount: response.providers.length,
      })

      // Set map center from API response
      if (response.coordinates && response.coordinates.lat && response.coordinates.lng) {
        setMapCenter({
          lat: response.coordinates.lat,
          lng: response.coordinates.lng,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search providers')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setZipCode('')
    setRadius(25)
    setResults([])
    setFilteredResults([])
    setSearched(false)
    setError(null)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    applyFilters(results, newFilters)

    // Track filter usage
    analytics.trackFiltersApplied({
      maxMonthlyFee: newFilters.maxMonthlyFee,
      minRating: newFilters.minRating,
      acceptingPatients: newFilters.acceptingPatients ?? undefined,
      specialties: newFilters.specialties,
      sortBy: newFilters.sortBy,
    })
  }

  const applyFilters = (providers: ProviderSearchResult[], filterOptions: FilterOptions) => {
    let filtered = [...providers]

    // Apply price filter
    if (filterOptions.maxMonthlyFee < 500) {
      filtered = filtered.filter(p => p.monthlyFee <= filterOptions.maxMonthlyFee)
    }

    // Apply accepting patients filter
    if (filterOptions.acceptingPatients !== null) {
      filtered = filtered.filter(p => p.acceptingPatients === filterOptions.acceptingPatients)
    }

    // Apply rating filter
    if (filterOptions.minRating > 0) {
      filtered = filtered.filter(p => (p.rating || 0) >= filterOptions.minRating)
    }

    // Apply specialty filter
    if (filterOptions.specialties.length > 0) {
      filtered = filtered.filter(p =>
        filterOptions.specialties.some(spec =>
          p.specialties?.some((s: string) => s.toLowerCase().includes(spec.toLowerCase()))
        )
      )
    }

    // Apply sorting
    switch (filterOptions.sortBy) {
      case 'distance':
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        break
      case 'price':
        filtered.sort((a, b) => a.monthlyFee - b.monthlyFee)
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    setFilteredResults(filtered)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-12 px-4 text-center">
        <h1 className="text-4xl font-bold mb-2">Find DPC Providers Near You</h1>
        <p className="text-lg opacity-90">
          Search {totalProviders ? totalProviders.toLocaleString() : 'thousands of'} Direct Primary Care providers across the United States
        </p>
      </div>

      <div className="flex max-w-screen-xl mx-auto py-8 px-4 gap-8">
        <div className="w-80 flex-shrink-0">
          <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-4">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
              <input
                type="text"
                pattern="[0-9]{5}"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter ZIP code"
                className="w-full px-3 py-2 text-base border border-gray-300 rounded box-border"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Radius: {radius} miles
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-sm bg-gray-200 outline-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>5 mi</span>
                <span>50 mi</span>
                <span>100 mi</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-3 py-2 text-base font-semibold text-white border-none rounded cursor-pointer transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? 'Searching...' : 'Search Providers'}
            </button>

            {searched && (
              <button
                type="button"
                onClick={handleReset}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded cursor-pointer mt-2"
              >
                Clear Search
              </button>
            )}
          </form>

          {searched && !loading && results.length > 0 && (
            <ProviderFilters
              onFilterChange={handleFilterChange}
              totalResults={filteredResults.length}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {error && (
            <div className="bg-red-50 border border-red-500 rounded-lg p-4 text-red-900 mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <ProviderCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!loading && searched && filteredResults.length === 0 && results.length > 0 && (
            <div className="text-center py-16 px-8 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No providers match your filters</h2>
              <p className="text-base text-gray-500">
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-16 px-8 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No providers found</h2>
              <p className="text-base text-gray-500 mb-2">
                We couldn't find any DPC providers within {radius} miles of {zipCode}.
              </p>
              <p className="text-sm text-gray-400">
                Try increasing your search radius or searching a different area.
              </p>
            </div>
          )}

          {!loading && filteredResults.length > 0 && (
            <>
              {/* View toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold border-none rounded-md cursor-pointer transition-all ${showMap ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-gray-500'}`}
                >
                  🗺️ Map View
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(false)}
                  className={`flex-1 px-4 py-3 text-sm font-semibold border-none rounded-md cursor-pointer transition-all ${!showMap ? 'bg-white text-blue-600 shadow-sm' : 'bg-transparent text-gray-500'}`}
                >
                  📋 List View
                </button>
              </div>

              {/* Map view */}
              {showMap && mapCenter && (
                <div className="mb-8">
                  <ErrorBoundary errorBoundaryId="provider-map">
                    <ProviderMap
                      results={filteredResults}
                      center={mapCenter}
                      onProviderSelect={(provider) => {
                        console.log('Selected provider:', provider)
                        // Scroll to provider card or show details
                      }}
                    />
                  </ErrorBoundary>
                </div>
              )}

              {/* List view */}
              {!showMap && (
                <ErrorBoundary errorBoundaryId="provider-list">
                  <div className="flex flex-col">
                    {filteredResults.map((result, index) => (
                      <ProviderCard
                        key={result.id || `provider-${index}`}
                        result={result}
                        searchZipCode={zipCode}
                        searchCenter={mapCenter || undefined}
                      />
                    ))}
                  </div>
                </ErrorBoundary>
              )}
            </>
          )}

          {!searched && !loading && (
            <div className="text-center py-16 px-8 bg-white rounded-lg shadow-md">
              <div className="text-6xl mb-4">🏥</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Search for DPC Providers</h2>
              <p className="text-base text-gray-500 mb-8">
                Enter your ZIP code to find Direct Primary Care providers in your area.
              </p>
              <div className="flex flex-col gap-3 text-left max-w-md mx-auto">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Compare monthly membership fees</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Find providers accepting new patients</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>View included services and specialties</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

