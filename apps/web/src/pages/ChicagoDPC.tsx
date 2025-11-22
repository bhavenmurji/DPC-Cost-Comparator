import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analytics } from '../utils/analytics'
import FeaturedProvidersSkeleton from '../components/FeaturedProvidersSkeleton'

interface Provider {
  id: string
  name: string
  city: string
  state: string
  monthlyFee: number
  acceptingPatients: boolean
  phone?: string
  website?: string
}

export default function ChicagoDPC() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analytics.trackPageView('/chicago-dpc')
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/providers/search?zipCode=60601&radius=50`
      )
      if (response.ok) {
        const data = await response.json()
        setProviders(data.slice(0, 5))
      }
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchProviders = () => {
    navigate('/providers/search?zipCode=60601&state=IL')
  }

  const handleCalculateCosts = () => {
    navigate('/')
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Direct Primary Care in Chicago</h1>
        <p style={styles.heroSubtitle}>
          Midwest affordability meets world-class healthcare
        </p>
        <p style={styles.heroDescription}>
          Discover 13+ DPC providers across Chicagoland offering unlimited primary care access
          for an average of $159/month. Neighborhood-based care with family-friendly practices.
        </p>
        <div style={styles.heroButtons}>
          <button type="button" onClick={handleSearchProviders} style={styles.primaryButton}>
            Find Chicago Providers
          </button>
          <button type="button" onClick={handleCalculateCosts} style={styles.secondaryButton}>
            Calculate My Costs
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>13+</div>
            <div style={styles.statLabel}>DPC Providers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>$159</div>
            <div style={styles.statLabel}>Avg Monthly Fee</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>$4,200+</div>
            <div style={styles.statLabel}>Annual Savings</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>Same Day</div>
            <div style={styles.statLabel}>Appointments</div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Why Chicagoans Choose DPC</h2>
        <div style={styles.benefitsGrid}>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>💵</div>
            <h3 style={styles.benefitTitle}>Midwest Affordability</h3>
            <p style={styles.benefitText}>
              Save $4,200+/year compared to traditional Chicago insurance plans. Get more care for
              less money with transparent pricing
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🏘️</div>
            <h3 style={styles.benefitTitle}>Neighborhood-Based Care</h3>
            <p style={styles.benefitText}>
              Providers in Lincoln Park, Loop, Wicker Park, and surrounding suburbs. Care that's
              close to home
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>👨‍👩‍👧‍👦</div>
            <h3 style={styles.benefitTitle}>Family-Friendly Practices</h3>
            <p style={styles.benefitText}>
              Many Chicago DPC providers see entire families—from kids to grandparents. One
              doctor for everyone
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>❄️</div>
            <h3 style={styles.benefitTitle}>Year-Round Access</h3>
            <p style={styles.benefitText}>
              Text or call your doctor during harsh winters. No need to brave the cold for minor
              issues
            </p>
          </div>
        </div>
      </div>

      {/* Featured Providers */}
      {loading ? (
        <FeaturedProvidersSkeleton count={5} />
      ) : (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Featured Chicago Providers</h2>
          {providers.length > 0 ? (
          <div style={styles.providersGrid}>
            {providers.map((provider) => (
              <div key={provider.id} style={styles.providerCard}>
                <h3 style={styles.providerName}>{provider.name}</h3>
                <p style={styles.providerLocation}>
                  {provider.city}, {provider.state}
                </p>
                <p style={styles.providerFee}>
                  <strong>${provider.monthlyFee}/month</strong>
                </p>
                <p style={styles.providerStatus}>
                  {provider.acceptingPatients ? (
                    <span style={styles.accepting}>✓ Accepting Patients</span>
                  ) : (
                    <span style={styles.notAccepting}>Waitlist</span>
                  )}
                </p>
                {provider.phone && (
                  <p style={styles.providerContact}>📞 {provider.phone}</p>
                )}
                <button
                  type="button"
                  onClick={() => navigate(`/providers/${provider.id}`)}
                  style={styles.viewButton}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
          ) : (
            <p style={styles.noProvidersText}>
              Loading provider information... Please try again.
            </p>
          )}
          <div style={styles.centerButton}>
            <button type="button" onClick={handleSearchProviders} style={styles.viewAllButton}>
              View All Chicago Providers →
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How DPC Works in Chicago</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Choose Your Provider</h3>
            <p style={styles.stepText}>
              Browse 13+ DPC practices across Chicago and suburbs. Compare fees, neighborhoods,
              and family services
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Pay Monthly Membership</h3>
            <p style={styles.stepText}>
              Pay around $159/month for unlimited primary care. No copays, no deductibles, no
              hidden fees
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Add Catastrophic Coverage</h3>
            <p style={styles.stepText}>
              Pair with catastrophic insurance ($200-350/month) for hospital and specialist care
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>4</div>
            <h3 style={styles.stepTitle}>Enjoy Better Healthcare</h3>
            <p style={styles.stepText}>
              Get same-day visits, text your doctor, and spend more time with your family instead
              of in waiting rooms
            </p>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>DPC vs. Traditional Chicago Healthcare</h2>
        <div style={styles.comparisonTable}>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Wait Time for Appointments</div>
            <div style={styles.comparisonDpc}>Same-day or next-day</div>
            <div style={styles.comparisonTraditional}>3-6 weeks average</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Appointment Length</div>
            <div style={styles.comparisonDpc}>30-60 minutes</div>
            <div style={styles.comparisonTraditional}>10-15 minutes</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>After-Hours Access</div>
            <div style={styles.comparisonDpc}>Text/call your doctor 24/7</div>
            <div style={styles.comparisonTraditional}>Nurse hotline or ER</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Annual Cost (Family of 4)</div>
            <div style={styles.comparisonDpc}>$7,632 + catastrophic</div>
            <div style={styles.comparisonTraditional}>$12,000-18,000 (premiums + deductible)</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Transform Your Healthcare?</h2>
        <p style={styles.ctaText}>
          Join Chicago families who've discovered affordable, accessible primary care
        </p>
        <div style={styles.ctaButtons}>
          <button type="button" onClick={handleCalculateCosts} style={styles.ctaPrimaryButton}>
            Calculate My Savings
          </button>
          <button type="button" onClick={handleSearchProviders} style={styles.ctaSecondaryButton}>
            Find My Provider
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Chicago DPC Frequently Asked Questions</h2>
        <div style={styles.faqList}>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Is DPC legal in Illinois?</h3>
            <p style={styles.faqAnswer}>
              Yes! DPC is fully legal in Illinois. The state has clear regulations that recognize
              DPC as a valid healthcare delivery model, making it a safe and legitimate option
              for Chicagoans.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>
              Can my whole family use the same DPC provider?
            </h3>
            <p style={styles.faqAnswer}>
              Many Chicago DPC practices offer family memberships at discounted rates. One doctor
              can see your kids, spouse, and yourself—building a relationship with your entire
              family over time.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Do Chicago DPC providers offer virtual visits?</h3>
            <p style={styles.faqAnswer}>
              Yes! Most Chicago DPC practices offer telemedicine for minor issues, follow-ups,
              and urgent questions. This is especially helpful during harsh Chicago winters when
              you don't want to leave home.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>
              What if I need a specialist or hospital care?
            </h3>
            <p style={styles.faqAnswer}>
              Your DPC doctor will coordinate specialist referrals and help you navigate
              Chicago's healthcare system. Many DPC providers have relationships with top Chicago
              hospitals and specialists. Pair DPC with catastrophic insurance for full coverage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    backgroundColor: '#f9fafb',
  },
  hero: {
    backgroundColor: '#ea580c',
    color: '#fff',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    margin: '0 0 1rem 0',
  },
  heroSubtitle: {
    fontSize: '1.5rem',
    fontWeight: '500',
    margin: '0 0 1rem 0',
    opacity: 0.9,
  },
  heroDescription: {
    fontSize: '1.125rem',
    maxWidth: '800px',
    margin: '0 auto 2rem auto',
    lineHeight: '1.6',
    opacity: 0.9,
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    backgroundColor: '#fff',
    color: '#ea580c',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: '2px solid #fff',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  statsSection: {
    padding: '3rem 2rem',
    backgroundColor: '#fff',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  statCard: {
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#ea580c',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    textAlign: 'center' as const,
    marginBottom: '3rem',
    color: '#1f2937',
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  benefitCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
  },
  benefitIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  benefitTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#1f2937',
  },
  benefitText: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: '1.6',
  },
  providersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  providerCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
  },
  providerName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#1f2937',
  },
  providerLocation: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
  },
  providerFee: {
    fontSize: '1.125rem',
    color: '#ea580c',
    marginBottom: '0.5rem',
  },
  providerStatus: {
    fontSize: '0.875rem',
    marginBottom: '0.75rem',
  },
  accepting: {
    color: '#10b981',
    fontWeight: '500',
  },
  notAccepting: {
    color: '#ef4444',
    fontWeight: '500',
  },
  providerContact: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1rem',
  },
  viewButton: {
    width: '100%',
    backgroundColor: '#ea580c',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loadingText: {
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '1.125rem',
  },
  noProvidersText: {
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '1.125rem',
  },
  centerButton: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '2rem',
  },
  viewAllButton: {
    backgroundColor: '#ea580c',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  stepsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  stepCard: {
    textAlign: 'center' as const,
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    backgroundColor: '#ea580c',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: '0 auto 1rem auto',
  },
  stepTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#1f2937',
  },
  stepText: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: '1.6',
  },
  comparisonTable: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
  },
  comparisonRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  comparisonLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  comparisonDpc: {
    color: '#10b981',
    fontWeight: '500',
  },
  comparisonTraditional: {
    color: '#6b7280',
  },
  ctaSection: {
    backgroundColor: '#1f2937',
    color: '#fff',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  ctaText: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    opacity: 0.9,
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  ctaPrimaryButton: {
    backgroundColor: '#ea580c',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  ctaSecondaryButton: {
    backgroundColor: 'transparent',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: '2px solid #fff',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  faqList: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  faqItem: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
  },
  faqQuestion: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#1f2937',
  },
  faqAnswer: {
    fontSize: '1rem',
    color: '#6b7280',
    lineHeight: '1.6',
  },
}
