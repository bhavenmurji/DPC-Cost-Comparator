#!/bin/bash

echo "🚀 Setting up DPC Cost Comparator Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your API URL"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "To build for production:"
echo "  npm run build"
echo "  npm start"
echo ""
