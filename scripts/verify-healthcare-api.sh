#!/bin/bash

# Healthcare.gov API Integration Verification Script
# This script verifies that the Healthcare.gov API integration is properly set up

echo "=================================================="
echo "Healthcare.gov API Integration Verification"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
echo "1. Checking environment configuration..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file found"

    # Check for API key
    if grep -q "HEALTHCARE_GOV_API_KEY=" .env; then
        API_KEY=$(grep "HEALTHCARE_GOV_API_KEY=" .env | cut -d '=' -f2)
        if [ "$API_KEY" = "your_api_key_here" ] || [ -z "$API_KEY" ]; then
            echo -e "${YELLOW}⚠${NC} Healthcare.gov API key not configured"
            echo "   Get an API key at: https://developer.cms.gov/marketplace-api/key-request.html"
            echo "   The system will use estimates until API key is added"
        else
            echo -e "${GREEN}✓${NC} Healthcare.gov API key configured"
        fi
    else
        echo -e "${RED}✗${NC} HEALTHCARE_GOV_API_KEY not found in .env"
        echo "   Add: HEALTHCARE_GOV_API_KEY=your_api_key_here"
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
    echo "   Copy .env.example to .env and configure"
    exit 1
fi

echo ""
echo "2. Checking installed dependencies..."

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules directory exists"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found - run 'npm install'"
fi

# Check if axios is installed
if [ -d "node_modules/axios" ]; then
    echo -e "${GREEN}✓${NC} axios package installed"
else
    echo -e "${RED}✗${NC} axios package not found"
    echo "   Run: npm install"
fi

echo ""
echo "3. Checking implementation files..."

FILES=(
    "apps/api/src/types/healthcareGov.types.ts"
    "apps/api/src/services/healthcareGov.service.ts"
    "apps/api/src/utils/healthcareGovTransformer.ts"
    "apps/api/src/services/costComparisonEnhanced.service.ts"
    "apps/api/src/config/healthcareGov.config.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file not found"
    fi
done

echo ""
echo "4. Checking test files..."

TEST_FILES=(
    "tests/integration/healthcareGovApi.test.ts"
    "tests/integration/costComparisonEnhanced.test.ts"
)

for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${YELLOW}⚠${NC} $file not found"
    fi
done

echo ""
echo "5. Checking documentation..."

DOCS=(
    "docs/HEALTHCARE_GOV_API_INTEGRATION.md"
    "docs/QUICKSTART_HEALTHCARE_API.md"
    "docs/API_USAGE_EXAMPLES.md"
    "docs/HEALTHCARE_GOV_IMPLEMENTATION_SUMMARY.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${YELLOW}⚠${NC} $doc not found"
    fi
done

echo ""
echo "=================================================="
echo "Verification Summary"
echo "=================================================="
echo ""

# Count checks
TOTAL_FILES=$((${#FILES[@]} + ${#TEST_FILES[@]} + ${#DOCS[@]}))
EXISTING_FILES=0

for file in "${FILES[@]}" "${TEST_FILES[@]}" "${DOCS[@]}"; do
    if [ -f "$file" ]; then
        ((EXISTING_FILES++))
    fi
done

echo "Files found: $EXISTING_FILES/$TOTAL_FILES"

if [ $EXISTING_FILES -eq $TOTAL_FILES ]; then
    echo -e "${GREEN}✓ All implementation files are present${NC}"
else
    echo -e "${YELLOW}⚠ Some files are missing${NC}"
fi

echo ""
echo "Next Steps:"
echo "1. If API key not configured:"
echo "   - Request key at: https://developer.cms.gov/marketplace-api/key-request.html"
echo "   - Add to .env: HEALTHCARE_GOV_API_KEY=your_key"
echo ""
echo "2. Install dependencies (if needed):"
echo "   npm install"
echo ""
echo "3. Run tests:"
echo "   npm test tests/integration/healthcareGovApi.test.ts"
echo ""
echo "4. Start the server:"
echo "   npm run dev"
echo ""
echo "5. Test the API:"
echo "   curl -X POST http://localhost:3000/api/comparison/calculate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"age\":30,\"zipCode\":\"27701\",\"state\":\"NC\",\"chronicConditions\":[],\"annualDoctorVisits\":4,\"prescriptionCount\":2}'"
echo ""
echo "Documentation: See docs/QUICKSTART_HEALTHCARE_API.md"
echo ""
