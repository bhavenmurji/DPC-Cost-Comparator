# City Landing Page Redesign

**Date:** 2026-01-17
**Status:** Approved
**Author:** Brainstorming session

## Overview

Redesign the DPC Comparator city landing pages (Chicago, LA, NYC, SF, San Diego) to:
1. Migrate from inline styles to Tailwind CSS
2. Extract reusable components from duplicate code
3. Establish consistent design system with Space Grotesk font and healthicons

## Design Decisions

### Typography
- **Font:** Space Grotesk (Google Fonts)
- **Headings:** Bold weights (600-700)
- **Body:** Regular weight (400)

### Colors
- **Primary gradient:** emerald-600 to teal-700
- **Accent:** emerald-600 for icons and highlights
- **Stats cards:** emerald-50 background
- **Text:** gray-900 (headings), gray-600 (body)

### Icons
- **Source:** healthicons.org (CC0 license)
- **Format:** Inline SVG for flexibility
- **Color:** currentColor (inherits from parent)
- **Size:** 48x48 (w-12 h-12)

### Voice & Tone
- **Direct:** "Skip the insurance. See a doctor."
- **Empathetic:** Acknowledge healthcare frustrations
- **Concrete:** Real numbers, specific examples
- **No marketing fluff:** Facts over adjectives

## Component Architecture

```
src/components/city-landing/
├── CityHero.tsx          # Hero with title, subtitle, CTAs
├── CityStats.tsx         # Stats grid (providers, fees, savings)
├── CityBenefits.tsx      # Benefits/how-it-works cards
├── CityProviders.tsx     # Featured providers section
└── index.ts              # Barrel export
```

### CityHero Props
```typescript
interface CityHeroProps {
  city: string
  tagline: string
  description?: string
  stats: { providerCount: number; avgMonthlyFee: number }
  onFindProviders: () => void
  onCalculateCosts: () => void
}
```

### CityStats Props
```typescript
interface CityStatsProps {
  stats: {
    providerCount: number
    avgMonthlyFee: number
    estimatedSavings: number
  }
}
```

### CityBenefits Props
```typescript
interface Benefit {
  icon: React.ReactNode  // SVG component
  title: string
  description: string
}

interface CityBenefitsProps {
  benefits: Benefit[]
  title?: string  // Default: "How it actually works"
}
```

## Sample Copy

### Hero
- **Headline:** "Skip the insurance. See a doctor."
- **Subhead:** "45 Chicago doctors. $165/month. No copays, no surprise bills."
- **Body:** "Direct Primary Care means you pay your doctor directly—like a gym membership for healthcare. Text them at 10pm. Get seen tomorrow. Actually know what things cost."

### Benefits
1. **Text your doctor** - "Rash at 9pm? Text a photo. Question about meds? Just ask. No portal, no wait."
2. **Same-day visits** - "Sick today? Get seen today. Most DPC doctors keep slots open for urgent needs."
3. **Know the price** - "$165/month covers everything. Labs, stitches, physicals—no surprise bills showing up later."
4. **30+ minute visits** - "Your doctor isn't rushing to the next patient. You get the time you actually need."

## Implementation Plan

### Phase 1: Chicago Template (This PR)
1. Create shared components in `src/components/city-landing/`
2. Add Space Grotesk font to project
3. Create healthicons component library
4. Refactor ChicagoDPC.tsx to use new components
5. Delete preview-hero.html

### Phase 2: Migrate Other Cities
- LosAngelesDPC.tsx
- NewYorkDPC.tsx
- SanFranciscoDPC.tsx
- SanDiegoDPC.tsx

Each city page becomes ~50 lines of config + shared components.

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/city-landing/CityHero.tsx` | Create |
| `src/components/city-landing/CityStats.tsx` | Create |
| `src/components/city-landing/CityBenefits.tsx` | Create |
| `src/components/city-landing/CityProviders.tsx` | Create |
| `src/components/city-landing/index.ts` | Create |
| `src/components/icons/healthicons.tsx` | Create |
| `src/pages/ChicagoDPC.tsx` | Refactor |
| `tailwind.config.js` | Add Space Grotesk font |
| `index.html` | Add Google Fonts link |

## Preview

Preview HTML available at: `apps/dpc-comparator/apps/web/preview-hero.html`

Run `python3 -m http.server 8888` from web directory to view.
