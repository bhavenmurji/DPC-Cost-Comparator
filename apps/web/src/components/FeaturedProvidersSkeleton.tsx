import { Skeleton } from './ui/skeleton'

interface FeaturedProvidersSkeletonProps {
  count?: number
}

export default function FeaturedProvidersSkeleton({ count = 5 }: FeaturedProvidersSkeletonProps) {
  return (
    <div style={styles.section}>
      <Skeleton style={styles.sectionTitle} />
      <div style={styles.providersGrid}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={styles.providerCard}>
            <div style={styles.cardHeader}>
              <Skeleton style={styles.providerName} />
              <Skeleton style={styles.badge} />
            </div>

            <div style={styles.cardContent}>
              <Skeleton style={styles.address} />
              <div style={styles.detailsRow}>
                <Skeleton style={styles.detail} />
                <Skeleton style={styles.detail} />
              </div>

              <div style={styles.servicesSection}>
                <Skeleton style={styles.serviceTitle} />
                <div style={styles.servicesList}>
                  <Skeleton style={styles.service} />
                  <Skeleton style={styles.service} />
                  <Skeleton style={styles.service} />
                </div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <Skeleton style={styles.button} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding: '3rem 1rem',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    height: '1.875rem',
    width: '50%',
    marginBottom: '2rem',
    marginLeft: 0,
  },
  providersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  providerCard: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: '1rem',
  },
  providerName: {
    height: '1.25rem',
    width: '70%',
  },
  badge: {
    height: '1.75rem',
    width: '80px',
    borderRadius: '12px',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  address: {
    height: '1rem',
    width: '90%',
  },
  detailsRow: {
    display: 'flex',
    gap: '1rem',
  },
  detail: {
    height: '1rem',
    width: '45%',
  },
  servicesSection: {
    marginTop: '0.5rem',
  },
  serviceTitle: {
    height: '0.875rem',
    width: '30%',
    marginBottom: '0.5rem',
  },
  servicesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  service: {
    height: '1.5rem',
    width: '80px',
    borderRadius: '4px',
  },
  cardFooter: {
    marginTop: '0.5rem',
  },
  button: {
    height: '2.5rem',
    width: '100%',
    borderRadius: '4px',
  },
}
