interface CityStatsProps {
  providerCount: number
  avgMonthlyFee: number
  estimatedSavings: number
}

export default function CityStats({
  providerCount,
  avgMonthlyFee,
  estimatedSavings,
}: CityStatsProps) {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-xl bg-emerald-50">
            <div className="text-3xl md:text-4xl font-bold text-emerald-700">
              {providerCount > 0 ? `${providerCount}+` : '...'}
            </div>
            <div className="text-gray-600 mt-1">DPC Providers</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-emerald-50">
            <div className="text-3xl md:text-4xl font-bold text-emerald-700">
              {avgMonthlyFee > 0 ? `$${avgMonthlyFee}` : '...'}
            </div>
            <div className="text-gray-600 mt-1">Avg Monthly Fee</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-emerald-50">
            <div className="text-3xl md:text-4xl font-bold text-emerald-700">
              {estimatedSavings > 0 ? `$${estimatedSavings.toLocaleString()}+` : '...'}
            </div>
            <div className="text-gray-600 mt-1">Annual Savings</div>
          </div>
          <div className="text-center p-6 rounded-xl bg-emerald-50">
            <div className="text-3xl md:text-4xl font-bold text-emerald-700">Same Day</div>
            <div className="text-gray-600 mt-1">Appointments</div>
          </div>
        </div>
      </div>
    </section>
  )
}
