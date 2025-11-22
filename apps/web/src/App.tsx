import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import ComparisonForm from './components/ComparisonForm'
import ComparisonResults from './components/ComparisonResults'
import ComparisonResultsSkeleton from './components/ComparisonResultsSkeleton'
import ProviderSearch from './pages/ProviderSearch'
import ProviderDetails from './pages/ProviderDetails'
import UserPreferences from './components/UserPreferences'
import LosAngelesDPC from './pages/LosAngelesDPC'
import SanFranciscoDPC from './pages/SanFranciscoDPC'
import SanDiegoDPC from './pages/SanDiegoDPC'
import NewYorkDPC from './pages/NewYorkDPC'
import ChicagoDPC from './pages/ChicagoDPC'
import ErrorBoundary from './components/ErrorBoundary'
import { initAnalytics, analytics } from './utils/analytics'

function App() {
  const location = useLocation()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Initialize analytics on app mount
  useEffect(() => {
    initAnalytics()
  }, [])

  // Track page views on route change
  useEffect(() => {
    analytics.trackPageView(location.pathname)
  }, [location.pathname])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

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
          <div style={styles.headerLeft}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 style={styles.title}>HealthPartnershipX</h1>
              <p style={styles.subtitle}>DPC Cost Comparison Calculator</p>
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.hamburger}
            aria-label="Toggle navigation menu"
          >
            <span style={styles.hamburgerLine}></span>
            <span style={styles.hamburgerLine}></span>
            <span style={styles.hamburgerLine}></span>
          </button>

          {/* Desktop Navigation */}
          <nav style={styles.navDesktop} className="nav-desktop">
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

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <>
          <div style={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />
          <nav style={styles.mobileNav}>
            <div style={styles.mobileNavHeader}>
              <h2 style={styles.mobileNavTitle}>Menu</h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={styles.mobileCloseButton}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>
            <Link
              to="/"
              style={{
                ...styles.mobileNavLink,
                ...(location.pathname === '/' ? styles.mobileNavLinkActive : {}),
              }}
            >
              Cost Calculator
            </Link>
            <Link
              to="/providers"
              style={{
                ...styles.mobileNavLink,
                ...(location.pathname === '/providers' ? styles.mobileNavLinkActive : {}),
              }}
            >
              Find Providers
            </Link>
            <Link
              to="/preferences"
              style={{
                ...styles.mobileNavLink,
                ...(location.pathname === '/preferences' ? styles.mobileNavLinkActive : {}),
              }}
            >
              My Preferences
            </Link>
          </nav>
        </>
      )}

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
                  {loading ? (
                    <ErrorBoundary errorBoundaryId="comparison-results-skeleton">
                      <ComparisonResultsSkeleton />
                    </ErrorBoundary>
                  ) : (
                    <ErrorBoundary errorBoundaryId="comparison-results">
                      <ComparisonResults
                        results={{
                          ...results.comparison,
                          dataSource: results.dataSource || results.comparison.dataSource,
                        }}
                        providers={results.providers}
                      />
                    </ErrorBoundary>
                  )}
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
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  headerLeft: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 'clamp(1.25rem, 4vw, 2rem)',
    fontWeight: 'bold',
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: 'clamp(0.875rem, 2.5vw, 1.125rem)',
    opacity: 0.9,
    margin: '0.25rem 0 0 0',
    lineHeight: 1.3,
  },
  hamburger: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    background: 'transparent',
    border: 'none',
    padding: '0.5rem',
    cursor: 'pointer',
    minWidth: '44px',
    minHeight: '44px',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 101,
  },
  hamburgerLine: {
    width: '24px',
    height: '3px',
    backgroundColor: '#fff',
    borderRadius: '2px',
    transition: 'transform 0.3s ease',
    display: 'block',
  },
  navDesktop: {
    display: 'none',
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
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
  },
  navLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    animation: 'fadeIn 0.3s ease',
  },
  mobileNav: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '80%',
    maxWidth: '320px',
    height: '100vh',
    backgroundColor: '#2563eb',
    zIndex: 999,
    overflowY: 'auto',
    padding: '1rem',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.2)',
    animation: 'slideInRight 0.3s ease',
  },
  mobileNavHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  mobileNavTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
    color: '#fff',
  },
  mobileCloseButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
  },
  mobileNavLink: {
    color: '#fff',
    textDecoration: 'none',
    padding: '1rem',
    borderRadius: '4px',
    fontSize: '1.125rem',
    fontWeight: '500',
    display: 'block',
    marginBottom: '0.5rem',
    minHeight: '44px',
    transition: 'background-color 0.2s',
  },
  mobileNavLinkActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  main: {
    padding: '1rem',
    minHeight: 'calc(100vh - 200px)',
  },
  error: {
    maxWidth: '800px',
    margin: '0 auto 1rem',
    padding: '1rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '4px',
    color: '#991b1b',
  },
  resetButton: {
    marginBottom: '1rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    minHeight: '44px',
    width: '100%',
  },
  footer: {
    backgroundColor: '#1f2937',
    color: '#9ca3af',
    textAlign: 'center',
    padding: '2rem 1rem',
    marginTop: '4rem',
    fontSize: '0.875rem',
  },
}

export default App
