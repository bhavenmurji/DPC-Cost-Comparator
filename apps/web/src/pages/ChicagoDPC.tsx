import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { analytics } from '../utils/analytics'
import FeaturedProvidersSkeleton from '../components/FeaturedProvidersSkeleton'
import { useCityProviders } from '../hooks/useCityProviders'
import { CityHero, CityStats, CityBenefits } from '../components/city-landing'
import { CheckIcon } from '../components/icons/healthicons'

export default function ChicagoDPC() {
  const navigate = useNavigate()
  const { providers, stats, loading } = useCityProviders('60601', 50)

  useEffect(() => {
    analytics.trackPageView('/chicago-dpc')
  }, [])

  const handleSearchProviders = () => {
    navigate('/providers/search?zipCode=60601&state=IL')
  }

  const handleCalculateCosts = () => {
    navigate('/')
  }

  return (
    <div className="w-full bg-gray-50">
      <CityHero
        city="Chicago"
        providerCount={stats.providerCount}
        avgMonthlyFee={stats.avgMonthlyFee}
        onFindProviders={handleSearchProviders}
        onCalculateCosts={handleCalculateCosts}
      />

      <CityStats
        providerCount={stats.providerCount}
        avgMonthlyFee={stats.avgMonthlyFee}
        estimatedSavings={stats.estimatedSavings}
      />

      <CityBenefits />

      {/* Featured Providers */}
      {loading ? (
        <FeaturedProvidersSkeleton count={5} />
      ) : (
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Featured Chicago Providers
          </h2>
          {providers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {provider.name}
                  </h3>
                  {provider.npi && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold mb-2">
                      <CheckIcon className="w-3 h-3" /> NPI Verified
                    </span>
                  )}
                  <p className="text-sm text-gray-600 mb-3">
                    {provider.city}, {provider.state}
                  </p>
                  <p className="text-lg font-bold text-emerald-600 mb-2">
                    ${provider.monthlyFee}/month
                  </p>
                  <p className="text-sm mb-3">
                    {provider.acceptingPatients ? (
                      <span className="text-emerald-600 font-medium">Accepting Patients</span>
                    ) : (
                      <span className="text-red-500 font-medium">Waitlist</span>
                    )}
                  </p>
                  {provider.phone && (
                    <p className="text-sm text-gray-600 mb-4">{provider.phone}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate(`/providers/${provider.id}`)}
                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              Loading provider information...
            </p>
          )}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSearchProviders}
              className="bg-emerald-600 text-white py-3 px-8 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors"
            >
              View All Chicago Providers
            </button>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How DPC Works in Chicago
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              step: 1,
              title: 'Choose Your Provider',
              text: `Browse ${stats.providerCount > 0 ? `${stats.providerCount}+` : ''} DPC practices across Chicago and suburbs. Compare fees, neighborhoods, and family services.`,
            },
            {
              step: 2,
              title: 'Pay Monthly Membership',
              text: `Pay around ${stats.avgMonthlyFee > 0 ? `$${stats.avgMonthlyFee}` : '$165'}/month for unlimited primary care. No copays, no deductibles, no hidden fees.`,
            },
            {
              step: 3,
              title: 'Add Catastrophic Coverage',
              text: 'Pair with catastrophic insurance ($200-350/month) for hospital and specialist care.',
            },
            {
              step: 4,
              title: 'Enjoy Better Healthcare',
              text: 'Get same-day visits, text your doctor, and spend more time with your family instead of in waiting rooms.',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          DPC vs. Traditional Chicago Healthcare
        </h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {[
            { label: 'Wait Time', dpc: 'Same-day or next-day', traditional: '3-6 weeks average' },
            { label: 'Appointment Length', dpc: '30-60 minutes', traditional: '10-15 minutes' },
            { label: 'After-Hours Access', dpc: 'Text/call your doctor 24/7', traditional: 'Nurse hotline or ER' },
            { label: 'Annual Cost (Family of 4)', dpc: '$7,632 + catastrophic', traditional: '$12,000-18,000' },
          ].map((row, idx) => (
            <div
              key={row.label}
              className={`grid grid-cols-3 gap-4 p-4 ${idx !== 3 ? 'border-b border-gray-200' : ''}`}
            >
              <div className="font-semibold text-gray-900">{row.label}</div>
              <div className="text-emerald-600 font-medium">{row.dpc}</div>
              <div className="text-gray-500">{row.traditional}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Transform Your Healthcare?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join Chicago families who've discovered affordable, accessible primary care
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={handleCalculateCosts}
            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition-colors"
          >
            Calculate My Savings
          </button>
          <button
            type="button"
            onClick={handleSearchProviders}
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Find My Provider
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Chicago DPC Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: 'Is DPC legal in Illinois?',
              a: 'Yes! DPC is fully legal in Illinois. The state has clear regulations that recognize DPC as a valid healthcare delivery model.',
            },
            {
              q: 'Can my whole family use the same DPC provider?',
              a: 'Many Chicago DPC practices offer family memberships at discounted rates. One doctor can see your kids, spouse, and yourself.',
            },
            {
              q: 'Do Chicago DPC providers offer virtual visits?',
              a: "Yes! Most Chicago DPC practices offer telemedicine for minor issues, follow-ups, and urgent questions. Great for harsh Chicago winters.",
            },
            {
              q: 'What if I need a specialist or hospital care?',
              a: "Your DPC doctor will coordinate specialist referrals and help you navigate Chicago's healthcare system. Pair DPC with catastrophic insurance for full coverage.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
