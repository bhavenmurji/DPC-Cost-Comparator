import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProviders() {
  try {
    // Get total count
    const totalCount = await prisma.dPCProvider.count()
    console.log(`Total providers in database: ${totalCount}`)

    // Get sample providers with their IDs
    const sampleProviders = await prisma.dPCProvider.findMany({
      select: {
        id: true,
        name: true,
        practiceName: true,
        city: true,
        state: true,
        phone: true,
        website: true,
        monthlyFee: true,
      },
      take: 10,
    })

    console.log('\nSample providers:')
    console.log(JSON.stringify(sampleProviders, null, 2))

    // Check provider source data
    const sourcesCount = await prisma.dPCProviderSource.count()
    console.log(`\nProvider sources tracked: ${sourcesCount}`)

    const sampleSources = await prisma.dPCProviderSource.findMany({
      select: {
        providerId: true,
        source: true,
        sourceUrl: true,
        sourceId: true,
        dataQualityScore: true,
      },
      take: 5,
    })

    console.log('\nSample sources:')
    console.log(JSON.stringify(sampleSources, null, 2))
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProviders()
