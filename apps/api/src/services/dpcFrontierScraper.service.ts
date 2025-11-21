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
   * Fetch all practice data from the Next.js JSON API
   */
  async fetchAllPracticesFromAPI(): Promise<any[]> {
    try {
      console.log('Fetching practice data from DPC Frontier Next.js API...')

      // First, get the homepage to extract the buildId
      const homepageResponse = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
        },
      })

      const $ = cheerio.load(homepageResponse.data)
      const nextDataScript = $('script#__NEXT_DATA__').html()
      if (!nextDataScript) {
        throw new Error('Could not find __NEXT_DATA__ script tag')
      }

      const nextData = JSON.parse(nextDataScript)
      const buildId = nextData.buildId

      if (!buildId) {
        throw new Error('Could not extract buildId from Next.js data')
      }

      console.log(`Found buildId: ${buildId}`)

      // Now fetch the JSON API directly
      const apiUrl = `${this.baseUrl}/_next/data/${buildId}/index.json`
      console.log(`Fetching: ${apiUrl}`)

      const apiResponse = await axios.get(apiUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; DPC-Cost-Comparator/1.0; +https://github.com/bhavenmurji/DPC-Cost-Comparator)',
        },
      })

      const practices = apiResponse.data?.pageProps?.practices || []
      console.log(`Found ${practices.length} practices from API`)

      return practices
    } catch (error) {
      console.error('Error fetching practice data from API:', error)
      throw error
    }
  }

  /**
   * Fetch all practice IDs from the homepage (legacy method, kept for compatibility)
   */
  async fetchAllPracticeIds(): Promise<string[]> {
    const practices = await this.fetchAllPracticesFromAPI()
    return practices.map((p: any) => p.id || p.practiceId)
  }

  /**
   * Fetch detailed data for a single practice (DEPRECATED - individual pages don't exist)
   * Use fetchAllPracticesFromAPI() instead
   */
  async fetchPracticeDetails(practiceId: string): Promise<DPCPracticeData | null> {
    console.warn('fetchPracticeDetails is deprecated - individual practice pages do not exist')
    console.warn('Use fetchAllPracticesFromAPI() to get all practices at once')
    return null
  }

  /**
   * Transform minimal API data to our schema
   * Note: API only provides: id, lat, lng, kind, onsite
   */
  private transformAPIDataToPractice(apiData: any): DPCPracticeData {
    const practiceType = this.determinePracticeType(apiData.k || apiData.kind)
    const practiceId = apiData.i || apiData.p || apiData.id || 'unknown'

    return {
      id: practiceId,
      name: `DPC Practice ${practiceId.substring(0, 8)}`, // Name not provided by API
      verified: false, // Not provided by API
      address: {
        street: '', // Not provided by API
        city: '', // Not provided by API
        state: '', // Not provided by API
        zip: '', // Not provided by API
      },
      location: {
        lat: apiData.l || apiData.lat || 0,
        lng: apiData.g || apiData.lng || 0,
      },
      contact: {
        phone: undefined,
        website: undefined,
        email: undefined,
      },
      physicians: [],
      services: {
        labDiscounts: false,
        radiologyDiscounts: false,
        medicationDispensing: false,
        homeVisits: false,
      },
      pricing: {
        monthlyFee: undefined,
        annualFee: undefined,
        enrollmentFee: undefined,
      },
      practiceType,
      acceptingPatients: true, // Assume true since not provided
      openedDate: undefined,
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
      // Generate a placeholder NPI (API doesn't provide real NPIs)
      const placeholderNPI = `DPC${practice.id.substring(0, 7).toUpperCase()}`

      // Upsert the DPC provider
      await prisma.dPCProvider.upsert({
        where: { id: practice.id },
        create: {
          id: practice.id,
          npi: placeholderNPI,
          name: practice.name,
          practiceName: practice.name,
          address: practice.address.street || 'Address not available',
          city: practice.address.city || 'Unknown',
          state: practice.address.state || 'XX',
          zipCode: practice.address.zip || '00000',
          phone: practice.contact.phone || '',
          email: practice.contact.email,
          website: practice.contact.website,
          monthlyFee: practice.pricing.monthlyFee || 0,
          familyFee: practice.pricing.annualFee ? practice.pricing.annualFee / 12 : undefined,
          acceptingPatients: practice.acceptingPatients,
          servicesIncluded: this.formatServicesOffered(practice.services),
          specialties: [],
          boardCertifications: [],
          languages: [],
          latitude: practice.location.lat,
          longitude: practice.location.lng,
          rating: 0,
          reviewCount: 0,
        },
        update: {
          name: practice.name,
          practiceName: practice.name,
          address: practice.address.street || 'Address not available',
          city: practice.address.city || 'Unknown',
          state: practice.address.state || 'XX',
          zipCode: practice.address.zip || '00000',
          phone: practice.contact.phone || '',
          email: practice.contact.email,
          website: practice.contact.website,
          monthlyFee: practice.pricing.monthlyFee || 0,
          familyFee: practice.pricing.annualFee ? practice.pricing.annualFee / 12 : undefined,
          acceptingPatients: practice.acceptingPatients,
          servicesIncluded: this.formatServicesOffered(practice.services),
          specialties: [],
          boardCertifications: [],
          languages: [],
          latitude: practice.location.lat,
          longitude: practice.location.lng,
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
   * Scrape all practices from JSON API and save to database
   */
  async scrapeAllPractices(options?: { limit?: number; startFrom?: number }): Promise<void> {
    const { limit, startFrom = 0 } = options || {}

    console.log('🚀 Starting DPC Frontier import from JSON API...')

    // Step 1: Fetch all practice data from JSON API
    const allPractices = await this.fetchAllPracticesFromAPI()
    console.log(`Found ${allPractices.length} total practices from API`)

    // Apply limit and offset
    const targetPractices = limit
      ? allPractices.slice(startFrom, startFrom + limit)
      : allPractices.slice(startFrom)
    console.log(`Importing ${targetPractices.length} practices (starting from index ${startFrom})`)

    // Step 2: Process each practice
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < targetPractices.length; i++) {
      const apiData = targetPractices[i]
      const progress = `[${i + 1}/${targetPractices.length}]`

      try {
        const practiceId = apiData.i || apiData.p || apiData.id || 'unknown'
        console.log(`${progress} Processing practice ${practiceId}...`)

        // Transform API data to our schema
        const practiceData = this.transformAPIDataToPractice(apiData)

        // Save to database
        await this.savePracticeToDatabase(practiceData)
        successCount++

        // Small delay to avoid overwhelming the database
        if (i < targetPractices.length - 1 && i % 100 === 0) {
          await this.delay(100)
        }
      } catch (error) {
        const practiceId = apiData.i || apiData.p || apiData.id || 'unknown'
        console.error(`${progress} Error processing practice ${practiceId}:`, error)
        errorCount++
      }
    }

    console.log('\n✅ Import complete!')
    console.log(`   Successfully imported: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Total: ${targetPractices.length}`)
    console.log(`\n📍 Note: API provides limited data (coordinates, type, onsite status only)`)
    console.log(`   Additional details (names, addresses, pricing) not available from this source`)
  }
}

// Export singleton instance
export const dpcFrontierScraper = new DPCFrontierScraperService()
