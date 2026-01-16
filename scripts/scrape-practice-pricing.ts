#!/usr/bin/env npx tsx
/**
 * DPC Practice Pricing Scraper
 *
 * Automated scraping of DPC practice websites for pricing information.
 * Uses Playwright for JavaScript-rendered pages.
 *
 * Usage:
 *   npx tsx scripts/scrape-practice-pricing.ts            # Scrape all providers
 *   npx tsx scripts/scrape-practice-pricing.ts --limit 10 # Test with 10 providers
 *   npx tsx scripts/scrape-practice-pricing.ts --report   # Just show stats
 */

import { PrismaClient } from '@prisma/client'
import { chromium, Browser, Page } from 'playwright'

const prisma = new PrismaClient()

// Parse command line arguments
const args = process.argv.slice(2)
const limit = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1]) || 10
  : undefined
const reportOnly = args.includes('--report')
const forceRescrape = args.includes('--force')

// Pricing patterns
const PRICING_PATTERNS = {
  monthlyFee:
    /\$(\d{1,3}(?:,\d{3})?(?:\.\d{2})?)\s*(?:\/|\s*per\s*)?(?:month|mo(?:nth)?)/gi,
  monthlyRange:
    /\$(\d{1,3}(?:,\d{3})?)\s*[-–]\s*\$?(\d{1,3}(?:,\d{3})?)\s*(?:\/|\s*per\s*)?(?:month|mo)/gi,
  ageTier:
    /(?:ages?\s*)?(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:years?)?\s*[:=]?\s*\$(\d{1,3}(?:,\d{3})?)/gi,
  enrollmentFee:
    /(?:enrollment|registration|one[\s-]?time|onboarding)\s*(?:fee)?\s*(?:of\s*)?\$(\d{1,4}(?:,\d{3})?)/gi,
  familyFee:
    /(?:family|household|couple)\s*(?:fee|plan|membership)?\s*[:=]?\s*\$(\d{1,3}(?:,\d{3})?)/gi,
  childFee:
    /(?:child|children|pediatric|kid)\s*(?:fee|plan|membership)?\s*[:=]?\s*\$(\d{1,3}(?:,\d{3})?)/gi,
}

const PRICING_URL_PATTERNS = [
  '/pricing',
  '/membership',
  '/fees',
  '/plans',
  '/join',
  '/services',
  '/how-it-works',
  '/dpc',
  '/enroll',
]

interface ScrapedPricing {
  individualMonthly?: number
  childMonthly?: number
  familyMonthly?: number
  enrollmentFee?: number
  pricingTiers?: { label: string; monthlyFee: number; ageMin?: number; ageMax?: number }[]
  pricingNotes?: string
  pricingConfidence: 'high' | 'medium' | 'low' | 'none'
}

async function showReport() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  DPC Provider Pricing Report')
  console.log('═══════════════════════════════════════════════════════\n')

  const total = await prisma.dPCProvider.count()
  const withWebsite = await prisma.dPCProvider.count({
    where: { website: { not: null } },
  })
  const withPricing = await prisma.dPCProvider.count({
    where: { monthlyFee: { gt: 0 }, pricingConfidence: { not: null } },
  })

  const byConfidence = await prisma.dPCProvider.groupBy({
    by: ['pricingConfidence'],
    where: { pricingConfidence: { not: null } },
    _count: true,
  })

  const avgPrice = await prisma.dPCProvider.aggregate({
    where: { monthlyFee: { gt: 0 } },
    _avg: { monthlyFee: true },
    _min: { monthlyFee: true },
    _max: { monthlyFee: true },
  })

  console.log('  Coverage:')
  console.log(`    Total providers: ${total}`)
  console.log(`    With website: ${withWebsite}`)
  console.log(`    With pricing: ${withPricing} (${((withPricing / total) * 100).toFixed(1)}%)`)
  console.log(`    Need scraping: ${withWebsite - withPricing}`)

  console.log('\n  Confidence Levels:')
  for (const item of byConfidence) {
    console.log(`    ${item.pricingConfidence || 'unknown'}: ${item._count}`)
  }

  console.log('\n  Pricing Range:')
  console.log(`    Average: $${avgPrice._avg.monthlyFee?.toFixed(0) || 'N/A'}/month`)
  console.log(`    Min: $${avgPrice._min.monthlyFee || 'N/A'}/month`)
  console.log(`    Max: $${avgPrice._max.monthlyFee || 'N/A'}/month`)

  // Top 10 by state
  const byState = await prisma.dPCProvider.groupBy({
    by: ['state'],
    where: { monthlyFee: { gt: 0 } },
    _count: true,
    _avg: { monthlyFee: true },
    orderBy: { _count: { state: 'desc' } },
    take: 10,
  })

  console.log('\n  Top States with Pricing:')
  for (const state of byState) {
    console.log(
      `    ${state.state}: ${state._count} providers (avg $${state._avg.monthlyFee?.toFixed(0)}/mo)`
    )
  }

  console.log('\n═══════════════════════════════════════════════════════\n')
}

function extractPricing(content: string): ScrapedPricing {
  const pricing: ScrapedPricing = { pricingConfidence: 'none' }

  if (!content || content.length < 100) {
    return pricing
  }

  const normalizedContent = content.replace(/\s+/g, ' ').toLowerCase()

  // Extract monthly fee
  const monthlyMatches = [...content.matchAll(PRICING_PATTERNS.monthlyFee)]
  if (monthlyMatches.length > 0) {
    const fees = monthlyMatches.map((m) => parseFloat(m[1].replace(',', '')))
    // Filter out unrealistic prices (< $20 or > $500)
    const validFees = fees.filter((f) => f >= 20 && f <= 500)
    if (validFees.length > 0) {
      pricing.individualMonthly = validFees[0]
      pricing.pricingConfidence = 'high'
    }
  }

  // Check for price range
  const rangeMatches = [...content.matchAll(PRICING_PATTERNS.monthlyRange)]
  if (rangeMatches.length > 0 && !pricing.individualMonthly) {
    const low = parseFloat(rangeMatches[0][1].replace(',', ''))
    const high = parseFloat(rangeMatches[0][2].replace(',', ''))
    if (low >= 20 && high <= 500) {
      pricing.individualMonthly = low
      pricing.pricingNotes = `Range: $${low}-$${high}/month`
      pricing.pricingConfidence = 'medium'
    }
  }

  // Extract age tiers
  const tierMatches = [...content.matchAll(PRICING_PATTERNS.ageTier)]
  if (tierMatches.length > 0) {
    pricing.pricingTiers = tierMatches.map((m) => ({
      ageMin: parseInt(m[1]),
      ageMax: parseInt(m[2]),
      label: `Ages ${m[1]}-${m[2]}`,
      monthlyFee: parseFloat(m[3].replace(',', '')),
    }))
    pricing.pricingConfidence = 'high'
  }

  // Extract enrollment fee
  const enrollmentMatches = [...content.matchAll(PRICING_PATTERNS.enrollmentFee)]
  if (enrollmentMatches.length > 0) {
    pricing.enrollmentFee = parseFloat(enrollmentMatches[0][1].replace(',', ''))
  }

  // Extract family fee
  const familyMatches = [...content.matchAll(PRICING_PATTERNS.familyFee)]
  if (familyMatches.length > 0) {
    pricing.familyMonthly = parseFloat(familyMatches[0][1].replace(',', ''))
  }

  // Extract child fee
  const childMatches = [...content.matchAll(PRICING_PATTERNS.childFee)]
  if (childMatches.length > 0) {
    pricing.childMonthly = parseFloat(childMatches[0][1].replace(',', ''))
  }

  // Check for "contact for pricing"
  if (
    pricing.pricingConfidence === 'none' &&
    (normalizedContent.includes('contact for pricing') ||
      normalizedContent.includes('call for pricing') ||
      normalizedContent.includes('pricing available upon request'))
  ) {
    pricing.pricingNotes = 'Contact practice for pricing'
  }

  return pricing
}

async function fetchPageContent(page: Page, url: string): Promise<string> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForLoadState('domcontentloaded')

  const content = await page.evaluate(() => {
    const selectors = [
      'main',
      'article',
      '.content',
      '.pricing',
      '.membership',
      '#pricing',
      '#membership',
      'body',
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        return element.textContent || ''
      }
    }
    return document.body.textContent || ''
  })

  return content
}

async function scrapeProvider(
  browser: Browser,
  providerId: string,
  websiteUrl: string
): Promise<{
  success: boolean
  pricing?: ScrapedPricing
  error?: string
}> {
  const page = await browser.newPage()

  try {
    await page.setExtraHTTPHeaders({
      'User-Agent':
        'HealthPartnershipX-DPC-Comparator/1.0 (healthcare pricing comparison)',
    })

    // Try main page first
    let content = await fetchPageContent(page, websiteUrl)
    let pricing = extractPricing(content)

    // If no pricing found, try common pricing URLs
    if (pricing.pricingConfidence === 'none') {
      for (const pattern of PRICING_URL_PATTERNS) {
        try {
          const pricingUrl = new URL(pattern, websiteUrl).toString()
          content = await fetchPageContent(page, pricingUrl)
          pricing = extractPricing(content)
          if (pricing.pricingConfidence !== 'none') {
            break
          }
        } catch {
          // URL doesn't exist, continue
        }
        await new Promise((r) => setTimeout(r, 1000)) // Rate limit
      }
    }

    await page.close()

    return {
      success: pricing.pricingConfidence !== 'none',
      pricing,
    }
  } catch (error) {
    await page.close()
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  DPC Practice Pricing Scraper')
  console.log('═══════════════════════════════════════════════════════\n')

  if (reportOnly) {
    await showReport()
    await prisma.$disconnect()
    return
  }

  // Find providers to scrape
  const whereClause: Record<string, unknown> = {
    website: { not: null },
  }

  if (!forceRescrape) {
    whereClause.OR = [{ monthlyFee: 0 }, { pricingScrapedAt: null }]
  }

  const providers = await prisma.dPCProvider.findMany({
    where: whereClause,
    take: limit,
    select: { id: true, website: true, practiceName: true, city: true, state: true },
    orderBy: { practiceName: 'asc' },
  })

  if (providers.length === 0) {
    console.log('  No providers to scrape. All providers have pricing data.')
    console.log('  Use --force to rescrape all providers.')
    await showReport()
    await prisma.$disconnect()
    return
  }

  console.log(`  Found ${providers.length} providers to scrape`)
  if (limit) console.log(`  (Limited to ${limit} for testing)`)
  console.log('')

  // Launch browser
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const stats = {
    total: providers.length,
    scraped: 0,
    success: 0,
    failed: 0,
    errors: 0,
  }

  for (const provider of providers) {
    if (!provider.website) continue

    const shortName =
      provider.practiceName.length > 40
        ? provider.practiceName.substring(0, 37) + '...'
        : provider.practiceName

    process.stdout.write(`  [${stats.scraped + 1}/${stats.total}] ${shortName}... `)

    const result = await scrapeProvider(browser, provider.id, provider.website)
    stats.scraped++

    if (result.success && result.pricing) {
      await prisma.dPCProvider.update({
        where: { id: provider.id },
        data: {
          monthlyFee: result.pricing.individualMonthly || 0,
          childMonthlyFee: result.pricing.childMonthly,
          familyFee: result.pricing.familyMonthly,
          enrollmentFee: result.pricing.enrollmentFee,
          pricingTiers: result.pricing.pricingTiers
            ? JSON.stringify(result.pricing.pricingTiers)
            : null,
          pricingNotes: result.pricing.pricingNotes,
          pricingConfidence: result.pricing.pricingConfidence,
          pricingScrapedAt: new Date(),
        },
      })
      stats.success++
      console.log(`✓ $${result.pricing.individualMonthly}/mo`)
    } else if (result.error) {
      stats.errors++
      console.log(`✗ Error: ${result.error.substring(0, 50)}`)
    } else {
      stats.failed++
      console.log(`- No pricing found`)

      // Mark as scraped but no pricing found
      await prisma.dPCProvider.update({
        where: { id: provider.id },
        data: {
          pricingConfidence: 'none',
          pricingNotes: result.pricing?.pricingNotes || 'No pricing found on website',
          pricingScrapedAt: new Date(),
        },
      })
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 2000))
  }

  await browser.close()

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Scraping Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Total scraped: ${stats.scraped}`)
  console.log(`  Success: ${stats.success}`)
  console.log(`  No pricing found: ${stats.failed}`)
  console.log(`  Errors: ${stats.errors}`)
  console.log('═══════════════════════════════════════════════════════\n')

  // Show updated report
  await showReport()

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
