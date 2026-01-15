/**
 * Environment Configuration
 *
 * Centralized environment variable access for the DPC Comparator API.
 */

export const environment = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),

  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',

  // Auth (flat for backwards compatibility)
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // JWT configuration (structured for auth middleware)
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // External APIs
  NPI_REGISTRY_API_URL: process.env.NPI_REGISTRY_API_URL || 'https://npiregistry.cms.hhs.gov/api/',
  HEALTHCARE_GOV_API_URL: process.env.HEALTHCARE_GOV_API_URL || 'https://marketplace.api.healthcare.gov',

  // Feature flags
  ENABLE_AUDIT_LOGGING: process.env.ENABLE_AUDIT_LOGGING === 'true',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false',

  // Helpers
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

export default environment;
