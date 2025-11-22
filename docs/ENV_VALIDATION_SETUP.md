# Environment Variable Validation Setup

This document describes the environment variable validation and fallback system implemented in the web application.

## Overview

The web application now includes a comprehensive environment variable validation system that:
- Validates configuration at startup
- Provides clear error messages for missing required variables
- Offers sensible defaults where possible
- Prevents critical errors from runtime failures
- Shows helpful configuration instructions to users

## Files Created

### 1. `apps/web/src/config/env.ts`

The central environment configuration module that:
- Uses Zod for schema validation
- Validates all VITE_* environment variables
- Provides typed access to environment config
- Includes error handling and formatting

**Key Features:**
- `getEnv()` - Returns validated environment configuration
- `initializeEnv()` - Runs validation and returns result object
- `logEnvValidation()` - Logs warnings and errors to console
- Type-safe `EnvironmentConfig` interface

**Validated Variables:**
- `VITE_API_URL` - Required, must be valid URL, defaults to `http://localhost:4000`
- `VITE_GOOGLE_MAPS_API_KEY` - Optional, enables map view
- `VITE_POSTHOG_KEY` - Optional, enables analytics
- `VITE_POSTHOG_ENABLE_RECORDINGS` - Optional, boolean string

### 2. `apps/web/src/vite-env.d.ts`

TypeScript type definitions for Vite environment variables. This file:
- Defines `ImportMetaEnv` interface with all VITE_* variables
- References Vite's client types
- Ensures TypeScript knows about environment variables

## Updated Files

### 1. `apps/web/src/main.tsx`

**Changes:**
- Calls `initializeEnv()` at application startup (before React renders)
- Calls `logEnvValidation()` to log warnings and errors
- Displays blocking error dialog if critical variables are missing
- Provides setup instructions and retry button

**Error Screen:**
Shows a professional error dialog with:
- Clear description of missing variables
- Setup instructions (copy .env.example to .env, fill variables, restart)
- Retry button to reload after configuration

### 2. `apps/web/src/services/apiClient.ts`

**Changes:**
- Imports `getEnv()` from config module
- Validates API_URL exists in constructor
- Uses validated environment config for API initialization
- Shows clear error if API_URL is missing

### 3. `apps/web/src/components/ProviderMap.tsx`

**Changes:**
- Imports `getEnv()` from config module
- Checks if Google Maps API key is configured before rendering
- Shows helpful message if key is missing instead of failing
- Gracefully falls back to list-only view

**Fallback UI:**
Displays friendly message when Google Maps API key is missing:
- Explains why map view is unavailable
- Provides instructions for enabling it
- Informs user that list view is still available

## Usage

### For Developers

1. **Check Configuration Status:**
```typescript
import { getEnv } from './config/env'

const env = getEnv()
console.log(env.apiUrl) // Type-safe access
console.log(env.hasGoogleMapsKey) // Boolean flag
```

2. **Validate at Startup:**
```typescript
import { initializeEnv, logEnvValidation } from './config/env'

const result = initializeEnv()
if (!result.success) {
  // Handle missing critical variables
}
logEnvValidation() // Log all issues to console
```

3. **Add New Variables:**
```typescript
// 1. Update vite-env.d.ts ImportMetaEnv interface
interface ImportMetaEnv {
  readonly VITE_NEW_VAR: string
}

// 2. Update envSchema in env.ts
const envSchema = z.object({
  VITE_NEW_VAR: z.string().default('default-value'),
})

// 3. Update EnvironmentConfig interface
export interface EnvironmentConfig {
  newVar: string
}

// 4. Update parseEnvironment() return object
return {
  newVar: validated.VITE_NEW_VAR,
}
```

### For End Users

1. **Setup Environment:**
```bash
# From apps/web directory
cp .env.example .env
```

2. **Edit .env file:**
```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
VITE_POSTHOG_KEY=optional_posthog_key_here
```

3. **Start Development Server:**
```bash
npm run dev:web
```

If configuration is missing, the app will show an error screen with instructions.

## Error Handling

### Critical Errors (Block Startup)
- `VITE_API_URL` is missing or invalid

Users see:
- Error dialog with detailed message
- Setup instructions
- Retry button to reload after fixing

### Warnings (Allow Startup)
- `VITE_GOOGLE_MAPS_API_KEY` is missing → Map view disabled
- `VITE_POSTHOG_KEY` is missing → Analytics disabled

Users see:
- Console warnings during startup
- Graceful fallback UI (list view instead of map)

## Validation Schema

```typescript
const envSchema = z.object({
  VITE_API_URL: z
    .string()
    .url('VITE_API_URL must be a valid URL')
    .default('http://localhost:4000'),

  VITE_GOOGLE_MAPS_API_KEY: z
    .string()
    .optional()
    .default(''),

  VITE_POSTHOG_KEY: z
    .string()
    .optional()
    .default(''),

  VITE_POSTHOG_ENABLE_RECORDINGS: z
    .enum(['true', 'false'])
    .optional()
    .default('false'),
})
```

## Configuration States

### Development (Local)
```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_dev_key
VITE_POSTHOG_KEY=your_dev_key
```

### Production
```env
VITE_API_URL=https://api.example.com
VITE_GOOGLE_MAPS_API_KEY=your_prod_key
VITE_POSTHOG_KEY=your_prod_key
```

### Minimal (API Only, No Maps)
```env
VITE_API_URL=http://localhost:4000
# Maps view will be disabled
```

## Type Safety

All environment access is fully type-safe:

```typescript
const env = getEnv()

// TypeScript knows these properties exist and their types
env.apiUrl // string
env.hasGoogleMapsKey // boolean
env.googleMapsApiKey // string
env.isDevelopment // boolean
env.posthogKey // string
env.posthogEnableRecordings // boolean
```

## Logging

Environment validation logs to the browser console:

### Success (Development)
```
Environment variables validated successfully
```

### Warnings
```
ENVIRONMENT WARNINGS:
  WARNING: VITE_GOOGLE_MAPS_API_KEY is not configured. Analytics will be disabled.
  WARNING: VITE_POSTHOG_KEY is not configured. Map view will be disabled.
```

### Critical Errors
```
ENVIRONMENT VALIDATION FAILED:
  ERROR: VITE_API_URL is not configured. API calls will fail.
```

## Integration with Components

### ProviderMap Component
```typescript
import { getEnv } from '../config/env'

export default function ProviderMap(props) {
  const env = getEnv()

  if (!env.hasGoogleMapsKey) {
    return <div>Map view not available. Please configure VITE_GOOGLE_MAPS_API_KEY</div>
  }

  // Render map...
}
```

### ApiClient
```typescript
import { getEnv } from '../config/env'

const env = getEnv()
export const apiClient = new ApiClient(env.apiUrl) // Throws if empty
```

## Testing

### Test Configuration Validation
```typescript
import { initializeEnv } from './config/env'

test('should validate required variables', () => {
  const result = initializeEnv()
  expect(result.success).toBe(true)
})

test('should warn about missing optional variables', () => {
  const result = initializeEnv()
  expect(result.warnings).toContain(expect.stringContaining('VITE_GOOGLE_MAPS_API_KEY'))
})
```

### Test with Mock Environment
```typescript
// Mock import.meta.env for testing
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_URL: 'http://test:3000',
      VITE_GOOGLE_MAPS_API_KEY: 'test-key',
    }
  }
})
```

## Migration Guide

### From Old Implementation
Old implementation accessed environment variables directly:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
```

### New Implementation
Use the env module:
```typescript
import { getEnv } from './config/env'

const env = getEnv()
const API_URL = env.apiUrl
```

**Benefits:**
- Type-safe access
- Validation at startup
- Clear error messages
- Graceful degradation
- Single source of truth

## Troubleshooting

### "VITE_API_URL must be a valid URL"
- Check that VITE_API_URL is a complete URL including protocol
- Examples: `http://localhost:4000`, `https://api.example.com`

### "Property 'env' does not exist on type 'ImportMeta'"
- Ensure `vite-env.d.ts` exists in `src/` directory
- TypeScript should automatically pick up type definitions

### Map not showing but no error
- Check browser console for warnings about VITE_GOOGLE_MAPS_API_KEY
- Verify API key in .env file
- Check Google Cloud Console that Maps API is enabled

### Application stuck on error screen after config update
- Try clicking the Retry button
- If not working, clear browser cache and reload
- Verify .env file has correct syntax (no spaces around =)

## Security Notes

- Never commit `.env` file to git repository
- Add `.env` to `.gitignore`
- Use `.env.example` for documenting required variables
- Production deployment should use environment variable injection (not .env files)
- API keys should be specific to environment (dev vs prod)

## Related Documentation

- [Project Setup Guide](./SETUP_CHECKLIST.md)
- [Development Environment](./CURRENT_STATE_SUMMARY.md)
- [API Reference](./API_REFERENCE.md)
