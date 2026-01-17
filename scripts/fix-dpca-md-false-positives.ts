/**
 * Fix DPCA MD False Positives & Missing Locations
 *
 * Re-visits DPCA profiles with improved pattern matching to:
 * 1. Fix false MD positives (name matched as Maryland)
 * 2. Extract locations for providers with state=XX
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Valid Maryland zip codes start with 206-219
const MD_ZIP_PREFIXES = ['206', '207', '208', '209', '210', '211', '212', '214', '215', '216', '217', '218', '219']

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
  confidence: 'high' | 'medium' | 'low'
}

function isValidMDZip(zip: string): boolean {
  return MD_ZIP_PREFIXES.some(prefix => zip.startsWith(prefix))
}

function looksLikeName(text: string, providerName: string): boolean {
  const cleaned = text.trim()
  const nameLower = providerName.toLowerCase()

  // Check if city contains parts of the provider's name
  const nameParts = nameLower.split(/\s+/).filter(p => p.length > 2)
  for (const part of nameParts) {
    if (cleaned.toLowerCase().includes(part)) {
      return true
    }
  }

  // Common titles/suffixes that indicate a name, not a city
  if (/,?\s*(MD|DO|PhD|Jr|Sr|III|II|Owner|Physician)$/i.test(cleaned)) {
    return true
  }

  // Common first names
  const commonFirstNames = [
    'Michael', 'John', 'James', 'Robert', 'David', 'William', 'Richard',
    'Joseph', 'Thomas', 'Charles', 'Christopher', 'Daniel', 'Matthew',
    'Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan',
    'Sarah', 'Karen', 'Nancy', 'Lisa', 'Jessica', 'Amanda', 'Melissa',
    'Rebekah', 'Gregory', 'Bukie', 'Aimee', 'Katy', 'Physician', 'Owner'
  ]

  const words = cleaned.split(/\s+/)
  if (words.length <= 3 && commonFirstNames.some(n => words[0] === n)) {
    return true
  }

  return false
}

async function extractLocationFromPage(page: any, providerName: string): Promise<LocationData | null> {
  try {
    await page.waitForTimeout(2000)

    const content = await page.textContent('body')
    if (!content) return null

    // Strategy 1: Look for specific address block patterns
    const addressBlockPattern = /(\d+[^,\n]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Place|Pl|Highway|Hwy)[^,\n]*),?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/gi

    let match
    while ((match = addressBlockPattern.exec(content)) !== null) {
      const city = match[2].trim()
      const state = match[3].toUpperCase()
      const zip = match[4]

      if (!US_STATES.includes(state)) continue
      if (looksLikeName(city, providerName)) continue
      if (state === 'MD' && !isValidMDZip(zip)) continue

      return { city, state, zipCode: zip, confidence: 'high' }
    }

    // Strategy 2: Look for City, ST ZIP pattern
    const cityStateZipPattern = new RegExp(
      `([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?(?:\\s+[A-Z][a-z]+)?),?\\s*(${US_STATES.join('|')})\\s+(\\d{5}(?:-\\d{4})?)`,
      'g'
    )

    while ((match = cityStateZipPattern.exec(content)) !== null) {
      const city = match[1].trim()
      const state = match[2]
      const zip = match[3]

      if (looksLikeName(city, providerName)) continue
      if (city.length < 4) continue
      if (state === 'MD' && !isValidMDZip(zip)) continue

      return { city, state, zipCode: zip, confidence: 'medium' }
    }

    return null
  } catch (error) {
    console.error('Error extracting location:', error)
    return null
  }
}

async function main() {
  console.log('============================================================')
  console.log('DPCA MD False Positive & Missing Location Fixer')
  console.log('============================================================\n')

  // Get providers needing fix - MD with invalid zip or XX state
  const allMD = await prisma.dPCProvider.findMany({
    where: {
      id: { startsWith: 'dpca-' },
      state: 'MD'
    },
    select: { id: true, name: true, city: true, state: true, zipCode: true }
  })

  const allXX = await prisma.dPCProvider.findMany({
    where: {
      id: { startsWith: 'dpca-' },
      state: 'XX'
    },
    select: { id: true, name: true, city: true, state: true, zipCode: true }
  })

  // Filter MD to only false positives (invalid MD zip codes)
  const falseMD = allMD.filter(p => p.zipCode && !isValidMDZip(p.zipCode))

  const problematic = [...falseMD, ...allXX]

  console.log(`Found ${problematic.length} providers needing fix:`)
  console.log(`  - ${falseMD.length} MD false positives`)
  console.log(`  - ${allXX.length} with state=XX`)
  console.log()

  if (problematic.length === 0) {
    console.log('No providers to fix!')
    return
  }

  const browser = await chromium.launch({ headless: true })

  let fixed = 0
  let reset = 0
  let stillFailed = 0

  try {
    for (let i = 0; i < problematic.length; i++) {
      const provider = problematic[i]
      const slug = provider.id.replace('dpca-', '')
      const profileUrl = `https://www.dpcalliance.org/find-a-dpc-physician/${slug}`

      const issue = provider.state === 'XX' ? 'no location' : 'MD false positive'
      console.log(`[${i + 1}/${problematic.length}] ${provider.name} (${issue})`)
      console.log(`   Current: ${provider.city || 'null'}, ${provider.state} ${provider.zipCode || 'null'}`)

      const page = await browser.newPage()

      try {
        await page.goto(profileUrl, { waitUntil: 'networkidle', timeout: 30000 })

        const location = await extractLocationFromPage(page, provider.name)

        if (location && US_STATES.includes(location.state)) {
          console.log(`   Found: ${location.city}, ${location.state} ${location.zipCode} [${location.confidence}]`)

          await prisma.dPCProvider.update({
            where: { id: provider.id },
            data: {
              city: location.city,
              state: location.state,
              zipCode: location.zipCode
            }
          })
          console.log(`   Fixed!`)
          fixed++
        } else {
          console.log(`   Still no valid location found`)

          // Reset to XX if it was a false MD positive
          if (provider.state === 'MD') {
            await prisma.dPCProvider.update({
              where: { id: provider.id },
              data: {
                city: 'Unknown',
                state: 'XX',
                zipCode: '00000'
              }
            })
            console.log(`   Reset to XX (was false positive)`)
            reset++
          } else {
            stillFailed++
          }
        }
      } catch (error: any) {
        console.log(`   Error: ${error.message?.slice(0, 50)}`)
        stillFailed++
      } finally {
        await page.close()
      }

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
  console.log(`  Fixed:        ${fixed}`)
  console.log(`  Reset to XX:  ${reset}`)
  console.log(`  Still Failed: ${stillFailed}`)
  console.log(`  Total:        ${problematic.length}`)
}

main().catch(console.error)
