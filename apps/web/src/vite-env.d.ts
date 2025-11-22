/// <reference types="vite/client" />

/**
 * Vite environment variable type definitions
 * Ensures TypeScript knows about VITE_* variables
 */
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
  readonly VITE_POSTHOG_KEY?: string
  readonly VITE_POSTHOG_ENABLE_RECORDINGS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
