/**
 * Validation Test Examples
 *
 * Comprehensive test examples demonstrating validation behavior
 * with both valid and invalid inputs for security hardening
 */

/**
 * ==========================================
 * COST COMPARISON ENDPOINT TESTS
 * POST /api/comparison/calculate
 * ==========================================
 */

// ✅ VALID EXAMPLES
export const validComparisonRequests = [
  {
    description: 'Minimal valid request with required fields only',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CA',
    },
    expectedStatus: 200,
  },
  {
    description: 'Complete request with all optional fields',
    request: {
      age: 45,
      zipCode: '10001',
      state: 'NY',
      chronicConditions: ['diabetes', 'hypertension'],
      annualDoctorVisits: 12,
      prescriptionCount: 5,
      currentPremium: 450.00,
      currentDeductible: 3000.00,
    },
    expectedStatus: 200,
  },
  {
    description: 'Edge case: minimum age (18)',
    request: {
      age: 18,
      zipCode: '60601',
      state: 'IL',
    },
    expectedStatus: 200,
  },
  {
    description: 'Edge case: maximum age (100)',
    request: {
      age: 100,
      zipCode: '33101',
      state: 'FL',
    },
    expectedStatus: 200,
  },
];

// ❌ INVALID EXAMPLES
export const invalidComparisonRequests = [
  {
    description: 'Missing required field: age',
    request: {
      zipCode: '90210',
      state: 'CA',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'age',
          message: 'Required',
        },
      ],
    },
  },
  {
    description: 'Missing required field: zipCode',
    request: {
      age: 35,
      state: 'CA',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'zipCode',
          message: 'Required',
        },
      ],
    },
  },
  {
    description: 'Invalid age: too young (17)',
    request: {
      age: 17,
      zipCode: '90210',
      state: 'CA',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'age',
          message: 'Age must be at least 18',
        },
      ],
    },
  },
  {
    description: 'Invalid age: too old (101)',
    request: {
      age: 101,
      zipCode: '90210',
      state: 'CA',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'age',
          message: 'Age must be 100 or less',
        },
      ],
    },
  },
  {
    description: 'Invalid ZIP code: wrong length (4 digits)',
    request: {
      age: 35,
      zipCode: '9021',
      state: 'CA',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'zipCode',
          message: 'ZIP code must be exactly 5 digits',
        },
      ],
    },
  },
  {
    description: 'Invalid ZIP code: contains letters',
    request: {
      age: 35,
      zipCode: '90ABC',
      state: 'CA',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'zipCode',
          message: 'ZIP code must be exactly 5 digits',
        },
      ],
    },
  },
  {
    description: 'Invalid state code: wrong length',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CAL',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'state',
          message: 'State code must be 2 characters',
        },
      ],
    },
  },
  {
    description: 'Invalid state code: not a valid US state',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'ZZ',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'state',
          message: 'Invalid US state code',
        },
      ],
    },
  },
  {
    description: 'Invalid doctor visits: negative number',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CA',
      annualDoctorVisits: -5,
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'annualDoctorVisits',
          message: 'Doctor visits cannot be negative',
        },
      ],
    },
  },
  {
    description: 'Invalid doctor visits: too many (51)',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CA',
      annualDoctorVisits: 51,
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'annualDoctorVisits',
          message: 'Maximum 50 annual doctor visits allowed',
        },
      ],
    },
  },
  {
    description: 'Invalid prescriptions: negative number',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CA',
      prescriptionCount: -3,
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'prescriptionCount',
          message: 'Prescription count cannot be negative',
        },
      ],
    },
  },
  {
    description: 'Invalid chronic conditions: too many (11)',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CA',
      chronicConditions: [
        'condition1', 'condition2', 'condition3', 'condition4',
        'condition5', 'condition6', 'condition7', 'condition8',
        'condition9', 'condition10', 'condition11',
      ],
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'chronicConditions',
          message: 'Maximum 10 chronic conditions allowed',
        },
      ],
    },
  },
  {
    description: 'Invalid premium: negative amount',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CA',
      currentPremium: -100,
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'currentPremium',
          message: 'Amount must be non-negative',
        },
      ],
    },
  },
  {
    description: 'Invalid data type: age as string',
    request: {
      age: '35',
      zipCode: '90210',
      state: 'CA',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'age',
          message: 'Expected number, received string',
        },
      ],
    },
  },
  {
    description: 'Additional unknown field (strict mode)',
    request: {
      age: 35,
      zipCode: '90210',
      state: 'CA',
      unknownField: 'should not be here',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'unknownField',
          message: 'Unrecognized key(s) in object',
        },
      ],
    },
  },
];

/**
 * ==========================================
 * PROVIDER SEARCH ENDPOINT TESTS
 * POST /api/comparison/providers
 * ==========================================
 */

// ✅ VALID EXAMPLES
export const validProviderSearchRequests = [
  {
    description: 'Minimal valid search',
    request: {
      zipCode: '90210',
      state: 'CA',
    },
    expectedStatus: 200,
  },
  {
    description: 'Complete search with all filters',
    request: {
      zipCode: '10001',
      state: 'NY',
      maxDistanceMiles: 25,
      specialtiesNeeded: ['cardiology', 'endocrinology'],
      chronicConditions: ['diabetes'],
      languagePreference: 'Spanish',
      maxMonthlyFee: 150.00,
      limit: 20,
    },
    expectedStatus: 200,
  },
  {
    description: 'Edge case: minimum distance (1 mile)',
    request: {
      zipCode: '60601',
      state: 'IL',
      maxDistanceMiles: 1,
    },
    expectedStatus: 200,
  },
  {
    description: 'Edge case: maximum distance (100 miles)',
    request: {
      zipCode: '33101',
      state: 'FL',
      maxDistanceMiles: 100,
    },
    expectedStatus: 200,
  },
];

// ❌ INVALID EXAMPLES
export const invalidProviderSearchRequests = [
  {
    description: 'Missing required field: state',
    request: {
      zipCode: '90210',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'state',
          message: 'Required',
        },
      ],
    },
  },
  {
    description: 'Invalid distance: 0 miles',
    request: {
      zipCode: '90210',
      state: 'CA',
      maxDistanceMiles: 0,
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'maxDistanceMiles',
          message: 'Distance must be at least 1 mile',
        },
      ],
    },
  },
  {
    description: 'Invalid distance: 101 miles',
    request: {
      zipCode: '90210',
      state: 'CA',
      maxDistanceMiles: 101,
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'maxDistanceMiles',
          message: 'Distance must be 100 miles or less',
        },
      ],
    },
  },
  {
    description: 'Invalid limit: too many results (51)',
    request: {
      zipCode: '90210',
      state: 'CA',
      limit: 51,
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'limit',
          message: 'Maximum 50 results allowed per request',
        },
      ],
    },
  },
];

/**
 * ==========================================
 * PROVIDER ID VALIDATION TESTS
 * GET /api/comparison/providers/:id
 * ==========================================
 */

// ✅ VALID EXAMPLES
export const validProviderIdRequests = [
  {
    description: 'Valid UUID format',
    params: {
      id: '550e8400-e29b-41d4-a716-446655440000',
    },
    expectedStatus: 200,
  },
  {
    description: 'Valid alphanumeric ID with hyphens',
    params: {
      id: 'provider-123-abc',
    },
    expectedStatus: 200,
  },
];

// ❌ INVALID EXAMPLES
export const invalidProviderIdRequests = [
  {
    description: 'Invalid ID: contains special characters',
    params: {
      id: 'provider@123',
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'id',
          message: 'Invalid provider ID format',
        },
      ],
    },
  },
  {
    description: 'Invalid ID: too long (51 characters)',
    params: {
      id: 'a'.repeat(51),
    },
    expectedStatus: 400,
    expectedError: {
      error: 'Validation failed',
      details: [
        {
          field: 'id',
          message: 'Invalid provider ID format',
        },
      ],
    },
  },
];

/**
 * ==========================================
 * CURL COMMAND EXAMPLES FOR TESTING
 * ==========================================
 */

export const curlExamples = `
# Valid Cost Comparison Request
curl -X POST http://localhost:3001/api/comparison/calculate \\
  -H "Content-Type: application/json" \\
  -d '{
    "age": 35,
    "zipCode": "90210",
    "state": "CA",
    "chronicConditions": ["diabetes"],
    "annualDoctorVisits": 8,
    "prescriptionCount": 3
  }'

# Invalid Request: Age too young
curl -X POST http://localhost:3001/api/comparison/calculate \\
  -H "Content-Type: application/json" \\
  -d '{
    "age": 17,
    "zipCode": "90210",
    "state": "CA"
  }'

# Expected Response:
# {
#   "error": "Validation failed",
#   "details": [
#     {
#       "field": "age",
#       "message": "Age must be at least 18"
#     }
#   ]
# }

# Invalid Request: Invalid ZIP code
curl -X POST http://localhost:3001/api/comparison/calculate \\
  -H "Content-Type: application/json" \\
  -d '{
    "age": 35,
    "zipCode": "ABC12",
    "state": "CA"
  }'

# Expected Response:
# {
#   "error": "Validation failed",
#   "details": [
#     {
#       "field": "zipCode",
#       "message": "ZIP code must be exactly 5 digits"
#     }
#   ]
# }

# Valid Provider Search
curl -X POST http://localhost:3001/api/comparison/providers \\
  -H "Content-Type: application/json" \\
  -d '{
    "zipCode": "10001",
    "state": "NY",
    "maxDistanceMiles": 25,
    "limit": 10
  }'

# Invalid Provider Search: Distance too large
curl -X POST http://localhost:3001/api/comparison/providers \\
  -H "Content-Type: application/json" \\
  -d '{
    "zipCode": "10001",
    "state": "NY",
    "maxDistanceMiles": 150
  }'

# Expected Response:
# {
#   "error": "Validation failed",
#   "details": [
#     {
#       "field": "maxDistanceMiles",
#       "message": "Distance must be 100 miles or less"
#     }
#   ]
# }
`;
