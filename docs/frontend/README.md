# SafariPlus - Frontend Architecture

## Overview

The SafariPlus frontend is built with Next.js 15 App Router, React 19, and Tailwind CSS, following a mobile-first design philosophy optimized for the East African market.

---

## Design Principles

### 1. Mobile-First
- Design for mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Performance optimized for 3G networks

### 2. Component-Based
- Reusable, composable components
- Consistent design system
- Storybook documentation (Phase 2)

### 3. Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML
- Keyboard navigation
- Screen reader support

### 4. Performance
- Core Web Vitals optimization
- Image optimization via Next.js + Cloudinary
- Code splitting and lazy loading
- Minimal JavaScript bundle

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js 15 | Framework (App Router) |
| React 19 | UI Library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| React Hook Form | Form handling |
| Zod | Validation |
| TanStack Query | Server state |
| Zustand | Client state |
| Lucide React | Icons |

---

## Project Structure

```
app/
├── (auth)/              # Auth pages (login, register)
├── (client)/            # Client-facing pages
├── (agent)/             # Agent dashboard
├── (admin)/             # Admin dashboard
├── layout.tsx           # Root layout
├── page.tsx             # Landing page
└── globals.css          # Global styles

components/
├── ui/                  # shadcn/ui base components
├── forms/               # Form components
├── tours/               # Tour-related components
├── bookings/            # Booking-related components
├── dashboard/           # Dashboard components
├── layout/              # Layout components
└── shared/              # Shared utilities

hooks/                   # Custom React hooks
lib/                     # Utilities and configurations
types/                   # TypeScript types
```

---

## Component Library (shadcn/ui)

### Installed Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add toast
npx shadcn@latest add calendar
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add skeleton
npx shadcn@latest add separator
npx shadcn@latest add sheet
npx shadcn@latest add popover
npx shadcn@latest add command
```

### Custom Components

| Component | Description | Location |
|-----------|-------------|----------|
| TourCard | Tour listing card | components/tours/ |
| TourGallery | Image gallery viewer | components/tours/ |
| TourFilters | Search and filter panel | components/tours/ |
| BookingForm | Multi-step booking form | components/bookings/ |
| BookingCard | Booking summary card | components/bookings/ |
| DatePicker | Tour date selector | components/bookings/ |
| TravelerCounter | +/- traveler input | components/bookings/ |
| StatsCard | Dashboard metric card | components/dashboard/ |
| Header | Site header with nav | components/layout/ |
| Footer | Site footer | components/layout/ |
| MobileNav | Bottom mobile navigation | components/layout/ |
| Sidebar | Dashboard sidebar | components/layout/ |

---

## Page Templates

### Landing Page
```
┌─────────────────────────────────────┐
│             Header                  │
├─────────────────────────────────────┤
│                                     │
│          Hero Section               │
│     (Image + Search Bar)            │
│                                     │
├─────────────────────────────────────┤
│       Popular Destinations          │
│     [Card] [Card] [Card] [Card]     │
├─────────────────────────────────────┤
│         Featured Tours              │
│     [TourCard] [TourCard] →        │
├─────────────────────────────────────┤
│          Why SafariPlus             │
│     (Trust signals, features)       │
├─────────────────────────────────────┤
│         Recent Reviews              │
├─────────────────────────────────────┤
│             Footer                  │
└─────────────────────────────────────┘
```

### Tour Listing Page
```
┌─────────────────────────────────────┐
│             Header                  │
├─────────────────────────────────────┤
│   [Search Bar]  [Filters Button]    │
├─────────────────────────────────────┤
│   Sort: [Featured ▼]   12 tours    │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐          │
│  │TourCard │  │TourCard │          │
│  └─────────┘  └─────────┘          │
│  ┌─────────┐  ┌─────────┐          │
│  │TourCard │  │TourCard │          │
│  └─────────┘  └─────────┘          │
├─────────────────────────────────────┤
│        [Load More]                  │
├─────────────────────────────────────┤
│             Footer                  │
└─────────────────────────────────────┘
```

### Tour Detail Page
```
┌─────────────────────────────────────┐
│             Header                  │
├─────────────────────────────────────┤
│                                     │
│        [Image Gallery]              │
│     (Swipeable on mobile)           │
│                                     │
├─────────────────────────────────────┤
│  3 Days Masai Mara Safari           │
│  ⭐ 4.8 (127 reviews)               │
│  📍 Nairobi → Masai Mara            │
├─────────────────────────────────────┤
│  From $450/person    [Book Now]     │
│  (Sticky on mobile)                 │
├─────────────────────────────────────┤
│  [Overview] [Itinerary] [Reviews]   │
├─────────────────────────────────────┤
│         Tab Content                 │
│                                     │
├─────────────────────────────────────┤
│        Agent Profile Card           │
├─────────────────────────────────────┤
│        Similar Tours                │
├─────────────────────────────────────┤
│             Footer                  │
└─────────────────────────────────────┘
```

### Agent Dashboard
```
┌─────────────────────────────────────┐
│  [Logo]  Dashboard  [Profile ▼]     │
├──────────┬──────────────────────────┤
│ Sidebar  │  Welcome back, Safari Co │
│          │                          │
│ Dashboard│  ┌────┐ ┌────┐ ┌────┐   │
│ Tours    │  │$2.4K│ │ 12 │ │ 4.8│   │
│ Bookings │  │Earn │ │Book│ │Rate│   │
│ Messages │  └────┘ └────┘ └────┘   │
│ Earnings │                          │
│ Settings │  Recent Bookings         │
│          │  [Booking] [Booking]     │
│          │                          │
│          │  Quick Actions           │
│          │  [+ New Tour] [Withdraw] │
└──────────┴──────────────────────────┘
```

---

## State Management

### Server State (TanStack Query)

```typescript
// hooks/use-tours.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export function useTours(filters: TourFilters) {
  return useQuery({
    queryKey: ["tours", filters],
    queryFn: () => fetchTours(filters),
  })
}

export function useTour(id: string) {
  return useQuery({
    queryKey: ["tour", id],
    queryFn: () => fetchTour(id),
  })
}

export function useCreateTour() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours"] })
    },
  })
}
```

### Client State (Zustand)

```typescript
// stores/booking-store.ts
import { create } from "zustand"

interface BookingState {
  selectedDate: Date | null
  travelers: number
  step: number
  setDate: (date: Date) => void
  setTravelers: (count: number) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDate: null,
  travelers: 1,
  step: 1,
  setDate: (date) => set({ selectedDate: date }),
  setTravelers: (count) => set({ travelers: count }),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
  reset: () => set({ selectedDate: null, travelers: 1, step: 1 }),
}))
```

---

## Form Handling

### React Hook Form + Zod

```typescript
// components/forms/tour-form.tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { tourCreateSchema } from "@/lib/validations/tour"

export function TourForm() {
  const form = useForm({
    resolver: zodResolver(tourCreateSchema),
    defaultValues: {
      title: "",
      description: "",
      destination: "",
      price: 0,
      duration: 1,
    },
  })

  const onSubmit = async (data: TourFormData) => {
    // Submit logic
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind default breakpoints */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Mobile-First Patterns

```tsx
// Grid that adjusts by screen size
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
</div>

// Hide on mobile, show on desktop
<Sidebar className="hidden lg:block" />

// Show on mobile, hide on desktop
<MobileNav className="lg:hidden" />
```

---

## Performance Optimization

### Image Optimization

```tsx
import Image from "next/image"

<Image
  src={tour.image}
  alt={tour.title}
  width={400}
  height={300}
  className="object-cover"
  placeholder="blur"
  blurDataURL={tour.blurDataURL}
  loading="lazy"
/>
```

### Code Splitting

```tsx
import dynamic from "next/dynamic"

const TourGallery = dynamic(() => import("@/components/tours/tour-gallery"), {
  loading: () => <Skeleton className="h-64 w-full" />,
})
```

### Bundle Analysis

```bash
npm run build
npx @next/bundle-analyzer
```

---

## Page Structure

For a complete breakdown of all pages in the MVP, see **[pages.md](./pages.md)**.

### Page Summary

| Category | Page Count |
|----------|------------|
| Public/Landing | 11 |
| Client Dashboard | 6 |
| Agent Dashboard | 8 |
| Admin Dashboard | 8 |
| **Total** | **33 pages** |

---

## Feature Documentation

| Feature | Document | Status |
|---------|----------|--------|
| **Pages Structure** | [pages.md](./pages.md) | MVP |
| Tour Discovery | [feature-tour-discovery.md](./feature-tour-discovery.md) | MVP |
| Booking Flow | [feature-booking-flow.md](./feature-booking-flow.md) | MVP |
| Agent Dashboard | [feature-agent-dashboard.md](./feature-agent-dashboard.md) | MVP |
| Admin Dashboard | [feature-admin-dashboard.md](./feature-admin-dashboard.md) | MVP |

---

## Testing Strategy

### Component Testing

```bash
npm install -D @testing-library/react @testing-library/jest-dom
```

```typescript
// __tests__/components/tour-card.test.tsx
import { render, screen } from "@testing-library/react"
import { TourCard } from "@/components/tours/tour-card"

describe("TourCard", () => {
  it("renders tour title", () => {
    render(<TourCard tour={mockTour} />)
    expect(screen.getByText("Masai Mara Safari")).toBeInTheDocument()
  })
})
```

### E2E Testing (Phase 2)

```bash
npm install -D playwright
```

---

## Accessibility Checklist

- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigation works
- [ ] Skip links present
- [ ] ARIA labels where needed
- [ ] Heading hierarchy correct
