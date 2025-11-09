import { useCallback, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import { Provider, ProviderSearchResult } from '../services/providerService'

interface ProviderMapProps {
  results: ProviderSearchResult[]
  center: { lat: number; lng: number }
  onProviderSelect?: (provider: Provider) => void
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '8px',
}

const defaultMapOptions = {
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
}

export default function ProviderMap({ results, center, onProviderSelect }: ProviderMapProps) {
  const [selectedProvider, setSelectedProvider] = useState<ProviderSearchResult | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (loadError) {
    return (
      <div style={styles.error}>
        <strong>Error loading Google Maps</strong>
        <p>Please check your API key configuration</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading map...</p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={11}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={defaultMapOptions}
    >
      {/* Center marker (user's search location) */}
      <Marker
        position={center}
        icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }}
        title="Your Location"
      />

      {/* Provider markers */}
      {results.map((result, index) => {
        // Providers have location: { latitude, longitude }
        const position = {
          lat: result.location?.latitude || 0,
          lng: result.location?.longitude || 0,
        }

        return (
          <Marker
            key={result.id || index}
            position={position}
            title={result.name}
            onClick={() => setSelectedProvider(result)}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#10b981',
              fillOpacity: 0.9,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
          />
        )
      })}

      {/* Info window for selected provider */}
      {selectedProvider && (
        <InfoWindow
          position={{
            lat: selectedProvider.location?.latitude || 0,
            lng: selectedProvider.location?.longitude || 0,
          }}
          onCloseClick={() => setSelectedProvider(null)}
        >
          <div style={styles.infoWindow}>
            <h3 style={styles.infoTitle}>{selectedProvider.name}</h3>
            <p style={styles.infoPractice}>{selectedProvider.address || 'Address not available'}</p>
            <div style={styles.infoDetails}>
              <p style={styles.infoDistance}>
                📍 {selectedProvider.distance?.toFixed(1) || '0.0'} miles away
              </p>
              <p style={styles.infoFee}>
                💵 ${selectedProvider.monthlyFee}/month
              </p>
            </div>
            {onProviderSelect && (
              <button
                onClick={() => onProviderSelect(selectedProvider)}
                style={styles.infoButton}
              >
                View Details
              </button>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  )
}

const styles: Record<string, React.CSSProperties> = {
  error: {
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    color: '#991b1b',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '600px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
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
  infoWindow: {
    padding: '0.5rem',
    maxWidth: '250px',
  },
  infoTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 0.25rem 0',
    color: '#1a1a1a',
  },
  infoPractice: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 0.75rem 0',
  },
  infoDetails: {
    marginBottom: '0.75rem',
  },
  infoDistance: {
    fontSize: '0.875rem',
    margin: '0.25rem 0',
    color: '#374151',
  },
  infoFee: {
    fontSize: '0.875rem',
    margin: '0.25rem 0',
    color: '#374151',
    fontWeight: '600',
  },
  infoButton: {
    width: '100%',
    padding: '0.5rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
