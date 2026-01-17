#!/usr/bin/env npx tsx
/**
 * Fix Corrupted Provider Data
 *
 * Fixes providers with corrupted address data (New Relic tracking code) by:
 * 1. Searching NPI Registry by physician name
 * 2. Scraping from provider websites if available
 *
 * Usage:
 *   npx tsx scripts/fix-corrupted-providers.ts           # Fix all
 *   npx tsx scripts/fix-corrupted-providers.ts --dry-run # Preview only
 *   npx tsx scripts/fix-corrupted-providers.ts --limit 5 # Fix first 5
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// NPI Registry API rate limit (be conservative)
const NPI_DELAY = 500

interface NPIResult {
  npi: string
  name: string
  firstName: string
  lastName: string
  credential: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
}

/**
 * Search NPI Registry by physician name
 */
async function searchNPIByName(firstName: string, lastName: string): Promise<NPIResult | null> {
  try {
    const params = new URLSearchParams({
      version: '2.1',
      first_name: firstName,
      last_name: lastName,
      enumeration_type: 'NPI-1', // Individual providers only
      limit: '5',
    })

    const response = await axios.get<{
      result_count: number
      results?: Array<{
        number: string
        basic: {
          first_name: string
          last_name: string
          credential?: string
        }
        addresses?: Array<{
          address_purpose: string
          address_1: string
          city: string
          state: string
          postal_code: string
          telephone_number?: string
        }>
      }>
    }>(`https://npiregistry.cms.hhs.gov/api/?${params}`, {
      timeout: 10000,
    })

    if (response.data.result_count > 0 && response.data.results) {
      // Find best match - prefer practice location address
      for (const result of response.data.results) {
        const practiceAddr = result.addresses?.find(
          (a) => a.address_purpose === 'LOCATION'
        )
        const mailingAddr = result.addresses?.find(
          (a) => a.address_purpose === 'MAILING'
        )
        const addr = practiceAddr || mailingAddr

        if (addr) {
          return {
            npi: result.number,
            name: `${result.basic.first_name} ${result.basic.last_name}`,
            firstName: result.basic.first_name,
            lastName: result.basic.last_name,
            credential: result.basic.credential || '',
            address: addr.address_1,
            city: addr.city,
            state: addr.state,
            zipCode: addr.postal_code.substring(0, 5),
            phone: addr.telephone_number || '',
          }
        }
      }
    }

    return null
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`  [NPI] Error: ${error.message}`)
    }
    return null
  }
}

/**
 * Extract first and last name from full name
 */
function parsePhysicianName(fullName: string): { firstName: string; lastName: string } | null {
  // Clean up name
  const name = fullName
    .replace(/,?\s*(MD|DO|PA-C|NP|FNP|CNP|PA|APRN|DNP|MBBS|DPM)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = name.split(' ')
  if (parts.length < 2) return null

  // Handle "LAST, FIRST" format
  if (name.includes(',')) {
    const [lastName, ...firstParts] = name.split(',').map((s) => s.trim())
    return {
      firstName: firstParts.join(' '),
      lastName,
    }
  }

  // Handle "FIRST MIDDLE LAST" - assume last word is last name
  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1],
  }
}

/**
 * Get coordinates for an address using Nominatim
 */
async function geocodeAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const query = `${address}, ${city}, ${state} ${zipCode}, USA`
    const response = await axios.get<Array<{ lat: string; lon: string }>>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: query,
          format: 'json',
          limit: 1,
          countrycodes: 'us',
        },
        headers: {
          'User-Agent': 'DPC-Comparator/1.0 (healthcare cost comparison tool)',
        },
        timeout: 10000,
      }
    )

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
      }
    }
    return null
  } catch {
    return null
  }
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) || 5 : undefined

  console.log('═══════════════════════════════════════════════════════')
  console.log('  Fix Corrupted Provider Data')
  console.log('═══════════════════════════════════════════════════════')
  if (dryRun) console.log('  [DRY RUN - No changes will be made]\n')

  // Get corrupted providers
  const providers = await prisma.dPCProvider.findMany({
    where: {
      OR: [{ address: { contains: '1589036275' } }, { address: { contains: 'accountID' } }],
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
      phone: true,
      website: true,
      npi: true,
    },
    take: limit,
  })

  console.log(`  Found ${providers.length} corrupted providers\n`)

  if (providers.length === 0) {
    console.log('  No corrupted providers found!')
    await prisma.$disconnect()
    return
  }

  const stats = {
    total: providers.length,
    fixed: 0,
    failed: 0,
    skipped: 0,
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]
    const progress = `[${i + 1}/${providers.length}]`

    // Parse name
    const nameParts = parsePhysicianName(provider.name)
    if (!nameParts) {
      console.log(`${progress} ${provider.name.padEnd(30)} -> SKIP (couldn't parse name)`)
      stats.skipped++
      continue
    }

    console.log(
      `${progress} ${provider.name.padEnd(30)} -> Searching NPI Registry (${nameParts.firstName} ${nameParts.lastName})...`
    )

    // Search NPI Registry
    const npiResult = await searchNPIByName(nameParts.firstName, nameParts.lastName)
    await new Promise((r) => setTimeout(r, NPI_DELAY))

    if (npiResult) {
      // Found NPI result, geocode the address
      const coords = await geocodeAddress(
        npiResult.address,
        npiResult.city,
        npiResult.state,
        npiResult.zipCode
      )
      await new Promise((r) => setTimeout(r, 1200)) // Nominatim rate limit

      if (dryRun) {
        console.log(`  -> WOULD UPDATE: ${npiResult.address}, ${npiResult.city}, ${npiResult.state}`)
        if (coords) console.log(`  -> Coords: (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)})`)
        stats.fixed++
      } else {
        await prisma.dPCProvider.update({
          where: { id: provider.id },
          data: {
            npi: npiResult.npi,
            address: npiResult.address,
            city: npiResult.city,
            state: npiResult.state,
            zipCode: npiResult.zipCode,
            phone: npiResult.phone || provider.phone,
            latitude: coords?.lat,
            longitude: coords?.lon,
          },
        })
        console.log(`  -> FIXED: ${npiResult.address}, ${npiResult.city}, ${npiResult.state}`)
        if (coords) console.log(`  -> Geocoded: (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)})`)
        stats.fixed++
      }
    } else {
      console.log(`  -> NOT FOUND in NPI Registry`)
      stats.failed++
    }
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Fix Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Total processed: ${stats.total}`)
  console.log(`  Fixed: ${stats.fixed}`)
  console.log(`  Not found: ${stats.failed}`)
  console.log(`  Skipped: ${stats.skipped}`)
  console.log('═══════════════════════════════════════════════════════\n')

  // Final count
  const remaining = await prisma.dPCProvider.count({
    where: {
      OR: [{ address: { contains: '1589036275' } }, { address: { contains: 'accountID' } }],
    },
  })
  console.log(`  Remaining corrupted: ${remaining}\n`)

  await prisma.$disconnect()
}

main().catch(console.error)
