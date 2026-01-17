/**
 * Fix DPCA Provider States
 *
 * Re-visits DPCA profile pages to extract city, state, zip
 * and update providers that have state = 'XX'
 */

import { chromium, Browser } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// US State abbreviations
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC', 'PR'
]

interface LocationData {
  city: string
  state: string
  zipCode: string
  fullAddress: string
}

async function extractLocationFromPage(page: any): Promise<LocationData | null> {
  try {
    await page.waitForTimeout(1500)

    // Get page text content
    const content = await page.textContent('body')
    if (!content) return null

    // Pattern 1: City, ST ZIPCODE (most common)
    const statePattern = new RegExp(`([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?),?\\s*(${US_STATES.join('|')})\\s*(\\d{5}(?:-\\d{4})?)`, 'g')
    const matches = [...content.matchAll(statePattern)]

    if (matches.length > 0) {
      // Take the first valid match (skip "Bernard MD" type false positives)
      for (const match of matches) {
        const city = match[1].trim()
        const state = match[2]
        const zip = match[3]

        // Skip if city looks like a name (less than 3 chars or is a name)
        if (city.length < 3) continue
        if (['Bernard', 'Smith', 'Johnson', 'Williams'].includes(city)) continue

        return {
          city,
          state,
          zipCode: zip,
          fullAddress: `${city}, ${state} ${zip}`
        }
      }
    }

    // Pattern 2: Try finding address with street
    const addressPattern = /(\d+[^,\n]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Suite|Ste|#)[^,\n]*),?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*([A-Z]{2})\s*(\d{5})/i
    const addressMatch = content.match(addressPattern)

    if (addressMatch) {
      return {
        city: addressMatch[2].trim(),
        state: addressMatch[3].toUpperCase(),
        zipCode: addressMatch[4],
        fullAddress: `${addressMatch[1]}, ${addressMatch[2]}, ${addressMatch[3]} ${addressMatch[4]}`
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting location:', error)
    return null
  }
}

async function main() {
  console.log('============================================================')
  console.log('DPCA Provider State Extraction')
  console.log('============================================================')
  console.log()

  // Parse arguments
  const args = process.argv.slice(2)
  const limitArg = args.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined
  const dryRun = args.includes('--dry-run')

  console.log(`Options: limit=${limit || 'none'}, dryRun=${dryRun}`)

  // Get DPCA providers with unknown state
  const providers = await prisma.dPCProvider.findMany({
    where: {
      id: { startsWith: 'dpca-' },
      state: 'XX'
    },
    select: {
      id: true,
      name: true,
      state: true
    },
    take: limit
  })

  console.log(`Found ${providers.length} DPCA providers with unknown state`)
  console.log()

  if (providers.length === 0) {
    console.log('No providers to update!')
    return
  }

  // Launch browser
  const browser = await chromium.launch({ headless: true })

  let updated = 0
  let failed = 0

  try {
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]
      const slug = provider.id.replace('dpca-', '')
      const profileUrl = `https://www.dpcalliance.org/find-a-dpc-physician/${slug}`

      console.log(`[${i + 1}/${providers.length}] ${provider.name}`)

      const page = await browser.newPage()

      try {
        await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 30000 })

        const location = await extractLocationFromPage(page)

        if (location && US_STATES.includes(location.state)) {
          console.log(`   Found: ${location.city}, ${location.state} ${location.zipCode}`)

          if (!dryRun) {
            await prisma.dPCProvider.update({
              where: { id: provider.id },
              data: {
                city: location.city,
                state: location.state,
                zipCode: location.zipCode,
                address: location.fullAddress
              }
            })
            console.log(`   Updated database`)
          } else {
            console.log(`   [DRY RUN] Would update database`)
          }

          updated++
        } else {
          console.log(`   No location found`)
          failed++
        }
      } catch (error: any) {
        console.log(`   Error: ${error.message?.slice(0, 50)}`)
        failed++
      } finally {
        await page.close()
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 1500))
    }
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }

  console.log()
  console.log('============================================================')
  console.log('Summary')
  console.log('============================================================')
  console.log(`  Updated: ${updated}`)
  console.log(`  Failed:  ${failed}`)
  console.log(`  Total:   ${providers.length}`)
}

main().catch(console.error)
