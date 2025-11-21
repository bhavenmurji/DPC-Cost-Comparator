#!/bin/bash
# Simple script to run DPC provider import with Node 20

echo "Starting DPC Provider Import..."
echo "This will import 2734 providers and take ~3 minutes"
echo ""

# Use your Node 20 installation directly
/home/bmurji/.nvm/versions/node/v20.19.5/bin/npx tsx scripts/scrape-dpc-providers.ts

echo ""
echo "Import complete!"
