# SafariPlus - Dynamic Pricing Engine

## Status

- [x] Requirements Documented
- [x] Research Complete
- [x] Design Specification Complete
- [ ] Implementation Started
- [ ] Testing Complete
- [ ] Deployed

---

## Executive Summary

The Dynamic Pricing Engine is the computational heart of SafariPlus's package builder system. It calculates real-time prices based on multiple variables including accommodation selections, activity add-ons, traveler composition (adults, children, infants), seasonal adjustments, group sizes, and promotional discounts. The engine must deliver sub-200ms response times to provide the instant feedback users expect from modern configurators.

### Why This Matters

**Industry Benchmark:**
- Tesla's configurator updates price within 100ms of any change
- Expedia's dynamic packaging calculates flight+hotel combinations in real-time
- PROS airline pricing systems process millions of price calculations per second

**SafariPlus Requirements:**
- Calculate complex safari package prices in < 200ms
- Handle multiple pricing tiers, seasonal rules, and child policies simultaneously
- Maintain price consistency between configuration and checkout
- Support multiple currencies with real-time conversion

---

## Research Findings

### Competitor Pricing Approaches

| Platform | Pricing Model | Real-time? | Complexity |
|----------|---------------|------------|------------|
| G Adventures | Fixed itinerary pricing | No | Low |
| Intrepid Travel | Fixed + quote for custom | No | Low |
| TourRadar | Dynamic via operator dashboard | Partial | Medium |
| Expedia | Full dynamic packaging | Yes | High |
| Booking.com | Room-level dynamic | Yes | High |
| Airlines (PROS) | AI-driven continuous | Yes | Very High |

### Technical Approaches Discovered

1. **Rule-Based Pricing**: Pre-defined rules (if season=high, add 20%)
2. **Algorithm-Based Pricing**: Mathematical formulas based on supply/demand
3. **Machine Learning Pricing**: AI predicts optimal price points
4. **Hybrid Approach**: Rules + algorithms + ML for different scenarios

**SafariPlus Recommendation**: Start with Rule-Based for MVP, add Algorithm-Based in Phase 2.

---

## Pricing Components

### Price Structure Breakdown

```
+-------------------------------------------------------------------+
|                    TOTAL PACKAGE PRICE                             |
+===================================================================+
|                                                                    |
|  1. BASE PACKAGE PRICE                                             |
|     - Fixed base price per person OR per group                     |
|     - Covers: Transport, guide, park fees, base meals              |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  2. ACCOMMODATION COSTS                                            |
|     - Variable per day based on tier selection                     |
|     - Budget / Standard / Comfort / Luxury / Ultra-Luxury          |
|     - Each tier has price per person per night                     |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  3. ACTIVITY ADD-ONS                                               |
|     - Optional activities selected by tourist                      |
|     - Price per person OR per group (depending on activity)        |
|     - May have minimum participant requirements                    |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  4. SEASONAL ADJUSTMENTS                                           |
|     - High Season: +15% to +30%                                    |
|     - Shoulder Season: +5% to +15%                                 |
|     - Low/Green Season: Base price or -10%                         |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  5. GROUP SIZE ADJUSTMENTS                                         |
|     - Single supplement (1 person): +20% to +50%                   |
|     - Small group (2-4): Standard price                            |
|     - Medium group (5-8): -5% to -10%                              |
|     - Large group (9+): -10% to -15%                               |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  6. TRAVELER TYPE ADJUSTMENTS                                      |
|     - Adults (18+): Full price                                     |
|     - Teens (12-17): 80-100% of adult price                        |
|     - Children (3-11): 50-70% of adult price                       |
|     - Infants (0-2): 0-10% of adult price                          |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  7. PROMOTIONAL DISCOUNTS                                          |
|     - Promo codes: Percentage or fixed amount                      |
|     - Early bird discount: X% off if booked 90+ days ahead         |
|     - Last-minute discount: X% off if within 14 days               |
|     - Loyalty discount: For returning customers                    |
|                                                                    |
+-------------------------------------------------------------------+
|                                                                    |
|  FINAL CALCULATION:                                                |
|                                                                    |
|  Total = (Base + Accommodations + Activities)                      |
|          x Seasonal Multiplier                                     |
|          x Group Size Multiplier                                   |
|          + Single Supplement (if applicable)                       |
|          - Child/Teen Discounts                                    |
|          - Promotional Discounts                                   |
|                                                                    |
+-------------------------------------------------------------------+
```

---

## Pricing Engine Architecture

### System Design

```
+------------------------------------------------------------------+
|                      CLIENT REQUEST                               |
|  - Package ID                                                     |
|  - Travel Date                                                    |
|  - Travelers: { adults: 2, children: 1, teens: 0, infants: 0 }   |
|  - Accommodation Selections: [{ day: 1, optionId: 'xyz' }, ...]  |
|  - Activity Selections: ['balloon', 'bush_dinner']                |
|  - Promo Code: 'EARLYBIRD2026'                                   |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    API GATEWAY                                    |
|  POST /api/pricing/calculate                                      |
|  - Rate limiting (100 req/min per IP)                            |
|  - Request validation                                             |
|  - Authentication (optional - can calculate without login)        |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                 PRICING ENGINE SERVICE                            |
|                                                                   |
|  +--------------------+  +--------------------+                   |
|  | Package Fetcher    |  | Cache Layer        |                   |
|  | - Load template    |  | - Redis/Memory     |                   |
|  | - Load options     |  | - TTL: 5 minutes   |                   |
|  | - Load rules       |  | - Key: pkg_config  |                   |
|  +--------------------+  +--------------------+                   |
|                              |                                    |
|                              v                                    |
|  +-----------------------------------------------------+         |
|  |              CALCULATION PIPELINE                    |         |
|  |                                                      |         |
|  |  1. Validate Inputs                                  |         |
|  |     - Check package exists and is published          |         |
|  |     - Validate accommodation selections              |         |
|  |     - Validate activity selections                   |         |
|  |     - Validate traveler counts                       |         |
|  |                                                      |         |
|  |  2. Calculate Base Components                        |         |
|  |     - Base package price x travelers                 |         |
|  |     - Accommodation costs per day                    |         |
|  |     - Activity costs                                 |         |
|  |                                                      |         |
|  |  3. Apply Seasonal Rules                             |         |
|  |     - Match travel date to season                    |         |
|  |     - Apply percentage/fixed adjustment              |         |
|  |                                                      |         |
|  |  4. Apply Group Size Rules                           |         |
|  |     - Calculate total travelers                      |         |
|  |     - Apply group discount/supplement                |         |
|  |                                                      |         |
|  |  5. Apply Traveler Type Rules                        |         |
|  |     - Calculate child discounts                      |         |
|  |     - Calculate teen adjustments                     |         |
|  |     - Calculate infant charges                       |         |
|  |                                                      |         |
|  |  6. Apply Promotional Discounts                      |         |
|  |     - Validate promo code                            |         |
|  |     - Check eligibility                              |         |
|  |     - Apply discount                                 |         |
|  |                                                      |         |
|  |  7. Generate Breakdown                               |         |
|  |     - Line-by-line breakdown                         |         |
|  |     - Per-person breakdown                           |         |
|  |     - Total calculation                              |         |
|  |                                                      |         |
|  +-----------------------------------------------------+         |
|                                                                   |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      PRICING RESPONSE                             |
|  - Detailed breakdown                                             |
|  - Total price                                                    |
|  - Per-person prices                                              |
|  - Applied discounts                                              |
|  - Warnings/notices                                               |
|  - Cache key for consistency                                      |
+------------------------------------------------------------------+
```

### Implementation

```typescript
// src/services/pricing-engine/index.ts

import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';

interface PricingRequest {
  packageId: string;
  travelDate: Date;
  travelers: TravelerComposition;
  accommodationSelections: AccommodationSelection[];
  activitySelections: string[];
  promoCode?: string;
  currency?: string;
}

interface TravelerComposition {
  adults: number;
  teens: number;      // 12-17
  children: number;   // 3-11
  infants: number;    // 0-2
}

interface AccommodationSelection {
  dayNumber: number;
  accommodationOptionId: string;
  roomTypeId?: string;
}

interface PricingBreakdown {
  // Base
  basePackagePrice: number;
  basePerPerson: number;

  // Accommodations
  accommodationTotal: number;
  accommodationDetails: AccommodationLineItem[];

  // Activities
  activitiesTotal: number;
  activityDetails: ActivityLineItem[];

  // Adjustments
  seasonalAdjustment: SeasonalAdjustment;
  groupSizeAdjustment: GroupSizeAdjustment;
  travelerTypeAdjustments: TravelerTypeAdjustment;

  // Discounts
  promoDiscount: PromoDiscount | null;

  // Totals
  subtotal: number;
  totalDiscounts: number;
  finalTotal: number;

  // Per Person
  perPersonBreakdown: PerPersonBreakdown;

  // Metadata
  currency: string;
  calculatedAt: Date;
  expiresAt: Date;
  cacheKey: string;

  // Warnings
  warnings: string[];
}

class PricingEngine {
  private prisma: PrismaClient;
  private redis: Redis;
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma;
    this.redis = redis;
  }

  async calculatePrice(request: PricingRequest): Promise<PricingBreakdown> {
    const startTime = Date.now();

    // 1. Check cache
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Fetch package data
    const packageData = await this.fetchPackageData(request.packageId);
    if (!packageData) {
      throw new PricingError('Package not found', 'PACKAGE_NOT_FOUND');
    }

    // 3. Validate inputs
    this.validateRequest(request, packageData);

    // 4. Calculate components
    const basePrice = this.calculateBasePrice(packageData, request.travelers);
    const accommodationPrice = this.calculateAccommodationPrice(
      packageData,
      request.accommodationSelections,
      request.travelers
    );
    const activityPrice = this.calculateActivityPrice(
      packageData,
      request.activitySelections,
      request.travelers
    );

    // 5. Apply seasonal adjustment
    const seasonalAdj = this.applySeasonalPricing(
      packageData,
      request.travelDate,
      basePrice + accommodationPrice + activityPrice
    );

    // 6. Apply group size adjustment
    const groupAdj = this.applyGroupSizeAdjustment(
      packageData,
      request.travelers,
      seasonalAdj.adjustedTotal
    );

    // 7. Apply traveler type adjustments
    const travelerAdj = this.applyTravelerTypeAdjustments(
      packageData,
      request.travelers,
      groupAdj.adjustedTotal
    );

    // 8. Apply promo code
    const promoAdj = await this.applyPromoCode(
      request.promoCode,
      travelerAdj.adjustedTotal,
      request.packageId,
      request.travelDate
    );

    // 9. Build response
    const breakdown = this.buildBreakdown(
      request,
      packageData,
      basePrice,
      accommodationPrice,
      activityPrice,
      seasonalAdj,
      groupAdj,
      travelerAdj,
      promoAdj,
      cacheKey
    );

    // 10. Cache result
    await this.cacheResult(cacheKey, breakdown);

    // Log performance
    const duration = Date.now() - startTime;
    console.log(`Pricing calculation completed in ${duration}ms`);

    return breakdown;
  }

  private calculateBasePrice(
    packageData: PackageTemplate,
    travelers: TravelerComposition
  ): number {
    const totalTravelers = this.getTotalTravelers(travelers);

    if (packageData.priceType === 'per_group') {
      return packageData.basePrice;
    }

    // Per person pricing
    return packageData.basePrice * travelers.adults;
  }

  private calculateAccommodationPrice(
    packageData: PackageTemplate,
    selections: AccommodationSelection[],
    travelers: TravelerComposition
  ): AccommodationCalculation {
    let total = 0;
    const details: AccommodationLineItem[] = [];

    for (const selection of selections) {
      const day = packageData.days.find(d => d.dayNumber === selection.dayNumber);
      if (!day || !day.requiresAccommodation) continue;

      const option = day.accommodationOptions.find(
        o => o.id === selection.accommodationOptionId
      );
      if (!option) {
        throw new PricingError(
          `Invalid accommodation selection for day ${selection.dayNumber}`,
          'INVALID_ACCOMMODATION'
        );
      }

      let dayPrice = 0;
      if (option.pricingModel === 'per_person') {
        // Price per person per night
        dayPrice = option.pricePerPerson * travelers.adults;
      } else {
        // Price per room
        const roomsNeeded = Math.ceil(travelers.adults / option.maxOccupancy);
        dayPrice = option.pricePerRoom * roomsNeeded;
      }

      total += dayPrice;
      details.push({
        dayNumber: selection.dayNumber,
        accommodationName: option.name,
        tier: option.tier,
        pricePerPerson: option.pricePerPerson,
        totalPrice: dayPrice,
      });
    }

    return { total, details };
  }

  private calculateActivityPrice(
    packageData: PackageTemplate,
    activityIds: string[],
    travelers: TravelerComposition
  ): ActivityCalculation {
    let total = 0;
    const details: ActivityLineItem[] = [];

    for (const activityId of activityIds) {
      const activity = packageData.activities.find(a => a.id === activityId);
      if (!activity) {
        throw new PricingError(
          `Invalid activity selection: ${activityId}`,
          'INVALID_ACTIVITY'
        );
      }

      let activityPrice = 0;
      const totalParticipants = this.getActivityParticipants(activity, travelers);

      if (activity.pricingModel === 'per_group') {
        activityPrice = activity.pricePerGroup || 0;
      } else if (activity.pricingModel === 'per_person_with_minimum') {
        const billableParticipants = Math.max(
          totalParticipants,
          activity.minimumParticipants
        );
        activityPrice = activity.pricePerPerson * billableParticipants;
      } else {
        // per_person
        activityPrice = activity.pricePerPerson * totalParticipants;
      }

      total += activityPrice;
      details.push({
        activityId: activity.id,
        activityName: activity.name,
        pricePerPerson: activity.pricePerPerson,
        participants: totalParticipants,
        totalPrice: activityPrice,
      });
    }

    return { total, details };
  }

  private applySeasonalPricing(
    packageData: PackageTemplate,
    travelDate: Date,
    subtotal: number
  ): SeasonalAdjustment {
    const applicableSeason = this.findApplicableSeason(
      packageData.seasonalPricing,
      travelDate
    );

    if (!applicableSeason) {
      return {
        seasonName: null,
        adjustmentType: 'none',
        adjustmentValue: 0,
        adjustedTotal: subtotal,
      };
    }

    let adjustment = 0;
    if (applicableSeason.adjustmentType === 'percentage') {
      adjustment = subtotal * (applicableSeason.adjustmentValue / 100);
    } else {
      adjustment = applicableSeason.adjustmentValue;
    }

    return {
      seasonName: applicableSeason.name,
      adjustmentType: applicableSeason.adjustmentType,
      adjustmentValue: applicableSeason.adjustmentValue,
      adjustment: adjustment,
      adjustedTotal: subtotal + adjustment,
    };
  }

  private applyGroupSizeAdjustment(
    packageData: PackageTemplate,
    travelers: TravelerComposition,
    subtotal: number
  ): GroupSizeAdjustment {
    const totalTravelers = this.getTotalTravelers(travelers);

    // Single traveler supplement
    if (totalTravelers === 1) {
      const supplement = subtotal * 0.25; // 25% single supplement
      return {
        adjustmentType: 'single_supplement',
        adjustmentPercentage: 25,
        adjustment: supplement,
        adjustedTotal: subtotal + supplement,
      };
    }

    // Group discount tiers
    let discountPercentage = 0;
    if (totalTravelers >= 9) {
      discountPercentage = 12;
    } else if (totalTravelers >= 5) {
      discountPercentage = 7;
    }

    if (discountPercentage > 0) {
      const discount = subtotal * (discountPercentage / 100);
      return {
        adjustmentType: 'group_discount',
        adjustmentPercentage: -discountPercentage,
        adjustment: -discount,
        adjustedTotal: subtotal - discount,
      };
    }

    return {
      adjustmentType: 'none',
      adjustmentPercentage: 0,
      adjustment: 0,
      adjustedTotal: subtotal,
    };
  }

  private applyTravelerTypeAdjustments(
    packageData: PackageTemplate,
    travelers: TravelerComposition,
    subtotal: number
  ): TravelerTypeAdjustment {
    const policy = packageData.childPricingPolicy;
    if (!policy) {
      return {
        childDiscount: 0,
        teenDiscount: 0,
        infantCharges: 0,
        adjustedTotal: subtotal,
        details: [],
      };
    }

    const adultPrice = subtotal / travelers.adults;
    let totalAdjustment = 0;
    const details: TravelerAdjustmentDetail[] = [];

    // Children
    if (travelers.children > 0) {
      let childPrice = adultPrice;
      if (policy.childPriceType === 'percentage') {
        childPrice = adultPrice * (policy.childPercentage / 100);
      } else if (policy.childPriceType === 'fixed') {
        childPrice = policy.childFixedAmount || 0;
      }
      const childTotal = childPrice * travelers.children;
      totalAdjustment += childTotal;
      details.push({
        travelerType: 'child',
        count: travelers.children,
        pricePerPerson: childPrice,
        total: childTotal,
      });
    }

    // Teens
    if (travelers.teens > 0) {
      let teenPrice = adultPrice;
      if (policy.teenPriceType === 'percentage') {
        teenPrice = adultPrice * (policy.teenPercentage / 100);
      } else if (policy.teenPriceType === 'fixed') {
        teenPrice = policy.teenFixedAmount || 0;
      }
      const teenTotal = teenPrice * travelers.teens;
      totalAdjustment += teenTotal;
      details.push({
        travelerType: 'teen',
        count: travelers.teens,
        pricePerPerson: teenPrice,
        total: teenTotal,
      });
    }

    // Infants
    if (travelers.infants > 0) {
      let infantPrice = 0;
      if (policy.infantPriceType === 'percentage') {
        infantPrice = adultPrice * (policy.infantPercentage / 100);
      } else if (policy.infantPriceType === 'fixed') {
        infantPrice = policy.infantFixedAmount || 0;
      }
      const infantTotal = infantPrice * travelers.infants;
      totalAdjustment += infantTotal;
      details.push({
        travelerType: 'infant',
        count: travelers.infants,
        pricePerPerson: infantPrice,
        total: infantTotal,
      });
    }

    return {
      childDiscount: 0, // Calculated based on savings vs adult price
      teenDiscount: 0,
      infantCharges: details.find(d => d.travelerType === 'infant')?.total || 0,
      adjustedTotal: subtotal + totalAdjustment,
      details,
    };
  }

  private async applyPromoCode(
    promoCode: string | undefined,
    subtotal: number,
    packageId: string,
    travelDate: Date
  ): Promise<PromoDiscount | null> {
    if (!promoCode) return null;

    const promo = await this.prisma.promoCode.findUnique({
      where: { code: promoCode.toUpperCase() },
    });

    if (!promo) {
      return { valid: false, message: 'Invalid promo code' };
    }

    // Validate promo code
    const now = new Date();
    if (promo.expiresAt && promo.expiresAt < now) {
      return { valid: false, message: 'Promo code has expired' };
    }

    if (promo.startsAt && promo.startsAt > now) {
      return { valid: false, message: 'Promo code is not yet active' };
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return { valid: false, message: 'Promo code usage limit reached' };
    }

    if (promo.minimumAmount && subtotal < promo.minimumAmount) {
      return {
        valid: false,
        message: `Minimum spend of ${promo.minimumAmount} required`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = subtotal * (promo.discountValue / 100);
      if (promo.maxDiscount) {
        discount = Math.min(discount, promo.maxDiscount);
      }
    } else {
      discount = promo.discountValue;
    }

    return {
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      calculatedDiscount: discount,
      adjustedTotal: subtotal - discount,
    };
  }

  private generateCacheKey(request: PricingRequest): string {
    const components = [
      request.packageId,
      request.travelDate.toISOString().split('T')[0],
      `a${request.travelers.adults}`,
      `c${request.travelers.children}`,
      `t${request.travelers.teens}`,
      `i${request.travelers.infants}`,
      ...request.accommodationSelections.map(
        s => `${s.dayNumber}:${s.accommodationOptionId}`
      ),
      ...request.activitySelections.sort(),
      request.promoCode || 'no_promo',
    ];
    return `price:${components.join('_')}`;
  }

  private getTotalTravelers(travelers: TravelerComposition): number {
    return (
      travelers.adults +
      travelers.teens +
      travelers.children +
      travelers.infants
    );
  }
}

export { PricingEngine, PricingRequest, PricingBreakdown };
```

---

## Pricing Rules Engine

### Rule Types

```typescript
enum PricingRuleType {
  SEASONAL = 'seasonal',           // Date-based adjustments
  GROUP_SIZE = 'group_size',       // Number of travelers
  EARLY_BIRD = 'early_bird',       // Booking window
  LAST_MINUTE = 'last_minute',     // Last-minute deals
  LOYALTY = 'loyalty',             // Returning customers
  PROMO_CODE = 'promo_code',       // Specific codes
  ACCOMMODATION_TIER = 'accommodation_tier',
  CHILD_PRICING = 'child_pricing',
}

interface PricingRule {
  id: string;
  type: PricingRuleType;
  name: string;
  description: string;

  // Conditions
  conditions: PricingCondition[];

  // Action
  action: PricingAction;

  // Priority (lower = applied first)
  priority: number;

  // Stack behavior
  stackable: boolean;

  // Active status
  isActive: boolean;
}

interface PricingCondition {
  field: string;              // 'travelDate', 'bookingDate', 'totalTravelers', etc.
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'between';
  value: any;
}

interface PricingAction {
  type: 'percentage' | 'fixed' | 'multiplier';
  value: number;
  appliesTo: 'base' | 'accommodation' | 'activities' | 'total';
}
```

### Example Rules Configuration

```json
{
  "rules": [
    {
      "id": "high_season_2026",
      "type": "seasonal",
      "name": "High Season 2026",
      "conditions": [
        {
          "field": "travelDate",
          "operator": "between",
          "value": ["2026-07-01", "2026-10-31"]
        }
      ],
      "action": {
        "type": "percentage",
        "value": 25,
        "appliesTo": "total"
      },
      "priority": 10,
      "stackable": true,
      "isActive": true
    },
    {
      "id": "group_discount_5plus",
      "type": "group_size",
      "name": "Group Discount (5-8 travelers)",
      "conditions": [
        {
          "field": "totalTravelers",
          "operator": "between",
          "value": [5, 8]
        }
      ],
      "action": {
        "type": "percentage",
        "value": -7,
        "appliesTo": "total"
      },
      "priority": 20,
      "stackable": true,
      "isActive": true
    },
    {
      "id": "early_bird_90days",
      "type": "early_bird",
      "name": "Early Bird (90+ days)",
      "conditions": [
        {
          "field": "daysUntilTravel",
          "operator": "gte",
          "value": 90
        }
      ],
      "action": {
        "type": "percentage",
        "value": -10,
        "appliesTo": "total"
      },
      "priority": 30,
      "stackable": false,
      "isActive": true
    }
  ]
}
```

---

## Seasonal Pricing Configuration

### East African Safari Seasons

```typescript
const SAFARI_SEASONS = {
  HIGH_SEASON: {
    name: 'High Season',
    description: 'Great Migration & dry season',
    dateRanges: [
      { start: '07-01', end: '10-31' }, // July - October
      { start: '12-15', end: '01-05' }, // Christmas/New Year
    ],
    adjustment: { type: 'percentage', value: 25 },
  },
  SHOULDER_SEASON: {
    name: 'Shoulder Season',
    description: 'Good weather, fewer crowds',
    dateRanges: [
      { start: '01-06', end: '03-14' }, // January - mid March
      { start: '06-01', end: '06-30' }, // June
      { start: '11-01', end: '12-14' }, // November - mid December
    ],
    adjustment: { type: 'percentage', value: 10 },
  },
  GREEN_SEASON: {
    name: 'Green Season',
    description: 'Rainy season, lush landscapes, great rates',
    dateRanges: [
      { start: '03-15', end: '05-31' }, // Mid March - May (long rains)
    ],
    adjustment: { type: 'percentage', value: -10 },
  },
};
```

---

## Child Pricing Matrix

### Standard Policies

| Traveler Type | Age Range | Default Pricing | Safari Industry Standard |
|---------------|-----------|-----------------|-------------------------|
| Infant | 0-2 years | Free (sharing) | Free with adult |
| Child | 3-11 years | 50% of adult | 40-60% of adult |
| Teen | 12-17 years | 85% of adult | 80-100% of adult |
| Adult | 18+ years | 100% | Full price |

### Policy Configuration

```typescript
interface ChildPricingConfig {
  // Age boundaries
  infantMaxAge: 2;
  childMaxAge: 11;
  teenMaxAge: 17;

  // Pricing rules
  infantPricing: {
    model: 'free' | 'percentage' | 'fixed';
    value: 0;
    maxFreePerRoom: 1;
  };

  childPricing: {
    model: 'percentage' | 'fixed';
    value: 50;                    // 50% of adult price
    sharingDiscount: 10;          // Additional 10% off if sharing with adults
    minAge: 3;
  };

  teenPricing: {
    model: 'percentage' | 'fixed' | 'adult';
    value: 85;                    // 85% of adult price
  };

  // Restrictions
  requiresAccompanyingAdult: true;
  maxChildrenPerAdult: 2;
  someActivitiesExcludeChildren: true;
  minAgeForSafari: 5;             // Some lodges have minimum ages
}
```

---

## API Specifications

### Calculate Price

**Endpoint**: `POST /api/pricing/calculate`

**Request Body**:
```json
{
  "packageId": "pkg_abc123",
  "travelDate": "2026-08-15",
  "travelers": {
    "adults": 2,
    "teens": 0,
    "children": 1,
    "infants": 0
  },
  "accommodationSelections": [
    {
      "dayNumber": 1,
      "accommodationOptionId": "acc_luxury_mara"
    },
    {
      "dayNumber": 2,
      "accommodationOptionId": "acc_luxury_mara"
    }
  ],
  "activitySelections": ["act_balloon", "act_bush_dinner"],
  "promoCode": "SUMMER2026",
  "currency": "USD"
}
```

**Response**:
```json
{
  "success": true,
  "calculation": {
    "basePackage": {
      "description": "3-Day Masai Mara Safari",
      "pricePerAdult": 450,
      "totalAdults": 2,
      "total": 900
    },
    "accommodations": {
      "total": 600,
      "breakdown": [
        {
          "day": 1,
          "name": "Governors Camp",
          "tier": "luxury",
          "pricePerPerson": 150,
          "nights": 1,
          "travelers": 2,
          "total": 300
        },
        {
          "day": 2,
          "name": "Governors Camp",
          "tier": "luxury",
          "pricePerPerson": 150,
          "nights": 1,
          "travelers": 2,
          "total": 300
        }
      ]
    },
    "activities": {
      "total": 1040,
      "breakdown": [
        {
          "name": "Hot Air Balloon Safari",
          "pricePerPerson": 450,
          "participants": 2,
          "total": 900
        },
        {
          "name": "Bush Dinner Experience",
          "pricePerPerson": 70,
          "participants": 2,
          "total": 140
        }
      ]
    },
    "childPricing": {
      "children": 1,
      "childPricePercentage": 50,
      "childBasePrice": 225,
      "childAccommodation": 150,
      "childActivities": 345,
      "childTotal": 720
    },
    "seasonalAdjustment": {
      "season": "High Season",
      "adjustmentType": "percentage",
      "adjustmentValue": 25,
      "baseAmount": 3260,
      "adjustment": 815,
      "adjustedTotal": 4075
    },
    "groupDiscount": {
      "totalTravelers": 3,
      "discountApplied": false,
      "discountPercentage": 0,
      "discountAmount": 0
    },
    "promoCode": {
      "code": "SUMMER2026",
      "valid": true,
      "discountType": "percentage",
      "discountValue": 10,
      "discountAmount": 407.50,
      "message": "10% summer discount applied"
    },
    "totals": {
      "subtotalBeforeDiscounts": 4075,
      "totalDiscounts": 407.50,
      "finalTotal": 3667.50,
      "currency": "USD"
    },
    "perPerson": {
      "adults": {
        "count": 2,
        "priceEach": 1527.08
      },
      "children": {
        "count": 1,
        "priceEach": 613.34
      }
    }
  },
  "metadata": {
    "calculatedAt": "2026-01-07T12:00:00Z",
    "expiresAt": "2026-01-07T12:05:00Z",
    "cacheKey": "price_pkg_abc123_20260815_a2c1t0i0_...",
    "calculationTimeMs": 45
  },
  "warnings": [
    "High season rates applied - 25% premium",
    "Hot Air Balloon has minimum age of 7 years"
  ]
}
```

### Validate Promo Code

**Endpoint**: `POST /api/pricing/validate-promo`

**Request Body**:
```json
{
  "promoCode": "SUMMER2026",
  "packageId": "pkg_abc123",
  "subtotal": 4075
}
```

**Response**:
```json
{
  "valid": true,
  "code": "SUMMER2026",
  "discountType": "percentage",
  "discountValue": 10,
  "calculatedDiscount": 407.50,
  "message": "10% summer discount applied",
  "restrictions": {
    "minimumAmount": 500,
    "validUntil": "2026-08-31",
    "singleUsePerCustomer": true
  }
}
```

---

## Caching Strategy

### Cache Levels

1. **Package Data Cache** (Redis, TTL: 1 hour)
   - Package templates, accommodation options, activities
   - Invalidated on package update

2. **Pricing Calculation Cache** (Redis, TTL: 5 minutes)
   - Full pricing calculations
   - Key based on all input parameters
   - Short TTL for price freshness

3. **Promo Code Cache** (Redis, TTL: 10 minutes)
   - Promo code validity
   - Invalidated on code update

### Cache Invalidation

```typescript
// On package update
await redis.del(`package:${packageId}:*`);

// On seasonal pricing update
await redis.del(`seasonal:${packageId}:*`);

// On promo code update
await redis.del(`promo:${promoCode}`);
```

---

## Performance Requirements

| Metric | Target | Critical |
|--------|--------|----------|
| Average calculation time | < 100ms | < 200ms |
| 99th percentile | < 200ms | < 500ms |
| Cache hit rate | > 70% | > 50% |
| Concurrent calculations | 1000/sec | 500/sec |

### Optimization Strategies

1. **Pre-calculation**: Calculate common configurations during off-peak
2. **Lazy loading**: Only load rules relevant to the request
3. **Database indexing**: Optimize queries for package and rule lookups
4. **Connection pooling**: Reuse database and Redis connections
5. **Horizontal scaling**: Stateless engine supports multiple instances

---

## Testing Requirements

### Unit Tests

```typescript
describe('PricingEngine', () => {
  describe('calculateBasePrice', () => {
    it('calculates per-person pricing correctly');
    it('calculates per-group pricing correctly');
    it('handles single traveler correctly');
  });

  describe('calculateAccommodationPrice', () => {
    it('calculates per-person accommodation correctly');
    it('calculates per-room accommodation correctly');
    it('handles missing selections gracefully');
    it('applies correct tier pricing');
  });

  describe('applySeasonalPricing', () => {
    it('applies high season premium');
    it('applies green season discount');
    it('handles dates outside seasons');
    it('handles overlapping seasons with priority');
  });

  describe('applyChildPricing', () => {
    it('calculates infant pricing (free)');
    it('calculates child pricing (percentage)');
    it('calculates teen pricing');
    it('respects max children per room');
  });

  describe('applyPromoCode', () => {
    it('applies valid percentage discount');
    it('applies valid fixed discount');
    it('rejects expired promo codes');
    it('rejects exceeded usage limit');
    it('respects minimum spend requirements');
  });
});
```

### Integration Tests

- Full calculation flow with database
- Cache hit/miss scenarios
- Concurrent calculation handling
- Error recovery scenarios

### Load Tests

- 1000 concurrent price calculations
- Cache under load
- Database connection pool exhaustion
- Redis failover scenarios

---

## Error Handling

### Error Types

```typescript
class PricingError extends Error {
  code: string;
  statusCode: number;

  static PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND';
  static INVALID_ACCOMMODATION = 'INVALID_ACCOMMODATION';
  static INVALID_ACTIVITY = 'INVALID_ACTIVITY';
  static INVALID_PROMO_CODE = 'INVALID_PROMO_CODE';
  static CALCULATION_ERROR = 'CALCULATION_ERROR';
  static CACHE_ERROR = 'CACHE_ERROR';
}
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ACCOMMODATION",
    "message": "Selected accommodation not available for Day 2",
    "details": {
      "dayNumber": 2,
      "accommodationId": "acc_invalid",
      "availableOptions": ["acc_budget_mara", "acc_luxury_mara"]
    }
  }
}
```

---

## Security Considerations

1. **Server-side calculation**: Never trust client-side price calculations
2. **Rate limiting**: Prevent pricing API abuse (100 req/min)
3. **Input validation**: Sanitize all inputs before processing
4. **Price locking**: Lock price at booking time with signed token
5. **Audit logging**: Log all price calculations for dispute resolution

---

## Future Enhancements (Phase 2+)

1. **AI-Powered Pricing**: Machine learning for demand prediction
2. **Competitor Price Monitoring**: Adjust based on market rates
3. **Dynamic Availability Pricing**: Higher prices for limited availability
4. **Personalized Pricing**: Based on customer segment/history
5. **A/B Testing**: Test different pricing strategies
6. **Multi-Currency Real-Time**: Live currency conversion

---

## Approval Checklist

- [ ] Pricing engine architecture approved
- [ ] Rule types and configuration approved
- [ ] API specifications approved
- [ ] Caching strategy approved
- [ ] Performance requirements approved

**Approver**: ____________________
**Date**: ____________________
**Notes**: ____________________

---

## Sources & References

- [PROS Real-Time Dynamic Pricing](https://pros.com/products/real-time-dynamic-pricing-software/)
- [Hotel Dynamic Pricing Implementation](https://kodytechnolab.com/blog/how-hotel-dynamic-pricing-works/)
- [PriceLabs Dynamic Pricing](https://hello.pricelabs.co/dynamic-pricing/)
- [Nected Dynamic Pricing Rule Engine](https://www.nected.ai/blog/dynamic-pricing-rule-engine)
- [Microservices Pricing Architecture](https://arxiv.org/abs/2411.01636)
- [Zilliant Real-Time Pricing Engine](https://zilliant.com/blog/what-is-a-real-time-pricing-engine)
- [Booking.com Child Pricing](https://partner.booking.com/en-us/help/rates-availability/rates-special-offers/setting-flexible-children-rates)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial specification |
