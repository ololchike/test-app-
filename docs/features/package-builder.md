# SafariPlus - Tour Package Builder System

## Status

- [x] Requirements Documented
- [x] Research Complete
- [x] Design Specification Complete
- [ ] Implementation Started
- [ ] Testing Complete
- [ ] Deployed

---

## Executive Summary

The Tour Package Builder is SafariPlus's **KEY DIFFERENTIATOR** - a revolutionary system that transforms how safari packages are created, customized, and booked. Unlike competitors who offer rigid, fixed-price packages, SafariPlus enables agents to create flexible, customizable packages that tourists can personalize by selecting from multiple accommodation tiers and optional activities, with real-time dynamic pricing.

### Why This Matters

**Current Market Gap:**
- **G Adventures / Intrepid**: Offer "customizable" trips, but customization requires human specialist intervention and takes days
- **TourRadar**: Allows itinerary modifications through conversation page, but lacks real-time visual configuration
- **Viator / GetYourGuide**: Focus on day activities with simple variant selection (time slots, group size)
- **SafariBookings**: Lead generation only - no booking or pricing engine

**SafariPlus Solution:**
- Self-service visual package configurator similar to Tesla's car builder
- Real-time price updates as tourists select options
- No human intervention needed for standard customizations
- Agents create once, tourists configure infinitely

---

## Research Findings

### Competitor Analysis Summary

| Platform | Customization Model | Real-time Pricing | Self-Service | Accommodation Options |
|----------|--------------------|--------------------|--------------|----------------------|
| G Adventures | Human-assisted | No | Limited | Pre-selected |
| Intrepid Travel | Human-assisted | No | Limited | Pre-selected |
| TourRadar | Conversation-based | No | Limited | Via operator |
| Expedia | Dynamic Packaging | Yes | Yes | Hotel search |
| Tesla Configurator | Self-service | Yes | Yes | N/A |
| Dell PC Builder | Self-service | Yes | Yes | N/A |
| Nike By You | Self-service | Yes | Yes | N/A |

### Key Learnings from Best-in-Class Configurators

**From Tesla:**
- Visual-first: Show changes immediately
- Guided journey: Step-by-step progression
- Transparent pricing: Always show running total
- Emotional connection: Users "own" their configuration before buying

**From Dell PC Builder:**
- Component interdependency: Some options require/exclude others
- Clear categorization: Processor, Memory, Storage, etc.
- Comparison views: Compare configurations side-by-side
- Save and resume: Users can save partially configured products

**From Nike By You:**
- 3D visualization: Rotate and examine from all angles
- Personalization: Custom text, names, messages
- Social sharing: Share configured products with friends
- Mobile-first: Works beautifully on small screens

### Technical Best Practices Discovered

1. **Progressive Disclosure**: Don't overwhelm - reveal options in logical steps
2. **Rules Engine**: Backend validation of compatible options
3. **Price Cache**: Calculate prices in milliseconds, not seconds
4. **Microservices Architecture**: Separate pricing engine from configuration logic
5. **Real-time Updates**: WebSocket or polling for instant feedback

---

## System Overview

### The Package Builder Ecosystem

```
+------------------------------------------------------------------+
|                        AGENT SIDE                                |
|  +------------------------------------------------------------+  |
|  |              Package Template Builder                       |  |
|  |  - Define base itinerary (days, locations)                 |  |
|  |  - Add accommodation options per location (tiers/prices)   |  |
|  |  - Add optional activities (add-ons)                       |  |
|  |  - Set pricing rules (seasonal, group size)                |  |
|  |  - Configure availability and blackout dates               |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                     PRICING ENGINE                               |
|  +------------------------------------------------------------+  |
|  |  - Base package price calculation                          |  |
|  |  - Accommodation tier pricing                              |  |
|  |  - Activity add-on pricing                                 |  |
|  |  - Seasonal adjustments                                    |  |
|  |  - Group size adjustments                                  |  |
|  |  - Child/infant pricing                                    |  |
|  |  - Real-time total calculation                             |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                       TOURIST SIDE                               |
|  +------------------------------------------------------------+  |
|  |             Package Configurator Interface                  |  |
|  |  - Visual day-by-day itinerary                             |  |
|  |  - Accommodation selection per day                         |  |
|  |  - Activity add-on selection                               |  |
|  |  - Real-time price display                                 |  |
|  |  - Save & share configuration                              |  |
|  |  - Proceed to booking                                      |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

---

## Feature Specifications

### 1. Package Template Structure

A package template consists of:

```typescript
interface PackageTemplate {
  id: string;
  agentId: string;

  // Basic Information
  title: string;
  slug: string;
  description: string;
  shortDescription: string;

  // Duration & Structure
  totalDays: number;
  totalNights: number;
  days: PackageDay[];

  // Base Pricing
  basePrice: number;           // Minimum price (budget options)
  baseCurrency: string;
  priceType: 'per_person' | 'per_group';

  // Group Configuration
  minGroupSize: number;
  maxGroupSize: number;
  childPolicy: ChildPricingPolicy;

  // Inclusions (always included in base)
  baseInclusions: string[];
  baseExclusions: string[];

  // Activities (optional add-ons)
  activities: PackageActivity[];

  // Availability
  availableFrom: Date;
  availableTo: Date;
  blackoutDates: Date[];
  departureSchedule: DepartureSchedule;

  // Seasonal Pricing
  seasonalPricing: SeasonalPricing[];

  // Media
  images: PackageImage[];

  // Status
  status: 'draft' | 'published' | 'archived';
  featured: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Package Day Structure

Each day of the itinerary can have multiple accommodation options:

```typescript
interface PackageDay {
  dayNumber: number;
  title: string;                    // e.g., "Masai Mara Game Drive"
  description: string;
  location: string;                 // e.g., "Masai Mara National Reserve"

  // Activities for this day (included in base)
  includedActivities: string[];     // e.g., ["Morning game drive", "Evening sundowner"]

  // Meals included
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };

  // Accommodation Options (tourists choose one)
  accommodationOptions: AccommodationOption[];

  // Is accommodation required for this day?
  // (false for last day which typically ends with departure)
  requiresAccommodation: boolean;

  // Transfer/Transport details
  transfer: TransferDetails | null;
}
```

### 3. Accommodation Options

```typescript
interface AccommodationOption {
  id: string;
  tier: 'budget' | 'standard' | 'comfort' | 'luxury' | 'ultra_luxury';
  name: string;                     // e.g., "Mara Bush Camp"
  description: string;
  location: string;

  // Pricing (additional cost on top of base)
  pricePerPerson: number;           // Additional price per person per night
  pricePerRoom: number;             // Or per room (for family rooms)
  pricingModel: 'per_person' | 'per_room';

  // Room Types Available
  roomTypes: RoomType[];

  // Capacity
  maxOccupancy: number;

  // Amenities
  amenities: string[];

  // Images
  images: string[];

  // External Links
  website: string | null;

  // Availability
  isAvailable: boolean;
  blackoutDates: Date[];

  // Metadata
  starRating: number | null;        // 1-5 stars
  tripAdvisorRating: number | null;

  // For sorting/display
  sortOrder: number;
  isDefault: boolean;               // Pre-selected option
}

interface RoomType {
  id: string;
  name: string;                     // "Double Room", "Twin Room", "Family Suite"
  description: string;
  maxAdults: number;
  maxChildren: number;
  priceModifier: number;            // Additional cost for this room type
  images: string[];
}
```

### 4. Activity Add-ons

```typescript
interface PackageActivity {
  id: string;
  name: string;                     // e.g., "Hot Air Balloon Safari"
  description: string;

  // When can this activity be added?
  availableOnDays: number[];        // [1, 2] = Day 1 and Day 2 only
  // Or...
  availableAtLocation: string;      // "Masai Mara" - available when in Mara

  // Pricing
  pricePerPerson: number;
  pricePerGroup: number | null;     // Some activities have flat group rate
  pricingModel: 'per_person' | 'per_group' | 'per_person_with_minimum';
  minimumParticipants: number;
  maximumParticipants: number | null;

  // Duration
  duration: string;                 // e.g., "3 hours", "Full day"

  // Category
  category: ActivityCategory;

  // Requirements
  requirements: string[];           // e.g., ["Minimum age 7", "No heart conditions"]

  // What's included
  inclusions: string[];

  // Images
  images: string[];

  // Availability
  isAvailable: boolean;
  seasonalAvailability: SeasonalAvailability | null;

  // Popularity/sorting
  sortOrder: number;
  isPopular: boolean;
  bookingCount: number;
}

type ActivityCategory =
  | 'adventure'        // Hot air balloon, bungee
  | 'wildlife'         // Game drives, walking safaris
  | 'cultural'         // Village visits, Maasai experiences
  | 'dining'           // Bush dinner, sundowner
  | 'wellness'         // Spa, yoga
  | 'photography'      // Photography safaris
  | 'water'            // Boat rides, snorkeling
  | 'other';
```

### 5. Child Pricing Policy

```typescript
interface ChildPricingPolicy {
  // Age Bands
  infantAge: { min: number; max: number };    // e.g., 0-2
  childAge: { min: number; max: number };     // e.g., 3-11
  teenAge: { min: number; max: number };      // e.g., 12-17
  // 18+ = adult

  // Pricing Rules
  infantPolicy: {
    priceType: 'free' | 'percentage' | 'fixed';
    percentage?: number;              // e.g., 10 = 10% of adult price
    fixedAmount?: number;
    maxFreePerRoom: number;           // Max free infants per room
  };

  childPolicy: {
    priceType: 'percentage' | 'fixed';
    percentage?: number;              // e.g., 50 = 50% of adult price
    fixedAmount?: number;
    sharingDiscount: number;          // Discount if sharing with adults
  };

  teenPolicy: {
    priceType: 'percentage' | 'fixed' | 'adult';
    percentage?: number;
    fixedAmount?: number;
  };

  // Restrictions
  minAdultsRequired: number;          // e.g., 1 adult per 2 children
  maxChildrenPerRoom: number;
  childrenAllowed: boolean;           // Some luxury lodges are adults-only
}
```

### 6. Seasonal Pricing

```typescript
interface SeasonalPricing {
  id: string;
  name: string;                       // "High Season", "Green Season"

  // Date Ranges
  dateRanges: DateRange[];            // Multiple ranges for same season

  // Price Adjustment
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;            // e.g., 20 = 20% increase

  // Which components affected
  affectsBase: boolean;
  affectsAccommodation: boolean;
  affectsActivities: boolean;

  // Priority (higher wins in overlap)
  priority: number;
}

interface DateRange {
  startDate: Date;
  endDate: Date;
  year: number | null;                // null = recurring yearly
}
```

---

## User Stories

### Agent User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| A1 | Agent | Create a package template with multiple days | I can offer multi-day safari experiences | Must Have |
| A2 | Agent | Add multiple accommodation options per location | Tourists can choose their preferred comfort level | Must Have |
| A3 | Agent | Set different prices for each accommodation tier | I can offer budget to luxury options | Must Have |
| A4 | Agent | Add optional activities that tourists can include | Tourists can enhance their experience | Must Have |
| A5 | Agent | Configure seasonal pricing adjustments | Prices reflect high/low season rates | Should Have |
| A6 | Agent | Set child pricing policies | Families can see accurate pricing | Should Have |
| A7 | Agent | Define blackout dates for accommodations | I can manage availability accurately | Should Have |
| A8 | Agent | Duplicate an existing package template | I can quickly create variations | Could Have |
| A9 | Agent | Set minimum/maximum group sizes | I can manage capacity properly | Should Have |
| A10 | Agent | Preview the package as tourists will see it | I can verify the configuration is correct | Must Have |

### Tourist User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| T1 | Tourist | See a visual day-by-day itinerary | I understand what the trip includes | Must Have |
| T2 | Tourist | Choose my accommodation for each day | I can select my preferred comfort level | Must Have |
| T3 | Tourist | Mix and match accommodation tiers | I can balance budget across the trip | Must Have |
| T4 | Tourist | See the price update in real-time | I know exactly what I'll pay | Must Have |
| T5 | Tourist | Add optional activities to my package | I can customize my experience | Must Have |
| T6 | Tourist | Compare accommodation options side-by-side | I can make informed decisions | Should Have |
| T7 | Tourist | Save my configured package | I can return later to book | Should Have |
| T8 | Tourist | Share my configuration with travel companions | We can decide together | Could Have |
| T9 | Tourist | See clear price breakdowns | I understand what I'm paying for | Must Have |
| T10 | Tourist | Specify child/infant travelers | I get accurate family pricing | Should Have |

---

## Acceptance Criteria

### Package Template Creation (Agent)

- [ ] Agent can create a new package template with title, description, and duration
- [ ] Agent can add days to the package with location and activities
- [ ] Agent can add multiple accommodation options per day/location
- [ ] Agent can set base price and accommodation tier prices
- [ ] Agent can add optional activities with pricing
- [ ] Agent can configure child pricing policies
- [ ] Agent can set seasonal pricing rules
- [ ] Agent can set blackout dates and availability windows
- [ ] Agent can preview the package as tourists see it
- [ ] Agent can save as draft or publish immediately
- [ ] Agent can edit existing package templates
- [ ] Agent can duplicate package templates
- [ ] Agent can archive package templates
- [ ] Validation prevents invalid configurations (e.g., no accommodations)

### Package Configurator (Tourist)

- [ ] Tourist sees visual day-by-day itinerary
- [ ] Tourist can select accommodation for each day from available options
- [ ] Price updates in real-time (< 200ms) as selections change
- [ ] Tourist can add/remove optional activities
- [ ] Tourist can specify number of adults, children, and infants
- [ ] Price breakdown shows: base + accommodations + activities + seasonal = total
- [ ] Tourist can proceed to booking with configured package
- [ ] Tourist can save configuration for later
- [ ] Tourist can share configuration via link
- [ ] Mobile-responsive design works on all devices
- [ ] Accommodations show images, descriptions, and amenities
- [ ] Activities show descriptions, duration, and requirements

### Pricing Engine

- [ ] Calculates base price correctly
- [ ] Adds accommodation costs based on selections
- [ ] Adds activity costs correctly
- [ ] Applies seasonal pricing adjustments
- [ ] Calculates group size discounts
- [ ] Applies child/infant pricing rules
- [ ] Shows price in user's preferred currency
- [ ] Calculation completes in < 200ms
- [ ] Handles edge cases (single traveler, large groups, all options)

---

## Technical Design

### Database Schema Extensions

See `database-schema.md` for complete schema, but key additions:

```sql
-- Package Templates
CREATE TABLE package_templates (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  total_days INT NOT NULL,
  total_nights INT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  base_currency VARCHAR(3) DEFAULT 'USD',
  price_type VARCHAR(20) DEFAULT 'per_person',
  min_group_size INT DEFAULT 1,
  max_group_size INT DEFAULT 10,
  available_from DATE,
  available_to DATE,
  status VARCHAR(20) DEFAULT 'draft',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Package Days
CREATE TABLE package_days (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES package_templates(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  meals_breakfast BOOLEAN DEFAULT true,
  meals_lunch BOOLEAN DEFAULT true,
  meals_dinner BOOLEAN DEFAULT true,
  requires_accommodation BOOLEAN DEFAULT true,
  included_activities JSONB DEFAULT '[]',
  transfer_details JSONB,
  UNIQUE(package_id, day_number)
);

-- Accommodation Options
CREATE TABLE accommodation_options (
  id UUID PRIMARY KEY,
  package_day_id UUID REFERENCES package_days(id) ON DELETE CASCADE,
  tier VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  price_per_person DECIMAL(10,2) NOT NULL,
  pricing_model VARCHAR(20) DEFAULT 'per_person',
  amenities JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  max_occupancy INT DEFAULT 2,
  star_rating INT,
  is_available BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  blackout_dates JSONB DEFAULT '[]'
);

-- Activity Add-ons
CREATE TABLE package_activities (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES package_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price_per_person DECIMAL(10,2) NOT NULL,
  price_per_group DECIMAL(10,2),
  pricing_model VARCHAR(50) DEFAULT 'per_person',
  min_participants INT DEFAULT 1,
  max_participants INT,
  duration VARCHAR(100),
  available_on_days JSONB DEFAULT '[]',
  available_at_location VARCHAR(255),
  requirements JSONB DEFAULT '[]',
  inclusions JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- Child Pricing Policies
CREATE TABLE child_pricing_policies (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES package_templates(id) ON DELETE CASCADE,
  infant_min_age INT DEFAULT 0,
  infant_max_age INT DEFAULT 2,
  child_min_age INT DEFAULT 3,
  child_max_age INT DEFAULT 11,
  teen_min_age INT DEFAULT 12,
  teen_max_age INT DEFAULT 17,
  infant_price_type VARCHAR(20) DEFAULT 'free',
  infant_percentage INT DEFAULT 0,
  child_price_type VARCHAR(20) DEFAULT 'percentage',
  child_percentage INT DEFAULT 50,
  teen_price_type VARCHAR(20) DEFAULT 'adult',
  teen_percentage INT DEFAULT 100,
  min_adults_required INT DEFAULT 1,
  max_children_per_room INT DEFAULT 2,
  children_allowed BOOLEAN DEFAULT true,
  UNIQUE(package_id)
);

-- Seasonal Pricing
CREATE TABLE seasonal_pricing (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES package_templates(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  adjustment_type VARCHAR(20) DEFAULT 'percentage',
  adjustment_value DECIMAL(10,2) NOT NULL,
  affects_base BOOLEAN DEFAULT true,
  affects_accommodation BOOLEAN DEFAULT true,
  affects_activities BOOLEAN DEFAULT false,
  priority INT DEFAULT 0
);

-- Seasonal Pricing Date Ranges
CREATE TABLE seasonal_date_ranges (
  id UUID PRIMARY KEY,
  seasonal_pricing_id UUID REFERENCES seasonal_pricing(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  recurring_yearly BOOLEAN DEFAULT true
);

-- Saved Configurations (Tourist)
CREATE TABLE saved_configurations (
  id UUID PRIMARY KEY,
  package_id UUID REFERENCES package_templates(id),
  user_id UUID REFERENCES users(id),
  configuration JSONB NOT NULL,
  total_price DECIMAL(10,2),
  share_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints

```typescript
// Agent Package Management
POST   /api/agent/packages                    // Create package template
GET    /api/agent/packages                    // List agent's packages
GET    /api/agent/packages/:id                // Get package details
PUT    /api/agent/packages/:id                // Update package
DELETE /api/agent/packages/:id                // Delete package
POST   /api/agent/packages/:id/duplicate      // Duplicate package
POST   /api/agent/packages/:id/publish        // Publish package
POST   /api/agent/packages/:id/archive        // Archive package

// Package Days
POST   /api/agent/packages/:id/days           // Add day
PUT    /api/agent/packages/:id/days/:dayId    // Update day
DELETE /api/agent/packages/:id/days/:dayId    // Delete day

// Accommodations
POST   /api/agent/packages/:id/days/:dayId/accommodations
PUT    /api/agent/accommodations/:id
DELETE /api/agent/accommodations/:id

// Activities
POST   /api/agent/packages/:id/activities
PUT    /api/agent/activities/:id
DELETE /api/agent/activities/:id

// Pricing Rules
PUT    /api/agent/packages/:id/child-policy
POST   /api/agent/packages/:id/seasonal-pricing
PUT    /api/agent/seasonal-pricing/:id
DELETE /api/agent/seasonal-pricing/:id

// Tourist Package Browsing
GET    /api/packages                          // List published packages
GET    /api/packages/:slug                    // Get package for configuration
POST   /api/packages/:id/configure            // Calculate price for configuration
POST   /api/packages/:id/save-config          // Save configuration
GET    /api/configurations/:shareToken        // Get shared configuration

// Pricing Engine (Internal)
POST   /api/pricing/calculate                 // Calculate total price
GET    /api/pricing/breakdown/:configId       // Get detailed breakdown
```

### Pricing Engine Architecture

```typescript
// services/pricing-engine.ts

interface PricingRequest {
  packageId: string;
  travelDate: Date;
  travelers: {
    adults: number;
    children: number;      // Ages 3-11
    teens: number;         // Ages 12-17
    infants: number;       // Ages 0-2
  };
  accommodationSelections: {
    dayNumber: number;
    accommodationOptionId: string;
    roomTypeId?: string;
  }[];
  activitySelections: string[];   // Activity IDs
  promoCode?: string;
}

interface PricingResponse {
  success: boolean;
  calculation: {
    // Base Package
    basePrice: number;
    basePricePerPerson: number;

    // Accommodations
    accommodationTotal: number;
    accommodationBreakdown: {
      day: number;
      name: string;
      tier: string;
      pricePerPerson: number;
      totalForTravelers: number;
    }[];

    // Activities
    activitiesTotal: number;
    activitiesBreakdown: {
      name: string;
      pricePerPerson: number;
      totalForTravelers: number;
    }[];

    // Adjustments
    seasonalAdjustment: number;
    seasonName: string | null;

    // Group/Child Discounts
    childDiscount: number;
    teenDiscount: number;
    infantCharges: number;

    // Promo
    promoDiscount: number;
    promoCode: string | null;

    // Totals
    subtotal: number;
    totalDiscount: number;
    finalTotal: number;

    // Per Person
    pricePerAdult: number;
    pricePerChild: number;
    pricePerTeen: number;
    pricePerInfant: number;

    // Currency
    currency: string;
  };

  // Warnings/Info
  warnings: string[];

  // Cache
  calculatedAt: Date;
  cacheKey: string;
}

class PricingEngine {
  async calculatePrice(request: PricingRequest): Promise<PricingResponse> {
    // 1. Fetch package template with all options
    // 2. Validate selections
    // 3. Calculate base price
    // 4. Add accommodation costs
    // 5. Add activity costs
    // 6. Apply seasonal adjustments
    // 7. Apply child/teen pricing
    // 8. Apply promo codes
    // 9. Return detailed breakdown
  }
}
```

---

## UX Design Specifications

### Tourist Package Configurator Interface

#### Desktop Layout (1200px+)

```
+------------------------------------------------------------------+
|  HEADER - Logo | Navigation | Currency | Login                   |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------+  +----------------------------------+ |
|  |   PACKAGE PREVIEW      |  |        ITINERARY                | |
|  |   (Image Carousel)     |  |                                  | |
|  |                        |  |  Day 1: Nairobi to Masai Mara    | |
|  |   [< >]                |  |  [Select Accommodation v]        | |
|  |                        |  |                                  | |
|  |   Package Title        |  |   [ ] Mara Bush Camp - $80      | |
|  |   Rating | Reviews     |  |   [x] Mara Serena Lodge - $150  | |
|  |                        |  |   [ ] Governors Camp - $300     | |
|  +------------------------+  |                                  | |
|                              |  Day 2: Full Day Safari          | |
|  +------------------------+  |  [Same as Day 1]                 | |
|  |   YOUR SELECTION       |  |                                  | |
|  |                        |  |  Day 3: Mara to Nairobi          | |
|  |   3 Adults, 1 Child    |  |  (No accommodation needed)       | |
|  |   [Edit Group]         |  |                                  | |
|  |                        |  +----------------------------------+ |
|  |   Base Package: $450   |  |                                  | |
|  |   Accommodations: $450 |  |        OPTIONAL ACTIVITIES       | |
|  |   Activities: $500     |  |                                  | |
|  |   ----------------     |  |  [ ] Hot Air Balloon - $450/pp   | |
|  |   TOTAL: $1,400        |  |  [ ] Bush Dinner - $120/pp       | |
|  |                        |  |  [ ] Maasai Village - $50/pp     | |
|  |   [BOOK NOW]           |  |                                  | |
|  |                        |  +----------------------------------+ |
|  |   [Save] [Share]       |                                      |
|  +------------------------+                                      |
|                                                                   |
+------------------------------------------------------------------+
```

#### Mobile Layout (< 768px)

```
+----------------------------+
|  HEADER - Menu | Currency  |
+----------------------------+
|                            |
|  [Image Carousel]          |
|                            |
|  Package Title             |
|  Rating | Duration | Group |
|                            |
+----------------------------+
|  [ 3 Adults ] [ 1 Child ]  |
|       [Edit Group]         |
+----------------------------+
|                            |
|  DAY 1: Masai Mara         |
|  Morning arrival, game...  |
|                            |
|  SELECT ACCOMMODATION:     |
|  +------------------------+|
|  | [img] Mara Bush Camp   ||
|  | Budget | $80/person    ||
|  | [Select]               ||
|  +------------------------+|
|  +------------------------+|
|  | [img] Serena Lodge     ||
|  | Comfort | $150/person  ||
|  | [Select] (Selected)    ||
|  +------------------------+|
|                            |
|  DAY 2: Safari Day         |
|  ...                       |
|                            |
+----------------------------+
|  ADD ACTIVITIES:           |
|  +------------------------+|
|  | Hot Air Balloon        ||
|  | $450/person            ||
|  | [+Add]                 ||
|  +------------------------+|
+----------------------------+
|                            |
|  +----------------------+  |
|  | YOUR TOTAL           |  |
|  | Base: $450           |  |
|  | Accommodations: $450 |  |
|  | Activities: $500     |  |
|  | ---------------      |  |
|  | TOTAL: $1,400        |  |
|  |                      |  |
|  | [BOOK NOW - $1,400]  |  |
|  +----------------------+  |
|                            |
+----------------------------+
```

### Progressive Disclosure Flow

1. **Step 1**: Choose dates and group composition
2. **Step 2**: Review base itinerary
3. **Step 3**: Select accommodations (day by day)
4. **Step 4**: Add optional activities
5. **Step 5**: Review total and proceed to booking

### Real-time Price Update

- Price updates within 200ms of any selection change
- Subtle animation highlights price changes
- Breakdown always visible in sidebar (desktop) or sticky footer (mobile)
- Color coding: Green for savings, neutral for additions

---

## Integration Points

### With Existing Systems

| System | Integration |
|--------|-------------|
| Tours Module | Packages extend tours with flexibility |
| Bookings Module | Configured packages become bookings |
| Payments Module | Total price feeds into Pesapal flow |
| Agent Dashboard | Package builder in tour management |
| Search/Discovery | Packages appear in search results |

### External Integrations (Future)

- **Channel Manager**: Sync accommodation availability
- **GDS/OTA**: Distribute packages to external platforms
- **Analytics**: Track configuration-to-booking conversion

---

## MVP vs Future Scope

### MVP (Phase 1)

- [x] Package template creation (agent)
- [x] Multiple accommodation tiers per day
- [x] Activity add-ons
- [x] Real-time pricing calculation
- [x] Tourist configuration interface
- [x] Basic child pricing (percentage of adult)
- [x] Save configuration
- [x] Mobile-responsive design

### Phase 2 Enhancements

- [ ] Advanced seasonal pricing rules
- [ ] Room type selection within accommodations
- [ ] Accommodation availability sync
- [ ] Package comparison tool
- [ ] Share configuration via link
- [ ] PDF itinerary generation

### Phase 3 Enhancements

- [ ] AI-powered package recommendations
- [ ] Multi-currency real-time conversion
- [ ] Group booking management
- [ ] Agent collaboration on packages
- [ ] White-label package builder for agents

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Price calculation response time | < 200ms |
| Package page load time | < 2s (3G) |
| Configuration save time | < 1s |
| Image lazy loading | Progressive |
| Offline support | View cached packages |

---

## Testing Requirements

### Unit Tests

- Pricing engine calculations
- Child pricing rules
- Seasonal pricing application
- Discount calculations

### Integration Tests

- Package creation flow
- Configuration save/load
- Booking creation from configuration
- Price consistency across sessions

### E2E Tests

- Complete agent package creation
- Complete tourist configuration flow
- Mobile responsive behavior
- Price updates on selection change

### Performance Tests

- Pricing calculation under load
- Concurrent configurations
- Large package templates (10+ days)

---

## Security Considerations

1. **Price Integrity**: Server-side price calculation; never trust client
2. **Configuration Validation**: Validate all selections server-side before booking
3. **Rate Limiting**: Prevent pricing API abuse
4. **Authorization**: Agents can only modify their own packages
5. **Data Sanitization**: Sanitize all user inputs in descriptions

---

## Approval Checklist

- [ ] Feature specification approved
- [ ] Database schema approved
- [ ] API design approved
- [ ] UX design approved
- [ ] MVP scope agreed

**Approver**: ____________________
**Date**: ____________________
**Notes**: ____________________

---

## Sources & References

- [G Adventures Private Travel](https://www.gadventures.com/travel-styles/private-travel/)
- [Intrepid Tailor-Made](https://www.intrepidtravel.com/us/tailor-made)
- [TourRadar Direct Booking Solution](https://operator.tourradar.com/direct-booking-solution)
- [Expedia Dynamic Packaging](https://www.altexsoft.com/blog/dynamic-packaging-solutions-for-online-booking-engines-building-one-stop-shop-for-travel-experience/)
- [Tesla Design Studio](https://www.tesla.com/model3/design)
- [Dell Custom PCs](https://www.dell.com/en-us/lp/customizable-pcs)
- [Nike By You](https://www.nike.com/nike-by-you)
- [Progressive Disclosure UX](https://www.nngroup.com/articles/progressive-disclosure/)
- [Product Configurator Best Practices](https://factory.dev/blog/product-configurator-best-practices)
- [Real-time Pricing Engine Architecture](https://zilliant.com/blog/what-is-a-real-time-pricing-engine)
- [Booking.com Child Pricing](https://partner.booking.com/en-us/help/rates-availability/rates-special-offers/setting-flexible-children-rates)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial specification |
