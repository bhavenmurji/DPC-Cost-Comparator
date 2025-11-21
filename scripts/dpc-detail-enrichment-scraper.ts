import axios from 'axios'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

interface EnrichedProviderData {
  id: string
  name?: string
  description?: string
  website?: string
  phone?: string
  fax?: string
  email?: string
  specialty?: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
  coordinates?: {
    lat: number
    lng: number
  }
  pricing?: {
    monthlyFee?: number
    annualFee?: number
    enrollmentFee?: number
  }
  physicians?: string[]
  acceptingPatients?: boolean
}

interface ScrapingStats {
  total: number
  successful: number
  failed: number
  notFound: number
  rateLimited: number
  dataQuality: {
    hasName: number
    hasAddress: number
    hasPhone: number
    hasWebsite: number
    hasEmail: number
    hasPricing: number
    hasPhysicians: number
  }
  errors: Array<{ id: string; error: string }>
  sampleData: EnrichedProviderData[]
}

class DPCDetailEnrichmentScraper {
  private baseUrl = 'https://mapper.dpcfrontier.com/practice'
  private requestDelay = 2000 // 2 seconds between requests
  private maxRetries = 3
  private stats: ScrapingStats = {
    total: 0,
    successful: 0,
    failed: 0,
    notFound: 0,
    rateLimited: 0,
    dataQuality: {
      hasName: 0,
      hasAddress: 0,
      hasPhone: 0,
      hasWebsite: 0,
      hasEmail: 0,
      hasPricing: 0,
      hasPhysicians: 0,
    },
    errors: [],
    sampleData: [],
  }

  /**
   * Scrape a single provider detail page
   */
  async scrapeProviderDetails(providerId: string, retryCount = 0): Promise<EnrichedProviderData | null> {
    const url = `${this.baseUrl}/${providerId}`

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          Connection: 'keep-alive',
        },
        timeout: 15000,
        validateStatus: (status) => status < 500,
      })

      if (response.status === 404) {
        this.stats.notFound++
        return null
      }

      if (response.status === 429) {
        this.stats.rateLimited++
        // Rate limited - wait longer and retry
        if (retryCount < this.maxRetries) {
          console.log(`  ⚠️  Rate limited, waiting 10 seconds before retry ${retryCount + 1}/${this.maxRetries}`)
          await this.delay(10000)
          return this.scrapeProviderDetails(providerId, retryCount + 1)
        }
        throw new Error('Rate limited after max retries')
      }

      const $ = cheerio.load(response.data)

      // Extract JSON-LD structured data (primary source)
      const jsonLdScript = $('script[type="application/ld+json"]').html()
      let jsonLd: any = null
      if (jsonLdScript) {
        try {
          jsonLd = JSON.parse(jsonLdScript)
        } catch (e) {
          console.log(`  ⚠️  Could not parse JSON-LD for ${providerId}`)
        }
      }

      if (!jsonLd) {
        return null
      }

      // Extract data from JSON-LD
      const enrichedData: EnrichedProviderData = {
        id: providerId,
        name: jsonLd.name || undefined,
        description: jsonLd.description || undefined,
        website: jsonLd.url || undefined,
        phone: jsonLd.telephone || undefined,
        fax: jsonLd.faxNumber || undefined,
        specialty: jsonLd.medicalSpecialty || undefined,
      }

      // Extract address
      if (jsonLd.address) {
        enrichedData.address = {
          street: jsonLd.address.streetAddress || '',
          city: jsonLd.address.addressLocality || '',
          state: jsonLd.address.addressRegion || '',
          zip: jsonLd.address.postalCode || '',
        }
      }

      // Extract coordinates
      if (jsonLd.geo) {
        enrichedData.coordinates = {
          lat: jsonLd.geo.latitude,
          lng: jsonLd.geo.longitude,
        }
      }

      // Extract email from page content
      const bodyText = $('body').text()
      const emailMatch = bodyText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      if (emailMatch && !emailMatch[1].includes('example.com')) {
        enrichedData.email = emailMatch[1].toLowerCase()
      }

      // Extract pricing from page content
      const allText = bodyText.replace(/\s+/g, ' ')
      enrichedData.pricing = this.extractPricing(allText)

      // Extract physician names from description
      if (enrichedData.description) {
        enrichedData.physicians = this.extractPhysicians(enrichedData.description)
      }

      // Check if accepting new patients
      if (/accepting\s+new\s+patients/i.test(allText)) {
        enrichedData.acceptingPatients = true
      } else if (/not\s+accepting|waitlist/i.test(allText)) {
        enrichedData.acceptingPatients = false
      }

      return enrichedData
    } catch (error: any) {
      if (retryCount < this.maxRetries && error.code === 'ECONNRESET') {
        console.log(`  ⚠️  Connection reset, retrying ${retryCount + 1}/${this.maxRetries}`)
        await this.delay(5000)
        return this.scrapeProviderDetails(providerId, retryCount + 1)
      }
      throw error
    }
  }

  /**
   * Extract pricing from text
   */
  private extractPricing(text: string): EnrichedProviderData['pricing'] {
    const pricing: EnrichedProviderData['pricing'] = {}

    // Monthly fee patterns
    const monthlyPatterns = [
      /monthly[^$]*\$\s*(\d+)/i,
      /\$\s*(\d+)\s*(?:\/|\s)month/i,
      /membership[^$]*\$\s*(\d+)/i,
    ]

    for (const pattern of monthlyPatterns) {
      const match = text.match(pattern)
      if (match) {
        pricing.monthlyFee = parseInt(match[1], 10)
        break
      }
    }

    // Annual fee patterns
    const annualPatterns = [/annual[^$]*\$\s*(\d+)/i, /\$\s*(\d+)\s*(?:\/|\s)year/i, /yearly[^$]*\$\s*(\d+)/i]

    for (const pattern of annualPatterns) {
      const match = text.match(pattern)
      if (match) {
        pricing.annualFee = parseInt(match[1], 10)
        break
      }
    }

    // Enrollment fee patterns
    const enrollmentPatterns = [
      /enrollment[^$]*\$\s*(\d+)/i,
      /registration[^$]*\$\s*(\d+)/i,
      /sign(?:-|\s)?up[^$]*\$\s*(\d+)/i,
    ]

    for (const pattern of enrollmentPatterns) {
      const match = text.match(pattern)
      if (match) {
        pricing.enrollmentFee = parseInt(match[1], 10)
        break
      }
    }

    return pricing
  }

  /**
   * Extract physician names from description text
   */
  private extractPhysicians(description: string): string[] {
    const physicians: string[] = []

    // Pattern: "Christopher Highley D.O." or "Amy Scullion M.D."
    const pattern1 = /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:D\.O\.|M\.D\.|Ph\.D\.|M\.D\.,?\s+Ph\.D\.)/gi
    let match
    while ((match = pattern1.exec(description)) !== null) {
      physicians.push(match[1].trim())
    }

    return [...new Set(physicians)] // Remove duplicates
  }

  /**
   * Save enriched data to database
   */
  async saveEnrichedData(data: EnrichedProviderData): Promise<void> {
    try {
      // Generate NPI if needed
      const placeholderNPI = `DPC${data.id.substring(0, 7).toUpperCase()}`

      // Update provider
      await prisma.dPCProvider.update({
        where: { id: data.id },
        data: {
          name: data.name || 'DPC Practice',
          practiceName: data.name || 'DPC Practice',
          address: data.address?.street || '',
          city: data.address?.city || 'Unknown',
          state: data.address?.state || 'XX',
          zipCode: data.address?.zip || '00000',
          latitude: data.coordinates?.lat,
          longitude: data.coordinates?.lng,
          phone: data.phone || '',
          email: data.email,
          website: data.website,
          monthlyFee: data.pricing?.monthlyFee || 0,
          acceptingPatients: data.acceptingPatients ?? true,
          specialties: data.specialty ? [data.specialty] : [],
        },
      })

      // Update provider source with quality score
      const qualityScore = this.calculateDataQualityScore(data)
      await prisma.dPCProviderSource.update({
        where: { providerId: data.id },
        data: {
          lastScraped: new Date(),
          dataQualityScore: qualityScore,
          verified: true,
        },
      })

      // Update stats
      if (data.name) this.stats.dataQuality.hasName++
      if (data.address) this.stats.dataQuality.hasAddress++
      if (data.phone) this.stats.dataQuality.hasPhone++
      if (data.website) this.stats.dataQuality.hasWebsite++
      if (data.email) this.stats.dataQuality.hasEmail++
      if (data.pricing?.monthlyFee) this.stats.dataQuality.hasPricing++
      if (data.physicians && data.physicians.length > 0) this.stats.dataQuality.hasPhysicians++
    } catch (error: any) {
      console.error(`  ❌ Error saving provider ${data.id}:`, error.message)
      throw error
    }
  }

  /**
   * Calculate data quality score (0-100)
   */
  private calculateDataQualityScore(data: EnrichedProviderData): number {
    let score = 0

    // Required fields (40 points)
    if (data.name) score += 10
    if (data.address?.street) score += 10
    if (data.address?.city) score += 5
    if (data.address?.state) score += 5
    if (data.address?.zip) score += 10

    // Contact info (30 points)
    if (data.phone) score += 15
    if (data.website) score += 10
    if (data.email) score += 5

    // Location (15 points)
    if (data.coordinates?.lat && data.coordinates?.lng) score += 15

    // Additional info (15 points)
    if (data.physicians && data.physicians.length > 0) score += 5
    if (data.pricing?.monthlyFee) score += 5
    if (data.description) score += 5

    return Math.min(score, 100)
  }

  /**
   * Delay execution
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Scrape all providers
   */
  async scrapeAll(options?: { limit?: number; startFrom?: number }): Promise<void> {
    const { limit, startFrom = 0 } = options || {}

    console.log('🚀 Starting DPC Frontier Detail Enrichment Scraper')
    console.log(`   Rate limit: ${this.requestDelay}ms between requests`)
    console.log(`   Max retries: ${this.maxRetries}`)

    // Get all provider IDs from database
    const providers = await prisma.dPCProvider.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    })

    const targetProviders = limit ? providers.slice(startFrom, startFrom + limit) : providers.slice(startFrom)
    this.stats.total = targetProviders.length

    console.log(`\n📊 Processing ${this.stats.total} providers (starting from index ${startFrom})`)
    console.log(`   Estimated time: ${Math.ceil((this.stats.total * this.requestDelay) / 1000 / 60)} minutes\n`)

    const startTime = Date.now()

    for (let i = 0; i < targetProviders.length; i++) {
      const provider = targetProviders[i]
      const progress = `[${i + 1}/${this.stats.total}]`

      try {
        console.log(`${progress} Scraping ${provider.id}...`)

        const enrichedData = await this.scrapeProviderDetails(provider.id)

        if (enrichedData) {
          await this.saveEnrichedData(enrichedData)
          this.stats.successful++

          console.log(`  ✅ ${enrichedData.name || provider.name}`)
          console.log(`     📍 ${enrichedData.address?.city}, ${enrichedData.address?.state}`)
          console.log(`     💰 Monthly: $${enrichedData.pricing?.monthlyFee || 'N/A'}`)
          console.log(`     🌐 ${enrichedData.website || 'No website'}`)

          // Store first 10 as samples
          if (this.stats.sampleData.length < 10) {
            this.stats.sampleData.push(enrichedData)
          }
        } else {
          this.stats.failed++
          console.log(`  ❌ No data found`)
        }

        // Progress update every 100 providers
        if ((i + 1) % 100 === 0) {
          const elapsed = Date.now() - startTime
          const avgTime = elapsed / (i + 1)
          const remaining = (this.stats.total - (i + 1)) * avgTime
          console.log(`\n📈 Progress: ${i + 1}/${this.stats.total} (${Math.round(((i + 1) / this.stats.total) * 100)}%)`)
          console.log(`   Successful: ${this.stats.successful}`)
          console.log(`   Failed: ${this.stats.failed}`)
          console.log(`   Estimated remaining: ${Math.ceil(remaining / 1000 / 60)} minutes\n`)
        }

        // Respectful delay between requests
        if (i < targetProviders.length - 1) {
          await this.delay(this.requestDelay)
        }
      } catch (error: any) {
        this.stats.failed++
        this.stats.errors.push({
          id: provider.id,
          error: error.message,
        })
        console.log(`  ❌ Error: ${error.message}`)
      }
    }

    const totalTime = Date.now() - startTime
    console.log(`\n✅ Scraping complete!`)
    console.log(`   Total time: ${Math.ceil(totalTime / 1000 / 60)} minutes`)
    console.log(`   Successful: ${this.stats.successful}`)
    console.log(`   Failed: ${this.stats.failed}`)
    console.log(`   Not found: ${this.stats.notFound}`)
    console.log(`   Rate limited: ${this.stats.rateLimited}`)

    // Generate report
    await this.generateReport()
  }

  /**
   * Generate scraping report
   */
  async generateReport(): Promise<void> {
    const report = `# DPC Frontier Detail Scraping Report

## Summary

- **Total Providers Processed**: ${this.stats.total}
- **Successfully Scraped**: ${this.stats.successful} (${Math.round((this.stats.successful / this.stats.total) * 100)}%)
- **Failed**: ${this.stats.failed}
- **Not Found (404)**: ${this.stats.notFound}
- **Rate Limited**: ${this.stats.rateLimited}

## Data Quality Metrics

| Field | Count | Percentage |
|-------|-------|------------|
| Has Name | ${this.stats.dataQuality.hasName} | ${Math.round((this.stats.dataQuality.hasName / this.stats.successful) * 100)}% |
| Has Address | ${this.stats.dataQuality.hasAddress} | ${Math.round((this.stats.dataQuality.hasAddress / this.stats.successful) * 100)}% |
| Has Phone | ${this.stats.dataQuality.hasPhone} | ${Math.round((this.stats.dataQuality.hasPhone / this.stats.successful) * 100)}% |
| Has Website | ${this.stats.dataQuality.hasWebsite} | ${Math.round((this.stats.dataQuality.hasWebsite / this.stats.successful) * 100)}% |
| Has Email | ${this.stats.dataQuality.hasEmail} | ${Math.round((this.stats.dataQuality.hasEmail / this.stats.successful) * 100)}% |
| Has Pricing | ${this.stats.dataQuality.hasPricing} | ${Math.round((this.stats.dataQuality.hasPricing / this.stats.successful) * 100)}% |
| Has Physicians | ${this.stats.dataQuality.hasPhysicians} | ${Math.round((this.stats.dataQuality.hasPhysicians / this.stats.successful) * 100)}% |

## Sample Enriched Data

\`\`\`json
${JSON.stringify(this.stats.sampleData.slice(0, 5), null, 2)}
\`\`\`

## Errors

${this.stats.errors.length > 0 ? this.stats.errors.slice(0, 20).map((e) => `- ${e.id}: ${e.error}`).join('\n') : 'No errors'}

## Next Steps

1. Review failed providers and retry with longer delays
2. Manually verify data quality for sample providers
3. Consider additional data sources for missing information
4. Update frontend to display enriched provider information

---
Generated: ${new Date().toISOString()}
`

    const reportPath = 'c:\\Users\\USER\\Development\\DPC-Cost-Comparator\\docs\\DPC_FRONTIER_SCRAPING_REPORT.md'
    fs.writeFileSync(reportPath, report)
    console.log(`\n📄 Report saved to: ${reportPath}`)
  }
}

// Main execution
async function main() {
  const scraper = new DPCDetailEnrichmentScraper()

  // Parse command line args
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')
  const startIndex = args.indexOf('--start')

  const options = {
    limit: limitIndex >= 0 ? parseInt(args[limitIndex + 1], 10) : undefined,
    startFrom: startIndex >= 0 ? parseInt(args[startIndex + 1], 10) : 0,
  }

  try {
    await scraper.scrapeAll(options)
  } catch (error) {
    console.error('Fatal error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
