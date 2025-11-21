# Analytics Setup Guide - PostHog

## Overview
The platform uses PostHog for privacy-friendly analytics to track user behavior and provider network growth.

## Setup Instructions

### 1. Create PostHog Account
1. Go to https://posthog.com
2. Sign up for a free account (includes 1 million events/month)
3. Create a new project for "Ignite Health Partnerships"

### 2. Get Your API Key
1. In PostHog dashboard, go to **Project Settings**
2. Copy your **Project API Key**
3. Add to `apps/web/.env`:
   ```
   VITE_POSTHOG_KEY=phc_your_actual_key_here
   VITE_POSTHOG_ENABLE_RECORDINGS=false
   ```

### 3. Restart Development Server
```bash
cd apps/web
npm run dev
```

## Analytics Events Being Tracked

### User Actions
- `comparison_calculated` - Cost comparison completed
  - Properties: zipCode, state, age, costs, savings, recommendedPlan
- `provider_search` - Provider search performed
  - Properties: zipCode, radius, resultsCount
- `provider_viewed` - Provider card clicked for details
  - Properties: providerId, providerName, location, monthlyFee, distance
- `provider_contact` - User contacted provider (phone/website/email)
  - Properties: providerId, providerName, contactMethod
- `filters_applied` - Search filters changed
  - Properties: maxMonthlyFee, minRating, acceptingPatients, specialties, sortBy
- `map_interaction` - Map view actions
  - Properties: action (view_map, marker_click, zoom, pan)
- `claim_practice_clicked` - Provider claims their listing
  - Properties: providerId, providerName
- `$pageview` - Page views (automatic)
  - Properties: path, url

## Key Metrics to Monitor

### Growth Metrics
1. **User Engagement**
   - Total comparisons calculated
   - Average searches per session
   - Provider views per search
   - Contact rate (clicks per view)

2. **Geographic Coverage**
   - Searches by ZIP code
   - Searches by state
   - Areas with high demand but low provider count

3. **Provider Network**
   - Provider views by practice
   - Contact attempts by practice
   - Popular practices (most viewed/contacted)
   - Claim practice button clicks

4. **Data Quality**
   - API vs estimate usage ratio
   - Search result counts
   - Empty search results (low coverage areas)

## PostHog Dashboard Recommendations

### Dashboard 1: User Engagement
- Total comparison calculations (trend)
- Comparison calculations by state (map)
- Average savings shown to users
- Data source breakdown (API vs estimates)

### Dashboard 2: Provider Network Growth
- Provider searches by ZIP code (table)
- Top viewed providers (leaderboard)
- Contact attempts by provider
- Claim practice clicks

### Dashboard 3: Geographic Coverage
- Searches by state (bar chart)
- Search results distribution (histogram)
- Empty search results by ZIP (identify gaps)
- Provider density heatmap

## Privacy & GDPR Compliance

PostHog is configured with privacy in mind:
- **No session recordings** by default (disabled)
- **No autocapture** - only explicit events tracked
- **No personal information** - ZIP codes anonymized, no names/emails tracked
- **Self-hosted option** available if needed for HIPAA compliance

## Cost Estimation

Free tier includes:
- 1 million events/month
- Unlimited users
- 12 months data retention
- All features included

Current expected usage:
- ~10,000 comparisons/month → 10,000 events
- ~5,000 provider searches/month → 5,000 events
- ~15,000 provider views/month → 15,000 events
- ~3,000 contact clicks/month → 3,000 events
- **Total: ~33,000 events/month** (well within free tier)

## Integration Code Locations

### Analytics Utility
- **File**: `apps/web/src/utils/analytics.ts`
- **Exports**: `initAnalytics()`, `analytics` object

### App Integration
- **File**: `apps/web/src/App.tsx`
- **Initialize**: On component mount
- **Page views**: On route change

### Component Tracking
- **ComparisonForm**: Tracks calculation completions
- **ProviderSearch**: Tracks searches, filter changes
- **ProviderCard**: Tracks views, contact clicks
- **ProviderMap**: Tracks map interactions (ready to implement)

## Next Steps

1. ✅ PostHog installed and configured
2. ✅ Analytics utility created
3. ✅ Key events tracked
4. ⏳ Create PostHog account
5. ⏳ Add VITE_POSTHOG_KEY to .env
6. ⏳ Create dashboards in PostHog
7. ⏳ Set up weekly email reports
8. ⏳ Configure alerts for key metrics

## Testing Analytics

After adding your API key:

```bash
# Start dev server
cd apps/web
npm run dev

# Perform test actions:
# 1. Calculate a comparison → Check for "comparison_calculated" event
# 2. Search for providers → Check for "provider_search" event
# 3. Click a provider card → Check for "provider_viewed" event
# 4. Click phone number → Check for "provider_contact" event
```

View events in PostHog:
1. Go to **Live Events** tab
2. See events arrive in real-time
3. Click event to see all properties

## Useful PostHog Features

1. **Insights**: Create custom charts and trends
2. **Funnels**: Track conversion from search → view → contact
3. **Retention**: See if users return to compare again
4. **Cohorts**: Group users by behavior (e.g., "High savers", "Multi-searchers")
5. **Feature Flags**: A/B test new features (future use)
