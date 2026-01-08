# Feature: Package Configurator Frontend

## Status
- [x] Requirements Approved
- [x] Design Complete
- [x] Implementation Started
- [x] Implementation Complete (Core Features)
- [ ] Testing Complete
- [ ] Deployed

## Implemented Components

The following components have been implemented and are live on the tour detail page (`/tours/[slug]`):

### TourCustomizer (`/src/components/tours/tour-customizer.tsx`)
State management wrapper using render props pattern:
- Manages `BookingState`: accommodations by night, selected add-ons, guests, start date
- Calculates `PricingBreakdown` in real-time with useMemo
- Initializes accommodations with defaults from itinerary
- Handles booking flow navigation to checkout

### InteractiveItinerary (`/src/components/tours/interactive-itinerary.tsx`)
Per-day customization cards:
- Shows day info (title, description, meals, activities)
- **Accommodation Selection**: Radio-style selectors for days with multiple options
- Shows price difference from default (+$X upgrade / -$X save)
- **Add-ons Section**: Available add-ons shown per day with checkbox toggles
- Handles single accommodation display when only one option

### BookingCard (`/src/components/tours/booking-card.tsx`)
Sticky price summary sidebar:
- Date picker for travel dates
- Guest counter (adults/children) with max group size validation
- **Add-ons selection**: Checkbox-style toggles in the booking card
- **Collapsible price breakdown**: Accommodation per night, add-ons breakdown
- Service fee calculation (5%)
- Book Now button with ref for floating button tracking

### Floating Book Now Button (`/src/components/tours/tour-detail-content.tsx`)
- Uses IntersectionObserver on main Book Now button
- Shows polished pill-shaped floating CTA when main button scrolls out of view
- Price badge + smooth slide-up/fade animation
- Auto-hides when main Book Now button is visible

## Overview

The Package Configurator is SafariPlus's KEY DIFFERENTIATOR - a real-time, interactive tool that allows tourists to customize their safari packages by selecting accommodations, activities, and traveler configurations with instant price updates.

## User Stories

### Tourist
- As a tourist, I want to configure my safari package with my preferred accommodations
- As a tourist, I want to add optional activities to my trip
- As a tourist, I want to see the price update in real-time as I make selections
- As a tourist, I want to see detailed information about accommodations before selecting
- As a tourist, I want to save my configuration and share it with travel companions
- As a tourist, I want to specify different traveler types (adults, children, infants)

### Agent
- As an agent, I want to create package templates with configurable options
- As an agent, I want to set different accommodation tiers with pricing
- As an agent, I want to add optional activities with various pricing models
- As an agent, I want to preview how tourists will see my packages

## Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Package Configurator | `/packages/[slug]` | Tourist configuration interface |
| Saved Configuration | `/packages/configure/[shareToken]` | Shared configuration view |
| Agent Package List | `/agent/packages` | Agent's package templates |
| Create Package | `/agent/packages/create` | Package template creation |
| Edit Package | `/agent/packages/[id]/edit` | Edit package template |
| Preview Package | `/agent/packages/[id]/preview` | Preview as tourist |

## Tourist Configurator Specification

### Layout - Desktop (Side-by-Side)
```
+------------------------------------------------------------------+
|  [Logo]  < Back to Tours           Currency: [USD v]              |
+------------------------------------------------------------------+
|                                                                   |
|  +---------------------------+  +-------------------------------+ |
|  |  PACKAGE INFO             |  |  CONFIGURE YOUR TRIP          | |
|  |                           |  |                               | |
|  |  [Image Carousel]         |  |  TRAVELERS                    | |
|  |                           |  |  +-------+ +-------+ +------+ | |
|  |  3 Days Masai Mara        |  |  | 2     | | 1     | | 0    | | |
|  |  Safari                   |  |  |Adults | |Child  | |Infant| | |
|  |                           |  |  +-------+ +-------+ +------+ | |
|  |  **** 4.8 (127 reviews)   |  |                               | |
|  |                           |  |  TRAVEL DATE                  | |
|  +---------------------------+  |  [August 15, 2026        v]   | |
|  |                           |  |                               | |
|  |  YOUR SELECTION           |  |  DAY 1: NAIROBI TO MARA       | |
|  |  (Sticky)                 |  |  Morning departure, arrive... | |
|  |                           |  |                               | |
|  |  2 Adults, 1 Child        |  |  SELECT ACCOMMODATION         | |
|  |  Aug 15-18, 2026          |  |  +---------------------------+| |
|  |                           |  |  | [img] Budget              || |
|  |  Base Package:   $1,350   |  |  | Wildebeest Camp           || |
|  |  Accommodations:   $450   |  |  | $80/person [Select]       || |
|  |  Activities:         $0   |  |  +---------------------------+| |
|  |  High Season:      +$270  |  |  | [img] Comfort  [DEFAULT]  || |
|  |  Child (50%):      -$337  |  |  | Mara Serena Lodge         || |
|  |  ----------------------   |  |  | $150/person [Selected]    || |
|  |  TOTAL:          $1,733   |  |  +---------------------------+| |
|  |                           |  |  | [img] Luxury              || |
|  |  [Book Now - $1,733]      |  |  | Governors' Camp           || |
|  |  [Save] [Share]           |  |  | $350/person [Select]      || |
|  |                           |  |  +---------------------------+| |
|  +---------------------------+  |                               | |
|                                 |  [View Details] on each card  | |
|                                 |                               | |
|                                 |  DAY 2: FULL DAY SAFARI       | |
|                                 |  ...                          | |
|                                 |                               | |
|                                 |  OPTIONAL ACTIVITIES          | |
|                                 |  +---------------------------+| |
|                                 |  | Hot Air Balloon           || |
|                                 |  | $450/person [+ Add]       || |
|                                 |  +---------------------------+| |
|                                 |  | Bush Dinner               || |
|                                 |  | $120/person [+ Add]       || |
|                                 |  +---------------------------+| |
|                                 |                               | |
|                                 +-------------------------------+ |
+------------------------------------------------------------------+
```

### Layout - Mobile (Stacked)
```
+---------------------------+
|  [<] Package  [Currency]  |
+---------------------------+
|                           |
|  [Image Carousel]         |
|                           |
|  3 Days Masai Mara Safari |
|  **** 4.8 (127 reviews)   |
|                           |
+---------------------------+
|  TRAVELERS & DATE         |
|  [2 Adults] [1 Child]     |
|  [Aug 15, 2026]           |
+---------------------------+
|                           |
|  DAY 1: NAIROBI TO MARA   |
|  Morning departure...     |
|                           |
|  ACCOMMODATION            |
|  +----------------------+ |
|  | [img]                | |
|  | Budget               | |
|  | Wildebeest Camp      | |
|  | $80/person           | |
|  | [Select]             | |
|  +----------------------+ |
|  +----------------------+ |
|  | [img]     SELECTED   | |
|  | Comfort              | |
|  | Mara Serena Lodge    | |
|  | $150/person          | |
|  +----------------------+ |
|  +----------------------+ |
|  | [img]                | |
|  | Luxury               | |
|  | Governors' Camp      | |
|  | $350/person          | |
|  | [Select]             | |
|  +----------------------+ |
|                           |
|  DAY 2: SAFARI DAY        |
|  ...                      |
|                           |
+---------------------------+
|  OPTIONAL ACTIVITIES      |
|  [Hot Air Balloon] $450   |
|  [Bush Dinner] $120       |
+---------------------------+
|                           |
|  +----------------------+ |
|  | BASE:        $1,350  | |
|  | ACCOM:         $450  | |
|  | ACTIVITIES:      $0  | |
|  | HIGH SEASON:   +$270 | |
|  | CHILD:         -$337 | |
|  | ---------------      | |
|  | TOTAL:       $1,733  | |
|  |                      | |
|  | [Book Now - $1,733]  | |
|  +----------------------+ |
|                           |
+---------------------------+
```

---

## Core Components

### PackageConfigurator (Main Container)
```tsx
// components/packages/PackageConfigurator.tsx
interface PackageConfiguratorProps {
  package: PackageTemplate
  initialConfig?: SavedConfiguration
  isPreview?: boolean
}

export function PackageConfigurator({
  package,
  initialConfig,
  isPreview = false
}: PackageConfiguratorProps) {
  const [config, setConfig] = useState<PackageConfiguration>(
    initialConfig || getDefaultConfig(package)
  )

  // Calculate price in real-time
  const pricing = useMemo(() =>
    calculatePackagePrice(package, config),
    [package, config]
  )

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Desktop: Sticky sidebar */}
      <aside className="hidden lg:block lg:w-80 lg:sticky lg:top-4 lg:self-start">
        <PackageHeader package={package} />
        <PriceBreakdown
          pricing={pricing}
          config={config}
          onBook={() => handleBook()}
          onSave={() => handleSave()}
          onShare={() => handleShare()}
          disabled={isPreview}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1 space-y-8">
        {/* Mobile header */}
        <div className="lg:hidden">
          <PackageHeader package={package} />
        </div>

        {/* Traveler selector */}
        <TravelerSelector
          config={config}
          childPolicy={package.childPricingPolicy}
          maxGroupSize={package.maxGroupSize}
          onChange={(travelers) => setConfig({ ...config, travelers })}
        />

        {/* Date selector */}
        <DateSelector
          config={config}
          package={package}
          onChange={(date) => setConfig({ ...config, travelDate: date })}
        />

        {/* Itinerary with accommodation selection */}
        {package.days.map((day) => (
          <ItineraryDay
            key={day.id}
            day={day}
            selectedAccommodation={config.accommodations[day.id]}
            travelers={config.travelers}
            onAccommodationChange={(accId) =>
              setConfig({
                ...config,
                accommodations: { ...config.accommodations, [day.id]: accId }
              })
            }
          />
        ))}

        {/* Optional activities */}
        <ActivitiesSection
          activities={package.activities}
          selectedActivities={config.activities}
          travelers={config.travelers}
          onToggle={(activityId) =>
            setConfig({
              ...config,
              activities: config.activities.includes(activityId)
                ? config.activities.filter(id => id !== activityId)
                : [...config.activities, activityId]
            })
          }
        />
      </main>

      {/* Mobile: Fixed bottom price bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <MobilePriceBar
          pricing={pricing}
          onBook={() => handleBook()}
        />
      </div>
    </div>
  )
}
```

### TravelerSelector
```tsx
// components/packages/TravelerSelector.tsx
interface TravelerSelectorProps {
  config: TravelerConfig
  childPolicy: ChildPricingPolicy
  maxGroupSize: number
  onChange: (config: TravelerConfig) => void
}

export function TravelerSelector({
  config,
  childPolicy,
  maxGroupSize,
  onChange
}: TravelerSelectorProps) {
  const totalTravelers = config.adults + config.children + config.teens + config.infants

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who's traveling?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <TravelerCounter
            label="Adults"
            sublabel={`${childPolicy.teenMaxAge + 1}+ years`}
            value={config.adults}
            min={1}
            max={maxGroupSize - (totalTravelers - config.adults)}
            onChange={(v) => onChange({ ...config, adults: v })}
          />
          <TravelerCounter
            label="Teens"
            sublabel={`${childPolicy.teenMinAge}-${childPolicy.teenMaxAge} years`}
            value={config.teens}
            min={0}
            max={maxGroupSize - (totalTravelers - config.teens)}
            onChange={(v) => onChange({ ...config, teens: v })}
          />
          <TravelerCounter
            label="Children"
            sublabel={`${childPolicy.childMinAge}-${childPolicy.childMaxAge} years`}
            value={config.children}
            min={0}
            max={maxGroupSize - (totalTravelers - config.children)}
            onChange={(v) => onChange({ ...config, children: v })}
          />
          <TravelerCounter
            label="Infants"
            sublabel={`${childPolicy.infantMinAge}-${childPolicy.infantMaxAge} years`}
            value={config.infants}
            min={0}
            max={childPolicy.maxFreeInfantsPerRoom * config.adults}
            onChange={(v) => onChange({ ...config, infants: v })}
          />
        </div>

        {/* Child pricing info */}
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p>Children ({childPolicy.childMinAge}-{childPolicy.childMaxAge}): {childPolicy.childPercentage}% of adult rate</p>
          <p>Infants ({childPolicy.infantMinAge}-{childPolicy.infantMaxAge}): {childPolicy.infantPriceType === 'free' ? 'Free' : `${childPolicy.infantPercentage}%`}</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

### AccommodationSelector
```tsx
// components/packages/AccommodationSelector.tsx
interface AccommodationSelectorProps {
  options: AccommodationOption[]
  selected: string | null
  travelers: TravelerConfig
  dayNumber: number
  onSelect: (id: string) => void
  onViewDetails: (option: AccommodationOption) => void
}

export function AccommodationSelector({
  options,
  selected,
  travelers,
  dayNumber,
  onSelect,
  onViewDetails,
}: AccommodationSelectorProps) {
  // Sort by tier
  const sortedOptions = [...options].sort((a, b) =>
    TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
  )

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700">Select Accommodation</h4>
      <div className="grid gap-3">
        {sortedOptions.map((option) => {
          const priceForGroup = calculateAccommodationPrice(option, travelers)
          const isSelected = selected === option.id

          return (
            <div
              key={option.id}
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => onSelect(option.id)}
            >
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={option.images[0]?.url || "/placeholder.jpg"}
                    alt={option.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TierBadge tier={option.tier} />
                    {option.isDefault && (
                      <Badge variant="secondary">Recommended</Badge>
                    )}
                  </div>
                  <h5 className="font-semibold mt-1 truncate">{option.name}</h5>
                  <p className="text-sm text-gray-500 line-clamp-1">
                    {option.shortDescription}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-semibold text-primary">
                      +${priceForGroup.total}/night
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewDetails(option)
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Selection indicator */}
                <div className="flex-shrink-0">
                  {isSelected ? (
                    <CheckCircle className="h-6 w-6 text-primary" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### AccommodationDetailModal
```tsx
// components/packages/AccommodationDetailModal.tsx
interface AccommodationDetailModalProps {
  accommodation: AccommodationOption
  travelers: TravelerConfig
  isOpen: boolean
  onClose: () => void
  onSelect: () => void
}

export function AccommodationDetailModal({
  accommodation,
  travelers,
  isOpen,
  onClose,
  onSelect,
}: AccommodationDetailModalProps) {
  const pricing = calculateAccommodationPrice(accommodation, travelers)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Image Gallery */}
        <div className="relative aspect-[16/9] -mx-6 -mt-6">
          <ImageCarousel images={accommodation.images} />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TierBadge tier={accommodation.tier} />
              {accommodation.starRating && (
                <div className="flex items-center gap-1">
                  {Array(accommodation.starRating).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold mt-2">{accommodation.name}</h2>
            <p className="text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="h-4 w-4" />
              {accommodation.location}
            </p>
          </div>
          {accommodation.guestRating && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {accommodation.guestRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">Guest Rating</div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="prose prose-sm max-w-none">
          <p>{accommodation.description}</p>
        </div>

        {/* Highlights */}
        {accommodation.highlights.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Highlights</h3>
            <ul className="grid grid-cols-2 gap-2">
              {accommodation.highlights.map((highlight, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Amenities */}
        <div>
          <h3 className="font-semibold mb-2">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {accommodation.amenities.map((amenity, i) => (
              <Badge key={i} variant="outline">{amenity}</Badge>
            ))}
          </div>
        </div>

        {/* Room Types (if available) */}
        {accommodation.roomTypes.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2">Room Types</h3>
            <div className="space-y-2">
              {accommodation.roomTypes.map((room) => (
                <div key={room.id} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{room.name}</p>
                    <p className="text-sm text-gray-500">{room.bedConfiguration}</p>
                  </div>
                  {room.priceModifier !== 0 && (
                    <span className="text-primary">
                      +${room.priceModifier}/night
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="bg-primary/5 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Pricing for Your Group</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{travelers.adults} Adults x ${pricing.perAdult}</span>
              <span>${pricing.adultsTotal}</span>
            </div>
            {travelers.children > 0 && (
              <div className="flex justify-between">
                <span>{travelers.children} Children x ${pricing.perChild}</span>
                <span>${pricing.childrenTotal}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total per night</span>
              <span>${pricing.total}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => { onSelect(); onClose(); }}>
            Select This Accommodation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### PriceBreakdown
```tsx
// components/packages/PriceBreakdown.tsx
interface PriceBreakdownProps {
  pricing: CalculatedPricing
  config: PackageConfiguration
  onBook: () => void
  onSave: () => void
  onShare: () => void
  disabled?: boolean
}

export function PriceBreakdown({
  pricing,
  config,
  onBook,
  onSave,
  onShare,
  disabled = false,
}: PriceBreakdownProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Your Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Travelers summary */}
        <div className="text-sm text-gray-600">
          {config.travelers.adults} Adult{config.travelers.adults !== 1 && 's'}
          {config.travelers.children > 0 && `, ${config.travelers.children} Child${config.travelers.children !== 1 ? 'ren' : ''}`}
          {config.travelers.teens > 0 && `, ${config.travelers.teens} Teen${config.travelers.teens !== 1 && 's'}`}
          {config.travelers.infants > 0 && `, ${config.travelers.infants} Infant${config.travelers.infants !== 1 && 's'}`}
        </div>

        {/* Date */}
        {config.travelDate && (
          <div className="text-sm text-gray-600">
            {format(config.travelDate, "MMM d, yyyy")}
          </div>
        )}

        <Separator />

        {/* Price breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Package</span>
            <span>${pricing.base.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Accommodations</span>
            <span>${pricing.accommodations.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Activities</span>
            <span>${pricing.activities.toFixed(2)}</span>
          </div>

          {pricing.seasonalAdjustment !== 0 && (
            <div className={cn(
              "flex justify-between",
              pricing.seasonalAdjustment > 0 ? "text-orange-600" : "text-green-600"
            )}>
              <span>{pricing.seasonalName || "Seasonal"}</span>
              <span>
                {pricing.seasonalAdjustment > 0 ? "+" : ""}
                ${pricing.seasonalAdjustment.toFixed(2)}
              </span>
            </div>
          )}

          {pricing.childDiscount !== 0 && (
            <div className="flex justify-between text-green-600">
              <span>Child Discount</span>
              <span>-${Math.abs(pricing.childDiscount).toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${pricing.total.toFixed(2)}</span>
          </div>

          <p className="text-xs text-gray-500">
            ${(pricing.total / (config.travelers.adults + config.travelers.children + config.travelers.teens)).toFixed(2)} per person average
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          className="w-full"
          size="lg"
          onClick={onBook}
          disabled={disabled || !config.travelDate}
        >
          Book Now - ${pricing.total.toFixed(2)}
        </Button>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1" onClick={onSave}>
            <Heart className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" className="flex-1" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
```

---

## Pricing Engine (Frontend)

### Calculate Package Price
```typescript
// lib/pricing/calculate.ts
export interface CalculatedPricing {
  base: number
  accommodations: number
  activities: number
  seasonalAdjustment: number
  seasonalName: string | null
  childDiscount: number
  subtotal: number
  total: number
}

export function calculatePackagePrice(
  package: PackageTemplate,
  config: PackageConfiguration
): CalculatedPricing {
  const { travelers, travelDate, accommodations, activities } = config

  // 1. Calculate base price
  const basePerPerson = package.basePrice
  const adultBase = basePerPerson * travelers.adults
  const teenBase = calculateTravelerPrice(
    basePerPerson,
    travelers.teens,
    package.childPricingPolicy,
    "teen"
  )
  const childBase = calculateTravelerPrice(
    basePerPerson,
    travelers.children,
    package.childPricingPolicy,
    "child"
  )
  const infantBase = calculateTravelerPrice(
    basePerPerson,
    travelers.infants,
    package.childPricingPolicy,
    "infant"
  )
  const base = adultBase + teenBase + childBase + infantBase

  // 2. Calculate accommodation costs
  let accommodationsTotal = 0
  for (const day of package.days) {
    if (!day.requiresAccommodation) continue
    const selectedAccomId = accommodations[day.id]
    const accom = day.accommodationOptions.find(a => a.id === selectedAccomId)
    if (accom) {
      accommodationsTotal += calculateAccommodationPrice(accom, travelers).total
    }
  }

  // 3. Calculate activity costs
  let activitiesTotal = 0
  for (const activityId of activities) {
    const activity = package.activities.find(a => a.id === activityId)
    if (activity) {
      activitiesTotal += calculateActivityPrice(activity, travelers)
    }
  }

  // 4. Apply seasonal pricing
  const seasonal = getSeasonalAdjustment(package.seasonalPricing, travelDate)
  const subtotal = base + accommodationsTotal + activitiesTotal
  const seasonalAdjustment = seasonal
    ? (subtotal * seasonal.adjustmentValue / 100)
    : 0

  // 5. Calculate child discount (if shown separately)
  const fullAdultPrice = basePerPerson * (travelers.adults + travelers.teens + travelers.children + travelers.infants)
  const childDiscount = fullAdultPrice - base

  return {
    base,
    accommodations: accommodationsTotal,
    activities: activitiesTotal,
    seasonalAdjustment,
    seasonalName: seasonal?.name || null,
    childDiscount: childDiscount < 0 ? childDiscount : 0,
    subtotal: subtotal + seasonalAdjustment,
    total: subtotal + seasonalAdjustment,
  }
}

function calculateTravelerPrice(
  basePrice: number,
  count: number,
  policy: ChildPricingPolicy,
  type: "teen" | "child" | "infant"
): number {
  if (count === 0) return 0

  switch (type) {
    case "teen":
      if (policy.teenPriceType === "adult") return basePrice * count
      if (policy.teenPriceType === "percentage") return basePrice * (policy.teenPercentage / 100) * count
      return (policy.teenFixedAmount || 0) * count

    case "child":
      if (policy.childPriceType === "percentage") return basePrice * (policy.childPercentage / 100) * count
      return (policy.childFixedAmount || 0) * count

    case "infant":
      if (policy.infantPriceType === "free") return 0
      if (policy.infantPriceType === "percentage") return basePrice * (policy.infantPercentage / 100) * count
      return (policy.infantFixedAmount || 0) * count
  }
}
```

---

## State Management

### Package Configuration Store
```typescript
// stores/package-config-store.ts
interface PackageConfigStore {
  // Configuration
  config: PackageConfiguration | null
  package: PackageTemplate | null

  // UI State
  selectedAccommodationDetail: AccommodationOption | null
  selectedActivityDetail: PackageActivity | null
  isSaving: boolean
  isSharing: boolean

  // Computed
  pricing: CalculatedPricing | null

  // Actions
  initializeConfig: (pkg: PackageTemplate, saved?: SavedConfiguration) => void
  updateTravelers: (travelers: TravelerConfig) => void
  updateTravelDate: (date: Date) => void
  selectAccommodation: (dayId: string, accommodationId: string) => void
  toggleActivity: (activityId: string) => void

  // Modal actions
  showAccommodationDetail: (accom: AccommodationOption) => void
  showActivityDetail: (activity: PackageActivity) => void
  hideDetailModal: () => void

  // Save/Share
  saveConfiguration: () => Promise<string> // Returns share token
  loadSavedConfiguration: (token: string) => Promise<void>
}
```

---

## API Integration

### Package Data Fetching
```tsx
// app/packages/[slug]/page.tsx
import { getPackageBySlug } from "@/lib/queries/packages"

export default async function PackagePage({
  params
}: {
  params: { slug: string }
}) {
  const package = await getPackageBySlug(params.slug)

  if (!package) notFound()

  return (
    <PackageConfiguratorLayout>
      <PackageConfigurator package={package} />
    </PackageConfiguratorLayout>
  )
}
```

### Save Configuration API
```typescript
// lib/api/packages.ts
export async function saveConfiguration(
  packageId: string,
  config: PackageConfiguration
): Promise<{ shareToken: string }> {
  const response = await fetch("/api/packages/configurations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packageId, ...config }),
  })
  return response.json()
}

export async function loadConfiguration(
  shareToken: string
): Promise<SavedConfiguration> {
  const response = await fetch(`/api/packages/configurations/${shareToken}`)
  return response.json()
}
```

---

## Performance Optimization

### Real-Time Price Updates
```tsx
// hooks/use-debounced-pricing.ts
export function useDebouncedPricing(
  package: PackageTemplate,
  config: PackageConfiguration
) {
  const [pricing, setPricing] = useState<CalculatedPricing | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Debounce config changes
  const debouncedConfig = useDebounce(config, 100)

  useEffect(() => {
    setIsCalculating(true)

    // Use web worker for complex calculations if needed
    const result = calculatePackagePrice(package, debouncedConfig)

    // Animate price change
    setPricing(result)
    setIsCalculating(false)
  }, [package, debouncedConfig])

  return { pricing, isCalculating }
}
```

### Image Loading
```tsx
// Lazy load accommodation images
<img
  src={accommodation.images[0]?.url}
  alt={accommodation.name}
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

---

## Testing Checklist

- [x] Package loads with all days and options
- [x] Traveler selector updates correctly
- [x] Date picker shows available dates
- [x] Accommodation selection updates price
- [x] Activity toggle updates price
- [x] Price breakdown is accurate
- [ ] Seasonal pricing applies correctly
- [x] Child pricing calculates correctly (30% discount)
- [ ] Save configuration works
- [ ] Share link generates correctly
- [ ] Shared configuration loads correctly
- [x] Mobile layout is responsive
- [x] Price updates in <200ms
- [ ] Modals display all details
- [x] Floating Book Now button shows/hides correctly
- [x] Per-night accommodation breakdown displays

## Dependencies

- shadcn/ui components
- Zustand
- date-fns
- Embla Carousel (images)
- React Hook Form

## MVP Phase
Phase 1 - Core MVP (Package Builder is KEY DIFFERENTIATOR)

## Estimated Effort
21 story points

## Approval
- [ ] User Approved
- Date:
- Notes:
