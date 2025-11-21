# DPC Provider Data Collection Swarm Architecture

## Mission
Collect comprehensive, accurate DPC provider data from multiple sources using parallel agent swarms with cross-validation.

## Swarm Topology: Hierarchical + Mesh Hybrid

### **Queen Coordinator**
- Orchestrates all data collection agents
- Merges and deduplicates results
- Validates data quality
- Coordinates timing and rate limiting

### **Fast Track Agents (Parallel Execution)**
1. **Reverse Geocoding Agent**
   - Input: 2,759 lat/lng coordinates from database
   - Output: Addresses, city, state, ZIP codes
   - API: Google Maps Geocoding API
   - Speed: ~1000 requests/hour (rate limited)
   - Priority: HIGH (fastest method)

### **Slow Track Agents (Parallel Execution)**

2. **DPC Frontier Detail Scraper Swarm (10 agents)**
   - Input: 2,759 provider IDs from database
   - Output: Names, addresses, pricing, phone, services
   - Method: Scrape individual provider pages
   - Rate: ~100 providers/hour total (respectful scraping)
   - Split: 276 providers per agent
   - Priority: HIGH (most complete data)

3. **DPC Mapper Scraper Agent**
   - Input: Search by state (all 50 states)
   - Output: Names, addresses, contact info
   - Method: API/HTML scraping
   - Speed: ~500 providers/hour
   - Priority: MEDIUM

4. **DPC Alliance Scraper Agent**
   - Input: Member directory
   - Output: Names, addresses, membership status
   - Method: HTML scraping
   - Speed: Variable (depends on site structure)
   - Priority: MEDIUM

5. **Atlas MD Directory Scraper Agent**
   - Input: Provider directory
   - Output: Names, addresses, pricing
   - Method: HTML/API scraping
   - Speed: Variable
   - Priority: MEDIUM

### **Data Validation Agent**
- Cross-references data from multiple sources
- Identifies conflicts and discrepancies
- Assigns confidence scores
- Flags duplicates

### **Data Merge Agent**
- Combines data from all sources
- Prioritizes highest quality data
- Updates database with enriched provider info
- Generates quality report

## Data Flow

```
[Database: 2,759 coords]
    ↓
    ├─→ [Reverse Geocoding] ────────────→ [Fast Track Results]
    │                                           ↓
    └─→ [DPC Frontier x10] ──┐                 │
    └─→ [DPC Mapper]    ──┤                 │
    └─→ [DPC Alliance]   ──┼→ [Slow Track] ──→ [Validation]
    └─→ [Atlas MD]      ──┘      Results        ↓
                                              [Merge] → [Database Update]
```

## Quality Scoring System

Each provider gets a quality score (0-100) based on:
- **Coordinates verified**: +20 points
- **Real name found**: +15 points
- **Full address**: +15 points
- **Phone number**: +10 points
- **Pricing info**: +15 points
- **Website/email**: +10 points
- **Multiple sources agree**: +15 points

## Execution Plan

### Phase 1: Fast Track (30 minutes)
- Start reverse geocoding immediately
- Get addresses for all 2,759 providers
- Update database with city/state/ZIP

### Phase 2: Slow Track (2-3 hours)
- DPC Frontier detail scraper (10 parallel agents)
- DPC Mapper scraper
- DPC Alliance scraper
- Atlas MD scraper

### Phase 3: Validation & Merge (15 minutes)
- Cross-validate data from all sources
- Resolve conflicts (prefer most complete data)
- Calculate quality scores
- Update database

### Phase 4: Quality Report
- Generate summary statistics
- Identify gaps in coverage
- Report success rate by source

## Rate Limiting Strategy

- **Google Maps**: 1 request/second (3,600/hour)
- **DPC Frontier**: 1 request/2 seconds per agent (18,000/hour total with 10 agents)
- **Other sources**: Adapt based on response times
- **Respectful delays**: 1-2 seconds between requests

## Expected Outcomes

**After Fast Track:**
- 2,759 providers with addresses (from coordinates)
- ~95% accuracy on city/state/ZIP

**After Slow Track:**
- 2,000+ providers with real names
- 1,500+ providers with pricing info
- 2,500+ providers with phone numbers
- High-quality data from cross-validation

**Data Quality Tiers:**
- **Tier 1 (Score 80-100)**: Complete data, verified by multiple sources
- **Tier 2 (Score 60-79)**: Most data present, single source
- **Tier 3 (Score 40-59)**: Partial data, coordinates + address
- **Tier 4 (Score 0-39)**: Minimal data, coordinates only
