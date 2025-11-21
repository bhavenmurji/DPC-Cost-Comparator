import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { providerService, Provider } from '../services/providerService'

export default function ProviderDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (id) {
      loadProvider(id)
      checkIfFavorite(id)
    }
  }, [id])

  const loadProvider = async (providerId: string) => {
    setLoading(true)
    try {
      const data = await providerService.getProviderById(providerId)
      setProvider(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider details')
    } finally {
      setLoading(false)
    }
  }

  const checkIfFavorite = (providerId: string) => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProviders') || '[]')
    setIsFavorite(favorites.includes(providerId))
  }

  const toggleFavorite = () => {
    if (!provider) return

    const favorites = JSON.parse(localStorage.getItem('favoriteProviders') || '[]')

    if (isFavorite) {
      const updated = favorites.filter((fav: string) => fav !== provider.id)
      localStorage.setItem('favoriteProviders', JSON.stringify(updated))
      setIsFavorite(false)
    } else {
      favorites.push(provider.id)
      localStorage.setItem('favoriteProviders', JSON.stringify(favorites))
      setIsFavorite(true)
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading provider details...</p>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div style={styles.error}>
        <h2>Error</h2>
        <p>{error || 'Provider not found'}</p>
        <button onClick={() => navigate('/providers')} style={styles.backButton}>
          ← Back to Search
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/providers')} style={styles.backButton}>
        ← Back to Search
      </button>

      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.name}>{provider.name}</h1>
            {provider.practiceName && (
              <p style={styles.practiceName}>{provider.practiceName}</p>
            )}
          </div>
          <button
            onClick={toggleFavorite}
            style={isFavorite ? styles.favoriteButtonActive : styles.favoriteButton}
          >
            {isFavorite ? '★ Saved' : '☆ Save'}
          </button>
        </div>

        {provider.rating && (
          <div style={styles.rating}>
            <span style={styles.stars}>{'★'.repeat(Math.round(provider.rating))}</span>
            <span style={styles.ratingText}>
              {provider.rating.toFixed(1)} / 5
              {provider.reviewCount && ` (${provider.reviewCount} reviews)`}
            </span>
          </div>
        )}
      </div>

      <div style={styles.content}>
        {/* Contact Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contact Information</h2>
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📍 Address</span>
              <span style={styles.infoValue}>
                {provider.address}<br />
                {provider.city}, {provider.state} {provider.zipCode}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>📞 Phone</span>
              <a href={`tel:${provider.phone}`} style={styles.phoneLink}>
                {provider.phone}
              </a>
            </div>

            {provider.email && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>✉️ Email</span>
                <a href={`mailto:${provider.email}`} style={styles.emailLink}>
                  {provider.email}
                </a>
              </div>
            )}

            {provider.website && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>🌐 Website</span>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.websiteLink}
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div style={styles.pricingSection}>
          <h2 style={styles.sectionTitle}>Membership Fees</h2>
          <div style={styles.pricingGrid}>
            <div style={styles.pricingCard}>
              <span style={styles.pricingLabel}>Individual</span>
              <span style={styles.pricingValue}>${provider.monthlyFee}/month</span>
              <span style={styles.pricingAnnual}>
                ${(provider.monthlyFee * 12).toLocaleString()}/year
              </span>
            </div>

            {provider.familyFee && (
              <div style={styles.pricingCard}>
                <span style={styles.pricingLabel}>Family Plan</span>
                <span style={styles.pricingValue}>${provider.familyFee}/month</span>
                <span style={styles.pricingAnnual}>
                  ${(provider.familyFee * 12).toLocaleString()}/year
                </span>
              </div>
            )}
          </div>

          {provider.acceptingPatients !== undefined && (
            <div style={provider.acceptingPatients ? styles.acceptingBadge : styles.notAcceptingBadge}>
              {provider.acceptingPatients ? '✓ Currently Accepting New Patients' : '✗ Not Currently Accepting New Patients'}
            </div>
          )}
        </div>

        {/* Services Included */}
        {provider.servicesIncluded && provider.servicesIncluded.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Services Included</h2>
            <div style={styles.tagGrid}>
              {provider.servicesIncluded.map((service, index) => (
                <div key={index} style={styles.serviceTag}>
                  ✓ {service}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {provider.specialties && provider.specialties.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Specialties</h2>
            <div style={styles.tagGrid}>
              {provider.specialties.map((specialty, index) => (
                <div key={index} style={styles.specialtyTag}>
                  {specialty}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Board Certifications */}
        {provider.boardCertifications && provider.boardCertifications.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Board Certifications</h2>
            <div style={styles.tagGrid}>
              {provider.boardCertifications.map((cert, index) => (
                <div key={index} style={styles.certTag}>
                  🎓 {cert}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {provider.languages && provider.languages.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Languages Spoken</h2>
            <div style={styles.tagGrid}>
              {provider.languages.map((language, index) => (
                <div key={index} style={styles.languageTag}>
                  🗣️ {language}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Map */}
        {provider.latitude && provider.longitude && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Location</h2>
            <div style={styles.mapPlaceholder}>
              <iframe
                width="100%"
                height="400"
                style={{ border: 0, borderRadius: '8px' }}
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=${(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY}&q=${provider.latitude},${provider.longitude}&zoom=15`}
              ></iframe>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div style={styles.ctaSection}>
          <h3 style={styles.ctaTitle}>Ready to Get Started?</h3>
          <p style={styles.ctaText}>
            Contact this provider directly to schedule a consultation and learn more about their DPC practice.
          </p>
          <div style={styles.ctaButtons}>
            <a href={`tel:${provider.phone}`} style={styles.callButton}>
              📞 Call Now
            </a>
            {provider.website && (
              <a
                href={provider.website}
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
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    padding: '2rem 1rem',
  },
  backButton: {
    marginBottom: '1.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  name: {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: 0,
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  practiceName: {
    fontSize: '1.125rem',
    color: '#666',
    margin: 0,
  },
  favoriteButton: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#fff',
    border: '2px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#666',
  },
  favoriteButtonActive: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#fbbf24',
    border: '2px solid #f59e0b',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#fff',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  stars: {
    fontSize: '1.5rem',
    color: '#fbbf24',
  },
  ratingText: {
    fontSize: '1rem',
    color: '#666',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  section: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#1a1a1a',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  infoLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#1a1a1a',
  },
  phoneLink: {
    fontSize: '1rem',
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: '500',
  },
  emailLink: {
    fontSize: '1rem',
    color: '#2563eb',
    textDecoration: 'none',
  },
  websiteLink: {
    fontSize: '1rem',
    color: '#2563eb',
    textDecoration: 'none',
  },
  pricingSection: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  pricingCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    backgroundColor: '#f0fdf4',
    border: '2px solid #86efac',
    borderRadius: '8px',
  },
  pricingLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '0.5rem',
  },
  pricingValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: '0.25rem',
  },
  pricingAnnual: {
    fontSize: '0.875rem',
    color: '#16a34a',
  },
  acceptingBadge: {
    padding: '1rem',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  notAcceptingBadge: {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  tagGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  serviceTag: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  specialtyTag: {
    padding: '0.75rem 1rem',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  certTag: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  languageTag: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  mapPlaceholder: {
    width: '100%',
    height: '400px',
    backgroundColor: '#e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  ctaSection: {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
  },
  ctaText: {
    fontSize: '1.125rem',
    marginBottom: '1.5rem',
    opacity: 0.9,
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  callButton: {
    padding: '1rem 2rem',
    backgroundColor: '#10b981',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '1.125rem',
    fontWeight: '600',
    border: 'none',
  },
  websiteButton: {
    padding: '1rem 2rem',
    backgroundColor: '#fff',
    color: '#2563eb',
    textDecoration: 'none',
    borderRadius: '6px',
    fontSize: '1.125rem',
    fontWeight: '600',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    padding: '2rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  error: {
    maxWidth: '600px',
    margin: '4rem auto',
    padding: '2rem',
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    textAlign: 'center',
  },
}
