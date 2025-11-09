# DPC Frontier Scraper Guide

## Overview

This scraper fetches real Direct Primary Care provider data from [DPC Frontier mapper](https://mapper.dpcfrontier.com/) and populates your database with **2,734 real DPC practices** across all 50 US states.

## Features

✅ **Real Provider Data** - 2,734 actual DPC practices
✅ **Complete Information** - Name, address, phone, website, fees, services
✅ **Geocoding Built-in** - Latitude/longitude for distance calculations
✅ **Data Quality Tracking** - Each provider gets a quality score (0-100)
✅ **Source Tracking** - Track when data was scraped and from where
✅ **Respectful Scraping** - 1.5s delay between requests
✅ **Resume Support** - Can interrupt and resume from any point
✅ **TypeScript** - Fully typed with error handling

## Quick Start

### 1. Install Dependencies

```bash
cd apps/api
npm install
```

This will install:
- `axios` - HTTP client for fetching pages
- `cheerio` - HTML parsing (like jQuery for Node.js)

### 2. Ensure Database is Running

```bash
# From project root
docker-compose up -d

# Verify it's running
docker ps | grep dpc-comparator-db
```

### 3. Run Database Migrations

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### 4. Test Scraper (First 10 Providers)

```bash
# From apps/api directory
npm run scrape:dpc:test
```

This will scrape the first 10 providers (~15 seconds) to verify everything works.

### 5. Scrape All Providers

```bash
# From apps/api directory
npm run scrape:dpc
```

⏱️ **Estimated Time:** ~68 minutes for all 2,734 providers

## Usage Examples

### Scrape First 10 (Testing)
```bash
npm run scrape:dpc:test
```

### Scrape First 100
```bash
npm run scrape:dpc -- --limit 100
```

### Scrape 50 Providers Starting from Index 200
```bash
npm run scrape:dpc -- --limit 50 --start 200
```

### Resume from Index 1000
```bash
npm run scrape:dpc -- --start 1000
```

### Scrape All (~68 minutes)
```bash
npm run scrape:dpc
```

## CLI Options

| Option | Alias | Description | Example |
|--------|-------|-------------|---------|
| `--limit` | `-l` | Number of providers to scrape | `--limit 100` |
| `--start` | `-s` | Start from this index | `--start 500` |
| `--help` | `-h` | Show help message | `--help` |

## Data Collected

For each provider, we collect:

### Basic Information
- Practice name
- Legal name (if different)
- Verification status
- Practice type (Pure DPC, Hybrid, Onsite)

### Location
- Street address
- City, State, ZIP
- Latitude/Longitude (for distance calculations)

### Contact
- Phone number
- Website URL
- Email (if available)

### Physicians
- Physician names
- Board certifications
- Specialties

### Services
- Lab discounts available
- Radiology discounts
- Medication dispensing
- Home visits

### Pricing
- Monthly membership fee
- Annual membership fee
- Enrollment fee

### Tracking
- Data source (DPC Frontier)
- Last scraped date
- Data quality score (0-100)

## Database Tables

The scraper populates two tables:

### 1. `dpc_providers`
Main provider information (name, address, fees, services, etc.)

### 2. `dpc_provider_sources`
Tracks where data came from and when:
- Source name (`dpc_frontier`)
- Source URL
- Last scraped timestamp
- Data quality score
- Verification status

## Data Quality Scoring

Each provider gets a quality score (0-100) based on:

| Data Point | Score |
|------------|-------|
| Practice name | 10 |
| Street address | 10 |
| City | 5 |
| State | 5 |
| ZIP code | 10 |
| Phone number | 15 |
| Website | 15 |
| Lat/Lng coordinates | 20 |
| Physician info | 5 |
| Pricing info | 5 |
| **Total** | **100** |

Providers with scores below 60 may need manual review.

## How It Works

### Step 1: Fetch Practice IDs
```
GET https://mapper.dpcfrontier.com/
→ Extract __NEXT_DATA__ script tag
→ Parse JSON to get all 2,734 practice IDs
```

### Step 2: Fetch Each Practice
```
For each practice ID:
  GET https://mapper.dpcfrontier.com/practice/{id}
  → Extract __NEXT_DATA__ script tag
  → Parse practice details
  → Transform to our schema
  → Save to database
  → Wait 1.5 seconds (respectful scraping)
```

### Step 3: Save to Database
```
→ Upsert to dpc_providers table
→ Upsert to dpc_provider_sources table
→ Calculate data quality score
→ Track scraping timestamp
```

## Scraper Architecture

```
┌─────────────────────────────────────────┐
│  scripts/scrape-dpc-providers.ts        │
│  (CLI interface)                        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  services/dpcFrontierScraper.service.ts │
│  (Core scraping logic)                  │
│                                         │
│  • fetchAllPracticeIds()                │
│  • fetchPracticeDetails(id)             │
│  • transformPracticeData()              │
│  • savePracticeToDatabase()             │
│  • calculateDataQualityScore()          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Prisma ORM → PostgreSQL Database       │
│                                         │
│  • dpc_providers                        │
│  • dpc_provider_sources                 │
└─────────────────────────────────────────┘
```

## Troubleshooting

### "Cannot find module 'cheerio'"
```bash
cd apps/api
npm install cheerio
```

### "Database connection failed"
```bash
# Start PostgreSQL
docker-compose up -d

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
# Should be: postgresql://postgres:postgres@localhost:5432/dpc_comparator
```

### "Table dpc_provider_sources does not exist"
```bash
# Run migrations
cd apps/api
npx prisma migrate dev
npx prisma generate
```

### Scraper is too slow
The scraper uses a 1.5 second delay between requests to be respectful to the DPC Frontier server. This is intentional and recommended.

To scrape faster (not recommended):
1. Edit `apps/api/src/services/dpcFrontierScraper.service.ts`
2. Change `requestDelay = 1500` to a lower value
3. Be aware this may trigger rate limiting or be considered abusive

### Want to verify data?
```bash
# Open Prisma Studio
npx prisma studio

# Browse to http://localhost:5555
# View dpc_providers and dpc_provider_sources tables
```

## Monitoring Progress

The scraper provides real-time progress updates:

```
🚀 Starting DPC Frontier scraping process...
Found 2734 total practices
Scraping 100 practices (starting from index 0)

[1/100] Fetching practice abc123...
✅ Saved practice: Downtown Health DPC (abc123)

[2/100] Fetching practice def456...
✅ Saved practice: Wellness Medical Group (def456)

...

✅ Scraping complete!
   Successfully scraped: 98
   Errors: 2
   Total: 100
```

## Legal & Ethical Considerations

### ✅ Ethical Scraping Practices
- 1.5 second delay between requests (respectful)
- User-Agent identifies our project
- Data used for healthcare cost comparison (public good)
- No circumventing of security measures
- No excessive load on servers

### ⚠️ Review DPC Frontier Terms
Before scraping, review: https://mapper.dpcfrontier.com/terms

If DPC Frontier contacts you:
1. Explain the public health benefit
2. Offer to use official API if available
3. Be willing to adjust scraping practices
4. Consider partnership (see [DPC_FRONTIER_PARTNERSHIP_EMAIL.md](DPC_FRONTIER_PARTNERSHIP_EMAIL.md))

### Data Usage
- Data is publicly available on DPC Frontier
- Used to help patients find affordable care
- Not sold or redistributed
- Updated periodically to stay current

## Maintenance

### How Often to Scrape?
- **Initial:** Once to populate database
- **Updates:** Monthly or quarterly
- **Incremental:** Only scrape changed providers (future enhancement)

### Updating Provider Data
```bash
# Re-scrape all providers (overwrites existing)
npm run scrape:dpc

# Or scrape specific ranges if you know what changed
npm run scrape:dpc -- --start 1000 --limit 500
```

## Next Steps

After scraping:

1. **Verify Data**
   ```bash
   npx prisma studio
   # Check dpc_providers table
   ```

2. **Test Provider Search**
   ```bash
   curl http://localhost:4000/api/providers?zipCode=10001&radius=25
   ```

3. **Test Cost Comparison**
   ```bash
   curl -X POST http://localhost:4000/api/comparison/calculate \
     -H "Content-Type: application/json" \
     -d '{"age": 35, "zipCode": "10001", "state": "NY", ...}'
   ```

4. **Build Frontend**
   - Display real providers on map
   - Show provider details
   - Calculate distances from user
   - Compare DPC costs vs traditional insurance

5. **Add GoodRx API** (Option C)
   - Apply at https://goodrx.com/developer/apply
   - Integrate prescription pricing
   - Complete cost comparison

## Performance

| Providers | Estimated Time | Use Case |
|-----------|---------------|----------|
| 10 | ~15 seconds | Testing |
| 100 | ~2.5 minutes | Development |
| 500 | ~12.5 minutes | Regional data |
| 2,734 | ~68 minutes | Full database |

**Rate:** ~40 providers/minute with 1.5s delay

## Files Reference

- **Scraper Service:** `apps/api/src/services/dpcFrontierScraper.service.ts`
- **CLI Tool:** `scripts/scrape-dpc-providers.ts`
- **Database Schema:** `apps/api/prisma/schema.prisma`
- **Documentation:** `docs/DPC_FRONTIER_SCRAPING_ANALYSIS.md`

## Support

Issues? Check:
1. Database is running (`docker ps`)
2. Migrations are applied (`npx prisma migrate dev`)
3. Dependencies installed (`npm install`)
4. Internet connection works (`curl https://mapper.dpcfrontier.com`)

Still stuck? Open an issue with:
- Error message
- Command you ran
- Environment (OS, Node version)
- Database status
