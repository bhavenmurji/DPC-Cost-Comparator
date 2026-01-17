interface CityHeroProps {
  city: string
  providerCount: number
  avgMonthlyFee: number
  onFindProviders: () => void
  onCalculateCosts: () => void
}

export default function CityHero({
  city,
  providerCount,
  avgMonthlyFee,
  onFindProviders,
  onCalculateCosts,
}: CityHeroProps) {
  const displayCount = providerCount > 0 ? providerCount : '40+'
  const displayFee = avgMonthlyFee > 0 ? `$${avgMonthlyFee}` : '$165'

  return (
    <section className="bg-gradient-to-br from-emerald-600 to-teal-700 py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Skip the insurance. See a doctor.
        </h1>
        <p className="text-xl md:text-2xl text-emerald-100 mb-6">
          {displayCount} {city} doctors. {displayFee}/month. No copays, no surprise bills.
        </p>
        <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
          Direct Primary Care means you pay your doctor directly—like a gym membership for healthcare.
          Text them at 10pm. Get seen tomorrow. Actually know what things cost.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="button"
            onClick={onFindProviders}
            className="bg-white text-emerald-700 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition-colors shadow-lg"
          >
            Find {city} Providers
          </button>
          <button
            type="button"
            onClick={onCalculateCosts}
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Calculate My Costs
          </button>
        </div>
      </div>
    </section>
  )
}
