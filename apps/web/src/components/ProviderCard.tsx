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

    navigate(`/providers/${result.id}`, {
      state: {
        searchZipCode,
        searchCenter,
      },
    })
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1 text-gray-900">{result.name}</h3>
          {rating > 0 && (
            <p className="text-sm text-gray-500 m-0">Rating: {rating.toFixed(1)}/5</p>
          )}
        </div>
        <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
          {distance.toFixed(1)} mi
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex gap-3 items-start">
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <div className="text-sm text-gray-700 leading-relaxed">
              {result.address}
              {result.city && result.state && (
                <>
                  <br />
                  {result.city}, {result.state} {result.zipCode}
                </>
              )}
            </div>
            <div className="text-sm text-gray-500 mt-1">{distance.toFixed(1)} miles away</div>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <span className="text-xl">💵</span>
          <div className="flex-1">
            <div className="text-base font-semibold text-gray-900">${result.monthlyFee}/month</div>
          </div>
        </div>

        {result.phone && (
          <div className="flex gap-3 items-start">
            <span className="text-xl">📞</span>
            <div className="flex-1">
              <a
                href={`tel:${result.phone}`}
                className="text-blue-600 no-underline text-sm"
                onClick={handlePhoneClick}
              >
                {result.phone}
              </a>
            </div>
          </div>
        )}

        {result.website && (
          <div className="flex gap-3 items-start">
            <span className="text-xl">🌐</span>
            <div className="flex-1">
              <a
                href={result.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 no-underline text-sm"
                onClick={handleWebsiteClick}
              >
                Visit Website
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="flex-1">
          <span className="text-gray-500 text-xs">
            Source: {result.dataSource?.source || 'Unknown'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClaimPractice}
            className="bg-emerald-500 text-white px-4 py-2 rounded border-none text-sm font-semibold cursor-pointer whitespace-nowrap"
          >
            🏥 Claim Practice
          </button>
          <button
            type="button"
            onClick={handleViewDetails}
            className="bg-blue-600 text-white px-6 py-2 rounded border-none text-sm font-semibold cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

