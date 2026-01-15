import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analytics } from '../utils/analytics'
import FeaturedProvidersSkeleton from '../components/FeaturedProvidersSkeleton'
import { useCityProviders } from '../hooks/useCityProviders'

export default function NewYorkDPC() {
  const navigate = useNavigate()
  // Use shared hook for data fetching - 10001 is midtown Manhattan
  const { providers, stats, loading } = useCityProviders('10001', 30)

  useEffect(() => {
    analytics.trackPageView('/new-york-dpc')
  }, [])

  const handleSearchProviders = () => {
    navigate('/providers/search?zipCode=10001&state=NY')
  }

  const handleCalculateCosts = () => {
    navigate('/')
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Direct Primary Care in New York City</h1>
        <p style={styles.heroSubtitle}>
          Skip the wait, get the care you deserve
        </p>
        <p style={styles.heroDescription}>
          Discover {stats.providerCount > 0 ? `${stats.providerCount}+` : 'local'} DPC providers across NYC offering unlimited primary care access for
          {stats.avgMonthlyFee > 0 ? ` $${stats.avgMonthlyFee}` : ' $59-149'}/month. Same-day appointments, subway-accessible locations, multilingual care.
        </p>
        <div style={styles.heroButtons}>
          <button type="button" onClick={handleSearchProviders} style={styles.primaryButton}>
            Find NYC Providers
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
            <div style={styles.statNumber}>Same Day</div>
            <div style={styles.statLabel}>Appointments</div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Why New Yorkers Choose DPC</h2>
        <div style={styles.benefitsGrid}>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>⏰</div>
            <h3 style={styles.benefitTitle}>Skip Long NYC Wait Times</h3>
            <p style={styles.benefitText}>
              No more waiting 6-8 weeks for appointments. NYC DPC practices offer same-day or
              next-day visits when you need them
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🚇</div>
            <h3 style={styles.benefitTitle}>Subway-Accessible Care</h3>
            <p style={styles.benefitText}>
              Providers throughout Manhattan, Brooklyn, Queens, and the Bronx—easily accessible
              by subway or bus
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>🌍</div>
            <h3 style={styles.benefitTitle}>Multilingual Providers</h3>
            <p style={styles.benefitText}>
              Many NYC DPC doctors speak Spanish, Mandarin, Cantonese, Russian, and other
              languages serving our diverse city
            </p>
          </div>
          <div style={styles.benefitCard}>
            <div style={styles.benefitIcon}>💰</div>
            <h3 style={styles.benefitTitle}>Huge Savings</h3>
            <p style={styles.benefitText}>
              Save {stats.estimatedSavings > 0 ? `$${stats.estimatedSavings.toLocaleString()}+` : '$5,000+'}/year vs. traditional NYC insurance. Perfect for freelancers,
              gig workers, and small business owners
            </p>
          </div>
        </div>
      </div>

      {/* Featured Providers */}
      {loading ? (
        <FeaturedProvidersSkeleton count={5} />
      ) : (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Featured NYC Providers</h2>
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
              View All New York Providers →
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How DPC Works in New York City</h2>
        <div style={styles.stepsGrid}>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>1</div>
            <h3 style={styles.stepTitle}>Choose Your Provider</h3>
            <p style={styles.stepText}>
              Browse {stats.providerCount > 0 ? `${stats.providerCount}+` : ''} DPC practices across NYC. Compare monthly fees, locations, and
              language capabilities
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>2</div>
            <h3 style={styles.stepTitle}>Pay Monthly Membership</h3>
            <p style={styles.stepText}>
              Pay {stats.avgMonthlyFee > 0 ? `$${stats.avgMonthlyFee}` : '$59-149'}/month for unlimited primary care. No copays, no deductibles, no
              billing headaches
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>3</div>
            <h3 style={styles.stepTitle}>Add Catastrophic Coverage</h3>
            <p style={styles.stepText}>
              Pair with a catastrophic plan ($250-400/month) for hospital and specialist
              coverage
            </p>
          </div>
          <div style={styles.stepCard}>
            <div style={styles.stepNumber}>4</div>
            <h3 style={styles.stepTitle}>Get Better Healthcare</h3>
            <p style={styles.stepText}>
              Text your doctor anytime, get same-day visits, and enjoy healthcare that works
              for NYC life
            </p>
          </div>
        </div>
      </div>

      {/* NYC Comparison */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>DPC vs. Traditional NYC Healthcare</h2>
        <div style={styles.comparisonTable}>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Wait Time for Appointments</div>
            <div style={styles.comparisonDpc}>Same-day or next-day</div>
            <div style={styles.comparisonTraditional}>6-8 weeks average</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Appointment Length</div>
            <div style={styles.comparisonDpc}>30-60 minutes</div>
            <div style={styles.comparisonTraditional}>8-12 minutes</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>After-Hours Access</div>
            <div style={styles.comparisonDpc}>Text/call your doctor 24/7</div>
            <div style={styles.comparisonTraditional}>ER or urgent care ($150+)</div>
          </div>
          <div style={styles.comparisonRow}>
            <div style={styles.comparisonLabel}>Annual Cost (Individual)</div>
            <div style={styles.comparisonDpc}>$708-1,788 + catastrophic</div>
            <div style={styles.comparisonTraditional}>$6,000-10,000 (premiums + deductible)</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Transform Your Healthcare?</h2>
        <p style={styles.ctaText}>
          Join thousands of New Yorkers who've discovered affordable, accessible primary care
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
        <h2 style={styles.sectionTitle}>NYC DPC Frequently Asked Questions</h2>
        <div style={styles.faqList}>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Is DPC legal in New York?</h3>
            <p style={styles.faqAnswer}>
              Yes! DPC is fully legal in New York State. New York law explicitly recognizes DPC
              as a valid healthcare delivery model under certain regulations.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>
              Can I use DPC if I have employer-sponsored insurance?
            </h3>
            <p style={styles.faqAnswer}>
              Absolutely! Many NYC professionals use DPC for routine care and keep their employer
              insurance for specialists, hospital visits, and prescriptions. This gives you the
              best of both worlds.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>Do NYC DPC doctors accept Medicare or Medicaid?</h3>
            <p style={styles.faqAnswer}>
              DPC operates outside traditional insurance, including Medicare and Medicaid.
              However, you can use DPC alongside Medicare Part B for enhanced primary care access.
              Check with individual providers about their policies.
            </p>
          </div>
          <div style={styles.faqItem}>
            <h3 style={styles.faqQuestion}>
              What neighborhoods have DPC providers in NYC?
            </h3>
            <p style={styles.faqAnswer}>
              DPC providers are located throughout Manhattan, Brooklyn, Queens, and the Bronx.
              Many are near subway lines for easy access. Use our provider search to find
              practices near you.
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
    backgroundColor: '#7c3aed',
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
    color: '#7c3aed',
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
    color: '#7c3aed',
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
    color: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
