import { PrismaClient, LabProvider } from '@prisma/client'

const prisma = new PrismaClient()

export interface LabTestPricing {
  testName: string
  cptCode?: string
  category?: string
  prices: {
    provider: string
    withInsurance?: number
    withoutInsurance: number
  }[]
  lowestPrice: number
  averagePrice: number
  potentialSavings: number
}

export interface LabTestComparison {
  testName: string
  prices: {
    provider: string
    withInsurance?: number
    withoutInsurance: number
  }[]
  lowestPrice: number
  averagePrice: number
  potentialSavings: number
}

// Common lab tests with typical pricing (used when database is empty)
const COMMON_LAB_TESTS = [
  {
    testName: 'Complete Blood Count (CBC)',
    cptCode: '85025',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 15, withoutInsurance: 45 },
      { provider: 'Quest Diagnostics', withInsurance: 12, withoutInsurance: 40 },
      { provider: 'DPC Affiliate', withoutInsurance: 15 },
    ],
  },
  {
    testName: 'Basic Metabolic Panel (BMP)',
    cptCode: '80048',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 20, withoutInsurance: 55 },
      { provider: 'Quest Diagnostics', withInsurance: 18, withoutInsurance: 50 },
      { provider: 'DPC Affiliate', withoutInsurance: 20 },
    ],
  },
  {
    testName: 'Comprehensive Metabolic Panel (CMP)',
    cptCode: '80053',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 25, withoutInsurance: 65 },
      { provider: 'Quest Diagnostics', withInsurance: 22, withoutInsurance: 60 },
      { provider: 'DPC Affiliate', withoutInsurance: 25 },
    ],
  },
  {
    testName: 'Lipid Panel',
    cptCode: '80061',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 20, withoutInsurance: 50 },
      { provider: 'Quest Diagnostics', withInsurance: 18, withoutInsurance: 45 },
      { provider: 'DPC Affiliate', withoutInsurance: 18 },
    ],
  },
  {
    testName: 'Hemoglobin A1C',
    cptCode: '83036',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 22, withoutInsurance: 55 },
      { provider: 'Quest Diagnostics', withInsurance: 20, withoutInsurance: 50 },
      { provider: 'DPC Affiliate', withoutInsurance: 20 },
    ],
  },
  {
    testName: 'Thyroid Panel (TSH, T3, T4)',
    cptCode: '84443',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 35, withoutInsurance: 90 },
      { provider: 'Quest Diagnostics', withInsurance: 30, withoutInsurance: 85 },
      { provider: 'DPC Affiliate', withoutInsurance: 35 },
    ],
  },
  {
    testName: 'Urinalysis',
    cptCode: '81003',
    category: 'Urine',
    providers: [
      { provider: 'LabCorp', withInsurance: 8, withoutInsurance: 25 },
      { provider: 'Quest Diagnostics', withInsurance: 7, withoutInsurance: 22 },
      { provider: 'DPC Affiliate', withoutInsurance: 10 },
    ],
  },
  {
    testName: 'Vitamin D Level',
    cptCode: '82306',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 40, withoutInsurance: 100 },
      { provider: 'Quest Diagnostics', withInsurance: 35, withoutInsurance: 90 },
      { provider: 'DPC Affiliate', withoutInsurance: 40 },
    ],
  },
  {
    testName: 'PSA (Prostate Specific Antigen)',
    cptCode: '84153',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 30, withoutInsurance: 75 },
      { provider: 'Quest Diagnostics', withInsurance: 28, withoutInsurance: 70 },
      { provider: 'DPC Affiliate', withoutInsurance: 30 },
    ],
  },
  {
    testName: 'Iron Panel',
    cptCode: '83540',
    category: 'Blood',
    providers: [
      { provider: 'LabCorp', withInsurance: 25, withoutInsurance: 60 },
      { provider: 'Quest Diagnostics', withInsurance: 22, withoutInsurance: 55 },
      { provider: 'DPC Affiliate', withoutInsurance: 25 },
    ],
  },
]

export class LabTestPricingService {
  /**
   * Get list of common lab test names for autocomplete
   */
  async getCommonLabTests(): Promise<string[]> {
    // First try to get from database
    try {
      const tests = await prisma.labTestPrice.findMany({
        select: { testName: true },
        distinct: ['testName'],
        take: 20,
      })

      if (tests.length > 0) {
        return tests.map((t) => t.testName)
      }
    } catch (error) {
      console.log('Database not available, using static list')
    }

    // Fall back to static list
    return COMMON_LAB_TESTS.map((t) => t.testName)
  }

  /**
   * Search lab tests by name
   */
  async searchLabTests(testName: string): Promise<LabTestPricing[]> {
    const searchTerm = testName.toLowerCase().trim()

    // Try database first
    try {
      const dbTests = await prisma.labTestPrice.findMany({
        where: {
          testName: { contains: testName, mode: 'insensitive' },
        },
        take: 10,
      })

      if (dbTests.length > 0) {
        // Group by test name and aggregate prices
        const grouped = this.groupLabTestsByName(dbTests)
        return grouped
      }
    } catch (error) {
      console.log('Database not available, using static data')
    }

    // Fall back to static data
    const matches = COMMON_LAB_TESTS.filter(
      (t) =>
        t.testName.toLowerCase().includes(searchTerm) ||
        (t.cptCode && t.cptCode.includes(searchTerm))
    )

    return matches.map((test) => this.formatLabTestPricing(test))
  }

  /**
   * Compare lab test prices across providers
   */
  async compareLabTestPrices(testName: string, _zipCode?: string): Promise<LabTestComparison> {
    const searchTerm = testName.toLowerCase().trim()

    // Try database first
    try {
      const dbTests = await prisma.labTestPrice.findMany({
        where: {
          testName: { contains: testName, mode: 'insensitive' },
        },
      })

      if (dbTests.length > 0) {
        return this.formatDbLabTestComparison(testName, dbTests)
      }
    } catch (error) {
      console.log('Database not available, using static data')
    }

    // Fall back to static data
    const test = COMMON_LAB_TESTS.find(
      (t) =>
        t.testName.toLowerCase().includes(searchTerm) ||
        t.testName.toLowerCase() === searchTerm
    )

    if (!test) {
      // Return estimated pricing for unknown tests
      return this.getEstimatedLabTestPricing(testName)
    }

    return this.formatLabTestComparison(test)
  }

  /**
   * Group database lab tests by name
   */
  private groupLabTestsByName(
    dbTests: Array<{
      testName: string
      cptCode: string | null
      category: string | null
      cashPrice: number
      dpcPrice: number | null
      insuranceEstimate: number | null
      labProvider: LabProvider
    }>
  ): LabTestPricing[] {
    const grouped = new Map<string, typeof dbTests>()

    for (const test of dbTests) {
      const existing = grouped.get(test.testName) || []
      existing.push(test)
      grouped.set(test.testName, existing)
    }

    return Array.from(grouped.entries()).map(([name, tests]) => {
      const prices = tests.map((t) => ({
        provider: this.formatLabProvider(t.labProvider),
        withInsurance: t.insuranceEstimate ?? undefined,
        withoutInsurance: t.cashPrice,
      }))

      const withoutInsurancePrices = prices.map((p) => p.withoutInsurance)
      const lowestPrice = Math.min(...withoutInsurancePrices)
      const averagePrice = withoutInsurancePrices.reduce((a, b) => a + b, 0) / withoutInsurancePrices.length

      return {
        testName: name,
        cptCode: tests[0].cptCode ?? undefined,
        category: tests[0].category ?? undefined,
        prices,
        lowestPrice,
        averagePrice,
        potentialSavings: averagePrice - lowestPrice,
      }
    })
  }

  /**
   * Format database lab tests into comparison response
   */
  private formatDbLabTestComparison(
    testName: string,
    dbTests: Array<{
      testName: string
      cashPrice: number
      dpcPrice: number | null
      insuranceEstimate: number | null
      labProvider: LabProvider
    }>
  ): LabTestComparison {
    const prices = dbTests.map((t) => ({
      provider: this.formatLabProvider(t.labProvider),
      withInsurance: t.insuranceEstimate ?? undefined,
      withoutInsurance: t.dpcPrice ?? t.cashPrice,
    }))

    const withoutInsurancePrices = prices.map((p) => p.withoutInsurance)
    const lowestPrice = Math.min(...withoutInsurancePrices)
    const averagePrice = withoutInsurancePrices.reduce((a, b) => a + b, 0) / withoutInsurancePrices.length

    return {
      testName: dbTests[0]?.testName || testName,
      prices,
      lowestPrice,
      averagePrice,
      potentialSavings: averagePrice - lowestPrice,
    }
  }

  /**
   * Format lab provider enum to display string
   */
  private formatLabProvider(provider: LabProvider): string {
    const providerMap: Record<LabProvider, string> = {
      LABCORP: 'LabCorp',
      QUEST: 'Quest Diagnostics',
      ANYLABTESTNOW: 'Any Lab Test Now',
      HEALTH_GORILLA: 'Health Gorilla',
      DPC_AFFILIATE: 'DPC Affiliate',
      OTHER: 'Other',
    }
    return providerMap[provider] || provider
  }

  /**
   * Format static lab test data into pricing response
   */
  private formatLabTestPricing(test: (typeof COMMON_LAB_TESTS)[0]): LabTestPricing {
    const withoutInsurancePrices = test.providers.map((p) => p.withoutInsurance)
    const lowestPrice = Math.min(...withoutInsurancePrices)
    const averagePrice = withoutInsurancePrices.reduce((a, b) => a + b, 0) / withoutInsurancePrices.length

    return {
      testName: test.testName,
      cptCode: test.cptCode,
      category: test.category,
      prices: test.providers,
      lowestPrice,
      averagePrice,
      potentialSavings: averagePrice - lowestPrice,
    }
  }

  /**
   * Format static lab test data into comparison response
   */
  private formatLabTestComparison(test: (typeof COMMON_LAB_TESTS)[0]): LabTestComparison {
    const withoutInsurancePrices = test.providers.map((p) => p.withoutInsurance)
    const lowestPrice = Math.min(...withoutInsurancePrices)
    const averagePrice = withoutInsurancePrices.reduce((a, b) => a + b, 0) / withoutInsurancePrices.length

    return {
      testName: test.testName,
      prices: test.providers,
      lowestPrice,
      averagePrice,
      potentialSavings: averagePrice - lowestPrice,
    }
  }

  /**
   * Get estimated pricing for unknown lab tests
   */
  private getEstimatedLabTestPricing(testName: string): LabTestComparison {
    // Provide reasonable estimates for unknown tests
    return {
      testName,
      prices: [
        { provider: 'LabCorp', withInsurance: 30, withoutInsurance: 75 },
        { provider: 'Quest Diagnostics', withInsurance: 28, withoutInsurance: 70 },
        { provider: 'DPC Affiliate', withoutInsurance: 30 },
      ],
      lowestPrice: 30,
      averagePrice: 58.33,
      potentialSavings: 28.33,
    }
  }

  /**
   * Seed common lab tests to database
   */
  async seedLabTests(): Promise<void> {
    console.log('Seeding lab test prices to database...')

    for (const test of COMMON_LAB_TESTS) {
      for (const provider of test.providers) {
        const labProvider = this.mapProviderToEnum(provider.provider)

        await prisma.labTestPrice.upsert({
          where: {
            id: `${test.cptCode}-${labProvider}`,
          },
          create: {
            id: `${test.cptCode}-${labProvider}`,
            testName: test.testName,
            cptCode: test.cptCode,
            category: test.category,
            cashPrice: provider.withoutInsurance,
            dpcPrice: provider.provider === 'DPC Affiliate' ? provider.withoutInsurance : null,
            insuranceEstimate: provider.withInsurance ?? null,
            labProvider,
            verified: true,
          },
          update: {
            cashPrice: provider.withoutInsurance,
            dpcPrice: provider.provider === 'DPC Affiliate' ? provider.withoutInsurance : null,
            insuranceEstimate: provider.withInsurance ?? null,
            lastUpdated: new Date(),
          },
        })
      }
    }

    console.log(`Seeded ${COMMON_LAB_TESTS.length} lab tests`)
  }

  /**
   * Map provider string to LabProvider enum
   */
  private mapProviderToEnum(provider: string): LabProvider {
    const map: Record<string, LabProvider> = {
      LabCorp: 'LABCORP',
      'Quest Diagnostics': 'QUEST',
      'Any Lab Test Now': 'ANYLABTESTNOW',
      'Health Gorilla': 'HEALTH_GORILLA',
      'DPC Affiliate': 'DPC_AFFILIATE',
    }
    return map[provider] || 'OTHER'
  }
}

// Export singleton instance
export const labTestPricingService = new LabTestPricingService()
