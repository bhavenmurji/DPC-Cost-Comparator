# Frontend Installation Guide

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn package manager
- Git

## Quick Start

### 1. Navigate to Frontend Directory

```bash
cd src/frontend
```

### 2. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

Or manually:

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript types

## Project Structure

```
src/frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with nav/footer
│   └── page.tsx           # Main comparison page
├── components/            # React components
│   ├── ui/               # Shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   └── tabs.tsx
│   ├── insurance-form.tsx      # Insurance plan input
│   ├── usage-form.tsx          # Healthcare usage input
│   ├── profile-form.tsx        # User profile input
│   ├── comparison-dashboard.tsx # Cost comparison results
│   └── provider-list.tsx       # DPC provider listing
├── lib/
│   ├── api.ts            # API client functions
│   └── utils.ts          # Utility functions
├── types/
│   └── index.ts          # TypeScript type definitions
├── styles/
│   └── globals.css       # Global styles + Tailwind
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.ts
```

## Features Implemented

### User Input Forms
- **Insurance Form**: Current plan details (premium, deductible, copay, etc.)
- **Usage Form**: Annual healthcare usage patterns
- **Profile Form**: Location, age, family size, chronic conditions

### Results Display
- **Comparison Dashboard**: Side-by-side cost breakdown
- **Savings Calculation**: Annual savings with percentage
- **Provider List**: Nearby DPC providers with details
- **Recommendations**: Personalized suggestions

### UI Components
- Responsive design (mobile, tablet, desktop)
- Shadcn/ui component library
- Tailwind CSS styling
- Dark mode support
- Accessible ARIA labels
- Loading states
- Error handling

### API Integration
- REST API client
- Error boundaries
- Loading indicators
- Real-time updates

## Configuration

### Tailwind CSS

Configured in `tailwind.config.ts` with:
- Custom color palette
- Responsive breakpoints
- Animation utilities
- Dark mode support

### TypeScript

Strict mode enabled with:
- Full type coverage
- Interface definitions
- API type safety
- Component prop types

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL
```

## Troubleshooting

### Port Already in Use

If port 3000 is in use:

```bash
PORT=3001 npm run dev
```

### Dependencies Issues

Clear cache and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

Check Node version:

```bash
node -v  # Should be 18+
```

Clear Next.js cache:

```bash
rm -rf .next
npm run build
```

### TypeScript Errors

Run type check:

```bash
npm run type-check
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Server-side rendering (SSR)
- Automatic code splitting
- Image optimization
- CSS optimization
- Tree shaking

## Development Tips

### Hot Reload
Changes to code automatically reload the browser.

### Component Development
Use React DevTools for debugging components.

### API Testing
Use browser Network tab to debug API calls.

### Responsive Testing
Use browser DevTools device mode for mobile/tablet testing.

## Next Steps

1. Start backend server (see backend README)
2. Test the comparison flow
3. Customize styling as needed
4. Add additional features
5. Deploy to production

## Support

For issues or questions:
- Check backend API is running on port 3001
- Review browser console for errors
- Check Network tab for API failures
- Verify environment variables are set
