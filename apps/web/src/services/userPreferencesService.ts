// User Preferences Service
// Local storage management for user preferences and favorites

export interface UserPreferences {
  favoriteProviders: string[]
  recentSearches: SearchHistory[]
  defaultZipCode?: string
  defaultRadius?: number
  savedComparisons: SavedComparison[]
  theme?: 'light' | 'dark'
  mapView?: boolean
}

export interface SearchHistory {
  zipCode: string
  timestamp: Date
  resultsCount: number
}

export interface SavedComparison {
  id: string
  name: string
  formData: any
  results: any
  timestamp: Date
}

const STORAGE_KEYS = {
  PREFERENCES: 'dpc_user_preferences',
  FAVORITES: 'favoriteProviders',
  RECENT_SEARCHES: 'recentSearches',
  SAVED_COMPARISONS: 'savedComparisons',
} as const

class UserPreferencesService {
  // Get all preferences
  getPreferences(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (err) {
      console.error('Failed to load preferences:', err)
    }

    return {
      favoriteProviders: [],
      recentSearches: [],
      savedComparisons: [],
      mapView: true,
    }
  }

  // Save preferences
  savePreferences(preferences: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences))
    } catch (err) {
      console.error('Failed to save preferences:', err)
    }
  }

  // Favorite Providers
  getFavoriteProviders(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES)
      return stored ? JSON.parse(stored) : []
    } catch (err) {
      console.error('Failed to load favorites:', err)
      return []
    }
  }

  addFavorite(providerId: string): void {
    const favorites = this.getFavoriteProviders()
    if (!favorites.includes(providerId)) {
      favorites.push(providerId)
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites))
    }
  }

  removeFavorite(providerId: string): void {
    const favorites = this.getFavoriteProviders()
    const updated = favorites.filter(id => id !== providerId)
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated))
  }

  isFavorite(providerId: string): boolean {
    return this.getFavoriteProviders().includes(providerId)
  }

  toggleFavorite(providerId: string): boolean {
    const isFav = this.isFavorite(providerId)
    if (isFav) {
      this.removeFavorite(providerId)
      return false
    } else {
      this.addFavorite(providerId)
      return true
    }
  }

  // Recent Searches
  getRecentSearches(): SearchHistory[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES)
      if (stored) {
        const searches = JSON.parse(stored)
        return searches.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp),
        }))
      }
    } catch (err) {
      console.error('Failed to load recent searches:', err)
    }
    return []
  }

  addRecentSearch(zipCode: string, resultsCount: number): void {
    const searches = this.getRecentSearches()

    // Remove duplicate searches for same zip code
    const filtered = searches.filter(s => s.zipCode !== zipCode)

    // Add new search at the beginning
    filtered.unshift({
      zipCode,
      resultsCount,
      timestamp: new Date(),
    })

    // Keep only last 10 searches
    const limited = filtered.slice(0, 10)

    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(limited))
  }

  clearRecentSearches(): void {
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES)
  }

  // Saved Comparisons
  getSavedComparisons(): SavedComparison[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SAVED_COMPARISONS)
      if (stored) {
        const comparisons = JSON.parse(stored)
        return comparisons.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp),
        }))
      }
    } catch (err) {
      console.error('Failed to load saved comparisons:', err)
    }
    return []
  }

  saveComparison(name: string, formData: any, results: any): string {
    const comparisons = this.getSavedComparisons()
    const id = `comparison_${Date.now()}`

    comparisons.unshift({
      id,
      name,
      formData,
      results,
      timestamp: new Date(),
    })

    // Keep only last 20 comparisons
    const limited = comparisons.slice(0, 20)

    localStorage.setItem(STORAGE_KEYS.SAVED_COMPARISONS, JSON.stringify(limited))
    return id
  }

  deleteComparison(id: string): void {
    const comparisons = this.getSavedComparisons()
    const filtered = comparisons.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEYS.SAVED_COMPARISONS, JSON.stringify(filtered))
  }

  getComparison(id: string): SavedComparison | null {
    const comparisons = this.getSavedComparisons()
    return comparisons.find(c => c.id === id) || null
  }

  // Default Settings
  getDefaultZipCode(): string | undefined {
    const prefs = this.getPreferences()
    return prefs.defaultZipCode
  }

  setDefaultZipCode(zipCode: string): void {
    const prefs = this.getPreferences()
    prefs.defaultZipCode = zipCode
    this.savePreferences(prefs)
  }

  getDefaultRadius(): number {
    const prefs = this.getPreferences()
    return prefs.defaultRadius || 25
  }

  setDefaultRadius(radius: number): void {
    const prefs = this.getPreferences()
    prefs.defaultRadius = radius
    this.savePreferences(prefs)
  }

  // Theme
  getTheme(): 'light' | 'dark' {
    const prefs = this.getPreferences()
    return prefs.theme || 'light'
  }

  setTheme(theme: 'light' | 'dark'): void {
    const prefs = this.getPreferences()
    prefs.theme = theme
    this.savePreferences(prefs)
  }

  // Map View Preference
  getMapViewPreference(): boolean {
    const prefs = this.getPreferences()
    return prefs.mapView !== undefined ? prefs.mapView : true
  }

  setMapViewPreference(showMap: boolean): void {
    const prefs = this.getPreferences()
    prefs.mapView = showMap
    this.savePreferences(prefs)
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Export data
  exportData(): string {
    const prefs = this.getPreferences()
    return JSON.stringify(prefs, null, 2)
  }

  // Import data
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      this.savePreferences(data)
      return true
    } catch (err) {
      console.error('Failed to import data:', err)
      return false
    }
  }
}

export const userPreferencesService = new UserPreferencesService()
