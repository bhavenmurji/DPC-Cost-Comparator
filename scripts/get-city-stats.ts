import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getCityStats() {
  const cities = [
    'Los Angeles',
    'San Francisco',
    'San Diego',
    'New York',
    'Chicago',
  ]

  console.log('Provider counts by city:\n')

  for (const city of cities) {
    const count = await prisma.dPCProvider.count({
      where: {
        city: {
          contains: city,
          mode: 'insensitive',
        },
      },
    })

    const providers = await prisma.dPCProvider.findMany({
      where: {
        city: {
          contains: city,
          mode: 'insensitive',
        },
      },
      select: {
        name: true,
        city: true,
        state: true,
        monthlyFee: true,
      },
      take: 3,
    })

    console.log(`${city}: ${count} providers`)
    if (providers.length > 0) {
      console.log('  Examples:')
      providers.forEach((p) => {
        console.log(`    - ${p.name} (${p.city}, ${p.state}) - $${p.monthlyFee}/mo`)
      })
    }
    console.log('')
  }

  await prisma.$disconnect()
}

getCityStats()
