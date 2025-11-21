import { useNavigate } from 'react-router-dom'
import { ProviderSearchResult } from '../services/providerService'
import { analytics } from '../utils/analytics'

interface ProviderCardProps {
  result: ProviderSearchResult
  onSelect?: (result: ProviderSearchResult) => void
}

export default function ProviderCard({ result }: ProviderCardProps) {
  const navigate = useNavigate()
  // API returns flat provider objects with distance property
  const distance = result.distance || 0
  const rating = result.rating || 0

  const handleViewDetails = () => {
    // Track provider view
    analytics.trackProviderViewed({
      providerId: result.id,
      providerName: result.name,
      city: result.city,
      state: result.state,
      monthlyFee: result.monthlyFee,
      distanceMiles: distance,
    })

    navigate(`/providers/${result.id}`)
  }

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    analytics.trackProviderContact({
      providerId: result.id,
      providerName: result.name,
      contactMethod: 'phone',
    })
  }

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    analytics.trackProviderContact({
      providerId: result.id,
      providerName: result.name,
      contactMethod: 'website',
    })
  }

  const handleClaimPractice = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    analytics.trackClaimPractice({
      providerId: result.id,
      providerName: result.name,
    })
    navigate(`/provider/claim/${result.id}`)
  }

  // Check if this provider has been claimed
  const isClaimed = result.claimedByUserId != null

  return (
    <div style={styles.card} onClick={handleViewDetails}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.name}>{result.name}</h3>
          {rating > 0 && (
            <p style={styles.practiceName}>Rating: {rating.toFixed(1)}/5</p>
          )}
        </div>
        <div style={styles.matchBadge}>
          {distance.toFixed(1)} mi
        </div>
      </div>

      <div style={styles.details}>
        <div style={styles.row}>
          <span style={styles.icon}>📍</span>
          <div style={styles.info}>
            <div style={styles.address}>
              {result.address}
              {result.city && result.state && (
                <>
                  <br />
                  {result.city}, {result.state} {result.zipCode}
                </>
              )}
            </div>
            <div style={styles.distance}>{distance.toFixed(1)} miles away</div>
          </div>
        </div>

        <div style={styles.row}>
          <span style={styles.icon}>💵</span>
          <div style={styles.info}>
            <div style={styles.fee}>${result.monthlyFee}/month</div>
          </div>
        </div>

        {result.phone && (
          <div style={styles.row}>
            <span style={styles.icon}>📞</span>
            <div style={styles.info}>
              <a
                href={`tel:${result.phone}`}
                style={styles.link}
                onClick={handlePhoneClick}
              >
                {result.phone}
              </a>
            </div>
          </div>
        )}

        {result.website && (
          <div style={styles.row}>
            <span style={styles.icon}>🌐</span>
            <div style={styles.info}>
              <a
                href={result.website}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
                onClick={handleWebsiteClick}
              >
                Visit Website
              </a>
            </div>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.status}>
          <span style={styles.dataSource}>
            Source: {result.dataSource?.source || 'Unknown'}
          </span>
        </div>
        <div style={styles.buttonGroup}>
          {!isClaimed && (
            <button
              type="button"
              onClick={handleClaimPractice}
              style={styles.claimButton}
            >
              🏥 Claim Practice
            </button>
          )}
          <button
            type="button"
            onClick={handleViewDetails}
            style={styles.selectButton}
          >
            View Details
          </button>
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
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
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
  },
  name: {
    fontSize: '1.25rem',
    fontWeight: '600',
    margin: 0,
    marginBottom: '0.25rem',
    color: '#1a1a1a',
  },
  practiceName: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },
  matchBadge: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
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
  icon: {
    fontSize: '1.25rem',
  },
  info: {
    flex: 1,
  },
  address: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: '1.5',
  },
  distance: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  fee: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  familyFee: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '0.25rem',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  services: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
  },
  servicesTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  servicesList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  serviceTag: {
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
  },
  status: {
    flex: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  claimButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  accepting: {
    color: '#059669',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  notAccepting: {
    color: '#dc2626',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  dataSource: {
    color: '#6b7280',
    fontSize: '0.75rem',
    fontWeight: '400',
  },
  selectButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '0.5rem 1.5rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
