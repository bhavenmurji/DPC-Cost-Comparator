import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analytics } from '../utils/analytics'
import FeaturedProvidersSkeleton from '../components/FeaturedProvidersSkeleton'
import { useCityProviders } from '../hooks/useCityProviders'

export default function LosAngelesDPC() {
  const navigate = useNavigate()
  // Use shared hook for data fetching - 90210 (Beverly Hills) as center of LA area
  const { providers, stats, loading } = useCityProviders('90210', 50)

  useEffect(() => {
    analytics.trackPageView('/los-angeles-dpc')
  }, [])

  const handleSearchProviders = () => {
    navigate('/providers/search?zipCode=90210&state=CA')
  }

  const handleCalculateCosts = () => {
    navigate('/')
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Direct Primary Care in Los Angeles</h1>
        <p style={styles.heroSubtitle}>
          Affordable, unlimited primary care for Angelenos
        </p>
        <p style={styles.heroDescription}>
          Discover {stats.providerCount > 0 ? `${stats.providerCount}+` : 'local'} DPC providers in the Los Angeles area offering unlimited access to your
          doctor for {stats.avgMonthlyFee > 0 ? `$${stats.avgMonthlyFee}` : '$100-175'}/month—no copays, no surprise bills.
        </p>
        <div style={styles.heroButtons}>
          <button type="button" onClick={handleSearchProviders} style={styles.primaryButton}>
            Find LA Providers
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
            <div style={styles.statNumber}>{stats.providerCount > 0 ? `${stats.providerCount}+` : '...'}</div>
            <div style={styles.statLabel}>DPC Providers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.avgMonthlyFee > 0 ? `$${stats.avgMonthlyFee}` : '...'}</div>
            <div style={styles.statLabel}>Avg Monthly Fee</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.estimatedSavings > 0 ? `$${stats.estimatedSavings.toLocaleString()}+` : '...'}</div>
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
        <h2 style={styles.sectionTitle}>Why Angelenos Choose DPC</h2>
        <div style={styles.benefitsGrid}>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>💰</div>
            <h3 style={styles.benefitTitle}>Save Thousands</h3>
            <p style={styles.benefitText}>
              Average LA family saves {stats.estimatedSavings > 0 ? `$${stats.estimatedSavings.toLocaleString()}+` : '$4,000+'}/year compared to traditional insurance with high
              deductibles
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>⏰</div>
            <h3 style={styles.benefitTitle}>Same-Day Appointments</h3>
            <p style={styles.benefitText}>
              No more waiting weeks to see your doctor. Most LA DPC practices offer same-day or
              next-day visits
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>📱</div>
            <h3 style={styles.benefitTitle}>Text Your Doctor</h3>
            <p style={styles.benefitText}>
              Direct access via phone, text, or email. No gatekeepers, no phone trees
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🏥</div>
            <h3 style={styles.benefitTitle}>Longer Visits</h3>
            <p style={styles.benefitText}>
              30-60 minute appointments mean your doctor actually has time to listen and care
            </p>
          </div>
        </div>
      </div>

      {/* Featured Providers */}
      {loading ? (
        <FeaturedProvidersSkeleton count={5} />
      ) : (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Featured LA Providers</h2>
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
              View All Los Angeles Providers →
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How DPC Works in Los Angeles</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Choose Your Provider</h3>
            <p style={styles.stepText}>
              Browse {stats.providerCount > 0 ? `${stats.providerCount}+` : ''} DPC practices in LA. Compare monthly fees, services, and patient reviews
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Pay Monthly Membership</h3>
            <p style={styles.stepText}>
              Pay {stats.avgMonthlyFee > 0 ? `$${stats.avgMonthlyFee}` : '$100-175'}/month for unlimited primary care. No copays, no deductibles
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
              See your doctor same-day, text them anytime, and save thousands annually
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Save on Healthcare?</h2>
        <p style={styles.ctaText}>
          Join thousands of LA residents who've discovered affordable, personalized primary care
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
        <h2 style={styles.sectionTitle}>Los Angeles DPC FAQs</h2>
        <div style={styles.faqList}>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Is DPC legal in California?</h3>
            <p style={styles.faqAnswer}>
              Yes! DPC is fully legal in California and is growing rapidly. California law
              explicitly allows DPC practices under the Knox-Keene Act exemption.
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
            <h3 style={styles.faqQuestion}>How much do LA residents save with DPC?</h3>
            <p style={styles.faqAnswer}>
              Average LA families save {stats.estimatedSavings > 0 ? `$${stats.estimatedSavings.toLocaleString()}+` : '$4,000+'} annually compared to traditional insurance with
              high deductibles and copays. Singles save $2,000-3,000/year.
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
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: 'clamp(2rem, 5vw, 4rem) 1rem',
    textAlign: 'center' as const,
  },
  heroTitle: {
    fontSize: 'clamp(1.75rem, 6vw, 3rem)',
    fontWeight: '700',
    margin: '0 0 1rem 0',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: 'clamp(1.125rem, 4vw, 1.5rem)',
    fontWeight: '500',
    margin: '0 0 1rem 0',
    opacity: 0.9,
    lineHeight: 1.3,
  },
  heroDescription: {
    fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
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
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    maxWidth: '400px',
    margin: '0 auto',
  },
  primaryButton: {
    backgroundColor: '#fff',
    color: '#2563eb',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    minHeight: '48px',
    width: '100%',
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
    minHeight: '48px',
    width: '100%',
  },
  statsSection: {
    padding: 'clamp(2rem, 5vw, 3rem) 1rem',
    backgroundColor: '#fff',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 'clamp(1rem, 3vw, 2rem)',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  statCard: {
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
    color: '#6b7280',
    fontWeight: '500',
  },
  section: {
    padding: 'clamp(2rem, 6vw, 4rem) 1rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: '700',
    textAlign: 'center' as const,
    marginBottom: 'clamp(2rem, 4vw, 3rem)',
    color: '#1f2937',
    lineHeight: 1.2,
  },
  benefitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
    gap: 'clamp(1rem, 3vw, 2rem)',
  },
  benefitCard: {
    backgroundColor: '#fff',
    padding: 'clamp(1.5rem, 4vw, 2rem)',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
    gap: 'clamp(1rem, 3vw, 1.5rem)',
    marginBottom: '2rem',
  },
  providerCard: {
    backgroundColor: '#fff',
    padding: 'clamp(1rem, 3vw, 1.5rem)',
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
    color: '#2563eb',
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
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '44px',
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
    backgroundColor: '#2563eb',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
    gap: 'clamp(1.5rem, 4vw, 2rem)',
  },
  stepCard: {
    textAlign: 'center' as const,
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    backgroundColor: '#2563eb',
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
    padding: 'clamp(3rem, 6vw, 4rem) 1rem',
    textAlign: 'center' as const,
  },
  ctaTitle: {
    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
    fontWeight: '700',
    marginBottom: '1rem',
    lineHeight: 1.2,
  },
  ctaText: {
    fontSize: 'clamp(1rem, 3vw, 1.25rem)',
    marginBottom: '2rem',
    opacity: 0.9,
    lineHeight: 1.5,
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    flexDirection: 'column' as const,
    alignItems: 'stretch',
    maxWidth: '400px',
    margin: '0 auto',
  },
  ctaPrimaryButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '48px',
    width: '100%',
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
    minHeight: '48px',
    width: '100%',
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
