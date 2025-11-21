#!/bin/bash

echo "🚀 Setting up HealthPartnershipX..."

# Check Node.js version
echo "📦 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Copy environment file
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your configuration"
fi

# Start Docker services
echo "🐳 Starting Docker services..."
cd infrastructure/docker && docker-compose up -d && cd ../..

# Wait for database
echo "⏳ Waiting for database to be ready..."
sleep 5

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:setup

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your configuration"
echo "  2. Run 'npm run dev' to start development servers"
echo "  3. Frontend: http://localhost:3000"
echo "  4. Backend: http://localhost:4000"
echo ""
