# Setup Instructions - Ignite Health Partnerships

## Prerequisites

Before starting, ensure you have installed:

- **Docker Desktop** (for macOS/Windows) or **Docker Engine** (for Linux)
- **Node.js** (v18 or later)
- **Git**

## Step-by-Step Setup

### 1. Clone the Repository (if not already done)

```bash
git clone git@github.com:bhavenmurji/DPC-Cost-Comparator.git
cd DPC-Cost-Comparator
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install
cd ../..
```

### 3. Start PostgreSQL Database

```bash
# Start Docker Compose (from project root)
docker-compose up -d

# Verify database is running
docker ps | grep dpc-comparator-db
```

**Expected Output:**
```
CONTAINER ID   IMAGE                COMMAND                  STATUS          PORTS
abc123def456   postgres:15-alpine   "docker-entrypoint.s…"   Up 10 seconds   0.0.0.0:5432->5432/tcp
```

### 4. Configure Environment Variables

The `.env` files are already configured with the correct `DATABASE_URL`:

```bash
# Root .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dpc_comparator

# apps/api/.env (same)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dpc_comparator
```

**Healthcare.gov API Key** (already configured):
```bash
HEALTHCARE_GOV_API_KEY=1Uewbc3gQgNSSqszbBmBSlTF30Xk6YwQ
```

### 5. Run Database Migrations

```bash
# Navigate to API directory
cd apps/api

# Generate and apply all migrations
npx prisma migrate dev --name add-ignite-health-partnerships-tables

# Update Prisma Client
npx prisma generate
```

**Expected Output:**
```
Applying migration `20250108_add_ignite_health_partnerships_tables`
Database migrations successfully applied!
✔ Generated Prisma Client
```

### 6. Verify Database Schema

```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

This will open `http://localhost:5555` in your browser where you can:
- Browse all database tables
- View the schema
- Manually add/edit data (useful for testing)

### 7. Start the API Server

```bash
# From apps/api directory
npm run dev

# Or from project root
npm run dev:api
```

**Expected Output:**
```
✅ Healthcare.gov API client initialized successfully
🚀 Server running on http://localhost:4000
```

### 8. Test API Endpoints

```bash
# Health check
curl http://localhost:4000/

# Healthcare.gov API status
curl http://localhost:4000/api/status

# Example comparison (requires provider data - coming in Option A)
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

## Database Schema Overview

After migrations, you'll have these tables:

### Core Tables
- ✅ `users` - User accounts
- ✅ `user_profiles` - Demographics and health data
- ✅ `cost_comparisons` - Comparison results
- ✅ `audit_logs` - HIPAA audit trail

### DPC Provider Data
- ✅ `dpc_providers` - Provider directory
- ✅ `dpc_provider_sources` - Data source tracking
- ✅ `matched_providers` - Provider matches

### Prescription Pricing (NEW - Week 2)
- ✅ `prescription_prices` - GoodRx, Costco, Walmart pricing
- ✅ `pharmacy_savings_programs` - Walmart $4, Costco programs
- ✅ `pharmacy_savings_medications` - Program medications
- ✅ `user_medications` - User medication lists

### Lab Testing (NEW - Week 2)
- ✅ `lab_test_prices` - LabCorp, Quest pricing

### User Features (NEW - Week 2)
- ✅ `saved_comparisons` - Save and share comparisons

## Troubleshooting

### Docker Issues

**"docker: command not found"**
```bash
# Install Docker Desktop
# macOS: https://docs.docker.com/desktop/install/mac-install/
# Windows: https://docs.docker.com/desktop/install/windows-install/
# Linux: https://docs.docker.com/engine/install/
```

**"port 5432 is already allocated"**
```bash
# Stop existing PostgreSQL service
sudo service postgresql stop  # Linux
brew services stop postgresql  # macOS

# Or change port in docker-compose.yml
ports:
  - '5433:5432'  # Use 5433 instead of 5432
```

### Migration Issues

**"Can't reach database server"**
```bash
# Verify database is running
docker ps | grep postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart
```

**"Migration already applied"**
```bash
# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Or force reapply
npx prisma migrate deploy
```

### Prisma Client Issues

**"Prisma Client is not generated"**
```bash
npx prisma generate
```

**"Schema out of sync"**
```bash
# Regenerate client
npx prisma generate

# If that doesn't work, delete and regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

## Next Steps

Once the database is running and migrations are applied:

### ✅ Completed (Week 1-2)
- Healthcare.gov API integration with real plan data
- Database schema foundation
- Docker Compose setup
- API server with enhanced comparison

### ⏳ Next Priority (Option A)
**DPC Provider Integration**
1. Build DPC Frontier web scraper
2. Populate database with real provider data (2,060+ practices)
3. Create provider search API endpoint
4. Implement geocoding and distance calculation

### ⏳ Future (Option C)
**Prescription Pricing**
1. Apply for GoodRx API access
2. Implement prescription search
3. Add Walmart $4 generic list
4. Build price comparison logic

## Development Workflow

```bash
# Start everything
docker-compose up -d && cd apps/api && npm run dev

# View database in browser
npx prisma studio

# Run migrations after schema changes
npx prisma migrate dev --name your_migration_name

# Stop everything
docker-compose down
```

## Production Deployment

For production, replace Docker Compose with a managed database:

- **AWS RDS** for PostgreSQL
- **Google Cloud SQL**
- **Heroku Postgres**
- **Supabase**
- **Railway**

Update `DATABASE_URL` in production environment variables.

## Support

- **Documentation**: [docs/](../docs/)
- **Database Setup**: [docs/DATABASE_SETUP.md](DATABASE_SETUP.md)
- **API Integration**: [docs/API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md)
- **Healthcare.gov API**: [docs/HEALTHCARE_GOV_API_INTEGRATION.md](HEALTHCARE_GOV_API_INTEGRATION.md)
