# DPC Practice Website Scraping Prompt

## Objective
Extract pricing and service details from individual DPC practice websites to enrich provider records with real membership fees and offerings.

---

## Data to Extract

For each DPC practice website, extract the following information:

### 1. Pricing Information (Priority: HIGH)
```
- Monthly membership fee (individual adult)
- Monthly membership fee (child/pediatric)
- Family membership fee or discount
- Enrollment/registration fee (one-time)
- Annual payment discount (if offered)
- Any tiered pricing (e.g., by age group)
```

### 2. Services Included (Priority: HIGH)
```
- Unlimited office visits (Y/N)
- Same-day/next-day appointments (Y/N)
- Telemedicine/virtual visits (Y/N)
- Direct phone/text access to doctor (Y/N)
- After-hours availability (Y/N)
- Annual wellness exams (Y/N)
- Basic lab work included (Y/N)
- In-office procedures included (list if specified)
- Chronic disease management (Y/N)
- Mental health services (Y/N)
- Pediatric care (Y/N)
- Women's health services (Y/N)
```

### 3. Practice Details (Priority: MEDIUM)
```
- Practice/brand name (may differ from physician name)
- Tagline or mission statement
- Year established
- Patient panel size limit
- Current availability (accepting new patients Y/N)
- Waitlist status
```

### 4. Provider Credentials (Priority: LOW)
```
- Board certifications
- Medical school
- Residency
- Years in practice
- Specializations within family medicine
- Languages spoken
```

---

## Scraping Instructions

### Step 1: Navigate to Practice Website
Use the `website` field from our database. If null, search Google for:
```
"{physician_name}" DPC "{city}" "{state}"
```

### Step 2: Locate Pricing Page
Common URL patterns:
- `/pricing`
- `/membership`
- `/fees`
- `/plans`
- `/join`
- `/services`
- `/how-it-works`

### Step 3: Extract Structured Data
Look for pricing in these formats:
```
"$X/month" or "$X per month"
"$X monthly"
"Starting at $X"
"Individual: $X | Family: $Y"
"Adult (18+): $X | Child: $Y"
```

### Step 4: Handle Edge Cases

**No pricing displayed:**
- Note "Contact for pricing" or "Pricing available upon request"
- Check if there's a "Schedule consultation" CTA

**Pricing tiers:**
- Extract all tiers with age ranges or categories
- Example: "18-44: $99/mo | 45-64: $129/mo | 65+: $149/mo"

**Family pricing:**
- Look for "household" or "family" discounts
- Often structured as: "First adult: $X, Additional adults: $Y, Children: $Z"

**Employer/corporate plans:**
- Note if practice offers employer DPC
- These are separate from individual pricing

---

## Output Format

For each practice, output JSON:

```json
{
  "npi": "1234567890",
  "website": "https://example-dpc.com",
  "scrapedAt": "2025-01-15T18:00:00Z",
  "pricing": {
    "individualMonthly": 150,
    "childMonthly": 50,
    "familyMonthly": 350,
    "enrollmentFee": 100,
    "annualDiscount": "2 months free",
    "pricingNotes": "Ages 18-64. Seniors 65+ contact for pricing.",
    "pricingConfidence": "high"
  },
  "services": {
    "unlimitedVisits": true,
    "sameDayAppointments": true,
    "telemedicine": true,
    "directAccess": true,
    "afterHours": true,
    "labsIncluded": "basic panels",
    "proceduresIncluded": ["EKGs", "joint injections", "skin biopsies"],
    "chronicCareManagement": true,
    "pediatrics": true,
    "womensHealth": true
  },
  "practice": {
    "brandName": "Family First DPC",
    "acceptingPatients": true,
    "waitlistMonths": null,
    "panelLimit": 500,
    "currentPanelSize": null
  },
  "provider": {
    "boardCertifications": ["ABFM"],
    "languages": ["English", "Spanish"]
  },
  "scrapeStatus": "success",
  "scrapeNotes": null
}
```

---

## Confidence Scoring

Rate pricing confidence:

| Confidence | Criteria |
|------------|----------|
| **high** | Explicit pricing on website (e.g., "$150/month") |
| **medium** | Pricing range given (e.g., "$100-175/month") |
| **low** | Inferred from context or outdated |
| **none** | No pricing found, requires contact |

---

## Common DPC Website Platforms

Many DPC practices use these platforms (may have similar layouts):

1. **Hint Health** - Clean pricing pages, structured data
2. **Atlas MD** - Membership-focused layouts
3. **Elation Health** - Patient portal integrations
4. **Custom WordPress** - Variable layouts
5. **Squarespace/Wix** - Simple single-page sites

---

## Rate Limiting & Ethics

- **Delay**: 2-3 seconds between requests
- **User-Agent**: Identify as data collection for healthcare comparison
- **robots.txt**: Respect disallow rules
- **No login bypass**: Only scrape publicly available information
- **Cache**: Store results to avoid repeated scraping

---

## Sample Websites to Test

Start with these known DPC practices:

1. https://www.plumhealthdpc.com (Detroit)
2. https://www.accesshealthcarefm.com (Various)
3. https://www.nextera.healthcare (Colorado)
4. https://www.mydirectcare.com (Various)

---

## Database Update Query

After scraping, update providers:

```sql
UPDATE dpc_providers
SET
  monthly_fee = :individualMonthly,
  family_fee = :familyMonthly,
  services_included = :servicesArray,
  accepting_patients = :acceptingPatients,
  website = :website,
  updated_at = NOW()
WHERE npi = :npi;
```

---

## Implementation Options

### Option A: AI-Assisted Scraping (Recommended)
Use Claude or GPT-4 with browser tools to navigate and extract:
```
For each provider:
1. Open website URL
2. Find pricing page
3. Extract data using this prompt
4. Output structured JSON
```

### Option B: Playwright/Puppeteer Script
Build automated scraper with:
- Page navigation
- Content extraction
- Pricing regex patterns
- Fallback to screenshot + OCR

### Option C: Manual Data Collection
For high-value practices or difficult sites:
- Create Google Form for data entry
- Assign to team members
- QA check entries

### Option D: Firecrawl MCP Server
Use the firecrawl-mcp-server in this repo:
```
/scrape {url} --extract pricing,services,availability
```

---

## Next Steps

1. Export list of provider websites from database
2. Prioritize by city (start with major metros)
3. Run scraping batch (50-100 at a time)
4. Review and QA extracted data
5. Update database with enriched pricing
6. Re-run for practices without websites (search first)
