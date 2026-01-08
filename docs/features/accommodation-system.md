# SafariPlus - Accommodation Options System

## Status

- [x] Requirements Documented
- [x] Research Complete
- [x] Design Specification Complete
- [ ] Implementation Started
- [ ] Testing Complete
- [ ] Deployed

---

## Executive Summary

The Accommodation Options System enables agents to offer multiple accommodation tiers per location/day within their tour packages. This is a cornerstone of SafariPlus's package builder, allowing tourists to personalize their safari experience by choosing accommodations that match their budget and comfort preferences. The system supports five tiers from budget camping to ultra-luxury lodges, with dynamic pricing based on selection.

### Why This Matters

**Tourist Perspective:**
- "I want a Masai Mara safari, but I can't afford luxury lodges for all 3 nights"
- "We'd like to splurge on the first night and save on the rest"
- "Show me what I get at each price point so I can decide"

**Agent Perspective:**
- "I work with lodges across all price ranges"
- "I want to offer flexibility without creating separate packages"
- "I need to manage seasonal lodge pricing efficiently"

**Competitor Gap:**
Most safari platforms offer fixed packages OR require back-and-forth conversation to customize. SafariPlus provides instant, self-service customization.

---

## Research Findings

### How Competitors Handle Accommodations

| Platform | Model | Flexibility | Self-Service |
|----------|-------|-------------|--------------|
| SafariBookings | Fixed per package | None | No |
| TourRadar | Operator-defined | Via conversation | Limited |
| G Adventures | Fixed "Comfort Level" | None | No |
| Booking.com | Standalone rooms | N/A | Yes |
| Airbnb | Standalone properties | N/A | Yes |
| Expedia | Dynamic bundling | Full | Yes |

**Gap Identified**: No safari-specific platform offers Expedia-style dynamic accommodation selection within multi-day packages.

### Safari Accommodation Tiers (Industry Standard)

| Tier | Description | Price Range/Night | Examples |
|------|-------------|-------------------|----------|
| Budget | Basic camping/tented | $50-100 | Wildebeest Camp, Talek Bush Camp |
| Standard | Simple lodges/bandas | $100-200 | Sentrim Mara, Mara Sopa Lodge |
| Comfort | Quality lodges | $200-400 | Mara Serena, Sarova Mara |
| Luxury | Premium camps/lodges | $400-800 | Governors Camp, Fairmont Mara |
| Ultra-Luxury | Exclusive camps | $800-2000+ | Angama Mara, One&Only Nyungwe |

---

## System Overview

### Accommodation Hierarchy

```
Package Template
    |
    +-- Day 1: Nairobi to Masai Mara
    |       |
    |       +-- Accommodation Options
    |               |
    |               +-- Budget: Wildebeest Camp ($80/person)
    |               +-- Standard: Mara Sopa Lodge ($150/person)
    |               +-- Comfort: Mara Serena Safari Lodge ($250/person)
    |               +-- Luxury: Governors Camp ($450/person)
    |               +-- Ultra-Luxury: Angama Mara ($950/person)
    |
    +-- Day 2: Full Day in Masai Mara
    |       |
    |       +-- Accommodation Options
    |               |
    |               +-- [Same options OR different based on location]
    |
    +-- Day 3: Masai Mara to Nairobi
            |
            +-- No accommodation (departure day)
```

### Data Model

```typescript
// Core Accommodation Types

interface AccommodationOption {
  id: string;
  packageDayId: string;

  // Classification
  tier: AccommodationTier;
  category: AccommodationCategory;

  // Basic Info
  name: string;
  description: string;
  shortDescription: string;
  location: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };

  // Pricing
  pricing: AccommodationPricing;

  // Room Configuration
  roomTypes: RoomType[];
  defaultRoomType: string;

  // Capacity
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;

  // Amenities & Features
  amenities: string[];
  features: string[];
  highlights: string[];

  // Media
  images: AccommodationImage[];
  virtualTourUrl: string | null;

  // Ratings & Reviews
  starRating: number | null;      // Official star rating
  guestRating: number | null;     // Aggregate guest rating
  tripAdvisorId: string | null;
  tripAdvisorRating: number | null;

  // External Info
  website: string | null;
  bookingPolicies: string;
  cancellationPolicy: string;

  // Availability
  isAvailable: boolean;
  blackoutDates: Date[];
  seasonalAvailability: SeasonalAvailability[];

  // Agent Settings
  isDefault: boolean;             // Pre-selected option
  sortOrder: number;
  featured: boolean;
  notes: string;                  // Internal notes for agent

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

type AccommodationTier =
  | 'budget'
  | 'standard'
  | 'comfort'
  | 'luxury'
  | 'ultra_luxury';

type AccommodationCategory =
  | 'hotel'
  | 'lodge'
  | 'tented_camp'
  | 'permanent_tent'
  | 'mobile_camp'
  | 'bush_camp'
  | 'treehouse'
  | 'villa'
  | 'banda'
  | 'cottage';

interface AccommodationPricing {
  // Primary Pricing
  pricePerPerson: number;         // Per person per night
  pricePerRoom: number | null;    // Per room per night (alternative)
  pricingModel: 'per_person' | 'per_room';

  // Single Occupancy
  singleSupplementPercent: number;  // e.g., 25 = 25% extra for single
  singleSupplementFixed: number | null;

  // Child Pricing
  childPrice: number | null;      // Fixed price for children
  childPricePercent: number;      // Percentage of adult price
  childPricingModel: 'percentage' | 'fixed' | 'free';
  freeChildAge: number;           // Children under this age stay free

  // Currency
  currency: string;

  // Seasonal Pricing Overrides
  seasonalPricing: SeasonalPricingOverride[];
}

interface SeasonalPricingOverride {
  id: string;
  seasonName: string;
  startDate: Date;
  endDate: Date;
  pricePerPerson: number;
  pricePerRoom: number | null;
  isActive: boolean;
}

interface RoomType {
  id: string;
  name: string;                   // "Double Room", "Twin Room", "Family Suite"
  description: string;
  maxOccupancy: number;
  maxAdults: number;
  maxChildren: number;
  bedConfiguration: string;       // "1 King", "2 Singles", "1 King + 2 Singles"
  priceModifier: number;          // Additional cost (+50, +100, etc.)
  images: string[];
  amenities: string[];
  isDefault: boolean;
}

interface AccommodationImage {
  id: string;
  url: string;
  publicId: string;               // Cloudinary ID
  alt: string;
  category: ImageCategory;
  isPrimary: boolean;
  sortOrder: number;
}

type ImageCategory =
  | 'exterior'
  | 'room'
  | 'bathroom'
  | 'dining'
  | 'pool'
  | 'view'
  | 'activities'
  | 'other';
```

---

## User Stories

### Agent User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| A1 | Agent | Add multiple accommodation options per day/location | Tourists can choose their preferred tier | Must Have |
| A2 | Agent | Set different prices for each accommodation | I can accurately represent costs | Must Have |
| A3 | Agent | Upload images for each accommodation | Tourists can see what they're getting | Must Have |
| A4 | Agent | Mark one accommodation as default | There's a pre-selected option | Should Have |
| A5 | Agent | Add room types within accommodations | Tourists can choose Double/Twin/Family | Should Have |
| A6 | Agent | Set seasonal pricing overrides | Prices reflect lodge seasonal rates | Should Have |
| A7 | Agent | Set blackout dates per accommodation | Unavailable dates are blocked | Should Have |
| A8 | Agent | Add amenities and features list | Tourists can compare options | Should Have |
| A9 | Agent | Link to TripAdvisor or external reviews | Tourists can verify quality | Could Have |
| A10 | Agent | Bulk upload accommodations from template | I can quickly set up packages | Could Have |

### Tourist User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| T1 | Tourist | See all accommodation options per day | I can choose based on budget | Must Have |
| T2 | Tourist | See the price difference between tiers | I know how much extra luxury costs | Must Have |
| T3 | Tourist | View images of each accommodation | I can see what I'm paying for | Must Have |
| T4 | Tourist | Mix different tiers across days | I can balance budget and experience | Must Have |
| T5 | Tourist | See amenities and features | I can compare options | Should Have |
| T6 | Tourist | Read descriptions of each property | I understand what's included | Should Have |
| T7 | Tourist | See ratings and reviews | I can trust the quality | Should Have |
| T8 | Tourist | Select room type (Double/Twin) | I get the bed configuration I need | Should Have |
| T9 | Tourist | See total price update as I select | I know my running total | Must Have |
| T10 | Tourist | Keep the same accommodation across days | I don't have to reselect each day | Could Have |

---

## Acceptance Criteria

### Agent: Adding Accommodation Options

- [ ] Agent can add accommodation option to any day that requires accommodation
- [ ] Agent can select tier from predefined list (Budget to Ultra-Luxury)
- [ ] Agent can enter name, description, and location
- [ ] Agent can set price per person OR price per room
- [ ] Agent can upload multiple images (drag & drop, max 10)
- [ ] Agent can reorder images and set primary
- [ ] Agent can add amenities from predefined list + custom
- [ ] Agent can add room types with bed configurations
- [ ] Agent can set single supplement pricing
- [ ] Agent can set child pricing rules
- [ ] Agent can mark one option as default (pre-selected)
- [ ] Agent can set sort order for display
- [ ] Agent can set seasonal pricing overrides
- [ ] Agent can set blackout dates
- [ ] Agent can edit existing accommodation options
- [ ] Agent can delete accommodation options
- [ ] Agent can duplicate accommodation to other days
- [ ] Validation prevents duplicate tiers on same day

### Tourist: Selecting Accommodations

- [ ] Tourist sees list of accommodation options per day
- [ ] Options are sorted by tier (Budget first) or price
- [ ] Each option shows: name, tier badge, price, primary image, amenities
- [ ] Tourist can click to expand full details
- [ ] Tourist can view image gallery for each option
- [ ] Price shows per person per night
- [ ] Selecting an option updates total price immediately
- [ ] Visual indicator shows selected option
- [ ] Tourist can change selection at any time
- [ ] Tourist can select different tiers for different days
- [ ] "Apply to all days" option for same location
- [ ] Mobile-friendly selection interface
- [ ] Comparison view shows options side-by-side (desktop)

---

## Technical Design

### Database Schema

```sql
-- Accommodation Options
CREATE TABLE accommodation_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_day_id UUID NOT NULL REFERENCES package_days(id) ON DELETE CASCADE,

  -- Classification
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('budget', 'standard', 'comfort', 'luxury', 'ultra_luxury')),
  category VARCHAR(30) DEFAULT 'lodge',

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  location VARCHAR(255),
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Pricing
  price_per_person DECIMAL(10, 2) NOT NULL,
  price_per_room DECIMAL(10, 2),
  pricing_model VARCHAR(20) DEFAULT 'per_person',
  single_supplement_percent DECIMAL(5, 2) DEFAULT 0,
  single_supplement_fixed DECIMAL(10, 2),
  child_price DECIMAL(10, 2),
  child_price_percent DECIMAL(5, 2) DEFAULT 50,
  child_pricing_model VARCHAR(20) DEFAULT 'percentage',
  free_child_age INT DEFAULT 2,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Capacity
  max_occupancy INT DEFAULT 2,
  max_adults INT DEFAULT 2,
  max_children INT DEFAULT 2,

  -- Features
  amenities JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  highlights JSONB DEFAULT '[]',

  -- External
  star_rating INT CHECK (star_rating >= 1 AND star_rating <= 5),
  guest_rating DECIMAL(3, 2),
  tripadvisor_id VARCHAR(50),
  tripadvisor_rating DECIMAL(3, 2),
  website VARCHAR(500),
  booking_policies TEXT,
  cancellation_policy TEXT,

  -- Availability
  is_available BOOLEAN DEFAULT true,
  blackout_dates JSONB DEFAULT '[]',

  -- Agent Settings
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  UNIQUE(package_day_id, tier)
);

-- Accommodation Images
CREATE TABLE accommodation_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id UUID NOT NULL REFERENCES accommodation_options(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255),
  alt VARCHAR(255),
  category VARCHAR(30) DEFAULT 'other',
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room Types
CREATE TABLE room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id UUID NOT NULL REFERENCES accommodation_options(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_occupancy INT DEFAULT 2,
  max_adults INT DEFAULT 2,
  max_children INT DEFAULT 1,
  bed_configuration VARCHAR(100),
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  amenities JSONB DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room Type Images
CREATE TABLE room_type_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255),
  alt VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seasonal Pricing Overrides
CREATE TABLE accommodation_seasonal_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accommodation_id UUID NOT NULL REFERENCES accommodation_options(id) ON DELETE CASCADE,
  season_name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_person DECIMAL(10, 2) NOT NULL,
  price_per_room DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_accommodation_package_day ON accommodation_options(package_day_id);
CREATE INDEX idx_accommodation_tier ON accommodation_options(tier);
CREATE INDEX idx_accommodation_available ON accommodation_options(is_available);
CREATE INDEX idx_accommodation_images_acc ON accommodation_images(accommodation_id);
CREATE INDEX idx_room_types_acc ON room_types(accommodation_id);
CREATE INDEX idx_seasonal_pricing_acc ON accommodation_seasonal_pricing(accommodation_id);
CREATE INDEX idx_seasonal_pricing_dates ON accommodation_seasonal_pricing(start_date, end_date);
```

### API Endpoints

```typescript
// Agent Accommodation Management

// Create accommodation option
POST /api/agent/packages/:packageId/days/:dayId/accommodations
Body: {
  tier: string;
  name: string;
  description: string;
  pricePerPerson: number;
  category?: string;
  amenities?: string[];
  // ... other fields
}

// Get accommodations for a day
GET /api/agent/packages/:packageId/days/:dayId/accommodations

// Update accommodation
PUT /api/agent/accommodations/:accommodationId
Body: { ...partial accommodation data }

// Delete accommodation
DELETE /api/agent/accommodations/:accommodationId

// Duplicate accommodation to other days
POST /api/agent/accommodations/:accommodationId/duplicate
Body: {
  targetDayIds: string[];
}

// Upload accommodation images
POST /api/agent/accommodations/:accommodationId/images
Body: FormData with images

// Delete accommodation image
DELETE /api/agent/accommodations/:accommodationId/images/:imageId

// Reorder images
PUT /api/agent/accommodations/:accommodationId/images/reorder
Body: {
  imageIds: string[];  // In desired order
}

// Add room type
POST /api/agent/accommodations/:accommodationId/room-types
Body: {
  name: string;
  maxOccupancy: number;
  bedConfiguration: string;
  priceModifier: number;
}

// Update room type
PUT /api/agent/room-types/:roomTypeId

// Delete room type
DELETE /api/agent/room-types/:roomTypeId

// Set seasonal pricing
POST /api/agent/accommodations/:accommodationId/seasonal-pricing
Body: {
  seasonName: string;
  startDate: string;
  endDate: string;
  pricePerPerson: number;
}

// Tourist Accommodation Viewing

// Get all accommodations for a package
GET /api/packages/:packageId/accommodations

// Get accommodation details
GET /api/accommodations/:accommodationId

// Get accommodation images
GET /api/accommodations/:accommodationId/images

// Get room types
GET /api/accommodations/:accommodationId/room-types

// Check availability for dates
POST /api/accommodations/:accommodationId/check-availability
Body: {
  checkIn: string;
  checkOut: string;
}
```

---

## UX Design Specifications

### Agent: Accommodation Builder

#### Add Accommodation Modal

```
+------------------------------------------------------------------+
|  Add Accommodation for Day 1: Masai Mara              [X Close]  |
+------------------------------------------------------------------+
|                                                                   |
|  Accommodation Tier *                                             |
|  +----------------------------------------------------------+    |
|  | [ ] Budget       [ ] Standard    [x] Comfort              |    |
|  | [ ] Luxury       [ ] Ultra-Luxury                         |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Property Name *                                                  |
|  +----------------------------------------------------------+    |
|  | Mara Serena Safari Lodge                                  |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Short Description                                                |
|  +----------------------------------------------------------+    |
|  | Award-winning lodge overlooking the Mara Triangle         |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Full Description                                                 |
|  +----------------------------------------------------------+    |
|  |                                                           |    |
|  | [Rich text editor]                                        |    |
|  |                                                           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  --------------------- PRICING -----------------------            |
|                                                                   |
|  Pricing Model                                                    |
|  ( ) Per Person Per Night    (x) Per Room Per Night              |
|                                                                   |
|  Price Per Person *           Price Per Room                      |
|  +---------------+            +---------------+                   |
|  | $250          |            | $450          |                   |
|  +---------------+            +---------------+                   |
|                                                                   |
|  Single Supplement            Child Pricing                       |
|  +---------------+            +---------------------------+       |
|  | 25% extra     |            | 50% of adult price        |       |
|  +---------------+            +---------------------------+       |
|                                                                   |
|  --------------------- IMAGES -----------------------             |
|                                                                   |
|  +----------------------------------------------------------+    |
|  |  +------+  +------+  +------+  +------+                   |    |
|  |  | [img]|  | [img]|  | [img]|  |  +   |                   |    |
|  |  |  1   |  |  2   |  |  3   |  | Add  |                   |    |
|  |  +------+  +------+  +------+  +------+                   |    |
|  |  Drag to reorder                                          |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  --------------------- AMENITIES --------------------             |
|                                                                   |
|  +----------------------------------------------------------+    |
|  | [x] WiFi    [x] Pool    [x] Restaurant    [ ] Spa        |    |
|  | [x] Bar     [ ] Gym     [x] Game Drives   [x] Bush Walks |    |
|  | [ ] Kids Club  [x] Laundry  [ ] Room Service             |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  --------------------- SETTINGS ---------------------             |
|                                                                   |
|  [x] Set as default option                                        |
|  [ ] Feature this accommodation                                   |
|                                                                   |
|  +----------------------------------------------------------+    |
|  |             [Cancel]            [Save Accommodation]      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

#### Accommodations List View (Agent)

```
+------------------------------------------------------------------+
|  Day 1: Nairobi to Masai Mara                                    |
|  Accommodation Options (4)                         [+ Add Option] |
+------------------------------------------------------------------+
|                                                                   |
|  +--------------------------------------------------------------+|
|  | [img]  BUDGET - Wildebeest Camp                              ||
|  |        Tented camp in the Mara ecosystem                     ||
|  |        $80/person/night                                      ||
|  |        [Edit] [Duplicate] [Delete]                           ||
|  +--------------------------------------------------------------+|
|                                                                   |
|  +--------------------------------------------------------------+|
|  | [img]  STANDARD - Mara Sopa Lodge                  [Default] ||
|  |        Lodge with views of the Oloolaimutia Valley           ||
|  |        $150/person/night                                     ||
|  |        [Edit] [Duplicate] [Delete]                           ||
|  +--------------------------------------------------------------+|
|                                                                   |
|  +--------------------------------------------------------------+|
|  | [img]  COMFORT - Mara Serena Safari Lodge                    ||
|  |        Award-winning lodge overlooking Mara Triangle         ||
|  |        $250/person/night                                     ||
|  |        [Edit] [Duplicate] [Delete]                           ||
|  +--------------------------------------------------------------+|
|                                                                   |
|  +--------------------------------------------------------------+|
|  | [img]  LUXURY - Governors Camp                               ||
|  |        Classic tented camp on the Mara River                 ||
|  |        $450/person/night                                     ||
|  |        [Edit] [Duplicate] [Delete]                           ||
|  +--------------------------------------------------------------+|
|                                                                   |
+------------------------------------------------------------------+
```

### Tourist: Accommodation Selection

#### Desktop Selection Interface

```
+------------------------------------------------------------------+
|  Day 1: Masai Mara - Select Your Accommodation                    |
+------------------------------------------------------------------+
|                                                                   |
|  [All] [Budget] [Standard] [Comfort] [Luxury] [Ultra-Luxury]     |
|                                                                   |
|  +----------------------------+  +----------------------------+  |
|  | [Image Carousel]           |  | [Image Carousel]           |  |
|  |                            |  |                            |  |
|  | BUDGET                     |  | STANDARD                   |  |
|  | Wildebeest Camp            |  | Mara Sopa Lodge            |  |
|  |                            |  |                            |  |
|  | Tented camp experience     |  | Comfortable lodge stay     |  |
|  | in the heart of the Mara   |  | with valley views          |  |
|  |                            |  |                            |  |
|  | * Basic amenities          |  | * WiFi * Pool              |  |
|  | * Shared bathroom          |  | * Restaurant * Bar         |  |
|  | * Game drives              |  | * Game drives              |  |
|  |                            |  |                            |  |
|  | $80 / person / night       |  | $150 / person / night      |  |
|  |                            |  |                            |  |
|  | [Select]                   |  | [Selected] (checkmark)     |  |
|  +----------------------------+  +----------------------------+  |
|                                                                   |
|  +----------------------------+  +----------------------------+  |
|  | [Image Carousel]           |  | [Image Carousel]           |  |
|  |                            |  |                            |  |
|  | COMFORT                    |  | LUXURY                     |  |
|  | Mara Serena Safari Lodge   |  | Governors Camp             |  |
|  |                            |  |                            |  |
|  | Award-winning lodge with   |  | Classic safari experience  |  |
|  | stunning Mara views        |  | on the Mara River          |  |
|  |                            |  |                            |  |
|  | * WiFi * Pool * Spa        |  | * All-inclusive            |  |
|  | * Restaurant * Bar         |  | * River views              |  |
|  | * Bush walks               |  | * Premium game drives      |  |
|  |                            |  |                            |  |
|  | $250 / person / night      |  | $450 / person / night      |  |
|  | +$100 from selected        |  | +$300 from selected        |  |
|  |                            |  |                            |  |
|  | [Select]                   |  | [Select]                   |  |
|  +----------------------------+  +----------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  [x] Apply same accommodation to all Masai Mara days             |
|                                                                   |
+------------------------------------------------------------------+
```

#### Mobile Selection Interface

```
+----------------------------+
|  Day 1: Masai Mara         |
|  Select Accommodation      |
+----------------------------+
|                            |
| [Budget] [Standard] [More] |
|                            |
+----------------------------+
| [=======Image=======]      |
|                            |
| STANDARD                   |
| Mara Sopa Lodge            |
| -------------------------  |
| Comfortable lodge with     |
| stunning valley views      |
|                            |
| * WiFi  * Pool  * Bar      |
| * Restaurant               |
|                            |
| $150 / person / night      |
|                            |
| [View Details]  [Select]   |
|          (Selected)        |
+----------------------------+
|                            |
+----------------------------+
| [=======Image=======]      |
|                            |
| COMFORT                    |
| Mara Serena Safari Lodge   |
| -------------------------  |
| Award-winning lodge        |
|                            |
| * WiFi * Pool * Spa * Bar  |
|                            |
| $250 / person / night      |
| +$100 from current         |
|                            |
| [View Details]  [Select]   |
+----------------------------+
|                            |
| [x] Apply to all Mara days |
|                            |
+----------------------------+
```

#### Accommodation Details Modal

```
+------------------------------------------------------------------+
|  Mara Serena Safari Lodge                             [X Close]  |
+------------------------------------------------------------------+
|                                                                   |
|  [=============== Image Gallery Carousel ================]        |
|                                                                   |
|  [o] [o] [o] [o] [o]  (5 images)                                 |
|                                                                   |
+------------------------------------------------------------------+
|  COMFORT TIER          4.5/5 TripAdvisor | 4-Star               |
+------------------------------------------------------------------+
|                                                                   |
|  Award-winning lodge overlooking the Mara Triangle, offering     |
|  stunning views of the endless savannah and the annual Great     |
|  Migration. The lodge blends Maasai-inspired architecture with   |
|  modern comfort.                                                  |
|                                                                   |
|  HIGHLIGHTS                                                       |
|  - Panoramic views of the Mara Triangle                          |
|  - Traditional Maasai-inspired design                            |
|  - Award-winning safari experiences                              |
|  - Infinity pool overlooking the savannah                        |
|                                                                   |
|  AMENITIES                                                        |
|  +----------------------------------------------------------+    |
|  | WiFi | Swimming Pool | Restaurant | Bar | Spa             |    |
|  | Game Drives | Bush Walks | Sundowners | Laundry           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  ROOM TYPES                                                       |
|  +----------------------------------------------------------+    |
|  | ( ) Standard Room - $250/person                           |    |
|  |     Double or twin beds, valley view                      |    |
|  |                                                           |    |
|  | (x) Deluxe Room - $300/person (+$50)                      |    |
|  |     Larger room, private balcony, Mara view               |    |
|  |                                                           |    |
|  | ( ) Family Suite - $350/person (+$100)                    |    |
|  |     2 bedrooms, living area, 2 bathrooms                  |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  PRICING                                                          |
|  +----------------------------------------------------------+    |
|  | Per Person Per Night:     $300 (Deluxe Room selected)     |    |
|  | For 2 Adults, 1 Night:    $600                            |    |
|  | Single Supplement:        +25% for solo travelers         |    |
|  | Children (3-11):          50% of adult rate               |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  [Read Reviews on TripAdvisor]    [Visit Website]                |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  [Cancel]                              [Select This Accommodation]|
|                                                                   |
+------------------------------------------------------------------+
```

---

## Predefined Lists

### Amenities

```typescript
const ACCOMMODATION_AMENITIES = [
  // Basics
  'WiFi',
  'Air Conditioning',
  'Heating',
  'En-suite Bathroom',
  'Hot Water',
  'Electricity',
  'Solar Power',
  'Generator Backup',

  // Dining
  'Restaurant',
  'Bar',
  'Room Service',
  'Bush Breakfast',
  'Bush Dinner',
  'All-Inclusive',
  'Vegetarian Options',
  'Special Diets Catered',

  // Recreation
  'Swimming Pool',
  'Infinity Pool',
  'Spa',
  'Gym',
  'Library',
  'Games Room',
  'Firepit',
  'Sundeck',

  // Safari Activities
  'Game Drives',
  'Night Drives',
  'Walking Safaris',
  'Bush Walks',
  'Bird Watching',
  'Cultural Visits',
  'Balloon Safaris',

  // Family
  'Kids Club',
  'Family Rooms',
  'Babysitting',
  'Child-Friendly',

  // Services
  'Laundry Service',
  'Safari Shop',
  'Currency Exchange',
  'Doctor on Call',
  'Airport Transfers',

  // Eco
  'Eco-Friendly',
  'Solar Powered',
  'Community Owned',
  'Conservation Project',
];
```

### Categories

```typescript
const ACCOMMODATION_CATEGORIES = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'lodge', label: 'Safari Lodge' },
  { value: 'tented_camp', label: 'Tented Camp' },
  { value: 'permanent_tent', label: 'Permanent Tent' },
  { value: 'mobile_camp', label: 'Mobile Camp' },
  { value: 'bush_camp', label: 'Bush Camp' },
  { value: 'treehouse', label: 'Treehouse' },
  { value: 'villa', label: 'Private Villa' },
  { value: 'banda', label: 'Banda' },
  { value: 'cottage', label: 'Cottage' },
];
```

### Tier Descriptions

```typescript
const TIER_DESCRIPTIONS = {
  budget: {
    label: 'Budget',
    description: 'Basic, no-frills accommodation. May have shared facilities.',
    priceRange: '$50-100/night',
    color: '#6B7280', // Gray
  },
  standard: {
    label: 'Standard',
    description: 'Comfortable accommodation with essential amenities.',
    priceRange: '$100-200/night',
    color: '#10B981', // Green
  },
  comfort: {
    label: 'Comfort',
    description: 'Quality lodges with good amenities and service.',
    priceRange: '$200-400/night',
    color: '#3B82F6', // Blue
  },
  luxury: {
    label: 'Luxury',
    description: 'Premium camps and lodges with excellent service.',
    priceRange: '$400-800/night',
    color: '#8B5CF6', // Purple
  },
  ultra_luxury: {
    label: 'Ultra-Luxury',
    description: 'World-class, exclusive experiences with bespoke service.',
    priceRange: '$800+/night',
    color: '#F59E0B', // Gold
  },
};
```

---

## Validation Rules

### Agent Input Validation

```typescript
const accommodationValidation = {
  tier: {
    required: true,
    enum: ['budget', 'standard', 'comfort', 'luxury', 'ultra_luxury'],
  },
  name: {
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  description: {
    maxLength: 5000,
  },
  shortDescription: {
    maxLength: 500,
  },
  pricePerPerson: {
    required: true,
    min: 0,
    max: 100000,
  },
  images: {
    maxCount: 10,
    maxSizePerImage: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  amenities: {
    maxCount: 30,
    maxLengthPerItem: 50,
  },
};
```

### Business Rules

1. **One tier per day**: Cannot have two "Luxury" options on same day
2. **At least one option**: Each day requiring accommodation must have at least one option
3. **Default selection**: If no default set, lowest-priced option becomes default
4. **Price consistency**: Price cannot be negative
5. **Image requirements**: At least one image required for published packages

---

## Performance Considerations

1. **Image Optimization**: Use Cloudinary transformations for thumbnails
2. **Lazy Loading**: Load accommodation details on demand
3. **Caching**: Cache accommodation data for 1 hour
4. **Pagination**: If many accommodations, paginate API responses
5. **Indexing**: Index by package_day_id and tier for fast lookups

---

## Security Considerations

1. **Authorization**: Agents can only modify accommodations in their packages
2. **Input Sanitization**: Sanitize all text inputs (XSS prevention)
3. **Image Validation**: Verify uploaded files are valid images
4. **Rate Limiting**: Limit image uploads to prevent abuse
5. **Price Tampering**: Always calculate prices server-side

---

## Future Enhancements (Phase 2+)

1. **Availability Integration**: Real-time availability from lodge systems
2. **Dynamic Pricing Sync**: Automated seasonal price updates
3. **Review Aggregation**: Pull reviews from TripAdvisor API
4. **Map Integration**: Show accommodation location on map
5. **360 Virtual Tours**: Embed virtual tour experiences
6. **Comparison Tool**: Side-by-side detailed comparison

---

## Approval Checklist

- [ ] Data model approved
- [ ] API design approved
- [ ] UX design approved
- [ ] Validation rules approved
- [ ] Business rules approved

**Approver**: ____________________
**Date**: ____________________
**Notes**: ____________________

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial specification |
