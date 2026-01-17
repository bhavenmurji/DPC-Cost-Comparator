/**
 * Browser Scrape Missing DPCA Profiles
 *
 * Uses Playwright to visit each DPCA profile with missing location
 * and extract address data that the regex-based scraper missed.
 */

import { chromium } from 'playwright'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ExtractedData {
  address?: string
  city?: string
  state?: string
  zipCode?: string
  specialty?: string
  website?: string
}

async function extractProfileData(page: any): Promise<ExtractedData | null> {
  try {
    // Wait for content to load
    await page.waitForTimeout(2000)

    const data: ExtractedData = {}

    // Try to find address paragraph (look for address icon + text)
    const addressText = await page.evaluate(() => {
      // Look for paragraph after address image
      const addressImg = document.querySelector('img[alt="address"]')
      if (addressImg) {
        const nextP = addressImg.parentElement?.querySelector('p')
        if (nextP) return nextP.textContent?.trim()
      }

      // Alternative: look for any paragraph with address pattern
      const paragraphs = document.querySelectorAll('main p')
      for (const p of paragraphs) {
        const text = p.textContent || ''
        // Look for patterns like "123 Street Name, City, ST 12345"
        if (/\d+.*\d{5}/.test(text)) {
          return text.trim()
        }
      }
      return null
    })

    if (addressText) {
      // Parse the address
      // Format: "123 Street Name CITY, ST 12345" or "123 Street Name, City, ST 12345"
      const zipMatch = addressText.match(/(\d{5}(?:-\d{4})?)/)
      const stateMatch = addressText.match(/\b([A-Z]{2})\s+\d{5}/)

      if (zipMatch && stateMatch) {
        data.zipCode = zipMatch[1]
        data.state = stateMatch[1]

        // Extract city - text before state
        const beforeState = addressText.substring(0, addressText.indexOf(stateMatch[0]))
        const cityMatch = beforeState.match(/([A-Z][A-Za-z\s]+),?\s*$/)
        if (cityMatch) {
          // Normalize city case (ELIZABETH CITY -> Elizabeth City)
          data.city = cityMatch[1].trim().split(/\s+/)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ')
        }

        // Everything before city is the street address
        if (data.city) {
          const cityIndex = addressText.toUpperCase().indexOf(data.city.toUpperCase())
          if (cityIndex > 0) {
            data.address = addressText.substring(0, cityIndex).trim().replace(/,\s*$/, '')
          }
        }
      }
    }

    // Extract specialty
    const specialty = await page.evaluate(() => {
      const specHeader = [...document.querySelectorAll('div')].find(
        d => d.textContent?.includes('Core Specialties')
      )
      if (specHeader) {
        const next = specHeader.nextElementSibling
        if (next) return next.textContent?.trim()
      }
      return null
    })
    if (specialty) data.specialty = specialty

    // Extract website
    const website = await page.evaluate(() => {
      const practiceLink = [...document.querySelectorAll('a')].find(
        a => a.textContent && !a.textContent.includes('dpcalliance') &&
          (a.href.includes('http') && !a.href.includes('dpcalliance'))
      )
      return practiceLink?.href || null
    })
    if (website) data.website = website

    return Object.keys(data).length > 0 ? data : null
  } catch (error) {
    console.error('Error extracting data:', error)
    return null
  }
}

async function main() {
  console.log('============================================================')
  console.log('Browser Scrape Missing DPCA Profiles')
  console.log('============================================================\n')

  // Get providers with missing location
  const providers = await prisma.dPCProvider.findMany({
    where: {
      id: { startsWith: 'dpca-' },
      state: 'XX'
    },
    select: { id: true, name: true }
  })

  console.log(`Found ${providers.length} providers with missing location\n`)

  if (providers.length === 0) {
    console.log('No providers to process!')
    return
  }

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  let found = 0
  let empty = 0
  const results: Array<{ name: string; data: ExtractedData | null }> = []

  try {
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i]
      const slug = provider.id.replace('dpca-', '')
      const url = `https://www.dpcalliance.org/find-a-dpc-physician/${slug}`

      console.log(`[${i + 1}/${providers.length}] ${provider.name}`)

      const page = await context.newPage()

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })

        const data = await extractProfileData(page)

        if (data && data.state) {
          console.log(`   ✓ Found: ${data.city}, ${data.state} ${data.zipCode}`)

          // Update database
          await prisma.dPCProvider.update({
            where: { id: provider.id },
            data: {
              address: data.address || undefined,
              city: data.city || undefined,
              state: data.state,
              zipCode: data.zipCode || undefined,
              website: data.website || undefined
            }
          })

          found++
          results.push({ name: provider.name, data })
        } else {
          console.log(`   ✗ No address data on profile`)
          empty++
          results.push({ name: provider.name, data: null })
        }
      } catch (error: any) {
        console.log(`   Error: ${error.message?.slice(0, 50)}`)
        empty++
      } finally {
        await page.close()
      }

      // Rate limit
      await new Promise(r => setTimeout(r, 1000))
    }
  } finally {
    await browser.close()
    await prisma.$disconnect()
  }

  console.log('\n============================================================')
  console.log('Summary')
  console.log('============================================================')
  console.log(`  Found & Updated: ${found}`)
  console.log(`  Empty Profiles:  ${empty}`)
  console.log(`  Total:           ${providers.length}`)

  if (found > 0) {
    console.log('\nUpdated providers:')
    results.filter(r => r.data).forEach(r => {
      console.log(`  - ${r.name}: ${r.data?.city}, ${r.data?.state} ${r.data?.zipCode}`)
    })
  }
}

main().catch(console.error)
