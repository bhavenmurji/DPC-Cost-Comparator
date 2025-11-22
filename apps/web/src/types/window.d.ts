// Extend window interface to include PostHog
interface Window {
  posthog?: {
    capture: (event: string, properties?: Record<string, any>) => void
  }
}
