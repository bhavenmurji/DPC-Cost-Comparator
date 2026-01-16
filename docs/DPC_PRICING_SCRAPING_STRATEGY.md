# DPC Practice Pricing Scraping Strategy

## Overview

This document outlines the strategy for systematically collecting pricing data from DPC practice websites. As of January 2026, we have **5/735 providers** with verified pricing data.

## Data Collection Methods

### Method 1: Automated Web Scraping (Primary)
**Service:** `apps/api/src/services/pricingScraper.service.ts`

Uses Playwright to:
1. Navigate to practice website
2. Try common pricing page URLs (`/pricing`, `/membership`, `/fees`, etc.)
3. Extract pricing using regex patterns
4. Save with confidence scores

**Patterns Detected:**
- Monthly fees: `$85/month`, `$150 per month`, `$99/mo`
- Age tiers: `Ages 0-26: $100`, `27+: $150`
- Family pricing: `Family: $350`, `Household: $400`
- Enrollment fees: `One-time fee $100`, `Enrollment $50`

**Run Commands:**
```bash
cd apps/api
npm run pricing:scrape              # Scrape all providers
npm run pricing:scrape:test         # Test with 10 providers
```

### Method 2: Manual Scraping (High-Value)
**Script:** `scripts/save-scraped-pricing.ts`

For practices with complex pricing or JavaScript-heavy sites that automated scraping can't handle, manually visit and record pricing, then add to the script.

**Template for Adding Practices:**
```typescript
{
  practiceName: 'Practice Name',
  website: 'https://example.com',
  pricing: {
    individualMonthly: 150,
    childMonthly: null,      // if different from individual
    familyMonthly: null,     // household/family rate
    enrollmentFee: null,     // one-time onboarding fee
    pricingTiers: [
      { label: 'Ages 0-26', monthlyFee: 100, ageMin: 0, ageMax: 26 },
      { label: 'Ages 27+', monthlyFee: 150, ageMin: 27, ageMax: 99 },
    ],
    pricingNotes: 'Additional context about pricing',
    pricingConfidence: 'high' as const,
  },
}
```

**Run:**
```bash
npm run pricing:save
```

### Method 3: DPC Alliance Directory
**Access:** Requires member login (credentials in `.env`)

The DPC Alliance directory lists ~360 physician members. For each:
1. Get physician name and practice name
2. Search Google for practice website
3. Scrape pricing from website

**Note:** DPC Alliance shows membership but not pricing. It's a source for finding practices to scrape.

## Pricing Data Model

### Database Fields (DPCProvider)

| Field | Type | Description |
|-------|------|-------------|
| `monthlyFee` | Float | Base individual monthly fee |
| `childMonthlyFee` | Float? | Child/pediatric rate if different |
| `familyFee` | Float? | Family/household monthly rate |
| `enrollmentFee` | Float? | One-time enrollment/onboarding fee |
| `annualDiscount` | String? | e.g., "2 months free" or "10%" |
| `pricingTiers` | JSON | Age-based or visit-based tier array |
| `pricingNotes` | String? | Additional context |
| `pricingConfidence` | String? | "high", "medium", "low", "none" |
| `pricingScrapedAt` | DateTime? | Last scrape timestamp |

### Pricing Tier Structure

```typescript
interface PricingTier {
  label: string        // e.g., "Ages 0-26", "Tier 1 (6 visits)"
  monthlyFee: number   // e.g., 100
  ageMin?: number      // e.g., 0
  ageMax?: number      // e.g., 26
}
```

## Common Pricing Models

### 1. Flat Rate (Most Common)
Single price for all patients.
- Example: $85/month

### 2. Age-Tiered
Different prices by age bracket.
- Example: 0-17: $50, 18-64: $100, 65+: $75

### 3. Visit-Based Tiers
Limited visits per tier (less common).
- Example: Tier 1 (6 visits): $45/mo, Tier 2 (12 visits): $85/mo

### 4. Family Plans
Household/couple discounts.
- Example: Individual: $100, Couple: $175, Family: $250

### 5. Concierge Hybrid
Higher price with additional services.
- Example: $200+/month, often includes home visits

## Prioritization Strategy

### Phase 1: High-Traffic Markets (First 100)
Focus on major metros with most searches:
1. Dallas/Fort Worth, TX
2. Houston, TX
3. Phoenix, AZ
4. Los Angeles, CA
5. Chicago, IL
6. Denver, CO
7. Atlanta, GA
8. Seattle, WA
9. Miami, FL
10. New York, NY

### Phase 2: DPC Hotspots (Next 200)
States with high DPC adoption:
- Texas, Florida, California, Colorado, Washington

### Phase 3: Complete Coverage (Remaining 400+)
Systematic sweep of all remaining providers with websites.

## Quality Scoring

### Confidence Levels

**High (95%+ accurate):**
- Clear pricing table on website
- Explicit monthly fee stated
- Recent pricing (within 1 year)

**Medium (70-95% accurate):**
- Range given (e.g., "$75-150/month")
- Pricing from blog post or FAQ
- May require contact to confirm

**Low (50-70% accurate):**
- Pricing inferred from similar practices
- Old information (>2 years)
- "Starting at" pricing

**None (Unknown):**
- "Contact for pricing"
- No website
- Website returns 404

## Rate Limiting & Ethics

### Respectful Scraping
- 2-second delay between requests
- Custom User-Agent identifying the tool
- Respect robots.txt where possible
- Only scrape public pricing information

### Request Headers
```typescript
'User-Agent': 'HealthPartnershipX-DPC-Comparator/1.0 (healthcare pricing comparison)'
```

## Monitoring & Reporting

### Metrics to Track
- Total providers with pricing: `X/735`
- High confidence pricing: `X%`
- Scrape success rate: `X%`
- Failed websites (404/DNS): `X`

### Database Queries

```sql
-- Providers with scraped pricing
SELECT COUNT(*) FROM dpc_providers
WHERE monthly_fee > 0 AND pricing_confidence IS NOT NULL;

-- Pricing by confidence level
SELECT pricing_confidence, COUNT(*)
FROM dpc_providers
WHERE pricing_confidence IS NOT NULL
GROUP BY pricing_confidence;

-- Providers needing pricing
SELECT id, practice_name, website FROM dpc_providers
WHERE (monthly_fee = 0 OR pricing_scraped_at IS NULL)
AND website IS NOT NULL
LIMIT 50;
```

## Troubleshooting

### Common Issues

**1. JavaScript-Rendered Pricing**
- Solution: Playwright waits for `networkidle`
- Increase timeout if needed

**2. Pricing Behind Login/Contact Form**
- Mark as confidence: 'none'
- Note: "Contact for pricing"

**3. Multiple Practice Locations**
- Scrape primary location pricing
- Note location in `pricingNotes`

**4. Outdated Websites**
- Check Wayback Machine for archived pricing
- Lower confidence if old

**5. 404/DNS Errors**
- Practice may have closed
- Search for new website URL
- Mark provider as inactive if confirmed closed

## Manual Scraping Workflow

1. Query providers without pricing:
   ```sql
   SELECT * FROM dpc_providers
   WHERE monthly_fee = 0 AND website IS NOT NULL
   LIMIT 20;
   ```

2. Visit each website, find pricing page

3. Record in `scripts/save-scraped-pricing.ts`:
   ```typescript
   {
     practiceName: 'Found Practice',
     website: 'https://foundpractice.com',
     pricing: { individualMonthly: 99, ... }
   }
   ```

4. Run save script:
   ```bash
   npm run pricing:save
   ```

5. Verify in database

## Scraped Data (As of 2026-01-15)

| Practice | Monthly | Family | Notes |
|----------|---------|--------|-------|
| Plum Health DPC | $85 | $240 | Detroit, MI |
| PartnerMD | $217 | - | Concierge hybrid |
| Greenlake Primary Care | $150 | - | Age-tiered (0-26: $100) |
| MDDPC | $45 | - | Visit-based tiers |
| Culver Pediatrics | $250 | - | $1,000 onboarding |

## Next Steps

1. [ ] Run automated scraper on all providers with websites
2. [ ] Prioritize top 100 markets for manual scraping
3. [ ] Integrate pricing display on frontend
4. [ ] Set up weekly scraping job for updates
5. [ ] Build pricing comparison charts
