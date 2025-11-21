#!/bin/bash

# Check Setup Status

echo "🔍 Checking Ignite Health Partnerships Setup Status"
echo ""

# Check Docker
echo "1️⃣  Docker:"
if command -v docker &> /dev/null; then
    echo "   ✅ Docker installed: $(docker --version)"
    if docker ps &> /dev/null; then
        echo "   ✅ Docker daemon running"
        if docker ps | grep -q dpc-comparator-db; then
            echo "   ✅ PostgreSQL container running"
        else
            echo "   ❌ PostgreSQL container not running"
            echo "      Run: docker-compose up -d"
        fi
    else
        echo "   ❌ Docker daemon not running"
    fi
else
    echo "   ❌ Docker not installed"
fi
echo ""

# Check Node.js
echo "2️⃣  Node.js:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo "   ✅ Node.js $(node -v)"
    else
        echo "   ⚠️  Node.js $(node -v) (v20+ recommended)"
    fi
else
    echo "   ❌ Node.js not installed"
fi
echo ""

# Check dependencies
echo "3️⃣  Dependencies:"
if [ -d "node_modules" ]; then
    echo "   ✅ Root dependencies installed"
else
    echo "   ❌ Root dependencies missing (run: npm install)"
fi

if [ -d "apps/api/node_modules" ]; then
    echo "   ✅ API dependencies installed"
else
    echo "   ❌ API dependencies missing (run: cd apps/api && npm install)"
fi
echo ""

# Check Prisma
echo "4️⃣  Prisma:"
if [ -f "node_modules/@prisma/client/index.js" ]; then
    echo "   ✅ Prisma client generated"
else
    echo "   ❌ Prisma client not generated (run: npx prisma generate)"
fi
echo ""

# Check if API server is running
echo "5️⃣  API Server:"
if curl -s http://localhost:4000/health &> /dev/null; then
    echo "   ✅ API server running on http://localhost:4000"
else
    echo "   ❌ API server not running"
    echo "      Run: cd apps/api && npm run dev"
fi
echo ""

echo "📊 Summary:"
echo "   To start everything, run: ./scripts/local-quickstart.sh"
