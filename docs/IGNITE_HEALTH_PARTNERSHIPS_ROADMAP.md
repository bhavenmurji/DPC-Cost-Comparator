# Ignite Health Partnerships - Complete Platform Roadmap

**Vision**: A comprehensive insurance comparison and switching platform that empowers Americans to choose the most cost-effective healthcare option by comparing Traditional Insurance vs. DPC + Catastrophic + Out-of-Pocket solutions.

**Inspiration**: CompareTheMeerkat.com, GoCompare, Money Supermarket
**Current Status**: Healthcare.gov API integration complete ✅
**Project Start**: October 2025

---

## Platform Overview

### Core Value Proposition

Help users compare **TWO complete healthcare solutions**:

#### Option A: Traditional Insurance
- Marketplace plans (Bronze, Silver, Gold, Platinum)
- Full coverage: Primary care, specialists, ER, hospital, prescriptions
- Higher premiums, lower out-of-pocket

#### Option B: DPC + Catastrophic + Out-of-Pocket
- **DPC Membership**: Unlimited primary care ($50-150/month)
- **Catastrophic Insurance**: Emergency/hospital only (~$200-400/month)
- **Prescriptions**: GoodRx, Costco, manufacturer coupons
- **Labs/Imaging**: Cash pricing or DPC affiliate deals
- Lower total cost for healthy individuals

---

## Required Data Integrations

### 1. ✅ Healthcare.gov Marketplace API (COMPLETE)
**Status**: Integrated and tested
**API Key**: Configured
**Functionality**:
- Real insurance plan pricing
- Bronze/Silver/Gold/Platinum plans
- Catastrophic plans
- APTC subsidy calculations
- County-level accuracy

**What's Working**:
- Plan search by ZIP/age/income
- Premium calculations
- Deductible/copay information
- Metal tier filtering

---

### 2. ❌ DPC Provider Directory (CRITICAL - NEXT PRIORITY)

**Primary Source**: DPC Frontier Mapper
- **Database Size**: 2,060 DPC practices across 48 states + DC
- **API Status**: No public API available
- **Data Access Method**: Web scraping or partnership request

**Alternative Sources**:
1. **Atlas MD DPC Map** - Interactive DPC clinic finder
2. **DPC Nation** - Industry organization directory
3. **Individual state DPC associations**

**Required Information Per Provider**:
- Practice name and physician(s)
- Address, city, state, ZIP
- Phone, email, website
- Monthly membership fee (individual/family)
- Services included (lab work, imaging, procedures)
- Accepting new patients status
- Specialties/board certifications
- Patient ratings/reviews
- Distance from user location

**Implementation Options**:
1. **Option A**: Build web scraper for DPC Frontier mapper
2. **Option B**: Contact DPC Frontier for API partnership/data access
3. **Option C**: Manual curation + provider submission form
4. **Option D**: License data from aggregator

**Recommended**: Start with Option A (scraper) while pursuing Option B (partnership)

---

### 3. ❌ GoodRx Prescription Pricing API (HIGH PRIORITY)

**Status**: Research complete, API access required
**API Available**: YES - goodrx.com/developer
**Cost**: Unknown (need to apply)

**Available APIs**:
- **Low Price API** - Lowest price from national chains
- **Compare Price API** - Multiple pricing options
- **Coupon API** - Generate discount coupons
- **Drug Search API** - Medication name standardization

**Registration Process**:
1. Apply at goodrx.com/developer/apply
2. Request API key
3. Implement authentication (API key + signature)
4. No rate limits by default (contact for high volume)

**Integration Requirements**:
- Medication name/dosage input
- Quantity per prescription
- ZIP code for local pricing
- Return: Lowest prices + pharmacy locations + coupon URLs

---

### 4. ❌ Lab & Imaging Cash Pricing (MEDIUM PRIORITY)

**Challenge**: No centralized API for lab cash pricing
**Available Options**:

**A. Direct Lab Partnerships**:
1. **LabCorp** - Cash pricing available, no public API
2. **Quest Diagnostics** - Cash pricing, no public API
3. **Any Lab Test Now** - Franchise network, pricing varies

**B. Price Aggregators**:
1. **Healthcare Bluebook** - Fair pricing estimates
2. **FAIR Health** - Out-of-network cost database
3. **New Choice Health** - Medical procedure pricing

**C. DPC Affiliate Pricing**:
- Many DPC practices negotiate wholesale lab pricing
- Typically 50-80% below retail
- Include in DPC provider database

**Implementation Strategy**:
1. **Phase 1**: Static price estimates for common tests
2. **Phase 2**: Web scraping lab websites for cash prices
3. **Phase 3**: Direct partnerships with labs

**Common Tests to Price**:
- Basic Metabolic Panel (BMP)
- Complete Blood Count (CBC)
- Lipid Panel (Cholesterol)
- Hemoglobin A1C (Diabetes)
- TSH (Thyroid)
- Vitamin D
- Urinalysis
- Chest X-ray
- MRI/CT scans

---

### 5. ❌ Pharmacy Savings Programs (MEDIUM PRIORITY)

**Sources**:

**A. Costco Pharmacy**:
- **Membership**: Required ($60/year)
- **API**: No public API
- **Access Method**: Web scraping or manual data collection
- **Advantage**: Often 30-50% cheaper than chain pharmacies

**B. Walmart $4 Generic Program**:
- 30-day supply: $4
- 90-day supply: $10
- 300+ medications
- No membership required

**C. Amazon Pharmacy**:
- Prime membership pricing
- No public API
- RxPass: $5/month for Prime members (generic medications)

**D. Manufacturer Coupons**:
- Many brand-name drugs offer patient assistance
- NeedyMeds.org - Free database
- RxAssist.org - Comprehensive resource

**Implementation**:
1. Create database of $4 generic medications
2. Integrate GoodRx for non-generics
3. Add Costco comparison (with membership cost amortized)
4. Link to manufacturer coupon resources

---

## Technical Architecture

### Frontend (User-Facing)

**Inspiration**: CompareTheMeerkat UI/UX
- Clean, friendly design
- Step-by-step wizard interface
- Visual comparison cards
- Interactive cost breakdowns
- Save/share comparison results

**Technology Stack** (Recommended):
- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Context
- **Charts**: Recharts or Chart.js
- **Forms**: React Hook Form + Zod validation

**Key Pages**:
1. **Home/Landing**: Value proposition, testimonials
2. **Comparison Wizard**: Multi-step form (age, location, health needs)
3. **Results**: Side-by-side comparison with detailed breakdown
4. **Provider Directory**: Search DPC providers by location
5. **Prescription Cost Checker**: Drug name → pricing comparison
6. **Education**: How DPC works, FAQs, glossary
7. **User Dashboard**: Save comparisons, track expenses

---

### Backend (API Layer)

**Current Status**: Express.js API with Healthcare.gov integration

**Required Services**:

```
/api/comparison/calculate
├── Healthcare.gov API (✅ Complete)
├── DPC Provider Search (❌ TODO)
├── GoodRx Pricing (❌ TODO)
└── Lab/Pharmacy Pricing (❌ TODO)

/api/providers
├── GET /search (ZIP, radius, specialty)
├── GET /:id (Provider details)
└── POST /submit (Provider application)

/api/prescriptions
├── POST /price (Drug name, quantity, ZIP)
├── GET /coupon/:drugId
└── GET /alternatives (Generic equivalents)

/api/labs
├── GET /tests (Common test pricing)
└── GET /facilities (Lab locations by ZIP)

/api/user
├── POST /comparison/save
├── GET /comparisons
└── PATCH /preferences
```

---

### Database Schema

**PostgreSQL Tables**:

```sql
-- DPC Providers (curated + scraped)
CREATE TABLE dpc_providers (
  id UUID PRIMARY KEY,
  npi VARCHAR(10) UNIQUE,
  practice_name VARCHAR(255),
  physician_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state CHAR(2),
  zip_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  monthly_fee_individual DECIMAL(10, 2),
  monthly_fee_family DECIMAL(10, 2),
  services_included TEXT[],
  specialties TEXT[],
  accepting_patients BOOLEAN,
  rating DECIMAL(3, 2),
  review_count INTEGER,
  verified BOOLEAN,
  last_updated TIMESTAMP
);

-- User Saved Comparisons
CREATE TABLE saved_comparisons (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  comparison_data JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Prescription Price Cache
CREATE TABLE prescription_prices (
  id UUID PRIMARY KEY,
  drug_name VARCHAR(255),
  dosage VARCHAR(50),
  quantity INTEGER,
  zip_code VARCHAR(10),
  pharmacy_name VARCHAR(100),
  price DECIMAL(10, 2),
  source VARCHAR(50), -- 'goodrx', 'costco', 'walmart'
  cached_at TIMESTAMP,
  expires_at TIMESTAMP
);

-- Lab Test Pricing
CREATE TABLE lab_test_pricing (
  id UUID PRIMARY KEY,
  test_name VARCHAR(255),
  cpt_code VARCHAR(10),
  lab_provider VARCHAR(100),
  cash_price DECIMAL(10, 2),
  insurance_estimate DECIMAL(10, 2),
  last_updated TIMESTAMP
);
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2) ✅ PARTIALLY COMPLETE

**Status**: Healthcare.gov integration done

**Remaining**:
- [ ] Set up production database (PostgreSQL)
- [ ] Create database migrations
- [ ] Build user authentication (NextAuth.js)
- [ ] Design UI mockups (Figma)

---

### Phase 2: DPC Provider Integration (Weeks 3-4) 🎯 CURRENT FOCUS

**Goal**: Real DPC provider data

**Tasks**:
1. [ ] Contact DPC Frontier for partnership/API access
2. [ ] Build web scraper for DPC Frontier mapper (fallback)
3. [ ] Create provider database schema
4. [ ] Implement provider search API
5. [ ] Build provider detail pages
6. [ ] Add provider submission form for self-listing
7. [ ] Implement geocoding for distance calculations
8. [ ] Add provider verification workflow

**Acceptance Criteria**:
- Users can search providers by ZIP + radius
- See real DPC practices with accurate fees
- Filter by specialty, services, ratings
- View provider details (address, phone, website)

---

### Phase 3: Prescription Pricing (Weeks 5-6)

**Goal**: Real-time prescription cost comparison

**Tasks**:
1. [ ] Apply for GoodRx API key
2. [ ] Implement GoodRx API integration
3. [ ] Create prescription search interface
4. [ ] Build price comparison display
5. [ ] Add coupon generation
6. [ ] Integrate generic alternatives
7. [ ] Add Costco/Walmart $4 list
8. [ ] Implement price caching (24hr TTL)

**Acceptance Criteria**:
- Users can search medications by name
- See prices from multiple sources
- Generate GoodRx coupons
- Compare insurance vs. cash pricing

---

### Phase 4: Lab & Imaging Pricing (Weeks 7-8)

**Tasks**:
1. [ ] Research lab cash pricing sources
2. [ ] Create lab test database (common 50 tests)
3. [ ] Implement price estimation algorithm
4. [ ] Add lab facility search
5. [ ] Build cost comparison for labs
6. [ ] Document DPC affiliate pricing advantages

**Acceptance Criteria**:
- Display common lab test pricing
- Show insurance vs. DPC vs. cash costs
- Link to local lab facilities

---

### Phase 5: Comprehensive Comparison UI (Weeks 9-10)

**Goal**: CompareTheMeerkat-style experience

**Tasks**:
1. [ ] Build multi-step comparison wizard
2. [ ] Create visual comparison cards
3. [ ] Add interactive cost breakdowns
4. [ ] Implement save/share functionality
5. [ ] Build responsive mobile interface
6. [ ] Add accessibility features (WCAG 2.1)
7. [ ] Implement analytics tracking

**Features**:
- Animated transitions between steps
- Real-time cost updates
- Downloadable PDF reports
- Email comparison results
- Social sharing

---

### Phase 6: User Accounts & Personalization (Weeks 11-12)

**Tasks**:
1. [ ] Implement user registration/login
2. [ ] Build user dashboard
3. [ ] Save comparison history
4. [ ] Store medication lists
5. [ ] Favorite providers
6. [ ] Set price alerts
7. [ ] Email notifications

---

### Phase 7: Polish & Launch (Weeks 13-14)

**Tasks**:
1. [ ] Comprehensive testing
2. [ ] Performance optimization
3. [ ] SEO optimization
4. [ ] Create marketing materials
5. [ ] Legal compliance review (HIPAA, etc.)
6. [ ] Privacy policy / Terms of service
7. [ ] Launch beta version
8. [ ] Gather user feedback

---

## Data Source Summary

| Data Source | Priority | Status | API Available | Cost |
|------------|----------|--------|---------------|------|
| Healthcare.gov | Critical | ✅ Complete | Yes | Free |
| DPC Frontier | Critical | ❌ TODO | No (scrape) | TBD |
| GoodRx | High | ❌ TODO | Yes | TBD |
| Lab Pricing | Medium | ❌ TODO | No | Free (estimates) |
| Costco Pharmacy | Medium | ❌ TODO | No (scrape) | Free |
| Walmart $4 List | Low | ❌ TODO | Static data | Free |

---

## Next Immediate Steps

### Priority 1: DPC Provider Data (THIS WEEK)
1. Email DPC Frontier requesting API access or data partnership
2. Build web scraper for mapper.dpcfrontier.com
3. Create provider database and import initial data
4. Build provider search API endpoint
5. Create provider detail page UI

### Priority 2: GoodRx Integration (NEXT WEEK)
1. Apply for GoodRx API key at goodrx.com/developer/apply
2. Review API documentation
3. Implement authentication
4. Build prescription search endpoint
5. Create prescription comparison UI

### Priority 3: Comparison UI Redesign (WEEK 3-4)
1. Design CompareTheMeerkat-style interface
2. Build multi-step wizard
3. Create side-by-side comparison cards
4. Add detailed cost breakdowns
5. Implement save/share features

---

## Success Metrics

**MVP Launch Goals**:
- 1,000+ DPC providers listed
- 50+ ZIP codes with accurate provider data
- Real-time prescription pricing for top 200 medications
- <2 second comparison load time
- Mobile-responsive design
- 90%+ uptime

**Post-Launch (3 months)**:
- 10,000 monthly active users
- 80% comparison completion rate
- 500+ user accounts
- $10M+ in potential healthcare savings calculated

---

## Budget Considerations

**API Costs (Annual Estimates)**:
- Healthcare.gov: $0 (free)
- GoodRx: $TBD (need quote)
- DPC Frontier: $TBD or $0 (scraping)
- Total API Costs: <$5,000/year estimated

**Infrastructure**:
- Hosting (Vercel/Railway): $20-50/month
- Database (Supabase/Railway): $25-50/month
- Total Infrastructure: $540-1,200/year

**Development**:
- Solo developer: 14 weeks @ ~40 hrs/week
- Or contract dev team: $15,000-30,000

---

## Compliance & Legal

**Required Considerations**:
- HIPAA compliance (if storing health info)
- Data privacy (GDPR/CCPA)
- Healthcare.gov API terms of use
- GoodRx API terms of service
- Medical disclaimer language
- Professional liability insurance

---

**Status**: Ready to begin Phase 2 (DPC Provider Integration)
**Last Updated**: October 30, 2025
**Next Review**: November 6, 2025
