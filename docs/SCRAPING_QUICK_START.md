# DPC Frontier Scraper - Quick Start Guide

## TL;DR - Key Findings

🎯 **Website:** https://mapper.dpcfrontier.com/  
📊 **Total Practices:** 2,734  
🔓 **API Available:** No (uses server-side rendered HTML)  
🛡️ **Anti-Scraping:** None detected  
⏱️ **Scraping Time:** ~68 minutes (conservative)  
✅ **Difficulty:** Easy (embedded JSON in HTML)  

---

## How Data is Structured

### Two-Tier Architecture

**1. Homepage (Lightweight Map Data)**
```
GET https://mapper.dpcfrontier.com/
└── __NEXT_DATA__ script contains:
    └── 2,734 practice IDs + coordinates + practice type
```

**2. Practice Pages (Complete Details)**
```
GET https://mapper.dpcfrontier.com/practice/{id}
└── __NEXT_DATA__ script contains:
    └── Full practice info (26 fields + physician array)
```

---

## Data Extraction Method

All data is in a `<script id="__NEXT_DATA__">` tag as JSON:

```html
<script id="__NEXT_DATA__" type="application/json">
{
  "props": {
    "pageProps": {
      "data": { /* COMPLETE PRACTICE DATA HERE */ }
    }
  }
}
</script>
```

**No JavaScript execution needed!** Just parse HTML → extract JSON → done.

---

## Complete Data Fields (26 Total)

### Core Information
- `id` - URL identifier (e.g., "yrenwbyllxeg")
- `pracKey` - Firebase key (e.g., "-LVFVcIO_wXSNTlNpU5L")
- `name` - Practice name
- `legalName` - Legal business name
- `kind` - Type: "pure", "hybrid", "onsite", "unknown/other"
- `verified` - Verification status (boolean)
- `published` - Visibility status (boolean)

### Location & Contact
- `address` - Object with: line1, line2, city, region, postal, country
- `lat` / `lng` - Geographic coordinates
- `phone` - Contact number
- `website` - Practice URL
- `deadWebsite` - Website status (boolean)

### Practice Details
- `openDate` - Opening date (ISO format: "2019-01-01")
- `acceptedAges` - Age restrictions (often empty)
- `description` - Practice description (often empty)
- `people` - Array of physicians with: fn, ln, cert, specialty, panelStatus

### Communication Methods
- `cellCommunication` - Cell phone contact (boolean)
- `emailCommunication` - Email contact (boolean)
- `messageCommunication` - Text messaging (boolean)

### Services Offered
- `labDiscounts` - Discounted lab work (boolean)
- `radiologyDiscounts` - Discounted radiology (boolean)
- `dispensing` - On-site medication (boolean)
- `homeVisits` - Home visits available (boolean)
- `mobile` - Mobile practice (boolean)
- `onsite` - Onsite at employer (boolean)

---

## Scraping Strategy

### Step 1: Get All Practice IDs (1 request)

```python
import requests
from bs4 import BeautifulSoup
import json

response = requests.get('https://mapper.dpcfrontier.com/')
soup = BeautifulSoup(response.text, 'html.parser')
data = json.loads(soup.find('script', {'id': '__NEXT_DATA__'}).string)

practice_ids = [p['id'] for p in data['props']['pageProps']['practices']]
# Returns: ['yrenwbyllxeg', 'upnidijmmzpl', ...]  (2,734 IDs)
```

### Step 2: Scrape Each Practice (2,734 requests)

```python
import time

for practice_id in practice_ids:
    url = f'https://mapper.dpcfrontier.com/practice/{practice_id}'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    data = json.loads(soup.find('script', {'id': '__NEXT_DATA__'}).string)
    
    practice = data['props']['pageProps']['data']
    # practice now contains all 26 fields + physician array
    
    save_to_database(practice)
    time.sleep(1.5)  # Be polite
```

---

## Anti-Scraping Measures Detected

**NONE!**

✅ No rate limiting  
✅ No CAPTCHA  
✅ No authentication  
✅ No IP blocking  
✅ No dynamic content loading  
✅ No obfuscated data  

---

## Best Scraping Approach

### Option 1: Simple HTTP + BeautifulSoup (Recommended)
**Pros:** Fast, lightweight, simple  
**Cons:** None  
**Use when:** Always (this is the best approach)

### Option 2: Playwright/Puppeteer
**Pros:** Handles JS automatically  
**Cons:** Slower, resource-heavy, unnecessary  
**Use when:** Only if site changes to dynamic loading

### ✅ Recommendation: Use Option 1

---

## Estimated Timeline

| Task | Time |
|------|------|
| Homepage scrape (IDs) | 2 seconds |
| Practice details (2,734 @ 1.5s each) | 68 minutes |
| **Total (conservative)** | **~70 minutes** |

With parallel requests (10 concurrent): **~5 minutes**

---

## Sample Practice Record

```json
{
  "id": "yrenwbyllxeg",
  "name": "Quill Health DPC",
  "address": {
    "line1": "2851 N Tenaya Way",
    "line2": "Ste. 203",
    "city": "Las Vegas",
    "region": "NV",
    "postal": "89128"
  },
  "phone": "702-886-1292",
  "website": "http://www.quillhealthdpc.com",
  "lat": 36.2126122,
  "lng": -115.2501872,
  "kind": "pure",
  "people": [{
    "fn": "Jose",
    "ln": "Bacala",
    "cert": "MD",
    "specialty": "fam"
  }],
  "cellCommunication": true,
  "emailCommunication": true,
  "labDiscounts": true,
  "verified": true
}
```

---

## Database Schema (PostgreSQL)

```sql
CREATE TABLE dpc_practices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address_line1 VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(2),
    postal VARCHAR(20),
    phone VARCHAR(20),
    website VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    kind VARCHAR(20),
    verified BOOLEAN,
    cell_communication BOOLEAN,
    email_communication BOOLEAN,
    lab_discounts BOOLEAN,
    -- Add other fields as needed
    scraped_at TIMESTAMP DEFAULT NOW()
);
```

---

## Recommended Updates

To keep data fresh:

- **Initial scrape:** All 2,734 practices
- **Weekly updates:** Re-scrape changed practices
- **Monthly full refresh:** Complete re-scrape

Track changes by comparing:
- Practice count (new additions)
- `openDate` field (newly opened)
- `verified` status (verification changes)

---

## Legal Considerations

1. ✅ Check `robots.txt`: https://mapper.dpcfrontier.com/robots.txt
2. ✅ Review Terms of Service: https://www.dpcfrontier.com/termsprivacy
3. ✅ Use polite scraping (1-2 second delays)
4. ✅ Identify bot with User-Agent
5. ✅ Credit DPC Frontier in your app

---

## Next Steps

1. **Read full analysis:** See `DPC_FRONTIER_SCRAPING_ANALYSIS.md`
2. **Review sample data:** See `sample_*.json` files
3. **Implement scraper:** Use Python code provided
4. **Set up database:** Use schema provided
5. **Run initial scrape:** ~70 minutes
6. **Integrate with app:** Add to DPC Cost Comparator

---

## Files in This Analysis

- `DPC_FRONTIER_SCRAPING_ANALYSIS.md` - Complete 5000+ word analysis
- `SCRAPING_QUICK_START.md` - This file (quick reference)
- `sample_homepage_data.json` - Homepage structure example
- `sample_practice_detail.json` - Full practice record example
- `dpc-mapper-homepage.png` - Screenshot of map interface
- `dpc-mapper-practice-detail.png` - Screenshot of practice page

---

## Questions?

All technical details, code samples, and recommendations are in the full analysis document.

**Bottom line:** This is an easy scraping target with high-quality data ready to integrate into your DPC Cost Comparator application.
