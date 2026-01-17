#!/usr/bin/env npx tsx
/**
 * Backfill Coordinates from DPC Frontier
 *
 * Fetches coordinates from DPC Frontier's main page and matches
 * them to existing providers by visiting individual practice pages.
 */

import { PrismaClient } from '@prisma/client'
import { chromium } from 'playwright'

const prisma = new PrismaClient()

interface FrontierPractice {
  id: string       // Practice ID (e.g., "yrenwbyllxeg")
  lat: number      // Latitude
  lng: number      // Longitude
  type: string     // "pure" or "hybrid"
  open: boolean    // Accepting patients?
}

async function main() {
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Coordinate Backfill from DPC Frontier')
  console.log('═══════════════════════════════════════════════════════\n')

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Step 1: Fetch all practice coordinates from main page
  console.log('  Fetching coordinates from DPC Frontier...')
  await page.goto('https://mapper.dpcfrontier.com', { waitUntil: 'networkidle' })

  const practices: FrontierPractice[] = await page.evaluate(`
    (function() {
      var nextData = document.getElementById('__NEXT_DATA__');
      if (nextData) {
        var data = JSON.parse(nextData.textContent || '{}');
        var practices = data.props && data.props.pageProps && data.props.pageProps.practices || [];
        return practices.map(function(p) {
          return { id: p.i, lat: p.l, lng: p.g, type: p.k, open: p.o };
        });
      }
      return [];
    })()
  `)

  console.log('  Found ' + practices.length + ' practices with coordinates\n')

  // Step 2: Get providers without coordinates
  const providersWithoutCoords = await prisma.dPCProvider.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null },
      ],
    },
    select: {
      id: true,
      name: true,
      practiceName: true,
      city: true,
      state: true,
    },
  })

  console.log('  Found ' + providersWithoutCoords.length + ' providers needing coordinates\n')

  // Step 3: For each practice, visit its page to get the name, then match
  const stats = { updated: 0, notFound: 0, errors: 0 }
  const limit = process.argv.includes('--limit')
    ? parseInt(process.argv[process.argv.indexOf('--limit') + 1]) || 100
    : practices.length

  const practiceSubset = practices.slice(0, limit)
  console.log('  Processing ' + practiceSubset.length + ' practices...\n')

  for (let i = 0; i < practiceSubset.length; i++) {
    const practice = practiceSubset[i]
    const progress = '[' + (i + 1) + '/' + practiceSubset.length + ']'

    try {
      // Visit practice page to get name
      await page.goto('https://mapper.dpcfrontier.com/practice/' + practice.id, {
        waitUntil: 'networkidle',
        timeout: 10000,
      })

      const practiceName = await page.evaluate(`
        (function() {
          var h1 = document.querySelector('h1');
          return h1 ? h1.textContent.trim() : null;
        })()
      `)

      if (!practiceName) {
        stats.errors++
        continue
      }

      // Find matching provider by name
      const matchedProvider = await prisma.dPCProvider.findFirst({
        where: {
          OR: [
            { name: { contains: practiceName.substring(0, 20), mode: 'insensitive' } },
            { practiceName: { contains: practiceName.substring(0, 20), mode: 'insensitive' } },
          ],
          latitude: null,
        },
      })

      if (matchedProvider) {
        await prisma.dPCProvider.update({
          where: { id: matchedProvider.id },
          data: {
            latitude: practice.lat,
            longitude: practice.lng,
          },
        })
        stats.updated++
        process.stdout.write('  ' + progress + ' ' + practiceName.substring(0, 30).padEnd(30) + ' -> Updated\n')
      } else {
        stats.notFound++
        process.stdout.write('  ' + progress + ' ' + practiceName.substring(0, 30).padEnd(30) + ' -> No match\n')
      }

      // Rate limiting
      await new Promise(r => setTimeout(r, 300))

    } catch (error) {
      stats.errors++
      process.stdout.write('  ' + progress + ' Error\n')
    }

    // Checkpoint every 100
    if ((i + 1) % 100 === 0) {
      console.log('\n  --- Checkpoint: ' + (i + 1) + ' processed, ' + stats.updated + ' updated ---\n')
    }
  }

  await browser.close()

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Backfill Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log('  Updated: ' + stats.updated)
  console.log('  Not found: ' + stats.notFound)
  console.log('  Errors: ' + stats.errors)
  console.log('═══════════════════════════════════════════════════════\n')

  // Check how many still need coordinates
  const remaining = await prisma.dPCProvider.count({
    where: { latitude: null },
  })
  console.log('  Providers still needing coordinates: ' + remaining + '\n')

  await prisma.$disconnect()
}

main().catch(console.error)
