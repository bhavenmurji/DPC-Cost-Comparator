import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProgress() {
  try {
    const total = await prisma.dPCProvider.count()

    const enriched = await prisma.dPCProvider.count({
      where: {
        NOT: {
          name: {
            startsWith: 'DPC Practice ',
          },
        },
      },
    })

    const placeholder = total - enriched
    const percentComplete = ((enriched / total) * 100).toFixed(2)

    const withPhone = await prisma.dPCProvider.count({
      where: {
        phone: {
          not: '',
        },
      },
    })

    const withWebsite = await prisma.dPCProvider.count({
      where: {
        website: {
          not: null,
        },
      },
    })

    console.log('\n=== DPC Provider Enrichment Progress ===\n')
    console.log(`Total providers: ${total}`)
    console.log(`Enriched: ${enriched} (${percentComplete}%)`)
    console.log(`Remaining: ${placeholder}`)
    console.log(`With phone: ${withPhone}`)
    console.log(`With website: ${withWebsite}`)

    // Estimate time remaining (2 seconds per provider)
    const remainingSeconds = placeholder * 2
    const remainingMinutes = Math.floor(remainingSeconds / 60)
    const remainingHours = Math.floor(remainingMinutes / 60)
    const mins = remainingMinutes % 60

    console.log(`\nEstimated time remaining: ${remainingHours}h ${mins}m`)

    // Get some sample enriched providers
    console.log('\n=== Sample Enriched Providers ===\n')
    const samples = await prisma.dPCProvider.findMany({
      where: {
        NOT: {
          name: {
            startsWith: 'DPC Practice ',
          },
        },
      },
      take: 5,
      select: {
        name: true,
        city: true,
        state: true,
        phone: true,
        website: true,
        specialties: true,
      },
    })

    samples.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`)
      console.log(`   Location: ${p.city}, ${p.state}`)
      console.log(`   Phone: ${p.phone || 'N/A'}`)
      console.log(`   Website: ${p.website || 'N/A'}`)
      console.log(`   Specialties: ${p.specialties.join(', ') || 'N/A'}`)
      console.log()
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProgress()
