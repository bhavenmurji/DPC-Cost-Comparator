import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Match result between two providers
 */
interface MatchResult {
  dpcaProviderId: string
  frontierProviderId: string | null
  confidence: number // 0-100
  matchType: 'exact_website' | 'exact_address' | 'name_location' | 'fuzzy' | 'none'
  inheritedFee?: number
}

/**
 * Provider data for matching
 */
interface ProviderMatchData {
  id: string
  name: string
  practiceName: string
  website: string | null
  address: string
  city: string
  state: string
  zipCode: string
  monthlyFee: number
  latitude: number | null
  longitude: number | null
}

export class ProviderMatcherService {
  private matchThreshold = 85 // Minimum confidence to auto-inherit fees

  /**
   * Normalize a name for comparison
   * Removes common suffixes, DPC terms, and standardizes formatting
   */
  private normalizeName(name: string): string {
    if (!name) return ''

    return name
      .toLowerCase()
      .trim()
      // Remove credentials
      .replace(/\b(md|do|phd|faafp|facp|facep|np|pa-c|dnp|mph|mba)\b/gi, '')
      // Remove DPC terms
      .replace(/\b(dpc|direct primary care|primary care|family medicine|internal medicine)\b/gi, '')
      // Remove common words
      .replace(/\b(dr|doctor|physician|practice|clinic|medical|health|healthcare|wellness)\b/gi, '')
      // Remove punctuation
      .replace(/[.,\-']/g, ' ')
      // Collapse whitespace
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Normalize a website URL for comparison
   */
  private normalizeWebsite(url: string | null): string {
    if (!url) return ''

    return url
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')
      .trim()
  }

  /**
   * Normalize an address for comparison
   */
  private normalizeAddress(address: string, city: string, state: string, zip: string): string {
    const parts = [address, city, state, zip]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .replace(/[.,#]/g, '')
      .replace(/\b(street|st|avenue|ave|road|rd|drive|dr|boulevard|blvd|lane|ln|court|ct|way|place|pl)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()

    return parts
  }

  /**
   * Calculate Jaro-Winkler similarity between two strings
   * Returns a value between 0 and 1
   */
  private jaroWinklerSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1
    if (!s1 || !s2) return 0

    const len1 = s1.length
    const len2 = s2.length

    if (len1 === 0 || len2 === 0) return 0

    const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1
    const s1Matches = new Array(len1).fill(false)
    const s2Matches = new Array(len2).fill(false)

    let matches = 0
    let transpositions = 0

    // Find matches
    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchDistance)
      const end = Math.min(i + matchDistance + 1, len2)

      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue
        s1Matches[i] = true
        s2Matches[j] = true
        matches++
        break
      }
    }

    if (matches === 0) return 0

    // Count transpositions
    let k = 0
    for (let i = 0; i < len1; i++) {
      if (!s1Matches[i]) continue
      while (!s2Matches[k]) k++
      if (s1[i] !== s2[k]) transpositions++
      k++
    }

    const jaro =
      (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3

    // Winkler modification for common prefix
    let prefix = 0
    for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
      if (s1[i] === s2[i]) prefix++
      else break
    }

    return jaro + prefix * 0.1 * (1 - jaro)
  }

  /**
   * Calculate distance between two coordinates in miles
   */
  private calculateDistance(
    lat1: number | null,
    lon1: number | null,
    lat2: number | null,
    lon2: number | null
  ): number | null {
    if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) {
      return null
    }

    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Find the best match for a DPCA provider in DPC Frontier data
   */
  async findMatch(dpcaProvider: ProviderMatchData, frontierProviders: ProviderMatchData[]): Promise<MatchResult> {
    let bestMatch: MatchResult = {
      dpcaProviderId: dpcaProvider.id,
      frontierProviderId: null,
      confidence: 0,
      matchType: 'none',
    }

    const dpcaWebsite = this.normalizeWebsite(dpcaProvider.website)
    const dpcaAddress = this.normalizeAddress(
      dpcaProvider.address,
      dpcaProvider.city,
      dpcaProvider.state,
      dpcaProvider.zipCode
    )
    const dpcaName = this.normalizeName(dpcaProvider.name)
    const dpcaPracticeName = this.normalizeName(dpcaProvider.practiceName)

    for (const frontier of frontierProviders) {
      let confidence = 0
      let matchType: MatchResult['matchType'] = 'none'

      // Tier 1: Exact website URL match (100% confidence)
      if (dpcaWebsite && this.normalizeWebsite(frontier.website) === dpcaWebsite) {
        confidence = 100
        matchType = 'exact_website'
      }

      // Tier 2: Exact address match (95% confidence)
      if (confidence < 95) {
        const frontierAddress = this.normalizeAddress(
          frontier.address,
          frontier.city,
          frontier.state,
          frontier.zipCode
        )

        if (dpcaAddress && frontierAddress && dpcaAddress === frontierAddress) {
          confidence = 95
          matchType = 'exact_address'
        }
      }

      // Tier 3: Name + Location match (85% confidence)
      if (confidence < 85) {
        const frontierName = this.normalizeName(frontier.name)
        const frontierPracticeName = this.normalizeName(frontier.practiceName)

        // Check name similarity
        const nameSimilarity = Math.max(
          this.jaroWinklerSimilarity(dpcaName, frontierName),
          this.jaroWinklerSimilarity(dpcaName, frontierPracticeName),
          this.jaroWinklerSimilarity(dpcaPracticeName, frontierName),
          this.jaroWinklerSimilarity(dpcaPracticeName, frontierPracticeName)
        )

        // Same city and state
        const sameCity =
          dpcaProvider.city.toLowerCase() === frontier.city.toLowerCase()
        const sameState =
          dpcaProvider.state.toLowerCase() === frontier.state.toLowerCase()

        if (nameSimilarity > 0.8 && sameCity && sameState) {
          confidence = 85
          matchType = 'name_location'
        }
      }

      // Tier 4: Fuzzy match (70% confidence)
      if (confidence < 70) {
        const frontierName = this.normalizeName(frontier.name)
        const frontierPracticeName = this.normalizeName(frontier.practiceName)

        const nameSimilarity = Math.max(
          this.jaroWinklerSimilarity(dpcaName, frontierName),
          this.jaroWinklerSimilarity(dpcaName, frontierPracticeName),
          this.jaroWinklerSimilarity(dpcaPracticeName, frontierName),
          this.jaroWinklerSimilarity(dpcaPracticeName, frontierPracticeName)
        )

        const sameState =
          dpcaProvider.state.toLowerCase() === frontier.state.toLowerCase()

        const distance = this.calculateDistance(
          dpcaProvider.latitude,
          dpcaProvider.longitude,
          frontier.latitude,
          frontier.longitude
        )

        if (nameSimilarity > 0.6 && sameState && (distance === null || distance < 10)) {
          confidence = 70
          matchType = 'fuzzy'
        }
      }

      // Update best match if this is better
      if (confidence > bestMatch.confidence) {
        bestMatch = {
          dpcaProviderId: dpcaProvider.id,
          frontierProviderId: frontier.id,
          confidence,
          matchType,
          inheritedFee: frontier.monthlyFee > 0 ? frontier.monthlyFee : undefined,
        }
      }

      // Early exit if we found an exact match
      if (confidence === 100) break
    }

    return bestMatch
  }

  /**
   * Load all DPC Frontier providers for matching
   */
  async loadFrontierProviders(): Promise<ProviderMatchData[]> {
    const providers = await prisma.dPCProvider.findMany({
      where: {
        id: {
          not: {
            startsWith: 'dpca-',
          },
        },
      },
      select: {
        id: true,
        name: true,
        practiceName: true,
        website: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        monthlyFee: true,
        latitude: true,
        longitude: true,
      },
    })

    return providers
  }

  /**
   * Load all DPCA providers that need matching
   */
  async loadDPCAProviders(): Promise<ProviderMatchData[]> {
    const providers = await prisma.dPCProvider.findMany({
      where: {
        id: {
          startsWith: 'dpca-',
        },
      },
      select: {
        id: true,
        name: true,
        practiceName: true,
        website: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        monthlyFee: true,
        latitude: true,
        longitude: true,
      },
    })

    return providers
  }

  /**
   * Match all DPCA providers to DPC Frontier and inherit fees
   */
  async matchAllProviders(options?: {
    threshold?: number
    dryRun?: boolean
  }): Promise<{
    matched: number
    unmatched: number
    feesInherited: number
    results: MatchResult[]
  }> {
    const { threshold = this.matchThreshold, dryRun = false } = options || {}

    console.log('Starting provider matching...')
    console.log(`Threshold: ${threshold}%, Dry run: ${dryRun}`)

    // Load providers
    const frontierProviders = await this.loadFrontierProviders()
    const dpcaProviders = await this.loadDPCAProviders()

    console.log(`Loaded ${frontierProviders.length} DPC Frontier providers`)
    console.log(`Loaded ${dpcaProviders.length} DPCA providers to match`)

    const results: MatchResult[] = []
    let matched = 0
    let unmatched = 0
    let feesInherited = 0

    for (let i = 0; i < dpcaProviders.length; i++) {
      const dpca = dpcaProviders[i]
      const progress = `[${i + 1}/${dpcaProviders.length}]`

      const matchResult = await this.findMatch(dpca, frontierProviders)
      results.push(matchResult)

      if (matchResult.confidence >= threshold) {
        matched++
        console.log(
          `${progress} MATCH: ${dpca.name} -> ${matchResult.frontierProviderId} ` +
            `(${matchResult.confidence}% ${matchResult.matchType})`
        )

        // Inherit fee if available and not dry run
        if (matchResult.inheritedFee && !dryRun) {
          await prisma.dPCProvider.update({
            where: { id: dpca.id },
            data: { monthlyFee: matchResult.inheritedFee },
          })
          feesInherited++
          console.log(`   Inherited fee: $${matchResult.inheritedFee}/month`)
        }
      } else if (matchResult.confidence > 0) {
        console.log(
          `${progress} LOW CONFIDENCE: ${dpca.name} -> ${matchResult.frontierProviderId} ` +
            `(${matchResult.confidence}% ${matchResult.matchType})`
        )
        unmatched++
      } else {
        console.log(`${progress} NO MATCH: ${dpca.name}`)
        unmatched++
      }
    }

    console.log('\nMatching complete!')
    console.log(`   Matched (>=${threshold}%): ${matched}`)
    console.log(`   Unmatched: ${unmatched}`)
    console.log(`   Fees inherited: ${feesInherited}`)

    return { matched, unmatched, feesInherited, results }
  }

  /**
   * Generate a matching report
   */
  async generateMatchReport(): Promise<{
    totalDPCA: number
    withFees: number
    withoutFees: number
    withWebsite: number
    matchedToFrontier: number
  }> {
    const dpcaProviders = await prisma.dPCProvider.findMany({
      where: {
        id: {
          startsWith: 'dpca-',
        },
      },
      select: {
        id: true,
        monthlyFee: true,
        website: true,
      },
    })

    const withFees = dpcaProviders.filter((p) => p.monthlyFee > 0).length
    const withWebsite = dpcaProviders.filter((p) => p.website).length

    // Count providers that have fee data (inherited or otherwise)
    const matchedToFrontier = withFees // Approximation

    return {
      totalDPCA: dpcaProviders.length,
      withFees,
      withoutFees: dpcaProviders.length - withFees,
      withWebsite,
      matchedToFrontier,
    }
  }
}

// Export singleton instance
export const providerMatcher = new ProviderMatcherService()
