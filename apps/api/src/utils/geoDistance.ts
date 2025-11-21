/**
 * Geographic Distance Calculation Utilities
 * Uses Haversine formula for calculating distance between coordinates
 */

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface ZipCodeCoordinates {
  zipCode: string
  latitude: number
  longitude: number
}

/**
 * Calculate distance between two geographic points using Haversine formula
 * @param coord1 First coordinate (latitude, longitude)
 * @param coord2 Second coordinate (latitude, longitude)
 * @returns Distance in miles
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(coord2.latitude - coord1.latitude)
  const dLon = toRadians(coord2.longitude - coord1.longitude)

  const lat1 = toRadians(coord1.latitude)
  const lat2 = toRadians(coord2.latitude)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Estimate coordinates from ZIP code (simplified approximation)
 * In production, use a proper ZIP code geocoding service or database
 */
export function estimateCoordinatesFromZip(zipCode: string): Coordinates | null {
  // This is a very simplified approximation for US ZIP codes
  // In production, replace with actual ZIP code database lookup
  const zip = parseInt(zipCode)

  if (isNaN(zip) || zip < 0 || zip > 99999) {
    return null
  }

  // Rough approximation based on ZIP code ranges
  // ZIP codes 00000-09999: Northeast
  // ZIP codes 10000-19999: Northeast/Mid-Atlantic
  // ZIP codes 20000-29999: Southeast
  // ZIP codes 30000-39999: Southeast
  // ZIP codes 40000-49999: Midwest
  // ZIP codes 50000-59999: Central
  // ZIP codes 60000-69999: Midwest
  // ZIP codes 70000-79999: South Central
  // ZIP codes 80000-89999: Mountain/West
  // ZIP codes 90000-99999: Pacific

  const firstDigit = Math.floor(zip / 10000)
  const secondDigit = Math.floor((zip % 10000) / 1000)

  // Better approximations for major ZIP code regions
  let latitude: number
  let longitude: number

  if (firstDigit === 0) {
    // 00000-09999: Northeast (NY, NJ, CT, MA, etc.)
    latitude = 40.7 + (secondDigit - 5) * 0.8
    longitude = -74 - (secondDigit - 5) * 1.2
  } else if (firstDigit === 1) {
    // 10000-19999: Mid-Atlantic (PA, DE, MD)
    latitude = 40 + (secondDigit - 5) * 0.6
    longitude = -76 - (secondDigit - 5) * 1
  } else if (firstDigit === 2) {
    // 20000-29999: Southeast (DC, VA, WV)
    latitude = 38 + (secondDigit - 5) * 0.5
    longitude = -78 - (secondDigit - 5) * 0.8
  } else if (firstDigit === 3) {
    // 30000-39999: Southeast (GA, FL, AL)
    latitude = 33 + (secondDigit - 5) * 0.4
    longitude = -84 - (secondDigit - 5) * 0.6
  } else if (firstDigit >= 4 && firstDigit <= 6) {
    // 40000-69999: Midwest (OH, IN, IL, MI, WI, MN)
    latitude = 40 - (firstDigit - 4) * 1.5
    longitude = -86 - (firstDigit - 4) * 4
  } else if (firstDigit >= 7 && firstDigit <= 8) {
    // 70000-89999: South/Central/Mountain (TX, CO, MT, etc.)
    latitude = 35 + (firstDigit - 7) * 3
    longitude = -95 - (firstDigit - 7) * 12
  } else {
    // 90000-99999: Pacific (CA, OR, WA, AK, HI)
    // More accurate California ZIP code estimation
    if (zip >= 90000 && zip <= 96199) {
      // Southern California (90000-96199)
      latitude = 34 + ((zip % 10000) / 10000) * 2
      longitude = -118 - ((zip % 10000) / 10000) * 4
    } else if (zip >= 96200 && zip <= 96999) {
      // Northern California / Oregon border
      latitude = 40 + ((zip % 1000) / 1000) * 2
      longitude = -122 - ((zip % 1000) / 1000) * 2
    } else if (zip >= 97000 && zip <= 97999) {
      // Oregon
      latitude = 44 + ((zip % 1000) / 1000) * 2
      longitude = -122 - ((zip % 1000) / 1000) * 2
    } else if (zip >= 98000 && zip <= 99499) {
      // Washington
      latitude = 47 + ((zip % 1000) / 1000) * 2
      longitude = -122 - ((zip % 1000) / 1000) * 2
    } else {
      // Alaska and Hawaii
      latitude = 37 + (secondDigit - 5) * 0.8
      longitude = -119 - (secondDigit - 5) * 1.5
    }
  }

  return {
    latitude: Math.max(24, Math.min(50, latitude)),
    longitude: Math.max(-125, Math.min(-66, longitude)),
  }
}

/**
 * Calculate bounding box for geographic search
 * @param center Center coordinates
 * @param radiusMiles Search radius in miles
 * @returns Min/max latitude and longitude
 */
export function calculateBoundingBox(
  center: Coordinates,
  radiusMiles: number
): {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
} {
  const latDegrees = radiusMiles / 69 // 1 degree latitude ≈ 69 miles
  const lonDegrees = radiusMiles / (69 * Math.cos(toRadians(center.latitude)))

  return {
    minLat: center.latitude - latDegrees,
    maxLat: center.latitude + latDegrees,
    minLon: center.longitude - lonDegrees,
    maxLon: center.longitude + lonDegrees,
  }
}

/**
 * Validate coordinates
 */
export function isValidCoordinates(coord: Coordinates): boolean {
  return (
    coord.latitude >= -90 &&
    coord.latitude <= 90 &&
    coord.longitude >= -180 &&
    coord.longitude <= 180
  )
}
