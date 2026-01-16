#!/usr/bin/env npx tsx
/**
 * Bulk DPC Frontier Pricing Scraper
 *
 * Scrapes all practices from DPC Frontier mapper and extracts pricing data.
 * Uses Playwright to handle JavaScript-rendered pages.
 *
 * Usage:
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts              # Scrape all
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts --limit 100  # Limit to 100
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts --offset 500 # Start from 500
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts --report     # Show stats only
 */

import { PrismaClient } from '@prisma/client'
import { chromium, Browser, Page } from 'playwright'

const prisma = new PrismaClient()

const args = process.argv.slice(2)
const limit = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1]) || 100
  : undefined
const offset = args.includes('--offset')
  ? parseInt(args[args.indexOf('--offset') + 1]) || 0
  : 0
const reportOnly = args.includes('--report')

interface PracticeData {
  id: string
  name: string
  website: string | null
  city: string
  state: string
  address: string
  zipCode: string
  phone: string
  specialty: string
  pricing: {
    individualMonthly: number | null
    childMonthly: number | null
    familyMonthly: number | null
    enrollmentFee: number | null
    perVisitFee: number | null
    pricingTiers: Array<{
      label: string
      monthlyFee: number
      ageMin?: number
      ageMax?: number
    }> | null
    pricingNotes: string | null
    pricingConfidence: 'high' | 'medium' | 'low' | 'none'
  }
}

async function getPracticeIds(page: Page): Promise<string[]> {
  await page.goto('https://mapper.dpcfrontier.com', { waitUntil: 'networkidle' })

  const ids = await page.evaluate(() => {
    const nextData = document.getElementById('__NEXT_DATA__')
    if (nextData) {
      const data = JSON.parse(nextData.textContent || '{}')
      const practices = data.props?.pageProps?.practices || []
      return practices.map((p: any) => p.i)
    }
    return []
  })

  return ids
}

async function scrapePractice(page: Page, practiceId: string): Promise<PracticeData | null> {
  try {
    await page.goto(`https://mapper.dpcfrontier.com/practice/${practiceId}`, {
      waitUntil: 'networkidle',
      timeout: 15000,
    })

    const data = await page.evaluate(() => {
      const getText = (selector: string): string => {
        const el = document.querySelector(selector)
        return el?.textContent?.trim() || ''
      }

      // Get title (practice name and location)
      const title = document.querySelector('h1')?.textContent?.trim() || ''
      const subtitle = document.querySelector('h2')?.textContent?.trim() || ''

      // Extract location from subtitle "Direct Primary Care in City, ST"
      const locationMatch = subtitle.match(/in (.+), ([A-Z]{2})/)
      const city = locationMatch?.[1] || 'Unknown'
      const state = locationMatch?.[2] || 'Unknown'

      // Get address from directions link
      const directionsLink = document.querySelector('a[href*="google.com/maps"]')
      const addressMatch = directionsLink?.getAttribute('href')?.match(/query=([^&]+)/)
      const address = addressMatch ? decodeURIComponent(addressMatch[1]).replace(/%2C/g, ',') : ''

      // Get website
      const websiteLink = document.querySelector('a[href^="http"]:not([href*="google.com"]):not([href*="dpcfrontier"])')
      const website = websiteLink?.getAttribute('href') || null

      // Get phone - look for phone number pattern
      const pageText = document.body.innerText
      const phoneMatch = pageText.match(/(\d{3}[-.)]\s*\d{3}[-.)]\s*\d{4}|\(\d{3}\)\s*\d{3}[-.]?\d{4})/)
      const phone = phoneMatch?.[0] || ''

      // Get specialty
      const specialtySection = Array.from(document.querySelectorAll('*')).find(
        el => el.textContent?.includes('Specialty') && el.nextElementSibling
      )
      const specialty = specialtySection?.nextElementSibling?.textContent?.trim() || 'Family Medicine'

      // Extract pricing
      const pricingSection = document.body.innerText

      // Check if pricing is unknown
      if (pricingSection.includes('Membership prices') && pricingSection.includes('Unknown.')) {
        return {
          name: title,
          website,
          city,
          state,
          address,
          phone,
          specialty,
          pricingKnown: false,
          tiers: [],
          enrollmentFee: null,
          perVisitFee: null,
        }
      }

      // Parse pricing tiers
      const tiers: Array<{ label: string; monthlyFee: number; ageMin?: number; ageMax?: number }> = []

      // Look for price patterns: label followed by **$XX** or bold price
      const priceElements = document.querySelectorAll('strong, b')
      priceElements.forEach((el, idx) => {
        const text = el.textContent?.trim() || ''
        const priceMatch = text.match(/\$(\d+)/)
        if (priceMatch) {
          const price = parseInt(priceMatch[1])
          // Get the label from previous text
          const parent = el.parentElement
          const fullText = parent?.textContent || ''
          const labelMatch = fullText.match(/^([^$]+)\$/)
          const label = labelMatch?.[1]?.trim() || `Tier ${idx + 1}`

          // Try to extract age range
          const ageMatch = label.match(/(\d+)\s*[-–to]+\s*(\d+)/)
          const singleAgeMatch = label.match(/(\d+)\+/)

          tiers.push({
            label,
            monthlyFee: price,
            ageMin: ageMatch ? parseInt(ageMatch[1]) : singleAgeMatch ? parseInt(singleAgeMatch[1]) : undefined,
            ageMax: ageMatch ? parseInt(ageMatch[2]) : singleAgeMatch ? 99 : undefined,
          })
        }
      })

      // Extract enrollment fee
      const enrollmentMatch = pricingSection.match(/Enrollment fee[:\s]*\*?\*?\$(\d+)/i)
      const enrollmentFee = enrollmentMatch ? parseInt(enrollmentMatch[1]) : null

      // Extract per-visit fee
      const visitMatch = pricingSection.match(/Per-visit fee[:\s]*\*?\*?\$(\d+)/i)
      const perVisitFee = visitMatch ? parseInt(visitMatch[1]) : null

      return {
        name: title,
        website,
        city,
        state,
        address,
        phone,
        specialty,
        pricingKnown: tiers.length > 0,
        tiers,
        enrollmentFee,
        perVisitFee,
      }
    })

    if (!data || !data.name) return null

    // Process the extracted data
    const tiers = data.tiers || []
    const adultTier = tiers.find(
      t =>
        t.label.toLowerCase().includes('adult') ||
        t.label.toLowerCase().includes('18+') ||
        t.label.toLowerCase().includes('individual') ||
        (t.ageMin && t.ageMin >= 18)
    )
    const childTier = tiers.find(
      t =>
        t.label.toLowerCase().includes('child') ||
        t.label.toLowerCase().includes('0-') ||
        t.label.toLowerCase().includes('pediatric') ||
        (t.ageMax && t.ageMax <= 18)
    )
    const familyTier = tiers.find(t => t.label.toLowerCase().includes('family'))

    return {
      id: practiceId,
      name: data.name,
      website: data.website,
      city: data.city,
      state: data.state,
      address: data.address,
      zipCode: extractZipCode(data.address) || '00000',
      phone: data.phone,
      specialty: data.specialty,
      pricing: {
        individualMonthly: adultTier?.monthlyFee || tiers[0]?.monthlyFee || null,
        childMonthly: childTier?.monthlyFee || null,
        familyMonthly: familyTier?.monthlyFee || null,
        enrollmentFee: data.enrollmentFee,
        perVisitFee: data.perVisitFee,
        pricingTiers: tiers.length > 0 ? tiers : null,
        pricingNotes: `Scraped from DPC Frontier. ${data.specialty}.`,
        pricingConfidence: data.pricingKnown && tiers.length > 0 ? 'high' : 'none',
      },
    }
  } catch (error) {
    console.error(`  Error scraping ${practiceId}:`, error)
    return null
  }
}

function extractZipCode(address: string): string | null {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/)
  return match?.[1] || null
}

async function savePractice(practice: PracticeData): Promise<boolean> {
  try {
    // Check if provider already exists
    const existing = await prisma.dPCProvider.findFirst({
      where: {
        OR: [
          { practiceName: { contains: practice.name, mode: 'insensitive' } },
          practice.website
            ? { website: { contains: new URL(practice.website).hostname, mode: 'insensitive' } }
            : {},
        ],
      },
    })

    if (existing) {
      // Update if we have pricing and existing doesn't
      if (practice.pricing.pricingConfidence === 'high' && existing.pricingConfidence !== 'high') {
        await prisma.dPCProvider.update({
          where: { id: existing.id },
          data: {
            website: practice.website || existing.website,
            monthlyFee: practice.pricing.individualMonthly || existing.monthlyFee,
            childMonthlyFee: practice.pricing.childMonthly,
            familyFee: practice.pricing.familyMonthly,
            enrollmentFee: practice.pricing.enrollmentFee,
            pricingTiers: practice.pricing.pricingTiers
              ? JSON.stringify(practice.pricing.pricingTiers)
              : existing.pricingTiers,
            pricingNotes: practice.pricing.pricingNotes,
            pricingConfidence: practice.pricing.pricingConfidence,
            pricingScrapedAt: new Date(),
          },
        })
        return true
      }
      return false
    }

    // Create new provider
    await prisma.dPCProvider.create({
      data: {
        name: practice.name,
        practiceName: practice.name,
        website: practice.website,
        address: practice.address || 'DPC Frontier',
        city: practice.city,
        state: practice.state,
        zipCode: practice.zipCode,
        phone: practice.phone || 'Unknown',
        monthlyFee: practice.pricing.individualMonthly || 0,
        childMonthlyFee: practice.pricing.childMonthly,
        familyFee: practice.pricing.familyMonthly,
        enrollmentFee: practice.pricing.enrollmentFee,
        pricingTiers: practice.pricing.pricingTiers
          ? JSON.stringify(practice.pricing.pricingTiers)
          : null,
        pricingNotes: practice.pricing.pricingNotes,
        pricingConfidence: practice.pricing.pricingConfidence,
        pricingScrapedAt: new Date(),
        servicesIncluded: [],
        dataSource: 'dpc_frontier',
      },
    })
    return true
  } catch (error) {
    console.error(`  Error saving ${practice.name}:`, error)
    return false
  }
}

async function showReport() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  DPC Frontier Bulk Scraper Report')
  console.log('═══════════════════════════════════════════════════════\n')

  const total = await prisma.dPCProvider.count()
  const withPricing = await prisma.dPCProvider.count({
    where: { pricingConfidence: 'high' },
  })
  const fromFrontier = await prisma.dPCProvider.count({
    where: { dataSource: 'dpc_frontier' },
  })

  const avgPrice = await prisma.dPCProvider.aggregate({
    _avg: { monthlyFee: true },
    _min: { monthlyFee: true },
    _max: { monthlyFee: true },
    where: { monthlyFee: { gt: 0 } },
  })

  const byState = await prisma.dPCProvider.groupBy({
    by: ['state'],
    _count: true,
    where: { pricingConfidence: 'high' },
    orderBy: { _count: { state: 'desc' } },
    take: 10,
  })

  console.log('  Coverage:')
  console.log(`    Total providers: ${total}`)
  console.log(`    With verified pricing: ${withPricing} (${((withPricing / total) * 100).toFixed(1)}%)`)
  console.log(`    From DPC Frontier: ${fromFrontier}`)
  console.log('')
  console.log('  Pricing Statistics:')
  console.log(`    Average: $${Math.round(avgPrice._avg.monthlyFee || 0)}/month`)
  console.log(`    Min: $${avgPrice._min.monthlyFee}/month`)
  console.log(`    Max: $${avgPrice._max.monthlyFee}/month`)
  console.log('')
  console.log('  Top States with Pricing:')
  byState.forEach(s => {
    console.log(`    ${s.state}: ${s._count} providers`)
  })
  console.log('═══════════════════════════════════════════════════════\n')
}

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  DPC Frontier Bulk Pricing Scraper')
  console.log('═══════════════════════════════════════════════════════\n')

  if (reportOnly) {
    await showReport()
    await prisma.$disconnect()
    return
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  })

  console.log('  Fetching practice IDs from DPC Frontier...')
  const allIds = await getPracticeIds(page)
  console.log(`  Found ${allIds.length} total practices\n`)

  // Apply offset and limit
  const practiceIds = limit ? allIds.slice(offset, offset + limit) : allIds.slice(offset)
  console.log(`  Processing ${practiceIds.length} practices (offset: ${offset})`)
  if (limit) console.log(`  (Limited to ${limit} for this run)`)
  console.log('')

  const stats = {
    total: practiceIds.length,
    withPricing: 0,
    noPricing: 0,
    saved: 0,
    errors: 0,
  }

  const batchSize = 50
  for (let i = 0; i < practiceIds.length; i++) {
    const practiceId = practiceIds[i]
    const progress = `[${i + 1}/${stats.total}]`

    try {
      const practice = await scrapePractice(page, practiceId)

      if (!practice) {
        stats.errors++
        process.stdout.write(`  ${progress} Error\n`)
        continue
      }

      const hasPricing = practice.pricing.pricingConfidence === 'high'
      if (hasPricing) {
        stats.withPricing++
        const saved = await savePractice(practice)
        if (saved) stats.saved++
        process.stdout.write(
          `  ${progress} ${practice.name.substring(0, 30).padEnd(30)} $${practice.pricing.individualMonthly}/mo ${saved ? '✓' : '(exists)'}\n`
        )
      } else {
        stats.noPricing++
        // Still save the practice even without pricing
        await savePractice(practice)
        process.stdout.write(`  ${progress} ${practice.name.substring(0, 30).padEnd(30)} - no pricing\n`)
      }

      // Rate limiting - 1 second between requests
      await new Promise(r => setTimeout(r, 1000))

      // Progress checkpoint every batch
      if ((i + 1) % batchSize === 0) {
        console.log(`\n  --- Checkpoint: ${i + 1}/${stats.total} processed, ${stats.withPricing} with pricing ---\n`)
      }
    } catch (error) {
      stats.errors++
      process.stdout.write(`  ${progress} Error: ${error}\n`)
    }
  }

  await page.close()
  await browser.close()

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Scraping Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Total processed: ${stats.total}`)
  console.log(`  With pricing: ${stats.withPricing}`)
  console.log(`  No pricing: ${stats.noPricing}`)
  console.log(`  Saved/updated: ${stats.saved}`)
  console.log(`  Errors: ${stats.errors}`)
  console.log('═══════════════════════════════════════════════════════\n')

  await showReport()
  await prisma.$disconnect()
}

main().catch(console.error)
