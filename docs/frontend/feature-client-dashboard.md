# Feature: Client Dashboard Frontend

## Status
- [x] Requirements Approved
- [x] Design Complete
- [x] Implementation Started
- [x] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Implementation Progress

### Completed Features (January 2026)
- [x] Dashboard Home (`/dashboard`) with real data integration
- [x] Dashboard Stats API (`/api/client/dashboard`) - Real stats for total bookings, upcoming trips, completed trips
- [x] My Bookings Page (`/dashboard/bookings`) with filters and search
- [x] Client Bookings API (`/api/client/bookings`) - Full booking history with pagination
- [x] Booking Details with PDF itinerary download
- [x] PDF Itinerary Generation (`/api/bookings/[id]/itinerary`) - Multi-page PDF with:
  - Header with booking reference and dates
  - Trip details and traveler information
  - Day-by-day itinerary with activities
  - Selected accommodations per night
  - Selected add-ons and activities
  - Complete pricing breakdown
- [x] Email Confirmation with PDF attachment on payment completion
- [x] Status badges and filtering by booking status
- [x] Responsive mobile-first design

### Pending Features
- [ ] Messages integration (Phase 2)
- [ ] Wishlist functionality
- [ ] Profile management enhancements

## Overview

The client dashboard provides authenticated users with a personalized view of their bookings, profile management, and quick access to platform features. It follows mobile-first design principles with a clean, intuitive interface.

## User Stories

- As a client, I want to see my upcoming trips at a glance
- As a client, I want to view my complete booking history
- As a client, I want to access booking details and documents
- As a client, I want to manage my profile information
- As a client, I want to see recommended tours based on my history
- As a client, I want to quickly navigate to browse more tours

## Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Dashboard Home | `/dashboard` | Overview with stats and quick actions |
| My Bookings | `/dashboard/bookings` | List of all bookings |
| Booking Details | `/dashboard/bookings/[id]` | Single booking details |
| My Profile | `/dashboard/profile` | Profile management |
| Messages | `/dashboard/messages` | Conversations (Phase 2) |

## Page Specifications

### 1. Dashboard Home (`/dashboard`)

#### Layout
```
Mobile:
+---------------------------+
|  [Logo]  Dashboard  [Av]  |
+---------------------------+
|  Welcome, John!           |
|                           |
|  +-----+ +-----+ +-----+  |
|  | 3   | | 1   | | 2   |  |
|  |Trips| |Soon | |Done |  |
|  +-----+ +-----+ +-----+  |
|                           |
|  NEXT TRIP                |
|  +----------------------+ |
|  | [img] Masai Mara    | |
|  | Aug 15, 2026        | |
|  | 3 days | $450       | |
|  | [View Details]      | |
|  +----------------------+ |
|                           |
|  RECENT BOOKINGS          |
|  [BookingCard]            |
|  [BookingCard]            |
|                           |
|  RECOMMENDED FOR YOU      |
|  [TourCard] [TourCard] -> |
|                           |
+---------------------------+
| [Home] [Book] [Prof] [Nav]|
+---------------------------+
```

#### Components
- `DashboardStats` - Quick stats cards
- `UpcomingTripCard` - Featured next trip
- `BookingCard` - Compact booking summary
- `TourCard` - Recommended tour cards
- `QuickActions` - Action buttons

#### Data Requirements
```typescript
interface DashboardData {
  user: {
    name: string
    image: string | null
  }
  stats: {
    totalBookings: number
    upcomingTrips: number
    completedTrips: number
  }
  nextTrip: Booking | null
  recentBookings: Booking[]
  recommendedTours: Tour[]
}
```

#### API Calls
- `GET /api/client/dashboard` - Dashboard summary with real stats (IMPLEMENTED)
- `GET /api/client/bookings?status=CONFIRMED&limit=3` - Recent bookings (IMPLEMENTED)
- `GET /api/tours/recommended?limit=4` - Recommended tours

#### Implementation Files
- Page: `src/app/(dashboard)/dashboard/page.tsx`
- API: `src/app/api/client/dashboard/route.ts`

---

### 2. My Bookings (`/dashboard/bookings`)

#### Layout
```
+---------------------------+
|  < My Bookings            |
+---------------------------+
|  [All] [Upcoming] [Past]  |
+---------------------------+
|  [Search bookings...]     |
+---------------------------+
|                           |
|  +----------------------+ |
|  | [img]               | |
|  | Masai Mara Safari   | |
|  | Aug 15-18, 2026     | |
|  | [CONFIRMED]  $1,350 | |
|  +----------------------+ |
|                           |
|  +----------------------+ |
|  | [img]               | |
|  | Amboseli Adventure  | |
|  | Sep 22-24, 2026     | |
|  | [PENDING]    $890   | |
|  +----------------------+ |
|                           |
|  [Load More]              |
|                           |
+---------------------------+
```

#### Components
- `StatusTabs` - Filter tabs (All, Upcoming, Completed, Cancelled)
- `SearchInput` - Search bookings
- `BookingListCard` - Booking in list format
- `EmptyState` - No bookings state
- `LoadMoreButton` - Pagination

#### Filters & Sorting
```typescript
interface BookingFilters {
  status: "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  search: string
  sortBy: "date_asc" | "date_desc" | "created_desc"
}
```

#### API Calls
- `GET /api/client/bookings?status=...&search=...&page=...` (IMPLEMENTED)

#### Implementation Files
- Page: `src/app/(dashboard)/dashboard/bookings/page.tsx`
- API: `src/app/api/client/bookings/route.ts`

---

### 3. Booking Details (`/dashboard/bookings/[id]`)

#### Layout
```
+---------------------------+
|  < Booking Details        |
+---------------------------+
|                           |
|  +----------------------+ |
|  |     [CONFIRMED]     | |
|  |  Booking #SP2601-X7 | |
|  +----------------------+ |
|                           |
|  +----------------------+ |
|  | [Tour Image]        | |
|  | Masai Mara Safari   | |
|  | 3 Days / 2 Nights   | |
|  +----------------------+ |
|                           |
|  TRAVEL DETAILS           |
|  Date: Aug 15-18, 2026    |
|  Travelers: 2 Adults      |
|                           |
|  PAYMENT                  |
|  Total Paid: $1,350       |
|  Method: M-Pesa           |
|  Ref: MPESA123456         |
|                           |
|  OPERATOR                 |
|  +----------------------+ |
|  | Safari Adventures    | |
|  | [WhatsApp] [Call]   | |
|  +----------------------+ |
|                           |
|  +----------------------+ |
|  | [Download PDF]      | |
|  | [Cancel Booking]    | |
|  +----------------------+ |
|                           |
+---------------------------+
```

#### Components
- `BookingStatusBanner` - Large status indicator
- `TourSummaryCard` - Tour info card
- `TravelDetailsSection` - Dates, travelers
- `PaymentDetailsSection` - Payment info
- `OperatorCard` - Agent contact info
- `ActionButtons` - PDF download, cancel

#### State Management (Zustand)
```typescript
interface BookingDetailStore {
  booking: BookingDetail | null
  isLoading: boolean
  isCancelling: boolean
  fetchBooking: (id: string) => Promise<void>
  cancelBooking: (reason: string) => Promise<void>
}
```

#### API Calls
- `GET /api/bookings/[id]` - Booking details (IMPLEMENTED)
- `GET /api/bookings/[id]/itinerary` - Download PDF itinerary (IMPLEMENTED)
- `PUT /api/bookings/[id]/status` - Cancel booking

#### Implementation Files
- Page: `src/app/(dashboard)/dashboard/bookings/[id]/page.tsx`
- API: `src/app/api/bookings/[id]/route.ts`
- PDF API: `src/app/api/bookings/[id]/itinerary/route.ts`
- PDF Template: `src/lib/pdf/itinerary-template.tsx`

#### PDF Itinerary Features (IMPLEMENTED)
The PDF itinerary includes:
- SafariPlus branded header
- Booking reference and confirmation status
- Travel dates and duration
- Day-by-day itinerary with:
  - Daily activities and descriptions
  - Meal information (breakfast, lunch, dinner)
  - Location details
- Selected accommodations per night with pricing
- Selected add-ons and activities with pricing
- Complete pricing breakdown (base price, accommodations, add-ons, total)
- Multi-page support with proper pagination

---

### 4. My Profile (`/dashboard/profile`)

#### Layout
```
+---------------------------+
|  < My Profile             |
+---------------------------+
|                           |
|      +--------+           |
|      | [img]  |           |
|      | Change |           |
|      +--------+           |
|                           |
|  PERSONAL INFO            |
|  +----------------------+ |
|  | Full Name           | |
|  | [John Doe         ] | |
|  +----------------------+ |
|  | Email               | |
|  | [john@example.com ] | |
|  +----------------------+ |
|  | Phone               | |
|  | [+254 700 000 000] | |
|  +----------------------+ |
|  | Nationality         | |
|  | [Select country   ] | |
|  +----------------------+ |
|                           |
|  SECURITY                 |
|  [Change Password]        |
|                           |
|  NOTIFICATIONS            |
|  Email [Toggle]           |
|  SMS   [Toggle]           |
|                           |
|  [Save Changes]           |
|                           |
|  [Delete Account]         |
|                           |
+---------------------------+
```

#### Components
- `ProfileImageUpload` - Avatar upload
- `ProfileForm` - Personal info form
- `PasswordChangeDialog` - Password modal
- `NotificationSettings` - Toggle settings
- `DeleteAccountDialog` - Confirmation modal

#### Form Schema (Zod)
```typescript
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Invalid phone number"),
  nationality: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).regex(/\d/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
```

#### API Calls
- `GET /api/users/me` - Current user profile
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/password` - Change password
- `DELETE /api/users/me` - Delete account

---

## Shared Components

### DashboardLayout
```tsx
// components/layout/DashboardLayout.tsx
interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  showBackButton?: boolean
}

export function DashboardLayout({ children, title, showBackButton }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title={title} showBackButton={showBackButton} />
      <main className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  )
}
```

### MobileBottomNav
```tsx
// components/layout/MobileBottomNav.tsx
const clientNavItems = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/tours", icon: Compass, label: "Explore" },
  { href: "/dashboard/bookings", icon: Calendar, label: "Bookings" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t lg:hidden">
      <div className="flex justify-around py-2">
        {clientNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-3 py-2",
              pathname === item.href ? "text-primary" : "text-gray-500"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

### BookingStatusBadge
```tsx
// components/bookings/BookingStatusBadge.tsx
const statusConfig = {
  PENDING: { label: "Pending", variant: "warning", icon: Clock },
  CONFIRMED: { label: "Confirmed", variant: "success", icon: CheckCircle },
  COMPLETED: { label: "Completed", variant: "default", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelled", variant: "destructive", icon: XCircle },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant={config.variant}>
      <config.icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  )
}
```

---

## State Management

### Client Dashboard Store
```typescript
// stores/dashboard-store.ts
import { create } from "zustand"

interface DashboardStore {
  // Stats
  stats: DashboardStats | null
  isLoadingStats: boolean

  // Bookings
  bookings: Booking[]
  isLoadingBookings: boolean
  bookingFilters: BookingFilters

  // Actions
  fetchStats: () => Promise<void>
  fetchBookings: (filters?: BookingFilters) => Promise<void>
  setBookingFilters: (filters: Partial<BookingFilters>) => void
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: null,
  isLoadingStats: false,
  bookings: [],
  isLoadingBookings: false,
  bookingFilters: { status: "ALL", search: "", sortBy: "date_desc" },

  fetchStats: async () => {
    set({ isLoadingStats: true })
    const response = await fetch("/api/dashboard/stats")
    const data = await response.json()
    set({ stats: data.data, isLoadingStats: false })
  },

  fetchBookings: async (filters) => {
    set({ isLoadingBookings: true })
    const currentFilters = filters || get().bookingFilters
    const params = new URLSearchParams(currentFilters as any)
    const response = await fetch(`/api/bookings?${params}`)
    const data = await response.json()
    set({ bookings: data.data, isLoadingBookings: false })
  },

  setBookingFilters: (filters) => {
    const newFilters = { ...get().bookingFilters, ...filters }
    set({ bookingFilters: newFilters })
    get().fetchBookings(newFilters)
  },
}))
```

---

## Data Fetching Patterns

### Server Components (Preferred)
```tsx
// app/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { getDashboardData } from "@/lib/queries/dashboard"

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const data = await getDashboardData(session.user.id)

  return (
    <DashboardLayout title="Dashboard">
      <DashboardStats stats={data.stats} />
      <UpcomingTrip trip={data.nextTrip} />
      <RecentBookings bookings={data.recentBookings} />
      <RecommendedTours tours={data.recommendedTours} />
    </DashboardLayout>
  )
}
```

### Client Components (When Needed)
```tsx
// components/dashboard/RecentBookings.tsx
"use client"

import { useQuery } from "@tanstack/react-query"

export function RecentBookings() {
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", "recent"],
    queryFn: () => fetch("/api/bookings?limit=3").then(r => r.json()),
  })

  if (isLoading) return <BookingsSkeleton />

  return (
    <div className="space-y-4">
      {data.data.map(booking => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  )
}
```

---

## Responsive Design

### Breakpoint Behavior

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| Stats | 3 columns | 3 columns | 4 columns |
| Bookings List | 1 column | 2 columns | 3 columns |
| Bottom Nav | Visible | Visible | Hidden |
| Sidebar | Hidden | Hidden | Visible |

### Tailwind Classes
```tsx
// Stats grid
<div className="grid grid-cols-3 lg:grid-cols-4 gap-4">

// Bookings grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Bottom nav visibility
<nav className="lg:hidden">
```

---

## Loading States

### Skeleton Components
```tsx
// components/skeletons/DashboardSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>

      {/* Upcoming trip skeleton */}
      <Skeleton className="h-40 rounded-lg" />

      {/* Bookings skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
```

---

## Error Handling

### Error Boundaries
```tsx
// app/dashboard/error.tsx
"use client"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

---

## Accessibility

### Requirements
- [ ] All interactive elements focusable
- [ ] Proper heading hierarchy (h1 -> h2 -> h3)
- [ ] Form labels associated with inputs
- [ ] Status badges have aria-labels
- [ ] Loading states announced to screen readers
- [ ] Skip links for navigation

---

## Testing Checklist

- [ ] Dashboard loads with correct stats
- [ ] Bookings list filters work
- [ ] Booking details display correctly
- [ ] Profile form validation
- [ ] Password change flow
- [ ] Booking cancellation flow
- [ ] Empty states display
- [ ] Loading states display
- [ ] Error states display
- [ ] Mobile navigation works
- [ ] Responsive layout correct

## Dependencies

- shadcn/ui components
- TanStack Query
- Zustand
- React Hook Form + Zod
- Lucide Icons

## MVP Phase
Phase 1 - Core MVP

## Estimated Effort
8 story points

## Approval
- [ ] User Approved
- Date:
- Notes:
