/**
 * Test Fixtures and Mock Data
 * Reusable test data for all test suites
 */

export const mockUsers = {
  admin: {
    id: 'user-admin-123',
    email: 'admin@healthpartnershipx.com',
    role: 'ADMIN',
    fullName: 'Admin User',
  },
  doctor: {
    id: 'user-doctor-456',
    email: 'doctor@clinic.com',
    role: 'DOCTOR',
    fullName: 'Dr. Jane Smith',
  },
  patient: {
    id: 'user-patient-789',
    email: 'patient@example.com',
    role: 'PATIENT',
    fullName: 'John Doe',
  },
}

export const mockComparisonInputs = {
  healthyYoungAdult: {
    age: 25,
    zipCode: '90001',
    state: 'CA',
    chronicConditions: [],
    annualDoctorVisits: 2,
    prescriptionCount: 0,
  },
  middleAgedWithConditions: {
    age: 45,
    zipCode: '10001',
    state: 'NY',
    chronicConditions: ['Diabetes', 'Hypertension'],
    annualDoctorVisits: 8,
    prescriptionCount: 3,
  },
  seniorWithMultipleConditions: {
    age: 65,
    zipCode: '75001',
    state: 'TX',
    chronicConditions: ['Diabetes', 'Hypertension', 'Arthritis', 'High Cholesterol'],
    annualDoctorVisits: 15,
    prescriptionCount: 6,
  },
  minimumAge: {
    age: 18,
    zipCode: '33101',
    state: 'FL',
    chronicConditions: [],
    annualDoctorVisits: 1,
    prescriptionCount: 0,
  },
  maximumAge: {
    age: 100,
    zipCode: '60601',
    state: 'IL',
    chronicConditions: ['Multiple conditions'],
    annualDoctorVisits: 20,
    prescriptionCount: 10,
  },
}

export const mockComparisonResults = {
  dpcSavings: {
    traditionalPremium: 400,
    traditionalDeductible: 1500,
    traditionalOutOfPocket: 1500,
    traditionalTotalAnnual: 8000,
    dpcMonthlyFee: 75,
    dpcAnnualFee: 900,
    catastrophicPremium: 120,
    catastrophicDeductible: 8000,
    catastrophicOutOfPocket: 540,
    dpcTotalAnnual: 6000,
    annualSavings: 2000,
    percentageSavings: 25,
    recommendedPlan: 'DPC_CATASTROPHIC' as const,
    breakdown: {
      traditional: {
        premiums: 4800,
        deductible: 1500,
        copays: 420,
        prescriptions: 1080,
        outOfPocket: 1500,
        total: 8000,
      },
      dpc: {
        premiums: 900,
        deductible: 8000,
        copays: 0,
        prescriptions: 540,
        outOfPocket: 540,
        total: 6000,
      },
    },
  },
  traditionalCheaper: {
    traditionalPremium: 200,
    traditionalDeductible: 1000,
    traditionalOutOfPocket: 500,
    traditionalTotalAnnual: 3000,
    dpcMonthlyFee: 100,
    dpcAnnualFee: 1200,
    catastrophicPremium: 150,
    catastrophicDeductible: 8000,
    catastrophicOutOfPocket: 720,
    dpcTotalAnnual: 4000,
    annualSavings: -1000,
    percentageSavings: -33.3,
    recommendedPlan: 'TRADITIONAL' as const,
    breakdown: {
      traditional: {
        premiums: 2400,
        deductible: 1000,
        copays: 140,
        prescriptions: 360,
        outOfPocket: 500,
        total: 3000,
      },
      dpc: {
        premiums: 1200,
        deductible: 8000,
        copays: 0,
        prescriptions: 720,
        outOfPocket: 720,
        total: 4000,
      },
    },
  },
}

export const mockProviders = {
  highlyRated: {
    id: 'prov-1',
    npi: '1234567890',
    name: 'Dr. Sarah Johnson',
    practiceName: 'Johnson Family Medicine DPC',
    address: '123 Main Street',
    city: 'Springfield',
    state: 'CA',
    zipCode: '90001',
    phone: '555-0100',
    email: 'contact@johnsonfamilydpc.com',
    website: 'https://johnsonfamilydpc.com',
    monthlyFee: 75,
    familyFee: 150,
    acceptingPatients: true,
    servicesIncluded: [
      'Unlimited office visits',
      'Same-day appointments',
      'Telemedicine',
      'Basic lab work',
      'Chronic disease management',
    ],
    specialties: ['Family Medicine', 'Internal Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English', 'Spanish'],
    rating: 4.8,
    reviewCount: 127,
  },
  affordable: {
    id: 'prov-2',
    npi: '2345678901',
    name: 'Dr. Michael Chen',
    practiceName: 'Chen Comprehensive Care',
    address: '456 Oak Avenue',
    city: 'Springfield',
    state: 'CA',
    zipCode: '90006',
    phone: '555-0200',
    website: 'https://chendpc.com',
    monthlyFee: 65,
    acceptingPatients: true,
    servicesIncluded: [
      'Unlimited visits',
      '24/7 text access',
      'Annual wellness exam',
      'Minor procedures',
    ],
    specialties: ['Internal Medicine', 'Preventive Medicine'],
    boardCertifications: ['American Board of Internal Medicine'],
    languages: ['English', 'Mandarin'],
    rating: 4.6,
    reviewCount: 89,
  },
  notAccepting: {
    id: 'prov-3',
    npi: '3456789012',
    name: 'Dr. Emily Rodriguez',
    practiceName: 'Rodriguez Direct Primary Care',
    address: '789 Elm Street',
    city: 'Riverside',
    state: 'CA',
    zipCode: '90013',
    phone: '555-0300',
    email: 'info@rodriguezdpc.com',
    website: 'https://rodriguezdpc.com',
    monthlyFee: 85,
    familyFee: 170,
    acceptingPatients: false,
    servicesIncluded: ['Unlimited office visits', 'Telemedicine', 'Health coaching'],
    specialties: ['Family Medicine'],
    boardCertifications: ['American Board of Family Medicine'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    reviewCount: 203,
  },
}

export const mockProviderMatches = [
  {
    provider: mockProviders.highlyRated,
    distanceMiles: 3.5,
    matchScore: 95,
    matchReasons: [
      'Very close to your location',
      'Highly rated by patients',
      'Board certified',
      'Currently accepting new patients',
      'Affordable monthly fee',
    ],
  },
  {
    provider: mockProviders.affordable,
    distanceMiles: 7.2,
    matchScore: 88,
    matchReasons: [
      'Conveniently located nearby',
      'Affordable monthly fee',
      'Board certified',
      'Currently accepting new patients',
    ],
  },
]

export const mockAuditLogs = [
  {
    timestamp: '2024-01-15T10:30:00Z',
    userId: 'user-123',
    action: 'GET',
    resource: '/api/comparison/calculate',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    statusCode: 200,
    metadata: {
      duration: 150,
      query: {},
    },
  },
  {
    timestamp: '2024-01-15T10:35:00Z',
    userId: 'user-123',
    action: 'POST',
    resource: '/api/comparison/providers',
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0',
    statusCode: 200,
    metadata: {
      duration: 200,
      query: {},
    },
  },
]

export const mockSecurityEvents = {
  failedLogin: {
    event: 'failed_login',
    userId: 'user-123',
    email: 'test@example.com',
    ipAddress: '192.168.1.1',
    timestamp: '2024-01-15T10:00:00Z',
    reason: 'invalid_password',
  },
  suspiciousActivity: {
    event: 'suspicious_activity',
    userId: 'user-456',
    ipAddress: '10.0.0.1',
    timestamp: '2024-01-15T11:00:00Z',
    details: 'Multiple failed authentication attempts',
  },
  dataAccess: {
    event: 'phi_access',
    userId: 'doctor-123',
    patientId: 'patient-789',
    resource: '/patient/789/records',
    timestamp: '2024-01-15T12:00:00Z',
    ipAddress: '192.168.2.1',
  },
}

export const mockEnvironmentVariables = {
  production: {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://user:pass@host:5432/db?sslmode=require',
    JWT_SECRET: 'production-secret-key',
    REQUIRE_HTTPS: 'true',
    SESSION_TIMEOUT: '900',
    INACTIVITY_TIMEOUT: '600',
  },
  development: {
    NODE_ENV: 'development',
    DATABASE_URL: 'postgresql://localhost:5432/dev_db',
    JWT_SECRET: 'dev-secret-key',
    REQUIRE_HTTPS: 'false',
  },
  test: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://localhost:5432/test_db',
    JWT_SECRET: 'test-secret-key',
  },
}

export const mockJWTTokens = {
  valid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZXhwIjoxMjM0NTY3ODkwfQ.KaFxC_rr8n7TLvHhVmxlGJVGpwGCcYdBYYQQhPKS6Ls',
  invalid: 'invalid.token.signature',
}

export const mockAPIResponses = {
  success: {
    success: true,
    comparison: mockComparisonResults.dpcSavings,
    providers: mockProviderMatches,
  },
  error: {
    success: false,
    error: 'Internal server error',
  },
  validation: {
    success: false,
    error: 'Missing required fields: age, zipCode, state',
  },
}

export const mockXSSPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  '<body onload=alert("XSS")>',
  '<svg/onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  '<script>document.location="http://evil.com"</script>',
]

export const mockSQLInjectionPayloads = [
  "'; DROP TABLE users; --",
  "' OR '1'='1",
  "' UNION SELECT * FROM passwords --",
  "admin' --",
  "' OR 1=1 --",
  "1' AND '1' = '1",
  "1' WAITFOR DELAY '00:00:10'--",
]

export const mockInvalidEmails = [
  'notanemail',
  '@example.com',
  'user@',
  'user @example.com',
  'user@example',
  'user@@example.com',
  'user@example..com',
]

export const mockInvalidZipCodes = ['1234', '123456', 'abcde', '12-345', '12 345', 'ABCDE']

export const mockWeakPasswords = [
  'password',
  '12345678',
  'abc123',
  'Password',
  'Password1',
  'qwerty',
  'letmein',
]

export const mockStrongPasswords = [
  'SecureP@ss123',
  'MyP@ssw0rd!Strong',
  'C0mpl3x&P@ssword',
  'Sup3r$ecure2024!',
]

// Helper functions for tests
export const createMockRequest = (overrides: any = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  ip: '127.0.0.1',
  socket: { remoteAddress: '127.0.0.1' },
  get: (header: string) => undefined,
  ...overrides,
})

export const createMockResponse = () => {
  const res: any = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  res.send = vi.fn().mockReturnValue(res)
  res.setHeader = vi.fn().mockReturnValue(res)
  return res
}

export const createMockNext = () => vi.fn()

// Test data generators
export const generateRandomAge = (min = 18, max = 100) =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const generateRandomZipCode = () =>
  Math.floor(Math.random() * 90000 + 10000).toString()

export const generateRandomState = () => {
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI']
  return states[Math.floor(Math.random() * states.length)]
}
