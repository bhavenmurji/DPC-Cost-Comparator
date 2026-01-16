#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check providers that were just scraped with no pricing
  const providers = await prisma.dPCProvider.findMany({
    where: { pricingConfidence: 'none' },
    select: { practiceName: true, website: true, name: true },
    take: 10,
  })

  console.log('Websites stored for scraped providers (no pricing found):')
  providers.forEach((p) =>
    console.log(`- ${p.practiceName || p.name}: ${p.website}`)
  )

  // Check providers that haven't been scraped yet
  const unscraped = await prisma.dPCProvider.findMany({
    where: {
      website: { not: null },
      pricingScrapedAt: null,
    },
    select: { practiceName: true, website: true, name: true },
    take: 10,
  })

  console.log('\nProviders with websites not yet scraped:')
  unscraped.forEach((p) =>
    console.log(`- ${p.practiceName || p.name}: ${p.website}`)
  )

  await prisma.$disconnect()
}

main().catch(console.error)
