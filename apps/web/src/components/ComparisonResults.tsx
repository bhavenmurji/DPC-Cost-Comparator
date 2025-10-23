interface ComparisonResultsProps {
  results: {
    traditionalTotalAnnual: number
    dpcTotalAnnual: number
    annualSavings: number
    percentageSavings: number
    recommendedPlan: string
    breakdown: {
      traditional: CostBreakdown
      dpc: CostBreakdown
    }
  }
  providers?: Array<{
    provider: {
      name: string
      practiceName: string
      city: string
      state: string
      monthlyFee: number
      rating?: number
      phone: string
      website?: string
    }
    distanceMiles: number
    matchScore: number
    matchReasons: string[]
  }>
}

interface CostBreakdown {
  premiums: number
  deductible: number
  copays: number
  prescriptions: number
  outOfPocket: number
  total: number
}

export default function ComparisonResults({ results, providers }: ComparisonResultsProps) {
  const savings = results.annualSavings
  const isDPCBetter = results.recommendedPlan === 'DPC_CATASTROPHIC'

  return (
    <div style={styles.container}>
      {/* Summary Card */}
      <div style={isDPCBetter ? styles.savingsCard : styles.warningCard}>
        <h2 style={styles.savingsTitle}>
          {isDPCBetter ? '💰 You Could Save!' : '⚠️ Higher Cost'}
        </h2>
        <div style={styles.savingsAmount}>
          ${Math.abs(savings).toLocaleString()}/year
        </div>
        <p style={styles.savingsDescription}>
          {isDPCBetter
            ? `By switching to DPC + Catastrophic coverage, you could save ${results.percentageSavings.toFixed(1)}% annually`
            : `Traditional insurance appears to be ${Math.abs(results.percentageSavings).toFixed(1)}% cheaper for your situation`}
        </p>
      </div>

      {/* Cost Comparison */}
      <div style={styles.comparisonGrid}>
        <div style={styles.planCard}>
          <h3 style={styles.planTitle}>Traditional Insurance</h3>
          <div style={styles.totalCost}>
            ${results.traditionalTotalAnnual.toLocaleString()}
            <span style={styles.perYear}>/year</span>
          </div>
          <div style={styles.breakdown}>
            <div style={styles.breakdownItem}>
              <span>Monthly Premium</span>
              <span>${(results.breakdown.traditional.premiums / 12).toFixed(0)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>Annual Deductible</span>
              <span>${results.breakdown.traditional.deductible.toLocaleString()}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>Copays</span>
              <span>${results.breakdown.traditional.copays.toLocaleString()}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>Prescriptions</span>
              <span>${results.breakdown.traditional.prescriptions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={isDPCBetter ? styles.planCardRecommended : styles.planCard}>
          <h3 style={styles.planTitle}>
            DPC + Catastrophic
            {isDPCBetter && <span style={styles.recommendedBadge}>Recommended</span>}
          </h3>
          <div style={styles.totalCost}>
            ${results.dpcTotalAnnual.toLocaleString()}
            <span style={styles.perYear}>/year</span>
          </div>
          <div style={styles.breakdown}>
            <div style={styles.breakdownItem}>
              <span>DPC Monthly Fee</span>
              <span>${(results.breakdown.dpc.premiums / 12).toFixed(0)}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>Catastrophic Premium</span>
              <span>${((results.dpcTotalAnnual - results.breakdown.dpc.premiums - results.breakdown.dpc.prescriptions) / 12).toFixed(0)}/mo</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>Deductible</span>
              <span>${results.breakdown.dpc.deductible.toLocaleString()}</span>
            </div>
            <div style={styles.breakdownItem}>
              <span>Prescriptions</span>
              <span>${results.breakdown.dpc.prescriptions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DPC Benefits */}
      <div style={styles.benefitsCard}>
        <h3 style={styles.benefitsTitle}>Benefits of DPC</h3>
        <ul style={styles.benefitsList}>
          <li>Unlimited primary care visits - no copays</li>
          <li>Same-day or next-day appointments</li>
          <li>24/7 direct access to your doctor via phone/text</li>
          <li>Longer appointment times (30-60 minutes)</li>
          <li>Wholesale prescription pricing</li>
          <li>Basic lab work included</li>
        </ul>
      </div>

      {/* Provider Matches */}
      {providers && providers.length > 0 && (
        <div style={styles.providersSection}>
          <h3 style={styles.providersTitle}>Recommended DPC Providers Near You</h3>
          <div style={styles.providersList}>
            {providers.map((match, index) => (
              <div key={index} style={styles.providerCard}>
                <div style={styles.providerHeader}>
                  <div>
                    <h4 style={styles.providerName}>{match.provider.name}</h4>
                    <p style={styles.practiceName}>{match.provider.practiceName}</p>
                  </div>
                  <div style={styles.matchScore}>
                    {match.matchScore}% Match
                  </div>
                </div>

                <div style={styles.providerDetails}>
                  <div style={styles.providerInfo}>
                    <span>📍 {match.distanceMiles.toFixed(1)} miles away</span>
                    <span>💵 ${match.provider.monthlyFee}/month</span>
                    {match.provider.rating && (
                      <span>⭐ {match.provider.rating.toFixed(1)}</span>
                    )}
                  </div>

                  <div style={styles.matchReasons}>
                    {match.matchReasons.slice(0, 3).map((reason, i) => (
                      <span key={i} style={styles.matchReason}>✓ {reason}</span>
                    ))}
                  </div>

                  <div style={styles.providerContact}>
                    <a href={`tel:${match.provider.phone}`} style={styles.phoneButton}>
                      📞 {match.provider.phone}
                    </a>
                    {match.provider.website && (
                      <a
                        href={match.provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={styles.websiteButton}
                      >
                        🌐 Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  savingsCard: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  warningCard: {
    backgroundColor: '#f59e0b',
    color: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  savingsTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  savingsAmount: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  savingsDescription: {
    fontSize: '1.125rem',
    opacity: 0.9,
  },
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  planCard: {
    backgroundColor: '#fff',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  planCardRecommended: {
    backgroundColor: '#fff',
    border: '2px solid #10b981',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
  },
  planTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommendedBadge: {
    fontSize: '0.75rem',
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontWeight: '500',
  },
  totalCost: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '1.5rem',
  },
  perYear: {
    fontSize: '1rem',
    color: '#666',
    fontWeight: 'normal',
  },
  breakdown: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  },
  benefitsCard: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  benefitsTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '1rem',
  },
  benefitsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  providersSection: {
    marginTop: '3rem',
  },
  providersTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
  },
  providersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  providerCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  providerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  providerName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  practiceName: {
    color: '#666',
    margin: 0,
  },
  matchScore: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  providerDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  providerInfo: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.9rem',
    color: '#666',
  },
  matchReasons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  matchReason: {
    fontSize: '0.875rem',
    color: '#059669',
  },
  providerContact: {
    display: 'flex',
    gap: '1rem',
  },
  phoneButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  websiteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
}
