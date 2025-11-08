/**
 * Validation Middleware Tests
 *
 * Tests for Zod validation middleware and schemas
 * Ensures proper validation and error handling
 */

import request from 'supertest';
import express, { Express } from 'express';
import { validateBody, validateQuery, validateParams } from '../../src/backend/middleware/validation';
import {
  ComparisonInputSchema,
  ProviderSearchSchema,
  ProviderIdSchema,
  DPCProviderSearchQuerySchema,
} from '../../src/backend/validators/schemas';

// Create test Express app
function createTestApp(): Express {
  const app = express();
  app.use(express.json());
  return app;
}

describe('Validation Middleware', () => {
  describe('ComparisonInputSchema - POST /api/comparison/calculate', () => {
    let app: Express;

    beforeEach(() => {
      app = createTestApp();
      app.post('/test', validateBody(ComparisonInputSchema), (req, res) => {
        res.json({ success: true, data: req.body });
      });
    });

    describe('Valid Requests', () => {
      it('should accept minimal valid request', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'CA',
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should accept complete request with all optional fields', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 45,
            zipCode: '10001',
            state: 'NY',
            chronicConditions: ['diabetes', 'hypertension'],
            annualDoctorVisits: 12,
            prescriptionCount: 5,
            currentPremium: 450.00,
            currentDeductible: 3000.00,
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('should accept edge case: minimum age (18)', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 18,
            zipCode: '60601',
            state: 'IL',
          });

        expect(response.status).toBe(200);
      });

      it('should accept edge case: maximum age (100)', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 100,
            zipCode: '33101',
            state: 'FL',
          });

        expect(response.status).toBe(200);
      });
    });

    describe('Invalid Requests', () => {
      it('should reject missing required field: age', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            zipCode: '90210',
            state: 'CA',
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'age',
            message: expect.stringContaining('Required'),
          })
        );
      });

      it('should reject invalid age: too young (17)', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 17,
            zipCode: '90210',
            state: 'CA',
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'age',
            message: 'Age must be at least 18',
          })
        );
      });

      it('should reject invalid age: too old (101)', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 101,
            zipCode: '90210',
            state: 'CA',
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'age',
            message: 'Age must be 100 or less',
          })
        );
      });

      it('should reject invalid ZIP code: wrong length', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '9021',
            state: 'CA',
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'zipCode',
            message: expect.stringContaining('5 digits'),
          })
        );
      });

      it('should reject invalid ZIP code: contains letters', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90ABC',
            state: 'CA',
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'zipCode',
          })
        );
      });

      it('should reject invalid state code: wrong length', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'CAL',
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'state',
          })
        );
      });

      it('should reject invalid state code: not a valid US state', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'ZZ',
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'state',
            message: 'Invalid US state code',
          })
        );
      });

      it('should reject negative doctor visits', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'CA',
            annualDoctorVisits: -5,
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'annualDoctorVisits',
            message: expect.stringContaining('negative'),
          })
        );
      });

      it('should reject too many doctor visits (51)', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'CA',
            annualDoctorVisits: 51,
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'annualDoctorVisits',
            message: expect.stringContaining('50'),
          })
        );
      });

      it('should reject too many chronic conditions (11)', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'CA',
            chronicConditions: Array(11).fill('condition'),
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'chronicConditions',
            message: expect.stringContaining('10'),
          })
        );
      });

      it('should reject negative premium', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'CA',
            currentPremium: -100,
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'currentPremium',
            message: expect.stringContaining('negative'),
          })
        );
      });

      it('should reject unknown fields in strict mode', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 35,
            zipCode: '90210',
            state: 'CA',
            unknownField: 'should not be here',
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should handle multiple validation errors', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            age: 17,
            zipCode: 'ABC',
            state: 'CALIFORNIA',
            annualDoctorVisits: -5,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details.length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe('ProviderSearchSchema - POST /api/comparison/providers', () => {
    let app: Express;

    beforeEach(() => {
      app = createTestApp();
      app.post('/test', validateBody(ProviderSearchSchema), (req, res) => {
        res.json({ success: true, data: req.body });
      });
    });

    describe('Valid Requests', () => {
      it('should accept minimal valid search', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            zipCode: '90210',
            state: 'CA',
          });

        expect(response.status).toBe(200);
      });

      it('should accept complete search with all filters', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            zipCode: '10001',
            state: 'NY',
            maxDistanceMiles: 25,
            specialtiesNeeded: ['cardiology'],
            chronicConditions: ['diabetes'],
            languagePreference: 'Spanish',
            maxMonthlyFee: 150.00,
            limit: 20,
          });

        expect(response.status).toBe(200);
      });
    });

    describe('Invalid Requests', () => {
      it('should reject missing required field: state', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            zipCode: '90210',
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'state',
          })
        );
      });

      it('should reject invalid distance: 0 miles', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            zipCode: '90210',
            state: 'CA',
            maxDistanceMiles: 0,
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'maxDistanceMiles',
            message: expect.stringContaining('1 mile'),
          })
        );
      });

      it('should reject invalid limit: too many (51)', async () => {
        const response = await request(app)
          .post('/test')
          .send({
            zipCode: '90210',
            state: 'CA',
            limit: 51,
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'limit',
            message: expect.stringContaining('50'),
          })
        );
      });
    });
  });

  describe('ProviderIdSchema - GET /api/comparison/providers/:id', () => {
    let app: Express;

    beforeEach(() => {
      app = createTestApp();
      app.get('/test/:id', validateParams(ProviderIdSchema), (req, res) => {
        res.json({ success: true, data: req.params });
      });
    });

    describe('Valid Requests', () => {
      it('should accept valid UUID format', async () => {
        const response = await request(app)
          .get('/test/550e8400-e29b-41d4-a716-446655440000');

        expect(response.status).toBe(200);
      });

      it('should accept valid alphanumeric ID with hyphens', async () => {
        const response = await request(app)
          .get('/test/provider-123-abc');

        expect(response.status).toBe(200);
      });
    });

    describe('Invalid Requests', () => {
      it('should reject ID with special characters', async () => {
        const response = await request(app)
          .get('/test/provider@123');

        expect(response.status).toBe(400);
        expect(response.body.details).toContainEqual(
          expect.objectContaining({
            field: 'id',
            message: expect.stringContaining('Invalid'),
          })
        );
      });

      it('should reject ID that is too long', async () => {
        const longId = 'a'.repeat(51);
        const response = await request(app)
          .get(`/test/${longId}`);

        expect(response.status).toBe(400);
      });
    });
  });

  describe('DPCProviderSearchQuerySchema - GET /api/v1/dpc-providers/search', () => {
    let app: Express;

    beforeEach(() => {
      app = createTestApp();
      app.get('/test', validateQuery(DPCProviderSearchQuerySchema), (req, res) => {
        res.json({ success: true, data: req.query });
      });
    });

    describe('Valid Requests', () => {
      it('should accept query with zipCode', async () => {
        const response = await request(app)
          .get('/test')
          .query({ zipCode: '90210' });

        expect(response.status).toBe(200);
      });

      it('should accept query with state', async () => {
        const response = await request(app)
          .get('/test')
          .query({ state: 'CA' });

        expect(response.status).toBe(200);
      });

      it('should accept complete query with all parameters', async () => {
        const response = await request(app)
          .get('/test')
          .query({
            zipCode: '10001',
            state: 'NY',
            radius: '25',
            specialty: 'cardiology',
            language: 'Spanish',
            maxFee: '150.00',
            limit: '20',
          });

        expect(response.status).toBe(200);
      });
    });

    describe('Invalid Requests', () => {
      it('should reject query without zipCode or state', async () => {
        const response = await request(app)
          .get('/test')
          .query({ specialty: 'cardiology' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
      });

      it('should reject invalid maxFee format', async () => {
        const response = await request(app)
          .get('/test')
          .query({
            zipCode: '90210',
            maxFee: 'invalid',
          });

        expect(response.status).toBe(400);
      });
    });
  });
});

describe('Validation Error Format', () => {
  it('should return consistent error structure', async () => {
    const app = createTestApp();
    app.post('/test', validateBody(ComparisonInputSchema), (req, res) => {
      res.json({ success: true });
    });

    const response = await request(app)
      .post('/test')
      .send({ age: 17, zipCode: 'ABC', state: 'INVALID' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('details');
    expect(Array.isArray(response.body.details)).toBe(true);
    expect(response.body.details[0]).toHaveProperty('field');
    expect(response.body.details[0]).toHaveProperty('message');
  });
});
