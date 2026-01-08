# Feature: Agent Dashboard Frontend

## Status
- [x] Requirements Approved
- [x] Design Complete
- [x] Implementation Started
- [x] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Implementation Progress

### Completed Features (Sprint 3-4)
- [x] Agent Dashboard Layout with Sidebar Navigation
- [x] Dashboard Home (`/agent`) with stats cards
- [x] Tour Management List (`/agent/tours`) with status tabs and search
- [x] Tour Creation Wizard (`/agent/tours/new`) - 7 steps:
  1. Details (with rich text editor, custom tour types, guest pricing)
  2. Features (tour types, seasons, highlights, included/excluded)
  3. Stays (define accommodation options pool)
  4. Add-ons (define activity add-ons pool)
  5. Itinerary (day-by-day planning referencing stays & add-ons)
  6. Images (cover image and gallery)
  7. Review (summary before creation)
- [x] Tour Edit Page (`/agent/tours/[id]/edit`) - 7 tabs matching creation wizard
- [x] Rich Text Editor Component (Tiptap) for descriptions
- [x] Custom Tour Types (add beyond predefined list)
- [x] Enhanced Itinerary Builder:
  - Day-by-day planning with meals, activities, location
  - Select available accommodations per night from defined stays
  - Set default accommodation (auto-selects first, agent can change)
  - Link add-ons to specific days (e.g., hot air balloon on day 2)
  - Enables client customization during booking
- [x] Accommodation Management (CRUD with tiers, pricing, amenities)
- [x] Activity Add-ons Management (CRUD with day availability)
- [x] Guest Pricing (adult, child, infant, single supplement)
- [x] Delete Confirmation Modals (AlertDialog for stays and add-ons)

### Completed Features (January 2026 - Dashboard & Bookings)
- [x] Agent Dashboard with Real Data (`/agent/dashboard`)
  - Page: `src/app/(agent)/agent/dashboard/page.tsx`
  - API: `src/app/api/agent/bookings/route.ts`
  - Real revenue metrics and statistics
  - Booking count (today, this week, this month, pending)
  - Tour performance overview
  - Recent bookings list with quick actions
- [x] Agent Bookings Management (`/agent/bookings`)
  - Page: `src/app/(agent)/agent/bookings/page.tsx`
  - Full booking list with search functionality
  - Filter by status (All, Pending, Confirmed, Completed, Cancelled)
  - Booking details view with client information
  - Status update capabilities
  - Pagination support
- [x] Agent Bookings API (`/api/agent/bookings`)
  - List all bookings for agent's tours
  - Filter and search support
  - Booking statistics aggregation

### Pending Features
- [ ] Earnings Dashboard (`/agent/earnings`)
- [ ] Withdrawal Requests
- [ ] Messages (Phase 2)
- [ ] Agent Profile Management (`/agent/profile`)

## Overview

The agent dashboard provides tour operators with comprehensive tools to manage their business on SafariPlus. It includes tour management, booking tracking, earnings overview, and communication features.

## User Stories

- As an agent, I want to see my business performance at a glance
- As an agent, I want to create and manage tour listings
- As an agent, I want to track and manage bookings
- As an agent, I want to view my earnings and request withdrawals
- As an agent, I want to communicate with clients
- As an agent, I want to manage my business profile

## Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Dashboard Home | `/agent` | Overview with stats and quick actions |
| My Tours | `/agent/tours` | List of all tours |
| Create Tour | `/agent/tours/create` | Multi-step tour creation |
| Edit Tour | `/agent/tours/[id]/edit` | Edit existing tour |
| My Packages | `/agent/packages` | Package templates (Phase 2) |
| Bookings | `/agent/bookings` | All bookings list |
| Booking Details | `/agent/bookings/[id]` | Single booking management |
| Earnings | `/agent/earnings` | Earnings and withdrawals |
| Messages | `/agent/messages` | Client conversations (Phase 2) |
| Profile | `/agent/profile` | Business profile management |

## Page Specifications

### 1. Agent Dashboard Home (`/agent/dashboard`) - IMPLEMENTED

#### Implementation Files
- Page: `src/app/(agent)/agent/dashboard/page.tsx`
- API: `src/app/api/agent/bookings/route.ts` (provides stats)

#### Layout
```
Desktop:
+----------------------------------------------------------+
|  [Logo]  Dashboard                 [Messages] [Profile]   |
+----------+-----------------------------------------------+
| Sidebar  |  Welcome back, Safari Adventures!             |
|          |                                               |
| Dashboard|  +--------+ +--------+ +--------+ +--------+  |
| Tours    |  | $4,250 | |   12   | |   3    | |  4.8   |  |
| Bookings |  |Earnings| |Bookings| |Pending | |Rating  |  |
| Earnings |  +--------+ +--------+ +--------+ +--------+  |
| Messages |                                               |
| Profile  |  +-------------------------------------------+|
|          |  |    EARNINGS CHART (6 months)              ||
|          |  |    [Chart visualization]                  ||
|          |  +-------------------------------------------+|
|          |                                               |
|          |  RECENT BOOKINGS               [View All >]   |
|          |  +----------------+ +----------------+        |
|          |  | John D.        | | Sarah M.       |        |
|          |  | Masai Mara     | | Amboseli       |        |
|          |  | Aug 15  $450   | | Aug 22  $890   |        |
|          |  +----------------+ +----------------+        |
|          |                                               |
|          |  QUICK ACTIONS                                |
|          |  [+ New Tour]  [Request Withdrawal]           |
+----------+-----------------------------------------------+
```

#### Components
- `AgentSidebar` - Navigation sidebar
- `StatsCard` - Metric display cards
- `EarningsChart` - Revenue trend chart
- `RecentBookingsTable` - Compact booking list
- `QuickActionButtons` - Primary CTAs

#### Data Requirements
```typescript
interface AgentDashboardData {
  agent: {
    businessName: string
    status: AgentStatus
    commissionRate: number
  }
  stats: {
    thisMonthEarnings: number
    thisMonthBookings: number
    pendingBookings: number
    averageRating: number
    totalTours: number
  }
  earnings: {
    availableBalance: number
    pendingBalance: number
  }
  recentBookings: Booking[]
  monthlyEarnings: {
    month: string
    amount: number
  }[]
}
```

---

### 2. My Tours (`/agent/tours`)

#### Layout
```
+----------------------------------------------------------+
|  My Tours                            [+ Create New Tour]  |
+----------------------------------------------------------+
|  [All] [Published] [Draft] [Archived]                     |
+----------------------------------------------------------+
|  [Search tours...]                                        |
+----------------------------------------------------------+
|                                                           |
|  +------------------------------------------------------+|
|  | [img] | 3 Days Masai Mara Safari                     ||
|  |       | Published | $450/person | 12 bookings        ||
|  |       | Views: 1,234 | Rating: 4.8                   ||
|  |       |              [Edit] [View] [More v]          ||
|  +------------------------------------------------------+|
|                                                           |
|  +------------------------------------------------------+|
|  | [img] | Amboseli Elephant Safari                     ||
|  |       | Draft | $890/person | 0 bookings             ||
|  |       |              [Edit] [Publish] [More v]       ||
|  +------------------------------------------------------+|
|                                                           |
+----------------------------------------------------------+
```

#### Components
- `TourManagementCard` - Tour in list format
- `StatusTabs` - Filter by status
- `TourActions` - Edit, view, duplicate, delete
- `EmptyState` - No tours state

#### Actions Menu
```typescript
const tourActions = [
  { label: "Edit", action: "edit", icon: Edit },
  { label: "View Live", action: "view", icon: ExternalLink },
  { label: "Duplicate", action: "duplicate", icon: Copy },
  { label: "Unpublish", action: "unpublish", icon: EyeOff, show: "PUBLISHED" },
  { label: "Publish", action: "publish", icon: Eye, show: "DRAFT" },
  { label: "Delete", action: "delete", icon: Trash, variant: "destructive" },
]
```

---

### 3. Create Tour (`/agent/tours/create`)

#### Multi-Step Wizard
```
Step 1: Basic Details
+----------------------------------------------------------+
|  Create New Tour                              Step 1 of 5 |
+----------------------------------------------------------+
|  [====---------------] 20% complete                       |
+----------------------------------------------------------+
|                                                           |
|  Tour Title *                                             |
|  [3 Days Masai Mara Safari                            ]   |
|                                                           |
|  Short Description                                        |
|  [Experience the magic of the Masai Mara...          ]   |
|                                                           |
|  Full Description *                                       |
|  +------------------------------------------------------+|
|  | [Bold] [Italic] [List]                               ||
|  |                                                       ||
|  | Detailed tour description...                         ||
|  +------------------------------------------------------+|
|                                                           |
|  Destination *                                            |
|  [Masai Mara                                         v]   |
|                                                           |
|  Duration *                                               |
|  [3] Days  [2] Nights                                     |
|                                                           |
|                                   [Cancel] [Next Step >]  |
+----------------------------------------------------------+

Step 2: Itinerary
+----------------------------------------------------------+
|  +------------------------------------------------------+|
|  | DAY 1: Arrival and First Game Drive                  ||
|  | Location: [Masai Mara              ]                 ||
|  | Description:                                          ||
|  | [Morning departure from Nairobi, arrive by lunch...] ||
|  | Activities:                                           ||
|  | [+ Add Activity]                                     ||
|  | - Afternoon game drive                               ||
|  | - Sunset photography                                 ||
|  +------------------------------------------------------+|
|  [+ Add Day]                                              |
|                                                           |
|                                   [< Back] [Next Step >]  |
+----------------------------------------------------------+

Step 3: Photos
+----------------------------------------------------------+
|  Tour Photos                                              |
+----------------------------------------------------------+
|  +------------------------------------------------------+|
|  |                                                       ||
|  |     Drag and drop images here                        ||
|  |     or click to upload                               ||
|  |                                                       ||
|  |     Max 10 images, 5MB each                          ||
|  +------------------------------------------------------+|
|                                                           |
|  Uploaded (3/10):                                         |
|  +--------+ +--------+ +--------+                        |
|  | [img1] | | [img2] | | [img3] |                        |
|  | Cover  | |   2    | |   3    |                        |
|  +--------+ +--------+ +--------+                        |
|  (Drag to reorder)                                        |
|                                                           |
+----------------------------------------------------------+

Step 4: Pricing
+----------------------------------------------------------+
|  Base Price per Person *                                  |
|  $[450                ]                                   |
|                                                           |
|  Group Size                                               |
|  Min: [2]  Max: [8] travelers                             |
|                                                           |
|  What's Included                                          |
|  [+ Add Item]                                             |
|  [x] Transport in 4x4 safari vehicle                     |
|  [x] Park entrance fees                                   |
|  [x] Accommodation (2 nights)                             |
|  [x] All meals                                            |
|                                                           |
|  What's Excluded                                          |
|  [+ Add Item]                                             |
|  [x] Flights to/from Nairobi                              |
|  [x] Tips and gratuities                                  |
|  [x] Travel insurance                                     |
+----------------------------------------------------------+

Step 5: Review & Publish
+----------------------------------------------------------+
|  Review Your Tour                                         |
+----------------------------------------------------------+
|  +------------------------------------------------------+|
|  |  [PREVIEW]                                           ||
|  |  Full tour preview as clients will see it            ||
|  +------------------------------------------------------+|
|                                                           |
|  Pre-publish Checklist:                                   |
|  [x] Title and description complete                       |
|  [x] Itinerary added (3 days)                             |
|  [x] At least 3 photos uploaded                           |
|  [x] Pricing configured                                   |
|  [ ] Available dates set (optional)                       |
|                                                           |
|  [Save as Draft]              [Publish Tour]             |
+----------------------------------------------------------+
```

#### Form State Management
```typescript
// stores/tour-form-store.ts
interface TourFormStore {
  step: number
  formData: Partial<TourFormData>
  isDirty: boolean

  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Data
  updateFormData: (data: Partial<TourFormData>) => void
  resetForm: () => void

  // Actions
  saveDraft: () => Promise<void>
  publish: () => Promise<void>
}

interface TourFormData {
  // Step 1
  title: string
  shortDescription: string
  description: string
  destination: string
  duration: number
  durationNights: number

  // Step 2
  itinerary: {
    day: number
    title: string
    location: string
    description: string
    activities: string[]
    meals: { breakfast: boolean; lunch: boolean; dinner: boolean }
  }[]

  // Step 3
  images: {
    file: File
    url: string
    isPrimary: boolean
    order: number
  }[]

  // Step 4
  price: number
  currency: string
  minGroupSize: number
  maxGroupSize: number
  priceIncludes: string[]
  priceExcludes: string[]
}
```

---

### 4. Bookings Management (`/agent/bookings`) - IMPLEMENTED

#### Implementation Files
- Page: `src/app/(agent)/agent/bookings/page.tsx`
- API: `src/app/api/agent/bookings/route.ts`

#### Layout
```
+----------------------------------------------------------+
|  Bookings                                                 |
+----------------------------------------------------------+
|  +--------+ +--------+ +--------+ +--------+             |
|  |   3    | |   12   | |   45   | |   8    |             |
|  | Today  | | Week   | | Month  | |Pending |             |
|  +--------+ +--------+ +--------+ +--------+             |
+----------------------------------------------------------+
|  Filters:                                                 |
|  Status: [All v]  Tour: [All v]  Date: [All Time v]      |
+----------------------------------------------------------+
|                                                           |
|  Ref        | Client      | Tour          | Date   | $   |
|  -----------|-------------|---------------|--------|-----|
|  SP2601-X7  | John Doe    | Masai Mara    | Aug 15 | 450 |
|             | CONFIRMED   | 2 travelers   |        |     |
|  -----------|-------------|---------------|--------|-----|
|  SP2601-Y3  | Sarah M.    | Amboseli      | Aug 22 | 890 |
|             | PENDING     | 3 travelers   |        |     |
|                                                           |
|  [< Prev]                              [Next >]           |
+----------------------------------------------------------+
```

#### Components (IMPLEMENTED)
- `BookingStatsBar` - Quick stats showing today/week/month/pending counts
- `BookingFilters` - Filter by status with search input
- `BookingTable` - Data table with booking details
- `BookingDetailSheet` - Expandable booking details
- `StatusBadge` - Visual status indicators

#### API Features (IMPLEMENTED)
```typescript
// GET /api/agent/bookings
// Query parameters:
// - status: filter by booking status
// - search: search by booking number, client name, tour title
// - page: pagination
// - limit: items per page

// Response includes:
// - bookings: array of booking objects with tour and client details
// - stats: { today, thisWeek, thisMonth, pending }
// - pagination: { page, limit, total, totalPages }
```

---

### 5. Earnings (`/agent/earnings`)

#### Layout
```
+----------------------------------------------------------+
|  Earnings                                                 |
+----------------------------------------------------------+
|  +-------------------+  +-------------------+             |
|  |     $4,250.00     |  |     $1,200.00     |             |
|  | Available Balance |  | Pending Balance   |             |
|  | [Request Withdraw]|  | (7 days to clear) |             |
|  +-------------------+  +-------------------+             |
+----------------------------------------------------------+
|                                                           |
|  Commission Rate: 12% (Premium Tier)                      |
|                                                           |
|  +------------------------------------------------------+|
|  |    MONTHLY EARNINGS                                  ||
|  |    [Bar Chart - Last 6 months]                       ||
|  +------------------------------------------------------+|
|                                                           |
|  RECENT TRANSACTIONS                                      |
|  Date       | Booking    | Gross    | Comm   | Net       |
|  -----------|------------|----------|--------|-----------|
|  Aug 10     | SP2601-X7  | $450     | -$54   | $396      |
|  Aug 8      | SP2601-Y2  | $890     | -$107  | $783      |
|                                                           |
|  WITHDRAWAL HISTORY                                       |
|  Date       | Amount     | Method   | Status            |
|  -----------|------------|----------|-------------------|
|  Aug 5      | $2,000     | M-Pesa   | COMPLETED         |
|  Jul 20     | $1,500     | Bank     | COMPLETED         |
+----------------------------------------------------------+
```

#### Withdrawal Modal
```
+------------------------------------------+
|  Request Withdrawal                   X  |
+------------------------------------------+
|                                          |
|  Available Balance: $4,250.00            |
|                                          |
|  Amount to Withdraw *                    |
|  $[                                   ]  |
|  Min: $50  Max: $4,250                   |
|                                          |
|  Payment Method *                        |
|  ( ) M-Pesa                              |
|      Phone: +254 700 000 000             |
|                                          |
|  (o) Bank Transfer                       |
|      Bank: Kenya Commercial Bank         |
|      Account: ****4567                   |
|                                          |
|  Processing time: 3 business days        |
|                                          |
|  [Cancel]          [Request Withdrawal]  |
+------------------------------------------+
```

---

### 6. Agent Profile (`/agent/profile`)

#### Layout
```
+----------------------------------------------------------+
|  Business Profile                                         |
+----------------------------------------------------------+
|  Profile Completion: [========--------] 75%               |
+----------------------------------------------------------+
|                                                           |
|  BUSINESS INFORMATION                                     |
|  +------------------------------------------------------+|
|  | Business Logo                                        ||
|  | [Upload Logo]                                        ||
|  |                                                       ||
|  | Business Name *                                       ||
|  | [Safari Adventures Kenya                         ]   ||
|  |                                                       ||
|  | Registration Number                                   ||
|  | [KE-2024-TOUR-1234                              ]    ||
|  |                                                       ||
|  | Description                                           ||
|  | [Your trusted safari partner since 2010...       ]   ||
|  +------------------------------------------------------+|
|                                                           |
|  CONTACT INFORMATION                                      |
|  +------------------------------------------------------+|
|  | Email: [contact@safariadventures.co.ke          ]    ||
|  | Phone: [+254 700 000 000                        ]    ||
|  | WhatsApp: [+254 700 000 000                     ]    ||
|  | Website: [https://safariadventures.co.ke        ]    ||
|  +------------------------------------------------------+|
|                                                           |
|  PAYMENT DETAILS                                          |
|  +------------------------------------------------------+|
|  | Preferred Method: [M-Pesa v]                         ||
|  | M-Pesa Number: [+254 700 000 000                ]    ||
|  |                                                       ||
|  | Bank Details (Optional)                               ||
|  | Bank: [Kenya Commercial Bank                    ]    ||
|  | Account: [1234567890                            ]    ||
|  +------------------------------------------------------+|
|                                                           |
|  [Save Changes]                                           |
+----------------------------------------------------------+
```

---

## Shared Components

### AgentLayout
```tsx
// components/layout/AgentLayout.tsx
export function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgentHeader />
      <div className="flex">
        <AgentSidebar className="hidden lg:block" />
        <main className="flex-1 p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <AgentMobileNav className="lg:hidden" />
    </div>
  )
}
```

### AgentSidebar
```tsx
// components/layout/AgentSidebar.tsx
const sidebarItems = [
  { href: "/agent", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/agent/tours", icon: Map, label: "Tours" },
  { href: "/agent/packages", icon: Package, label: "Packages", badge: "New" },
  { href: "/agent/bookings", icon: Calendar, label: "Bookings" },
  { href: "/agent/earnings", icon: DollarSign, label: "Earnings" },
  { href: "/agent/messages", icon: MessageSquare, label: "Messages" },
  { href: "/agent/profile", icon: Settings, label: "Profile" },
]
```

### EarningsChart
```tsx
// components/agent/EarningsChart.tsx
"use client"

import { Bar } from "recharts"

export function EarningsChart({ data }: { data: MonthlyEarning[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip formatter={(value) => [`$${value}`, "Earnings"]} />
        <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

---

## State Management

### Agent Store
```typescript
// stores/agent-store.ts
interface AgentStore {
  // Profile
  profile: AgentProfile | null
  isLoadingProfile: boolean

  // Tours
  tours: Tour[]
  isLoadingTours: boolean
  tourFilters: TourFilters

  // Bookings
  bookings: Booking[]
  isLoadingBookings: boolean
  bookingFilters: BookingFilters

  // Earnings
  earnings: EarningsData | null
  isLoadingEarnings: boolean

  // Actions
  fetchProfile: () => Promise<void>
  fetchTours: (filters?: TourFilters) => Promise<void>
  fetchBookings: (filters?: BookingFilters) => Promise<void>
  fetchEarnings: (period?: string) => Promise<void>

  // Tour actions
  publishTour: (id: string) => Promise<void>
  unpublishTour: (id: string) => Promise<void>
  deleteTour: (id: string) => Promise<void>

  // Booking actions
  updateBookingStatus: (id: string, status: string) => Promise<void>

  // Withdrawal
  requestWithdrawal: (data: WithdrawalRequest) => Promise<void>
}
```

---

## Real-Time Features

### Booking Notifications
```tsx
// hooks/use-agent-notifications.ts
export function useAgentNotifications() {
  const { agent } = useAgentStore()

  useEffect(() => {
    if (!agent) return

    const pusher = getPusherClient()
    const channel = pusher.subscribe(`private-agent-${agent.id}`)

    channel.bind("new-booking", (booking: Booking) => {
      toast({
        title: "New Booking!",
        description: `${booking.client.name} booked ${booking.tour.title}`,
      })
      // Refresh bookings
      useAgentStore.getState().fetchBookings()
    })

    channel.bind("booking-cancelled", (booking: Booking) => {
      toast({
        title: "Booking Cancelled",
        description: `Booking ${booking.bookingNumber} was cancelled`,
        variant: "destructive",
      })
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`private-agent-${agent.id}`)
    }
  }, [agent])
}
```

---

## Form Validation

### Tour Form Schemas
```typescript
// lib/validations/tour-form.ts
export const step1Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  shortDescription: z.string().max(300).optional(),
  description: z.string().min(100, "Description must be at least 100 characters"),
  destination: z.string().min(2, "Please select a destination"),
  duration: z.number().min(1).max(30),
  durationNights: z.number().min(0),
})

export const step2Schema = z.object({
  itinerary: z.array(z.object({
    day: z.number(),
    title: z.string().min(3),
    location: z.string().min(2),
    description: z.string().min(20),
    activities: z.array(z.string()),
    meals: z.object({
      breakfast: z.boolean(),
      lunch: z.boolean(),
      dinner: z.boolean(),
    }),
  })).min(1, "Add at least one day to the itinerary"),
})

export const step3Schema = z.object({
  images: z.array(z.object({
    url: z.string().url(),
    isPrimary: z.boolean(),
    order: z.number(),
  })).min(3, "Upload at least 3 images"),
})

export const step4Schema = z.object({
  price: z.number().positive("Price must be positive"),
  currency: z.enum(["USD", "KES"]),
  minGroupSize: z.number().min(1),
  maxGroupSize: z.number().min(1),
  priceIncludes: z.array(z.string()).min(1),
  priceExcludes: z.array(z.string()),
})
```

---

## Testing Checklist

- [ ] Dashboard loads with correct agent data
- [ ] Tour creation wizard works end-to-end
- [ ] Tour editing saves changes
- [ ] Tour publish/unpublish works
- [ ] Bookings list filters work
- [ ] Booking status updates work
- [ ] Earnings display correctly
- [ ] Withdrawal request flow works
- [ ] Profile form saves correctly
- [ ] Image upload works
- [ ] Real-time notifications work
- [ ] Mobile navigation works

## Dependencies

- shadcn/ui components
- TanStack Query
- Zustand
- React Hook Form + Zod
- Recharts (charts)
- Pusher (real-time)
- Cloudinary (images)

## MVP Phase
Phase 1 - Core MVP

## Estimated Effort
13 story points

## Approval
- [ ] User Approved
- Date:
- Notes:
