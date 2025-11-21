import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCoordinates() {
  const withCoords = await prisma.dPCProvider.count({
    where: {
      state: 'CA',
      latitude: { not: null },
      longitude: { not: null },
    },
  })

  const withoutCoords = await prisma.dPCProvider.count({
    where: {
      state: 'CA',
      OR: [{ latitude: null }, { longitude: null }],
    },
  })

  const total = await prisma.dPCProvider.count({ where: { state: 'CA' } })

  console.log('Total CA providers:', total)
  console.log('CA providers WITH coordinates:', withCoords)
  console.log('CA providers WITHOUT coordinates:', withoutCoords)

  // Sample a few providers to see their data
  const samples = await prisma.dPCProvider.findMany({
    where: { state: 'CA' },
    select: {
      id: true,
      practiceName: true,
      city: true,
      zipCode: true,
      latitude: true,
      longitude: true,
      acceptingPatients: true,
    },
    take: 5,
  })

  console.log('\nSample CA providers:')
  samples.forEach((p) => {
    console.log(`- ${p.practiceName} (${p.city}, ${p.zipCode})`)
    console.log(`  Coords: ${p.latitude}, ${p.longitude}`)
    console.log(`  Accepting: ${p.acceptingPatients}`)
  })

  await prisma.$disconnect()
}

checkCoordinates()
