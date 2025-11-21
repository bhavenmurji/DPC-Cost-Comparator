import axios from 'axios'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DPCMapperPracticeDetail {
  id: string
  name: string
  legalName?: string
  kind: 'pure' | 'hybrid' | 'onsite' | 'unknown'
  address: {
    line1: string
    line2?: string
    city: string
    region: string
    postal: string
    country: string
  }
  lat: number
  lng: number
  phone?: string
  website?: string
  openDate?: string
  verified: boolean
  acceptedAges?: string
  description?: string
  people: Array<{
    fn: string // first name
    ln: string // last name
    cert?: string // MD, DO, etc
    specialty?: string // fam, internal, etc
    panelStatus?: string
    prof?: string
  }>
  // Services
  cellCommunication?: boolean
  emailCommunication?: boolean
  messageCommunication?: boolean
  labDiscounts?: boolean
  radiologyDiscounts?: boolean
  dispensing?: boolean
  homeVisits?: boolean
  mobile?: boolean
  onsite?: boolean
  published?: boolean
}

export class DPCMapperEnricherService {
  private baseUrl = 'https://mapper.dpcfrontier.com'
  private requestDelay = 2000 // 2 seconds between requests (respectful scraping)

  /**
   * Fetch detailed data for a single practice by ID
   */
  async fetchPracticeDetail(practiceId: string): Promise<DPCMapperPracticeDetail | null> {
    try {
      const url = `${this.baseUrl}/practice/${practiceId}`
      console.log(`Fetching details for practice ${practiceId}...`)

      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
        },
      })

      const $ = cheerio.load(response.data)
      const nextDataScript = $('script#__NEXT_DATA__').html()

      if (!nextDataScript) {
        console.warn(`Could not find __NEXT_DATA__ for practice ${practiceId}`)
        return null
      }

      const nextData = JSON.parse(nextDataScript)
      const practiceData = nextData.props?.pageProps?.data

      if (!practiceData) {
        console.warn(`No practice data found for ${practiceId}`)
        return null
      }

      return practiceData as DPCMapperPracticeDetail
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn(`Practice ${practiceId} not found (404)`)
        return null
      }
      console.error(`Error fetching practice ${practiceId}:`, error.message)
      return null
    }
  }

  /**
   * Update provider in database with enriched data
   */
  async enrichProvider(practiceId: string, detail: DPCMapperPracticeDetail): Promise<void> {
    try {
      // Format full address
      const addressLine1 = detail.address?.line1 || ''
      const addressLine2 = detail.address?.line2 || ''
      const fullAddress = [addressLine1, addressLine2].filter(Boolean).join(', ')

      // Format physician names
      const physicians = detail.people?.map((p) => `${p.fn} ${p.ln} ${p.cert || ''}`.trim()) || []

      // Format specialties
      const specialties = detail.people
        ?.map((p) => this.mapSpecialty(p.specialty))
        .filter(Boolean) || []

      // Format board certifications
      const boardCertifications = detail.people?.map((p) => p.cert).filter(Boolean) || []

      // Format services
      const servicesOffered = []
      if (detail.labDiscounts) servicesOffered.push('Lab Discounts')
      if (detail.radiologyDiscounts) servicesOffered.push('Radiology Discounts')
      if (detail.dispensing) servicesOffered.push('Medication Dispensing')
      if (detail.homeVisits) servicesOffered.push('Home Visits')
      if (detail.cellCommunication) servicesOffered.push('Cell Phone Communication')
      if (detail.emailCommunication) servicesOffered.push('Email Communication')
      if (detail.messageCommunication) servicesOffered.push('Text Messaging')

      // Update the provider
      await prisma.dPCProvider.update({
        where: { id: practiceId },
        data: {
          name: detail.name || detail.legalName || 'Unknown Practice',
          practiceName: detail.legalName || detail.name || 'Unknown Practice',
          address: fullAddress || 'Address not available',
          city: detail.address?.city || 'Unknown',
          state: detail.address?.region || 'XX',
          zipCode: detail.address?.postal || '00000',
          phone: detail.phone || '',
          website: detail.website || null,
          latitude: detail.lat,
          longitude: detail.lng,
          servicesIncluded: servicesOffered,
          specialties: specialties as string[],
          boardCertifications: boardCertifications as string[],
          acceptingPatients: detail.people?.some((p) => p.panelStatus === 'open') ?? true,
          // Note: pricing data not available in detail page
        },
      })

      // Update the source tracking with enrichment timestamp
      await prisma.dPCProviderSource.update({
        where: { providerId: practiceId },
        data: {
          lastScraped: new Date(),
          verified: detail.verified,
          dataQualityScore: this.calculateDataQualityScore(detail),
        },
      })

      console.log(`✅ Enriched provider: ${detail.name} (${practiceId})`)
    } catch (error: any) {
      console.error(`Error enriching provider ${practiceId}:`, error.message)
      throw error
    }
  }

  /**
   * Map specialty codes to full names
   */
  private mapSpecialty(code?: string): string {
    const specialtyMap: Record<string, string> = {
      fam: 'Family Medicine',
      internal: 'Internal Medicine',
      peds: 'Pediatrics',
      geriatrics: 'Geriatrics',
      'ob-gyn': 'Obstetrics & Gynecology',
      psych: 'Psychiatry',
    }

    return code ? specialtyMap[code] || code : ''
  }

  /**
   * Calculate data quality score for enriched data
   */
  private calculateDataQualityScore(detail: DPCMapperPracticeDetail): number {
    let score = 0

    // Required fields (40 points)
    if (detail.name) score += 10
    if (detail.address?.line1) score += 10
    if (detail.address?.city) score += 5
    if (detail.address?.region) score += 5
    if (detail.address?.postal) score += 10

    // Contact info (30 points)
    if (detail.phone) score += 15
    if (detail.website) score += 15

    // Location (20 points)
    if (detail.lat && detail.lng) score += 20

    // Additional info (10 points)
    if (detail.people && detail.people.length > 0) score += 5
    if (detail.verified) score += 5

    return Math.min(score, 100)
  }

  /**
   * Delay execution (respectful scraping)
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Enrich all providers in the database
   */
  async enrichAllProviders(options?: {
    limit?: number
    startFrom?: number
    skipExisting?: boolean
  }): Promise<void> {
    const { limit, startFrom = 0, skipExisting = true } = options || {}

    console.log('🚀 Starting DPC Mapper enrichment process...')

    // Get all providers that need enrichment
    const whereClause = skipExisting
      ? {
          name: {
            startsWith: 'DPC Practice ',
          },
        }
      : {}

    const totalProviders = await prisma.dPCProvider.count({ where: whereClause })
    console.log(`Found ${totalProviders} providers to enrich`)

    // Fetch providers to process
    const providers = await prisma.dPCProvider.findMany({
      where: whereClause,
      select: { id: true, name: true },
      skip: startFrom,
      take: limit,
    })

    console.log(`Processing ${providers.length} providers (starting from index ${startFrom})`)

    let successCount = 0
    let errorCount = 0
    let notFoundCount = 0

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]
      const progress = `[${i + 1}/${providers.length}]`

      try {
        console.log(`${progress} Processing provider ${provider.id}...`)

        // Fetch detailed data from practice page
        const detail = await this.fetchPracticeDetail(provider.id)

        if (!detail) {
          notFoundCount++
          console.warn(`${progress} No detail data found for ${provider.id}`)
          await this.delay(this.requestDelay)
          continue
        }

        // Enrich the provider with detailed data
        await this.enrichProvider(provider.id, detail)
        successCount++

        // Respectful delay between requests
        if (i < providers.length - 1) {
          await this.delay(this.requestDelay)
        }
      } catch (error: any) {
        console.error(`${progress} Error processing provider ${provider.id}:`, error.message)
        errorCount++

        // Continue with delay even on error
        await this.delay(this.requestDelay)
      }
    }

    console.log('\n✅ Enrichment complete!')
    console.log(`   Successfully enriched: ${successCount}`)
    console.log(`   Not found: ${notFoundCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Total processed: ${providers.length}`)
  }

  /**
   * Generate enrichment report
   */
  async generateReport(): Promise<{
    total: number
    enriched: number
    placeholder: number
    withPhone: number
    withWebsite: number
    avgQualityScore: number
  }> {
    const total = await prisma.dPCProvider.count()

    const placeholder = await prisma.dPCProvider.count({
      where: {
        name: {
          startsWith: 'DPC Practice ',
        },
      },
    })

    const enriched = total - placeholder

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

    // Calculate average quality score
    const sources = await prisma.dPCProviderSource.findMany({
      select: {
        dataQualityScore: true,
      },
    })

    const avgQualityScore =
      sources.length > 0
        ? sources.reduce((sum, s) => sum + (s.dataQualityScore || 0), 0) / sources.length
        : 0

    return {
      total,
      enriched,
      placeholder,
      withPhone,
      withWebsite,
      avgQualityScore,
    }
  }
}

// Export singleton instance
export const dpcMapperEnricher = new DPCMapperEnricherService()
