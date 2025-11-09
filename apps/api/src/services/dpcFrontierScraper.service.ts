import axios from 'axios'
import * as cheerio from 'cheerio'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DPCPracticeData {
  id: string
  name: string
  legalName?: string
  verified: boolean
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  location: {
    lat: number
    lng: number
  }
  contact: {
    phone?: string
    website?: string
    email?: string
  }
  physicians: Array<{
    name: string
    certification?: string
    specialty?: string
  }>
  services: {
    labDiscounts: boolean
    radiologyDiscounts: boolean
    medicationDispensing: boolean
    homeVisits: boolean
  }
  pricing: {
    monthlyFee?: number
    annualFee?: number
    enrollmentFee?: number
  }
  practiceType: 'PURE_DPC' | 'HYBRID' | 'ONSITE' | 'UNKNOWN'
  acceptingPatients: boolean
  openedDate?: string
}

export class DPCFrontierScraperService {
  private baseUrl = 'https://mapper.dpcfrontier.com'
  private requestDelay = 1500 // 1.5 seconds between requests (respectful scraping)

  /**
   * Fetch all practice IDs from the homepage
   */
  async fetchAllPracticeIds(): Promise<string[]> {
    try {
      console.log('Fetching practice IDs from DPC Frontier homepage...')
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
        },
      })

      const $ = cheerio.load(response.data)

      // Extract __NEXT_DATA__ script tag
      const nextDataScript = $('script#__NEXT_DATA__').html()
      if (!nextDataScript) {
        throw new Error('Could not find __NEXT_DATA__ script tag')
      }

      const nextData = JSON.parse(nextDataScript)
      const practices = nextData.props?.pageProps?.practices || []

      const practiceIds = practices.map((p: any) => p.id || p.practiceId)
      console.log(`Found ${practiceIds.length} practices`)

      return practiceIds
    } catch (error) {
      console.error('Error fetching practice IDs:', error)
      throw error
    }
  }

  /**
   * Fetch detailed data for a single practice
   */
  async fetchPracticeDetails(practiceId: string): Promise<DPCPracticeData | null> {
    try {
      const url = `${this.baseUrl}/practice/${practiceId}`
      const response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
        },
      })

      const $ = cheerio.load(response.data)

      // Extract __NEXT_DATA__ script tag
      const nextDataScript = $('script#__NEXT_DATA__').html()
      if (!nextDataScript) {
        console.warn(`No data found for practice ${practiceId}`)
        return null
      }

      const nextData = JSON.parse(nextDataScript)
      const practice = nextData.props?.pageProps?.practice

      if (!practice) {
        console.warn(`No practice data found for ${practiceId}`)
        return null
      }

      // Transform raw data to our schema
      return this.transformPracticeData(practice)
    } catch (error) {
      console.error(`Error fetching practice ${practiceId}:`, error)
      return null
    }
  }

  /**
   * Transform raw practice data to our schema
   */
  private transformPracticeData(rawData: any): DPCPracticeData {
    return {
      id: rawData.id || rawData.practiceId,
      name: rawData.name || rawData.practiceName,
      legalName: rawData.legalName,
      verified: rawData.verified === true,
      address: {
        street: rawData.address?.street || rawData.street || '',
        city: rawData.address?.city || rawData.city || '',
        state: rawData.address?.state || rawData.state || '',
        zip: rawData.address?.zip || rawData.zipCode || '',
      },
      location: {
        lat: rawData.location?.lat || rawData.latitude || 0,
        lng: rawData.location?.lng || rawData.longitude || 0,
      },
      contact: {
        phone: rawData.phone || rawData.phoneNumber,
        website: rawData.website || rawData.websiteUrl,
        email: rawData.email,
      },
      physicians: this.extractPhysicians(rawData),
      services: {
        labDiscounts: rawData.services?.labDiscounts === true,
        radiologyDiscounts: rawData.services?.radiologyDiscounts === true,
        medicationDispensing: rawData.services?.medicationDispensing === true,
        homeVisits: rawData.services?.homeVisits === true,
      },
      pricing: {
        monthlyFee: this.parsePrice(rawData.pricing?.monthlyFee),
        annualFee: this.parsePrice(rawData.pricing?.annualFee),
        enrollmentFee: this.parsePrice(rawData.pricing?.enrollmentFee),
      },
      practiceType: this.determinePracticeType(rawData.practiceType),
      acceptingPatients: rawData.acceptingPatients !== false,
      openedDate: rawData.openedDate || rawData.establishedDate,
    }
  }

  /**
   * Extract physician information
   */
  private extractPhysicians(rawData: any): Array<{ name: string; certification?: string; specialty?: string }> {
    const physicians = []

    if (rawData.physicians && Array.isArray(rawData.physicians)) {
      physicians.push(
        ...rawData.physicians.map((p: any) => ({
          name: p.name || '',
          certification: p.certification || p.boardCertification,
          specialty: p.specialty || p.specialization,
        }))
      )
    } else if (rawData.physicianName) {
      physicians.push({
        name: rawData.physicianName,
        certification: rawData.physicianCertification,
        specialty: rawData.physicianSpecialty,
      })
    }

    return physicians
  }

  /**
   * Parse price string to number
   */
  private parsePrice(priceString: any): number | undefined {
    if (!priceString) return undefined
    if (typeof priceString === 'number') return priceString

    const cleaned = String(priceString).replace(/[$,]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? undefined : parsed
  }

  /**
   * Determine practice type
   */
  private determinePracticeType(type: any): 'PURE_DPC' | 'HYBRID' | 'ONSITE' | 'UNKNOWN' {
    const typeStr = String(type || '').toUpperCase()

    if (typeStr.includes('PURE') || typeStr.includes('DPC')) return 'PURE_DPC'
    if (typeStr.includes('HYBRID')) return 'HYBRID'
    if (typeStr.includes('ONSITE')) return 'ONSITE'

    return 'UNKNOWN'
  }

  /**
   * Save practice to database
   */
  async savePracticeToDatabase(practice: DPCPracticeData): Promise<void> {
    try {
      // Upsert the DPC provider
      await prisma.dPCProvider.upsert({
        where: { id: practice.id },
        create: {
          id: practice.id,
          name: practice.name,
          address: practice.address.street,
          city: practice.address.city,
          state: practice.address.state,
          zipCode: practice.address.zip,
          phone: practice.contact.phone || '',
          website: practice.contact.website,
          monthlyFee: practice.pricing.monthlyFee || 0,
          servicesOffered: this.formatServicesOffered(practice.services),
          latitude: practice.location.lat,
          longitude: practice.location.lng,
          rating: 0, // Will be updated with real ratings later
          verified: practice.verified,
        },
        update: {
          name: practice.name,
          address: practice.address.street,
          city: practice.address.city,
          state: practice.address.state,
          zipCode: practice.address.zip,
          phone: practice.contact.phone || '',
          website: practice.contact.website,
          monthlyFee: practice.pricing.monthlyFee || 0,
          servicesOffered: this.formatServicesOffered(practice.services),
          latitude: practice.location.lat,
          longitude: practice.location.lng,
          verified: practice.verified,
        },
      })

      // Create or update the provider source tracking
      await prisma.dPCProviderSource.upsert({
        where: { providerId: practice.id },
        create: {
          providerId: practice.id,
          source: 'dpc_frontier',
          sourceUrl: `${this.baseUrl}/practice/${practice.id}`,
          sourceId: practice.id,
          verified: practice.verified,
          lastScraped: new Date(),
          dataQualityScore: this.calculateDataQualityScore(practice),
        },
        update: {
          lastScraped: new Date(),
          verified: practice.verified,
          dataQualityScore: this.calculateDataQualityScore(practice),
        },
      })

      console.log(`✅ Saved practice: ${practice.name} (${practice.id})`)
    } catch (error) {
      console.error(`Error saving practice ${practice.id} to database:`, error)
      throw error
    }
  }

  /**
   * Format services offered as string array
   */
  private formatServicesOffered(services: DPCPracticeData['services']): string[] {
    const offered = []
    if (services.labDiscounts) offered.push('Lab Discounts')
    if (services.radiologyDiscounts) offered.push('Radiology Discounts')
    if (services.medicationDispensing) offered.push('Medication Dispensing')
    if (services.homeVisits) offered.push('Home Visits')
    return offered
  }

  /**
   * Calculate data quality score (0-100)
   */
  private calculateDataQualityScore(practice: DPCPracticeData): number {
    let score = 0
    const maxScore = 100

    // Required fields (40 points)
    if (practice.name) score += 10
    if (practice.address.street) score += 10
    if (practice.address.city) score += 5
    if (practice.address.state) score += 5
    if (practice.address.zip) score += 10

    // Contact info (30 points)
    if (practice.contact.phone) score += 15
    if (practice.contact.website) score += 15

    // Location (20 points)
    if (practice.location.lat && practice.location.lng) score += 20

    // Additional info (10 points)
    if (practice.physicians.length > 0) score += 5
    if (practice.pricing.monthlyFee) score += 5

    return Math.min(score, maxScore)
  }

  /**
   * Delay execution (respectful scraping)
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Scrape all practices and save to database
   */
  async scrapeAllPractices(options?: { limit?: number; startFrom?: number }): Promise<void> {
    const { limit, startFrom = 0 } = options || {}

    console.log('🚀 Starting DPC Frontier scraping process...')

    // Step 1: Fetch all practice IDs
    const practiceIds = await this.fetchAllPracticeIds()
    console.log(`Found ${practiceIds.length} total practices`)

    // Apply limit and offset
    const targetIds = limit ? practiceIds.slice(startFrom, startFrom + limit) : practiceIds.slice(startFrom)
    console.log(`Scraping ${targetIds.length} practices (starting from index ${startFrom})`)

    // Step 2: Scrape each practice
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < targetIds.length; i++) {
      const practiceId = targetIds[i]
      const progress = `[${i + 1}/${targetIds.length}]`

      try {
        console.log(`${progress} Fetching practice ${practiceId}...`)

        // Fetch practice details
        const practiceData = await this.fetchPracticeDetails(practiceId)

        if (practiceData) {
          // Save to database
          await this.savePracticeToDatabase(practiceData)
          successCount++
        } else {
          console.warn(`${progress} No data found for practice ${practiceId}`)
          errorCount++
        }

        // Respectful delay between requests
        if (i < targetIds.length - 1) {
          await this.delay(this.requestDelay)
        }
      } catch (error) {
        console.error(`${progress} Error processing practice ${practiceId}:`, error)
        errorCount++
      }
    }

    console.log('\n✅ Scraping complete!')
    console.log(`   Successfully scraped: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Total: ${targetIds.length}`)
  }
}

// Export singleton instance
export const dpcFrontierScraper = new DPCFrontierScraperService()
