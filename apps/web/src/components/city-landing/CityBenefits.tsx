import { PhoneIcon, CalendarIcon, MoneyIcon, ClockIcon } from '../icons/healthicons'

const defaultBenefits = [
  {
    icon: PhoneIcon,
    title: 'Text your doctor',
    description: 'Rash at 9pm? Text a photo. Question about meds? Just ask. No portal, no wait.',
  },
  {
    icon: CalendarIcon,
    title: 'Same-day visits',
    description: 'Sick today? Get seen today. Most DPC doctors keep slots open for urgent needs.',
  },
  {
    icon: MoneyIcon,
    title: 'Know the price',
    description: '$165/month covers everything. Labs, stitches, physicals—no surprise bills showing up later.',
  },
  {
    icon: ClockIcon,
    title: '30+ minute visits',
    description: "Your doctor isn't rushing to the next patient. You get the time you actually need.",
  },
]

interface Benefit {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  description: string
}

interface CityBenefitsProps {
  benefits?: Benefit[]
  title?: string
}

export default function CityBenefits({
  benefits = defaultBenefits,
  title = 'How it actually works',
}: CityBenefitsProps) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">{title}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 mb-4 text-emerald-600">
                <benefit.icon className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
