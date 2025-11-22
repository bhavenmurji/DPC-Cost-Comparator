import { useNavigate } from 'react-router-dom'
import { ProviderSearchResult } from '../services/providerService'
import { analytics } from '../utils/analytics'

interface ProviderCardProps {
  result: ProviderSearchResult
  onSelect?: (result: ProviderSearchResult) => void
  searchZipCode?: string
  searchCenter?: { lat: number; lng: number }
}

export default function ProviderCard({ result, searchZipCode, searchCenter }: ProviderCardProps) {
  const navigate = useNavigate()
  const distance = result.distance || 0
  const rating = result.rating || 0

  const handleViewDetails = () => {
    analytics.trackProviderViewed({
      providerId: result.id,
      providerName: result.name,
      city: result.city,
      state: result.state,
      monthlyFee: result.monthlyFee,
      distanceMiles: distance,
    })

    navigate(`/providers/${result.id}`, {
      state: {
        searchZipCode,
        searchCenter,
      },
    })
  }

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    analytics.trackProviderContact({
      providerId: result.id,
      providerName: result.name,
      contactMethod: 'phone',
    })
  }

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    analytics.trackProviderContact({
      providerId: result.id,
      providerName: result.name,
      contactMethod: 'website',
    })
  }

  const handleClaimPractice = (e: React.MouseEvent) => {
    e.stopPropagation()
    analytics.trackClaimPractice({
      providerId: result.id,
      providerName: result.name,
    })
    navigate(`/provider/claim/${result.id}`)
  }

  return (
    <div style={styles.card} onClick={handleViewDetails}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h3 style={styles.name}>{result.name}</h3>
          {rating > 0 && (
            <p style={styles.rating}>Rating: {rating.toFixed(1)}/5</p>
          )}
          <div style={styles.distance}>{distance.toFixed(1)} mi away</div>
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
          <button
            type="button"
            onClick={handleClaimPractice}
            style={styles.claimButton}
          >
            Claim Practice
          </button>
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
    padding: 'clamp(1rem, 3vw, 1.5rem)',
    marginBottom: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s',
    cursor: 'pointer',
    width: '100%',
  },
  header: {
    marginBottom: '1rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #f3f4f6',
  },
  headerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  name: {
    fontSize: 'clamp(1.125rem, 4vw, 1.25rem)',
    fontWeight: '600',
    margin: 0,
    color: '#1a1a1a',
    lineHeight: 1.3,
  },
  rating: {
    fontSize: '0.875rem',
    color: '#666',
    margin: 0,
  },
  distance: {
    display: 'inline-block',
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.375rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    alignSelf: 'flex-start',
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
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  address: {
    fontSize: '0.9rem',
    color: '#374151',
    lineHeight: 1.5,
  },
  fee: {
    fontSize: 'clamp(1rem, 3.5vw, 1.125rem)',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '0.9rem',
    minHeight: '44px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #f3f4f6',
  },
  status: {
    order: 2,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    order: 1,
  },
  claimButton: {
    backgroundColor: '#10b981',
    color: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '44px',
    width: '100%',
    transition: 'background-color 0.2s',
  },
  selectButton: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    minHeight: '44px',
    width: '100%',
    transition: 'background-color 0.2s',
  },
  dataSource: {
    color: '#6b7280',
    fontSize: '0.75rem',
    fontWeight: '400',
  },
}
