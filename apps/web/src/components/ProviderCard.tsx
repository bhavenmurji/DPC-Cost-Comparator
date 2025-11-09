import { Provider, ProviderSearchResult } from '../services/providerService'

interface ProviderCardProps {
  result: ProviderSearchResult
  onSelect?: (provider: Provider) => void
}

export default function ProviderCard({ result, onSelect }: ProviderCardProps) {
  const { provider, distanceMiles, matchScore } = result

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h3 style={styles.name}>{provider.name}</h3>
          <p style={styles.practiceName}>{provider.practiceName}</p>
        </div>
        <div style={styles.matchBadge}>
          {matchScore}% Match
        </div>
      </div>

      <div style={styles.details}>
        <div style={styles.row}>
          <span style={styles.icon}>📍</span>
          <div style={styles.info}>
            <div style={styles.address}>
              {provider.address}
              <br />
              {provider.city}, {provider.state} {provider.zipCode}
            </div>
            <div style={styles.distance}>{distanceMiles.toFixed(1)} miles away</div>
          </div>
        </div>

        <div style={styles.row}>
          <span style={styles.icon}>💵</span>
          <div style={styles.info}>
            <div style={styles.fee}>${provider.monthlyFee}/month</div>
            {provider.familyFee && (
              <div style={styles.familyFee}>Family: ${provider.familyFee}/month</div>
            )}
          </div>
        </div>

        {provider.phone && (
          <div style={styles.row}>
            <span style={styles.icon}>📞</span>
            <div style={styles.info}>
              <a href={`tel:${provider.phone}`} style={styles.link}>
                {provider.phone}
              </a>
            </div>
          </div>
        )}

        {provider.website && (
          <div style={styles.row}>
            <span style={styles.icon}>🌐</span>
            <div style={styles.info}>
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                Visit Website
              </a>
            </div>
          </div>
        )}
      </div>

      {provider.servicesIncluded.length > 0 && (
        <div style={styles.services}>
          <div style={styles.servicesTitle}>Services Included:</div>
          <div style={styles.servicesList}>
            {provider.servicesIncluded.slice(0, 3).map((service, index) => (
              <span key={index} style={styles.serviceTag}>
                {service}
              </span>
            ))}
            {provider.servicesIncluded.length > 3 && (
              <span style={styles.serviceTag}>+{provider.servicesIncluded.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      <div style={styles.footer}>
        <div style={styles.status}>
          {provider.acceptingPatients ? (
            <span style={styles.accepting}>✓ Accepting New Patients</span>
          ) : (
            <span style={styles.notAccepting}>Not Accepting Patients</span>
          )}
        </div>
        {onSelect && (
          <button onClick={() => onSelect(provider)} style={styles.selectButton}>
            Select Provider
          </button>
        )}
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
