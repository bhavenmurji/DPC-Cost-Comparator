#!/bin/bash

# DPC Cost Comparator - Automated Setup Script
# This script will help you get everything running with minimal commands

set -e  # Exit on any error

echo "🚀 DPC Cost Comparator - Automated Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed!${NC}"
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
echo ""

# Check if PostgreSQL is installed
echo "Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed!${NC}"
    echo "Please install PostgreSQL from: https://postgresapp.com (Mac) or https://www.postgresql.org (Windows)"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL found: $(psql --version)${NC}"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd src/backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Go back to root
cd ../..

# Check if database exists
echo "🗄️ Setting up database..."
if psql -lqt | cut -d \| -f 1 | grep -qw dpc_comparator; then
    echo -e "${YELLOW}⚠️  Database 'dpc_comparator' already exists. Skipping creation.${NC}"
else
    createdb dpc_comparator
    echo -e "${GREEN}✅ Database 'dpc_comparator' created${NC}"
fi

# Load database schema
echo "Loading database schema..."
psql -d dpc_comparator -f src/backend/database/schema.sql > /dev/null 2>&1
echo -e "${GREEN}✅ Database schema loaded${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating .env configuration file..."
    cp .env.example .env

    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32)

    # Update the .env file with generated secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=YOUR_SECURE_RANDOM_STRING_FOR_SESSIONS|JWT_SECRET=$JWT_SECRET|g" .env
    else
        # Linux
        sed -i "s|JWT_SECRET=YOUR_SECURE_RANDOM_STRING_FOR_SESSIONS|JWT_SECRET=$JWT_SECRET|g" .env
    fi

    echo -e "${GREEN}✅ .env file created with secure JWT secret${NC}"
else
    echo -e "${YELLOW}⚠️  .env file already exists. Skipping.${NC}"
fi
echo ""

# Create startup scripts
echo "📝 Creating startup scripts..."

# Backend startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting backend server..."
cd src/backend
npm run dev
EOF
chmod +x start-backend.sh

# Frontend startup script
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting frontend server..."
cd src/frontend
npm run dev
EOF
chmod +x start-frontend.sh

# Combined startup script
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting DPC Cost Comparator..."
echo ""
echo "This will start both backend and frontend servers."
echo "Press Ctrl+C to stop all servers."
echo ""

# Start backend in background
cd src/backend
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF
chmod +x start-all.sh

echo -e "${GREEN}✅ Startup scripts created${NC}"
echo ""

# Final success message
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "To start your application, you have 3 options:"
echo ""
echo "Option 1 (Recommended): Start everything at once"
echo "  ./start-all.sh"
echo ""
echo "Option 2: Start servers separately"
echo "  Terminal 1: ./start-backend.sh"
echo "  Terminal 2: ./start-frontend.sh"
echo ""
echo "Option 3: Manual startup"
echo "  Terminal 1: cd src/backend && npm run dev"
echo "  Terminal 2: cd src/frontend && npm run dev"
echo ""
echo "Once started, visit: http://localhost:3000"
echo ""
echo -e "${YELLOW}📸 Don't forget to take screenshots for your demo!${NC}"
echo ""
