/**
 * DPC Practice Pricing Scraper Service
 *
 * Scrapes pricing information from DPC practice websites
 * and updates provider records in the database.
 *
 * Strategy:
 * 1. Use Playwright for JavaScript-rendered pages
 * 2. Parse common pricing patterns from page content
 * 3. Store with confidence scores
 * 4. Rate limit to respect websites
 */

import { PrismaClient } from '@prisma/client'
import { chromium, Browser, Page } from 'playwright'

const prisma = new PrismaClient()

export interface ScrapedPricing {
  individualMonthly?: number
  childMonthly?: number
  familyMonthly?: number
  enrollmentFee?: number
  annualDiscount?: string
  pricingTiers?: PricingTier[]
  pricingNotes?: string
  pricingConfidence: 'high' | 'medium' | 'low' | 'none'
  servicesIncluded?: string[]
}

export interface PricingTier {
  ageMin?: number
  ageMax?: number
  label: string
  monthlyFee: number
}

export interface ScrapeResult {
  providerId: string
  website: string
  success: boolean
  pricing?: ScrapedPricing
  error?: string
  scrapedAt: Date
}

// Common URL patterns for pricing pages
const PRICING_URL_PATTERNS = [
  '/pricing',
  '/membership',
  '/fees',
  '/plans',
  '/join',
  '/services',
  '/how-it-works',
  '/direct-primary-care',
  '/dpc',
  '/enroll',
]

// Regex patterns to extract pricing
const PRICING_PATTERNS = {
  // Matches: $85/month, $150 per month, $99/mo
  monthlyFee: /\$(\d{1,3}(?:,\d{3})?(?:\.\d{2})?)\s*(?:\/|\s*per\s*)?(?:month|mo(?:nth)?)/gi,

  // Matches: $45-85/month (range)
  monthlyRange: /\$(\d{1,3}(?:,\d{3})?)\s*[-–]\s*\$?(\d{1,3}(?:,\d{3})?)\s*(?:\/|\s*per\s*)?(?:month|mo)/gi,

  // Matches: Ages 0-26: $100, 27+: $150
  ageTier: /(?:ages?\s*)?(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(?:years?)?\s*[:=]?\s*\$(\d{1,3}(?:,\d{3})?)/gi,

  // Matches: enrollment fee $100, one-time fee $50
  enrollmentFee: /(?:enrollment|registration|one[\s-]?time|onboarding)\s*(?:fee)?\s*(?:of\s*)?\$(\d{1,4}(?:,\d{3})?)/gi,

  // Matches: family: $350, household: $400
  familyFee: /(?:family|household|couple)\s*(?:fee|plan|membership)?\s*[:=]?\s*\$(\d{1,3}(?:,\d{3})?)/gi,

  // Matches: child: $50, pediatric: $30
  childFee: /(?:child|children|pediatric|kid)\s*(?:fee|plan|membership)?\s*[:=]?\s*\$(\d{1,3}(?:,\d{3})?)/gi,
}

class PricingScraperService {
  private browser: Browser | null = null
  private readonly requestDelay = 2000 // 2 seconds between requests
  private readonly pageTimeout = 30000 // 30 second timeout

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Scrape pricing from a single provider's website
   */
  async scrapeProviderPricing(
    providerId: string,
    websiteUrl: string
  ): Promise<ScrapeResult> {
    const result: ScrapeResult = {
      providerId,
      website: websiteUrl,
      success: false,
      scrapedAt: new Date(),
    }

    try {
      await this.initialize()
      const page = await this.browser!.newPage()
      page.setDefaultTimeout(this.pageTimeout)

      // Set user agent to identify as healthcare comparison tool
      await page.setExtraHTTPHeaders({
        'User-Agent':
          'HealthPartnershipX-DPC-Comparator/1.0 (healthcare pricing comparison; contact@example.com)',
      })

      // Try main page first
      let pricingContent = await this.fetchPageContent(page, websiteUrl)
      let pricing = this.extractPricing(pricingContent)

      // If no pricing found, try common pricing URLs
      if (pricing.pricingConfidence === 'none') {
        for (const pattern of PRICING_URL_PATTERNS) {
          const pricingUrl = new URL(pattern, websiteUrl).toString()
          try {
            pricingContent = await this.fetchPageContent(page, pricingUrl)
            pricing = this.extractPricing(pricingContent)
            if (pricing.pricingConfidence !== 'none') {
              break
            }
          } catch {
            // URL doesn't exist, continue to next
          }
          await this.delay()
        }
      }

      await page.close()

      result.success = pricing.pricingConfidence !== 'none'
      result.pricing = pricing

      return result
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error)
      return result
    }
  }

  /**
   * Fetch and extract text content from a page
   */
  private async fetchPageContent(page: Page, url: string): Promise<string> {
    await page.goto(url, { waitUntil: 'networkidle', timeout: this.pageTimeout })

    // Wait for content to load
    await page.waitForLoadState('domcontentloaded')

    // Extract all visible text
    const content = await page.evaluate(() => {
      // Get text from main content areas
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

  /**
   * Extract pricing information from page content
   */
  extractPricing(content: string): ScrapedPricing {
    const pricing: ScrapedPricing = {
      pricingConfidence: 'none',
    }

    if (!content || content.length < 100) {
      return pricing
    }

    // Normalize content
    const normalizedContent = content.replace(/\s+/g, ' ').toLowerCase()

    // Extract monthly fee
    const monthlyMatches = [...content.matchAll(PRICING_PATTERNS.monthlyFee)]
    if (monthlyMatches.length > 0) {
      // Take the most common or first match
      const fees = monthlyMatches.map((m) =>
        parseFloat(m[1].replace(',', ''))
      )
      pricing.individualMonthly = fees[0]
      pricing.pricingConfidence = 'high'
    }

    // Check for price range
    const rangeMatches = [...content.matchAll(PRICING_PATTERNS.monthlyRange)]
    if (rangeMatches.length > 0 && !pricing.individualMonthly) {
      const low = parseFloat(rangeMatches[0][1].replace(',', ''))
      const high = parseFloat(rangeMatches[0][2].replace(',', ''))
      pricing.individualMonthly = low
      pricing.pricingNotes = `Range: $${low}-$${high}/month`
      pricing.pricingConfidence = 'medium'
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
    const enrollmentMatches = [
      ...content.matchAll(PRICING_PATTERNS.enrollmentFee),
    ]
    if (enrollmentMatches.length > 0) {
      pricing.enrollmentFee = parseFloat(
        enrollmentMatches[0][1].replace(',', '')
      )
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

    // Check for "contact for pricing" indicators
    if (
      pricing.pricingConfidence === 'none' &&
      (normalizedContent.includes('contact for pricing') ||
        normalizedContent.includes('call for pricing') ||
        normalizedContent.includes('pricing available upon request'))
    ) {
      pricing.pricingNotes = 'Contact practice for pricing'
      pricing.pricingConfidence = 'none'
    }

    return pricing
  }

  /**
   * Save scraped pricing to database
   */
  async savePricing(result: ScrapeResult): Promise<void> {
    if (!result.success || !result.pricing) {
      console.log(`[Pricing] No pricing found for ${result.providerId}`)
      return
    }

    const pricing = result.pricing

    await prisma.dPCProvider.update({
      where: { id: result.providerId },
      data: {
        monthlyFee: pricing.individualMonthly || 0,
        childMonthlyFee: pricing.childMonthly,
        familyFee: pricing.familyMonthly,
        enrollmentFee: pricing.enrollmentFee,
        pricingTiers: pricing.pricingTiers
          ? JSON.stringify(pricing.pricingTiers)
          : null,
        pricingNotes: pricing.pricingNotes,
        pricingConfidence: pricing.pricingConfidence,
        pricingScrapedAt: result.scrapedAt,
        servicesIncluded: pricing.servicesIncluded || [],
      },
    })

    console.log(
      `[Pricing] Saved ${result.providerId}: $${pricing.individualMonthly}/mo (${pricing.pricingConfidence})`
    )
  }

  /**
   * Save pricing data directly (for manual/known pricing)
   */
  async saveManualPricing(
    providerIdOrNpi: string,
    pricing: ScrapedPricing & { website?: string }
  ): Promise<void> {
    // Find provider by ID or NPI
    let provider = await prisma.dPCProvider.findUnique({
      where: { id: providerIdOrNpi },
    })

    if (!provider) {
      provider = await prisma.dPCProvider.findUnique({
        where: { npi: providerIdOrNpi },
      })
    }

    if (!provider) {
      // Try to find by practice name
      provider = await prisma.dPCProvider.findFirst({
        where: {
          OR: [
            { practiceName: { contains: providerIdOrNpi, mode: 'insensitive' } },
            { name: { contains: providerIdOrNpi, mode: 'insensitive' } },
          ],
        },
      })
    }

    if (!provider) {
      console.log(`[Pricing] Provider not found: ${providerIdOrNpi}`)
      return
    }

    await prisma.dPCProvider.update({
      where: { id: provider.id },
      data: {
        monthlyFee: pricing.individualMonthly || provider.monthlyFee,
        childMonthlyFee: pricing.childMonthly,
        familyFee: pricing.familyMonthly,
        enrollmentFee: pricing.enrollmentFee,
        pricingTiers: pricing.pricingTiers
          ? JSON.stringify(pricing.pricingTiers)
          : null,
        pricingNotes: pricing.pricingNotes,
        pricingConfidence: pricing.pricingConfidence,
        pricingScrapedAt: new Date(),
        website: pricing.website || provider.website,
      },
    })

    console.log(
      `[Pricing] Saved manual pricing for ${provider.practiceName}: $${pricing.individualMonthly}/mo`
    )
  }

  /**
   * Scrape all providers with websites
   */
  async scrapeAllProviders(options: {
    limit?: number
    skipIfHasPricing?: boolean
  } = {}): Promise<{
    total: number
    scraped: number
    success: number
    failed: number
  }> {
    const { limit, skipIfHasPricing = true } = options

    // Find providers with websites
    const whereClause: Record<string, unknown> = {
      website: { not: null },
    }

    if (skipIfHasPricing) {
      whereClause.OR = [
        { monthlyFee: 0 },
        { pricingScrapedAt: null },
      ]
    }

    const providers = await prisma.dPCProvider.findMany({
      where: whereClause,
      take: limit,
      select: { id: true, website: true, practiceName: true },
    })

    const stats = {
      total: providers.length,
      scraped: 0,
      success: 0,
      failed: 0,
    }

    console.log(`[Pricing] Starting scrape for ${providers.length} providers...`)

    await this.initialize()

    for (const provider of providers) {
      if (!provider.website) continue

      console.log(`[Pricing] Scraping ${provider.practiceName}...`)

      const result = await this.scrapeProviderPricing(
        provider.id,
        provider.website
      )
      stats.scraped++

      if (result.success) {
        await this.savePricing(result)
        stats.success++
      } else {
        stats.failed++
        console.log(`[Pricing] Failed: ${result.error || 'No pricing found'}`)
      }

      await this.delay()
    }

    await this.close()

    console.log(
      `[Pricing] Complete: ${stats.success}/${stats.total} successfully scraped`
    )
    return stats
  }

  private async delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.requestDelay))
  }
}

// Singleton instance
let pricingScraperInstance: PricingScraperService | null = null

export function getPricingScraperService(): PricingScraperService {
  if (!pricingScraperInstance) {
    pricingScraperInstance = new PricingScraperService()
  }
  return pricingScraperInstance
}

export { PricingScraperService }
