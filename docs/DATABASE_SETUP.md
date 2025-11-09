# Database Setup Guide - Ignite Health Partnerships

## Quick Start

This project uses PostgreSQL with Docker for local development.

### 1. Start PostgreSQL with Docker

```bash
# Start the database
docker-compose up -d

# Verify it's running
docker ps | grep dpc-comparator-db
```

### 2. Run Database Migrations

```bash
# Navigate to API directory
cd apps/api

# Generate and apply migrations
npx prisma migrate dev --name add-ignite-health-partnerships-tables

# Update Prisma Client
npx prisma generate
```

### 3. Verify Database Schema

```bash
# Open Prisma Studio to browse database
npx prisma studio
```

## Database Connection

**Connection String**: `postgresql://postgres:postgres@localhost:5432/dpc_comparator`

- **Host**: localhost
- **Port**: 5432
- **Database**: dpc_comparator
- **Username**: postgres
- **Password**: postgres

## Database Schema Overview

The Ignite Health Partnerships database supports comprehensive healthcare cost comparison:

### Core Tables
- `users` - User accounts and profiles
- `user_profiles` - Demographics, health data, current insurance
- `cost_comparisons` - Comparison calculation results

### DPC Provider Data
- `dpc_providers` - Direct Primary Care provider directory
- `dpc_provider_sources` - Track data sources (DPC Frontier, Atlas MD, manual)
- `matched_providers` - Provider matches for comparisons

### Prescription Pricing
- `prescription_prices` - Cached pricing from GoodRx, Costco, Walmart
- `pharmacy_savings_programs` - Walmart $4, Costco membership programs
- `pharmacy_savings_medications` - Medications covered by programs
- `user_medications` - User medication lists with cost tracking

### Lab & Testing
- `lab_test_prices` - LabCorp, Quest, DPC affiliate pricing

### Insurance Plans
- `insurance_plans` - Traditional insurance plan templates

### User Features
- `saved_comparisons` - Save and share comparison results

### Compliance
- `audit_logs` - HIPAA-compliant audit trail

## Data Sources Integration Status

| Source | Status | Tables |
|--------|--------|--------|
| Healthcare.gov API | ✅ Complete | `insurance_plans`, `cost_comparisons` |
| DPC Frontier | ⏳ Next | `dpc_providers`, `dpc_provider_sources` |
| GoodRx API | ⏳ Pending | `prescription_prices` |
| Lab Pricing | ⏳ Pending | `lab_test_prices` |
| Pharmacy Programs | ⏳ Pending | `pharmacy_savings_programs` |

## Useful Commands

```bash
# Stop database
docker-compose down

# Stop and remove volumes (CAUTION: deletes all data)
docker-compose down -v

# View database logs
docker-compose logs -f postgres

# Reset database and rerun migrations
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Deploy migrations to production
npx prisma migrate deploy
```

## Troubleshooting

### Port 5432 already in use
```bash
# Check what's using port 5432
lsof -i :5432

# Stop existing PostgreSQL service
sudo service postgresql stop
```

### Connection refused
```bash
# Check if Docker is running
docker ps

# Restart Docker Compose
docker-compose restart
```

### Prisma Client out of sync
```bash
# Regenerate Prisma Client
npx prisma generate
```

## Production Deployment

For production, use a managed PostgreSQL service:

- **AWS RDS** for PostgreSQL
- **Google Cloud SQL** for PostgreSQL
- **Heroku Postgres**
- **Supabase**
- **Railway**

Update `DATABASE_URL` in production environment variables accordingly.

## Security Notes

⚠️ **NEVER** commit `.env` files with real credentials to git
⚠️ **ALWAYS** use strong passwords in production
⚠️ **ENABLE** SSL for production database connections

## Next Steps

1. ✅ Database schema complete
2. ⏳ Start Docker Compose: `docker-compose up -d`
3. ⏳ Run migrations: `npx prisma migrate dev`
4. ⏳ Build DPC Provider scraper (Option A)
5. ⏳ Apply for GoodRx API (Option C)
