# Environment Validation - Quick Reference

## What Was Implemented

A comprehensive environment variable validation system with type safety, clear error messages, and graceful fallbacks.

## Files Created

| File | Purpose |
|------|---------|
| `apps/web/src/config/env.ts` | Core validation module with Zod schema |
| `apps/web/src/vite-env.d.ts` | TypeScript type definitions for Vite env vars |
| `docs/ENV_VALIDATION_SETUP.md` | Complete documentation |

## Files Updated

| File | Changes |
|------|---------|
| `apps/web/src/main.tsx` | Validate env at startup, show error dialog if missing |
| `apps/web/src/services/apiClient.ts` | Validate API URL exists, use validated config |
| `apps/web/src/components/ProviderMap.tsx` | Check for Maps API key, show fallback if missing |

## Core Usage

### Get Validated Configuration
```typescript
import { getEnv } from './config/env'

const env = getEnv()
console.log(env.apiUrl)           // string
console.log(env.hasGoogleMapsKey) // boolean
console.log(env.isDevelopment)    // boolean
```

### Check Configuration Status
```typescript
import { initializeEnv } from './config/env'

const result = initializeEnv()
if (result.success) {
  console.log('Configuration valid')
} else {
  console.error('Missing variables:', result.errors)
  console.warn('Warnings:', result.warnings)
}
```

### Log All Issues
```typescript
import { logEnvValidation } from './config/env'

logEnvValidation() // Shows errors and warnings in console
```

## Environment Variables

### Required
- **VITE_API_URL** - API base URL (must be valid URL)
  - Example: `http://localhost:4000`
  - Example: `https://api.example.com`
  - Default: `http://localhost:4000` (if .env missing)

### Optional
- **VITE_GOOGLE_MAPS_API_KEY** - Google Maps API key
  - If missing: Map view shows fallback message
  - Default: empty string (maps disabled)

- **VITE_POSTHOG_KEY** - PostHog analytics key
  - If missing: Analytics disabled (logged as warning)
  - Default: empty string

- **VITE_POSTHOG_ENABLE_RECORDINGS** - Enable session recordings
  - Values: `'true'` or `'false'`
  - Default: `'false'`

## Error Scenarios

### Scenario 1: Missing VITE_API_URL
```
Status: Critical Error (blocks startup)
User Sees: Error dialog with setup instructions
Console:
  ENVIRONMENT VALIDATION FAILED:
    ERROR: VITE_API_URL is not configured...
```

### Scenario 2: Missing VITE_GOOGLE_MAPS_API_KEY
```
Status: Warning (allows startup)
User Sees: "Map View Not Available" fallback message in ProviderMap
Console:
  ENVIRONMENT WARNINGS:
    WARNING: VITE_GOOGLE_MAPS_API_KEY is not configured...
```

### Scenario 3: Invalid VITE_API_URL Format
```
Status: Critical Error (blocks startup)
User Sees: Error dialog with validation error
Console:
  ENVIRONMENT VALIDATION FAILED:
    ERROR: VITE_API_URL must be a valid URL
```

## Configuration Examples

### Local Development (All Features)
```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC..._your_dev_key_here
VITE_POSTHOG_KEY=phc_your_dev_key_here
VITE_POSTHOG_ENABLE_RECORDINGS=false
```

### Minimal Setup (API Only)
```env
VITE_API_URL=http://localhost:4000
# Maps and analytics will be disabled with warnings
```

### Production
```env
VITE_API_URL=https://api.example.com
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC..._your_prod_key_here
VITE_POSTHOG_KEY=phc_your_prod_key_here
VITE_POSTHOG_ENABLE_RECORDINGS=false
```

## Using in Components

### Conditional Rendering Based on Config
```typescript
import { getEnv } from '../config/env'

export default function MyComponent() {
  const env = getEnv()

  if (!env.hasGoogleMapsKey) {
    return <div>Maps feature not available</div>
  }

  return <GoogleMap apiKey={env.googleMapsApiKey} />
}
```

### Conditional Initialization
```typescript
import { getEnv } from '../config/env'

export const initializeServices = () => {
  const env = getEnv()

  if (env.posthogKey) {
    initializeAnalytics(env.posthogKey)
  }

  if (env.isDevelopment) {
    enableDebugLogging()
  }
}
```

## TypeScript Autocomplete

Once configured, you get full autocomplete:

```typescript
const env = getEnv()

env.          // Shows available properties:
              // - apiUrl
              // - googleMapsApiKey
              // - hasGoogleMapsKey
              // - posthogKey
              // - posthogEnableRecordings
              // - isDevelopment
```

## Adding New Variables

1. **Update vite-env.d.ts:**
   ```typescript
   interface ImportMetaEnv {
     readonly VITE_NEW_VAR?: string
   }
   ```

2. **Update env.ts schema:**
   ```typescript
   VITE_NEW_VAR: z.string().optional().default(''),
   ```

3. **Update EnvironmentConfig interface:**
   ```typescript
   newVar: string
   ```

4. **Update parseEnvironment() return:**
   ```typescript
   newVar: validated.VITE_NEW_VAR,
   ```

## Testing

### Test in Development
```bash
# Valid config
cp .env.example .env
npm run dev:web  # Should start without errors

# Test error handling - remove VITE_API_URL from .env
npm run dev:web  # Should show error dialog

# Test warnings - remove VITE_GOOGLE_MAPS_API_KEY from .env
npm run dev:web  # App loads, console shows warning
```

### Test in Code
```typescript
import { getEnv, initializeEnv } from './config/env'

test('validates configuration', () => {
  const result = initializeEnv()
  expect(result.success).toBe(true)
})

test('returns typed configuration', () => {
  const env = getEnv()
  expect(typeof env.apiUrl).toBe('string')
  expect(typeof env.hasGoogleMapsKey).toBe('boolean')
})
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Must be a valid URL" error | Ensure VITE_API_URL starts with http:// or https:// |
| Map view disabled | Set VITE_GOOGLE_MAPS_API_KEY in .env file |
| TypeScript errors on import.meta | Ensure vite-env.d.ts exists in src/ directory |
| Error dialog stuck | Click Retry button or clear browser cache |
| Variables not loading | Check .env file exists and has correct syntax (no spaces around =) |

## Flow Diagram

```
App Start
   ↓
main.tsx runs initializeEnv()
   ↓
   ├─→ Validation Success → App renders normally
   │
   └─→ Validation Failed → Show error dialog, block startup

   Later: Components use getEnv()
   ├─→ ProviderMap checks hasGoogleMapsKey
   ├─→ apiClient validates apiUrl
   └─→ Services access posthogKey, etc.
```

## Key Features

✅ **Type-Safe Access** - Full TypeScript support
✅ **Early Validation** - Errors caught at startup
✅ **Clear Messages** - Users know exactly what's wrong
✅ **Graceful Fallbacks** - Optional features disable themselves
✅ **Single Source of Truth** - All config in one place
✅ **Extensible** - Easy to add new variables
✅ **Well-Documented** - Comprehensive docs included

## Support

For detailed information, see:
- **Setup Guide:** `docs/ENV_VALIDATION_SETUP.md`
- **Implementation Details:** `docs/ENV_VALIDATION_IMPLEMENTATION_SUMMARY.md`
- **Configuration:** `apps/web/.env.example`

## Related Tasks

- Add similar validation to `apps/api` for backend config
- Implement environment-specific .env files (.env.local, .env.production)
- Add validation to CI/CD pipeline
- Document secrets management strategy
