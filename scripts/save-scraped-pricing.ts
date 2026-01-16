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
  // ========== DPC Frontier Scraped 2026-01-16 (Batch 2) ==========
  {
    // Health and Healing DPC - Los Angeles, CA
    practiceName: 'Health and Healing DPC',
    website: 'https://healthandhealingdpc.com',
    city: 'Los Angeles',
    state: 'CA',
    address: '21400 Ventura Blvd, Suite A',
    zipCode: '91364',
    phone: '818-434-0660',
    pricing: {
      individualMonthly: 89, // >18
      childMonthly: 39, // 0-18
      familyMonthly: 199,
      enrollmentFee: 99,
      pricingTiers: [
        { label: '0-18 years', monthlyFee: 39, ageMin: 0, ageMax: 18 },
        { label: '18+ years', monthlyFee: 89, ageMin: 18, ageMax: 99 },
        { label: 'Family', monthlyFee: 199 },
      ],
      pricingNotes: 'Family Medicine. Open since 2019. Dr. Aimee Ostick, MD.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Island Direct Primary Care - Merritt Island, FL
    practiceName: 'Island Direct Primary Care',
    website: 'http://www.islanddirectprimarycare.com',
    city: 'Merritt Island',
    state: 'FL',
    address: '390 N Courtenay Pkwy',
    zipCode: '32953',
    phone: '321-392-6226',
    pricing: {
      individualMonthly: 125, // Adults 20+
      childMonthly: null,
      familyMonthly: 250, // Family of 3
      enrollmentFee: 50,
      pricingTiers: [
        { label: 'Adults 20+', monthlyFee: 125, ageMin: 20, ageMax: 99 },
        { label: 'Adult + 1 Infant (0-2)', monthlyFee: 200 },
        { label: 'Adult + 1 Youth (3-19)', monthlyFee: 175 },
        { label: 'Adult Couple', monthlyFee: 200 },
        { label: 'Family of 3', monthlyFee: 250 },
      ],
      pricingNotes: 'Family Medicine. John Rothwell, DNP/APRN. Open since 2019.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Dr Cranney Family Medicine - Spokane, WA
    practiceName: 'Dr Cranney Family Medicine',
    website: 'http://www.drcranney.com',
    city: 'Spokane',
    state: 'WA',
    address: '2020 E 29th Ave, Ste. 235',
    zipCode: '99203',
    phone: '509-673-7221',
    pricing: {
      individualMonthly: 85, // 30-59
      childMonthly: 55, // 0-29
      familyMonthly: 220, // 2 adults + 2 children
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Ages 0-29', monthlyFee: 55, ageMin: 0, ageMax: 29 },
        { label: 'Ages 30-59', monthlyFee: 85, ageMin: 30, ageMax: 59 },
        { label: 'Ages 60+', monthlyFee: 115, ageMin: 60, ageMax: 99 },
        { label: 'Family (2 adults + 2 children)', monthlyFee: 220 },
      ],
      pricingNotes: 'Veteran owned. DPC Alliance member. Open since 2019.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Bozeman Primary Care - Bozeman, MT
    practiceName: 'Bozeman Primary Care',
    website: 'http://www.bozemanprimarycare.com',
    city: 'Bozeman',
    state: 'MT',
    address: '4535 Valley Commons Drive, Ste. 104',
    zipCode: '59718',
    phone: '406-404-1525',
    pricing: {
      individualMonthly: 99, // Adults >19
      childMonthly: 49, // Children <20
      familyMonthly: 299, // Family >4
      enrollmentFee: 99,
      pricingTiers: [
        { label: 'Children <20', monthlyFee: 49, ageMin: 0, ageMax: 19 },
        { label: 'Adults >19', monthlyFee: 99, ageMin: 20, ageMax: 99 },
        { label: 'Spouse/partner', monthlyFee: 79 },
        { label: 'Family >4', monthlyFee: 299 },
      ],
      pricingNotes: 'Hybrid DPC model. Open since 2019.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Bebout Family Medicine - Morganfield, KY
    practiceName: 'Bebout Family Medicine',
    website: 'http://beboutfamilymedicine.com',
    city: 'Morganfield',
    state: 'KY',
    address: '332 N Court St',
    zipCode: '42437',
    phone: '270-997-4040',
    pricing: {
      individualMonthly: 50, // 20-44
      childMonthly: 35, // 0-19
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Ages 0-19', monthlyFee: 35, ageMin: 0, ageMax: 19 },
        { label: 'Ages 20-44', monthlyFee: 50, ageMin: 20, ageMax: 44 },
        { label: 'Ages 45-64', monthlyFee: 75, ageMin: 45, ageMax: 64 },
        { label: 'Ages 65+', monthlyFee: 100, ageMin: 65, ageMax: 99 },
      ],
      pricingNotes: 'Very affordable rural DPC. William Bebout, MD. Open since 2019.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // MK Medical - Las Vegas, NV
    practiceName: 'MK Medical',
    website: 'http://www.mkmedicalcare.com',
    city: 'Las Vegas',
    state: 'NV',
    address: '2931 N Tenaya Way, Ste. 102',
    zipCode: '89128',
    phone: '702-538-8960',
    pricing: {
      individualMonthly: 147, // Adults 18+
      childMonthly: 47, // With paying adult
      familyMonthly: 297, // Family of 4
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Prime members (18+)', monthlyFee: 147, ageMin: 18, ageMax: 99 },
        { label: 'Children with paying adult', monthlyFee: 47, ageMin: 13, ageMax: 17 },
        { label: 'Family of 4', monthlyFee: 297 },
      ],
      pricingNotes: 'Internal Medicine. Ages 13+. Open since 2018. Testosterone replacement $100/mo extra.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Morningstar Medical DPC - Hull, IA
    practiceName: 'Morningstar Medical DPC',
    website: 'http://www.morningstarmedicaldpc.com',
    city: 'Hull',
    state: 'IA',
    address: '307 Commerce St., Ste E',
    zipCode: '51239',
    phone: '712-550-0246',
    pricing: {
      individualMonthly: 50, // 20-44
      childMonthly: 10, // 0-19 (incredibly low!)
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: '0-19', monthlyFee: 10, ageMin: 0, ageMax: 19 },
        { label: '20-44', monthlyFee: 50, ageMin: 20, ageMax: 44 },
        { label: '45-64', monthlyFee: 75, ageMin: 45, ageMax: 64 },
        { label: '64+', monthlyFee: 100, ageMin: 64, ageMax: 99 },
      ],
      pricingNotes: "Siouxland's First DPC! Dr. Lyndle Shelby, MD. Incredibly affordable - $10/mo for children!",
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Avalon Health, Inc. - Savannah, GA
    practiceName: 'Avalon Health, Inc.',
    website: 'http://www.avalonhealth.care',
    city: 'Savannah',
    state: 'GA',
    address: '5105 Paulsen St, Ste 141B',
    zipCode: '31405',
    phone: '912-999-8899',
    pricing: {
      individualMonthly: 75, // 18+
      childMonthly: null, // Adults only
      familyMonthly: null,
      enrollmentFee: 100,
      pricingTiers: [
        { label: 'Ages 18+', monthlyFee: 75, ageMin: 18, ageMax: 99 },
      ],
      pricingNotes: 'Internal Medicine. 18+ only. Includes yearly physical with Pap, unlimited visits, comprehensive labs. Open since 2017.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Mperial Health - Minneapolis, MN
    practiceName: 'Mperial Health',
    website: 'http://mperialhealth.com',
    city: 'Minneapolis',
    state: 'MN',
    address: '7550 France Ave S',
    zipCode: '55435',
    phone: '(612) 517-7716',
    pricing: {
      individualMonthly: 150,
      childMonthly: null,
      familyMonthly: null,
      enrollmentFee: null,
      pricingTiers: [
        { label: 'Individual Membership', monthlyFee: 150 },
      ],
      pricingNotes: 'Family Medicine. Dr. Mark Holder, MD. Open every day, all day. Established 2001.',
      pricingConfidence: 'high' as const,
    },
  },
  {
    // Endo4Life, PLLC - San Antonio, TX (Specialty DPC)
    practiceName: 'Endo4Life, PLLC',
    website: 'https://endo4life.com',
    city: 'San Antonio',
    state: 'TX',
    address: '15303 Huebner Rd, Ste. 15',
    zipCode: '78248',
    phone: '210-361-3738',
    pricing: {
      individualMonthly: 100, // Diabetes/weight management
      childMonthly: 50, // Non-diabetes endocrine
      familyMonthly: null,
      enrollmentFee: 250,
      pricingTiers: [
        { label: 'Diabetes mellitus or weight management', monthlyFee: 100 },
        { label: 'Endocrine management (non-diabetes, non-weight)', monthlyFee: 50 },
      ],
      pricingNotes: 'SPECIALTY DPC: Pediatric Endocrinology. Newborn to 26 years. Robert Ferry, MD. Open since 2018.',
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
