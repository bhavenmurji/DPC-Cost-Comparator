# Live Preview Dashboard

This is the **Ignite Health Partnerships** API dashboard for VSCode Live Preview.

## What You're Seeing

The [index.html](index.html) file provides a beautiful, real-time dashboard that connects to your local API server.

### Features

- **Real-time API Status** - Green/red indicators show if the API is online
- **Platform Statistics** - Live counts of DPC providers and medications
- **Interactive Endpoint Testing** - Click any endpoint to test it
- **Test Buttons** - Quick access to common API operations
- **JSON Result Display** - See API responses in a dark code box
- **Auto-Refresh** - Checks API status every 30 seconds

### How to Use

1. **Start the API Server**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Open Live Preview in VSCode**
   - Right-click `public/index.html`
   - Select "Show Preview"
   - Or use the Live Preview extension

3. **See It Come Alive**
   - Status indicators turn green when API is online
   - Statistics populate with real data
   - Click test buttons to try API calls
   - Watch JSON responses appear below

### API Endpoints Available

- `GET /health` - Health check
- `GET /` - API information
- `GET /api/providers/search` - Search DPC providers
- `GET /api/providers/stats/summary` - Provider statistics
- `GET /api/prescriptions/search` - Search medications
- `GET /api/prescriptions/walmart-program` - Walmart $4 program
- `GET /api/prescriptions/programs` - All pharmacy programs
- `POST /api/prescriptions/calculate-costs` - Calculate prescription costs
- `POST /api/comparison/calculate` - Compare DPC vs Traditional

### Current Status

With the API server running on port 4000, you should see:

- ✅ Health Check: Online
- ✅ API Endpoints: 11 endpoints
- ⚠️ Database: Not connected (needs PostgreSQL)
- ⚠️ Data Sources: Limited (needs database migration)

### Next Steps to Fully Populate

To see ALL features working with real data:

1. **Start PostgreSQL** (on your local machine with Docker):
   ```bash
   docker-compose up -d
   ```

2. **Run migrations**:
   ```bash
   cd apps/api
   npx prisma migrate deploy
   ```

3. **Import Walmart program**:
   ```bash
   npm run import:walmart
   ```

4. **Scrape DPC providers**:
   ```bash
   npm run scrape:dpc:test  # 10 providers
   # or
   npm run scrape:dpc       # All 2,734 providers (~68 minutes)
   ```

5. **Refresh the Live Preview** - Everything will be green!

### Tech Stack

- Pure HTML/CSS/JavaScript
- Fetch API for HTTP requests
- Beautiful gradient purple design
- Responsive layout
- Auto-updating statistics

---

**Built with ❤️ for Ignite Health Partnerships**
