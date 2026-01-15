import { chromium, Browser, Page } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Data extracted from a DPCA profile page
 */
interface DPCAProfileData {
  slug: string
  name: string
  credentials: string
  title?: string
  address: {
    full: string
    street: string
    city: string
    state: string
    zip: string
  }
  coreSpecialties: string[]
  focusedHealthAreas: string[]
  additionalServices: string[]
  practiceWebsite?: string
  sourceUrl: string
}

/**
 * Parsed address components
 */
interface ParsedAddress {
  street: string
  city: string
  state: string
  zip: string
}

export class DPCAllianceScraperService {
  private baseUrl = 'https://www.dpcalliance.org'
  private directoryUrl = '/find-a-dpc-physician/'
  private requestDelay = 2000 // 2 seconds between requests
  private browser: Browser | null = null

  /**
   * Initialize Playwright browser
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
      })
    }
    return this.browser
  }

  /**
   * Close browser when done
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Delay execution (respectful scraping)
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Parse address string into components
   * Example: "1126 S. Clifton Ave Wichita, KS 67218"
   */
  private parseAddress(addressString: string): ParsedAddress {
    // Default values
    const result: ParsedAddress = {
      street: '',
      city: '',
      state: '',
      zip: '',
    }

    if (!addressString) return result

    // Pattern: Street Address City, ST ZIP
    // Example: "1126 S. Clifton Ave Wichita, KS 67218"
    const zipMatch = addressString.match(/\b(\d{5}(?:-\d{4})?)\s*$/)
    if (zipMatch) {
      result.zip = zipMatch[1]
    }

    // State pattern: two letters before ZIP
    const stateMatch = addressString.match(/,?\s*([A-Z]{2})\s+\d{5}/)
    if (stateMatch) {
      result.state = stateMatch[1]
    }

    // City: word(s) before state
    const cityStateMatch = addressString.match(/([A-Za-z\s]+),?\s*[A-Z]{2}\s+\d{5}/)
    if (cityStateMatch) {
      result.city = cityStateMatch[1].trim().replace(/,\s*$/, '')
    }

    // Street: everything before city
    if (result.city) {
      const streetEnd = addressString.indexOf(result.city)
      if (streetEnd > 0) {
        result.street = addressString.substring(0, streetEnd).trim().replace(/,\s*$/, '')
      }
    }

    return result
  }

  /**
   * Extract profile URLs from the directory listing page
   */
  async extractProfileUrlsFromPage(page: Page): Promise<string[]> {
    const urls: string[] = []

    // Get all "View Profile" links
    const profileLinks = await page.locator('a[href*="/find-a-dpc-physician/"]').all()

    for (const link of profileLinks) {
      const href = await link.getAttribute('href')
      if (href && href !== this.directoryUrl && !href.includes('?')) {
        // Extract just the slug portion
        const slug = href.replace('/find-a-dpc-physician/', '').replace(/\/$/, '')
        if (slug && !urls.includes(slug)) {
          urls.push(slug)
        }
      }
    }

    return urls
  }

  /**
   * Get total page count from pagination
   */
  async getTotalPages(page: Page): Promise<number> {
    try {
      // Look for pagination numbers
      const pageNumbers = await page.locator('.pagination a, nav[aria-label*="pagination"] a').allTextContents()
      const numbers = pageNumbers
        .map((text) => parseInt(text, 10))
        .filter((n) => !isNaN(n))

      return numbers.length > 0 ? Math.max(...numbers) : 1
    } catch {
      return 26 // Default based on our analysis
    }
  }

  /**
   * Fetch all profile slugs from the directory (all pages)
   */
  async fetchAllProfileSlugs(options?: { limit?: number }): Promise<string[]> {
    const { limit } = options || {}
    const allSlugs: string[] = []

    console.log('Starting DPCA directory scrape...')

    const browser = await this.initBrowser()
    const page = await browser.newPage()

    try {
      // Set reasonable viewport
      await page.setViewportSize({ width: 1280, height: 720 })

      // Navigate to directory
      console.log(`Navigating to ${this.baseUrl}${this.directoryUrl}`)
      await page.goto(`${this.baseUrl}${this.directoryUrl}`, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Wait for content to load
      await page.waitForTimeout(2000)

      // Get total pages
      const totalPages = await this.getTotalPages(page)
      console.log(`Found ${totalPages} pages in directory`)

      // Scrape each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`[Page ${pageNum}/${totalPages}] Extracting profile URLs...`)

        if (pageNum > 1) {
          // Navigate to next page by clicking pagination or direct URL
          try {
            const nextButton = page.locator(`a:has-text("${pageNum}"), .pagination a:has-text("${pageNum}")`)
            if ((await nextButton.count()) > 0) {
              await nextButton.first().click()
              await page.waitForTimeout(2000)
            }
          } catch (error) {
            console.warn(`Could not navigate to page ${pageNum}, trying URL approach`)
            // Some directories use URL params for pagination
            await page.goto(`${this.baseUrl}${this.directoryUrl}?page=${pageNum}`, {
              waitUntil: 'networkidle',
            })
            await page.waitForTimeout(2000)
          }
        }

        // Extract slugs from current page
        const pageSlugs = await this.extractProfileUrlsFromPage(page)
        console.log(`   Found ${pageSlugs.length} profiles on page ${pageNum}`)

        for (const slug of pageSlugs) {
          if (!allSlugs.includes(slug)) {
            allSlugs.push(slug)
          }
        }

        // Check if we've hit the limit
        if (limit && allSlugs.length >= limit) {
          console.log(`Reached limit of ${limit} profiles`)
          break
        }

        // Respectful delay between pages
        if (pageNum < totalPages) {
          await this.delay(this.requestDelay)
        }
      }

      console.log(`Total unique profile slugs found: ${allSlugs.length}`)
    } finally {
      await page.close()
    }

    return limit ? allSlugs.slice(0, limit) : allSlugs
  }

  /**
   * Scrape detailed data from a single profile page
   */
  async scrapeProfilePage(slug: string): Promise<DPCAProfileData | null> {
    const browser = await this.initBrowser()
    const page = await browser.newPage()

    try {
      const profileUrl = `${this.baseUrl}/find-a-dpc-physician/${slug}`
      console.log(`   Fetching: ${profileUrl}`)

      await page.goto(profileUrl, {
        waitUntil: 'networkidle',
        timeout: 30000,
      })

      // Wait for content
      await page.waitForTimeout(1500)

      // Extract data from the page
      const pageContent = await page.content()

      // Extract name from h1
      const nameElement = await page.locator('h1').first()
      const fullName = (await nameElement.textContent()) || ''

      // Parse name and credentials (e.g., "Brandon Alleman" followed by "MD, PhD")
      const name = fullName.trim()

      // Get credentials - usually in a separate element or after the name
      let credentials = ''
      try {
        const credentialsText = await page.locator('h1 + *').first().textContent()
        if (credentialsText && /^[A-Z]{2}/.test(credentialsText.trim())) {
          credentials = credentialsText.trim()
        }
      } catch {
        // Try extracting from page text
        const credMatch = pageContent.match(/(?:MD|DO|PhD|FAAFP|FACP|FACEP|NP|PA-C)(?:,\s*(?:MD|DO|PhD|FAAFP|FACP|FACEP|NP|PA-C))*/i)
        if (credMatch) {
          credentials = credMatch[0]
        }
      }

      // Extract title (e.g., "Physician Owner")
      let title = ''
      try {
        const titleMatch = pageContent.match(/(?:Physician Owner|DPC Practicing Physician[^<]*)/i)
        if (titleMatch) {
          title = titleMatch[0].trim()
        }
      } catch {
        // Ignore
      }

      // Extract address
      let addressFull = ''
      try {
        // Address often follows credentials or is in a specific location
        const addressMatch = pageContent.match(/(\d+[^<]+(?:Ave|St|Rd|Dr|Blvd|Way|Ln|Ct)[^<]*\d{5}(?:-\d{4})?)/i)
        if (addressMatch) {
          addressFull = addressMatch[1].trim()
        }
      } catch {
        // Ignore
      }

      const parsedAddress = this.parseAddress(addressFull)

      // Extract specialties
      const coreSpecialties: string[] = []
      try {
        const specialtyMatch = pageContent.match(/Core Specialties[^<]*<[^>]*>([^<]+)/i)
        if (specialtyMatch) {
          coreSpecialties.push(...specialtyMatch[1].split(',').map((s) => s.trim()).filter(Boolean))
        }
        // Also check for common specialties
        if (pageContent.includes('Family Medicine')) coreSpecialties.push('Family Medicine')
        if (pageContent.includes('Internal Medicine')) coreSpecialties.push('Internal Medicine')
        if (pageContent.includes('Pediatrics')) coreSpecialties.push('Pediatrics')
      } catch {
        // Ignore
      }

      // Extract focused health areas
      const focusedHealthAreas: string[] = []
      try {
        const areasMatch = pageContent.match(/Focused Health Areas[^<]*([^<]+(?:Women's Health|Men's Health|Geriatrics|Behavioral|Mental Health|Obesity)[^<]*)/gi)
        if (areasMatch) {
          for (const match of areasMatch) {
            const areas = match.replace(/Focused Health Areas/i, '').split(',').map((s) => s.trim()).filter(Boolean)
            focusedHealthAreas.push(...areas)
          }
        }
      } catch {
        // Ignore
      }

      // Extract additional services
      const additionalServices: string[] = []
      try {
        const servicesMatch = pageContent.match(/Additional Services[^<]*([^<]+(?:Preventive|Travel|Occupational)[^<]*)/gi)
        if (servicesMatch) {
          for (const match of servicesMatch) {
            const services = match.replace(/Additional Services/i, '').split(',').map((s) => s.trim()).filter(Boolean)
            additionalServices.push(...services)
          }
        }
      } catch {
        // Ignore
      }

      // Extract practice website
      let practiceWebsite: string | undefined
      try {
        const websiteLink = await page.locator('a[href*="http"]:not([href*="dpcalliance"])').first()
        if ((await websiteLink.count()) > 0) {
          const href = await websiteLink.getAttribute('href')
          if (href && !href.includes('facebook') && !href.includes('linkedin') && !href.includes('instagram') && !href.includes('twitter')) {
            practiceWebsite = href
          }
        }
        // Also check for "Practice Link" pattern
        const linkMatch = pageContent.match(/Practice Link[^<]*<a[^>]*href="([^"]+)"/i)
        if (linkMatch) {
          practiceWebsite = linkMatch[1]
        }
      } catch {
        // Ignore
      }

      // Dedupe specialties
      const uniqueSpecialties = [...new Set(coreSpecialties)]
      const uniqueAreas = [...new Set(focusedHealthAreas)]
      const uniqueServices = [...new Set(additionalServices)]

      return {
        slug,
        name,
        credentials,
        title: title || undefined,
        address: {
          full: addressFull,
          ...parsedAddress,
        },
        coreSpecialties: uniqueSpecialties,
        focusedHealthAreas: uniqueAreas,
        additionalServices: uniqueServices,
        practiceWebsite,
        sourceUrl: profileUrl,
      }
    } catch (error) {
      console.error(`   Error scraping profile ${slug}:`, error)
      return null
    } finally {
      await page.close()
    }
  }

  /**
   * Calculate data quality score for a profile
   */
  private calculateDataQualityScore(profile: DPCAProfileData): number {
    let score = 0

    // Name present: +15
    if (profile.name) score += 15

    // Full address: +20
    if (profile.address.full) score += 10
    if (profile.address.street) score += 10

    // City + State + Zip: +15
    if (profile.address.city) score += 5
    if (profile.address.state) score += 5
    if (profile.address.zip) score += 5

    // Specialties: +10
    if (profile.coreSpecialties.length > 0) score += 10

    // Practice website: +15
    if (profile.practiceWebsite) score += 15

    // Credentials: +5
    if (profile.credentials) score += 5

    // Additional info: +5
    if (profile.focusedHealthAreas.length > 0 || profile.additionalServices.length > 0) score += 5

    return Math.min(score, 100)
  }

  /**
   * Save a profile to the database
   */
  async saveProfileToDatabase(profile: DPCAProfileData): Promise<void> {
    try {
      // Generate a unique ID based on the slug
      const providerId = `dpca-${profile.slug}`

      // Format services
      const servicesIncluded = [
        ...profile.coreSpecialties,
        ...profile.focusedHealthAreas,
        ...profile.additionalServices,
      ]

      // Upsert the provider
      await prisma.dPCProvider.upsert({
        where: { id: providerId },
        create: {
          id: providerId,
          npi: `DPCA${profile.slug.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()}`,
          name: profile.name,
          practiceName: profile.name, // Use physician name as practice name for DPCA
          address: profile.address.street || profile.address.full || 'Address not available',
          city: profile.address.city || 'Unknown',
          state: profile.address.state || 'XX',
          zipCode: profile.address.zip || '00000',
          phone: '', // Not available from DPCA
          email: null, // Not available from DPCA
          website: profile.practiceWebsite || null,
          monthlyFee: 0, // Will be populated by matcher or website scraper
          familyFee: null,
          acceptingPatients: true, // Assume true
          servicesIncluded,
          specialties: profile.coreSpecialties,
          boardCertifications: profile.credentials ? [profile.credentials] : [],
          languages: [],
          latitude: null,
          longitude: null,
          rating: 0,
          reviewCount: 0,
        },
        update: {
          name: profile.name,
          practiceName: profile.name,
          address: profile.address.street || profile.address.full || 'Address not available',
          city: profile.address.city || 'Unknown',
          state: profile.address.state || 'XX',
          zipCode: profile.address.zip || '00000',
          website: profile.practiceWebsite || null,
          servicesIncluded,
          specialties: profile.coreSpecialties,
          boardCertifications: profile.credentials ? [profile.credentials] : [],
        },
      })

      // Create or update source tracking
      await prisma.dPCProviderSource.upsert({
        where: { providerId },
        create: {
          providerId,
          source: 'dpca',
          sourceUrl: profile.sourceUrl,
          sourceId: profile.slug,
          verified: false,
          lastScraped: new Date(),
          dataQualityScore: this.calculateDataQualityScore(profile),
        },
        update: {
          lastScraped: new Date(),
          dataQualityScore: this.calculateDataQualityScore(profile),
        },
      })

      console.log(`   Saved: ${profile.name} (${providerId})`)
    } catch (error) {
      console.error(`   Error saving profile ${profile.slug}:`, error)
      throw error
    }
  }

  /**
   * Scrape all profiles from DPCA directory
   */
  async scrapeAllProfiles(options?: {
    limit?: number
    startFrom?: number
  }): Promise<{ success: number; errors: number; total: number }> {
    const { limit, startFrom = 0 } = options || {}

    console.log('Starting DPCA Alliance directory scrape...')
    console.log(`Options: limit=${limit || 'none'}, startFrom=${startFrom}`)

    let successCount = 0
    let errorCount = 0

    try {
      // Step 1: Get all profile slugs
      const allSlugs = await this.fetchAllProfileSlugs({ limit: limit ? limit + startFrom : undefined })
      const targetSlugs = allSlugs.slice(startFrom, limit ? startFrom + limit : undefined)

      console.log(`\nProcessing ${targetSlugs.length} profiles (starting from index ${startFrom})`)

      // Step 2: Scrape each profile
      for (let i = 0; i < targetSlugs.length; i++) {
        const slug = targetSlugs[i]
        const progress = `[${i + 1}/${targetSlugs.length}]`

        console.log(`${progress} Processing: ${slug}`)

        try {
          // Scrape the profile
          const profileData = await this.scrapeProfilePage(slug)

          if (profileData) {
            // Save to database
            await this.saveProfileToDatabase(profileData)
            successCount++
          } else {
            console.warn(`${progress} No data extracted for ${slug}`)
            errorCount++
          }

          // Respectful delay
          if (i < targetSlugs.length - 1) {
            await this.delay(this.requestDelay)
          }
        } catch (error) {
          console.error(`${progress} Error processing ${slug}:`, error)
          errorCount++
          await this.delay(this.requestDelay)
        }
      }

      console.log('\nDPCA scrape complete!')
      console.log(`   Successful: ${successCount}`)
      console.log(`   Errors: ${errorCount}`)
      console.log(`   Total processed: ${targetSlugs.length}`)

      return {
        success: successCount,
        errors: errorCount,
        total: targetSlugs.length,
      }
    } finally {
      await this.closeBrowser()
    }
  }

  /**
   * Get all DPCA providers from database
   */
  async getDPCAProviders(): Promise<any[]> {
    return prisma.dPCProvider.findMany({
      where: {
        id: {
          startsWith: 'dpca-',
        },
      },
      include: {
        providerSource: true,
      },
    })
  }
}

// Export singleton instance
export const dpcAllianceScraper = new DPCAllianceScraperService()
