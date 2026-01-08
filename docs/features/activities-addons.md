# SafariPlus - Optional Activities & Add-ons System

## Status

- [x] Requirements Documented
- [x] Research Complete
- [x] Design Specification Complete
- [ ] Implementation Started
- [ ] Testing Complete
- [ ] Deployed

---

## Executive Summary

The Optional Activities & Add-ons System enables agents to offer extra experiences that tourists can add to their base package. These activities enhance the safari experience beyond the standard itinerary, allowing tourists to personalize their trip with unique adventures like hot air balloon rides, bush dinners, cultural visits, and more. The system handles complex pricing models including per-person, per-group, and minimum-participant pricing.

### Why This Matters

**Tourist Perspective:**
- "The base package looks great, but I'd love to add a balloon safari"
- "We want to do something special for our anniversary - what's available?"
- "My kids would love to visit a Maasai village"

**Agent Perspective:**
- "Hot air balloons are my highest-margin add-on"
- "I want to upsell without being pushy"
- "Some activities are location-specific and only available on certain days"

**Business Impact:**
- Activities add-ons can increase booking value by 20-40%
- Higher customer satisfaction through personalization
- Competitive advantage over fixed-package competitors

---

## Research Findings

### How Competitors Handle Activities

| Platform | Model | Discovery | Pricing |
|----------|-------|-----------|---------|
| Viator | Standalone activities | Search/browse | Per person |
| GetYourGuide | Standalone activities | Search/browse | Per person |
| G Adventures | Included OR "My Own Room" type | Fixed list | Fixed |
| Intrepid | Pre-defined options | At booking | Fixed |
| TourRadar | Optional extras via operator | Conversation | Variable |
| Klook | Standalone + bundles | Search | Per person |

**Gap Identified**: No platform integrates activities as add-ons within multi-day package configurators with real-time pricing.

### Popular Safari Add-on Activities

| Category | Activity | Typical Price | Availability |
|----------|----------|---------------|--------------|
| Adventure | Hot Air Balloon | $400-500 | Mara, Serengeti |
| Adventure | Quad Biking | $80-150 | Various |
| Wildlife | Night Game Drive | $50-100 | Select parks |
| Wildlife | Walking Safari | $50-150 | Most areas |
| Cultural | Maasai Village Visit | $30-50 | Mara, Amboseli |
| Cultural | Community Project Visit | $20-40 | Various |
| Dining | Bush Dinner | $80-150 | Camps/Lodges |
| Dining | Sundowner | $40-80 | Most locations |
| Wellness | Spa Treatment | $50-200 | Luxury lodges |
| Photography | Photo Safari | $100-300 | Various |
| Water | Boat Safari | $50-100 | Lake areas |
| Water | Snorkeling/Diving | $60-150 | Coast |

---

## System Overview

### Activity Hierarchy

```
Package Template
    |
    +-- Activities (Package-Level Add-ons)
            |
            +-- Hot Air Balloon Safari
            |       Location: Masai Mara
            |       Available Days: [1, 2]
            |       Price: $450/person
            |
            +-- Bush Dinner Experience
            |       Location: Any camp
            |       Available Days: [1, 2, 3]
            |       Price: $120/person
            |
            +-- Maasai Village Visit
            |       Location: Masai Mara
            |       Available Days: [1, 2]
            |       Price: $50/person
            |
            +-- Night Game Drive
                    Location: Specific conservancy
                    Available Days: [2]
                    Price: $80/person
```

### Data Model

```typescript
// Core Activity Types

interface PackageActivity {
  id: string;
  packageId: string;

  // Basic Info
  name: string;
  description: string;
  shortDescription: string;
  duration: string;                // e.g., "3 hours", "Half day", "Full day"

  // Category
  category: ActivityCategory;
  subcategory: string | null;

  // Availability
  availabilityType: 'all_days' | 'specific_days' | 'specific_location';
  availableOnDays: number[];       // [1, 2, 3] = Day 1, 2, 3
  availableAtLocations: string[];  // ["Masai Mara", "Amboseli"]
  availableTimeSlots: TimeSlot[];

  // Pricing
  pricing: ActivityPricing;

  // Requirements & Restrictions
  requirements: ActivityRequirement[];
  restrictions: ActivityRestriction[];
  minAge: number | null;
  maxAge: number | null;
  fitnessLevel: FitnessLevel;
  accessibility: string[];

  // What's Included
  inclusions: string[];
  exclusions: string[];
  whatToBring: string[];

  // Media
  images: ActivityImage[];
  videoUrl: string | null;

  // Popularity & Sorting
  isPopular: boolean;
  isFeatured: boolean;
  sortOrder: number;
  bookingCount: number;

  // External Provider
  providerId: string | null;       // If third-party
  providerName: string | null;
  providerContact: string | null;

  // Status
  isAvailable: boolean;
  seasonalAvailability: SeasonalAvailability | null;
  blackoutDates: Date[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

type ActivityCategory =
  | 'adventure'        // Balloon, bungee, quad biking
  | 'wildlife'         // Game drives, walks, boat safaris
  | 'cultural'         // Village visits, museums, heritage
  | 'dining'           // Bush dinner, sundowner, picnic
  | 'wellness'         // Spa, yoga, meditation
  | 'photography'      // Photo safaris, workshops
  | 'water'            // Snorkeling, diving, boat rides
  | 'birding'          // Bird watching expeditions
  | 'trekking'         // Hiking, mountain climbing
  | 'other';

interface ActivityPricing {
  // Primary Pricing
  pricingModel: PricingModel;
  pricePerPerson: number;
  pricePerGroup: number | null;    // For group-rate activities

  // Minimum Requirements
  minimumParticipants: number;
  maximumParticipants: number | null;
  minimumCharge: number | null;    // Minimum charge regardless of participants

  // Child Pricing
  childPrice: number | null;
  childPricePercent: number;       // Percentage of adult price
  childPricingModel: 'percentage' | 'fixed' | 'free' | 'same_as_adult';
  childMinAge: number;             // Minimum age to participate
  childMaxAge: number;             // Age considered "child" pricing

  // Group Discounts
  groupDiscounts: GroupDiscount[];

  // Currency
  currency: string;
}

type PricingModel =
  | 'per_person'                   // Standard per-person pricing
  | 'per_group'                    // Flat rate for entire group
  | 'per_person_minimum'           // Per person with minimum participants
  | 'tiered';                      // Different rates for different group sizes

interface GroupDiscount {
  minParticipants: number;
  maxParticipants: number | null;
  discountType: 'percentage' | 'fixed_per_person' | 'fixed_total';
  discountValue: number;
}

interface TimeSlot {
  id: string;
  name: string;                    // "Sunrise Flight", "Morning Drive"
  startTime: string;               // "05:30"
  endTime: string;                 // "08:30"
  priceModifier: number;           // Additional cost for this slot
  maxCapacity: number | null;
  isDefault: boolean;
}

interface ActivityRequirement {
  type: 'age' | 'fitness' | 'health' | 'equipment' | 'other';
  description: string;
  mandatory: boolean;
}

interface ActivityRestriction {
  type: 'age' | 'weight' | 'health' | 'pregnancy' | 'other';
  description: string;
  restriction: string;             // e.g., "Not suitable for"
}

type FitnessLevel = 'easy' | 'moderate' | 'challenging' | 'strenuous';

interface ActivityImage {
  id: string;
  url: string;
  publicId: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

interface SeasonalAvailability {
  startDate: Date;
  endDate: Date;
  isAvailable: boolean;
  priceModifier: number;           // Seasonal price adjustment
  reason: string;                  // e.g., "Migration season"
}
```

---

## User Stories

### Agent User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| A1 | Agent | Add optional activities to my packages | Tourists can enhance their experience | Must Have |
| A2 | Agent | Set different pricing models per activity | I can accurately charge for each activity | Must Have |
| A3 | Agent | Specify which days activities are available | Activities show only when relevant | Must Have |
| A4 | Agent | Set minimum participant requirements | I meet provider requirements | Should Have |
| A5 | Agent | Upload images and descriptions | Tourists understand what they're getting | Must Have |
| A6 | Agent | Set age/fitness restrictions | Tourists know if they qualify | Should Have |
| A7 | Agent | Mark activities as popular/featured | They stand out in the list | Could Have |
| A8 | Agent | Set time slots for activities | Tourists can choose when to do them | Could Have |
| A9 | Agent | Configure child pricing | Families get accurate pricing | Should Have |
| A10 | Agent | Specify inclusions/exclusions | Tourists know what's covered | Should Have |

### Tourist User Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| T1 | Tourist | See available add-on activities | I can enhance my safari | Must Have |
| T2 | Tourist | See which days activities are available | I know when I can do them | Must Have |
| T3 | Tourist | Add activities to my package | They're included in my booking | Must Have |
| T4 | Tourist | See the price for my group | I know exactly what I'll pay | Must Have |
| T5 | Tourist | Read descriptions and requirements | I know if I qualify | Should Have |
| T6 | Tourist | View images of activities | I can see what to expect | Should Have |
| T7 | Tourist | See if activities are suitable for my kids | I can plan family activities | Should Have |
| T8 | Tourist | Select specific time slots | I can plan my day | Could Have |
| T9 | Tourist | See real-time price updates | I know my running total | Must Have |
| T10 | Tourist | Remove activities I've added | I can change my mind | Must Have |

---

## Acceptance Criteria

### Agent: Adding Activities

- [ ] Agent can add activities to a package
- [ ] Agent can select category from predefined list
- [ ] Agent can set pricing model (per person, per group, minimum)
- [ ] Agent can specify available days or locations
- [ ] Agent can set minimum/maximum participants
- [ ] Agent can upload images (drag & drop, max 5)
- [ ] Agent can set age restrictions
- [ ] Agent can add requirements and restrictions
- [ ] Agent can set child pricing rules
- [ ] Agent can add inclusions/exclusions list
- [ ] Agent can mark as popular/featured
- [ ] Agent can set sort order
- [ ] Agent can edit existing activities
- [ ] Agent can delete activities
- [ ] Agent can duplicate activities
- [ ] Validation prevents invalid configurations

### Tourist: Selecting Activities

- [ ] Tourist sees list of available activities for their package
- [ ] Activities grouped by category
- [ ] Popular/featured activities highlighted
- [ ] Each activity shows: name, price, duration, category
- [ ] Tourist can view full details (modal/page)
- [ ] Price calculation respects pricing model:
  - [ ] Per person: Price x number of participants
  - [ ] Per group: Flat rate shown
  - [ ] Minimum: Higher of (price x participants) or minimum
- [ ] Tourist can add activities to their configuration
- [ ] Tourist can remove activities
- [ ] Warning shown if age restrictions apply
- [ ] Total price updates in real-time
- [ ] Mobile-friendly selection interface
- [ ] Activities indicate which days they're available

---

## Technical Design

### Database Schema

```sql
-- Package Activities
CREATE TABLE package_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES package_templates(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  duration VARCHAR(100),

  -- Category
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),

  -- Availability
  availability_type VARCHAR(30) DEFAULT 'all_days',
  available_on_days JSONB DEFAULT '[]',
  available_at_locations JSONB DEFAULT '[]',

  -- Pricing
  pricing_model VARCHAR(30) DEFAULT 'per_person',
  price_per_person DECIMAL(10, 2) NOT NULL,
  price_per_group DECIMAL(10, 2),
  minimum_participants INT DEFAULT 1,
  maximum_participants INT,
  minimum_charge DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Child Pricing
  child_price DECIMAL(10, 2),
  child_price_percent DECIMAL(5, 2) DEFAULT 100,
  child_pricing_model VARCHAR(20) DEFAULT 'same_as_adult',
  child_min_age INT DEFAULT 0,
  child_max_age INT DEFAULT 11,

  -- Group Discounts
  group_discounts JSONB DEFAULT '[]',

  -- Requirements & Restrictions
  requirements JSONB DEFAULT '[]',
  restrictions JSONB DEFAULT '[]',
  min_age INT,
  max_age INT,
  fitness_level VARCHAR(20) DEFAULT 'easy',
  accessibility JSONB DEFAULT '[]',

  -- What's Included
  inclusions JSONB DEFAULT '[]',
  exclusions JSONB DEFAULT '[]',
  what_to_bring JSONB DEFAULT '[]',

  -- External Provider
  provider_id VARCHAR(100),
  provider_name VARCHAR(255),
  provider_contact VARCHAR(255),

  -- Status & Sorting
  is_available BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  booking_count INT DEFAULT 0,

  -- Seasonal & Blackouts
  blackout_dates JSONB DEFAULT '[]',

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Activity Images
CREATE TABLE activity_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES package_activities(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255),
  alt VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Time Slots
CREATE TABLE activity_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES package_activities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  max_capacity INT,
  is_default BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity Seasonal Availability
CREATE TABLE activity_seasonal_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES package_activities(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price_modifier DECIMAL(10, 2) DEFAULT 0,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activity_package ON package_activities(package_id);
CREATE INDEX idx_activity_category ON package_activities(category);
CREATE INDEX idx_activity_available ON package_activities(is_available);
CREATE INDEX idx_activity_popular ON package_activities(is_popular);
CREATE INDEX idx_activity_featured ON package_activities(is_featured);
CREATE INDEX idx_activity_images_activity ON activity_images(activity_id);
CREATE INDEX idx_time_slots_activity ON activity_time_slots(activity_id);
```

### API Endpoints

```typescript
// Agent Activity Management

// Create activity
POST /api/agent/packages/:packageId/activities
Body: {
  name: string;
  category: string;
  pricingModel: string;
  pricePerPerson: number;
  availableOnDays?: number[];
  // ... other fields
}

// Get all activities for a package
GET /api/agent/packages/:packageId/activities

// Update activity
PUT /api/agent/activities/:activityId
Body: { ...partial activity data }

// Delete activity
DELETE /api/agent/activities/:activityId

// Duplicate activity
POST /api/agent/activities/:activityId/duplicate

// Upload activity images
POST /api/agent/activities/:activityId/images
Body: FormData with images

// Delete activity image
DELETE /api/agent/activities/:activityId/images/:imageId

// Reorder images
PUT /api/agent/activities/:activityId/images/reorder
Body: {
  imageIds: string[];
}

// Add time slot
POST /api/agent/activities/:activityId/time-slots
Body: {
  name: string;
  startTime: string;
  endTime: string;
  priceModifier?: number;
}

// Update time slot
PUT /api/agent/time-slots/:timeSlotId

// Delete time slot
DELETE /api/agent/time-slots/:timeSlotId

// Tourist Activity Viewing

// Get activities for a package
GET /api/packages/:packageId/activities
Query: {
  category?: string;
  day?: number;
  location?: string;
}

// Get activity details
GET /api/activities/:activityId

// Calculate activity price
POST /api/activities/:activityId/calculate-price
Body: {
  adults: number;
  children: number;
  timeSlotId?: string;
}
```

---

## Pricing Calculation Logic

### Pricing Models Explained

```typescript
// Price Calculation Service

interface ActivityPriceRequest {
  activityId: string;
  participants: {
    adults: number;
    children: number;   // Ages meeting child criteria
    infants: number;    // Too young to participate (usually free)
  };
  timeSlotId?: string;
}

interface ActivityPriceResponse {
  activityId: string;
  activityName: string;
  pricingModel: string;

  // Breakdown
  adultPrice: number;
  adultCount: number;
  adultTotal: number;

  childPrice: number;
  childCount: number;
  childTotal: number;

  // Adjustments
  timeSlotModifier: number;
  groupDiscount: number;
  minimumChargeApplied: boolean;

  // Final
  subtotal: number;
  finalPrice: number;

  // Warnings
  warnings: string[];
}

function calculateActivityPrice(
  activity: PackageActivity,
  request: ActivityPriceRequest
): ActivityPriceResponse {
  const { adults, children } = request.participants;
  const totalParticipants = adults + children;

  let warnings: string[] = [];

  // Check participation requirements
  if (activity.minAge && children > 0) {
    warnings.push(`Minimum age for this activity is ${activity.minAge} years`);
  }

  // Calculate based on pricing model
  let subtotal = 0;
  let adultTotal = 0;
  let childTotal = 0;
  let groupDiscount = 0;
  let minimumChargeApplied = false;

  switch (activity.pricing.pricingModel) {
    case 'per_person':
      // Simple per-person calculation
      adultTotal = activity.pricing.pricePerPerson * adults;
      childTotal = calculateChildPrice(activity, children);
      subtotal = adultTotal + childTotal;
      break;

    case 'per_group':
      // Flat group rate
      subtotal = activity.pricing.pricePerGroup || 0;
      adultTotal = subtotal; // Assign to adult for display
      break;

    case 'per_person_minimum':
      // Per person but with minimum participant charge
      adultTotal = activity.pricing.pricePerPerson * adults;
      childTotal = calculateChildPrice(activity, children);
      subtotal = adultTotal + childTotal;

      const minimumCharge = activity.pricing.minimumCharge ||
        (activity.pricing.pricePerPerson * activity.pricing.minimumParticipants);

      if (subtotal < minimumCharge) {
        subtotal = minimumCharge;
        minimumChargeApplied = true;
        warnings.push(
          `Minimum charge of ${minimumCharge} applied (${activity.pricing.minimumParticipants} person minimum)`
        );
      }
      break;

    case 'tiered':
      // Different rates based on group size
      const tier = findApplicableTier(activity.pricing.groupDiscounts, totalParticipants);
      if (tier) {
        // Apply tiered pricing
        const baseTotal = (activity.pricing.pricePerPerson * adults) +
          calculateChildPrice(activity, children);

        if (tier.discountType === 'percentage') {
          groupDiscount = baseTotal * (tier.discountValue / 100);
        } else if (tier.discountType === 'fixed_per_person') {
          groupDiscount = tier.discountValue * totalParticipants;
        } else {
          groupDiscount = tier.discountValue;
        }
        subtotal = baseTotal - groupDiscount;
      }
      break;
  }

  // Apply time slot modifier
  let timeSlotModifier = 0;
  if (request.timeSlotId) {
    const slot = activity.pricing.availableTimeSlots?.find(
      s => s.id === request.timeSlotId
    );
    if (slot?.priceModifier) {
      timeSlotModifier = slot.priceModifier * totalParticipants;
    }
  }

  const finalPrice = subtotal + timeSlotModifier;

  return {
    activityId: activity.id,
    activityName: activity.name,
    pricingModel: activity.pricing.pricingModel,
    adultPrice: activity.pricing.pricePerPerson,
    adultCount: adults,
    adultTotal,
    childPrice: calculateChildPricePerPerson(activity),
    childCount: children,
    childTotal,
    timeSlotModifier,
    groupDiscount,
    minimumChargeApplied,
    subtotal,
    finalPrice,
    warnings,
  };
}

function calculateChildPrice(activity: PackageActivity, childCount: number): number {
  if (childCount === 0) return 0;

  const { childPricingModel, pricePerPerson, childPrice, childPricePercent } = activity.pricing;

  switch (childPricingModel) {
    case 'free':
      return 0;
    case 'same_as_adult':
      return pricePerPerson * childCount;
    case 'fixed':
      return (childPrice || 0) * childCount;
    case 'percentage':
      return (pricePerPerson * (childPricePercent / 100)) * childCount;
    default:
      return pricePerPerson * childCount;
  }
}
```

---

## UX Design Specifications

### Agent: Activity Builder

#### Add Activity Modal

```
+------------------------------------------------------------------+
|  Add Activity to Package                              [X Close]  |
+------------------------------------------------------------------+
|                                                                   |
|  Activity Name *                                                  |
|  +----------------------------------------------------------+    |
|  | Hot Air Balloon Safari                                    |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Category *                                                       |
|  +----------------------------------------------------------+    |
|  | Adventure                                              [v]|    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Short Description                                                |
|  +----------------------------------------------------------+    |
|  | Soar above the Mara plains at sunrise                     |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Full Description                                                 |
|  +----------------------------------------------------------+    |
|  |                                                           |    |
|  | [Rich text editor]                                        |    |
|  |                                                           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  Duration                                                         |
|  +----------------------------------------------------------+    |
|  | 3-4 hours (including transfer and breakfast)              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  -------------------- AVAILABILITY -----------------------        |
|                                                                   |
|  When is this activity available?                                 |
|  ( ) All days of the trip                                        |
|  (x) Specific days only                                          |
|  ( ) At specific locations                                       |
|                                                                   |
|  Available Days *                                                 |
|  [x] Day 1  [x] Day 2  [ ] Day 3                                |
|                                                                   |
|  ---------------------- PRICING ------------------------          |
|                                                                   |
|  Pricing Model *                                                  |
|  (x) Per Person                                                  |
|  ( ) Per Group (flat rate)                                       |
|  ( ) Per Person with Minimum                                     |
|                                                                   |
|  Price Per Person *                                               |
|  +---------------+                                                |
|  | $450          |  USD                                          |
|  +---------------+                                                |
|                                                                   |
|  Minimum Participants        Maximum Participants                 |
|  +---------------+           +---------------+                    |
|  | 1             |           | 16            |                    |
|  +---------------+           +---------------+                    |
|                                                                   |
|  Child Pricing (ages 7-11)                                        |
|  ( ) Same as adult  (x) Percentage  ( ) Fixed  ( ) Not allowed   |
|  +---------------+                                                |
|  | 75% of adult  |                                               |
|  +---------------+                                                |
|                                                                   |
|  ------------------- REQUIREMENTS ----------------------          |
|                                                                   |
|  Minimum Age                  Fitness Level                       |
|  +---------------+            +---------------------------+       |
|  | 7 years       |            | Easy                   [v]|       |
|  +---------------+            +---------------------------+       |
|                                                                   |
|  Requirements/Restrictions                                        |
|  +----------------------------------------------------------+    |
|  | Not suitable for pregnant women or those with heart       |    |
|  | conditions. Maximum weight 130kg.                         |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  -------------------- INCLUDES -------------------------          |
|                                                                   |
|  What's Included                                                  |
|  [x] Hotel pickup      [x] Balloon flight                        |
|  [x] Bush breakfast    [x] Certificate                           |
|  [ ] Photos (add-on)                                             |
|                                                                   |
|  --------------------- IMAGES --------------------------          |
|                                                                   |
|  +----------------------------------------------------------+    |
|  |  +------+  +------+  +------+  +------+                   |    |
|  |  | [img]|  | [img]|  |  +   |                             |    |
|  |  |  1   |  |  2   |  | Add  |                             |    |
|  |  +------+  +------+  +------+                             |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  -------------------- SETTINGS -------------------------          |
|                                                                   |
|  [x] Mark as popular                                             |
|  [ ] Feature this activity                                       |
|                                                                   |
|  +----------------------------------------------------------+    |
|  |             [Cancel]            [Save Activity]           |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

### Tourist: Activity Selection

#### Desktop Activity List

```
+------------------------------------------------------------------+
|  Enhance Your Safari - Optional Activities                        |
+------------------------------------------------------------------+
|                                                                   |
|  [All] [Adventure] [Wildlife] [Cultural] [Dining] [Wellness]     |
|                                                                   |
|  POPULAR                                                          |
|  +--------------------------------------------------------------+|
|  |                                                               ||
|  | [Image] HOT AIR BALLOON SAFARI           ADVENTURE           ||
|  |         Soar above the Mara plains at sunrise                ||
|  |         Duration: 3-4 hours | Days: 1, 2                     ||
|  |                                                               ||
|  |         $450 / person                                        ||
|  |         For 2 adults: $900                                   ||
|  |                                                               ||
|  |         Min age: 7 | Fitness: Easy                           ||
|  |                                                               ||
|  |         [View Details]              [+ Add to Package]       ||
|  |                                                               ||
|  +--------------------------------------------------------------+|
|                                                                   |
|  +--------------------------------------------------------------+|
|  |                                                               ||
|  | [Image] BUSH DINNER EXPERIENCE           DINING              ||
|  |         Dine under the stars in the African bush             ||
|  |         Duration: 3 hours | Days: 1, 2, 3                    ||
|  |                                                               ||
|  |         $120 / person                                        ||
|  |         For 2 adults: $240                                   ||
|  |                                                               ||
|  |         All ages welcome | Fitness: Easy                     ||
|  |                                                               ||
|  |         [View Details]              [+ Add to Package]       ||
|  |                                                               ||
|  +--------------------------------------------------------------+|
|                                                                   |
|  CULTURAL EXPERIENCES                                             |
|  +--------------------------------------------------------------+|
|  |                                                               ||
|  | [Image] MAASAI VILLAGE VISIT             CULTURAL            ||
|  |         Experience authentic Maasai culture                  ||
|  |         Duration: 2 hours | Days: 1, 2                       ||
|  |                                                               ||
|  |         $50 / person                                         ||
|  |         For 2 adults: $100                                   ||
|  |                                                               ||
|  |         [View Details]              [+ Add to Package]       ||
|  |                                                               ||
|  +--------------------------------------------------------------+|
|                                                                   |
+------------------------------------------------------------------+
```

#### Mobile Activity List

```
+----------------------------+
|  Optional Activities       |
+----------------------------+
|                            |
| [All] [Adventure] [More v] |
|                            |
+----------------------------+
| [=======Image=======]      |
|                            |
| POPULAR  ADVENTURE         |
| Hot Air Balloon Safari     |
| -------------------------  |
| Soar above the Mara plains |
| at sunrise                 |
|                            |
| Duration: 3-4 hours        |
| Available: Days 1, 2       |
|                            |
| $450 / person              |
| For 2 adults: $900         |
|                            |
| [Details]  [+ Add]         |
+----------------------------+
|                            |
+----------------------------+
| [=======Image=======]      |
|                            |
| DINING                     |
| Bush Dinner Experience     |
| -------------------------  |
| Dine under the stars       |
|                            |
| Duration: 3 hours          |
| Available: Days 1, 2, 3    |
|                            |
| $120 / person              |
| For 2 adults: $240         |
|                            |
| [Details]  [+ Add]         |
+----------------------------+
```

#### Activity Detail Modal

```
+------------------------------------------------------------------+
|  Hot Air Balloon Safari                               [X Close]  |
+------------------------------------------------------------------+
|                                                                   |
|  [=============== Image Gallery Carousel ================]        |
|                                                                   |
|  [o] [o] [o] [o]  (4 images)                                     |
|                                                                   |
+------------------------------------------------------------------+
|  ADVENTURE          Duration: 3-4 hours                          |
|  Available on Days 1 & 2                                          |
+------------------------------------------------------------------+
|                                                                   |
|  Experience the magic of the Masai Mara from above as you        |
|  float silently over the vast plains at sunrise. Watch the       |
|  wildlife below as the sun rises over Africa, followed by a      |
|  champagne breakfast in the bush.                                 |
|                                                                   |
|  WHAT'S INCLUDED                                                  |
|  +----------------------------------------------------------+    |
|  | * Hotel pickup and transfer                               |    |
|  | * 1-hour hot air balloon flight                           |    |
|  | * Champagne bush breakfast                                |    |
|  | * Flight certificate                                      |    |
|  | * Return transfer to camp                                 |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  NOT INCLUDED                                                     |
|  +----------------------------------------------------------+    |
|  | * Professional photos ($50 extra)                         |    |
|  | * Personal expenses                                       |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  REQUIREMENTS                                                     |
|  +----------------------------------------------------------+    |
|  | * Minimum age: 7 years                                    |    |
|  | * Maximum weight: 130kg (286 lbs)                         |    |
|  | * Not suitable for pregnant women                         |    |
|  | * Not recommended for those with heart conditions         |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  WHAT TO BRING                                                    |
|  +----------------------------------------------------------+    |
|  | * Warm layers (morning flights are cold)                  |    |
|  | * Camera                                                  |    |
|  | * Sunglasses                                              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
|  PRICING                                                          |
|  +----------------------------------------------------------+    |
|  | Adults (18+):           $450 / person                     |    |
|  | Children (7-17):        $337.50 / person (75%)            |    |
|  | Children under 7:       Not permitted                     |    |
|  |                                                           |    |
|  | Your group (2 adults):  $900                              |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  [Cancel]                          [Add to Package - $900]       |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Predefined Lists

### Categories

```typescript
const ACTIVITY_CATEGORIES = [
  { value: 'adventure', label: 'Adventure', icon: 'mountain' },
  { value: 'wildlife', label: 'Wildlife', icon: 'binoculars' },
  { value: 'cultural', label: 'Cultural', icon: 'users' },
  { value: 'dining', label: 'Dining', icon: 'utensils' },
  { value: 'wellness', label: 'Wellness', icon: 'spa' },
  { value: 'photography', label: 'Photography', icon: 'camera' },
  { value: 'water', label: 'Water Activities', icon: 'water' },
  { value: 'birding', label: 'Bird Watching', icon: 'bird' },
  { value: 'trekking', label: 'Trekking', icon: 'hiking' },
  { value: 'other', label: 'Other', icon: 'star' },
];
```

### Common Inclusions

```typescript
const COMMON_INCLUSIONS = [
  'Hotel/Camp pickup',
  'Round-trip transfer',
  'English-speaking guide',
  'All equipment provided',
  'Lunch/Refreshments',
  'Drinking water',
  'Park fees',
  'Professional photos',
  'Certificate/Souvenir',
  'Insurance',
];
```

### Fitness Levels

```typescript
const FITNESS_LEVELS = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'Suitable for all fitness levels',
  },
  {
    value: 'moderate',
    label: 'Moderate',
    description: 'Some walking, basic fitness required',
  },
  {
    value: 'challenging',
    label: 'Challenging',
    description: 'Good fitness level required',
  },
  {
    value: 'strenuous',
    label: 'Strenuous',
    description: 'Excellent fitness required',
  },
];
```

---

## Validation Rules

### Agent Input Validation

```typescript
const activityValidation = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 255,
  },
  category: {
    required: true,
    enum: ['adventure', 'wildlife', 'cultural', 'dining', 'wellness', 'photography', 'water', 'birding', 'trekking', 'other'],
  },
  pricePerPerson: {
    required: true,
    min: 0,
    max: 50000,
  },
  minimumParticipants: {
    min: 1,
    max: 100,
  },
  maximumParticipants: {
    min: 1,
    max: 500,
  },
  minAge: {
    min: 0,
    max: 100,
  },
  images: {
    maxCount: 5,
    maxSizePerImage: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
};
```

### Business Rules

1. **Minimum <= Maximum**: Minimum participants cannot exceed maximum
2. **Valid days**: Available days must be within package duration
3. **Price validation**: Price cannot be negative
4. **Child age logic**: Child max age must be >= child min age
5. **At least one image**: Required for published packages

---

## Integration Points

### With Pricing Engine

- Activities feed into dynamic pricing calculation
- Child pricing rules applied based on activity settings
- Group discounts applied when applicable
- Minimum charges enforced

### With Booking System

- Selected activities stored in booking configuration
- Activity availability checked at booking time
- Activity details included in confirmation

### With Package Builder

- Activities displayed in configurator
- Real-time price updates on selection
- Available days filtered based on itinerary

---

## Future Enhancements (Phase 2+)

1. **Real-time Availability**: Connect to provider booking systems
2. **Time Slot Selection**: Allow tourists to choose specific times
3. **Activity Packages**: Bundle related activities for discounts
4. **AI Recommendations**: Suggest activities based on preferences
5. **Review Integration**: Show activity reviews
6. **Weather-Based Suggestions**: Recommend activities based on forecast

---

## Approval Checklist

- [ ] Data model approved
- [ ] Pricing logic approved
- [ ] API design approved
- [ ] UX design approved
- [ ] Validation rules approved

**Approver**: ____________________
**Date**: ____________________
**Notes**: ____________________

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial specification |
