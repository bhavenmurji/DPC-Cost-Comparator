import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { providerService, Provider } from '../services/providerService'
import ProviderDetailsSkeleton from '../components/ProviderDetailsSkeleton'

interface LocationState {
  searchZipCode?: string
  searchCenter?: { lat: number; lng: number }
}

export default function ProviderDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [distance, setDistance] = useState<number | null>(null)

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

      // Calculate distance if we have search location
      if (state?.searchCenter && data.latitude && data.longitude) {
        const dist = calculateDistance(
          state.searchCenter.lat,
          state.searchCenter.lng,
          data.latitude,
          data.longitude
        )
        setDistance(dist)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load provider details')
    } finally {
      setLoading(false)
    }
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
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

  const handleGetDirections = () => {
    if (!provider?.latitude || !provider?.longitude) return
    const url = `https://www.google.com/maps/dir/?api=1&destination=${provider.latitude},${provider.longitude}`
    window.open(url, '_blank')
  }

  if (loading) {
    return <ProviderDetailsSkeleton />
  }

  if (error || !provider) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-red-50 border border-red-200 rounded-lg text-center">
        <h2 className="text-2xl font-bold text-red-800 mb-4">Error</h2>
        <p className="text-red-600 mb-6">{error || 'Provider not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          ← Back to Search
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-white border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
        >
          <span>←</span>
          <span>Back to Search</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {provider.name}
              </h1>
              {provider.practiceName && (
                <p className="text-lg text-gray-600">{provider.practiceName}</p>
              )}
              {distance !== null && (
                <p className="text-sm text-gray-500 mt-2">
                  📍 {distance.toFixed(1)} miles from your location
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={toggleFavorite}
              className={`px-6 py-3 rounded-md font-semibold transition-colors whitespace-nowrap ${
                isFavorite
                  ? 'bg-yellow-400 text-white border-2 border-yellow-500 hover:bg-yellow-500'
                  : 'bg-white text-gray-600 border-2 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isFavorite ? '★ Saved' : '☆ Save'}
            </button>
          </div>

          {provider.rating && (
            <div className="flex items-center gap-3">
              <span className="text-2xl text-yellow-400">
                {'★'.repeat(Math.round(provider.rating))}
                {'☆'.repeat(5 - Math.round(provider.rating))}
              </span>
              <span className="text-gray-600">
                {provider.rating.toFixed(1)} / 5
                {provider.reviewCount && provider.reviewCount > 0 && (
                  <span className="text-gray-500"> ({provider.reviewCount} reviews)</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-500">📍 Address</p>
              <p className="text-gray-900">
                {provider.address}
                <br />
                {provider.city}, {provider.state} {provider.zipCode}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-500">📞 Phone</p>
              <a
                href={`tel:${provider.phone}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {provider.phone}
              </a>
            </div>

            {provider.email && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">✉️ Email</p>
                <a
                  href={`mailto:${provider.email}`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {provider.email}
                </a>
              </div>
            )}

            {provider.website && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-500">🌐 Website</p>
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Visit Website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Membership Fees */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Membership Fees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
              <p className="text-sm font-semibold text-green-800 mb-2">Individual</p>
              <p className="text-4xl font-bold text-green-800 mb-1">
                ${provider.monthlyFee}<span className="text-lg">/month</span>
              </p>
              <p className="text-sm text-green-600">
                ${(provider.monthlyFee * 12).toLocaleString()}/year
              </p>
            </div>

            {provider.familyFee && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
                <p className="text-sm font-semibold text-green-800 mb-2">Family Plan</p>
                <p className="text-4xl font-bold text-green-800 mb-1">
                  ${provider.familyFee}<span className="text-lg">/month</span>
                </p>
                <p className="text-sm text-green-600">
                  ${(provider.familyFee * 12).toLocaleString()}/year
                </p>
              </div>
            )}
          </div>

          {provider.acceptingPatients !== undefined && (
            <div
              className={`p-4 rounded-lg text-center font-semibold ${
                provider.acceptingPatients
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {provider.acceptingPatients
                ? '✓ Currently Accepting New Patients'
                : '✗ Not Currently Accepting New Patients'}
            </div>
          )}
        </div>

        {/* Services Included */}
        {provider.servicesIncluded && provider.servicesIncluded.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Services Included</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {provider.servicesIncluded.map((service, index) => (
                <div
                  key={index}
                  className="bg-green-50 text-green-800 px-4 py-3 rounded-md text-sm font-medium"
                >
                  ✓ {service}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {provider.specialties && provider.specialties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Specialties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {provider.specialties.map((specialty, index) => (
                <div
                  key={index}
                  className="bg-blue-50 text-blue-800 px-4 py-3 rounded-md text-sm font-medium"
                >
                  {specialty}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Board Certifications */}
        {provider.boardCertifications && provider.boardCertifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Board Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {provider.boardCertifications.map((cert, index) => (
                <div
                  key={index}
                  className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-md text-sm font-medium"
                >
                  🎓 {cert}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {provider.languages && provider.languages.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Languages Spoken</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {provider.languages.map((language, index) => (
                <div
                  key={index}
                  className="bg-gray-100 text-gray-800 px-4 py-3 rounded-md text-sm font-medium"
                >
                  🗣️ {language}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Map */}
        {provider.latitude && provider.longitude && (
          <div className="bg-white rounded-lg shadow-md p-6 md:p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Location</h2>
            <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                title={`Map showing location of ${provider.name}`}
                width="100%"
                height="100%"
                className="border-0"
                loading="lazy"
                src={`https://www.google.com/maps/embed/v1/place?key=${
                  import.meta.env.VITE_GOOGLE_MAPS_API_KEY
                }&q=${provider.latitude},${provider.longitude}&zoom=15`}
              ></iframe>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-blue-600 text-white rounded-lg shadow-md p-6 md:p-8 text-center mb-6">
          <h3 className="text-2xl font-bold mb-3">Ready to Get Started?</h3>
          <p className="text-lg mb-6 opacity-90">
            Contact this provider directly to schedule a consultation and learn more about their DPC
            practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${provider.phone}`}
              className="px-8 py-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center justify-center gap-2"
            >
              📞 Call Now
            </a>
            {provider.website && (
              <a
                href={provider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
              >
                🌐 Visit Website
              </a>
            )}
            {provider.latitude && provider.longitude && (
              <button
                type="button"
                onClick={handleGetDirections}
                className="px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
              >
                🗺️ Get Directions
              </button>
            )}
          </div>
        </div>

        {/* Claim Practice Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md p-6 md:p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Are you this provider?</h3>
          <p className="mb-4 opacity-90">
            Claim your practice to update information, respond to reviews, and manage your listing.
          </p>
          <button
            type="button"
            onClick={() => navigate('/provider/claim/' + provider.id)}
            className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Claim This Practice
          </button>
        </div>
      </div>
    </div>
  )
}
