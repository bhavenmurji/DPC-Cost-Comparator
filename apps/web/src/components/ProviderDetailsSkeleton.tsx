import { Skeleton } from './ui/skeleton'

export default function ProviderDetailsSkeleton() {
  return (
    <div style={styles.container}>
      {/* Back button */}
      <Skeleton style={styles.backButton} />

      {/* Header section */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Skeleton style={styles.providerName} />
          <Skeleton style={styles.practiceName} />
          <div style={styles.badges}>
            <Skeleton style={styles.badge} />
            <Skeleton style={styles.badge} />
          </div>
        </div>
        <Skeleton style={styles.favoriteButton} />
      </div>

      {/* Contact section */}
      <div style={styles.card}>
        <Skeleton style={styles.sectionTitle} />
        <div style={styles.contactGrid}>
          <Skeleton style={styles.contactItem} />
          <Skeleton style={styles.contactItem} />
          <Skeleton style={styles.contactItem} />
          <Skeleton style={styles.contactItem} />
        </div>
      </div>

      {/* Details section */}
      <div style={styles.card}>
        <Skeleton style={styles.sectionTitle} />
        <div style={styles.detailsList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={styles.detailItem}>
              <Skeleton style={styles.detailLabel} />
              <Skeleton style={styles.detailValue} />
            </div>
          ))}
        </div>
      </div>

      {/* Services section */}
      <div style={styles.card}>
        <Skeleton style={styles.sectionTitle} />
        <div style={styles.servicesList}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} style={styles.serviceTag} />
          ))}
        </div>
      </div>

      {/* Pricing section */}
      <div style={styles.card}>
        <Skeleton style={styles.sectionTitle} />
        <div style={styles.pricingGrid}>
          <Skeleton style={styles.pricingItem} />
          <Skeleton style={styles.pricingItem} />
          <Skeleton style={styles.pricingItem} />
        </div>
      </div>

      {/* About section */}
      <div style={styles.card}>
        <Skeleton style={styles.sectionTitle} />
        <div style={styles.aboutText}>
          <Skeleton style={styles.textLine} />
          <Skeleton style={styles.textLine} />
          <Skeleton style={styles.textLineShort} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={styles.actions}>
        <Skeleton style={styles.actionButton} />
        <Skeleton style={styles.actionButton} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  backButton: {
    height: '2.5rem',
    width: '150px',
    marginBottom: '2rem',
    borderRadius: '4px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '2px solid #e5e7eb',
  },
  headerContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  providerName: {
    height: '2rem',
    width: '60%',
  },
  practiceName: {
    height: '1rem',
    width: '40%',
  },
  badges: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  badge: {
    height: '1.75rem',
    width: '100px',
    borderRadius: '12px',
  },
  favoriteButton: {
    height: '2.5rem',
    width: '50px',
    borderRadius: '4px',
  },
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    height: '1.25rem',
    width: '30%',
    marginBottom: '1rem',
  },
  contactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  contactItem: {
    height: '2.5rem',
    borderRadius: '4px',
  },
  detailsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  detailLabel: {
    height: '1rem',
    width: '30%',
  },
  detailValue: {
    height: '1rem',
    width: '50%',
  },
  servicesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  serviceTag: {
    height: '1.75rem',
    width: '120px',
    borderRadius: '12px',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
  pricingItem: {
    height: '4rem',
    borderRadius: '4px',
  },
  aboutText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  textLine: {
    height: '1rem',
    width: '100%',
  },
  textLineShort: {
    height: '1rem',
    width: '70%',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  actionButton: {
    height: '3rem',
    flex: 1,
    borderRadius: '4px',
  },
}
