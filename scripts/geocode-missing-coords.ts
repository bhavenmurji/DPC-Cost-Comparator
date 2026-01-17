#!/usr/bin/env npx tsx
/**
 * Geocode Missing Coordinates
 *
 * Fills coordinate gaps for providers missing lat/lng using:
 * 1. Nominatim forward geocoding for providers with street addresses
 * 2. ZIP code centroid fallback for others
 *
 * Usage:
 *   npm run geocode:missing           # Process all missing
 *   npm run geocode:missing:test      # Test with first 10
 *   npm run geocode:missing -- --limit 50  # Custom limit
 */

import { PrismaClient } from '@prisma/client'
import axios from 'axios'

const prisma = new PrismaClient()

// Rate limiting for Nominatim (max 1 request/second)
const NOMINATIM_DELAY = 1200 // 1.2 seconds to be safe
const ZIPPOPOTAM_DELAY = 300 // 300ms for ZIP API

interface ForwardGeoResult {
  lat: number
  lon: number
  displayName: string
}

/**
 * Forward geocode an address using Nominatim
 */
async function forwardGeocode(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<ForwardGeoResult | null> {
  try {
    // Build query - try full address first
    const query = `${address}, ${city}, ${state} ${zipCode}, USA`

    const response = await axios.get<Array<{
      lat: string
      lon: string
      display_name: string
    }>>('https://nominatim.openstreetmap.org/search', {
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
    })

    if (response.data && response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon),
        displayName: response.data[0].display_name,
      }
    }

    return null
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`  [Nominatim] Error: ${error.message}`)
    }
    return null
  }
}

/**
 * Get ZIP code centroid from Zippopotam.us
 */
async function getZipCodeCentroid(zipCode: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5)
    if (cleanZip.length !== 5) return null

    const response = await axios.get<{
      places?: Array<{
        latitude: string
        longitude: string
      }>
    }>(`https://api.zippopotam.us/us/${cleanZip}`, {
      timeout: 5000,
    })

    if (response.data.places && response.data.places.length > 0) {
      return {
        lat: parseFloat(response.data.places[0].latitude),
        lon: parseFloat(response.data.places[0].longitude),
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Check if address looks like a real street address (not just city/state)
 */
function hasStreetAddress(address: string): boolean {
  if (!address) return false

  // Skip corrupted data
  if (address.includes('1589036275') || address.includes('accountID')) return false

  // Check for common street indicators
  const streetPatterns = [
    /\d+\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court|pl|place|pkwy|parkway)/i,
    /\d+\s+(n|s|e|w|north|south|east|west)\s+\w+/i,
    /suite\s+\d+/i,
    /floor\s+\d+/i,
    /#\s*\d+/,
  ]

  return streetPatterns.some((pattern) => pattern.test(address))
}

async function main() {
  const args = process.argv.slice(2)
  const limitIndex = args.indexOf('--limit')
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) || 10 : undefined

  console.log('═══════════════════════════════════════════════════════')
  console.log('  Geocode Missing Coordinates')
  console.log('═══════════════════════════════════════════════════════\n')

  // Get providers missing coordinates
  const providers = await prisma.dPCProvider.findMany({
    where: {
      latitude: null,
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      state: true,
      zipCode: true,
    },
    take: limit,
  })

  console.log(`  Found ${providers.length} providers needing coordinates\n`)

  if (providers.length === 0) {
    console.log('  All providers have coordinates!')
    await prisma.$disconnect()
    return
  }

  const stats = {
    total: providers.length,
    nominatimSuccess: 0,
    zipFallbackSuccess: 0,
    failed: 0,
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i]
    const progress = `[${i + 1}/${providers.length}]`

    // Skip corrupted data
    if (provider.address?.includes('1589036275')) {
      console.log(`${progress} ${provider.name.substring(0, 30).padEnd(30)} -> SKIP (corrupted data)`)
      stats.failed++
      continue
    }

    let coords: { lat: number; lon: number } | null = null
    let method = ''

    // Strategy 1: Try Nominatim with full address if we have a street address
    if (hasStreetAddress(provider.address || '')) {
      coords = await forwardGeocode(
        provider.address!,
        provider.city || '',
        provider.state || '',
        provider.zipCode || ''
      )
      if (coords) {
        method = 'nominatim'
        stats.nominatimSuccess++
      }
      await new Promise((r) => setTimeout(r, NOMINATIM_DELAY))
    }

    // Strategy 2: Try Nominatim with city/state/zip
    if (!coords && provider.city && provider.city !== 'Unknown' && provider.state) {
      coords = await forwardGeocode(
        '',
        provider.city,
        provider.state,
        provider.zipCode || ''
      )
      if (coords) {
        method = 'nominatim-city'
        stats.nominatimSuccess++
      }
      await new Promise((r) => setTimeout(r, NOMINATIM_DELAY))
    }

    // Strategy 3: Fall back to ZIP code centroid
    if (!coords && provider.zipCode && provider.zipCode !== '00000') {
      coords = await getZipCodeCentroid(provider.zipCode)
      if (coords) {
        method = 'zip-centroid'
        stats.zipFallbackSuccess++
      }
      await new Promise((r) => setTimeout(r, ZIPPOPOTAM_DELAY))
    }

    // Update database if we got coordinates
    if (coords) {
      await prisma.dPCProvider.update({
        where: { id: provider.id },
        data: {
          latitude: coords.lat,
          longitude: coords.lon,
        },
      })
      console.log(
        `${progress} ${provider.name.substring(0, 30).padEnd(30)} -> ${method} (${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)})`
      )
    } else {
      stats.failed++
      console.log(
        `${progress} ${provider.name.substring(0, 30).padEnd(30)} -> FAILED (no geocoding result)`
      )
    }

    // Checkpoint every 50
    if ((i + 1) % 50 === 0) {
      console.log(`\n  --- Checkpoint: ${i + 1} processed ---\n`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════')
  console.log('  Geocoding Complete')
  console.log('═══════════════════════════════════════════════════════')
  console.log(`  Total processed: ${stats.total}`)
  console.log(`  Nominatim success: ${stats.nominatimSuccess}`)
  console.log(`  ZIP fallback success: ${stats.zipFallbackSuccess}`)
  console.log(`  Total success: ${stats.nominatimSuccess + stats.zipFallbackSuccess}`)
  console.log(`  Failed: ${stats.failed}`)
  console.log('═══════════════════════════════════════════════════════\n')

  // Final count
  const remaining = await prisma.dPCProvider.count({
    where: { latitude: null },
  })
  console.log(`  Providers still missing coordinates: ${remaining}\n`)

  await prisma.$disconnect()
}

main().catch(console.error)
