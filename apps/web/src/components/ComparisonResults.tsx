interface ComparisonResultsProps {
  results: {
    traditionalTotalAnnual: number
    dpcTotalAnnual: number
    annualSavings: number
    percentageSavings: number
    recommendedPlan: string
    breakdown: {
      traditional: CostBreakdown
      dpc: CostBreakdown
    }
    dataSource?: {
      traditional: 'api' | 'estimate'
      catastrophic: 'api' | 'estimate'
      lastUpdated?: string
      marketplaceType?: 'federal' | 'state-based' | 'state-based-federal-platform'
      marketplaceName?: string
      apiUnavailableReason?: string
    }
  }
  providers?: Array<{
    provider: {
      name: string
      practiceName: string
      city: string
      state: string
      monthlyFee: number
      rating?: number
      phone: string
      website?: string
    }
    distanceMiles: number
    matchScore: number
    matchReasons: string[]
  }>
}

interface CostBreakdown {
  premiums: number
  deductible: number
  copays: number
  prescriptions: number
  outOfPocket: number
  total: number
}

export default function ComparisonResults({ results, providers }: ComparisonResultsProps) {
  const savings = results.annualSavings
  const isDPCBetter = results.recommendedPlan === 'DPC_CATASTROPHIC'
  const dataSource = results.dataSource
  const isUsingEstimates = dataSource && (dataSource.traditional === 'estimate' || dataSource.catastrophic === 'estimate')

  return (
    <div className="max-w-screen-xl mx-auto p-8">
      {/* Data Source Transparency Banner */}
      {dataSource && isUsingEstimates && (
        <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 mb-8">
          <div className="flex gap-4 items-start">
            <span className="text-3xl flex-shrink-0">ℹ️</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">Data Source Information</h4>
              {dataSource.marketplaceType === 'state-based' && (
                <p className="text-sm text-blue-900 leading-relaxed mb-4">
                  <strong>{dataSource.marketplaceName}</strong> operates a state-based health insurance marketplace.
                  Insurance premium estimates shown are based on typical plans.
                  For official pricing, visit your state marketplace website.
                </p>
              )}
              {dataSource.marketplaceType === 'federal' && (
                <p className="text-sm text-blue-900 leading-relaxed mb-4">
                  Using estimated insurance premiums. Connect to Healthcare.gov API for real-time plan pricing.
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <span className="bg-white border border-blue-500 text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                  📊 Traditional: <strong>{dataSource.traditional === 'api' ? 'Real API Data' : 'Estimate'}</strong>
                </span>
                <span className="bg-white border border-blue-500 text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                  🏥 Catastrophic: <strong>{dataSource.catastrophic === 'api' ? 'Real API Data' : 'Estimate'}</strong>
                </span>
                {providers && providers.length > 0 && (
                  <span className="bg-white border border-blue-500 text-blue-800 px-3 py-2 rounded-md text-sm font-medium">
                    ✅ Providers: <strong>Real Database Data</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className={`${isDPCBetter ? 'bg-emerald-500' : 'bg-amber-500'} text-white p-8 rounded-lg text-center mb-8`}>
        <h2 className="text-2xl font-bold mb-2">
          {isDPCBetter ? '💰 You Could Save!' : '⚠️ Higher Cost'}
        </h2>
        <div className="text-5xl font-bold mb-2">
          ${Math.abs(savings).toLocaleString()}/year
        </div>
        <p className="text-lg opacity-90">
          {isDPCBetter
            ? `By switching to DPC + Catastrophic coverage, you could save ${results.percentageSavings.toFixed(1)}% annually`
            : `Traditional insurance appears to be ${Math.abs(results.percentageSavings).toFixed(1)}% cheaper for your situation`}
        </p>
      </div>

      {/* Cost Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Traditional Insurance</h3>
          <div className="text-4xl font-bold text-gray-900 mb-6">
            ${results.traditionalTotalAnnual.toLocaleString()}
            <span className="text-base text-gray-500 font-normal">/year</span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between py-2 text-sm">
              <span>Monthly Premium</span>
              <span>${(results.breakdown.traditional.premiums / 12).toFixed(0)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Annual Deductible</span>
              <span>${results.breakdown.traditional.deductible.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Copays</span>
              <span>${results.breakdown.traditional.copays.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Prescriptions</span>
              <span>${results.breakdown.traditional.prescriptions.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`bg-white border-2 ${isDPCBetter ? 'border-emerald-500 shadow-emerald-100 shadow-lg' : 'border-gray-200'} rounded-lg p-6`}>
          <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
            DPC + Catastrophic
            {isDPCBetter && <span className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-full font-medium">Recommended</span>}
          </h3>
          <div className="text-4xl font-bold text-gray-900 mb-6">
            ${results.dpcTotalAnnual.toLocaleString()}
            <span className="text-base text-gray-500 font-normal">/year</span>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between py-2 text-sm">
              <span>DPC Monthly Fee</span>
              <span>${(results.breakdown.dpc.premiums / 12).toFixed(0)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Catastrophic Premium</span>
              <span>${((results.dpcTotalAnnual - results.breakdown.dpc.premiums - results.breakdown.dpc.prescriptions) / 12).toFixed(0)}/mo</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Deductible</span>
              <span>${results.breakdown.dpc.deductible.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span>Prescriptions</span>
              <span>${results.breakdown.dpc.prescriptions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DPC Benefits */}
      <div className="bg-green-50 border border-green-300 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-green-800 mb-4">Benefits of DPC</h3>
        <ul className="list-none p-0 m-0 space-y-1">
          <li>Unlimited primary care visits - no copays</li>
          <li>Same-day or next-day appointments</li>
          <li>24/7 direct access to your doctor via phone/text</li>
          <li>Longer appointment times (30-60 minutes)</li>
          <li>Wholesale prescription pricing</li>
          <li>Basic lab work included</li>
        </ul>
      </div>

      {/* Provider Matches */}
      {providers && providers.length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-6">Recommended DPC Providers Near You</h3>
          <div className="flex flex-col gap-4">
            {providers.map((match, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-semibold mb-1">{match.provider.name}</h4>
                    <p className="text-gray-500 m-0">{match.provider.practiceName}</p>
                  </div>
                  <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {match.matchScore}% Match
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>📍 {match.distanceMiles.toFixed(1)} miles away</span>
                    <span>💵 ${match.provider.monthlyFee}/month</span>
                    {match.provider.rating && (
                      <span>⭐ {match.provider.rating.toFixed(1)}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {match.matchReasons.slice(0, 3).map((reason, i) => (
                      <span key={i} className="text-sm text-emerald-600">✓ {reason}</span>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <a href={`tel:${match.provider.phone}`} className="px-4 py-2 bg-blue-600 text-white no-underline rounded text-sm font-medium">
                      📞 {match.provider.phone}
                    </a>
                    {match.provider.website && (
                      <a
                        href={match.provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-500 text-white no-underline rounded text-sm font-medium"
                      >
                        🌐 Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

