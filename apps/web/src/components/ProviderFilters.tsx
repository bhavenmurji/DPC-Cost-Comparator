import { useState } from 'react'

export interface FilterOptions {
  sortBy: 'distance' | 'price' | 'rating' | 'name'
  maxMonthlyFee: number
  acceptingPatients: boolean | null
  specialties: string[]
  minRating: number
}

interface ProviderFiltersProps {
  onFilterChange: (filters: FilterOptions) => void
  totalResults: number
}

export default function ProviderFilters({ onFilterChange, totalResults }: ProviderFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'distance',
    maxMonthlyFee: 500,
    acceptingPatients: null,
    specialties: [],
    minRating: 0,
  })

  const commonSpecialties = [
    'Family Medicine',
    'Internal Medicine',
    'Pediatrics',
    'Geriatrics',
    'Sports Medicine',
    'Preventive Medicine',
  ]

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const toggleSpecialty = (specialty: string) => {
    const updated = filters.specialties.includes(specialty)
      ? filters.specialties.filter((s) => s !== specialty)
      : [...filters.specialties, specialty]
    updateFilter('specialties', updated)
  }

  const resetFilters = () => {
    const defaultFilters: FilterOptions = {
      sortBy: 'distance',
      maxMonthlyFee: 500,
      acceptingPatients: null,
      specialties: [],
      minRating: 0,
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const hasActiveFilters =
    filters.maxMonthlyFee < 500 ||
    filters.acceptingPatients !== null ||
    filters.specialties.length > 0 ||
    filters.minRating > 0

  return (
    <div style={styles.container}>
      {/* Filter Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>Filters & Sort</h3>
          <span style={styles.resultCount}>{totalResults} providers</span>
        </div>
        <div style={styles.headerRight}>
          {hasActiveFilters && (
            <button onClick={resetFilters} style={styles.resetButton}>
              Clear Filters
            </button>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} style={styles.toggleButton}>
            {isExpanded ? '− Less' : '+ More'}
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div style={styles.sortSection}>
        <label style={styles.label}>Sort by:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value as FilterOptions['sortBy'])}
          style={styles.select}
        >
          <option value="distance">Closest to Me</option>
          <option value="price">Lowest Price</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div style={styles.expandedFilters}>
          {/* Price Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>
              Maximum Monthly Fee: ${filters.maxMonthlyFee}
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={filters.maxMonthlyFee}
              onChange={(e) => updateFilter('maxMonthlyFee', parseInt(e.target.value))}
              style={styles.slider}
            />
            <div style={styles.sliderLabels}>
              <span>$0</span>
              <span>$250</span>
              <span>$500+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Minimum Rating</label>
            <div style={styles.ratingButtons}>
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter('minRating', rating)}
                  style={{
                    ...styles.ratingButton,
                    ...(filters.minRating === rating ? styles.ratingButtonActive : {}),
                  }}
                >
                  {rating === 0 ? 'Any' : `${rating}+ ★`}
                </button>
              ))}
            </div>
          </div>

          {/* Accepting Patients Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Accepting New Patients</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  checked={filters.acceptingPatients === null}
                  onChange={() => updateFilter('acceptingPatients', null)}
                  style={styles.radio}
                />
                All Providers
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  checked={filters.acceptingPatients === true}
                  onChange={() => updateFilter('acceptingPatients', true)}
                  style={styles.radio}
                />
                Yes, Accepting
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  checked={filters.acceptingPatients === false}
                  onChange={() => updateFilter('acceptingPatients', false)}
                  style={styles.radio}
                />
                Not Accepting
              </label>
            </div>
          </div>

          {/* Specialties Filter */}
          <div style={styles.filterGroup}>
            <label style={styles.label}>Specialties</label>
            <div style={styles.checkboxGrid}>
              {commonSpecialties.map((specialty) => (
                <label key={specialty} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.specialties.includes(specialty)}
                    onChange={() => toggleSpecialty(specialty)}
                    style={styles.checkbox}
                  />
                  {specialty}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  headerRight: {
    display: 'flex',
    gap: '0.5rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: 0,
    color: '#1a1a1a',
  },
  resultCount: {
    fontSize: '0.875rem',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
  },
  resetButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#6b7280',
    fontWeight: '500',
  },
  toggleButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#fff',
    fontWeight: '500',
  },
  sortSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  select: {
    flex: 1,
    padding: '0.5rem',
    fontSize: '0.875rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#fff',
  },
  expandedFilters: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
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
  },
  ratingButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
  },
  ratingButton: {
    padding: '0.5rem',
    fontSize: '0.875rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    color: '#374151',
  },
  ratingButtonActive: {
    backgroundColor: '#fbbf24',
    borderColor: '#f59e0b',
    color: '#fff',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  radio: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
}
