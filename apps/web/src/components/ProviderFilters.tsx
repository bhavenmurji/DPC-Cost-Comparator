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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Filter Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold m-0 text-gray-900">Filters & Sort</h3>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{totalResults} providers</span>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button onClick={resetFilters} className="px-4 py-2 text-sm bg-white border border-gray-200 rounded cursor-pointer text-gray-500 font-medium">
              Clear Filters
            </button>
          )}
          <button onClick={() => setIsExpanded(!isExpanded)} className="px-4 py-2 text-sm bg-blue-600 border-none rounded cursor-pointer text-white font-medium">
            {isExpanded ? '− Less' : '+ More'}
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold text-gray-700">Sort by:</label>
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value as FilterOptions['sortBy'])}
          className="flex-1 px-2 py-2 text-sm border border-gray-300 rounded bg-white"
        >
          <option value="distance">Closest to Me</option>
          <option value="price">Lowest Price</option>
          <option value="rating">Highest Rated</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col gap-6">
          {/* Price Filter */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">
              Maximum Monthly Fee: ${filters.maxMonthlyFee}
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={filters.maxMonthlyFee}
              onChange={(e) => updateFilter('maxMonthlyFee', parseInt(e.target.value))}
              className="w-full h-1.5 rounded-sm bg-gray-200 outline-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$0</span>
              <span>$250</span>
              <span>$500+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">Minimum Rating</label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateFilter('minRating', rating)}
                  className={`px-2 py-2 text-sm border rounded cursor-pointer font-medium ${filters.minRating === rating ? 'bg-amber-400 border-amber-500 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'}`}
                >
                  {rating === 0 ? 'Any' : `${rating}+ ★`}
                </button>
              ))}
            </div>
          </div>

          {/* Accepting Patients Filter */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">Accepting New Patients</label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={filters.acceptingPatients === null}
                  onChange={() => updateFilter('acceptingPatients', null)}
                  className="w-4 h-4 cursor-pointer"
                />
                All Providers
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={filters.acceptingPatients === true}
                  onChange={() => updateFilter('acceptingPatients', true)}
                  className="w-4 h-4 cursor-pointer"
                />
                Yes, Accepting
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="radio"
                  checked={filters.acceptingPatients === false}
                  onChange={() => updateFilter('acceptingPatients', false)}
                  className="w-4 h-4 cursor-pointer"
                />
                Not Accepting
              </label>
            </div>
          </div>

          {/* Specialties Filter */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-700">Specialties</label>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
              {commonSpecialties.map((specialty) => (
                <label key={specialty} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={filters.specialties.includes(specialty)}
                    onChange={() => toggleSpecialty(specialty)}
                    className="w-4 h-4 cursor-pointer"
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
