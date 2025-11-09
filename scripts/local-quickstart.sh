#!/bin/bash

# Quick Start Script for Local Machine
# Run this on your actual machine with Docker installed

set -e

echo "🚀 Ignite Health Partnerships - Quick Start"
echo ""

# Step 1: Start PostgreSQL
echo "📦 Starting PostgreSQL..."
docker-compose up -d
sleep 5

# Step 2: Run migrations
echo "🗄️  Running database migrations..."
cd apps/api
npx prisma migrate deploy
npx prisma generate

# Step 3: Import Walmart program
echo "💊 Importing Walmart $4 program..."
npm run import:walmart

# Step 4: Test scraper (10 providers)
echo "🏥 Testing DPC scraper..."
npm run scrape:dpc:test

# Step 5: Start API server
echo "🚀 Starting API server..."
echo ""
echo "✅ Setup complete! API will start on http://localhost:4000"
echo "   Open Live Preview to see the dashboard connect!"
echo ""
npm run dev
