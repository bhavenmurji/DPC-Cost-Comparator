import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function monitorProgress() {
  try {
    // Get total providers
    const total = await prisma.dPCProvider.count()

    // Get providers with high quality scores (enriched)
    const enriched = await prisma.dPCProviderSource.count({
      where: {
        dataQualityScore: {
          gte: 50,
        },
      },
    })

    // Get average quality score
    const avgScore = await prisma.dPCProviderSource.aggregate({
      _avg: {
        dataQualityScore: true,
      },
    })

    // Get providers with real names (not "DPC Practice")
    const withNames = await prisma.dPCProvider.count({
      where: {
        name: {
          not: {
            startsWith: 'DPC Practice',
          },
        },
      },
    })

    // Get providers with phone numbers
    const withPhone = await prisma.dPCProvider.count({
      where: {
        phone: {
          not: '',
        },
      },
    })

    // Get providers with websites
    const withWebsite = await prisma.dPCProvider.count({
      where: {
        website: {
          not: null,
        },
      },
    })

    // Get providers with pricing
    const withPricing = await prisma.dPCProvider.count({
      where: {
        monthlyFee: {
          gt: 0,
        },
      },
    })

    // Get recently scraped (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentlyScraped = await prisma.dPCProviderSource.count({
      where: {
        lastScraped: {
          gte: oneHourAgo,
        },
      },
    })

    console.log('📊 DPC Provider Enrichment Progress\n')
    console.log(`Total Providers: ${total}`)
    console.log(`Enriched (Quality ≥50): ${enriched} (${Math.round((enriched / total) * 100)}%)`)
    console.log(`Average Quality Score: ${avgScore._avg.dataQualityScore?.toFixed(1) || 'N/A'}`)
    console.log(`\nData Completeness:`)
    console.log(`  With Real Names: ${withNames} (${Math.round((withNames / total) * 100)}%)`)
    console.log(`  With Phone: ${withPhone} (${Math.round((withPhone / total) * 100)}%)`)
    console.log(`  With Website: ${withWebsite} (${Math.round((withWebsite / total) * 100)}%)`)
    console.log(`  With Pricing: ${withPricing} (${Math.round((withPricing / total) * 100)}%)`)
    console.log(`\nScraped in last hour: ${recentlyScraped}`)

    // Sample of recently enriched providers
    const recentProviders = await prisma.dPCProvider.findMany({
      where: {
        providerSource: {
          lastScraped: {
            gte: oneHourAgo,
          },
        },
      },
      include: {
        providerSource: true,
      },
      take: 5,
      orderBy: {
        providerSource: {
          lastScraped: 'desc',
        },
      },
    })

    if (recentProviders.length > 0) {
      console.log('\n📋 Recently Enriched Providers:')
      for (const provider of recentProviders) {
        console.log(
          `  • ${provider.name} - ${provider.city}, ${provider.state} (Score: ${provider.providerSource?.dataQualityScore})`
        )
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

monitorProgress()
