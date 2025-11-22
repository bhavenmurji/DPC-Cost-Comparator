import { Skeleton } from './ui/skeleton'

export default function ProviderCardSkeleton() {
  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Skeleton style={styles.titleSkeleton} />
          <Skeleton style={styles.subtitleSkeleton} />
        </div>
        <Skeleton style={styles.badgeSkeleton} />
      </div>

      {/* Details */}
      <div style={styles.details}>
        {/* Address row */}
        <div style={styles.row}>
          <Skeleton style={styles.iconSkeleton} />
          <div style={styles.info}>
            <Skeleton style={styles.textSkeleton} />
            <Skeleton style={styles.textSmallSkeleton} />
          </div>
        </div>

        {/* Fee row */}
        <div style={styles.row}>
          <Skeleton style={styles.iconSkeleton} />
          <Skeleton style={styles.feeSkeleton} />
        </div>

        {/* Phone row */}
        <div style={styles.row}>
          <Skeleton style={styles.iconSkeleton} />
          <Skeleton style={styles.textSkeleton} />
        </div>

        {/* Website row */}
        <div style={styles.row}>
          <Skeleton style={styles.iconSkeleton} />
          <Skeleton style={styles.textSkeleton} />
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <Skeleton style={styles.dataSourceSkeleton} />
        <div style={styles.buttonGroup}>
          <Skeleton style={styles.buttonSkeleton} />
          <Skeleton style={styles.buttonSkeleton} />
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f3f4f6',
  },
  headerLeft: {
    flex: 1,
    marginRight: '1rem',
  },
  titleSkeleton: {
    height: '1.5rem',
    width: '60%',
    marginBottom: '0.5rem',
  },
  subtitleSkeleton: {
    height: '0.875rem',
    width: '40%',
  },
  badgeSkeleton: {
    height: '2rem',
    width: '100px',
    borderRadius: '20px',
    flexShrink: 0,
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  row: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'start',
  },
  iconSkeleton: {
    height: '1.25rem',
    width: '1.25rem',
    borderRadius: '4px',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  textSkeleton: {
    height: '1rem',
    width: '100%',
  },
  textSmallSkeleton: {
    height: '0.875rem',
    width: '80%',
  },
  feeSkeleton: {
    height: '1rem',
    width: '120px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
  },
  dataSourceSkeleton: {
    height: '0.75rem',
    width: '150px',
    flex: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  buttonSkeleton: {
    height: '2.5rem',
    width: '100px',
    borderRadius: '4px',
  },
}
