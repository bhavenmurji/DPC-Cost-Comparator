import { useEffect, useRef, useState } from 'react'
import { useJsApiLoader } from '@react-google-maps/api'
import { ProviderSearchResult } from '../services/providerService'
import { getEnv } from '../config/env'
import MapSkeleton from './MapSkeleton'

interface ProviderMapProps {
  results: ProviderSearchResult[]
  center: { lat: number; lng: number }
  onProviderSelect?: (provider: ProviderSearchResult) => void
}

export default function ProviderMap({ results, center, onProviderSelect }: ProviderMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([])
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null)

  // Get validated environment config
  const env = getEnv()

  // Check if Google Maps API key is configured
  if (!env.hasGoogleMapsKey) {
    return (
      <div style={styles.missingConfig}>
        <div style={styles.missingConfigContent}>
          <div style={styles.missingConfigIcon}>maps</div>
          <h3 style={styles.missingConfigTitle}>Map View Not Available</h3>
          <p style={styles.missingConfigText}>
            Google Maps is not configured. Please set the <code style={styles.code}>VITE_GOOGLE_MAPS_API_KEY</code> environment variable in your <code style={styles.code}>.env</code> file to enable map view.
          </p>
          <p style={styles.missingConfigSubtext}>
            You can still view providers in the list below.
          </p>
        </div>
      </div>
    )
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: env.googleMapsApiKey,
  })

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || map) return

    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom: 11,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    })

    setMap(newMap)
    setInfoWindow(new google.maps.InfoWindow())
  }, [isLoaded, map, center])

  // Add markers
  useEffect(() => {
    if (!map || !isLoaded) return

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))

    const newMarkers: google.maps.Marker[] = []

    // Add center marker (search location)
    const centerMarker = new google.maps.Marker({
      position: center,
      map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    })
    newMarkers.push(centerMarker)

    // Add provider markers
    results.forEach((result) => {
      if (!result.location?.latitude || !result.location?.longitude) return

      const marker = new google.maps.Marker({
        position: {
          lat: result.location.latitude,
          lng: result.location.longitude,
        },
        map,
        title: result.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10b981',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      })

      // Add click listener for info window
      marker.addListener('click', () => {
        if (!infoWindow) return

        const content = `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="font-size: 16px; font-weight: 600; margin: 0 0 4px 0; color: #1a1a1a;">
              ${result.name}
            </h3>
            <p style="font-size: 14px; color: #6b7280; margin: 0 0 12px 0;">
              ${result.address || 'Address not available'}
            </p>
            <div style="margin-bottom: 12px;">
              <p style="font-size: 14px; margin: 4px 0; color: #374151;">
                📍 ${result.distance?.toFixed(1) || '0.0'} miles away
              </p>
              <p style="font-size: 14px; margin: 4px 0; color: #374151; font-weight: 600;">
                💵 $${result.monthlyFee}/month
              </p>
            </div>
          </div>
        `

        infoWindow.setContent(content)
        infoWindow.open(map, marker)

        if (onProviderSelect) {
          onProviderSelect(result)
        }
      })

      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // Cleanup
    return () => {
      newMarkers.forEach(marker => marker.setMap(null))
    }
  }, [map, results, center, isLoaded, infoWindow, onProviderSelect])

  if (loadError) {
    return (
      <div style={styles.error}>
        <strong>Error loading Google Maps</strong>
        <p>Please check your API key configuration</p>
      </div>
    )
  }

  if (!isLoaded) {
    return <MapSkeleton height="600px" />
  }

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: 'clamp(300px, 50vh, 600px)',
        borderRadius: '8px',
        minHeight: '300px',
      }}
      className="map-container"
    />
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
  missingConfig: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '600px',
    backgroundColor: '#fef3c7',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    padding: '2rem',
  },
  missingConfigContent: {
    textAlign: 'center',
    maxWidth: '400px',
  },
  missingConfigIcon: {
    fontSize: '48px',
    marginBottom: '1rem',
  },
  missingConfigTitle: {
    margin: '0 0 1rem 0',
    color: '#92400e',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  missingConfigText: {
    margin: '0 0 0.5rem 0',
    color: '#78350f',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  },
  missingConfigSubtext: {
    margin: '0.5rem 0 0 0',
    color: '#b45309',
    fontSize: '0.875rem',
  },
  code: {
    backgroundColor: '#fbbf24',
    padding: '2px 6px',
    borderRadius: '3px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
    color: '#78350f',
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
