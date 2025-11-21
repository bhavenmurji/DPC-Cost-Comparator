import posthog from 'posthog-js'

// Initialize PostHog
export const initAnalytics = () => {
  const posthogKey = (import.meta as any).env?.VITE_POSTHOG_KEY

  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: 'https://app.posthog.com',
      // Capture pageviews automatically
      capture_pageview: true,
      // Respect user privacy
      autocapture: false,
      // Use session recording only if explicitly enabled
      disable_session_recording: !(import.meta as any).env?.VITE_POSTHOG_ENABLE_RECORDINGS,
    })
    console.log('📊 Analytics initialized')
  } else {
    console.log('⚠️  Analytics disabled (no VITE_POSTHOG_KEY)')
  }
}

// Event tracking functions
export const analytics = {
  // Track cost comparison calculation
  trackComparisonCalculated: (data: {
    zipCode: string
    state: string
    age: number
    traditionalCost: number
    dpcCost: number
    savings: number
    recommendedPlan: string
    dataSource: string
  }) => {
    posthog.capture('comparison_calculated', {
      zip_code: data.zipCode,
      state: data.state,
      age: data.age,
      traditional_annual_cost: data.traditionalCost,
      dpc_annual_cost: data.dpcCost,
      annual_savings: data.savings,
      recommended_plan: data.recommendedPlan,
      data_source: data.dataSource,
    })
  },

  // Track provider search
  trackProviderSearch: (data: {
    zipCode: string
    radius: number
    resultsCount: number
  }) => {
    posthog.capture('provider_search', {
      zip_code: data.zipCode,
      search_radius: data.radius,
      results_count: data.resultsCount,
    })
  },

  // Track provider viewed
  trackProviderViewed: (data: {
    providerId: string
    providerName: string
    city: string
    state: string
    monthlyFee: number
    distanceMiles?: number
  }) => {
    posthog.capture('provider_viewed', {
      provider_id: data.providerId,
      provider_name: data.providerName,
      city: data.city,
      state: data.state,
      monthly_fee: data.monthlyFee,
      distance_miles: data.distanceMiles,
    })
  },

  // Track provider contact (phone click)
  trackProviderContact: (data: {
    providerId: string
    providerName: string
    contactMethod: 'phone' | 'website' | 'email'
  }) => {
    posthog.capture('provider_contact', {
      provider_id: data.providerId,
      provider_name: data.providerName,
      contact_method: data.contactMethod,
    })
  },

  // Track map interaction
  trackMapInteraction: (action: 'view_map' | 'marker_click' | 'zoom' | 'pan') => {
    posthog.capture('map_interaction', {
      action,
    })
  },

  // Track filters used
  trackFiltersApplied: (filters: {
    maxMonthlyFee?: number
    minRating?: number
    acceptingPatients?: boolean
    specialties?: string[]
    sortBy?: string
  }) => {
    posthog.capture('filters_applied', filters)
  },

  // Track claim practice button click
  trackClaimPractice: (data: {
    providerId: string
    providerName: string
  }) => {
    posthog.capture('claim_practice_clicked', {
      provider_id: data.providerId,
      provider_name: data.providerName,
    })
  },

  // Track page view manually (for SPA navigation)
  trackPageView: (pagePath: string) => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      path: pagePath,
    })
  },
}

export default analytics
