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

export default function SanDiegoDPC() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analytics.trackPageView('/san-diego-dpc')
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/providers/search?zipCode=92101&radius=50`
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
    navigate('/providers/search?zipCode=92101&state=CA')
  }

  const handleCalculateCosts = () => {
    navigate('/')
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Direct Primary Care in San Diego</h1>
        <p style={styles.heroSubtitle}>
          Beach lifestyle meets affordable healthcare
        </p>
        <p style={styles.heroDescription}>
          Discover 3+ DPC providers in San Diego offering unlimited primary care access for
          $99-150/month. Lower costs than LA or SF with the same quality care.
        </p>
        <div style={styles.heroButtons}>
          <button type="button" onClick={handleSearchProviders} style={styles.primaryButton}>
            Find San Diego Providers
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
            <div style={styles.statNumber}>3+</div>
            <div style={styles.statLabel}>DPC Providers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>$99-150</div>
            <div style={styles.statLabel}>Avg Monthly Fee</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>$4,500+</div>
            <div style={styles.statLabel}>Annual Savings</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>24/7</div>
            <div style={styles.statLabel}>Provider Access</div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Why San Diego Residents Choose DPC</h2>
        <div style={styles.benefitsGrid}>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>💰</div>
            <h3 style={styles.benefitTitle}>Lower Than LA/SF Costs</h3>
            <p style={styles.benefitText}>
              Save $4,500+/year compared to traditional insurance. San Diego DPC fees are more
              affordable than other California metros
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🏖️</div>
            <h3 style={styles.benefitTitle}>Perfect for Active Lifestyles</h3>
            <p style={styles.benefitText}>
              Same-day appointments mean you can surf, hike, or bike in the morning and see your
              doctor in the afternoon
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>📱</div>
            <h3 style={styles.benefitTitle}>Beach to Doctor Access</h3>
            <p style={styles.benefitText}>
              Text your doctor from the beach, trail, or office. Direct access without
              gatekeepers or phone trees
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🌱</div>
            <h3 style={styles.benefitTitle}>Growing DPC Community</h3>
            <p style={styles.benefitText}>
              Join San Diego's expanding DPC network with providers focused on preventive and
              holistic care
            </p>
          </div>
        </div>
      </div>

      {/* Featured Providers */}
      {loading ? (
        <FeaturedProvidersSkeleton count={5} />
      ) : (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Featured San Diego Providers</h2>
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
              View All San Diego Providers →
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How DPC Works in San Diego</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Choose Your Provider</h3>
            <p style={styles.stepText}>
              Browse 3+ DPC practices in San Diego. Compare monthly fees, services, and
              locations across the county
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Pay Monthly Membership</h3>
            <p style={styles.stepText}>
              Pay $99-150/month for unlimited primary care. No copays, no deductibles, no
              surprises
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Get Catastrophic Coverage</h3>
            <p style={styles.stepText}>
              Add a low-cost catastrophic plan ($200-300/month) for hospital and specialist care
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>4</div>
            <h3 style={styles.stepTitle}>Enjoy Better Healthcare</h3>
            <p style={styles.stepText}>
              See your doctor same-day, text them anytime, and save thousands while enjoying San
              Diego life
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Save on Healthcare?</h2>
        <p style={styles.ctaText}>
          Join San Diego residents who've discovered affordable, personalized primary care
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
        <h2 style={styles.sectionTitle}>San Diego DPC FAQs</h2>
        <div style={styles.faqList}>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Is DPC legal in California?</h3>
            <p style={styles.faqAnswer}>
              Yes! DPC is fully legal in California and is growing rapidly in San Diego.
              California law explicitly allows DPC practices under the Knox-Keene Act exemption.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Will my insurance cover DPC?</h3>
            <p style={styles.faqAnswer}>
              DPC is not insurance—it's a membership for unlimited primary care. You can use DPC
              alongside a catastrophic or high-deductible plan for hospital coverage.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>How much do San Diego residents save with DPC?</h3>
            <p style={styles.faqAnswer}>
              Average San Diego families save $4,500+ annually compared to traditional insurance
              with high deductibles and copays. Singles save $2,000-3,500/year.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>What's included in my monthly fee?</h3>
            <p style={styles.faqAnswer}>
              Unlimited office visits, same-day appointments, text/email access to your doctor,
              basic labs, minor procedures, and care coordination. Some practices include
              medications at wholesale prices.
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
    backgroundColor: '#0891b2',
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
    color: '#0891b2',
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
    color: '#0891b2',
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
    color: '#0891b2',
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
    backgroundColor: '#0891b2',
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
    backgroundColor: '#0891b2',
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
    backgroundColor: '#0891b2',
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
    backgroundColor: '#0891b2',
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
