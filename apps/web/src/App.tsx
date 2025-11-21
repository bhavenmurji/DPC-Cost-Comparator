import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import ComparisonForm from './components/ComparisonForm'
import ComparisonResults from './components/ComparisonResults'
import ProviderSearch from './pages/ProviderSearch'
import ProviderDetails from './pages/ProviderDetails'
import UserPreferences from './components/UserPreferences'
import LosAngelesDPC from './pages/LosAngelesDPC'
import SanFranciscoDPC from './pages/SanFranciscoDPC'
import SanDiegoDPC from './pages/SanDiegoDPC'
import NewYorkDPC from './pages/NewYorkDPC'
import ChicagoDPC from './pages/ChicagoDPC'
import { initAnalytics, analytics } from './utils/analytics'

function App() {
  const location = useLocation()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize analytics on app mount
  useEffect(() => {
    initAnalytics()
  }, [])

  // Track page views on route change
  useEffect(() => {
    analytics.trackPageView(location.pathname)
  }, [location.pathname])

  const handleSubmit = async (formData: any) => {
    setLoading(true)
    setError(null)

    try {
      const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000'
      const response = await fetch(`${API_URL}/api/comparison/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate comparison')
      }

      const data = await response.json()
      setResults(data)

      // Track successful comparison calculation
      if (data.comparison) {
        analytics.trackComparisonCalculated({
          zipCode: formData.zipCode,
          state: formData.state,
          age: formData.age,
          traditionalCost: data.comparison.traditionalTotalAnnual,
          dpcCost: data.comparison.dpcTotalAnnual,
          savings: data.comparison.annualSavings,
          recommendedPlan: data.comparison.recommendedPlan,
          dataSource: data.comparison.dataSource?.traditional || 'unknown',
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui' }}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>HealthPartnershipX</h1>
            <p style={styles.subtitle}>DPC Cost Comparison Calculator</p>
          </div>
          <nav style={styles.nav}>
            <Link
              to="/"
              style={{
                ...styles.navLink,
                ...(location.pathname === '/' ? styles.navLinkActive : {}),
              }}
            >
              Cost Calculator
            </Link>
            <Link
              to="/providers"
              style={{
                ...styles.navLink,
                ...(location.pathname === '/providers' ? styles.navLinkActive : {}),
              }}
            >
              Find Providers
            </Link>
            <Link
              to="/preferences"
              style={{
                ...styles.navLink,
                ...(location.pathname === '/preferences' ? styles.navLinkActive : {}),
              }}
            >
              My Preferences
            </Link>
          </nav>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <main style={styles.main}>
              {error && (
                <div style={styles.error}>
                  <strong>Error:</strong> {error}
                </div>
              )}

              {!results ? (
                <ComparisonForm onSubmit={handleSubmit} loading={loading} />
              ) : (
                <>
                  <button onClick={handleReset} style={styles.resetButton}>
                    ← Start New Comparison
                  </button>
                  <ComparisonResults
                    results={{
                      ...results.comparison,
                      dataSource: results.dataSource || results.comparison.dataSource,
                    }}
                    providers={results.providers}
                  />
                </>
              )}
            </main>
          }
        />
        <Route path="/providers" element={<ProviderSearch />} />
        <Route path="/providers/:id" element={<ProviderDetails />} />
        <Route path="/preferences" element={<UserPreferences />} />

        {/* City Landing Pages */}
        <Route path="/los-angeles-dpc" element={<LosAngelesDPC />} />
        <Route path="/san-francisco-dpc" element={<SanFranciscoDPC />} />
        <Route path="/san-diego-dpc" element={<SanDiegoDPC />} />
        <Route path="/new-york-dpc" element={<NewYorkDPC />} />
        <Route path="/chicago-dpc" element={<ChicagoDPC />} />
      </Routes>

      <footer style={styles.footer}>
        <p>© 2025 HealthPartnershipX | For informational purposes only</p>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '2rem 1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: 0,
  },
  subtitle: {
    fontSize: '1.125rem',
    opacity: 0.9,
    margin: '0.5rem 0 0 0',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  main: {
    padding: '2rem 1rem',
    minHeight: 'calc(100vh - 200px)',
  },
  error: {
    maxWidth: '800px',
    margin: '0 auto 2rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    color: '#991b1b',
  },
  resetButton: {
    marginBottom: '2rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '2rem 1rem',
    marginTop: '4rem',
  },
}

export default App
