# DPC Cost Comparator - Frontend

Next.js 14 frontend application for comparing traditional health insurance costs with Direct Primary Care (DPC) model.

## Features

- Next.js 14 with App Router
- Shadcn/ui component library
- Tailwind CSS for styling
- TypeScript for type safety
- Responsive design for mobile/tablet/desktop
- Real-time cost comparison
- Provider search and matching
- Interactive forms with validation

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/frontend/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn/ui base components
│   ├── insurance-form.tsx
│   ├── usage-form.tsx
│   ├── profile-form.tsx
│   ├── comparison-dashboard.tsx
│   └── provider-list.tsx
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript types
│   └── index.ts
└── styles/                # Global styles
    └── globals.css

```

## Components

### Forms
- **InsuranceForm**: Current insurance plan input
- **UsageForm**: Healthcare usage patterns
- **ProfileForm**: Personal information and location

### Display
- **ComparisonDashboard**: Cost comparison visualization
- **ProviderList**: DPC provider search results

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`:

- `POST /api/compare` - Cost comparison calculation
- `GET /api/providers/search` - Provider search by location
- `GET /api/providers/:id` - Individual provider details

## Styling

Uses Tailwind CSS with Shadcn/ui design system:
- Consistent color palette
- Responsive breakpoints
- Accessible components
- Dark mode support

## Type Safety

Full TypeScript coverage with shared types:
- InsurancePlan
- HealthcareUsage
- UserProfile
- CostComparison
- DPCProvider

## License

MIT
