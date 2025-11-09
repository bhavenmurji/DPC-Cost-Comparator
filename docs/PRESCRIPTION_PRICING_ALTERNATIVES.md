# Prescription Pricing Alternatives - Without GoodRx API

## Problem

GoodRx is currently **not accepting new API key applications**. We need alternative sources for prescription pricing data.

## Alternative Solutions

### ✅ Option 1: Walmart $4/$10 Generic Program (RECOMMENDED - START HERE)

**Availability:** Public data, no API needed
**Coverage:** ~650+ generic medications
**Cost:** $4 (30-day supply) or $10 (90-day supply)
**Accuracy:** Official pricing, highly reliable

**Implementation Strategy:**
1. Create static database of Walmart $4/$10 medications
2. Store in `pharmacy_savings_programs` and `pharmacy_savings_medications` tables
3. Match user prescriptions to Walmart list
4. Provide accurate pricing for covered medications

**Data Source:**
- Walmart Pharmacy website
- Official PDF lists (updated periodically)
- Can be scraped or manually entered

**Pros:**
- ✅ Free, no API key needed
- ✅ Accurate official pricing
- ✅ Large coverage (~650 medications)
- ✅ Simple to implement

**Cons:**
- ❌ Limited to generic medications
- ❌ Doesn't cover brand-name drugs
- ❌ Only Walmart pricing (not other pharmacies)

---

### ✅ Option 2: Costco Pharmacy Pricing

**Availability:** Publicly accessible (membership not required for pharmacy)
**Coverage:** Thousands of medications (generic and brand-name)
**Cost:** Competitive pricing, often cheaper than other pharmacies
**Accuracy:** Official pricing, highly reliable

**Implementation Strategy:**
1. Web scraping of Costco pharmacy price lists
2. Store in `prescription_prices` table with source='COSTCO'
3. Update monthly or quarterly
4. Membership cost ($60/year) can be factored into comparison

**Data Source:**
- Costco Pharmacy website
- Price comparison tools
- Can be scraped periodically

**Pros:**
- ✅ Competitive pricing (often lowest)
- ✅ Covers generic AND brand-name
- ✅ Widely available (Costco locations nationwide)
- ✅ No membership required for pharmacy

**Cons:**
- ❌ Requires web scraping
- ❌ Pricing may vary by location
- ❌ Manual updates needed

---

### ✅ Option 3: Medicare Part D Pricing Data

**Availability:** Public dataset from CMS (Centers for Medicare & Medicaid Services)
**Coverage:** Comprehensive pricing data for thousands of drugs
**Cost:** Free, government data
**Accuracy:** Official Medicare pricing

**Implementation Strategy:**
1. Download CMS drug pricing files
2. Parse and import to database
3. Use as baseline pricing reference
4. Update quarterly when CMS releases new data

**Data Source:**
- https://data.cms.gov/
- Medicare Part D Drug Pricing
- Updated quarterly

**Pros:**
- ✅ Free, official government data
- ✅ Comprehensive coverage
- ✅ Updated regularly by CMS
- ✅ Nationwide pricing data

**Cons:**
- ❌ Medicare pricing (not cash pricing)
- ❌ May not reflect actual pharmacy cash prices
- ❌ Complex datasets to parse

---

### ✅ Option 4: Pharmacy Cash Price Aggregation

**Availability:** Various sources
**Coverage:** Variable
**Cost:** Free (web scraping) or paid (data services)
**Accuracy:** Varies by source

**Implementation Strategy:**
1. Scrape multiple pharmacy websites (CVS, Walgreens, Rite Aid)
2. Aggregate pricing data
3. Store in database with source tracking
4. Update periodically

**Data Sources:**
- Individual pharmacy websites
- Price comparison tools (e.g., BlinkHealth, SingleCare)
- Manufacturer discount programs

**Pros:**
- ✅ Multiple data sources for comparison
- ✅ Real-world cash pricing
- ✅ Can show price variations

**Cons:**
- ❌ Complex scraping (multiple sites)
- ❌ Frequent updates needed
- ❌ Legal/ethical considerations for scraping
- ❌ Risk of blocking/rate limiting

---

### ✅ Option 5: Static Pricing Database (IMMEDIATE SOLUTION)

**Availability:** Manual compilation
**Coverage:** Common medications only (~100-200 most prescribed)
**Cost:** Free (manual effort)
**Accuracy:** Based on research and public data

**Implementation Strategy:**
1. Research pricing for top 100 most prescribed medications
2. Get pricing from multiple sources (Walmart, Costco, GoodRx website)
3. Create static pricing database
4. Users can see estimated costs for common medications

**Data Sources:**
- GoodRx website (public prices, not API)
- Pharmacy websites
- Manual research

**Pros:**
- ✅ Can implement immediately
- ✅ No API or scraping needed
- ✅ Covers most common prescriptions
- ✅ Simple to maintain

**Cons:**
- ❌ Limited coverage
- ❌ Manual updates required
- ❌ May not be current
- ❌ Doesn't scale well

---

### ❌ Option 6: Third-Party Pricing APIs

**Available Services:**
- **BlinkHealth API** - May have API access
- **RxSaver** - Consumer-facing, limited API
- **SingleCare** - Discount card program
- **LowestMed** - Price comparison service

**Status:** Need to research API availability and terms

**Pros:**
- ✅ Professional data services
- ✅ Updated regularly
- ✅ Comprehensive coverage

**Cons:**
- ❌ May require partnership/fees
- ❌ API availability uncertain
- ❌ Terms of service restrictions

---

## Recommended Implementation Plan

### Phase 1: Immediate (Week 2-3)
**Use Static Data + Walmart Program**

1. **Create Walmart $4/$10 Medication Database**
   - Import official Walmart generic list (~650 medications)
   - Store in `pharmacy_savings_programs` table
   - Implement medication matching logic

2. **Build Top 100 Static Pricing Database**
   - Research pricing for 100 most common prescriptions
   - Get data from multiple public sources
   - Store in `prescription_prices` table
   - Mark as estimates with last updated date

3. **Implement Basic Prescription Cost Calculator**
   - Match user prescriptions to available data
   - Calculate monthly/annual costs
   - Show Walmart $4 savings where applicable
   - Display "estimate" disclaimer for non-Walmart drugs

**Deliverables:**
- Working prescription cost feature
- Real Walmart $4 pricing for ~650 generics
- Estimated pricing for top 100 common medications

**Time:** 2-3 days of work

---

### Phase 2: Enhanced (Week 3-4)
**Add Costco + Medicare Data**

1. **Scrape Costco Pharmacy Pricing**
   - Build web scraper for Costco pharmacy
   - Get pricing for common medications
   - Compare to Walmart pricing

2. **Import Medicare Part D Data**
   - Download CMS drug pricing files
   - Parse and import to database
   - Use as baseline reference pricing

3. **Improve Cost Calculator**
   - Show price comparisons (Walmart vs Costco)
   - Include membership costs in comparison
   - Better estimates for non-covered medications

**Deliverables:**
- Costco pricing integration
- Medicare pricing reference
- Multi-source price comparison

**Time:** 1 week of work

---

### Phase 3: Comprehensive (Week 5-6)
**Multi-Pharmacy Scraping**

1. **Build Pharmacy Scrapers**
   - CVS, Walgreens, Rite Aid scrapers
   - Aggregate pricing data
   - Update weekly or monthly

2. **Advanced Comparison**
   - Show best prices across all pharmacies
   - Factor in pharmacy locations (distance)
   - Include discount card programs

**Deliverables:**
- Comprehensive pharmacy pricing
- Best price recommendations
- Location-aware pricing

**Time:** 2 weeks of work

---

### Phase 4: Future Enhancements
**Professional Data Sources**

1. **Research Third-Party APIs**
   - Contact BlinkHealth, RxSaver, others
   - Negotiate API access or partnership
   - Integrate professional pricing data

2. **Real-Time Updates**
   - Scheduled scraping jobs
   - Automatic price updates
   - Data freshness tracking

---

## Technical Implementation

### Database Schema (Already Have This!)

```prisma
model PrescriptionPrice {
  id              String      @id @default(cuid())
  drugName        String
  genericName     String?
  dosage          String
  form            String
  quantity        Int
  zipCode         String
  pharmacyName    String
  price           Float
  source          PriceSource
  cachedAt        DateTime    @default(now())
  expiresAt       DateTime
}

model PharmacySavingsProgram {
  id                 String                      @id @default(cuid())
  programName        String
  pharmacyChain      String
  programType        ProgramType
  medications        PharmacySavingsMedication[]
}

model PharmacySavingsMedication {
  id                String                  @id @default(cuid())
  programId         String
  program           PharmacySavingsProgram  @relation(fields: [programId], references: [id])
  medicationName    String
  genericName       String
  strength          String
  price30Day        Float
  price90Day        Float?
}
```

### Service Architecture

```typescript
// apps/api/src/services/prescriptionPricing.service.ts

class PrescriptionPricingService {
  // Check Walmart $4 program
  async checkWalmartProgram(drugName: string): Promise<WalmartPrice | null>

  // Get cached prescription price
  async getPrescriptionPrice(drugName: string, zipCode: string): Promise<PriceComparison>

  // Calculate total prescription costs
  async calculatePrescriptionCosts(medications: Medication[]): Promise<TotalCost>

  // Find best pharmacy pricing
  async findBestPrice(drugName: string, zipCode: string): Promise<BestPrice>
}
```

---

## Next Steps

1. **Start with Walmart $4 Database** (easiest, most reliable)
2. **Build static pricing for top 100 medications**
3. **Create prescription cost calculator service**
4. **Integrate with cost comparison**
5. **Add Costco and Medicare data later**

---

## Data Files to Create

1. `data/walmart-4-dollar-medications.json` - Walmart generic list
2. `data/top-100-prescription-prices.json` - Common medication pricing
3. `data/pharmacy-programs.json` - Discount programs

---

## Estimated Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Walmart $4 DB | 1 day | 650 medications with accurate pricing |
| Top 100 Pricing | 1-2 days | Static pricing for common drugs |
| Cost Calculator | 1 day | Working prescription cost feature |
| **Total Phase 1** | **3-4 days** | **Functional prescription pricing** |

---

## Summary

**We can build a functional prescription pricing feature WITHOUT GoodRx API by:**

1. ✅ Using Walmart $4/$10 program (official, free, 650+ medications)
2. ✅ Creating static database of top 100 common prescriptions
3. ✅ Scraping Costco pricing (next phase)
4. ✅ Using Medicare Part D data (government data)
5. ✅ Building multi-pharmacy comparison (advanced phase)

**Start with Walmart + static data = functional feature in 3-4 days!**
