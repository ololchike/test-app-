# SafariPlus Strategic Enhancement Roadmap

**Document Version:** 1.0
**Created:** January 14, 2026
**Purpose:** Prioritized implementation roadmap based on competitive-strategy.md analysis
**Methodology:** ROI-based prioritization with 1-2 day deliverable breakdown

---

## Executive Summary

This document translates the competitive strategy into an actionable development roadmap. Features are categorized by effort/impact quadrant and broken into micro-deliverables for agile execution.

### Current State Assessment

| Category | Status |
|----------|--------|
| Authentication & Security | Complete |
| Tour Management | Complete |
| Booking System | Complete |
| Payment (Pesapal/M-Pesa) | Complete |
| Reviews System | Complete |
| Messaging | Complete |
| Agent/Admin Dashboards | Complete |
| Withdrawals | Complete |

### Key Gaps Identified

| Gap | Impact on Conversions |
|-----|----------------------|
| No trust badges/social proof | HIGH - tourists choose Viator over unknown brands |
| No urgency indicators | HIGH - no FOMO driving immediate bookings |
| No abandoned cart recovery | MEDIUM - losing warm leads |
| No WhatsApp integration | HIGH - critical for East African market |
| No referral program | MEDIUM - missing viral growth channel |
| Single payment gateway | MEDIUM - some cards decline |

---

## Part 1: Feature Prioritization Matrix

### Quadrant Analysis

```
                    HIGH IMPACT
                        |
     [QUICK WINS]       |      [STRATEGIC]
     Low effort,        |      High effort,
     High impact        |      High impact
                        |
   ─────────────────────┼─────────────────────
                        |
     [FILL-INS]         |      [AVOID/DEFER]
     Low effort,        |      High effort,
     Low impact         |      Low impact
                        |
                    LOW IMPACT
```

---

## Part 2: QUICK WINS - Highest ROI, Lowest Effort

### QW-1: Trust Badges Component
**Effort:** 1 day | **Impact:** HIGH | **Priority:** 1

Creates immediate credibility with zero backend changes.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1.1 | Create `<TrustBadges />` component with badge images | Component file |
| 1.2 | Add to homepage hero, footer, tour detail pages | Visual trust indicators |
| 1.3 | Add to checkout page payment section | Conversion boost |

#### Technical Spec
```
Location: src/components/home/trust-badges.tsx (EXISTS - enhance)
Badges needed:
- KATO Member (Kenya Association of Tour Operators)
- TATO Member (Tanzania Association of Tour Operators)
- Pesapal Verified Merchant
- SSL Secure (256-bit encryption)
- "All Operators Verified"
- Payment logos (M-Pesa, Visa, Mastercard)

Placement:
- Homepage: Below hero, above footer
- Tour pages: Below booking card
- Checkout: Above payment form
- Footer: All pages
```

---

### QW-2: Social Proof Counters
**Effort:** 1 day | **Impact:** HIGH | **Priority:** 2

Shows platform traction with real database numbers.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1.1 | Create API endpoint for platform stats | `/api/stats/platform` |
| 1.2 | Create `<SocialProofBanner />` component | UI component |
| 1.3 | Add to homepage and tour listing pages | Live counters |

#### Technical Spec
```
API Response:
{
  totalBookings: number,
  verifiedOperators: number,
  averageRating: number,
  totalPaidToAgents: number
}

Display format:
"2,500+ Bookings Made | 150+ Verified Operators | 4.8 Average Rating | $2M+ Paid to Agents"

Query (optimized):
- Bookings: COUNT where status IN (CONFIRMED, COMPLETED)
- Operators: COUNT agents where isVerified = true
- Rating: AVG from reviews
- Paid: SUM from completed withdrawals
```

---

### QW-3: Urgency Indicators on Tour Cards
**Effort:** 1 day | **Impact:** HIGH | **Priority:** 3

Creates FOMO with spots remaining and viewing counts.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1.1 | Add `spotsRemaining` calculation to tour API | Backend logic |
| 1.2 | Create urgency badge components | UI components |
| 1.3 | Integrate into tour cards and detail pages | Visual urgency |

#### Technical Spec
```
Components:
- <SpotsLeftBadge count={4} /> - "Only 4 spots left"
- <ViewingNowBadge count={12} /> - "12 people viewing"
- <RecentBookingsBadge count={3} /> - "3 booked in last 24h"

Data sources:
- Spots: maxGroupSize - SUM(bookings for date range)
- Viewing: Redis/memory counter (optional, can be simulated)
- Recent: COUNT bookings WHERE createdAt > NOW() - 24h
```

---

### QW-4: Free Cancellation Messaging
**Effort:** 0.5 days | **Impact:** MEDIUM-HIGH | **Priority:** 4

Reduces booking anxiety with prominent guarantees.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 0.5 | Add cancellation badge to tour cards and detail pages | Trust signal |

#### Technical Spec
```
Component: <FreeCancellationBadge days={48} />
Display: "Free cancellation up to 48 hours before"
Placement: Tour cards, tour detail page, checkout summary
Source: tour.freeCancellationDays (already exists in schema)
```

---

### QW-5: WhatsApp Contact Button
**Effort:** 0.5 days | **Impact:** HIGH | **Priority:** 5

Critical for East African market communication preferences.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 0.5 | Create floating WhatsApp button component | Global contact option |

#### Technical Spec
```
Component: <WhatsAppButton phone="+254XXXXXXXXX" message="Hi, I'm interested in..." />
Placement:
- Floating button (bottom-right on all pages)
- Tour detail page (above agent card)
- Checkout page (help section)

Link format:
https://wa.me/254XXXXXXXXX?text=encoded_message
```

---

### QW-6: M-Pesa Hero Feature Banner
**Effort:** 0.5 days | **Impact:** MEDIUM-HIGH | **Priority:** 6

Highlight unique competitive advantage prominently.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 0.5 | Create M-Pesa highlight banner for homepage | Competitive differentiation |

#### Technical Spec
```
Component: <MpesaHeroBanner />
Content:
- "NOW ACCEPTING M-PESA" headline
- "The only safari booking platform with native M-Pesa support"
- Payment method logos: M-Pesa, Airtel Money, Visa, Mastercard

Placement: Homepage (below hero or in hero)
```

---

### QW-7: Price Comparison Display
**Effort:** 1 day | **Impact:** MEDIUM-HIGH | **Priority:** 7

Show value proposition vs competitors.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1.1 | Add competitor price fields to tour schema | Data model |
| 1.2 | Create price comparison component | UI component |
| 1.3 | Add to tour detail page | Value display |

#### Technical Spec
```
New fields on Tour model:
- viatorPrice: Float? (optional)
- comparisonNote: String? (e.g., "You save $230!")

Component: <PriceComparison ourPrice={1299} viatorPrice={1529} />
Display:
"SafariPlus: $1,299
 Viator: $1,529 (You save $230!)"
```

---

### QW-8: Guarantees Section
**Effort:** 0.5 days | **Impact:** MEDIUM | **Priority:** 8

Build trust with explicit promises.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 0.5 | Create guarantees component | Trust builder |

#### Technical Spec
```
Component: <GuaranteesSection />
Content:
- Best Price Guarantee
- Free Cancellation
- Secure Payments
- Verified Operators
- 24/7 Support

Placement: Homepage, checkout page
```

---

## Part 3: STRATEGIC - High Impact, Higher Effort

### ST-1: Abandoned Cart Recovery System
**Effort:** 3-4 days | **Impact:** HIGH | **Priority:** 9

Captures warm leads who don't complete booking.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create AbandonedCart model and tracking API | Database + endpoint |
| 2 | Implement cart tracking on checkout flow | Event capture |
| 3 | Create email templates (1hr, 24hr, 72hr) | Email content |
| 4 | Set up Resend scheduled emails / cron job | Automation |

#### Technical Spec
```prisma
model AbandonedCart {
  id            String   @id @default(cuid())
  sessionId     String?
  userId        String?
  tourId        String
  startDate     DateTime?
  travelers     Int      @default(1)
  email         String?
  phone         String?
  stage         String   // "tour_view", "date_selected", "checkout_started", "payment_started"
  recoveryEmailsSent Int @default(0)
  lastEmailSentAt DateTime?
  convertedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user          User?    @relation(fields: [userId], references: [id])
  tour          Tour     @relation(fields: [tourId], references: [id])
}
```

Email sequence:
1. 1 hour: "You left something behind"
2. 24 hours: "Still thinking? Here's 5% off"
3. 72 hours: "Last chance - spots filling up"

---

### ST-2: Recently Viewed Tours
**Effort:** 2 days | **Impact:** MEDIUM-HIGH | **Priority:** 10

Helps users resume shopping journey.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1.1 | Implement localStorage tracking for viewed tours | Client-side storage |
| 1.2 | Create API to fetch tour details by IDs | Batch fetch endpoint |
| 2 | Create RecentlyViewed component | UI section |

#### Technical Spec
```
Storage: localStorage key "safariplus_recently_viewed"
Format: Array of { tourId, slug, viewedAt } - max 10 items
API: GET /api/tours/batch?ids=id1,id2,id3
Component: <RecentlyViewedTours />
Placement: Homepage (logged in), tour listing page, tour detail page
```

---

### ST-3: Curated Collections
**Effort:** 3 days | **Impact:** MEDIUM-HIGH | **Priority:** 11

Themed tour groupings for better discovery.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create Collection model and CRUD API | Backend |
| 2 | Create admin UI for collection management | Admin page |
| 3 | Create collection display pages | Public pages |

#### Technical Spec
```prisma
model Collection {
  id          String   @id @default(cuid())
  slug        String   @unique
  title       String
  subtitle    String?
  description String?
  coverImage  String?
  featured    Boolean  @default(false)
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tours       CollectionTour[]
}

model CollectionTour {
  id           String     @id @default(cuid())
  collectionId String
  tourId       String
  sortOrder    Int        @default(0)

  collection   Collection @relation(fields: [collectionId], references: [id])
  tour         Tour       @relation(fields: [tourId], references: [id])

  @@unique([collectionId, tourId])
}
```

Initial collections:
- Great Migration Safaris
- Honeymoon Packages
- Family-Friendly Safaris
- Budget Adventures
- Luxury Escapes

---

### ST-4: Deals & Offers Page
**Effort:** 2-3 days | **Impact:** MEDIUM-HIGH | **Priority:** 12

Dedicated page for promotions and discounts.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create PromoCode model and validation API | Backend |
| 2 | Create /deals page with sections | Frontend page |
| 3 | Integrate promo codes into checkout | Checkout flow |

#### Technical Spec
```prisma
model PromoCode {
  id              String   @id @default(cuid())
  code            String   @unique
  description     String?
  discountType    String   // "PERCENTAGE" | "FIXED"
  discountValue   Float
  minBookingValue Float?
  maxUses         Int?
  usedCount       Int      @default(0)
  agentId         String?  // If agent-specific
  tourId          String?  // If tour-specific
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  agent           Agent?   @relation(fields: [agentId], references: [id])
  tour            Tour?    @relation(fields: [tourId], references: [id])
}
```

Deals page sections:
- Flash Sale (countdown timer)
- Early Bird Discounts
- Last Minute Deals
- Group Discounts

---

### ST-5: Referral Program
**Effort:** 3-4 days | **Impact:** HIGH | **Priority:** 13

Viral growth through customer referrals.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create Referral model and code generation | Backend |
| 2 | Create referral dashboard for users | User dashboard |
| 3 | Integrate referral tracking in booking flow | Attribution |
| 4 | Create referral landing page | Marketing page |

#### Technical Spec
```prisma
model Referral {
  id            String   @id @default(cuid())
  referrerId    String
  referralCode  String   @unique
  referredEmail String?
  referredId    String?
  status        String   @default("PENDING") // PENDING, SIGNED_UP, BOOKED, CREDITED
  referrerCredit Float   @default(50) // $50 credit
  referredDiscount Float @default(50) // $50 off first booking
  creditedAt    DateTime?
  createdAt     DateTime @default(now())

  referrer      User     @relation("Referrer", fields: [referrerId], references: [id])
  referred      User?    @relation("Referred", fields: [referredId], references: [id])
}

model UserCredit {
  id        String   @id @default(cuid())
  userId    String
  amount    Float
  source    String   // "REFERRAL", "PROMO", "REFUND"
  usedAt    DateTime?
  expiresAt DateTime?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id])
}
```

Flow:
1. User gets unique referral link: safariplus.com/r/USER123
2. Friend clicks, gets $50 off first booking
3. When friend books, referrer gets $50 credit
4. Credits shown in user dashboard

---

### ST-6: Progressive Web App (PWA)
**Effort:** 2-3 days | **Impact:** MEDIUM-HIGH | **Priority:** 14

Installable app experience without app store.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create manifest.json and service worker | PWA foundation |
| 2 | Implement offline caching for tours | Offline support |
| 3 | Add install prompt and push notification setup | User engagement |

#### Technical Spec
```json
// public/manifest.json
{
  "name": "SafariPlus",
  "short_name": "SafariPlus",
  "description": "Book your African safari adventure",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#166534",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Service worker strategy:
- Cache first: Static assets, images
- Network first: API calls
- Stale while revalidate: Tour listings

---

### ST-7: Multi-Gateway Payment (Flutterwave)
**Effort:** 4-5 days | **Impact:** MEDIUM-HIGH | **Priority:** 15

Better international card acceptance.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create Flutterwave client class | Payment SDK |
| 2 | Create payment routing logic | Gateway selection |
| 3 | Update checkout UI for gateway selection | UI changes |
| 4 | Implement Flutterwave webhook handler | Payment confirmation |
| 5 | Testing and edge cases | Quality assurance |

#### Technical Spec
```typescript
// src/lib/payments/flutterwave.ts
class FlutterwaveClient {
  async initiatePayment(params: {
    amount: number;
    currency: string;
    email: string;
    phone: string;
    txRef: string;
    redirectUrl: string;
  }): Promise<{ paymentLink: string }>;

  async verifyPayment(txRef: string): Promise<PaymentStatus>;
}

// Gateway routing
function selectGateway(method: string, country: string): string {
  if (method === 'MPESA') return 'pesapal';
  if (['KE', 'TZ', 'UG', 'RW'].includes(country)) return 'pesapal';
  return 'flutterwave';
}
```

---

### ST-8: Agent Promotional Tools
**Effort:** 3-4 days | **Impact:** MEDIUM | **Priority:** 16

Help agents promote their tours.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Promo code creation UI for agents | Agent feature |
| 2 | QR code generator for tours | Marketing tool |
| 3 | WhatsApp share button with pre-formatted message | Social sharing |
| 4 | Embeddable booking widget | Website integration |

#### Technical Spec
```
Promo codes: Extend PromoCode model with agentId relation
QR codes: Use qrcode library to generate tour links
WhatsApp: Pre-format message with tour name, price, link
Widget: iframe embed with tour booking mini-app
```

---

### ST-9: Photo Reviews Enhancement
**Effort:** 2 days | **Impact:** MEDIUM | **Priority:** 17

Already have image support, just need to enhance.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Enhance review form with better image upload | UX improvement |
| 2 | Add photo gallery view in review display | Visual appeal |

#### Technical Spec
```
Current: Review model has images field (JSON array)
Enhance:
- Drag-and-drop upload in review form
- Lightbox for viewing review photos
- Filter reviews by "with photos"
- Show photo count on review stats
```

---

### ST-10: Exit Intent Popup
**Effort:** 1 day | **Impact:** MEDIUM | **Priority:** 18

Capture email before visitor leaves.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create exit intent detection and popup | Lead capture |

#### Technical Spec
```
Trigger: Mouse moves toward browser chrome (desktop)
Component: <ExitIntentPopup />
Content:
- "Wait! Get 10% off your first booking"
- Email input
- "GET MY DISCOUNT" button
- Dismiss option

Storage: localStorage to prevent repeat shows
Integration: Store email + promo code for follow-up
```

---

## Part 4: FILL-INS - Low Effort, Lower Impact

### FI-1: Search Suggestions
**Effort:** 1 day | **Impact:** LOW-MEDIUM | **Priority:** 19

Autocomplete in search bar.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create search suggestions API and UI | Better search UX |

---

### FI-2: Tour Comparison Tool
**Effort:** 2 days | **Impact:** LOW-MEDIUM | **Priority:** 20

Side-by-side tour comparison.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create comparison selection state | Backend |
| 2 | Create comparison table UI | Frontend |

---

### FI-3: Return Visitor Recognition
**Effort:** 0.5 days | **Impact:** LOW-MEDIUM | **Priority:** 21

Welcome back message with discount.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 0.5 | Create welcome back banner for returning users | Personalization |

---

### FI-4: Review Incentives
**Effort:** 1 day | **Impact:** LOW-MEDIUM | **Priority:** 22

Offer discount for leaving reviews.

#### Deliverables

| Day | Task | Output |
|-----|------|--------|
| 1 | Create review incentive system | More reviews |

---

## Part 5: Implementation Timeline

### Sprint 1: Trust & Quick Wins (Week 1-2)

| Day | Features | Effort |
|-----|----------|--------|
| 1 | QW-1: Trust Badges | 1 day |
| 2 | QW-2: Social Proof Counters | 1 day |
| 3 | QW-3: Urgency Indicators | 1 day |
| 4 | QW-4 + QW-5: Free Cancellation + WhatsApp | 1 day |
| 5 | QW-6 + QW-7: M-Pesa Banner + Price Comparison | 1.5 days |
| 6 | QW-8: Guarantees Section | 0.5 days |

**Sprint 1 Total: 6 days**
**Expected Conversion Lift: 15-25%**

---

### Sprint 2: Retention & Recovery (Week 3-4)

| Day | Features | Effort |
|-----|----------|--------|
| 1-4 | ST-1: Abandoned Cart Recovery | 4 days |
| 5-6 | ST-2: Recently Viewed Tours | 2 days |
| 7 | ST-10: Exit Intent Popup | 1 day |
| 8 | FI-3: Return Visitor Recognition | 0.5 days |

**Sprint 2 Total: 7.5 days**
**Expected Recovery Rate: 5-10% of abandoned carts**

---

### Sprint 3: Discovery & Collections (Week 5-6)

| Day | Features | Effort |
|-----|----------|--------|
| 1-3 | ST-3: Curated Collections | 3 days |
| 4-6 | ST-4: Deals & Offers Page | 3 days |
| 7 | FI-1: Search Suggestions | 1 day |

**Sprint 3 Total: 7 days**
**Expected Engagement Lift: 20-30%**

---

### Sprint 4: Growth & Loyalty (Week 7-8)

| Day | Features | Effort |
|-----|----------|--------|
| 1-4 | ST-5: Referral Program | 4 days |
| 5-6 | FI-4: Review Incentives | 1 day |
| 7-8 | ST-9: Photo Reviews Enhancement | 2 days |

**Sprint 4 Total: 7 days**
**Expected Viral Coefficient: 1.2-1.5**

---

### Sprint 5: Mobile & Technical (Week 9-10)

| Day | Features | Effort |
|-----|----------|--------|
| 1-3 | ST-6: PWA Implementation | 3 days |
| 4-8 | ST-7: Multi-Gateway Payment | 5 days |

**Sprint 5 Total: 8 days**
**Expected Mobile Conversion Lift: 10-15%**

---

### Sprint 6: Agent Tools (Week 11-12)

| Day | Features | Effort |
|-----|----------|--------|
| 1-4 | ST-8: Agent Promotional Tools | 4 days |
| 5-6 | FI-2: Tour Comparison Tool | 2 days |

**Sprint 6 Total: 6 days**
**Expected Agent Satisfaction: +25%**

---

## Part 6: Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Baseline | Sprint 1 Target | Sprint 6 Target |
|--------|----------|-----------------|-----------------|
| Conversion Rate | <1% (est.) | 1.5% | 3% |
| Bounce Rate | Unknown | -20% | -40% |
| Cart Abandonment | Unknown | Track | Recover 10% |
| Avg Session Duration | Unknown | +30% | +50% |
| Repeat Visitors | Unknown | Track | +40% |
| Referral Signups | 0 | N/A | 100/month |
| Mobile Installs (PWA) | 0 | N/A | 500/month |

### Tracking Implementation

Each feature should track:
1. Feature-specific metrics (e.g., exit popup email captures)
2. Impact on conversion funnel
3. User engagement signals

---

## Part 7: Technical Dependencies

### Shared Components to Build First

| Component | Used By |
|-----------|---------|
| `<Badge />` variants | Trust badges, urgency, status |
| `<Counter />` animated | Social proof, stats |
| `<Popup />` modal | Exit intent, promos |
| `<ShareButtons />` | WhatsApp, social sharing |

### API Endpoints Needed

| Endpoint | Purpose | Sprint |
|----------|---------|--------|
| `GET /api/stats/platform` | Social proof counters | 1 |
| `GET /api/tours/batch` | Recently viewed | 2 |
| `POST /api/cart/track` | Abandoned cart | 2 |
| `GET /api/collections` | Collections page | 3 |
| `POST /api/promo/validate` | Deals checkout | 3 |
| `POST /api/referral/create` | Referral program | 4 |
| `POST /api/payments/flutterwave/*` | Multi-gateway | 5 |

### Database Migrations Needed

| Sprint | Models |
|--------|--------|
| 2 | AbandonedCart |
| 3 | Collection, CollectionTour, PromoCode |
| 4 | Referral, UserCredit |
| 5 | PaymentGateway field on Payment |

---

## Part 8: Risk Assessment

### High Risk Items

| Risk | Mitigation |
|------|------------|
| Abandoned cart emails marked as spam | Use Resend reputation, proper SPF/DKIM |
| Flutterwave webhook failures | Idempotency keys, retry logic |
| PWA cache stale data | Version cache, clear on update |

### Dependencies on External Services

| Service | Purpose | Fallback |
|---------|---------|----------|
| Resend | Abandoned cart emails | Queue for retry |
| Flutterwave | International payments | Fall back to Pesapal |
| Pusher | Real-time updates | Polling fallback |

---

## Part 9: Resource Requirements

### Development Time

| Phase | Days | Developer Days |
|-------|------|----------------|
| Sprint 1 | 6 | 6 |
| Sprint 2 | 7.5 | 7.5 |
| Sprint 3 | 7 | 7 |
| Sprint 4 | 7 | 7 |
| Sprint 5 | 8 | 8 |
| Sprint 6 | 6 | 6 |
| **Total** | **41.5 days** | **41.5 days** |

### External Costs

| Item | Cost |
|------|------|
| Flutterwave setup | Free (pay per transaction) |
| PWA icons design | $50-100 one-time |
| Email templates design | $100-200 one-time |

---

## Appendix A: Component Library Extensions

### New Components Needed

```
src/components/
├── trust/
│   ├── trust-badges.tsx (enhance existing)
│   ├── social-proof-banner.tsx
│   ├── guarantees-section.tsx
│   └── price-comparison.tsx
├── urgency/
│   ├── spots-left-badge.tsx
│   ├── viewing-now-badge.tsx
│   └── recent-bookings-badge.tsx
├── engagement/
│   ├── exit-intent-popup.tsx
│   ├── return-visitor-banner.tsx
│   └── whatsapp-button.tsx
├── discovery/
│   ├── recently-viewed.tsx
│   ├── collection-card.tsx
│   └── deals-section.tsx
├── referral/
│   ├── referral-link.tsx
│   ├── referral-stats.tsx
│   └── credit-balance.tsx
└── agent/
    ├── promo-code-creator.tsx
    ├── qr-generator.tsx
    └── embed-widget.tsx
```

---

## Appendix B: API Specification Summary

### Sprint 1 APIs

```typescript
// GET /api/stats/platform
Response: {
  totalBookings: number;
  verifiedOperators: number;
  averageRating: number;
  totalPaidToAgents: number;
  lastUpdated: string;
}

// GET /api/tours/[slug] - Add to existing
Response: {
  ...existingFields,
  spotsRemaining: number;
  recentBookings24h: number;
  viatorPrice?: number;
}
```

### Sprint 2 APIs

```typescript
// POST /api/cart/track
Body: {
  tourId: string;
  stage: "tour_view" | "date_selected" | "checkout_started" | "payment_started";
  email?: string;
  sessionId: string;
}

// GET /api/tours/batch
Query: ids=id1,id2,id3
Response: Tour[]
```

---

## Appendix C: Email Templates

### Abandoned Cart Email 1 (1 hour)

```
Subject: You left something amazing behind

Hi [Name],

You were so close to booking your dream safari!

[Tour Image]
[Tour Name]
[Price]

Your selected dates are still available, but only [X] spots remain.

[COMPLETE MY BOOKING]

Questions? Reply to this email or chat with us.
```

### Referral Email

```
Subject: [Friend Name] invited you to an adventure!

Your friend [Name] thinks you'd love SafariPlus.

Use their referral link to get $50 off your first safari booking:

[REFERRAL LINK]

Offer valid for 30 days.
```

---

## Document Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | [ ] Approved |
| Tech Lead | | | [ ] Approved |
| Business Stakeholder | | | [ ] Approved |

---

**Next Steps:**
1. Review and approve this roadmap
2. Set up sprint board with Sprint 1 tasks
3. Begin implementation of Quick Wins

**Document maintained by:** SafariPlus Product Team
**Review frequency:** Weekly during active development
