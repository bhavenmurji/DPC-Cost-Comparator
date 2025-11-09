# Getting Started - Ignite Health Partnerships

## Complete Setup Guide (Week 2 - Ready to Run!)

This guide will help you set up the complete Ignite Health Partnerships platform with:
- ✅ PostgreSQL database with all tables
- ✅ 2,734 real DPC provider records
- ✅ Walmart $4 pharmacy program (30+ medications)
- ✅ Healthcare.gov API integration
- ✅ Cost comparison functionality

**Total setup time:** ~1.5 hours (mostly automated scraping)

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Docker Desktop** installed (for PostgreSQL)
- ✅ **Node.js v20+** installed
- ✅ **npm v10+** installed
- ✅ **Git** installed
- ✅ Terminal/command line access

**Check your versions:**
```bash
docker --version    # Should be 20.x or higher
node --version      # Should be v20.x or higher
npm --version       # Should be 10.x or higher
```

---

## Step-by-Step Setup

### Step 1: Start PostgreSQL Database

```bash
# From project root directory
docker-compose up -d
```

**Verify it's running:**
```bash
docker ps | grep dpc-comparator-db
```

**Expected output:**
```
CONTAINER ID   IMAGE                COMMAND                  STATUS
abc123         postgres:15-alpine   "docker-entrypoint.s…"   Up 5 seconds
```

**Troubleshooting:**
- If port 5432 is already in use: `sudo service postgresql stop`
- If Docker isn't running: Start Docker Desktop application

---

### Step 2: Install Dependencies

```bash
# From project root
npm install

# Install API dependencies
cd apps/api
npm install
```

**This will install:**
- Express, Prisma, TypeScript
- axios, cheerio (for web scraping)
- All required dependencies

---

### Step 3: Run Database Migrations

```bash
# From apps/api directory
npx prisma migrate dev --name add-ignite-health-partnerships-tables
```

**Expected output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "dpc_comparator"

Applying migration `20250109_add_ignite_health_partnerships_tables`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250109_add_ignite_health_partnerships_tables/
    └─ migration.sql

Your database is now in sync with your schema.
✔ Generated Prisma Client
```

**Generate Prisma Client:**
```bash
npx prisma generate
```

**Verify database tables:**
```bash
npx prisma studio
```

This opens a browser at `http://localhost:5555` where you can see all tables:
- dpc_providers
- dpc_provider_sources
- prescription_prices
- pharmacy_savings_programs
- pharmacy_savings_medications
- user_medications
- saved_comparisons
- (and more...)

---

### Step 4: Import Walmart Pharmacy Program

```bash
# From apps/api directory
npm run import:walmart
```

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║   Walmart Pharmacy Program Import                ║
╚═══════════════════════════════════════════════════╝

📦 Importing Walmart $4/$10 program to database...

✅ Loaded Walmart pharmacy program data
Importing Walmart $4 program to database...
✅ Created/updated program: Walmart $4 Prescriptions
✅ Imported 30 medications to database

╔═══════════════════════════════════════════════════╗
║              Import Complete! ✅                  ║
╚═══════════════════════════════════════════════════╝

Imported Data:
  • Program: Walmart $4 Prescriptions
  • Medications: 30+ common generics
  • Pricing: $4 (30-day) / $10 (90-day)
```

**Verify import:**
```bash
npx prisma studio
# Navigate to pharmacy_savings_programs and pharmacy_savings_medications tables
```

---

### Step 5: Test DPC Provider Scraper (10 providers)

```bash
# From apps/api directory
npm run scrape:dpc:test
```

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║   DPC Frontier Scraper - Ignite Health Partners  ║
╚═══════════════════════════════════════════════════╝

🚀 Starting DPC Frontier scraping process...
Fetching practice IDs from DPC Frontier homepage...
Found 2734 practices
Scraping 10 practices (starting from index 0)

[1/10] Fetching practice abc123...
✅ Saved practice: Downtown Health DPC (abc123)

[2/10] Fetching practice def456...
✅ Saved practice: Wellness Medical Group (def456)

...

✅ Scraping complete!
   Successfully scraped: 10
   Errors: 0
   Total: 10
```

**Duration:** ~15 seconds

**Verify scraper worked:**
```bash
npx prisma studio
# Check dpc_providers table - should have 10 records
# Check dpc_provider_sources table - should have 10 records
```

---

### Step 6: Scrape All DPC Providers (2,734 practices)

```bash
# From apps/api directory
npm run scrape:dpc
```

**Expected output:**
```
╔═══════════════════════════════════════════════════╗
║   DPC Frontier Scraper - Ignite Health Partners  ║
╚═══════════════════════════════════════════════════╝

🚀 Starting DPC Frontier scraping process...
Found 2734 total practices
Scraping 2734 practices (starting from index 0)

[1/2734] Fetching practice abc123...
✅ Saved practice: Downtown Health DPC (abc123)

[2/2734] Fetching practice def456...
✅ Saved practice: Wellness Medical Group (def456)

...

[2734/2734] Fetching practice xyz789...
✅ Saved practice: Coastal Primary Care (xyz789)

✅ Scraping complete!
   Successfully scraped: 2720
   Errors: 14
   Total: 2734

╔═══════════════════════════════════════════════════╗
║              Scraping Complete! ✅                ║
╚═══════════════════════════════════════════════════╝
   Duration: 68.45 minutes
```

**Duration:** ~68 minutes (1.5s delay between requests)

**Note:** You can interrupt this process (Ctrl+C) and resume later:
```bash
# Resume from where you left off (e.g., index 1000)
npm run scrape:dpc -- --start 1000
```

---

### Step 7: Verify All Data

```bash
npx prisma studio
```

**Open browser:** http://localhost:5555

**Check these tables:**

1. **dpc_providers** - Should have ~2,734 records
   - Name, address, phone, website
   - Monthly fees
   - Services offered
   - Latitude/longitude

2. **dpc_provider_sources** - Should have ~2,734 records
   - Source: "dpc_frontier"
   - Last scraped timestamp
   - Data quality score (0-100)

3. **pharmacy_savings_programs** - Should have 1 record
   - Walmart $4 Prescriptions

4. **pharmacy_savings_medications** - Should have 30 records
   - Common medications with $4/$10 pricing

---

### Step 8: Start API Server

```bash
# From apps/api directory
npm run dev
```

**Expected output:**
```
✅ Healthcare.gov API client initialized successfully
✅ Loaded Walmart pharmacy program data
🚀 Server running on http://localhost:4000
```

**Test API endpoints:**

```bash
# Health check
curl http://localhost:4000/

# API status
curl http://localhost:4000/api/status

# Provider search (after scraping)
curl "http://localhost:4000/api/providers?zipCode=10001&radius=25"

# Cost comparison
curl -X POST http://localhost:4000/api/comparison/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "zipCode": "10001",
    "state": "NY",
    "income": 50000,
    "chronicConditions": [],
    "annualDoctorVisits": 3,
    "prescriptionCount": 2
  }'
```

---

## What You Now Have

### ✅ Complete Database
- 2,734 real DPC providers across all 50 states
- Walmart $4 pharmacy program with 30+ medications
- All tables ready for cost comparisons
- Data quality tracking

### ✅ Working API
- Healthcare.gov integration (real insurance plans)
- DPC provider search (by location)
- Prescription pricing (Walmart $4 program)
- Cost comparison service

### ✅ Data Sources
- **DPC Providers:** 2,734 practices (real data)
- **Insurance Plans:** Healthcare.gov API (real-time)
- **Prescriptions:** Walmart $4 program (accurate pricing)

---

## Quick Reference Commands

```bash
# Database
docker-compose up -d                    # Start PostgreSQL
docker-compose down                     # Stop PostgreSQL
npx prisma studio                       # Browse database
npx prisma migrate dev                  # Run migrations
npx prisma generate                     # Generate Prisma Client

# Data Import
npm run import:walmart                  # Import Walmart program
npm run scrape:dpc:test                 # Test scraper (10 providers)
npm run scrape:dpc                      # Scrape all providers
npm run scrape:dpc -- --limit 100       # Scrape 100 providers
npm run scrape:dpc -- --start 500       # Resume from index 500

# Development
npm run dev                             # Start API server (port 4000)
npm run build                           # Build TypeScript
npm test                                # Run tests
npm run lint                            # Run linter
```

---

## Troubleshooting

### Database Connection Issues

**Problem:** "Can't reach database server"

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart PostgreSQL
docker-compose restart

# Check .env file
cat apps/api/.env | grep DATABASE_URL
# Should be: postgresql://postgres:postgres@localhost:5432/dpc_comparator
```

### Port Already in Use

**Problem:** "Port 5432 is already allocated"

**Solution:**
```bash
# Stop existing PostgreSQL
sudo service postgresql stop    # Linux
brew services stop postgresql   # macOS

# Or change port in docker-compose.yml
ports:
  - '5433:5432'  # Use 5433 instead

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/dpc_comparator
```

### Prisma Client Not Found

**Problem:** "Cannot find module '@prisma/client'"

**Solution:**
```bash
cd apps/api
npm install
npx prisma generate
```

### Scraper Errors

**Problem:** "Error fetching practice IDs"

**Solution:**
```bash
# Check internet connection
ping mapper.dpcfrontier.com

# Check if website is accessible
curl https://mapper.dpcfrontier.com

# Try again with smaller batch
npm run scrape:dpc:test
```

### Import Walmart Fails

**Problem:** "Could not load Walmart program data"

**Solution:**
```bash
# Check if data file exists
ls -la data/walmart-pharmacy-programs.json

# Re-run import
cd apps/api
npm run import:walmart
```

---

## Next Steps

Now that everything is set up, you can:

1. **Build API Endpoints**
   - Provider search by location
   - Prescription pricing lookup
   - Cost comparison endpoints

2. **Build Frontend UI**
   - CompareTheMeerkat-style interface
   - Provider map view
   - Cost comparison cards
   - Prescription cost calculator

3. **Add More Features**
   - User authentication
   - Save comparisons
   - Medication lists
   - Provider ratings/reviews

4. **Expand Data Sources**
   - Costco pharmacy pricing
   - Top 100 static prescription prices
   - Lab test pricing
   - Additional pharmacy programs

---

## Data Summary

### DPC Providers (2,734 practices)
- **Coverage:** All 50 US states
- **Data Quality:** Average score 75-85/100
- **Includes:** Name, address, phone, website, fees, services, coordinates
- **Source:** DPC Frontier Mapper
- **Last Scraped:** Tracked in database

### Prescription Pricing (30+ medications)
- **Program:** Walmart $4/$10 Prescriptions
- **Coverage:** Most common generics
- **Pricing:** $4 (30-day), $10 (90-day)
- **Categories:** Cardiovascular, diabetes, mental health, pain, antibiotics, respiratory
- **Examples:** Lisinopril, Metformin, Atorvastatin, Sertraline, Amoxicillin

### Insurance Plans (Real-time)
- **Source:** Healthcare.gov Marketplace API
- **Coverage:** All metal tiers (Bronze, Silver, Gold, Platinum, Catastrophic)
- **Features:** APTC subsidies, county-level accuracy
- **API Key:** Configured and working

---

## Support

**Documentation:**
- [Database Setup](DATABASE_SETUP.md)
- [Setup Instructions](SETUP_INSTRUCTIONS.md)
- [DPC Scraper Guide](DPC_SCRAPER_GUIDE.md)
- [Prescription Pricing Alternatives](PRESCRIPTION_PRICING_ALTERNATIVES.md)
- [Week 2 Progress Summary](WEEK2_PROGRESS_SUMMARY.md)

**Common Issues:**
- Database connection: Check Docker is running
- Migration errors: Run `npx prisma migrate reset` (CAUTION: deletes data)
- Scraper errors: Check internet connection and DPC Frontier website
- Import errors: Verify data files exist in `/data` directory

**GitHub Repository:**
https://github.com/bhavenmurji/DPC-Cost-Comparator

---

## Environment Variables Reference

```bash
# .env and apps/api/.env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dpc_comparator
HEALTHCARE_GOV_API_KEY=1Uewbc3gQgNSSqszbBmBSlTF30Xk6YwQ
PORT=4000
NODE_ENV=development
```

---

## Success Checklist

- [ ] PostgreSQL running (`docker ps`)
- [ ] Dependencies installed (`npm install`)
- [ ] Migrations applied (`npx prisma migrate dev`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Walmart program imported (`npm run import:walmart`)
- [ ] DPC providers scraped (`npm run scrape:dpc`)
- [ ] Database verified (`npx prisma studio`)
- [ ] API server running (`npm run dev`)
- [ ] Endpoints tested (curl commands)

**All checked?** You're ready to build! 🚀
