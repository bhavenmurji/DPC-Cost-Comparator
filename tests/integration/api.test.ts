/**
 * API Integration Tests
 * Tests all API endpoints with real request/response cycles
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import express, { Express } from 'express'
import comparisonRoutes from '../../apps/api/src/routes/comparison.routes'

describe('API Integration Tests', () => {
  let app: Express

  beforeAll(() => {
    // Set up test server
    app = express()
    app.use(express.json())
    app.use('/api/comparison', comparisonRoutes)
  })

  describe('POST /api/comparison/calculate', () => {
    it('should calculate cost comparison successfully', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 35,
          zipCode: '90001',
          state: 'CA',
          chronicConditions: [],
          annualDoctorVisits: 4,
          prescriptionCount: 0,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.comparison).toBeDefined()
      expect(response.body.providers).toBeDefined()
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 35,
          // Missing zipCode and state
        })
        .expect(400)

      expect(response.body.error).toBeDefined()
      expect(response.body.error).toContain('required fields')
    })

    it('should return 400 for invalid age (too young)', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 17,
          zipCode: '90001',
          state: 'CA',
        })
        .expect(400)

      expect(response.body.error).toContain('Age')
    })

    it('should return 400 for invalid age (too old)', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 101,
          zipCode: '90001',
          state: 'CA',
        })
        .expect(400)

      expect(response.body.error).toContain('Age')
    })

    it('should handle optional fields with defaults', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 35,
          zipCode: '90001',
          state: 'CA',
          // chronicConditions, annualDoctorVisits, prescriptionCount not provided
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should calculate with chronic conditions', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 45,
          zipCode: '90001',
          state: 'CA',
          chronicConditions: ['Diabetes', 'Hypertension'],
          annualDoctorVisits: 8,
          prescriptionCount: 3,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.comparison.dpcMonthlyFee).toBeGreaterThan(0)
    })

    it('should return provider matches with calculation', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 35,
          zipCode: '90001',
          state: 'CA',
        })
        .expect(200)

      expect(Array.isArray(response.body.providers)).toBe(true)
      expect(response.body.providers.length).toBeGreaterThan(0)
    })

    it('should handle large number of visits', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 55,
          zipCode: '90001',
          state: 'CA',
          annualDoctorVisits: 50,
          prescriptionCount: 10,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should calculate for different states', async () => {
      const states = ['CA', 'NY', 'TX', 'FL']

      for (const state of states) {
        const response = await request(app)
          .post('/api/comparison/calculate')
          .send({
            age: 35,
            zipCode: '90001',
            state,
          })
          .expect(200)

        expect(response.body.success).toBe(true)
      }
    })
  })

  describe('POST /api/comparison/providers', () => {
    it('should find matching providers', async () => {
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          zipCode: '90001',
          state: 'CA',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.count).toBeGreaterThan(0)
      expect(Array.isArray(response.body.providers)).toBe(true)
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          // Missing zipCode and state
        })
        .expect(400)

      expect(response.body.error).toBeDefined()
    })

    it('should filter by max distance', async () => {
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          zipCode: '90001',
          state: 'CA',
          maxDistanceMiles: 10,
        })
        .expect(200)

      response.body.providers.forEach((match: any) => {
        expect(match.distanceMiles).toBeLessThanOrEqual(10)
      })
    })

    it('should filter by specialties', async () => {
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          zipCode: '90001',
          state: 'CA',
          specialtiesNeeded: ['Family Medicine'],
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should filter by language preference', async () => {
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          zipCode: '90001',
          state: 'CA',
          languagePreference: 'Spanish',
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should filter by max monthly fee', async () => {
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          zipCode: '90001',
          state: 'CA',
          maxMonthlyFee: 80,
        })
        .expect(200)

      expect(response.body.success).toBe(true)
    })

    it('should respect limit parameter', async () => {
      const limit = 3
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          zipCode: '90001',
          state: 'CA',
          limit,
        })
        .expect(200)

      expect(response.body.providers.length).toBeLessThanOrEqual(limit)
    })

    it('should include match scores and reasons', async () => {
      const response = await request(app)
        .post('/api/comparison/providers')
        .send({
          zipCode: '90001',
          state: 'CA',
        })
        .expect(200)

      response.body.providers.forEach((match: any) => {
        expect(match).toHaveProperty('matchScore')
        expect(match).toHaveProperty('matchReasons')
        expect(Array.isArray(match.matchReasons)).toBe(true)
      })
    })
  })

  describe('GET /api/comparison/providers/:id', () => {
    it('should return provider details', async () => {
      const response = await request(app)
        .get('/api/comparison/providers/prov-1')
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.provider).toBeDefined()
    })

    it('should handle any provider ID', async () => {
      const response = await request(app)
        .get('/api/comparison/providers/test-id')
        .expect(200)

      expect(response.body.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid JSON', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400)
    })

    it('should handle missing content-type', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send('age=35')

      // Should handle gracefully
      expect(response.status).toBeGreaterThanOrEqual(400)
    })
  })

  describe('Response Format', () => {
    it('should return consistent response format', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 35,
          zipCode: '90001',
          state: 'CA',
        })
        .expect(200)

      expect(response.body).toHaveProperty('success')
      expect(response.body).toHaveProperty('comparison')
      expect(response.body.comparison).toHaveProperty('traditionalTotalAnnual')
      expect(response.body.comparison).toHaveProperty('dpcTotalAnnual')
      expect(response.body.comparison).toHaveProperty('annualSavings')
      expect(response.body.comparison).toHaveProperty('recommendedPlan')
    })

    it('should set correct content-type header', async () => {
      const response = await request(app)
        .post('/api/comparison/calculate')
        .send({
          age: 35,
          zipCode: '90001',
          state: 'CA',
        })

      expect(response.headers['content-type']).toContain('application/json')
    })
  })
})
