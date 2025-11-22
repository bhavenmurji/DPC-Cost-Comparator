import { Skeleton } from './ui/skeleton'

interface MapSkeletonProps {
  height?: string | number
}

export default function MapSkeleton({ height = '600px' }: MapSkeletonProps) {
  return (
    <div style={{
      width: '100%',
      height,
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <Skeleton style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
      }} />

      {/* Animated loading indicator overlay */}
      <div style={styles.overlay}>
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading map...</p>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '8px',
    zIndex: 10,
  },
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    fontWeight: '500',
    margin: 0,
  },
}
