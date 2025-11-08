/**
 * Unit tests for geographic distance calculations
 */

import { describe, it, expect } from 'vitest'
import {
  calculateHaversineDistance,
  estimateCoordinatesFromZip,
  calculateBoundingBox,
  isValidCoordinates,
  type Coordinates,
} from '../../apps/api/src/utils/geoDistance'

describe('geoDistance utilities', () => {
  describe('calculateHaversineDistance', () => {
    it('should calculate distance between Austin and Houston correctly', () => {
      const austin: Coordinates = { latitude: 30.2672, longitude: -97.7431 }
      const houston: Coordinates = { latitude: 29.7604, longitude: -95.3698 }

      const distance = calculateHaversineDistance(austin, houston)

      // Expected distance is approximately 146 miles
      expect(distance).toBeGreaterThan(140)
      expect(distance).toBeLessThan(152)
    })

    it('should calculate distance between NYC and LA correctly', () => {
      const nyc: Coordinates = { latitude: 40.7128, longitude: -74.0060 }
      const la: Coordinates = { latitude: 34.0522, longitude: -118.2437 }

      const distance = calculateHaversineDistance(nyc, la)

      // Expected distance is approximately 2445 miles
      expect(distance).toBeGreaterThan(2400)
      expect(distance).toBeLessThan(2500)
    })

    it('should return 0 for same coordinates', () => {
      const coord: Coordinates = { latitude: 30.2672, longitude: -97.7431 }

      const distance = calculateHaversineDistance(coord, coord)

      expect(distance).toBe(0)
    })

    it('should handle very short distances accurately', () => {
      const coord1: Coordinates = { latitude: 30.2672, longitude: -97.7431 }
      const coord2: Coordinates = { latitude: 30.2680, longitude: -97.7440 }

      const distance = calculateHaversineDistance(coord1, coord2)

      // Should be less than 1 mile
      expect(distance).toBeLessThan(1)
      expect(distance).toBeGreaterThan(0)
    })
  })

  describe('estimateCoordinatesFromZip', () => {
    it('should estimate coordinates for valid ZIP code', () => {
      const coords = estimateCoordinatesFromZip('78701')

      expect(coords).not.toBeNull()
      expect(coords?.latitude).toBeGreaterThan(24)
      expect(coords?.latitude).toBeLessThan(50)
      expect(coords?.longitude).toBeGreaterThan(-125)
      expect(coords?.longitude).toBeLessThan(-66)
    })

    it('should return null for invalid ZIP code', () => {
      expect(estimateCoordinatesFromZip('invalid')).toBeNull()
      expect(estimateCoordinatesFromZip('999999')).toBeNull()
      expect(estimateCoordinatesFromZip('-12345')).toBeNull()
    })

    it('should produce different coordinates for different ZIP regions', () => {
      const eastCoast = estimateCoordinatesFromZip('10001') // NYC
      const westCoast = estimateCoordinatesFromZip('90001') // LA

      expect(eastCoast).not.toBeNull()
      expect(westCoast).not.toBeNull()

      // West coast longitude should be more negative (further west)
      expect(westCoast!.longitude).toBeLessThan(eastCoast!.longitude)
    })
  })

  describe('calculateBoundingBox', () => {
    it('should calculate bounding box for 25 mile radius', () => {
      const center: Coordinates = { latitude: 30.2672, longitude: -97.7431 }
      const radius = 25

      const bbox = calculateBoundingBox(center, radius)

      // Check that bounding box is larger than center
      expect(bbox.maxLat).toBeGreaterThan(center.latitude)
      expect(bbox.minLat).toBeLessThan(center.latitude)
      expect(bbox.maxLon).toBeGreaterThan(center.longitude)
      expect(bbox.minLon).toBeLessThan(center.longitude)

      // Check approximate size (25 miles ≈ 0.36 degrees latitude)
      const latDiff = bbox.maxLat - bbox.minLat
      expect(latDiff).toBeGreaterThan(0.5)
      expect(latDiff).toBeLessThan(1.0)
    })

    it('should create larger box for larger radius', () => {
      const center: Coordinates = { latitude: 30.2672, longitude: -97.7431 }

      const bbox25 = calculateBoundingBox(center, 25)
      const bbox50 = calculateBoundingBox(center, 50)

      expect(bbox50.maxLat - bbox50.minLat).toBeGreaterThan(
        bbox25.maxLat - bbox25.minLat
      )
      expect(bbox50.maxLon - bbox50.minLon).toBeGreaterThan(
        bbox25.maxLon - bbox25.minLon
      )
    })
  })

  describe('isValidCoordinates', () => {
    it('should validate correct coordinates', () => {
      expect(
        isValidCoordinates({ latitude: 30.2672, longitude: -97.7431 })
      ).toBe(true)
      expect(isValidCoordinates({ latitude: 0, longitude: 0 })).toBe(true)
      expect(isValidCoordinates({ latitude: 90, longitude: 180 })).toBe(true)
      expect(isValidCoordinates({ latitude: -90, longitude: -180 })).toBe(true)
    })

    it('should reject invalid latitudes', () => {
      expect(isValidCoordinates({ latitude: 91, longitude: 0 })).toBe(false)
      expect(isValidCoordinates({ latitude: -91, longitude: 0 })).toBe(false)
    })

    it('should reject invalid longitudes', () => {
      expect(isValidCoordinates({ latitude: 0, longitude: 181 })).toBe(false)
      expect(isValidCoordinates({ latitude: 0, longitude: -181 })).toBe(false)
    })
  })
})
