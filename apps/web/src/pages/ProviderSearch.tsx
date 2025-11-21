import { useState, useEffect } from 'react'
import { providerService, ProviderSearchResult } from '../services/providerService'
import ProviderCard from '../components/ProviderCard'
import ProviderMap from '../components/ProviderMap'
import ProviderFilters, { FilterOptions } from '../components/ProviderFilters'
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
      acceptingPatients: newFilters.acceptingPatients,
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Find DPC Providers Near You</h1>
        <p style={styles.subtitle}>
          Search {totalProviders ? totalProviders.toLocaleString() : 'thousands of'} Direct Primary Care providers across the United States
        </p>
      </div>

      <div style={styles.content}>
        <div style={styles.sidebar}>
          <form onSubmit={handleSearch} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>ZIP Code</label>
              <input
                type="text"
                pattern="[0-9]{5}"
                maxLength={5}
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter ZIP code"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Search Radius: {radius} miles
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span>5 mi</span>
                <span>50 mi</span>
                <span>100 mi</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? 'Searching...' : 'Search Providers'}
            </button>

            {searched && (
              <button
                type="button"
                onClick={handleReset}
                style={styles.resetButton}
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

        <div style={styles.main}>
          {error && (
            <div style={styles.error}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Searching for providers near {zipCode}...</p>
            </div>
          )}

          {!loading && searched && filteredResults.length === 0 && results.length > 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <h2 style={styles.emptyTitle}>No providers match your filters</h2>
              <p style={styles.emptyText}>
                Try adjusting your filters to see more results.
              </p>
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <h2 style={styles.emptyTitle}>No providers found</h2>
              <p style={styles.emptyText}>
                We couldn't find any DPC providers within {radius} miles of {zipCode}.
              </p>
              <p style={styles.emptyHint}>
                Try increasing your search radius or searching a different area.
              </p>
            </div>
          )}

          {!loading && filteredResults.length > 0 && (
            <>
              {/* View toggle */}
              <div style={styles.viewToggle}>
                <button
                  onClick={() => setShowMap(true)}
                  style={{
                    ...styles.toggleButton,
                    ...(showMap ? styles.toggleButtonActive : {}),
                  }}
                >
                  🗺️ Map View
                </button>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    ...styles.toggleButton,
                    ...(!showMap ? styles.toggleButtonActive : {}),
                  }}
                >
                  📋 List View
                </button>
              </div>

              {/* Map view */}
              {showMap && mapCenter && (
                <div style={styles.mapContainer}>
                  <ProviderMap
                    results={filteredResults}
                    center={mapCenter}
                    onProviderSelect={(provider) => {
                      console.log('Selected provider:', provider)
                      // Scroll to provider card or show details
                    }}
                  />
                </div>
              )}

              {/* List view */}
              {!showMap && (
                <div style={styles.results}>
                  {filteredResults.map((result, index) => (
                    <ProviderCard key={result.id || `provider-${index}`} result={result} />
                  ))}
                </div>
              )}
            </>
          )}

          {!searched && !loading && (
            <div style={styles.placeholder}>
              <div style={styles.placeholderIcon}>🏥</div>
              <h2 style={styles.placeholderTitle}>Search for DPC Providers</h2>
              <p style={styles.placeholderText}>
                Enter your ZIP code to find Direct Primary Care providers in your area.
              </p>
              <div style={styles.features}>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>Compare monthly membership fees</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>Find providers accepting new patients</span>
                </div>
                <div style={styles.feature}>
                  <span style={styles.featureIcon}>✓</span>
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

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '3rem 1rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1.125rem',
    opacity: 0.9,
    margin: 0,
  },
  content: {
    display: 'flex',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem',
    gap: '2rem',
  },
  sidebar: {
    width: '320px',
    flexShrink: 0,
  },
  form: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#e5e7eb',
    outline: 'none',
    cursor: 'pointer',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#6b7280',
    marginTop: '0.5rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  resetButton: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  resultsInfo: {
    backgroundColor: '#fff',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  resultsCount: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.25rem',
  },
  resultsHint: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  error: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '1rem',
    color: '#991b1b',
    marginBottom: '1rem',
  },
  loading: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    margin: '0 auto 1rem',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  emptyHint: {
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  placeholder: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  placeholderTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.5rem',
  },
  placeholderText: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem',
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    textAlign: 'left',
    maxWidth: '400px',
    margin: '0 auto',
  },
  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.9rem',
    color: '#374151',
  },
  featureIcon: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  results: {
    display: 'flex',
    flexDirection: 'column',
  },
  viewToggle: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    padding: '0.25rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
  },
  toggleButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    color: '#2563eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  mapContainer: {
    marginBottom: '2rem',
  },
}
