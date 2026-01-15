#!/usr/bin/env npx tsx
/**
 * Save Scraped DPC Pricing Data
 *
 * Saves manually collected pricing data from DPC practice websites
 * to the database. Run this after manual scraping sessions.
 *
 * Usage:
 *   npx tsx scripts/save-scraped-pricing.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Pricing data scraped on 2026-01-15
const scrapedPricing = [
  {
    // Plum Health DPC - Detroit, MI
    practiceName: 'Plum Health DPC',
    website: 'https://plumhealthdpc.com',
    pricing: {
      individualMonthly: 85,
      childMonthly: null, // Not specified
      familyMonthly: 240,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Single Member', monthlyFee: 85 },
        { label: 'Member + Spouse/Child', monthlyFee: 160 },
        { label: 'Family', monthlyFee: 240 },
      ],
      pricingNotes: 'Labs: $6-$45, Medications: $0.02-$0.10/pill',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // PartnerMD - VA, MD, GA, SC
    practiceName: 'PartnerMD',
    website: 'https://www.partnermd.com',
    pricing: {
      individualMonthly: 217,
      childMonthly: null, // Young adult pricing available
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Adult (26+)', monthlyFee: 217 },
        { label: 'Young Adult (16-25)', monthlyFee: null }, // Need to check
      ],
      pricingNotes: 'Concierge medicine hybrid. 30-day cancellation policy.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Greenlake Primary Care - Seattle, WA
    practiceName: 'Greenlake Primary Care',
    website: 'https://greenlakeprimarycare.com',
    pricing: {
      individualMonthly: 150, // 27+
      childMonthly: 100, // 0-26
      familyMonthly: null, // Family discounts available
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Ages 0-26', monthlyFee: 100, ageMin: 0, ageMax: 26 },
        { label: 'Ages 27+', monthlyFee: 150, ageMin: 27, ageMax: 99 },
      ],
      pricingNotes: 'Family discounts depend on plan. Medicare patients have reduced fee.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // MDDPC - National
    practiceName: 'MDDPC',
    website: 'https://www.mddpc.com',
    pricing: {
      individualMonthly: 45, // Tier 1 base
      childMonthly: null,
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Tier 1 (6 visits/year)', monthlyFee: 45 },
        { label: 'Tier 1 Enhanced (8 visits/year)', monthlyFee: 60 },
        { label: 'Tier 2 (10 visits/year)', monthlyFee: 72 },
        { label: 'Tier 2 Enhanced (12 visits/year)', monthlyFee: 85 },
        { label: 'Tier 3 Weight Management', monthlyFee: 245 },
      ],
      pricingNotes: 'Visit-based tiers instead of unlimited. Tier 3 includes GLP-1 medication.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Culver Pediatrics Center - Culver, IN
    practiceName: 'Culver Pediatrics Center',
    website: 'https://culverpediatrics.com',
    pricing: {
      individualMonthly: 250, // Per patient
      childMonthly: 250, // Same price
      familyMonthly: null,
      enrollmentFee: 1000, // $1,250 first month includes $1000 onboarding + $250 first month
      pricingTiers: null,
      pricingNotes:
        'Specialty pediatric DPC. First month $1,250 (includes onboarding). PANDAS/PANS clinic available.',
      pricingConfidence: 'high' as const,
    },
  },
]

async function saveScrapedPricing() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Saving Scraped DPC Pricing Data')
  console.log('═══════════════════════════════════════════════════════\n')

  let saved = 0
  let notFound = 0
  let errors = 0

  for (const data of scrapedPricing) {
    try {
      // Try to find provider by practice name
      let provider = await prisma.dPCProvider.findFirst({
        where: {
          OR: [
            { practiceName: { contains: data.practiceName, mode: 'insensitive' } },
            { name: { contains: data.practiceName, mode: 'insensitive' } },
            { website: { contains: new URL(data.website).hostname, mode: 'insensitive' } },
          ],
        },
      })

      if (!provider) {
        // Create new provider record if not found
        console.log(`  Creating new provider: ${data.practiceName}`)
        provider = await prisma.dPCProvider.create({
          data: {
            name: data.practiceName,
            practiceName: data.practiceName,
            website: data.website,
            address: 'Website Scraped',
            city: 'Unknown',
            state: 'Unknown',
            zipCode: '00000',
            phone: 'Unknown',
            monthlyFee: data.pricing.individualMonthly || 0,
            childMonthlyFee: data.pricing.childMonthly,
            familyFee: data.pricing.familyMonthly,
            enrollmentFee: data.pricing.enrollmentFee,
            pricingTiers: data.pricing.pricingTiers
              ? JSON.stringify(data.pricing.pricingTiers)
              : null,
            pricingNotes: data.pricing.pricingNotes,
            pricingConfidence: data.pricing.pricingConfidence,
            pricingScrapedAt: new Date(),
            servicesIncluded: [],
          },
        })
        saved++
        console.log(`  ✓ Created: ${data.practiceName} - $${data.pricing.individualMonthly}/mo`)
        continue
      }

      // Update existing provider
      await prisma.dPCProvider.update({
        where: { id: provider.id },
        data: {
          website: data.website,
          monthlyFee: data.pricing.individualMonthly || provider.monthlyFee,
          childMonthlyFee: data.pricing.childMonthly,
          familyFee: data.pricing.familyMonthly,
          enrollmentFee: data.pricing.enrollmentFee,
          pricingTiers: data.pricing.pricingTiers
            ? JSON.stringify(data.pricing.pricingTiers)
            : null,
          pricingNotes: data.pricing.pricingNotes,
          pricingConfidence: data.pricing.pricingConfidence,
          pricingScrapedAt: new Date(),
        },
      })

      saved++
      console.log(
        `  ✓ Updated: ${data.practiceName} - $${data.pricing.individualMonthly}/mo`
      )
    } catch (error) {
      errors++
      console.log(`  ✗ Error saving ${data.practiceName}:`, error)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log(`  Complete: ${saved} saved, ${notFound} not found, ${errors} errors`)
  console.log('═══════════════════════════════════════════════════════\n')

  // Show summary of providers with pricing
  const withPricing = await prisma.dPCProvider.count({
    where: {
      monthlyFee: { gt: 0 },
      pricingConfidence: { not: null },
    },
  })

  const total = await prisma.dPCProvider.count()

  console.log(`  Providers with scraped pricing: ${withPricing}/${total}`)

  await prisma.$disconnect()
}

saveScrapedPricing().catch(console.error)
