/**
 * Zod Validation Schemas for API Inputs
 *
 * Security Hardening: Comprehensive input validation to prevent:
 * - Invalid data types
 * - Out-of-range values
 * - Malformed inputs
 * - Injection attacks
 */

import { z } from 'zod';

/**
 * Base validation schemas for reusable field types
 */

// US ZIP code validation (5 digits)
export const zipCodeSchema = z.string()
  .regex(/^\d{5}$/, 'ZIP code must be exactly 5 digits')
  .length(5, 'ZIP code must be 5 digits');

// US State code validation (2 uppercase letters)
export const stateCodeSchema = z.string()
  .regex(/^[A-Z]{2}$/, 'State code must be 2 uppercase letters')
  .length(2, 'State code must be 2 characters')
  .refine(
    (val) => {
      const validStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
      ];
      return validStates.includes(val);
    },
    { message: 'Invalid US state code' }
  );

// Age validation (18-100 years)
export const ageSchema = z.number()
  .int('Age must be an integer')
  .min(18, 'Age must be at least 18')
  .max(100, 'Age must be 100 or less');

// Monetary amount validation (positive)
export const moneySchema = z.number()
  .nonnegative('Amount must be non-negative')
  .finite('Amount must be a valid number');

// Distance in miles (1-100)
export const distanceSchema = z.number()
  .int('Distance must be an integer')
  .min(1, 'Distance must be at least 1 mile')
  .max(100, 'Distance must be 100 miles or less');

/**
 * Cost Comparison Input Schema
 * POST /api/comparison/calculate
 */
export const ComparisonInputSchema = z.object({
  // Required fields
  age: ageSchema,
  zipCode: zipCodeSchema,
  state: stateCodeSchema,

  // Optional fields with defaults and validation
  chronicConditions: z.array(
    z.string()
      .min(1, 'Condition name cannot be empty')
      .max(100, 'Condition name too long')
      .trim()
  )
    .max(10, 'Maximum 10 chronic conditions allowed')
    .default([])
    .optional(),

  annualDoctorVisits: z.number()
    .int('Doctor visits must be an integer')
    .min(0, 'Doctor visits cannot be negative')
    .max(50, 'Maximum 50 annual doctor visits allowed')
    .default(4)
    .optional(),

  prescriptionCount: z.number()
    .int('Prescription count must be an integer')
    .min(0, 'Prescription count cannot be negative')
    .max(20, 'Maximum 20 monthly prescriptions allowed')
    .default(0)
    .optional()
    .or(
      z.number()
        .int('Monthly prescriptions must be an integer')
        .min(0, 'Monthly prescriptions cannot be negative')
        .max(20, 'Maximum 20 monthly prescriptions allowed')
    )
    .transform((val) => val ?? 0), // Handle both prescriptionCount and monthlyPrescriptions

  monthlyPrescriptions: z.number()
    .int('Monthly prescriptions must be an integer')
    .min(0, 'Monthly prescriptions cannot be negative')
    .max(20, 'Maximum 20 monthly prescriptions allowed')
    .default(0)
    .optional(),

  currentPremium: moneySchema
    .max(10000, 'Premium seems unreasonably high')
    .optional(),

  currentDeductible: moneySchema
    .max(50000, 'Deductible seems unreasonably high')
    .optional(),
}).strict(); // Reject any additional properties

/**
 * Alternative schema for the other cost comparison endpoint format
 * POST /api/v1/cost-comparison/calculate
 */
export const CostComparisonCalculateSchema = z.object({
  currentPlan: z.object({
    premium: moneySchema.max(10000),
    deductible: moneySchema.max(50000),
    copay: moneySchema.max(500).optional(),
    coinsurance: z.number()
      .min(0, 'Coinsurance cannot be negative')
      .max(100, 'Coinsurance cannot exceed 100%')
      .optional(),
  }),

  usage: z.object({
    doctorVisits: z.number()
      .int()
      .min(0)
      .max(50)
      .default(4),
    prescriptions: z.number()
      .int()
      .min(0)
      .max(20)
      .default(0),
    specialistVisits: z.number()
      .int()
      .min(0)
      .max(20)
      .default(0)
      .optional(),
  }),

  profile: z.object({
    age: ageSchema,
    zipCode: zipCodeSchema,
    state: stateCodeSchema.optional(),
    chronicConditions: z.array(z.string().max(100)).max(10).default([]).optional(),
  }),
}).strict();

/**
 * Provider Search Input Schema
 * POST /api/comparison/providers
 */
export const ProviderSearchSchema = z.object({
  // Required fields
  zipCode: zipCodeSchema,
  state: stateCodeSchema,

  // Optional search filters
  maxDistanceMiles: distanceSchema
    .default(50)
    .optional(),

  specialtiesNeeded: z.array(
    z.string()
      .min(1, 'Specialty name cannot be empty')
      .max(100, 'Specialty name too long')
      .trim()
  )
    .max(10, 'Maximum 10 specialties allowed')
    .default([])
    .optional(),

  chronicConditions: z.array(
    z.string()
      .min(1, 'Condition name cannot be empty')
      .max(100, 'Condition name too long')
      .trim()
  )
    .max(10, 'Maximum 10 chronic conditions allowed')
    .default([])
    .optional(),

  languagePreference: z.string()
    .min(2, 'Language code too short')
    .max(50, 'Language name too long')
    .trim()
    .optional(),

  maxMonthlyFee: moneySchema
    .max(1000, 'Maximum monthly fee filter seems too high')
    .optional(),

  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(50, 'Maximum 50 results allowed per request')
    .default(10)
    .optional(),
}).strict();

/**
 * DPC Provider Search Query Schema
 * GET /api/v1/dpc-providers/search
 */
export const DPCProviderSearchQuerySchema = z.object({
  zipCode: zipCodeSchema.optional(),
  state: stateCodeSchema.optional(),
  radius: distanceSchema.default(50).optional(),
  specialty: z.string().max(100).optional(),
  language: z.string().max(50).optional(),
  maxFee: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid fee format')
    .transform((val) => parseFloat(val))
    .pipe(moneySchema.max(1000))
    .optional(),
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(50))
    .default('10')
    .optional(),
}).refine(
  (data) => data.zipCode || data.state,
  { message: 'Either zipCode or state must be provided' }
);

/**
 * Provider ID validation
 * GET /api/comparison/providers/:id
 */
export const ProviderIdSchema = z.object({
  id: z.string()
    .uuid('Provider ID must be a valid UUID')
    .or(
      z.string()
        .regex(/^[a-zA-Z0-9_-]{1,50}$/, 'Invalid provider ID format')
    ),
});

/**
 * Pagination schema for list endpoints
 */
export const PaginationSchema = z.object({
  page: z.number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1)
    .optional(),

  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Maximum 100 items per page')
    .default(20)
    .optional(),
});

/**
 * Type exports for use in controllers
 */
export type ComparisonInput = z.infer<typeof ComparisonInputSchema>;
export type CostComparisonCalculateInput = z.infer<typeof CostComparisonCalculateSchema>;
export type ProviderSearchInput = z.infer<typeof ProviderSearchSchema>;
export type DPCProviderSearchQuery = z.infer<typeof DPCProviderSearchQuerySchema>;
export type ProviderIdParams = z.infer<typeof ProviderIdSchema>;
export type PaginationParams = z.infer<typeof PaginationSchema>;
