import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analytics } from '../utils/analytics'

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

export default function SanFranciscoDPC() {
  const navigate = useNavigate()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analytics.trackPageView('/san-francisco-dpc')
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/providers/search?zipCode=94102&radius=30`
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
    navigate('/providers/search?zipCode=94102&state=CA')
  }

  const handleCalculateCosts = () => {
    navigate('/')
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Direct Primary Care in San Francisco</h1>
        <p style={styles.heroSubtitle}>
          High-quality healthcare at a fraction of Bay Area costs
        </p>
        <p style={styles.heroDescription}>
          Join San Francisco residents who've discovered 2+ DPC providers offering unlimited
          primary care access for $50-200/month—less than a single urgent care visit.
        </p>
        <div style={styles.heroButtons}>
          <button type="button" onClick={handleSearchProviders} style={styles.primaryButton}>
            Find SF Providers
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
            <div style={styles.statNumber}>2+</div>
            <div style={styles.statLabel}>DPC Providers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>$50-200</div>
            <div style={styles.statLabel}>Monthly Fee Range</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>$5,200+</div>
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
        <h2 style={styles.sectionTitle}>Why SF Residents Choose DPC</h2>
        <div style={styles.benefitsGrid}>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>💰</div>
            <h3 style={styles.benefitTitle}>Beat Bay Area Costs</h3>
            <p style={styles.benefitText}>
              Save $5,200+/year vs. traditional insurance. DPC + catastrophic coverage costs less
              than SF employer plans
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🏃</div>
            <h3 style={styles.benefitTitle}>No More Waiting</h3>
            <p style={styles.benefitText}>
              Skip the 4-6 week wait for Kaiser or Sutter appointments. See your doctor today or
              tomorrow
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>📱</div>
            <h3 style={styles.benefitTitle}>Tech-Forward Care</h3>
            <p style={styles.benefitText}>
              Text, email, or video call your doctor. Perfect for busy SF professionals and
              remote workers
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🌉</div>
            <h3 style={styles.benefitTitle}>Local SF Doctors</h3>
            <p style={styles.benefitText}>
              Providers who understand the unique health needs of San Francisco residents
            </p>
          </div>
        </div>
      </div>

      {/* Featured Providers */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>San Francisco DPC Providers</h2>
        {loading ? (
          <p style={styles.loadingText}>Loading providers...</p>
        ) : providers.length > 0 ? (
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
            View All SF Bay Area Providers →
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How DPC Works in San Francisco</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Choose Your SF Provider</h3>
            <p style={styles.stepText}>
              Browse DPC practices in San Francisco and the Bay Area. Compare fees and services
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Pay Monthly Membership</h3>
            <p style={styles.stepText}>
              Pay $50-200/month for unlimited primary care. No copays, no surprises
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Add Catastrophic Plan</h3>
            <p style={styles.stepText}>
              Optional: Add catastrophic insurance ($200-400/month) for hospital and specialist care
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>4</div>
            <h3 style={styles.stepTitle}>Get Better Care</h3>
            <p style={styles.stepText}>
              Text your doctor anytime, get same-day appointments, and save thousands
            </p>
          </div>
        </div>
      </div>

      {/* Comparison with SF Traditional Care */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>DPC vs. Traditional SF Healthcare</h2>
        <div style={styles.comparisonTable}>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Wait Time for Appointments</div>
            <div style={styles.comparisonDpc}>Same-day or next-day</div>
            <div style={styles.comparisonTraditional}>4-6 weeks average</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Appointment Length</div>
            <div style={styles.comparisonDpc}>30-60 minutes</div>
            <div style={styles.comparisonTraditional}>7-15 minutes</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>After-Hours Access</div>
            <div style={styles.comparisonDpc}>Text/call your doctor 24/7</div>
            <div style={styles.comparisonTraditional}>Advice nurse or ER</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Annual Cost (Individual)</div>
            <div style={styles.comparisonDpc}>$600-2,400 + catastrophic</div>
            <div style={styles.comparisonTraditional}>$7,000-12,000 (premiums + deductible)</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Join the DPC Movement in San Francisco</h2>
        <p style={styles.ctaText}>
          Discover why SF residents are choosing personalized, affordable healthcare
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
        <h2 style={styles.sectionTitle}>SF DPC Frequently Asked Questions</h2>
        <div style={styles.faqList}>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Is DPC cheaper than Kaiser or Sutter plans?</h3>
            <p style={styles.faqAnswer}>
              For many people, yes! DPC ($50-200/month) + catastrophic coverage ($200-400/month)
              often costs less than traditional Kaiser/Sutter premiums, especially if you're
              self-employed or your employer doesn't subsidize health insurance.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Can I use DPC with my employer insurance?</h3>
            <p style={styles.faqAnswer}>
              Yes! Some SF professionals use DPC for routine care and keep their employer plan for
              specialists and hospitals. This "stacking" approach gives you the best of both
              worlds.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Do SF DPC doctors speak multiple languages?</h3>
            <p style={styles.faqAnswer}>
              Many San Francisco DPC practices serve the city's diverse communities and offer
              multilingual care. Check individual provider profiles for language capabilities.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>What if I need a specialist or hospital?</h3>
            <p style={styles.faqAnswer}>
              Your DPC doctor will coordinate specialist referrals and help you navigate SF's
              healthcare system. Pair DPC with a catastrophic plan for full coverage of hospital
              and specialist care.
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
    backgroundColor: '#dc2626',
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
    color: '#dc2626',
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
    color: '#dc2626',
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
    color: '#dc2626',
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
    backgroundColor: '#dc2626',
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
    backgroundColor: '#dc2626',
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
    backgroundColor: '#dc2626',
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
    backgroundColor: '#dc2626',
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
