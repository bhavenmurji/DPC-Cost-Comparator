#!/bin/bash

# Complete Setup Script for Ignite Health Partnerships
# This script automates the entire setup process

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════╗"
echo "║  Ignite Health Partnerships - Complete Setup     ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker Desktop first."
    echo "   macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "   Windows: https://docs.docker.com/desktop/install/windows-install/"
    echo "   Linux: https://docs.docker.com/engine/install/"
    exit 1
fi
print_success "Docker is installed"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v20+"
    echo "   https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version is $NODE_VERSION. Please upgrade to v20+"
    exit 1
fi
print_success "Node.js v$(node -v) is installed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm v$(npm -v) is installed"

echo ""
echo "All prerequisites met! Starting setup..."
echo ""

# Step 1: Start PostgreSQL
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1/7: Starting PostgreSQL with Docker Compose"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker-compose up -d
sleep 5  # Wait for PostgreSQL to start

# Verify PostgreSQL is running
if docker ps | grep -q dpc-comparator-db; then
    print_success "PostgreSQL is running"
else
    print_error "PostgreSQL failed to start"
    exit 1
fi

echo ""

# Step 2: Install dependencies
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2/7: Installing dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm install
cd apps/api
npm install
cd ../..

print_success "Dependencies installed"
echo ""

# Step 3: Run database migrations
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3/7: Running database migrations"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/api
npx prisma migrate deploy
npx prisma generate
cd ../..

print_success "Database migrations applied"
echo ""

# Step 4: Import Walmart program
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4/7: Importing Walmart $4 pharmacy program"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/api
npm run import:walmart
cd ../..

print_success "Walmart program imported (30+ medications)"
echo ""

# Step 5: Test scraper
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5/7: Testing DPC provider scraper (10 providers)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/api
npm run scrape:dpc:test
cd ../..

print_success "Scraper test complete"
echo ""

# Step 6: Ask about full scrape
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 6/7: Full provider scraping (optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Do you want to scrape all 2,734 providers now? (~68 minutes) [y/N]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting full provider scrape..."
    cd apps/api
    npm run scrape:dpc
    cd ../..
    print_success "All providers scraped!"
else
    print_info "Skipping full scrape. You can run it later with: npm run scrape:dpc"
fi

echo ""

# Step 7: Verification
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 7/7: Verifying setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd apps/api

# Check database tables
PROVIDER_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM dpc_providers;" 2>/dev/null || echo "0")
MEDICATION_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM pharmacy_savings_medications;" 2>/dev/null || echo "0")

if [ "$PROVIDER_COUNT" != "0" ]; then
    print_success "DPC Providers in database: $PROVIDER_COUNT"
else
    print_info "DPC Providers in database: 0 (run scraper to populate)"
fi

if [ "$MEDICATION_COUNT" != "0" ]; then
    print_success "Medications in database: $MEDICATION_COUNT"
else
    print_info "Medications in database: 0"
fi

cd ../..

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║              Setup Complete! 🎉                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "What's been set up:"
echo "  ✅ PostgreSQL database running"
echo "  ✅ Database migrations applied"
echo "  ✅ Walmart $4 program imported (30+ medications)"
echo "  ✅ DPC scraper tested"
echo ""
echo "Next steps:"
echo ""
echo "  1. Start API server:"
echo "     cd apps/api && npm run dev"
echo ""
echo "  2. View database:"
echo "     cd apps/api && npx prisma studio"
echo ""
echo "  3. Test API endpoints:"
echo "     curl http://localhost:4000/"
echo "     curl http://localhost:4000/api/prescriptions/walmart-program"
echo ""
echo "  4. Scrape all providers (if not done yet):"
echo "     cd apps/api && npm run scrape:dpc"
echo ""
echo "  5. Build frontend:"
echo "     See docs/API_REFERENCE.md for all endpoints"
echo ""
echo "Documentation:"
echo "  • Getting Started: docs/GETTING_STARTED.md"
echo "  • API Reference: docs/API_REFERENCE.md"
echo "  • Scraper Guide: docs/DPC_SCRAPER_GUIDE.md"
echo ""
