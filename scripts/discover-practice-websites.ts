#!/usr/bin/env npx tsx
/**
 * Discover Practice Websites
 *
 * Searches for actual practice websites for DPC providers
 * who only have the directory source URL (dpccareers.org).
 *
 * Uses DuckDuckGo search to find practice websites.
 *
 * Usage:
 *   npx tsx scripts/discover-practice-websites.ts            # Process all
 *   npx tsx scripts/discover-practice-websites.ts --limit 10 # Test with 10
 *   npx tsx scripts/discover-practice-websites.ts --report   # Show stats
 */

import { PrismaClient } from '@prisma/client'
import { chromium, Browser, Page } from 'playwright'

const prisma = new PrismaClient()

const args = process.argv.slice(2)
const limit = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1]) || 10
  : undefined
const reportOnly = args.includes('--report')

async function showReport() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Practice Website Discovery Report')
  console.log('═══════════════════════════════════════════════════════\n')

  const total = await prisma.dPCProvider.count()

  const withDPCCareers = await prisma.dPCProvider.count({
    where: { website: { contains: 'dpccareers.org' } },
  })

  const withRealWebsite = await prisma.dPCProvider.count({
    where: {
      website: { not: null },
      NOT: { website: { contains: 'dpccareers.org' } },
    },
  })

  const noWebsite = await prisma.dPCProvider.count({
    where: { website: null },
  })

  console.log('  Website Status:')
  console.log(`    Total providers: ${total}`)
  console.log(`    With real website: ${withRealWebsite}`)
  console.log(`    With dpccareers.org only: ${withDPCCareers}`)
  console.log(`    No website: ${noWebsite}`)
  console.log(`    Need discovery: ${withDPCCareers}`)
  console.log('═══════════════════════════════════════════════════════\n')
}

interface SearchResult {
  url: string
  title: string
  snippet: string
}

async function searchForPracticeWebsite(
  page: Page,
  providerName: string,
  city?: string,
  state?: string
): Promise<string | null> {
  const location = city && state && city !== 'Unknown' ? `${city} ${state}` : ''
  const searchQuery = `"${providerName}" DPC direct primary care ${location}`

  try {
    // Use DuckDuckGo (more reliable for automation)
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })

    // Extract search results
    const results = await page.evaluate(() => {
      const links = document.querySelectorAll('.result__a')
      const urls: string[] = []
      links.forEach((link) => {
        const href = link.getAttribute('href')
        if (href) {
          // DuckDuckGo uses redirect URLs, extract the actual URL
          const match = href.match(/uddg=([^&]+)/)
          if (match) {
            urls.push(decodeURIComponent(match[1]))
          } else if (href.startsWith('http')) {
            urls.push(href)
          }
        }
      })
      return urls.slice(0, 5) // Top 5 results
    })

    // Filter out directory sites and find likely practice websites
    const directoryDomains = [
      'dpccareers.org',
      'dpcfrontier.com',
      'dpcdocs.com',
      'dpcalliance.org',
      'directprimarycare.com',
      'healthgrades.com',
      'vitals.com',
      'zocdoc.com',
      'yelp.com',
      'facebook.com',
      'linkedin.com',
      'twitter.com',
      'instagram.com',
    ]

    for (const url of results) {
      try {
        const domain = new URL(url).hostname.toLowerCase()
        const isDirectory = directoryDomains.some(
          (d) => domain.includes(d) || domain.endsWith('.gov')
        )
        if (!isDirectory) {
          return url
        }
      } catch {
        continue
      }
    }

    return null
  } catch (error) {
    console.log(`  Search error: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Practice Website Discovery')
  console.log('═══════════════════════════════════════════════════════\n')

  if (reportOnly) {
    await showReport()
    await prisma.$disconnect()
    return
  }

  // Find providers with dpccareers.org URLs
  const providers = await prisma.dPCProvider.findMany({
    where: { website: { contains: 'dpccareers.org' } },
    select: { id: true, name: true, practiceName: true, city: true, state: true },
    take: limit,
    orderBy: { name: 'asc' },
  })

  if (providers.length === 0) {
    console.log('  No providers need website discovery.')
    await showReport()
    await prisma.$disconnect()
    return
  }

  console.log(`  Found ${providers.length} providers needing website discovery`)
  if (limit) console.log(`  (Limited to ${limit} for testing)`)
  console.log('')

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  })

  const stats = {
    total: providers.length,
    found: 0,
    notFound: 0,
    errors: 0,
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]
    const name = provider.practiceName || provider.name
    const shortName = name.length > 35 ? name.substring(0, 32) + '...' : name

    process.stdout.write(`  [${i + 1}/${stats.total}] ${shortName}... `)

    try {
      const website = await searchForPracticeWebsite(
        page,
        name,
        provider.city || undefined,
        provider.state || undefined
      )

      if (website) {
        await prisma.dPCProvider.update({
          where: { id: provider.id },
          data: { website },
        })
        stats.found++
        console.log(`✓ ${new URL(website).hostname}`)
      } else {
        stats.notFound++
        console.log(`- Not found`)
      }
    } catch (error) {
      stats.errors++
      console.log(`✗ Error`)
    }

    // Rate limiting - 3 seconds between searches
    await new Promise((r) => setTimeout(r, 3000))
  }

  await page.close()
  await browser.close()

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Discovery Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Total processed: ${stats.total}`)
  console.log(`  Websites found: ${stats.found}`)
  console.log(`  Not found: ${stats.notFound}`)
  console.log(`  Errors: ${stats.errors}`)
  console.log('═══════════════════════════════════════════════════════\n')

  await showReport()
  await prisma.$disconnect()
}

main().catch(console.error)
