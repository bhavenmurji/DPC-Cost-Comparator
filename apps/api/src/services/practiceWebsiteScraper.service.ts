import axios from 'axios'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Extracted pricing data from a practice website
 */
interface ExtractedPricing {
  monthlyFee?: number
  annualFee?: number
  enrollmentFee?: number
  familyFee?: number
  source: 'meta' | 'title' | 'header' | 'body' | 'pricing_page'
  confidence: 'high' | 'medium' | 'low'
  rawText?: string
}

/**
 * Pricing extraction result for a provider
 */
interface PricingExtractionResult {
  providerId: string
  website: string
  success: boolean
  pricing?: ExtractedPricing
  error?: string
  pagesChecked: string[]
}

/**
 * Common pricing page paths to check
 */
const PRICING_PAGE_PATHS = [
  '/pricing',
  '/membership',
  '/join',
  '/fees',
  '/services',
  '/plans',
  '/enroll',
  '/rates',
  '/cost',
  '/about',
  '/faq',
]

/**
 * Regex patterns for extracting pricing
 */
const PRICING_PATTERNS = {
  // Monthly fees: "$99/month", "$150/mo", "$99 per month", "monthly fee: $99"
  monthly: [
    /\$(\d{1,3}(?:,\d{3})?(?:\.\d{2})?)\s*(?:\/|per\s*)(?:month|mo)\b/gi,
    /(?:monthly|membership)\s*(?:fee|rate|cost|price)?\s*(?:of|:|\s)\s*\$(\d{1,3}(?:,\d{3})?)/gi,
    /\$(\d{1,3}(?:,\d{3})?)\s*(?:monthly|\/mo)/gi,
  ],

  // Annual fees: "$1,000/year", "$1200 annually", "annual fee: $1000"
  annual: [
    /\$(\d{1,4}(?:,\d{3})?(?:\.\d{2})?)\s*(?:\/|per\s*)(?:year|yr|annually)\b/gi,
    /annual\s*(?:fee|rate|cost|price)?\s*(?:of|:|\s)\s*\$(\d{1,4}(?:,\d{3})?)/gi,
    /\$(\d{1,4}(?:,\d{3})?)\s*(?:annually|\/yr|\/year)/gi,
  ],

  // Enrollment fees: "enrollment fee of $100", "$50 one-time", "initial fee: $75"
  enrollment: [
    /enrollment\s*(?:fee)?\s*(?:of|:|\s)\s*\$(\d{1,3}(?:,\d{3})?)/gi,
    /(?:one[- ]?time|initial|sign[- ]?up|registration)\s*(?:fee)?\s*(?:of|:|\s)\s*\$(\d{1,3}(?:,\d{3})?)/gi,
    /\$(\d{1,3}(?:,\d{3})?)\s*(?:one[- ]?time|enrollment|sign[- ]?up)/gi,
  ],

  // Family fees: "family: $250/month", "$150/member/month", "household: $300"
  family: [
    /family\s*(?:membership|rate|fee|plan)?\s*(?:of|:|\s)\s*\$(\d{1,3}(?:,\d{3})?)/gi,
    /\$(\d{1,3}(?:,\d{3})?)\s*(?:\/|per\s*)(?:family|household)/gi,
    /(?:additional|each)\s*(?:family\s*)?member\s*(?:of|:|\s)\s*\$(\d{1,3}(?:,\d{3})?)/gi,
  ],
}

export class PracticeWebsiteScraperService {
  private requestDelay = 3000 // 3 seconds between requests (conservative)
  private timeout = 15000 // 15 second timeout

  private headers = {
    'User-Agent':
      'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  }

  /**
   * Delay execution
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Parse a price string to a number
   */
  private parsePrice(priceString: string): number | undefined {
    if (!priceString) return undefined

    // Remove $ and commas
    const cleaned = priceString.replace(/[$,]/g, '').trim()
    const parsed = parseFloat(cleaned)

    return isNaN(parsed) ? undefined : parsed
  }

  /**
   * Normalize a URL to ensure it has a protocol
   */
  private normalizeUrl(url: string): string {
    if (!url) return ''

    let normalized = url.trim()

    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized
    }

    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '')

    return normalized
  }

  /**
   * Extract pricing from page content
   */
  private extractPricingFromContent(
    content: string,
    source: ExtractedPricing['source']
  ): ExtractedPricing | null {
    const pricing: ExtractedPricing = {
      source,
      confidence: 'low',
    }

    let foundAny = false

    // Extract monthly fees
    for (const pattern of PRICING_PATTERNS.monthly) {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        const fee = this.parsePrice(match[1])
        if (fee && fee >= 25 && fee <= 500) {
          // Reasonable DPC monthly fee range
          pricing.monthlyFee = fee
          pricing.rawText = match[0]
          foundAny = true
          break
        }
      }
      if (pricing.monthlyFee) break
    }

    // Extract annual fees
    for (const pattern of PRICING_PATTERNS.annual) {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        const fee = this.parsePrice(match[1])
        if (fee && fee >= 300 && fee <= 6000) {
          // Reasonable DPC annual fee range
          pricing.annualFee = fee
          foundAny = true
          break
        }
      }
      if (pricing.annualFee) break
    }

    // Extract enrollment fees
    for (const pattern of PRICING_PATTERNS.enrollment) {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        const fee = this.parsePrice(match[1])
        if (fee && fee >= 0 && fee <= 500) {
          // Reasonable enrollment fee range
          pricing.enrollmentFee = fee
          foundAny = true
          break
        }
      }
      if (pricing.enrollmentFee) break
    }

    // Extract family fees
    for (const pattern of PRICING_PATTERNS.family) {
      const matches = content.matchAll(pattern)
      for (const match of matches) {
        const fee = this.parsePrice(match[1])
        if (fee && fee >= 25 && fee <= 1000) {
          // Reasonable family fee range
          pricing.familyFee = fee
          foundAny = true
          break
        }
      }
      if (pricing.familyFee) break
    }

    if (!foundAny) return null

    // Determine confidence based on what was found
    if (pricing.monthlyFee) {
      pricing.confidence = source === 'pricing_page' || source === 'header' ? 'high' : 'medium'
    } else if (pricing.annualFee) {
      pricing.confidence = 'medium'
    } else {
      pricing.confidence = 'low'
    }

    return pricing
  }

  /**
   * Fetch and parse a single page
   */
  private async fetchPage(url: string): Promise<{ html: string; $: cheerio.CheerioAPI } | null> {
    try {
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: this.timeout,
        validateStatus: (status) => status < 500,
      })

      if (response.status === 404 || response.status === 403) {
        return null
      }

      const html = response.data
      const $ = cheerio.load(html)

      return { html, $ }
    } catch (error: any) {
      // Ignore common errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return null
      }
      console.warn(`   Warning fetching ${url}: ${error.message}`)
      return null
    }
  }

  /**
   * Extract pricing from a practice website
   */
  async extractPricingFromWebsite(websiteUrl: string): Promise<{
    pricing: ExtractedPricing | null
    pagesChecked: string[]
  }> {
    const baseUrl = this.normalizeUrl(websiteUrl)
    if (!baseUrl) {
      return { pricing: null, pagesChecked: [] }
    }

    const pagesChecked: string[] = []
    let bestPricing: ExtractedPricing | null = null

    // Try homepage first
    console.log(`   Checking: ${baseUrl}`)
    pagesChecked.push(baseUrl)

    const homePage = await this.fetchPage(baseUrl)
    if (homePage) {
      // Check meta tags
      const metaDescription = homePage.$('meta[name="description"]').attr('content') || ''
      const ogDescription = homePage.$('meta[property="og:description"]').attr('content') || ''
      const metaContent = metaDescription + ' ' + ogDescription

      const metaPricing = this.extractPricingFromContent(metaContent, 'meta')
      if (metaPricing && metaPricing.monthlyFee) {
        return { pricing: metaPricing, pagesChecked }
      }

      // Check page title
      const title = homePage.$('title').text() || ''
      const titlePricing = this.extractPricingFromContent(title, 'title')
      if (titlePricing && titlePricing.monthlyFee) {
        return { pricing: titlePricing, pagesChecked }
      }

      // Check headers
      const headers = homePage.$('h1, h2, h3').text()
      const headerPricing = this.extractPricingFromContent(headers, 'header')
      if (headerPricing && headerPricing.monthlyFee) {
        bestPricing = headerPricing
      }

      // Check full body text
      if (!bestPricing) {
        const bodyText = homePage.$('body').text()
        const bodyPricing = this.extractPricingFromContent(bodyText, 'body')
        if (bodyPricing && bodyPricing.monthlyFee) {
          bestPricing = bodyPricing
        }
      }
    }

    // If we found pricing on homepage, return it
    if (bestPricing && bestPricing.monthlyFee && bestPricing.confidence === 'high') {
      return { pricing: bestPricing, pagesChecked }
    }

    // Try common pricing pages
    for (const path of PRICING_PAGE_PATHS) {
      const pageUrl = baseUrl + path
      console.log(`   Checking: ${pageUrl}`)
      pagesChecked.push(pageUrl)

      await this.delay(1000) // Small delay between page requests

      const page = await this.fetchPage(pageUrl)
      if (!page) continue

      // Check headers first
      const headers = page.$('h1, h2, h3').text()
      const headerPricing = this.extractPricingFromContent(headers, 'pricing_page')

      if (headerPricing && headerPricing.monthlyFee) {
        // Found on a pricing page - high confidence
        headerPricing.confidence = 'high'
        return { pricing: headerPricing, pagesChecked }
      }

      // Check body text
      const bodyText = page.$('body').text()
      const bodyPricing = this.extractPricingFromContent(bodyText, 'pricing_page')

      if (bodyPricing && bodyPricing.monthlyFee) {
        // Found on pricing page body - medium-high confidence
        bodyPricing.confidence = 'medium'
        if (!bestPricing || !bestPricing.monthlyFee) {
          bestPricing = bodyPricing
        }
      }
    }

    return { pricing: bestPricing, pagesChecked }
  }

  /**
   * Extract pricing for a single provider
   */
  async extractPricingForProvider(providerId: string): Promise<PricingExtractionResult> {
    const provider = await prisma.dPCProvider.findUnique({
      where: { id: providerId },
      select: { id: true, website: true, name: true },
    })

    if (!provider) {
      return {
        providerId,
        website: '',
        success: false,
        error: 'Provider not found',
        pagesChecked: [],
      }
    }

    if (!provider.website) {
      return {
        providerId,
        website: '',
        success: false,
        error: 'No website URL',
        pagesChecked: [],
      }
    }

    console.log(`\nExtracting pricing for: ${provider.name}`)
    console.log(`Website: ${provider.website}`)

    try {
      const { pricing, pagesChecked } = await this.extractPricingFromWebsite(provider.website)

      if (pricing && pricing.monthlyFee) {
        return {
          providerId,
          website: provider.website,
          success: true,
          pricing,
          pagesChecked,
        }
      }

      return {
        providerId,
        website: provider.website,
        success: false,
        error: 'No pricing found',
        pagesChecked,
      }
    } catch (error: any) {
      return {
        providerId,
        website: provider.website,
        success: false,
        error: error.message,
        pagesChecked: [],
      }
    }
  }

  /**
   * Update provider with extracted pricing
   */
  async updateProviderPricing(providerId: string, pricing: ExtractedPricing): Promise<void> {
    const updateData: any = {}

    if (pricing.monthlyFee) {
      updateData.monthlyFee = pricing.monthlyFee
    }

    if (pricing.familyFee) {
      updateData.familyFee = pricing.familyFee
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.dPCProvider.update({
        where: { id: providerId },
        data: updateData,
      })

      // Update data quality score
      const source = await prisma.dPCProviderSource.findUnique({
        where: { providerId },
      })

      if (source) {
        const newScore = Math.min((source.dataQualityScore || 0) + 25, 100)
        await prisma.dPCProviderSource.update({
          where: { providerId },
          data: {
            dataQualityScore: newScore,
            lastScraped: new Date(),
          },
        })
      }
    }
  }

  /**
   * Extract pricing for all DPCA providers without fees
   */
  async extractPricingForAllProviders(options?: {
    limit?: number
    startFrom?: number
    dryRun?: boolean
    onlyWithoutFees?: boolean
  }): Promise<{
    success: number
    failed: number
    skipped: number
    total: number
    results: PricingExtractionResult[]
  }> {
    const { limit, startFrom = 0, dryRun = false, onlyWithoutFees = true } = options || {}

    console.log('Starting practice website fee extraction...')
    console.log(`Options: limit=${limit || 'none'}, startFrom=${startFrom}, dryRun=${dryRun}`)

    // Get providers to process
    const whereClause: any = {
      id: { startsWith: 'dpca-' },
      website: { not: null },
    }

    if (onlyWithoutFees) {
      whereClause.monthlyFee = 0
    }

    const providers = await prisma.dPCProvider.findMany({
      where: whereClause,
      select: { id: true, name: true, website: true },
      skip: startFrom,
      take: limit,
      orderBy: { id: 'asc' },
    })

    console.log(`Found ${providers.length} providers to process`)

    const results: PricingExtractionResult[] = []
    let success = 0
    let failed = 0
    let skipped = 0

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]
      const progress = `[${i + 1}/${providers.length}]`

      if (!provider.website) {
        console.log(`${progress} SKIPPED: ${provider.name} (no website)`)
        skipped++
        continue
      }

      console.log(`\n${progress} Processing: ${provider.name}`)

      const result = await this.extractPricingForProvider(provider.id)
      results.push(result)

      if (result.success && result.pricing) {
        success++
        console.log(
          `   FOUND: $${result.pricing.monthlyFee}/month ` +
            `(${result.pricing.confidence} confidence from ${result.pricing.source})`
        )

        if (!dryRun) {
          await this.updateProviderPricing(provider.id, result.pricing)
          console.log(`   Updated database`)
        }
      } else {
        failed++
        console.log(`   NOT FOUND: ${result.error}`)
      }

      // Respectful delay between providers
      if (i < providers.length - 1) {
        await this.delay(this.requestDelay)
      }
    }

    console.log('\nFee extraction complete!')
    console.log(`   Success: ${success}`)
    console.log(`   Failed: ${failed}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Total: ${providers.length}`)

    return {
      success,
      failed,
      skipped,
      total: providers.length,
      results,
    }
  }

  /**
   * Generate a fee extraction report
   */
  async generateFeeReport(): Promise<{
    totalDPCA: number
    withWebsite: number
    withFees: number
    withoutFees: number
    feeRange: { min: number; max: number; avg: number }
  }> {
    const providers = await prisma.dPCProvider.findMany({
      where: {
        id: { startsWith: 'dpca-' },
      },
      select: {
        website: true,
        monthlyFee: true,
      },
    })

    const withWebsite = providers.filter((p) => p.website).length
    const withFees = providers.filter((p) => p.monthlyFee > 0).length
    const fees = providers.filter((p) => p.monthlyFee > 0).map((p) => p.monthlyFee)

    const feeRange = {
      min: fees.length > 0 ? Math.min(...fees) : 0,
      max: fees.length > 0 ? Math.max(...fees) : 0,
      avg: fees.length > 0 ? fees.reduce((a, b) => a + b, 0) / fees.length : 0,
    }

    return {
      totalDPCA: providers.length,
      withWebsite,
      withFees,
      withoutFees: providers.length - withFees,
      feeRange,
    }
  }
}

// Export singleton instance
export const practiceWebsiteScraper = new PracticeWebsiteScraperService()
