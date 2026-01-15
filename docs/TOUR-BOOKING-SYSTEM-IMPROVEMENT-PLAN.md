# SafariPlus Tour Package Builder & Booking System
## Comprehensive Improvement Plan

**Version**: 2.0
**Created**: January 2026
**Status**: Planning Phase
**Priority**: High

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Problems Identified](#problems-identified)
4. [Industry Best Practices](#industry-best-practices)
5. [Proposed Solution](#proposed-solution)
6. [Implementation Phases](#implementation-phases)
7. [Technical Specifications](#technical-specifications)
8. [Database Changes](#database-changes)
9. [UI/UX Design](#uiux-design)
10. [Testing Plan](#testing-plan)
11. [Pages Affected](#pages-affected)
12. [Success Metrics](#success-metrics)

---

## Executive Summary

This document outlines a comprehensive plan to transform SafariPlus's tour package builder and booking system into a **robust, simple, yet powerful** platform that competes with industry leaders like Viator, GetYourGuide, and specialized safari platforms.

### Key Objectives

1. **Simplify Tour Creation** - Break monolithic wizard into modular components
2. **Enhance Customization** - Add vehicle selection, better add-on system
3. **Streamline Booking** - Single unified checkout flow
4. **Reduce Abandonment** - Industry average is 82%, target <50%
5. **Mobile-First Design** - 70%+ of travel bookings are mobile

### Expected Outcomes

- 35% increase in booking completion rate
- 50% reduction in tour creation time for agents
- <200ms pricing calculation response time
- Mobile-optimized experience on all screens

---

## Current State Analysis

### A. Tour Creation Flow (Agent Side)

**Current Implementation:**
- **File**: `/src/app/(agent)/agent/tours/new/page.tsx` (2,141 lines)
- **Pattern**: 7-step wizard (Details → Features → Stays → Add-ons → Itinerary → Images → Review)

**Architecture:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    TOUR CREATION WIZARD                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Step 1 │→│  Step 2 │→│  Step 3 │→│  Step 4 │→│  Step 5 │→...│
│  │ Details │ │Features │ │  Stays  │ │ Add-ons │ │Itinerary│   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                  │
│  State: useState (single component)                              │
│  Validation: Per-step, client-side                               │
│  Persistence: None until final submit                            │
└─────────────────────────────────────────────────────────────────┘
```

**Current Files:**
| File | Purpose | Lines |
|------|---------|-------|
| `/src/app/(agent)/agent/tours/new/page.tsx` | Tour creation wizard | 2,141 |
| `/src/app/(agent)/agent/tours/[id]/edit/page.tsx` | Tour editing | ~2,500 |
| `/src/app/(agent)/agent/tours/page.tsx` | Tour list/management | 350 |
| `/src/components/tours/tour-customizer.tsx` | Booking customizer | 307 |
| `/src/components/tours/interactive-itinerary.tsx` | Day-by-day display | 327 |
| `/src/components/tours/booking-card.tsx` | Booking sidebar card | 452 |

### B. Booking Flow (Customer Side)

**Current Implementation:**
- TWO separate checkout flows exist
- URL parameters carry booking state (prone to tampering)
- Traveler details entered twice in some flows

**Current Flow:**
```
Tour Detail Page (/tours/[slug])
    ↓
Tour Customizer (Sidebar)
    - Select dates
    - Select guests
    - Select accommodations
    - Toggle add-ons
    ↓
[Book Now Button]
    ↓
Checkout Page (/booking/checkout?params...)  ← Flow 1
    OR
Checkout Page (/checkout/[bookingId])        ← Flow 2
    ↓
Payment Page (/booking/payment/[id])
    ↓
Confirmation (/booking/confirmation/[id])
```

### C. Data Model Overview

**Current Prisma Schema:**
```prisma
Tour {
  id, title, slug, description
  basePrice, currency
  durationDays, durationNights
  maxGroupSize

  itinerary          Itinerary[]
  accommodationOptions AccommodationOption[]
  activityAddons     ActivityAddon[]
}

Itinerary {
  dayNumber, title, description
  meals (JSON), activities (JSON)
  availableAccommodationIds (JSON)  ← Problem: No FK
  defaultAccommodationId (String)
  availableAddonIds (JSON)          ← Problem: No FK
}

AccommodationOption {
  tier (BUDGET/MID_RANGE/LUXURY/ULTRA_LUXURY)
  pricePerNight
  amenities (JSON)
}

ActivityAddon {
  price (per person)
  dayAvailable (JSON)
}
```

---

## Problems Identified

### Critical Issues

| ID | Problem | Impact | Severity |
|----|---------|--------|----------|
| P1 | **Monolithic Tour Creation** | 2,141 lines in one file, hard to maintain | High |
| P2 | **Two Checkout Flows** | Inconsistent UX, duplicate code | High |
| P3 | **JSON Array References** | No referential integrity, orphaned data | High |
| P4 | **No Vehicle Selection** | Missing key safari feature | High |
| P5 | **Hardcoded Pricing** | 70% child discount, 5% fee locked | Medium |
| P6 | **URL Parameter State** | Security risk, lost on refresh | Medium |
| P7 | **No Availability Lock** | Race conditions, double bookings | Medium |
| P8 | **Double Data Entry** | Traveler details entered twice | Medium |

### Detailed Problem Analysis

#### P1: Monolithic Tour Creation
```
Current: Single 2,141-line file
- Hard to test individual steps
- Team cannot work in parallel
- Bug in one step affects entire wizard
- No code reuse between create/edit
```

#### P2: Two Checkout Flows
```
Flow 1: /booking/checkout?tourId=...&startDate=...&adults=...
        - Creates booking inline
        - Uses URL params for state
        - Different traveler form

Flow 2: /checkout/[bookingId]
        - Fetches existing booking
        - Different UI components
        - Separate code path
```

#### P3: JSON Array References
```javascript
// Current: Itinerary stores accommodation IDs as JSON
itinerary.availableAccommodationIds = '["acc1", "acc2"]'

// Problem: If accommodation deleted, reference becomes orphan
// No database constraint prevents this
```

#### P4: No Vehicle Selection
```
Safari industry standard:
- Budget: Safari van (6-9 passengers, $160-200/day)
- Standard: Land Cruiser (4-6 passengers, $250-350/day)
- Luxury: Extended Land Cruiser with champagne bar
- Ultra-Luxury: Custom built overland trucks

Currently missing from SafariPlus!
```

#### P5: Hardcoded Pricing
```typescript
// tour-customizer.tsx line 149
const childTotal = tour.basePrice * 0.7 * bookingState.children

// bookings/route.ts
const serviceFee = Math.round(subtotal * 0.05)

// Should be configurable per tour/platform
```

---

## Industry Best Practices

### Research Sources

Based on analysis of leading platforms:
- [Viator](https://www.viator.com/) - Clean interface, robust filters
- [GetYourGuide](https://www.getyourguide.com/) - Quality over quantity, excellent mobile app
- [Safari Portal](https://www.safariportal.app) - Itinerary builder for tour operators
- [WeTravel](https://product.wetravel.com/itinerary-builder) - Trip planning software

### Key Findings

#### 1. Booking Flow Best Practices

| Platform | Key Feature | Why It Works |
|----------|-------------|--------------|
| **Viator** | 3-step checkout | Reduces cognitive load |
| **GetYourGuide** | Charge 2 days before | Reduces abandonment |
| **Booking.com** | Progress indicator | Users know what's next |
| **Airbnb** | Instant booking | No back-and-forth |

#### 2. Cart Abandonment Statistics

- **82%** average cart abandonment in travel industry
- **53%** abandon when shown unexpected final price
- **32%** abandon due to slow mobile load times
- **10%** lost for every unnecessary form field

*Sources: [Baymard Institute](https://baymard.com), [SalesCycle](https://www.salecycle.com), [TrekkSoft](https://www.trekksoft.com/en/blog/reduce-cart-abandonment)*

#### 3. What Reduces Abandonment

- **Clear pricing** from the start (no surprises)
- **Progress indicators** showing steps remaining
- **Guest checkout** option (don't force registration)
- **Multiple payment options** (M-Pesa, Card, Bank)
- **Save cart** for later
- **Exit intent offers** (discount to complete)

#### 4. Tour Builder Best Practices

From [Tesla Configurator](https://www.tesla.com/model3/design) and [Nike By You](https://www.nike.com/nike-by-you):

- **Visual-first**: Show changes immediately
- **Guided journey**: Step-by-step progression
- **Transparent pricing**: Always show running total
- **Save & share**: Users can save and share configurations

---

## Proposed Solution

### Vision: "Safari Made Simple"

A unified, powerful system where:
1. **Agents** build tours with visual drag-and-drop
2. **Customers** customize packages like building a car on Tesla's site
3. **Booking** completes in 3 clicks with real-time pricing

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                      NEW ARCHITECTURE                                │
│                                                                      │
│  AGENT SIDE                         CUSTOMER SIDE                    │
│  ┌─────────────────────┐           ┌─────────────────────┐          │
│  │  Modular Tour       │           │  Visual Package     │          │
│  │  Builder            │           │  Configurator       │          │
│  │  - Step components  │           │  - Tesla-like UI    │          │
│  │  - Auto-save        │           │  - Real-time price  │          │
│  │  - Preview mode     │           │  - Save & share     │          │
│  └─────────────────────┘           └─────────────────────┘          │
│           ↓                                 ↓                        │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │                   UNIFIED DATA LAYER                     │        │
│  │  - Proper FK relationships                               │        │
│  │  - Real-time availability                                │        │
│  │  - Configurable pricing engine                           │        │
│  └─────────────────────────────────────────────────────────┘        │
│           ↓                                 ↓                        │
│  ┌─────────────────────────────────────────────────────────┐        │
│  │                  STREAMLINED CHECKOUT                    │        │
│  │  - Single page checkout                                  │        │
│  │  - Server-side session (no URL params)                   │        │
│  │  - 15-minute availability hold                           │        │
│  │  - One-click payment                                     │        │
│  └─────────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

### New Features

#### 1. Vehicle Selection System

```typescript
// New Vehicle model
model Vehicle {
  id            String   @id @default(cuid())
  tourId        String
  type          VehicleType
  name          String   // "Toyota Land Cruiser Extended"
  description   String?
  capacity      Int      // Max passengers
  pricePerDay   Float
  pricePerPerson Float?  // Alternative pricing
  features      String   @default("[]") // JSON: ["Pop-up roof", "Fridge", "Charging ports"]
  images        String   @default("[]")
  isDefault     Boolean  @default(false)

  tour          Tour     @relation(fields: [tourId], references: [id], onDelete: Cascade)
  bookings      BookingVehicle[]

  @@index([tourId])
}

enum VehicleType {
  SAFARI_VAN        // Budget: Toyota Hiace, 6-9 pax
  LAND_CRUISER      // Standard: 4x4, 4-6 pax
  EXTENDED_CRUISER  // Premium: Extended with extras
  OVERLAND_TRUCK    // Group: 12+ passengers
  PRIVATE_VEHICLE   // Luxury: Personal vehicle
}
```

#### 2. Enhanced Add-on System

```typescript
// Two types: Daily activities vs Package-wide add-ons
enum AddonType {
  DAILY     // Available on specific days (hot air balloon)
  PACKAGE   // Entire trip (photo package, travel insurance)
  TRANSFER  // Airport transfers, inter-city
}

model ActivityAddon {
  id           String    @id @default(cuid())
  tourId       String
  type         AddonType @default(DAILY)
  category     AddonCategory
  name         String
  description  String?
  price        Float
  pricingModel PricingModel @default(PER_PERSON)
  dayAvailable String    @default("[]") // Only for DAILY type
  duration     String?
  minAge       Int?      // Age restrictions
  maxCapacity  Int?
  images       String    @default("[]")
  isPopular    Boolean   @default(false)
  sortOrder    Int       @default(0)

  tour         Tour      @relation(...)
}

enum AddonCategory {
  ADVENTURE    // Hot air balloon, bungee
  WILDLIFE     // Extra game drives, walking safari
  CULTURAL     // Village visits, cooking class
  DINING       // Bush dinner, sundowner
  WELLNESS     // Spa, yoga session
  PHOTOGRAPHY  // Photo safari, drone footage
  TRANSFER     // Airport pickup, helicopter
  INSURANCE    // Travel insurance
}
```

#### 3. Configurable Pricing

```typescript
// Tour-level pricing configuration
model TourPricing {
  id                   String @id @default(cuid())
  tourId               String @unique

  // Child/Infant pricing
  childDiscountPercent Int    @default(30)  // 30% off = 70% of adult
  infantDiscountPercent Int   @default(100) // 100% off = free
  childMinAge          Int    @default(3)
  childMaxAge          Int    @default(11)
  infantMaxAge         Int    @default(2)

  // Fees
  serviceFeePercent    Float  @default(5.0)

  // Deposit settings
  depositEnabled       Boolean @default(false)
  depositPercent       Int?    // e.g., 30 = 30% deposit
  balanceDueDays       Int     @default(14) // Days before trip

  // Group discounts
  groupDiscountEnabled Boolean @default(false)
  groupDiscountThreshold Int?  // Min group size for discount
  groupDiscountPercent Int?    // Discount percentage

  tour                 Tour    @relation(...)
}

// Platform-level settings
model PlatformSettings {
  id                    String @id @default("default")
  defaultServiceFee     Float  @default(5.0)
  defaultChildDiscount  Int    @default(30)
  defaultCommissionRate Float  @default(12.0)
  minBookingAmount      Float  @default(10.0)
  maxGroupSize          Int    @default(50)
}
```

#### 4. Availability Hold System

```typescript
// Prevent race conditions during checkout
model AvailabilityHold {
  id          String   @id @default(cuid())
  tourId      String
  startDate   DateTime
  endDate     DateTime
  guests      Int
  userId      String?  // null for guest holds
  sessionId   String   // Browser session ID
  expiresAt   DateTime // 15 minutes from creation
  status      HoldStatus @default(ACTIVE)
  createdAt   DateTime @default(now())

  tour        Tour     @relation(...)

  @@index([tourId, startDate, endDate])
  @@index([expiresAt])
}

enum HoldStatus {
  ACTIVE
  CONVERTED  // Became a booking
  EXPIRED
  RELEASED   // Manually released
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

#### 1.1 Database Schema Updates

```bash
# Add new models
prisma/schema.prisma:
  - Vehicle model
  - TourPricing model
  - AvailabilityHold model
  - ItineraryAccommodation (replace JSON)
  - ItineraryAddon (replace JSON)

# Migration
npx prisma migrate dev --name add_vehicle_pricing_holds
```

#### 1.2 Split Tour Creation Wizard

```
Before: /agent/tours/new/page.tsx (2,141 lines)

After:
/agent/tours/new/
├── page.tsx                    (100 lines - orchestrator)
├── components/
│   ├── step-details.tsx        (200 lines)
│   ├── step-features.tsx       (150 lines)
│   ├── step-vehicles.tsx       (200 lines) ← NEW
│   ├── step-accommodations.tsx (250 lines)
│   ├── step-addons.tsx         (200 lines)
│   ├── step-itinerary.tsx      (400 lines)
│   ├── step-images.tsx         (150 lines)
│   └── step-review.tsx         (200 lines)
├── hooks/
│   └── use-tour-form.ts        (150 lines - shared state)
└── lib/
    └── tour-schema.ts          (100 lines - Zod validation)
```

#### 1.3 Merge Checkout Flows

```
Before:
- /booking/checkout (URL params)
- /checkout/[bookingId] (different flow)

After:
- /booking/checkout/[tourSlug] (unified flow)
  - Server-side session storage
  - Single traveler form
  - No URL parameter state
```

### Phase 2: Enhanced Customization (Week 3-4)

#### 2.1 Vehicle Selection UI

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELECT YOUR VEHICLE                           │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   [Safari Van]   │  │ [Land Cruiser]  │  │ [Extended LC]   │  │
│  │   [    🚐     ]   │  │    [  🚙  ]     │  │   [   🚙   ]    │  │
│  │                  │  │                 │  │                 │  │
│  │  6-9 passengers  │  │  4-6 passengers │  │  4-6 passengers │  │
│  │  Pop-up roof     │  │  4x4 capability │  │  Extended body  │  │
│  │  AC              │  │  Pop-up roof    │  │  Fridge/cooler  │  │
│  │                  │  │  AC             │  │  Charging ports │  │
│  │  ────────────────│  │  ─────────────  │  │  ─────────────  │  │
│  │  +$0/day         │  │  +$90/day       │  │  +$200/day      │  │
│  │  (Included)      │  │                 │  │                 │  │
│  │                  │  │                 │  │                 │  │
│  │  [  SELECT  ]    │  │  [  SELECT  ]   │  │  [  SELECT  ]   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ℹ️ Vehicle selection affects your entire trip                   │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.2 Enhanced Add-on Categories

```
┌─────────────────────────────────────────────────────────────────┐
│                    CUSTOMIZE YOUR EXPERIENCE                     │
│                                                                  │
│  ── ADVENTURE ──────────────────────────────────────────────────│
│  │ 🎈 Hot Air Balloon Safari         $450/person    [+ ADD]    │
│  │ 🦁 Walking Safari with Guide      $120/person    [+ ADD]    │
│                                                                  │
│  ── CULTURAL ───────────────────────────────────────────────────│
│  │ 🏘️ Maasai Village Visit           $50/person     [+ ADD]    │
│  │ 👨‍🍳 Kenyan Cooking Class          $80/person     [+ ADD]    │
│                                                                  │
│  ── DINING ─────────────────────────────────────────────────────│
│  │ 🌅 Bush Dinner Experience         $150/person    [+ ADD]    │
│  │ 🥂 Sundowner Cocktails            $75/person     [+ ADD]    │
│                                                                  │
│  ── PACKAGE ADD-ONS ────────────────────────────────────────────│
│  │ 📸 Professional Photo Package     $350/trip      [+ ADD]    │
│  │ 🛡️ Travel Insurance               $89/person     [+ ADD]    │
│  │ 🛫 Airport Transfer (both ways)   $120/trip      [+ ADD]    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 2.3 Real-Time Pricing Engine

```typescript
// New pricing service
// /src/lib/pricing/engine.ts

interface PricingRequest {
  tourId: string
  startDate: Date
  guests: {
    adults: number
    children: number
    infants: number
  }
  vehicleId?: string
  accommodations: Record<number, string> // day -> accommodationId
  addons: string[]
  promoCode?: string
}

interface PricingResponse {
  breakdown: {
    basePrice: number
    vehicleUpgrade: number
    accommodationTotal: number
    addonsTotal: number
    childDiscount: number
    serviceFee: number
    promoDiscount: number
  }
  subtotal: number
  total: number
  currency: string
  perPerson: {
    adult: number
    child: number
    infant: number
  }
  calculatedAt: Date
}

class PricingEngine {
  async calculate(request: PricingRequest): Promise<PricingResponse> {
    // 1. Fetch tour with pricing config
    // 2. Calculate base (basePrice * adults)
    // 3. Add child pricing (configurable discount)
    // 4. Add vehicle upgrade cost
    // 5. Add accommodation selections
    // 6. Add addon costs
    // 7. Apply seasonal adjustments
    // 8. Apply promo code
    // 9. Add service fee
    // 10. Return detailed breakdown
  }
}
```

### Phase 3: Streamlined Checkout (Week 5-6)

#### 3.1 Single-Page Checkout

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPLETE YOUR BOOKING                       │
│  ═══════════════════════════════════════════════════════════════│
│                                                                  │
│  STEP 1 of 3: Review Your Trip                           [DONE] │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 📍 Kenya & Tanzania Safari                                │  │
│  │ 📅 Mar 15 - Mar 22, 2026 (7 days)                        │  │
│  │ 👥 2 Adults, 1 Child                                      │  │
│  │                                                           │  │
│  │ 🚙 Vehicle: Land Cruiser 4x4               +$630         │  │
│  │ 🏨 Accommodations:                         +$1,800       │  │
│  │    Day 1-2: Mara Serena Lodge (Luxury)                   │  │
│  │    Day 3-4: Ngorongoro Crater Lodge (Luxury)             │  │
│  │ 🎈 Add-ons:                                +$500         │  │
│  │    Hot Air Balloon Safari                                 │  │
│  │                                                           │  │
│  │ [Edit Selection]                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  STEP 2 of 3: Traveler Details                        [CURRENT] │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Lead Traveler                                             │  │
│  │ ┌─────────────────┐ ┌─────────────────┐                  │  │
│  │ │ First Name*     │ │ Last Name*      │                  │  │
│  │ └─────────────────┘ └─────────────────┘                  │  │
│  │ ┌─────────────────┐ ┌─────────────────┐                  │  │
│  │ │ Email*          │ │ Phone*          │                  │  │
│  │ └─────────────────┘ └─────────────────┘                  │  │
│  │                                                           │  │
│  │ ▶ Additional Traveler 1 (Adult)              [Expand]    │  │
│  │ ▶ Additional Traveler 2 (Child, 8 years)     [Expand]    │  │
│  │                                                           │  │
│  │ Special Requests (optional)                               │  │
│  │ ┌─────────────────────────────────────────────────────┐  │  │
│  │ │ Dietary requirements, accessibility needs...        │  │  │
│  │ └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  STEP 3 of 3: Payment                                 [PENDING] │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Payment Options                                           │  │
│  │ ○ Pay Full Amount ($4,930)                               │  │
│  │ ● Pay Deposit Now ($1,479) - Balance due by Mar 1        │  │
│  │                                                           │  │
│  │ Payment Method                                            │  │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐                      │  │
│  │ │ M-Pesa  │ │  Card   │ │  Bank   │                      │  │
│  │ └─────────┘ └─────────┘ └─────────┘                      │  │
│  │                                                           │  │
│  │ ☑ I agree to the Terms & Conditions                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ORDER SUMMARY                          │  │
│  │  Base Package (2 adults)          $2,400                 │  │
│  │  Child (1 × 70%)                  $840                   │  │
│  │  Vehicle Upgrade                  $630                   │  │
│  │  Accommodations                   $1,800                 │  │
│  │  Add-ons                          $500                   │  │
│  │  Service Fee (5%)                 $308                   │  │
│  │  ─────────────────────────────────────                   │  │
│  │  TOTAL                            $6,478                 │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │        [  COMPLETE BOOKING - $1,479  ]             │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  🔒 Secure payment • 🛡️ Money-back guarantee             │  │
│  │  ⏱️ Spots held for 15:00 more minutes                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2 Server-Side Session Management

```typescript
// /src/lib/checkout/session.ts

interface CheckoutSession {
  id: string
  tourId: string
  tourSlug: string

  // Selected options
  startDate: Date
  guests: { adults: number; children: number; infants: number }
  vehicleId?: string
  accommodations: Record<number, string>
  addons: string[]

  // Pricing snapshot
  pricing: PricingResponse

  // Hold info
  holdId?: string
  holdExpiresAt?: Date

  // Progress
  currentStep: 'review' | 'travelers' | 'payment'

  // Traveler data (partial, saved as user progresses)
  travelers?: TravelerData[]
  contactEmail?: string
  contactPhone?: string
  specialRequests?: string

  // Timestamps
  createdAt: Date
  updatedAt: Date
  expiresAt: Date // Session expires in 1 hour
}

// Store in Redis or encrypted cookie
class CheckoutSessionManager {
  async create(tourSlug: string, options: BookingOptions): Promise<CheckoutSession>
  async get(sessionId: string): Promise<CheckoutSession | null>
  async update(sessionId: string, data: Partial<CheckoutSession>): Promise<void>
  async createHold(sessionId: string): Promise<void>
  async releaseHold(sessionId: string): Promise<void>
  async convertToBooking(sessionId: string): Promise<Booking>
}
```

### Phase 4: Polish & Optimization (Week 7-8)

#### 4.1 Performance Optimizations

- Pricing calculation <200ms
- Page load <2s on 3G
- Image lazy loading
- Code splitting per step

#### 4.2 Mobile Optimization

- Thumb-friendly buttons (min 44px)
- Floating summary on mobile
- Swipe navigation between steps
- Native date pickers

#### 4.3 Conversion Optimization

- Exit intent popup (save cart)
- Abandoned cart emails
- Trust badges throughout
- Social proof (reviews, booking count)

---

## Technical Specifications

### API Endpoints (New/Modified)

```typescript
// === TOUR MANAGEMENT ===

// Vehicles
POST   /api/agent/tours/[id]/vehicles
GET    /api/agent/tours/[id]/vehicles
PUT    /api/agent/tours/[id]/vehicles/[vehicleId]
DELETE /api/agent/tours/[id]/vehicles/[vehicleId]

// Tour Pricing Config
GET    /api/agent/tours/[id]/pricing
PUT    /api/agent/tours/[id]/pricing

// === BOOKING FLOW ===

// Availability Hold
POST   /api/tours/[slug]/hold
DELETE /api/tours/[slug]/hold/[holdId]
GET    /api/tours/[slug]/hold/[holdId]/status

// Checkout Session
POST   /api/checkout/session           // Create session
GET    /api/checkout/session/[id]      // Get session
PUT    /api/checkout/session/[id]      // Update session
POST   /api/checkout/session/[id]/complete  // Convert to booking

// Pricing (enhanced)
POST   /api/pricing/calculate
  Request: { tourId, startDate, guests, vehicleId, accommodations, addons, promoCode }
  Response: { breakdown, total, perPerson, currency }

// === PLATFORM ===

// Settings
GET    /api/admin/settings
PUT    /api/admin/settings
```

### Component Structure

```
src/
├── app/
│   ├── (agent)/
│   │   └── agent/
│   │       └── tours/
│   │           ├── new/
│   │           │   ├── page.tsx                 # Orchestrator
│   │           │   └── components/
│   │           │       ├── step-details.tsx
│   │           │       ├── step-features.tsx
│   │           │       ├── step-vehicles.tsx    # NEW
│   │           │       ├── step-accommodations.tsx
│   │           │       ├── step-addons.tsx
│   │           │       ├── step-itinerary.tsx
│   │           │       ├── step-images.tsx
│   │           │       └── step-review.tsx
│   │           └── [id]/
│   │               └── edit/
│   │                   └── page.tsx             # Reuses step components
│   │
│   ├── (main)/
│   │   └── tours/
│   │       └── [slug]/
│   │           └── page.tsx                     # Tour detail
│   │
│   └── booking/
│       ├── checkout/
│       │   └── [tourSlug]/
│       │       ├── page.tsx                     # UNIFIED checkout
│       │       └── components/
│       │           ├── step-review.tsx
│       │           ├── step-travelers.tsx
│       │           └── step-payment.tsx
│       ├── confirmation/
│       │   └── [id]/
│       │       └── page.tsx
│       └── payment/
│           └── [id]/
│               └── page.tsx                     # Keep for direct payment links
│
├── components/
│   ├── tours/
│   │   ├── tour-customizer.tsx                  # Enhanced
│   │   ├── booking-card.tsx
│   │   ├── vehicle-selector.tsx                 # NEW
│   │   ├── addon-selector.tsx                   # Enhanced
│   │   └── interactive-itinerary.tsx
│   │
│   └── checkout/
│       ├── checkout-session-provider.tsx        # NEW
│       ├── checkout-summary.tsx
│       ├── traveler-form.tsx
│       └── payment-selector.tsx
│
├── lib/
│   ├── pricing/
│   │   ├── engine.ts                            # NEW
│   │   └── types.ts
│   │
│   ├── checkout/
│   │   ├── session.ts                           # NEW
│   │   └── hold.ts                              # NEW
│   │
│   └── tours/
│       └── schema.ts                            # Zod schemas
│
└── hooks/
    ├── use-tour-form.ts                         # NEW
    ├── use-checkout-session.ts                  # NEW
    └── use-availability-hold.ts                 # NEW
```

---

## Database Changes

### New Tables

```sql
-- 1. Vehicles
CREATE TABLE vehicles (
  id VARCHAR(25) PRIMARY KEY,
  tour_id VARCHAR(25) NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  price_per_person DECIMAL(10,2),
  features JSON DEFAULT '[]',
  images JSON DEFAULT '[]',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tour Pricing Configuration
CREATE TABLE tour_pricing (
  id VARCHAR(25) PRIMARY KEY,
  tour_id VARCHAR(25) UNIQUE NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  child_discount_percent INT DEFAULT 30,
  infant_discount_percent INT DEFAULT 100,
  child_min_age INT DEFAULT 3,
  child_max_age INT DEFAULT 11,
  infant_max_age INT DEFAULT 2,
  service_fee_percent DECIMAL(5,2) DEFAULT 5.00,
  deposit_enabled BOOLEAN DEFAULT FALSE,
  deposit_percent INT,
  balance_due_days INT DEFAULT 14,
  group_discount_enabled BOOLEAN DEFAULT FALSE,
  group_discount_threshold INT,
  group_discount_percent INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Availability Holds
CREATE TABLE availability_holds (
  id VARCHAR(25) PRIMARY KEY,
  tour_id VARCHAR(25) NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests INT NOT NULL,
  user_id VARCHAR(25) REFERENCES users(id),
  session_id VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Replace JSON arrays with proper relations
CREATE TABLE itinerary_accommodations (
  id VARCHAR(25) PRIMARY KEY,
  itinerary_id VARCHAR(25) NOT NULL REFERENCES itinerary(id) ON DELETE CASCADE,
  accommodation_option_id VARCHAR(25) NOT NULL REFERENCES accommodation_options(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  UNIQUE(itinerary_id, accommodation_option_id)
);

CREATE TABLE itinerary_addons (
  id VARCHAR(25) PRIMARY KEY,
  itinerary_id VARCHAR(25) NOT NULL REFERENCES itinerary(id) ON DELETE CASCADE,
  activity_addon_id VARCHAR(25) NOT NULL REFERENCES activity_addons(id) ON DELETE CASCADE,
  UNIQUE(itinerary_id, activity_addon_id)
);

-- 5. Booking Vehicles
CREATE TABLE booking_vehicles (
  id VARCHAR(25) PRIMARY KEY,
  booking_id VARCHAR(25) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_id VARCHAR(25) NOT NULL REFERENCES vehicles(id),
  price DECIMAL(10,2) NOT NULL,
  days INT NOT NULL
);

-- 6. Checkout Sessions (or use Redis)
CREATE TABLE checkout_sessions (
  id VARCHAR(25) PRIMARY KEY,
  tour_id VARCHAR(25) NOT NULL,
  tour_slug VARCHAR(255) NOT NULL,
  session_data JSON NOT NULL,
  hold_id VARCHAR(25) REFERENCES availability_holds(id),
  current_step VARCHAR(20) DEFAULT 'review',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
```

### Modified Tables

```sql
-- Add to activity_addons
ALTER TABLE activity_addons
  ADD COLUMN type VARCHAR(20) DEFAULT 'DAILY',
  ADD COLUMN category VARCHAR(50),
  ADD COLUMN min_age INT,
  ADD COLUMN is_popular BOOLEAN DEFAULT FALSE;

-- Add to bookings
ALTER TABLE bookings
  ADD COLUMN checkout_session_id VARCHAR(25),
  ADD COLUMN hold_id VARCHAR(25);
```

### Prisma Schema Updates

```prisma
// Add to schema.prisma

model Vehicle {
  id            String   @id @default(cuid())
  tourId        String
  type          VehicleType
  name          String
  description   String?
  capacity      Int
  pricePerDay   Float
  pricePerPerson Float?
  features      String   @default("[]")
  images        String   @default("[]")
  isDefault     Boolean  @default(false)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tour          Tour     @relation(fields: [tourId], references: [id], onDelete: Cascade)
  bookings      BookingVehicle[]

  @@index([tourId])
}

enum VehicleType {
  SAFARI_VAN
  LAND_CRUISER
  EXTENDED_CRUISER
  OVERLAND_TRUCK
  PRIVATE_VEHICLE
}

model TourPricing {
  id                      String   @id @default(cuid())
  tourId                  String   @unique
  childDiscountPercent    Int      @default(30)
  infantDiscountPercent   Int      @default(100)
  childMinAge             Int      @default(3)
  childMaxAge             Int      @default(11)
  infantMaxAge            Int      @default(2)
  serviceFeePercent       Float    @default(5.0)
  depositEnabled          Boolean  @default(false)
  depositPercent          Int?
  balanceDueDays          Int      @default(14)
  groupDiscountEnabled    Boolean  @default(false)
  groupDiscountThreshold  Int?
  groupDiscountPercent    Int?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  tour                    Tour     @relation(fields: [tourId], references: [id], onDelete: Cascade)
}

model AvailabilityHold {
  id          String     @id @default(cuid())
  tourId      String
  startDate   DateTime
  endDate     DateTime
  guests      Int
  userId      String?
  sessionId   String
  status      HoldStatus @default(ACTIVE)
  expiresAt   DateTime
  createdAt   DateTime   @default(now())

  tour        Tour       @relation(fields: [tourId], references: [id], onDelete: Cascade)
  user        User?      @relation(fields: [userId], references: [id])

  @@index([tourId, startDate, endDate])
  @@index([expiresAt])
}

enum HoldStatus {
  ACTIVE
  CONVERTED
  EXPIRED
  RELEASED
}

// Replace JSON arrays with proper relations
model ItineraryAccommodation {
  id                    String              @id @default(cuid())
  itineraryId           String
  accommodationOptionId String
  isDefault             Boolean             @default(false)

  itinerary             Itinerary           @relation(fields: [itineraryId], references: [id], onDelete: Cascade)
  accommodationOption   AccommodationOption @relation(fields: [accommodationOptionId], references: [id], onDelete: Cascade)

  @@unique([itineraryId, accommodationOptionId])
}

model ItineraryAddon {
  id              String        @id @default(cuid())
  itineraryId     String
  activityAddonId String

  itinerary       Itinerary     @relation(fields: [itineraryId], references: [id], onDelete: Cascade)
  activityAddon   ActivityAddon @relation(fields: [activityAddonId], references: [id], onDelete: Cascade)

  @@unique([itineraryId, activityAddonId])
}

model BookingVehicle {
  id        String   @id @default(cuid())
  bookingId String
  vehicleId String
  price     Float
  days      Int

  booking   Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id])
}

// Update ActivityAddon
enum AddonType {
  DAILY
  PACKAGE
  TRANSFER
}

enum AddonCategory {
  ADVENTURE
  WILDLIFE
  CULTURAL
  DINING
  WELLNESS
  PHOTOGRAPHY
  TRANSFER
  INSURANCE
}
```

---

## Testing Plan

### Unit Tests

```typescript
// /tests/unit/pricing-engine.test.ts
describe('PricingEngine', () => {
  describe('calculate()', () => {
    it('calculates base price correctly for adults', async () => {
      const result = await pricingEngine.calculate({
        tourId: 'tour-1',
        guests: { adults: 2, children: 0, infants: 0 },
        // ...
      })
      expect(result.breakdown.basePrice).toBe(2400) // $1200 × 2
    })

    it('applies child discount correctly', async () => {
      const result = await pricingEngine.calculate({
        tourId: 'tour-1',
        guests: { adults: 2, children: 1, infants: 0 },
        // ...
      })
      expect(result.breakdown.childDiscount).toBe(360) // $1200 × 0.3
    })

    it('adds vehicle upgrade cost', async () => {
      const result = await pricingEngine.calculate({
        vehicleId: 'land-cruiser',
        // ...
      })
      expect(result.breakdown.vehicleUpgrade).toBe(630) // $90/day × 7 days
    })

    it('applies promo code discount', async () => {
      const result = await pricingEngine.calculate({
        promoCode: 'SAVE10',
        // ...
      })
      expect(result.breakdown.promoDiscount).toBeGreaterThan(0)
    })

    it('handles seasonal pricing', async () => {
      const result = await pricingEngine.calculate({
        startDate: new Date('2026-08-01'), // High season
        // ...
      })
      expect(result.breakdown.seasonalAdjustment).toBeGreaterThan(0)
    })
  })
})

// /tests/unit/availability-hold.test.ts
describe('AvailabilityHold', () => {
  it('creates a 15-minute hold', async () => {
    const hold = await holdService.create({
      tourId: 'tour-1',
      startDate: new Date(),
      guests: 2,
    })
    expect(hold.expiresAt).toBeGreaterThan(new Date())
  })

  it('prevents overlapping holds', async () => {
    await holdService.create({ tourId: 'tour-1', startDate: date, guests: 2 })
    await expect(
      holdService.create({ tourId: 'tour-1', startDate: date, guests: 2 })
    ).rejects.toThrow('Tour not available')
  })

  it('releases expired holds', async () => {
    await holdService.cleanupExpired()
    const expiredHolds = await prisma.availabilityHold.findMany({
      where: { status: 'ACTIVE', expiresAt: { lt: new Date() } }
    })
    expect(expiredHolds).toHaveLength(0)
  })
})
```

### Integration Tests

```typescript
// /tests/integration/checkout-flow.test.ts
describe('Checkout Flow', () => {
  it('completes full checkout journey', async () => {
    // 1. Create session
    const session = await fetch('/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({
        tourSlug: 'kenya-safari',
        startDate: '2026-03-15',
        guests: { adults: 2, children: 1, infants: 0 },
      })
    }).then(r => r.json())

    expect(session.id).toBeDefined()
    expect(session.holdId).toBeDefined()

    // 2. Update with traveler details
    await fetch(`/api/checkout/session/${session.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        currentStep: 'travelers',
        travelers: [
          { firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
        ]
      })
    })

    // 3. Complete booking
    const booking = await fetch(`/api/checkout/session/${session.id}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        paymentMethod: 'CARD',
        paymentType: 'DEPOSIT'
      })
    }).then(r => r.json())

    expect(booking.bookingReference).toBeDefined()
    expect(booking.status).toBe('PENDING')
  })
})
```

### E2E Tests (Playwright)

```typescript
// /e2e/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test('customer completes booking with vehicle and addons', async ({ page }) => {
    // 1. Go to tour page
    await page.goto('/tours/kenya-safari')

    // 2. Select dates
    await page.click('[data-testid="date-picker"]')
    await page.click('text=15') // Select 15th

    // 3. Select guests
    await page.click('[data-testid="add-adult"]')
    expect(await page.textContent('[data-testid="adult-count"]')).toBe('2')

    // 4. Select vehicle upgrade
    await page.click('[data-testid="vehicle-land-cruiser"]')
    expect(await page.textContent('[data-testid="total-price"]')).toContain('$')

    // 5. Add activity
    await page.click('[data-testid="addon-balloon"]')

    // 6. Book now
    await page.click('[data-testid="book-now"]')
    await expect(page).toHaveURL(/\/booking\/checkout/)

    // 7. Fill traveler details
    await page.fill('[name="firstName"]', 'John')
    await page.fill('[name="lastName"]', 'Doe')
    await page.fill('[name="email"]', 'john@example.com')
    await page.fill('[name="phone"]', '+254712345678')

    // 8. Select payment
    await page.click('[data-testid="payment-mpesa"]')
    await page.check('[data-testid="terms-checkbox"]')

    // 9. Complete booking
    await page.click('[data-testid="complete-booking"]')

    // 10. Verify redirect to payment/confirmation
    await expect(page).toHaveURL(/\/(payment|confirmation)/)
  })

  test('handles availability hold expiration', async ({ page }) => {
    await page.goto('/tours/kenya-safari')
    await page.click('[data-testid="book-now"]')

    // Wait for hold timer
    const timer = page.locator('[data-testid="hold-timer"]')
    await expect(timer).toBeVisible()

    // Verify timer countdown
    const initialTime = await timer.textContent()
    await page.waitForTimeout(2000)
    const newTime = await timer.textContent()
    expect(newTime).not.toBe(initialTime)
  })
})
```

### Performance Tests

```typescript
// /tests/performance/pricing.test.ts
import { performance } from 'perf_hooks'

describe('Pricing Performance', () => {
  it('calculates price in under 200ms', async () => {
    const start = performance.now()

    await pricingEngine.calculate({
      tourId: 'tour-1',
      startDate: new Date(),
      guests: { adults: 4, children: 2, infants: 1 },
      vehicleId: 'land-cruiser',
      accommodations: { 1: 'acc-1', 2: 'acc-2', 3: 'acc-3' },
      addons: ['addon-1', 'addon-2', 'addon-3'],
      promoCode: 'SAVE10'
    })

    const duration = performance.now() - start
    expect(duration).toBeLessThan(200)
  })

  it('handles 100 concurrent pricing requests', async () => {
    const requests = Array(100).fill(null).map(() =>
      pricingEngine.calculate({ tourId: 'tour-1', /* ... */ })
    )

    const start = performance.now()
    await Promise.all(requests)
    const duration = performance.now() - start

    expect(duration).toBeLessThan(5000) // 5 seconds for 100 requests
  })
})
```

---

## Pages Affected

### Agent Dashboard

| Page | Current | Changes | Priority |
|------|---------|---------|----------|
| `/agent/tours/new` | 2,141 line wizard | Split into components, add vehicles | High |
| `/agent/tours/[id]/edit` | Similar to new | Reuse step components | High |
| `/agent/tours` | List view | Add vehicle column | Low |
| `/agent/tours/[id]` | Tour detail | Show vehicles, pricing config | Medium |

### Customer Facing

| Page | Current | Changes | Priority |
|------|---------|---------|----------|
| `/tours/[slug]` | Tour detail | Add vehicle selector | High |
| `/booking/checkout` | URL params flow | Replace with session-based | High |
| `/checkout/[bookingId]` | Separate flow | Merge into above | High |
| `/booking/payment/[id]` | Payment page | Keep, enhance hold timer | Medium |
| `/booking/confirmation/[id]` | Confirmation | Add vehicle info display | Low |

### Admin Dashboard

| Page | Current | Changes | Priority |
|------|---------|---------|----------|
| `/admin/settings` | Platform settings | Add pricing defaults | Medium |
| `/admin/bookings` | Booking list | Show vehicle selection | Low |

### API Routes

| Route | Current | Changes | Priority |
|-------|---------|---------|----------|
| `POST /api/bookings` | Create booking | Add vehicle, use hold | High |
| `POST /api/payments/initiate` | Initiate payment | No change | - |
| `POST /api/agent/tours` | Create tour | Add pricing config | Medium |
| `GET /api/tours/[slug]` | Get tour | Include vehicles | High |
| **NEW** `/api/checkout/session` | - | Create | High |
| **NEW** `/api/tours/[slug]/hold` | - | Create | High |
| **NEW** `/api/agent/tours/[id]/vehicles` | - | Create | High |
| **NEW** `/api/agent/tours/[id]/pricing` | - | Create | Medium |

---

## Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Booking completion rate | ~30%* | 50%+ | Analytics |
| Cart abandonment | ~70%* | <50% | Analytics |
| Time to complete booking | ~10 min* | <5 min | User testing |
| Tour creation time | ~30 min* | <15 min | Agent feedback |
| Pricing calculation time | ~500ms* | <200ms | Performance tests |
| Mobile conversion rate | Unknown | Match desktop | Analytics |
| Customer satisfaction | Unknown | >4.5/5 | Surveys |

*Estimated based on industry averages

### Tracking Implementation

```typescript
// Analytics events to track
const checkoutEvents = {
  SESSION_CREATED: 'checkout_session_created',
  STEP_COMPLETED: 'checkout_step_completed',
  HOLD_CREATED: 'availability_hold_created',
  HOLD_EXPIRED: 'availability_hold_expired',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_ABANDONED: 'booking_abandoned',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',
}

// Track funnel
// Session Created → Review Complete → Travelers Complete → Payment → Confirmation
```

---

## Timeline Summary

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|--------------|
| **Phase 1** | Week 1-2 | Foundation | DB schema, split wizard, merge checkout |
| **Phase 2** | Week 3-4 | Features | Vehicles, enhanced add-ons, pricing engine |
| **Phase 3** | Week 5-6 | Checkout | Single-page checkout, session management, holds |
| **Phase 4** | Week 7-8 | Polish | Performance, mobile, conversion optimization |

---

## References

### Industry Research
- [TrekkSoft - Reduce Cart Abandonment](https://www.trekksoft.com/en/blog/reduce-cart-abandonment)
- [WeTravel - Booking Process](https://academy.wetravel.com/travel-booking-process)
- [Xola - Prevent Booking Abandonment](https://www.xola.com/articles/how-to-prevent-booking-abandonment/)
- [VWO - Increase Travel Bookings](https://vwo.com/blog/increase-travel-website-bookings/)

### Safari Vehicles
- [African Budget Safaris - Vehicle Types](https://www.africanbudgetsafaris.com/blog/safari-vehicles-from-feet-to-4x4s-and-everything-between/)
- [AJ Kenya Safaris - Kenya Vehicles](https://ajkenyasafaris.com/travel-tip/kenya-safari-vehicles/)

### Travel UX
- [Medium - Travel UX Best Practices](https://uxtbe.medium.com/best-practices-for-ux-design-in-the-travel-industry-a033968a3bd0)
- [TravelGenix - UX Design Importance](https://www.travelgenix.io/how-important-is-ux-design-in-the-success-of-travel-booking-platforms/)

### Itinerary Builders
- [Safari Portal](https://www.safariportal.app) - Specialized for safaris
- [Moonstride](https://www.moonstride.com/itinerary-builder/) - Tour operator software
- [WeTravel Itinerary Builder](https://product.wetravel.com/itinerary-builder)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Tech Lead | | | |
| UX Designer | | | |
| QA Lead | | | |

---

## Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 14, 2026 | Claude | Initial comprehensive plan |

