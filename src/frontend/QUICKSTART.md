# Quick Start Guide

Get the DPC Cost Comparator frontend running in 2 minutes.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Backend API running on port 3001

## Installation

```bash
# Navigate to frontend directory
cd src/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit **http://localhost:3000**

## Default Configuration

The app expects the backend API at:
```
http://localhost:3001
```

To change this, edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://your-api-url
```

## Using the App

### Step 1: Enter Personal Information
- ZIP code (required for provider search)
- Age
- Family size
- Chronic conditions (optional)

### Step 2: Enter Current Insurance Plan
- Monthly premium
- Annual deductible
- Coinsurance percentage
- Average copay
- Out-of-pocket maximum

### Step 3: Enter Healthcare Usage
- Primary care visits per year
- Specialist visits
- Urgent care visits
- Emergency room visits
- Prescriptions
- Lab tests
- Imaging studies

### Step 4: View Results
Click "Compare Costs" to see:
- Total cost comparison
- Annual savings
- Detailed breakdown
- Nearby DPC providers
- Personalized recommendations

## Project Structure

```
src/frontend/
├── app/
│   ├── layout.tsx      # Main layout
│   └── page.tsx        # Home page
├── components/
│   ├── ui/            # Base UI components
│   ├── insurance-form.tsx
│   ├── usage-form.tsx
│   ├── profile-form.tsx
│   ├── comparison-dashboard.tsx
│   └── provider-list.tsx
├── lib/
│   ├── api.ts         # API client
│   └── utils.ts       # Utilities
└── types/
    └── index.ts       # TypeScript types
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript
```

## Troubleshooting

### "Cannot connect to API"
- Ensure backend is running on port 3001
- Check `.env.local` has correct API URL
- Verify CORS is enabled on backend

### "Port 3000 already in use"
```bash
PORT=3001 npm run dev
```

### Dependencies won't install
```bash
rm -rf node_modules package-lock.json
npm install
```

## What's Included

- ✅ Responsive UI (mobile, tablet, desktop)
- ✅ Type-safe API integration
- ✅ Real-time cost calculations
- ✅ Provider search by location
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ Error handling
- ✅ Loading states

## Key Features

### Forms
- Insurance plan details
- Healthcare usage patterns
- User profile and location

### Results
- Side-by-side cost comparison
- Savings calculation
- Detailed breakdowns
- DPC provider listings
- Personalized recommendations

### UI Components
- Shadcn/ui component library
- Tailwind CSS styling
- Lucide icons
- Radix UI primitives

## API Endpoints Used

```typescript
POST /api/compare              // Cost comparison
GET  /api/providers/search     // Provider search
GET  /api/providers/:id        // Provider details
GET  /health                   // Health check
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## Next Steps

1. ✅ Install and run
2. Test with sample data
3. Review the code
4. Customize styling
5. Add new features
6. Deploy to production

## Sample Test Data

Try these values to test the app:

**Profile:**
- ZIP: 12345
- Age: 35
- Family: 1

**Insurance:**
- Premium: $500/month
- Deductible: $3,000
- Coinsurance: 20%
- Copay: $30
- Out-of-pocket max: $8,000

**Usage:**
- Primary care: 4 visits
- Specialist: 2 visits
- Urgent care: 1 visit
- Prescriptions: 3
- Lab tests: 2

## Support

Check these resources:
- README.md - Full documentation
- INSTALLATION.md - Detailed setup
- IMPLEMENTATION_SUMMARY.md - Technical details

## Production Deployment

```bash
# Build optimized bundle
npm run build

# Test production build locally
npm start

# Deploy to Vercel (recommended)
vercel deploy
```

---

**Ready to go!** The frontend is fully functional and awaiting backend integration.
