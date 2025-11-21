import { useState, useEffect } from 'react'
import { userPreferencesService, SearchHistory, SavedComparison } from '../services/userPreferencesService'
import { useNavigate } from 'react-router-dom'

export default function UserPreferences() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'favorites' | 'searches' | 'comparisons' | 'settings'>('favorites')
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([])
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([])
  const [defaultZipCode, setDefaultZipCode] = useState('')
  const [defaultRadius, setDefaultRadius] = useState(25)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = () => {
    setRecentSearches(userPreferencesService.getRecentSearches())
    setSavedComparisons(userPreferencesService.getSavedComparisons())
    setDefaultZipCode(userPreferencesService.getDefaultZipCode() || '')
    setDefaultRadius(userPreferencesService.getDefaultRadius())
    setTheme(userPreferencesService.getTheme())
  }

  const handleSaveSettings = () => {
    if (defaultZipCode) {
      userPreferencesService.setDefaultZipCode(defaultZipCode)
    }
    userPreferencesService.setDefaultRadius(defaultRadius)
    userPreferencesService.setTheme(theme)
    alert('Settings saved successfully!')
  }

  const handleClearSearches = () => {
    if (confirm('Are you sure you want to clear all recent searches?')) {
      userPreferencesService.clearRecentSearches()
      setRecentSearches([])
    }
  }

  const handleDeleteComparison = (id: string) => {
    if (confirm('Delete this saved comparison?')) {
      userPreferencesService.deleteComparison(id)
      setSavedComparisons(userPreferencesService.getSavedComparisons())
    }
  }

  const handleLoadComparison = (comparison: SavedComparison) => {
    // Navigate to home with comparison data (would need to implement state passing)
    navigate('/', { state: { loadedComparison: comparison } })
  }

  const handleExportData = () => {
    const data = userPreferencesService.exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dpc-preferences-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearAllData = () => {
    if (confirm('This will delete all your saved preferences, favorites, and comparisons. Are you sure?')) {
      userPreferencesService.clearAllData()
      loadPreferences()
      alert('All data cleared successfully')
    }
  }

  const favoriteCount = userPreferencesService.getFavoriteProviders().length

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Preferences</h1>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('favorites')}
          style={{
            ...styles.tab,
            ...(activeTab === 'favorites' ? styles.tabActive : {}),
          }}
        >
          ❤️ Favorites ({favoriteCount})
        </button>
        <button
          onClick={() => setActiveTab('searches')}
          style={{
            ...styles.tab,
            ...(activeTab === 'searches' ? styles.tabActive : {}),
          }}
        >
          🔍 Recent Searches ({recentSearches.length})
        </button>
        <button
          onClick={() => setActiveTab('comparisons')}
          style={{
            ...styles.tab,
            ...(activeTab === 'comparisons' ? styles.tabActive : {}),
          }}
        >
          📊 Saved Comparisons ({savedComparisons.length})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            ...styles.tab,
            ...(activeTab === 'settings' ? styles.tabActive : {}),
          }}
        >
          ⚙️ Settings
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'favorites' && (
          <div>
            <h2 style={styles.sectionTitle}>Favorite Providers</h2>
            {favoriteCount === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No favorite providers yet</p>
                <p style={styles.emptyHint}>
                  Save providers to your favorites from the provider details page
                </p>
              </div>
            ) : (
              <div style={styles.infoCard}>
                <p>You have {favoriteCount} favorite provider{favoriteCount !== 1 ? 's' : ''}</p>
                <p style={styles.hint}>
                  Visit the <a href="/providers" style={styles.link}>provider search</a> to view your favorites
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'searches' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Recent Searches</h2>
              {recentSearches.length > 0 && (
                <button onClick={handleClearSearches} style={styles.clearButton}>
                  Clear All
                </button>
              )}
            </div>

            {recentSearches.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No recent searches</p>
              </div>
            ) : (
              <div style={styles.list}>
                {recentSearches.map((search, index) => (
                  <div key={index} style={styles.listItem}>
                    <div>
                      <div style={styles.searchZip}>ZIP: {search.zipCode}</div>
                      <div style={styles.searchMeta}>
                        {search.resultsCount} results • {new Date(search.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/providers?zip=${search.zipCode}`)}
                      style={styles.actionButton}
                    >
                      Search Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparisons' && (
          <div>
            <h2 style={styles.sectionTitle}>Saved Comparisons</h2>

            {savedComparisons.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No saved comparisons</p>
                <p style={styles.emptyHint}>
                  Save cost comparisons from the calculator for future reference
                </p>
              </div>
            ) : (
              <div style={styles.list}>
                {savedComparisons.map((comparison) => (
                  <div key={comparison.id} style={styles.listItem}>
                    <div style={styles.comparisonInfo}>
                      <div style={styles.comparisonName}>{comparison.name}</div>
                      <div style={styles.comparisonMeta}>
                        Saved on {new Date(comparison.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={styles.comparisonActions}>
                      <button
                        onClick={() => handleLoadComparison(comparison)}
                        style={styles.actionButton}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteComparison(comparison.id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 style={styles.sectionTitle}>Settings</h2>

            <div style={styles.settingsGroup}>
              <label style={styles.label}>Default ZIP Code</label>
              <input
                type="text"
                pattern="[0-9]{5}"
                maxLength={5}
                value={defaultZipCode}
                onChange={(e) => setDefaultZipCode(e.target.value)}
                placeholder="Enter default ZIP"
                style={styles.input}
              />
              <p style={styles.hint}>Will be pre-filled in search forms</p>
            </div>

            <div style={styles.settingsGroup}>
              <label style={styles.label}>Default Search Radius: {defaultRadius} miles</label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={defaultRadius}
                onChange={(e) => setDefaultRadius(parseInt(e.target.value))}
                style={styles.slider}
              />
              <div style={styles.sliderLabels}>
                <span>5 mi</span>
                <span>50 mi</span>
                <span>100 mi</span>
              </div>
            </div>

            <div style={styles.settingsGroup}>
              <label style={styles.label}>Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                style={styles.select}
              >
                <option value="light">Light</option>
                <option value="dark">Dark (Coming Soon)</option>
              </select>
            </div>

            <button onClick={handleSaveSettings} style={styles.saveButton}>
              Save Settings
            </button>

            <div style={styles.dataManagement}>
              <h3 style={styles.dataTitle}>Data Management</h3>

              <button onClick={handleExportData} style={styles.exportButton}>
                Export My Data
              </button>

              <button onClick={handleClearAllData} style={styles.dangerButton}>
                Clear All Data
              </button>

              <p style={styles.dangerHint}>
                Warning: This will permanently delete all your preferences, favorites, and saved comparisons
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    color: '#1a1a1a',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #e5e7eb',
    overflowX: 'auto',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    color: '#6b7280',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
    fontWeight: '600',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1a1a1a',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1rem',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  emptyHint: {
    fontSize: '0.875rem',
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '1rem',
    color: '#1e40af',
  },
  hint: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.5rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
  },
  searchZip: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.25rem',
  },
  searchMeta: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  comparisonInfo: {
    flex: 1,
  },
  comparisonName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '0.25rem',
  },
  comparisonMeta: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  comparisonActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  clearButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#dc2626',
    fontWeight: '500',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#fff',
    fontWeight: '500',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    border: '1px solid #dc2626',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#dc2626',
    fontWeight: '500',
  },
  settingsGroup: {
    marginBottom: '2rem',
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
  select: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  saveButton: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    backgroundColor: '#2563eb',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#fff',
  },
  dataManagement: {
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '2px solid #e5e7eb',
  },
  dataTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
  exportButton: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#fff',
    marginBottom: '1rem',
  },
  dangerButton: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    backgroundColor: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#fff',
  },
  dangerHint: {
    fontSize: '0.75rem',
    color: '#dc2626',
    marginTop: '0.5rem',
    fontStyle: 'italic',
  },
}
