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
  // ========== DPC Frontier Scraped 2026-01-15 ==========
  {
    // Quill Health DPC - Las Vegas, NV
    practiceName: 'Quill Health DPC',
    website: 'https://www.quillhealthdpc.com',
    city: 'Las Vegas',
    state: 'NV',
    address: '2851 N Tenaya Way, Ste. 203',
    zipCode: '89128',
    phone: '702-886-1292',
    pricing: {
      individualMonthly: 85, // 19-64 years
      childMonthly: 45, // 6-18 years
      familyMonthly: 245,
      enrollmentFee: 100, // $150 for family
      pricingTiers: [
        { label: '6-18 years', monthlyFee: 45, ageMin: 6, ageMax: 18 },
        { label: '19-64 years', monthlyFee: 85, ageMin: 19, ageMax: 64 },
        { label: '65+ years', monthlyFee: 105, ageMin: 65, ageMax: 99 },
        { label: 'Family Plan (2 adults, 2 children)', monthlyFee: 245 },
      ],
      pricingNotes: 'Family enrollment fee $150. Additional child $30/mo.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Karismed Family Medicine - Katy, TX
    practiceName: 'Karismed Family Medicine',
    website: 'https://www.karismed.com',
    city: 'Katy',
    state: 'TX',
    address: '4011 FM 1463, Suite B',
    zipCode: '77494',
    phone: '(832) 930-7799',
    pricing: {
      individualMonthly: 99, // Adult 18+
      childMonthly: 30, // 0-18
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Child (0-18)', monthlyFee: 30, ageMin: 0, ageMax: 18 },
        { label: 'Adult (18+)', monthlyFee: 99, ageMin: 18, ageMax: 99 },
      ],
      pricingNotes: 'Family Medicine. Open since 2018.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Vitality Family Health - Oak Brook, IL
    practiceName: 'Vitality Family Health',
    website: 'https://www.vitalityfamilyhealth.com',
    city: 'Oak Brook',
    state: 'IL',
    address: '2809 Butterfield Rd, Ste. 340',
    zipCode: '60523',
    phone: '630-948-3300',
    pricing: {
      individualMonthly: 150, // Adult Maintenance
      childMonthly: 75, // Pediatric first child
      familyMonthly: null,
      enrollmentFee: 100, // Per family
      pricingTiers: [
        { label: 'Adult Maintenance (4 visits/year)', monthlyFee: 150 },
        { label: 'Adult Restorative (unlimited)', monthlyFee: 250 },
        { label: 'Adult Hormone Optimization', monthlyFee: 350 },
        { label: 'Pediatric (first child)', monthlyFee: 75 },
        { label: 'Pediatric (additional child)', monthlyFee: 50 },
      ],
      pricingNotes: 'Integrative/Functional DPC. 10% discount for annual prepay.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Dr. Edward Boland, MD - Augusta, GA
    practiceName: 'Dr. Edward Boland, MD',
    website: 'http://drboland.org',
    city: 'Augusta',
    state: 'GA',
    address: '119 Davis Rd, Ste. 4A',
    zipCode: '30907',
    phone: '760-504-9321',
    pricing: {
      individualMonthly: 50, // 30-49
      childMonthly: 35, // 0-18
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Ages 0-18', monthlyFee: 35, ageMin: 0, ageMax: 18 },
        { label: 'Ages 19-29', monthlyFee: 40, ageMin: 19, ageMax: 29 },
        { label: 'Ages 30-49', monthlyFee: 50, ageMin: 30, ageMax: 49 },
        { label: 'Ages 50-64', monthlyFee: 60, ageMin: 50, ageMax: 64 },
        { label: 'Ages 65+', monthlyFee: 70, ageMin: 65, ageMax: 99 },
      ],
      pricingNotes: 'Very affordable DPC. Open since 2019.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Direct Primary Care - Spokane, WA
    practiceName: 'Direct Primary Care Spokane',
    website: 'https://mydpcclinic.com',
    city: 'Spokane',
    state: 'WA',
    address: '212 E Central Ave, Ste. 360',
    zipCode: '99207',
    phone: '509-553-0565',
    pricing: {
      individualMonthly: 49, // 27-39
      childMonthly: 29, // 0-26
      familyMonthly: null,
      enrollmentFee: 100,
      pricingTiers: [
        { label: 'Ages 0-26', monthlyFee: 29, ageMin: 0, ageMax: 26 },
        { label: 'Ages 27-39', monthlyFee: 49, ageMin: 27, ageMax: 39 },
        { label: 'Ages 40-59', monthlyFee: 79, ageMin: 40, ageMax: 59 },
        { label: 'Ages 60-64', monthlyFee: 109, ageMin: 60, ageMax: 64 },
      ],
      pricingNotes: 'Pure DPC. At-cost labs, imaging, and in-house medications.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Midnight Sun Family Medicine - Fairbanks, AK
    practiceName: 'Midnight Sun Family Medicine',
    website: 'http://www.msfm.online',
    city: 'Fairbanks',
    state: 'AK',
    address: '4474 Pikes Landing Rd',
    zipCode: '99709',
    phone: '907-455-7123',
    pricing: {
      individualMonthly: 150,
      childMonthly: null,
      familyMonthly: 300,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Individual', monthlyFee: 150 },
        { label: 'Couple', monthlyFee: 225 },
        { label: 'Family', monthlyFee: 300 },
      ],
      pricingNotes: "Fairbanks' first DPC clinic. Open since 2017. Annual/biannual/quarterly payment options.",
      pricingConfidence: 'high' as const,
    },
  },
  {
    // The Doctor's Office at 83 S. Main - Lexington, TN
    practiceName: "The Doctor's Office at 83 S. Main",
    website: 'https://www.thedoctorsoffice.me',
    city: 'Lexington',
    state: 'TN',
    address: '83 S Main St',
    zipCode: '38351',
    phone: '731-798-5056',
    pricing: {
      individualMonthly: 50,
      childMonthly: 25,
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Adult', monthlyFee: 50 },
        { label: 'Child', monthlyFee: 25 },
        { label: 'Child (with adult parent)', monthlyFee: 10 },
      ],
      pricingNotes: 'Very affordable rural DPC. Family Medicine. Open since 2018.',
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
            address: (data as any).address || 'Website Scraped',
            city: (data as any).city || 'Unknown',
            state: (data as any).state || 'Unknown',
            zipCode: (data as any).zipCode || '00000',
            phone: (data as any).phone || 'Unknown',
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
