import { Skeleton } from './ui/skeleton'

export default function ComparisonResultsSkeleton() {
  return (
    <div style={styles.container}>
      {/* Data Source Banner Skeleton */}
      <div style={styles.banner}>
        <div style={styles.bannerHeader}>
          <Skeleton style={styles.bannerIcon} />
          <div style={styles.bannerContent}>
            <Skeleton style={styles.bannerTitle} />
            <Skeleton style={styles.bannerText} />
            <Skeleton style={styles.bannerText} />
            <div style={styles.bannerBadges}>
              <Skeleton style={styles.badge} />
              <Skeleton style={styles.badge} />
              <Skeleton style={styles.badge} />
            </div>
          </div>
        </div>
      </div>

      {/* Savings Card Skeleton */}
      <div style={styles.savingsCard}>
        <Skeleton style={styles.savingsTitle} />
        <Skeleton style={styles.savingsAmount} />
        <Skeleton style={styles.savingsDescription} />
      </div>

      {/* Comparison Grid Skeleton */}
      <div style={styles.comparisonGrid}>
        {/* Traditional Plan Card */}
        <div style={styles.planCard}>
          <Skeleton style={styles.planTitle} />
          <Skeleton style={styles.totalCost} />
          <div style={styles.breakdown}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.breakdownItem}>
                <Skeleton style={styles.breakdownLabel} />
                <Skeleton style={styles.breakdownValue} />
              </div>
            ))}
          </div>
        </div>

        {/* DPC Plan Card */}
        <div style={styles.planCard}>
          <Skeleton style={styles.planTitle} />
          <Skeleton style={styles.totalCost} />
          <div style={styles.breakdown}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={styles.breakdownItem}>
                <Skeleton style={styles.breakdownLabel} />
                <Skeleton style={styles.breakdownValue} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Card Skeleton */}
      <div style={styles.benefitsCard}>
        <Skeleton style={styles.benefitsTitle} />
        <div style={styles.benefitsList}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} style={styles.benefitItem} />
          ))}
        </div>
      </div>

      {/* Providers Section Skeleton */}
      <div style={styles.providersSection}>
        <Skeleton style={styles.providersTitle} />
        <div style={styles.providersList}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.providerCardSkeleton}>
              <div style={styles.providerHeader}>
                <div style={styles.providerInfo}>
                  <Skeleton style={styles.providerName} />
                  <Skeleton style={styles.providerPractice} />
                </div>
                <Skeleton style={styles.matchScore} />
              </div>

              <div style={styles.providerDetails}>
                <div style={styles.providerMeta}>
                  <Skeleton style={styles.metaItem} />
                  <Skeleton style={styles.metaItem} />
                  <Skeleton style={styles.metaItem} />
                </div>

                <div style={styles.matchReasons}>
                  <Skeleton style={styles.reason} />
                  <Skeleton style={styles.reason} />
                </div>

                <div style={styles.providerContact}>
                  <Skeleton style={styles.contactButton} />
                  <Skeleton style={styles.contactButton} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  banner: {
    backgroundColor: '#eff6ff',
    border: '2px solid #3b82f6',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  bannerHeader: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'start',
  },
  bannerIcon: {
    width: '2rem',
    height: '2rem',
    borderRadius: '4px',
    flexShrink: 0,
  },
  bannerContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  bannerTitle: {
    height: '1.125rem',
    width: '30%',
    borderRadius: '4px',
  },
  bannerText: {
    height: '0.9rem',
    width: '100%',
    borderRadius: '4px',
  },
  bannerBadges: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  badge: {
    height: '2rem',
    width: '150px',
    borderRadius: '6px',
  },
  savingsCard: {
    backgroundColor: '#10b981',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  },
  savingsTitle: {
    height: '1.5rem',
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
  },
  savingsAmount: {
    height: '3rem',
    width: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
  },
  savingsDescription: {
    height: '1.125rem',
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
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
  planTitle: {
    height: '1.25rem',
    width: '40%',
    marginBottom: '1rem',
  },
  totalCost: {
    height: '2.5rem',
    width: '60%',
    marginBottom: '1.5rem',
  },
  breakdown: {
    borderTop: '1px solid #e5e7eb',
    paddingTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  breakdownLabel: {
    height: '0.9rem',
    width: '40%',
  },
  breakdownValue: {
    height: '0.9rem',
    width: '20%',
  },
  benefitsCard: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  benefitsTitle: {
    height: '1.25rem',
    width: '30%',
    marginBottom: '1rem',
  },
  benefitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  benefitItem: {
    height: '1rem',
    width: '100%',
  },
  providersSection: {
    marginTop: '3rem',
  },
  providersTitle: {
    height: '1.5rem',
    width: '40%',
    marginBottom: '1.5rem',
  },
  providersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  providerCardSkeleton: {
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
  providerInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  providerName: {
    height: '1.25rem',
    width: '50%',
  },
  providerPractice: {
    height: '0.875rem',
    width: '40%',
  },
  matchScore: {
    height: '2rem',
    width: '80px',
    borderRadius: '20px',
  },
  providerDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  providerMeta: {
    display: 'flex',
    gap: '1.5rem',
  },
  metaItem: {
    height: '0.9rem',
    width: '100px',
  },
  matchReasons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  reason: {
    height: '0.875rem',
    width: '80%',
  },
  providerContact: {
    display: 'flex',
    gap: '1rem',
  },
  contactButton: {
    height: '2.5rem',
    width: '120px',
    borderRadius: '4px',
    flex: 1,
  },
}
