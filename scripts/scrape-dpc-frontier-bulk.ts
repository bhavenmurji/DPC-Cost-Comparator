#!/usr/bin/env npx tsx
/**
 * Bulk DPC Frontier Pricing Scraper
 *
 * Scrapes all practices from DPC Frontier mapper and extracts pricing data.
 * Uses Playwright to handle JavaScript-rendered pages.
 *
 * Usage:
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts              # Scrape all
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts --limit 100  # Limit to 100
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts --offset 500 # Start from 500
 *   npx tsx scripts/scrape-dpc-frontier-bulk.ts --report     # Show stats only
 */

import { PrismaClient } from '@prisma/client'
import { chromium, Page } from 'playwright'

const prisma = new PrismaClient()

const args = process.argv.slice(2)
const limit = args.includes('--limit')
  ? parseInt(args[args.indexOf('--limit') + 1]) || 100
  : undefined
const offset = args.includes('--offset')
  ? parseInt(args[args.indexOf('--offset') + 1]) || 0
  : 0
const reportOnly = args.includes('--report')

interface PricingTier {
  label: string
  monthlyFee: number
  ageMin?: number
  ageMax?: number
}

interface PracticeData {
  id: string
  name: string
  website: string | null
  city: string
  state: string
  address: string
  zipCode: string
  phone: string
  specialty: string
  pricing: {
    individualMonthly: number | null
    childMonthly: number | null
    familyMonthly: number | null
    enrollmentFee: number | null
    perVisitFee: number | null
    pricingTiers: PricingTier[] | null
    pricingNotes: string | null
    pricingConfidence: 'high' | 'medium' | 'low' | 'none'
  }
}

async function getPracticeIds(page: Page): Promise<string[]> {
  await page.goto('https://mapper.dpcfrontier.com', { waitUntil: 'networkidle' })

  const ids = await page.evaluate(`
    (function() {
      var nextData = document.getElementById('__NEXT_DATA__');
      if (nextData) {
        var data = JSON.parse(nextData.textContent || '{}');
        var practices = data.props && data.props.pageProps && data.props.pageProps.practices || [];
        return practices.map(function(p) { return p.i; });
      }
      return [];
    })()
  `)

  return ids as string[]
}

async function scrapePractice(page: Page, practiceId: string): Promise<PracticeData | null> {
  try {
    await page.goto(`https://mapper.dpcfrontier.com/practice/${practiceId}`, {
      waitUntil: 'networkidle',
      timeout: 15000,
    })

    // Extract data using string-based evaluate to avoid transpilation issues
    const rawData = await page.evaluate(`
      (function() {
        var title = '';
        var h1 = document.querySelector('h1');
        if (h1) title = h1.textContent.trim();

        var subtitle = '';
        var h2 = document.querySelector('h2');
        if (h2) subtitle = h2.textContent.trim();

        var city = 'Unknown';
        var state = 'Unknown';
        var locationMatch = subtitle.match(/in (.+), ([A-Z]{2})/);
        if (locationMatch) {
          city = locationMatch[1];
          state = locationMatch[2];
        }

        var address = '';
        var directionsLink = document.querySelector('a[href*="google.com/maps"]');
        if (directionsLink) {
          var href = directionsLink.getAttribute('href');
          var addressMatch = href.match(/query=([^&]+)/);
          if (addressMatch) {
            address = decodeURIComponent(addressMatch[1]).replace(/%2C/g, ',');
          }
        }

        var website = null;
        var links = document.querySelectorAll('a[href^="http"]');
        for (var i = 0; i < links.length; i++) {
          var href = links[i].getAttribute('href');
          if (href && href.indexOf('google.com') === -1 && href.indexOf('dpcfrontier') === -1) {
            website = href;
            break;
          }
        }

        var phone = '';
        var pageText = document.body.innerText;
        var phoneMatch = pageText.match(/(\\d{3}[-.)\\s]*\\d{3}[-.)\\s]*\\d{4}|\\(\\d{3}\\)\\s*\\d{3}[-.]?\\d{4})/);
        if (phoneMatch) phone = phoneMatch[0];

        var specialty = 'Family Medicine';
        var allText = document.body.innerText;
        if (allText.indexOf('Internal Medicine') > -1) specialty = 'Internal Medicine';
        else if (allText.indexOf('Pediatric') > -1) specialty = 'Pediatrics';
        else if (allText.indexOf('OB/GYN') > -1) specialty = 'OB/GYN';

        var pricingKnown = false;
        var tiers = [];
        var enrollmentFee = null;
        var perVisitFee = null;

        if (allText.indexOf('Membership prices') > -1 && allText.indexOf('Unknown.') > -1) {
          pricingKnown = false;
        } else {
          var priceElements = document.querySelectorAll('strong, b');
          for (var j = 0; j < priceElements.length; j++) {
            var text = priceElements[j].textContent.trim();
            var priceMatch = text.match(/\\$(\\d+)/);
            if (priceMatch) {
              var price = parseInt(priceMatch[1]);
              var parent = priceElements[j].parentElement;
              var fullText = parent ? parent.textContent : '';
              var labelMatch = fullText.match(/^([^$]+)\\$/);
              var label = labelMatch ? labelMatch[1].trim() : 'Tier ' + (j + 1);

              var ageMin = null;
              var ageMax = null;
              var ageMatch = label.match(/(\\d+)\\s*[-–to]+\\s*(\\d+)/);
              var singleAgeMatch = label.match(/(\\d+)\\+/);
              if (ageMatch) {
                ageMin = parseInt(ageMatch[1]);
                ageMax = parseInt(ageMatch[2]);
              } else if (singleAgeMatch) {
                ageMin = parseInt(singleAgeMatch[1]);
                ageMax = 99;
              }

              tiers.push({
                label: label,
                monthlyFee: price,
                ageMin: ageMin,
                ageMax: ageMax
              });
              pricingKnown = true;
            }
          }

          var enrollMatch = allText.match(/Enrollment fee[:\\s]*\\*?\\*?\\$(\\d+)/i);
          if (enrollMatch) enrollmentFee = parseInt(enrollMatch[1]);

          var visitMatch = allText.match(/Per-visit fee[:\\s]*\\*?\\*?\\$(\\d+)/i);
          if (visitMatch) perVisitFee = parseInt(visitMatch[1]);
        }

        return {
          name: title,
          website: website,
          city: city,
          state: state,
          address: address,
          phone: phone,
          specialty: specialty,
          pricingKnown: pricingKnown,
          tiers: tiers,
          enrollmentFee: enrollmentFee,
          perVisitFee: perVisitFee
        };
      })()
    `)

    const data = rawData as any
    if (!data || !data.name) return null

    // Process the extracted data
    const tiers: PricingTier[] = data.tiers || []
    const adultTier = tiers.find(
      (t) =>
        t.label.toLowerCase().includes('adult') ||
        t.label.toLowerCase().includes('18+') ||
        t.label.toLowerCase().includes('individual') ||
        t.label.toLowerCase().includes('prime') ||
        (t.ageMin && t.ageMin >= 18 && t.ageMin < 30)
    )
    const childTier = tiers.find(
      (t) =>
        t.label.toLowerCase().includes('child') ||
        t.label.toLowerCase().includes('0-') ||
        t.label.toLowerCase().includes('pediatric') ||
        (t.ageMax && t.ageMax <= 19)
    )
    const familyTier = tiers.find((t) => t.label.toLowerCase().includes('family'))

    // Extract zip code from address
    const zipMatch = data.address.match(/\b(\d{5})(?:-\d{4})?\b/)
    const zipCode = zipMatch ? zipMatch[1] : '00000'

    return {
      id: practiceId,
      name: data.name,
      website: data.website,
      city: data.city,
      state: data.state,
      address: data.address,
      zipCode: zipCode,
      phone: data.phone,
      specialty: data.specialty,
      pricing: {
        individualMonthly: adultTier?.monthlyFee || tiers[0]?.monthlyFee || null,
        childMonthly: childTier?.monthlyFee || null,
        familyMonthly: familyTier?.monthlyFee || null,
        enrollmentFee: data.enrollmentFee,
        perVisitFee: data.perVisitFee,
        pricingTiers: tiers.length > 0 ? tiers : null,
        pricingNotes: `Scraped from DPC Frontier. ${data.specialty}.`,
        pricingConfidence: data.pricingKnown && tiers.length > 0 ? 'high' : 'none',
      },
    }
  } catch (error) {
    return null
  }
}

async function savePractice(practice: PracticeData): Promise<boolean> {
  try {
    // Check if provider already exists
    let existing = null
    try {
      existing = await prisma.dPCProvider.findFirst({
        where: {
          OR: [
            { practiceName: { contains: practice.name.substring(0, 20), mode: 'insensitive' } },
          ],
        },
      })
    } catch {
      // Ignore search errors
    }

    if (existing) {
      // Update if we have pricing and existing doesn't
      if (practice.pricing.pricingConfidence === 'high' && existing.pricingConfidence !== 'high') {
        await prisma.dPCProvider.update({
          where: { id: existing.id },
          data: {
            website: practice.website || existing.website,
            monthlyFee: practice.pricing.individualMonthly || existing.monthlyFee,
            childMonthlyFee: practice.pricing.childMonthly,
            familyFee: practice.pricing.familyMonthly,
            enrollmentFee: practice.pricing.enrollmentFee,
            pricingTiers: practice.pricing.pricingTiers
              ? JSON.stringify(practice.pricing.pricingTiers)
              : existing.pricingTiers,
            pricingNotes: practice.pricing.pricingNotes,
            pricingConfidence: practice.pricing.pricingConfidence,
            pricingScrapedAt: new Date(),
          },
        })
        return true
      }
      return false
    }

    // Create new provider
    await prisma.dPCProvider.create({
      data: {
        name: practice.name,
        practiceName: practice.name,
        website: practice.website,
        address: practice.address || 'DPC Frontier',
        city: practice.city,
        state: practice.state,
        zipCode: practice.zipCode,
        phone: practice.phone || 'Unknown',
        monthlyFee: practice.pricing.individualMonthly || 0,
        childMonthlyFee: practice.pricing.childMonthly,
        familyFee: practice.pricing.familyMonthly,
        enrollmentFee: practice.pricing.enrollmentFee,
        pricingTiers: practice.pricing.pricingTiers
          ? JSON.stringify(practice.pricing.pricingTiers)
          : null,
        pricingNotes: practice.pricing.pricingNotes,
        pricingConfidence: practice.pricing.pricingConfidence,
        pricingScrapedAt: new Date(),
        servicesIncluded: [],
        dataSource: 'dpc_frontier',
      },
    })
    return true
  } catch (error) {
    return false
  }
}

async function showReport() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  DPC Frontier Bulk Scraper Report')
  console.log('═══════════════════════════════════════════════════════\n')

  const total = await prisma.dPCProvider.count()
  const withPricing = await prisma.dPCProvider.count({
    where: { pricingConfidence: 'high' },
  })
  const fromFrontier = await prisma.dPCProvider.count({
    where: { dataSource: 'dpc_frontier' },
  })

  const avgPrice = await prisma.dPCProvider.aggregate({
    _avg: { monthlyFee: true },
    _min: { monthlyFee: true },
    _max: { monthlyFee: true },
    where: { monthlyFee: { gt: 0 } },
  })

  const byState = await prisma.dPCProvider.groupBy({
    by: ['state'],
    _count: true,
    where: { pricingConfidence: 'high' },
    orderBy: { _count: { state: 'desc' } },
    take: 10,
  })

  console.log('  Coverage:')
  console.log(`    Total providers: ${total}`)
  console.log(`    With verified pricing: ${withPricing} (${((withPricing / total) * 100).toFixed(1)}%)`)
  console.log(`    From DPC Frontier: ${fromFrontier}`)
  console.log('')
  console.log('  Pricing Statistics:')
  console.log(`    Average: $${Math.round(avgPrice._avg.monthlyFee || 0)}/month`)
  console.log(`    Min: $${avgPrice._min.monthlyFee}/month`)
  console.log(`    Max: $${avgPrice._max.monthlyFee}/month`)
  console.log('')
  console.log('  Top States with Pricing:')
  byState.forEach((s) => {
    console.log(`    ${s.state}: ${s._count} providers`)
  })
  console.log('═══════════════════════════════════════════════════════\n')
}

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  DPC Frontier Bulk Pricing Scraper')
  console.log('═══════════════════════════════════════════════════════\n')

  if (reportOnly) {
    await showReport()
    await prisma.$disconnect()
    return
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  })

  console.log('  Fetching practice IDs from DPC Frontier...')
  const allIds = await getPracticeIds(page)
  console.log(`  Found ${allIds.length} total practices\n`)

  // Apply offset and limit
  const practiceIds = limit ? allIds.slice(offset, offset + limit) : allIds.slice(offset)
  console.log(`  Processing ${practiceIds.length} practices (offset: ${offset})`)
  if (limit) console.log(`  (Limited to ${limit} for this run)`)
  console.log('')

  const stats = {
    total: practiceIds.length,
    withPricing: 0,
    noPricing: 0,
    saved: 0,
    errors: 0,
  }

  const batchSize = 50
  for (let i = 0; i < practiceIds.length; i++) {
    const practiceId = practiceIds[i]
    const progress = `[${i + 1}/${stats.total}]`

    try {
      const practice = await scrapePractice(page, practiceId)

      if (!practice) {
        stats.errors++
        process.stdout.write(`  ${progress} Error\n`)
        continue
      }

      const hasPricing = practice.pricing.pricingConfidence === 'high'
      if (hasPricing) {
        stats.withPricing++
        const saved = await savePractice(practice)
        if (saved) stats.saved++
        const shortName = practice.name.substring(0, 30).padEnd(30)
        process.stdout.write(
          `  ${progress} ${shortName} $${practice.pricing.individualMonthly}/mo ${saved ? '✓' : '(exists)'}\n`
        )
      } else {
        stats.noPricing++
        // Still save the practice even without pricing
        await savePractice(practice)
        const shortName = practice.name.substring(0, 30).padEnd(30)
        process.stdout.write(`  ${progress} ${shortName} - no pricing\n`)
      }

      // Rate limiting - 500ms between requests (faster)
      await new Promise((r) => setTimeout(r, 500))

      // Progress checkpoint every batch
      if ((i + 1) % batchSize === 0) {
        console.log(`\n  --- Checkpoint: ${i + 1}/${stats.total} processed, ${stats.withPricing} with pricing ---\n`)
      }
    } catch (error) {
      stats.errors++
      process.stdout.write(`  ${progress} Error\n`)
    }
  }

  await page.close()
  await browser.close()

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Scraping Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Total processed: ${stats.total}`)
  console.log(`  With pricing: ${stats.withPricing}`)
  console.log(`  No pricing: ${stats.noPricing}`)
  console.log(`  Saved/updated: ${stats.saved}`)
  console.log(`  Errors: ${stats.errors}`)
  console.log('═══════════════════════════════════════════════════════\n')

  await showReport()
  await prisma.$disconnect()
}

main().catch(console.error)
