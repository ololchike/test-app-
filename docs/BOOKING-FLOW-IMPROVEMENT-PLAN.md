# Booking Flow Improvement Plan

## Executive Summary

This document outlines a comprehensive improvement to SafariPlus's booking flow, addressing redundant selections, missing vehicle capacity logic, day-specific add-ons, and tour-specific pricing overrides.

**Research Sources:**
- [WeTravel Academy - Cross Sell and Upsell Strategies](https://academy.wetravel.com/cross-sell-and-upsell)
- [TrekkSoft - Upselling Best Practices](https://www.trekksoft.com/en/blog/upsell-and-cross-sell-sales-in-the-tourism-industry)
- [Distinctive Systems - Tour Booking System](https://www.distinctive-systems.com/products/tour-booking-system/)
- [Safari Portal - Itinerary Builder](https://www.safariportal.app)
- [FareHarbor - Tour Add-On Ideas](https://fareharbor.com/blog/beyond-retail-smart-add-on-ideas-by-tour-type/)

---

## Current Problems

### 1. Redundant Selection Points
- **Tour Page**: Users can select accommodations and add-ons in itinerary section
- **Checkout Customize Step**: Users can again select/deselect add-ons
- **Result**: Confusing UX, unclear which selection takes precedence

### 2. Missing Vehicle Selection
- No vehicle selection in booking flow
- No capacity-based logic (e.g., 12 guests need 2x 6-seater vehicles)
- No vehicle visibility for customers

### 3. Add-ons Not Day-Specific in PDF
- Add-ons assigned to specific days in itinerary creation
- PDF shows add-ons randomly at bottom, not on their assigned day

### 4. No Global Catalog with Tour-Specific Pricing
- Currently: Items created from scratch per tour
- Desired: Select from global catalog + adjust price for specific tour

---

## Proposed Architecture

### Phase 1: Global Catalogs with Tour-Specific Pricing

#### New Database Models

```prisma
// ============================================================================
// GLOBAL CATALOGS (Agent-Level)
// ============================================================================

// Global Add-on Catalog (per agent)
model AddonCatalog {
  id          String        @id @default(cuid())
  agentId     String
  name        String        // e.g., "Hot Air Balloon Ride"
  description String?
  basePrice   Float         // Default price: $200
  duration    String?
  images      String        @default("[]")
  type        AddonType     @default(ACTIVITY)
  category    AddonCategory @default(ADVENTURE)
  priceType   String        @default("PER_PERSON")
  childPrice  Float?
  isActive    Boolean       @default(true)

  agent       Agent         @relation(fields: [agentId], references: [id])
  tourAddons  TourAddon[]   // Tours using this addon

  @@index([agentId])
}

// Global Vehicle Catalog (per agent)
model VehicleCatalog {
  id            String      @id @default(cuid())
  agentId       String
  type          VehicleType
  name          String      // e.g., "Toyota Land Cruiser 4x4"
  description   String?
  maxPassengers Int         // Capacity: 6 passengers
  basePricePerDay Float     // Default: $150/day
  features      String      @default("[]")
  images        String      @default("[]")
  isActive      Boolean     @default(true)

  agent         Agent       @relation(fields: [agentId], references: [id])
  tourVehicles  TourVehicle[]

  @@index([agentId])
}

// Global Accommodation Catalog (per agent)
model AccommodationCatalog {
  id            String            @id @default(cuid())
  agentId       String
  name          String            // e.g., "Serena Safari Lodge"
  description   String?
  tier          AccommodationTier
  basePricePerNight Float         // Default: $350/night
  images        String            @default("[]")
  amenities     String            @default("[]")
  location      String?
  rating        Float?
  roomType      String?
  isActive      Boolean           @default(true)

  agent         Agent             @relation(fields: [agentId])
  tourAccommodations TourAccommodation[]

  @@index([agentId])
}

// ============================================================================
// TOUR-SPECIFIC ASSIGNMENTS (with price overrides)
// ============================================================================

// Tour-specific add-on with price override
model TourAddon {
  id              String        @id @default(cuid())
  tourId          String
  addonCatalogId  String

  // Price override (null = use catalog price)
  priceOverride   Float?        // e.g., $150 (instead of catalog $200)
  childPriceOverride Float?

  // Tour-specific settings
  dayNumbers      String        @default("[]") // Days when available: [1, 3, 5]
  isRecommended   Boolean       @default(false)
  sortOrder       Int           @default(0)
  isActive        Boolean       @default(true)

  tour            Tour          @relation(fields: [tourId], references: [id])
  addonCatalog    AddonCatalog  @relation(fields: [addonCatalogId], references: [id])
  bookingAddons   BookingAddon[]

  @@unique([tourId, addonCatalogId])
  @@index([tourId])
}

// Tour-specific vehicle with price override
model TourVehicle {
  id                String          @id @default(cuid())
  tourId            String
  vehicleCatalogId  String

  // Price override
  pricePerDayOverride Float?        // Override catalog price

  // Tour-specific
  isDefault         Boolean         @default(false)
  isIncluded        Boolean         @default(false) // Included in base price
  sortOrder         Int             @default(0)
  isActive          Boolean         @default(true)

  tour              Tour            @relation(fields: [tourId], references: [id])
  vehicleCatalog    VehicleCatalog  @relation(fields: [vehicleCatalogId], references: [id])
  bookingVehicles   BookingVehicle[]

  @@unique([tourId, vehicleCatalogId])
  @@index([tourId])
}

// Tour-specific accommodation with price override
model TourAccommodation {
  id                    String               @id @default(cuid())
  tourId                String
  accommodationCatalogId String

  // Price override
  pricePerNightOverride Float?

  // Tour-specific
  availableDays         String               @default("[]") // Days available: [1, 2, 3, 4]
  tier                  AccommodationTier?   // Override tier for this tour
  isDefault             Boolean              @default(false)
  sortOrder             Int                  @default(0)
  isActive              Boolean              @default(true)

  tour                  Tour                 @relation(fields: [tourId], references: [id])
  accommodationCatalog  AccommodationCatalog @relation(fields: [accommodationCatalogId], references: [id])
  bookingAccommodations BookingAccommodation[]

  @@unique([tourId, accommodationCatalogId])
  @@index([tourId])
}
```

---

### Phase 2: Simplified Booking Flow

#### New User Journey

```
TOUR PAGE                    CHECKOUT
─────────                    ────────

1. View Tour Details         1. Review Selection
   - See itinerary              - Dates, guests confirmed
   - See included items         - Show what's included

2. Select Travel Dates       2. Vehicle Selection (NEW!)
   - Calendar picker            - Auto-suggest based on group size
   - Guest count                - "12 guests → 2x Land Cruiser"
                                - Allow manual adjustment

3. Book Now →                3. Add-ons (Day-Specific)
                                - Show by day: "Day 3: Balloon Ride"
                                - Pre-select recommended
                                - Clear pricing per item

                             4. Accommodation Upgrades
                                - Show tier comparison
                                - Price difference displayed

                             5. Traveler Details
                                - Lead traveler info
                                - Additional travelers

                             6. Payment
                                - Full / Deposit / Pay Later
                                - Payment method selection
```

#### Key Changes:

1. **Tour Page**: Remove add-on/accommodation selection
   - Just show what's included in the tour
   - "Book Now" goes directly to checkout

2. **Checkout Flow**:
   - Step 1: **Review** - Confirm dates, guests
   - Step 2: **Vehicles** - Smart capacity-based selection
   - Step 3: **Customize** - Day-specific add-ons
   - Step 4: **Accommodations** - Tier upgrades only
   - Step 5: **Travelers** - Contact info
   - Step 6: **Payment** - Final step

---

### Phase 3: Vehicle Selection Logic

#### Auto-Suggestion Algorithm

```typescript
interface VehicleSuggestion {
  vehicles: Array<{
    vehicleId: string
    name: string
    quantity: number
    capacity: number
    pricePerDay: number
  }>
  totalCapacity: number
  totalPricePerDay: number
  isOptimal: boolean
}

function suggestVehicles(
  availableVehicles: TourVehicle[],
  guestCount: number,
  tourDays: number
): VehicleSuggestion[] {
  // Sort by capacity (largest first for efficiency)
  const sorted = [...availableVehicles].sort(
    (a, b) => b.maxPassengers - a.maxPassengers
  )

  const suggestions: VehicleSuggestion[] = []

  // Strategy 1: Fewest vehicles (use largest)
  // Strategy 2: Most economical (cheapest per person)
  // Strategy 3: Comfort (more space per person)

  // Example: 12 guests
  // Option A: 2x Land Cruiser (6 each) = $300/day
  // Option B: 3x Safari Van (4 each) = $240/day
  // Option C: 1x Safari Bus (15 capacity) = $200/day

  return suggestions
}
```

#### UI Component

```
┌─────────────────────────────────────────────────────────────────┐
│  🚗 Select Your Safari Vehicle                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👥 12 Guests • 5 Days                                         │
│                                                                 │
│  ✨ RECOMMENDED                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🚙 2x Toyota Land Cruiser 4x4                            │ │
│  │     6 passengers each • Pop-up roof • AC                  │ │
│  │                                                           │ │
│  │     $150/day × 2 × 5 days = $1,500                       │ │
│  │                                            [Select ✓]     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  💰 BUDGET OPTION                                              │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  🚐 3x Safari Minivan                                     │ │
│  │     4 passengers each • AC                                │ │
│  │                                                           │ │
│  │     $80/day × 3 × 5 days = $1,200                        │ │
│  │                                            [Select]       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [+ Custom selection]                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 4: Day-Specific Add-ons in Checkout & PDF

#### Checkout UI

```
┌─────────────────────────────────────────────────────────────────┐
│  ✨ Enhance Your Safari Experience                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DAY 1 - Arrival in Nairobi                                    │
│  ├─ No add-ons available                                       │
│                                                                 │
│  DAY 2 - Masai Mara Game Drive                                 │
│  ├─ □ Bush Breakfast ($45/person)                              │
│  └─ □ Night Game Drive ($65/person) ⭐ Popular                 │
│                                                                 │
│  DAY 3 - Full Day Safari                                       │
│  ├─ ☑ Hot Air Balloon Ride ($150/person) ✓ Recommended        │
│  └─ □ Masai Village Visit ($25/person)                         │
│                                                                 │
│  DAY 4 - Lake Nakuru                                           │
│  └─ □ Boat Safari ($40/person)                                 │
│                                                                 │
│  DAY 5 - Departure                                             │
│  └─ □ Airport Lounge Access ($30/person)                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Selected Add-ons: 1 item                     Total: $300      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### PDF Itinerary (Day-Specific)

```
┌─────────────────────────────────────────────────────────────────┐
│  DAY 3 - Full Day Safari                                       │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  🌅 Early morning wake-up call for your once-in-a-lifetime     │
│  hot air balloon experience over the Masai Mara...             │
│                                                                 │
│  📍 Location: Masai Mara National Reserve                      │
│  🍽️ Meals: Breakfast, Lunch, Dinner                            │
│  🏨 Overnight: Mara Serena Safari Lodge (Luxury)               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ✨ YOUR SELECTED EXPERIENCE                             │   │
│  │                                                          │   │
│  │  🎈 Hot Air Balloon Ride                                │   │
│  │     Sunrise balloon safari with champagne breakfast     │   │
│  │     Duration: 3 hours • $150/person                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 5: Agent Tour Edit Interface

#### Add-ons Management

```
┌─────────────────────────────────────────────────────────────────┐
│  🎯 Tour Add-ons                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  From Your Catalog:                    [+ Create New Add-on]   │
│  ──────────────────                                            │
│                                                                 │
│  ☑ Hot Air Balloon Ride                                        │
│    Catalog: $200  →  Tour Price: [$150____] (25% off)         │
│    Available Days: [Day 2 ✓] [Day 3 ✓] [Day 4]                │
│    [⭐ Mark as Recommended]                                    │
│                                                                 │
│  ☑ Bush Breakfast                                              │
│    Catalog: $50   →  Tour Price: [$45_____] (10% off)         │
│    Available Days: [Day 1] [Day 2 ✓] [Day 3 ✓] [Day 4 ✓]     │
│                                                                 │
│  □ Masai Village Visit                                         │
│    Catalog: $30   →  Tour Price: [Use catalog price]          │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│  [+ Add from Catalog]                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Vehicles Management

```
┌─────────────────────────────────────────────────────────────────┐
│  🚗 Tour Vehicles                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ☑ Toyota Land Cruiser 4x4 (6 passengers)                      │
│    Catalog: $180/day  →  Tour Price: [$150____/day]           │
│    [✓ Default vehicle] [□ Included in base price]             │
│                                                                 │
│  ☑ Safari Minivan (4 passengers)                               │
│    Catalog: $100/day  →  Tour Price: [$80_____/day]           │
│    [□ Default vehicle] [□ Included in base price]             │
│                                                                 │
│  □ Safari Bus (15 passengers)                                  │
│    Catalog: $250/day  →  Not available for this tour          │
│                                                                 │
│  ──────────────────────────────────────────────────────────    │
│  [+ Add Vehicle from Catalog]  [+ Create New Vehicle]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Order

### Sprint 1: Database & Catalog (2-3 days)
1. Create global catalog models
2. Create tour-specific assignment models with price overrides
3. Migration script for existing data
4. Agent catalog management API

### Sprint 2: Agent Interface (2-3 days)
1. Agent catalog management pages (CRUD for add-ons, vehicles, accommodations)
2. Tour edit page - select from catalog with price overrides
3. Day assignment for add-ons in itinerary builder

### Sprint 3: Checkout Flow (3-4 days)
1. Remove redundant selections from tour page
2. New checkout steps: Review → Vehicles → Add-ons → Accommodations → Travelers → Payment
3. Vehicle suggestion algorithm with capacity logic
4. Day-specific add-on selection UI

### Sprint 4: PDF & Polish (1-2 days)
1. Update PDF to show add-ons on specific days
2. Include vehicle selection in PDF
3. Testing and bug fixes

---

## Database Migration Strategy

```sql
-- 1. Create catalog tables (copy existing tour-specific items)
INSERT INTO addon_catalog (agent_id, name, base_price, ...)
SELECT DISTINCT agent_id, name, price, ...
FROM activity_addon
JOIN tour ON tour.id = activity_addon.tour_id;

-- 2. Create tour assignments with original prices as overrides
INSERT INTO tour_addon (tour_id, addon_catalog_id, price_override, ...)
SELECT tour_id, catalog.id, activity_addon.price, ...
FROM activity_addon
JOIN addon_catalog catalog ON ...;

-- 3. Keep legacy tables until fully migrated
-- 4. Remove legacy tables after verification
```

---

## Success Metrics

1. **Booking Completion Rate**: Expect +15% with simplified flow
2. **Add-on Attachment Rate**: Expect +25% with day-specific visibility
3. **Average Order Value**: Expect +20% with vehicle upsells
4. **Agent Time Savings**: Expect -40% with catalog reuse
5. **Customer Satisfaction**: Expect +10 NPS with clearer flow

---

## Risk Mitigation

1. **Data Migration**: Run parallel systems during transition
2. **Agent Training**: Provide tutorial for new catalog system
3. **Rollback Plan**: Keep legacy models until fully stable
4. **Performance**: Index all new tables properly

---

*Document Version: 1.0*
*Created: January 2026*
*Author: SafariPlus Development Team*
