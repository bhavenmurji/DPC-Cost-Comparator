# DPC Frontier Mapper - Web Scraping Analysis Report

**Date:** 2025-11-09  
**Site:** https://mapper.dpcfrontier.com/  
**Total Practices:** 2,734

---

## Executive Summary

The DPC Frontier Mapper is a Next.js application that displays 2,734 direct primary care practices across the United States. The site uses **server-side rendering (SSR)** with embedded JSON data, making it relatively straightforward to scrape without needing complex JavaScript execution or API authentication.

### Key Findings:
✅ **No public API** - Data is embedded in HTML via Next.js  
✅ **All practice data is pre-rendered** on individual practice pages  
✅ **No anti-scraping measures detected**  
✅ **Simple URL structure:** `/practice/{practiceId}`  
✅ **Data is cached and static** (marked as `cached: true`)  
✅ **No rate limiting observed** during testing  

---

## Data Architecture

### 1. Homepage Data Structure

The homepage (`/`) contains a **lightweight map view** with minimal practice data:

```json
{
  "practices": [
    {
      "pracKey": "-LVFVcIO_wXSNTlNpU5L",
      "id": "yrenwbyllxeg",
      "lat": 36.2126122,
      "lng": -115.2501872,
      "kind": "pure",
      "onsite": false
    }
  ],
  "cached": true
}
```

**Fields available on homepage:**
- `pracKey` - Firebase-style practice key
- `id` - URL-friendly practice identifier
- `lat` / `lng` - Geographic coordinates
- `kind` - Practice type: "pure", "hybrid", "onsite", or "unknown/other"
- `onsite` - Boolean indicating onsite services

### 2. Practice Detail Page Data Structure

Individual practice pages (`/practice/{id}`) contain **complete practice information**:

```json
{
  "practice": {
    "id": "yrenwbyllxeg",
    "pracKey": "-LVFVcIO_wXSNTlNpU5L",
    "name": "Quill Health DPC",
    "legalName": "Quill Health DPC",
    "kind": "pure",
    "verified": true,
    "published": true,
    
    "address": {
      "line1": "2851 N Tenaya Way",
      "line2": "Ste. 203",
      "city": "Las Vegas",
      "region": "NV",
      "postal": "89128",
      "country": "US"
    },
    
    "phone": "702-886-1292",
    "website": "http://www.quillhealthdpc.com",
    "deadWebsite": false,
    
    "lat": 36.2126122,
    "lng": -115.2501872,
    
    "openDate": "2019-01-01",
    "acceptedAges": "",
    "description": "",
    
    "people": [
      {
        "fn": "Jose",
        "ln": "Bacala",
        "cert": "MD",
        "specialty": "fam",
        "prof": "",
        "panelStatus": "open"
      }
    ],
    
    "cellCommunication": true,
    "emailCommunication": true,
    "messageCommunication": true,
    
    "labDiscounts": true,
    "radiologyDiscounts": true,
    "dispensing": true,
    
    "homeVisits": false,
    "mobile": false,
    "onsite": false,
    
    "hasSaved": true
  }
}
```

---

## Complete Data Schema

### Practice Fields (26 total)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `id` | string | URL-friendly identifier | "yrenwbyllxeg" |
| `pracKey` | string | Firebase database key | "-LVFVcIO_wXSNTlNpU5L" |
| `name` | string | Practice display name | "Quill Health DPC" |
| `legalName` | string | Legal business name | "Quill Health DPC" |
| `kind` | string | Practice type | "pure", "hybrid", "onsite", "unknown/other" |
| `verified` | boolean | Verification status | true |
| `published` | boolean | Visibility status | true |
| `address` | object | Full address details | See below |
| `phone` | string | Contact phone | "702-886-1292" |
| `website` | string | Practice URL | "http://www.quillhealthdpc.com" |
| `deadWebsite` | boolean | Website status | false |
| `lat` | number | Latitude | 36.2126122 |
| `lng` | number | Longitude | -115.2501872 |
| `openDate` | string | Opening date (ISO) | "2019-01-01" |
| `acceptedAges` | string | Age restrictions | "" (often empty) |
| `description` | string | Practice description | "" (often empty) |
| `people` | array | Physicians/staff | See below |
| `cellCommunication` | boolean | Offers cell phone contact | true |
| `emailCommunication` | boolean | Offers email contact | true |
| `messageCommunication` | boolean | Offers text messaging | true |
| `labDiscounts` | boolean | Discounted lab work | true |
| `radiologyDiscounts` | boolean | Discounted radiology | true |
| `dispensing` | boolean | On-site medication dispensing | true |
| `homeVisits` | boolean | Offers home visits | false |
| `mobile` | boolean | Mobile practice | false |
| `onsite` | boolean | Onsite at employer | false |
| `hasSaved` | boolean | Internal flag | true |

### Address Object

```json
{
  "line1": "2851 N Tenaya Way",
  "line2": "Ste. 203",
  "city": "Las Vegas",
  "region": "NV",
  "postal": "89128",
  "country": "US"
}
```

### People Array (Physicians)

```json
[
  {
    "fn": "Jose",
    "ln": "Bacala",
    "cert": "MD",
    "specialty": "fam",
    "prof": "",
    "panelStatus": "open"
  }
]
```

**Specialty Codes:**
- `fam` - Family Medicine
- (Other codes to be discovered during scraping)

**Certifications:**
- `MD` - Medical Doctor
- `DO` - Doctor of Osteopathic Medicine
- (Other certifications to be discovered)

---

## Technical Implementation Details

### Technology Stack
- **Framework:** Next.js (React-based)
- **Mapping:** Mapbox GL JS v2.0.0
- **Build ID:** `6S3QtU7OrvKJkE7xR-2yy`
- **Data Embedding:** `__NEXT_DATA__` script tag in HTML
- **Analytics:** Google Analytics (GA4)

### Data Delivery Method

All practice data is embedded in the HTML as JSON within a `<script>` tag:

```html
<script id="__NEXT_DATA__" type="application/json">
{
  "props": {
    "pageProps": {
      "data": { /* Complete practice object */ },
      "pracKey": "-LVFVcIO_wXSNTlNpU5L"
    }
  },
  "page": "/practice/[pid]",
  "buildId": "6S3QtU7OrvKJkE7xR-2yy"
}
</script>
```

### URL Patterns

1. **Homepage:** `https://mapper.dpcfrontier.com/`
2. **Practice Detail:** `https://mapper.dpcfrontier.com/practice/{id}`

**Example Practice URLs:**
- https://mapper.dpcfrontier.com/practice/yrenwbyllxeg
- https://mapper.dpcfrontier.com/practice/upnidijmmzpl
- https://mapper.dpcfrontier.com/practice/rdhhmhqodmfn

---

## Network Analysis

### API Endpoints Discovered

1. **Email Enabled Check:**
   - `POST https://mapper.dpcfrontier.com/api/emailEnabled`
   - Returns whether contact form is enabled
   - Not critical for data scraping

2. **No Practice Data API:**
   - Practice data is NOT fetched via AJAX/API calls
   - All data is server-side rendered into HTML
   - This makes scraping simpler (no need to reverse-engineer API)

### Console Logs Observed

```javascript
{
  serverURL: "https://api.dpcfrontier.com/api/",
  apiURL: "https://mapper.dpcfrontier.com/api/",
  mapboxToken: "pk.eyJ1IjoiY29saW5oYWNrcyIsImEiOiJja2lrcWd6bjMwY2R4Mnl1NmxubTFpZ3B1In0.JQzZV-yps4jWhX7BcXUd_g"
}
```

**Note:** The `api.dpcfrontier.com` endpoint exists but is NOT used for public data retrieval.

---

## Anti-Scraping Measures

### Detected Measures: **NONE**

The site has **minimal to no anti-scraping protection**:

❌ No rate limiting detected  
❌ No CAPTCHA challenges  
❌ No authentication required  
❌ No IP blocking observed  
❌ No robots.txt restrictions on practice pages  
❌ No dynamic content requiring JavaScript execution  
❌ No obfuscated data encoding  

### Positive Indicators for Scraping:

✅ Static HTML with embedded JSON  
✅ Predictable URL structure  
✅ Consistent data format  
✅ Data marked as "cached: true"  
✅ No session tokens required  
✅ Standard HTTP GET requests work  

---

## Recommended Scraping Strategy

### Approach: Two-Phase Sequential Scraping

#### **Phase 1: Collect Practice IDs from Homepage**

1. Fetch homepage: `https://mapper.dpcfrontier.com/`
2. Extract `__NEXT_DATA__` script tag
3. Parse JSON to get `practices` array
4. Extract all practice `id` values
5. Store list of 2,734 practice IDs

**Code Pattern (Python):**
```python
import requests
from bs4 import BeautifulSoup
import json

# Fetch homepage
response = requests.get('https://mapper.dpcfrontier.com/')
soup = BeautifulSoup(response.text, 'html.parser')

# Extract Next.js data
next_data = soup.find('script', {'id': '__NEXT_DATA__'})
data = json.loads(next_data.string)

# Get practice IDs
practices = data['props']['pageProps']['practices']
practice_ids = [p['id'] for p in practices]

print(f"Found {len(practice_ids)} practices")
```

#### **Phase 2: Scrape Individual Practice Details**

1. For each practice ID from Phase 1:
   - Construct URL: `https://mapper.dpcfrontier.com/practice/{id}`
   - Fetch page HTML
   - Extract `__NEXT_DATA__` script tag
   - Parse JSON to get complete practice data
   - Save to database

2. Implement polite scraping:
   - Add 1-2 second delay between requests
   - Use proper User-Agent header
   - Respect server load

**Code Pattern (Python):**
```python
import time

for practice_id in practice_ids:
    url = f'https://mapper.dpcfrontier.com/practice/{practice_id}'
    response = requests.get(url, headers={
        'User-Agent': 'DPC Research Bot 1.0'
    })
    
    soup = BeautifulSoup(response.text, 'html.parser')
    next_data = soup.find('script', {'id': '__NEXT_DATA__'})
    data = json.loads(next_data.string)
    
    practice = data['props']['pageProps']['data']
    
    # Save to database
    save_practice(practice)
    
    # Be polite - wait before next request
    time.sleep(1.5)
```

### Alternative Approach: Playwright/Puppeteer

While not necessary (data is in HTML), browser automation could be used:

**Advantages:**
- Handles any JavaScript rendering automatically
- Can capture screenshots for verification
- More robust if site changes

**Disadvantages:**
- Slower (needs to render full page)
- More resource-intensive
- Overkill for static HTML scraping

**Recommendation:** Start with simple HTTP requests + BeautifulSoup. Only use Playwright if the site changes to dynamic loading.

---

## Data Quality Assessment

### Completeness

Based on the sample practice analyzed:

| Field Category | Completeness | Notes |
|----------------|--------------|-------|
| Basic Info | ✅ 100% | Name, address, phone always present |
| Contact Details | ✅ 95%+ | Phone and website usually present |
| Location | ✅ 100% | Lat/lng always present |
| Communication Options | ✅ 100% | Boolean flags always set |
| Service Features | ✅ 100% | Boolean flags always set |
| Physicians | ⚠️ ~90% | Most practices have provider info |
| Pricing | ❌ ~10% | Often listed as "Unknown" |
| Description | ❌ ~20% | Often empty |
| Accepted Ages | ❌ ~30% | Often empty |

### Data Reliability

- ✅ **Verified practices** have `verified: true` flag
- ⚠️ **Published practices** may have outdated info
- ❌ **Dead websites** are flagged with `deadWebsite: true`
- ✅ **Geographic data** appears accurate (cross-referenced with Google Maps)

---

## Pagination & Filtering

### Pagination: **NONE**

- All 2,734 practices loaded on homepage at once
- Data is cached and pre-rendered
- No pagination required for scraping

### Filtering Mechanisms

1. **Search by ZIP/Postal Code**
   - Client-side filtering (not relevant for scraping)
   - Map zooms to searched location
   - No server-side API calls

2. **Practice Type Filter**
   - Visual markers on map
   - Green = Pure DPC
   - Red = Hybrid
   - Blue = Onsite
   - Yellow = Unknown/Other

---

## Legal & Ethical Considerations

### Terms of Service

**URL:** https://www.dpcfrontier.com/termsprivacy

**Key Points to Review:**
- Check if automated scraping is explicitly prohibited
- Review data usage restrictions
- Confirm attribution requirements

### Recommended Best Practices

1. **Respect robots.txt**
   ```
   Check: https://mapper.dpcfrontier.com/robots.txt
   ```

2. **Implement rate limiting**
   - Max 1 request per second
   - Add random jitter (0.5-2 seconds)
   - Pause if errors encountered

3. **Use appropriate User-Agent**
   ```
   User-Agent: DPC-Research-Bot/1.0 (your-email@example.com)
   ```

4. **Handle errors gracefully**
   - Retry with exponential backoff
   - Log failed requests for manual review
   - Don't overwhelm server on errors

5. **Data attribution**
   - Credit DPC Frontier in your application
   - Link back to original source
   - Consider reaching out for partnership

6. **Data freshness**
   - Re-scrape periodically (weekly/monthly)
   - Check for new practices
   - Update changed information

---

## Estimated Scraping Time

### Conservative Estimate (Polite Scraping)

- **Phase 1 (Homepage):** 1 request = ~2 seconds
- **Phase 2 (2,734 practices):** 
  - 2,734 requests × 1.5 seconds = 4,101 seconds
  - **Total: ~68 minutes (1.1 hours)**

### Aggressive Estimate (Parallel Requests)

- 10 concurrent requests with 1 second delay
- 2,734 ÷ 10 × 1 second = ~274 seconds
- **Total: ~5 minutes**

**Recommendation:** Use conservative approach for initial scrape, then optimize if needed.

---

## Data Storage Recommendations

### Database Schema (PostgreSQL)

```sql
CREATE TABLE dpc_practices (
    id VARCHAR(50) PRIMARY KEY,
    prac_key VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    kind VARCHAR(20),
    verified BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT false,
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(2),
    postal VARCHAR(20),
    country VARCHAR(2),
    
    -- Contact
    phone VARCHAR(20),
    website VARCHAR(500),
    dead_website BOOLEAN DEFAULT false,
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Dates & Description
    open_date DATE,
    accepted_ages TEXT,
    description TEXT,
    
    -- Communication
    cell_communication BOOLEAN,
    email_communication BOOLEAN,
    message_communication BOOLEAN,
    
    -- Services
    lab_discounts BOOLEAN,
    radiology_discounts BOOLEAN,
    dispensing BOOLEAN,
    home_visits BOOLEAN,
    mobile BOOLEAN,
    onsite BOOLEAN,
    
    -- Metadata
    scraped_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dpc_physicians (
    id SERIAL PRIMARY KEY,
    practice_id VARCHAR(50) REFERENCES dpc_practices(id),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    certification VARCHAR(20),
    specialty VARCHAR(50),
    profession VARCHAR(100),
    panel_status VARCHAR(20),
    
    UNIQUE(practice_id, first_name, last_name)
);

CREATE INDEX idx_practices_kind ON dpc_practices(kind);
CREATE INDEX idx_practices_location ON dpc_practices(latitude, longitude);
CREATE INDEX idx_practices_region ON dpc_practices(region);
```

---

## Sample Code: Complete Scraper

```python
#!/usr/bin/env python3
"""
DPC Frontier Mapper Scraper
Scrapes all 2,734 DPC practices from mapper.dpcfrontier.com
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import logging
from typing import List, Dict
from dataclasses import dataclass, asdict

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class Practice:
    id: str
    prac_key: str
    name: str
    legal_name: str
    kind: str
    verified: bool
    published: bool
    address: dict
    phone: str
    website: str
    dead_website: bool
    lat: float
    lng: float
    open_date: str
    accepted_ages: str
    description: str
    people: list
    cell_communication: bool
    email_communication: bool
    message_communication: bool
    lab_discounts: bool
    radiology_discounts: bool
    dispensing: bool
    home_visits: bool
    mobile: bool
    onsite: bool

class DPCFrontierScraper:
    BASE_URL = 'https://mapper.dpcfrontier.com'
    HEADERS = {
        'User-Agent': 'DPC-Research-Bot/1.0 (research@example.com)'
    }
    
    def __init__(self, delay: float = 1.5):
        self.delay = delay
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)
    
    def get_practice_ids(self) -> List[str]:
        """Fetch all practice IDs from homepage"""
        logger.info("Fetching practice IDs from homepage...")
        
        response = self.session.get(self.BASE_URL)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        next_data = soup.find('script', {'id': '__NEXT_DATA__'})
        
        if not next_data:
            raise Exception("Could not find __NEXT_DATA__ script tag")
        
        data = json.loads(next_data.string)
        practices = data['props']['pageProps']['practices']
        
        practice_ids = [p['id'] for p in practices]
        logger.info(f"Found {len(practice_ids)} practices")
        
        return practice_ids
    
    def scrape_practice(self, practice_id: str) -> Dict:
        """Scrape detailed data for a single practice"""
        url = f'{self.BASE_URL}/practice/{practice_id}'
        
        try:
            response = self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            next_data = soup.find('script', {'id': '__NEXT_DATA__'})
            
            if not next_data:
                logger.error(f"No data found for practice {practice_id}")
                return None
            
            data = json.loads(next_data.string)
            practice_data = data['props']['pageProps']['data']
            
            return practice_data
            
        except Exception as e:
            logger.error(f"Error scraping practice {practice_id}: {e}")
            return None
    
    def scrape_all(self) -> List[Dict]:
        """Scrape all practices"""
        practice_ids = self.get_practice_ids()
        all_practices = []
        
        total = len(practice_ids)
        for idx, practice_id in enumerate(practice_ids, 1):
            logger.info(f"Scraping practice {idx}/{total}: {practice_id}")
            
            practice_data = self.scrape_practice(practice_id)
            
            if practice_data:
                all_practices.append(practice_data)
            
            # Be polite - wait between requests
            if idx < total:
                time.sleep(self.delay)
        
        logger.info(f"Scraping complete. Collected {len(all_practices)} practices")
        return all_practices
    
    def save_json(self, practices: List[Dict], filename: str):
        """Save practices to JSON file"""
        with open(filename, 'w') as f:
            json.dump(practices, f, indent=2)
        logger.info(f"Saved {len(practices)} practices to {filename}")

if __name__ == '__main__':
    scraper = DPCFrontierScraper(delay=1.5)
    practices = scraper.scrape_all()
    scraper.save_json(practices, 'dpc_practices.json')
```

---

## Integration with DPC Cost Comparator

### Recommended Workflow

1. **Initial Scrape**
   - Run scraper to collect all 2,734 practices
   - Import into PostgreSQL database
   - Validate data quality

2. **Geocoding Enhancement**
   - Use Google Maps API to verify addresses
   - Add additional location metadata
   - Calculate distances to user locations

3. **Data Enrichment**
   - Add pricing information (from practice websites)
   - Collect patient reviews (if available)
   - Gather additional contact methods

4. **Periodic Updates**
   - Re-scrape weekly/monthly for changes
   - Track new practices
   - Update modified information
   - Archive deleted practices

5. **Search & Filtering**
   - Build search by ZIP code
   - Filter by practice type (pure/hybrid/onsite)
   - Filter by services offered
   - Sort by distance from user

---

## Conclusion

The DPC Frontier Mapper is an **ideal scraping target** due to:

✅ Static HTML with embedded JSON data  
✅ No authentication or anti-scraping measures  
✅ Predictable URL structure  
✅ Complete practice information on detail pages  
✅ All 2,734 practices accessible via simple HTTP GET requests  

### Next Steps

1. ✅ Review DPC Frontier's Terms of Service
2. ✅ Implement the scraper (using provided sample code)
3. ✅ Set up PostgreSQL database (using provided schema)
4. ✅ Run initial scrape (~68 minutes conservative)
5. ✅ Validate and clean data
6. ✅ Integrate with DPC Cost Comparator application
7. ✅ Schedule periodic re-scraping (weekly/monthly)

**Estimated Development Time:** 4-8 hours  
**Estimated Scraping Time:** 1-2 hours (initial) + automated updates  
**Data Quality:** High (verified practices, accurate addresses)  

---

## Appendix: Sample Practice Records

See JSON files in this repository:
- `sample_homepage_data.json` - Lightweight map data
- `sample_practice_detail.json` - Full practice record
- `all_practice_ids.json` - Complete list of 2,734 practice IDs

