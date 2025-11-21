import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDPCData() {
  try {
    // Count total providers
    const totalCount = await prisma.dPCProvider.count()
    console.log('Total providers:', totalCount)

    // Count providers with placeholder data
    const placeholderNames = await prisma.dPCProvider.count({
      where: {
        name: {
          startsWith: 'DPC Practice ',
        },
      },
    })
    console.log('Providers with placeholder names:', placeholderNames)

    // Count providers missing key data
    const missingAddress = await prisma.dPCProvider.count({
      where: {
        address: 'Address not available',
      },
    })
    console.log('Providers with missing addresses:', missingAddress)

    const missingPhone = await prisma.dPCProvider.count({
      where: {
        OR: [{ phone: null }, { phone: '' }],
      },
    })
    console.log('Providers with missing phones:', missingPhone)

    const missingWebsite = await prisma.dPCProvider.count({
      where: {
        website: null,
      },
    })
    console.log('Providers with missing websites:', missingWebsite)

    // Get sample providers
    console.log('\nSample providers:')
    const samples = await prisma.dPCProvider.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        phone: true,
        website: true,
        latitude: true,
        longitude: true,
      },
    })
    console.log(JSON.stringify(samples, null, 2))

    // Check data sources
    console.log('\nData sources:')
    const sources = await prisma.dPCProviderSource.groupBy({
      by: ['source'],
      _count: {
        source: true,
      },
    })
    console.log(JSON.stringify(sources, null, 2))
  } catch (error) {
    console.error('Error checking DPC data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDPCData()
