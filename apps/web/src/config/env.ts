import { z } from 'zod'

/**
 * Environment variable validation schema using Zod
 * This ensures type-safe access to environment variables with clear error messages
 */
const envSchema = z.object({
  // Required variables
  VITE_API_URL: z.string().url('VITE_API_URL must be a valid URL').default('http://localhost:4000'),

  // Google Maps - Required for map view
  VITE_GOOGLE_MAPS_API_KEY: z.string().optional().default(''),

  // PostHog Analytics - Optional
  VITE_POSTHOG_KEY: z.string().optional().default(''),
  VITE_POSTHOG_ENABLE_RECORDINGS: z.enum(['true', 'false']).optional().default('false'),
})

/**
 * Parsed and validated environment variables
 */
export interface EnvironmentConfig {
  apiUrl: string
  googleMapsApiKey: string
  hasGoogleMapsKey: boolean
  posthogKey: string
  posthogEnableRecordings: boolean
  isDevelopment: boolean
}

/**
 * Parse and validate environment variables
 */
function parseEnvironment(): EnvironmentConfig {
  try {
    // Vite provides import.meta.env.VITE_* variables at runtime
    // Type definitions are in vite-env.d.ts
    const raw = {
      VITE_API_URL: import.meta.env.VITE_API_URL ?? '',
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
      VITE_POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY ?? '',
      VITE_POSTHOG_ENABLE_RECORDINGS: import.meta.env.VITE_POSTHOG_ENABLE_RECORDINGS ?? 'false',
    }

    // Validate against schema
    const validated = envSchema.parse(raw)

    return {
      apiUrl: validated.VITE_API_URL,
      googleMapsApiKey: validated.VITE_GOOGLE_MAPS_API_KEY,
      hasGoogleMapsKey: Boolean(validated.VITE_GOOGLE_MAPS_API_KEY && validated.VITE_GOOGLE_MAPS_API_KEY.trim()),
      posthogKey: validated.VITE_POSTHOG_KEY,
      posthogEnableRecordings: validated.VITE_POSTHOG_ENABLE_RECORDINGS === 'true',
      isDevelopment: import.meta.env.DEV,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map(issue => {
          const path = issue.path.join('.')
          const message = issue.message
          return `- ${path}: ${message}`
        })
        .join('\n')

      throw new Error(
        `Invalid environment configuration:\n${issues}\n\nPlease check your .env file and .env.example for required variables.`
      )
    }
    throw error
  }
}

/**
 * Singleton instance of environment configuration
 */
let config: EnvironmentConfig | null = null

/**
 * Get validated environment configuration
 * Throws error if validation fails
 */
export function getEnv(): EnvironmentConfig {
  if (!config) {
    config = parseEnvironment()
  }
  return config
}

/**
 * Initialize and validate environment at startup
 * Returns validation result with warnings/errors
 */
export function initializeEnv(): { success: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const env = getEnv()

    // Check for required variables with helpful messages
    if (!env.apiUrl) {
      errors.push(
        'VITE_API_URL is not configured. API calls will fail. Please set VITE_API_URL in your .env file.'
      )
    }

    if (!env.hasGoogleMapsKey) {
      warnings.push(
        'VITE_GOOGLE_MAPS_API_KEY is not configured. Map view will be disabled. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file to enable maps.'
      )
    }

    if (!env.posthogKey) {
      warnings.push('VITE_POSTHOG_KEY is not configured. Analytics will be disabled.')
    }

    return {
      success: errors.length === 0,
      errors,
      warnings,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    errors.push(message)
    return {
      success: false,
      errors,
      warnings,
    }
  }
}

/**
 * Log environment validation results
 */
export function logEnvValidation(): void {
  const result = initializeEnv()

  if (result.errors.length > 0) {
    console.error('ENVIRONMENT VALIDATION FAILED:')
    result.errors.forEach(error => {
      console.error(`  ERROR: ${error}`)
    })
  }

  if (result.warnings.length > 0) {
    console.warn('ENVIRONMENT WARNINGS:')
    result.warnings.forEach(warning => {
      console.warn(`  WARNING: ${warning}`)
    })
  }

  if (result.success && result.warnings.length === 0) {
    console.info('Environment variables validated successfully')
  }
}

export default getEnv()
