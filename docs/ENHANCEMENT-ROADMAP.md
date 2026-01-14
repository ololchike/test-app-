# SafariPlus Enhancement Roadmap

**Document Version:** 1.0
**Created:** January 14, 2026
**Status:** Phase 3 - Competitive Enhancement
**For:** Next.js Developer Implementation

---

## Quick Start

This is the master roadmap for enhancing SafariPlus to compete with OTAs (Viator, GetYourGuide, SafariBookings). All features are broken into **1-2 day deliverables** organized in sprints.

### Current App Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | Complete | MVP (Auth, Tours, Bookings, Payments) |
| Phase 2 | Complete | Reviews, Messaging, Withdrawals |
| **Phase 3** | **IN PROGRESS** | Competitive Enhancement |

### Document Index

| Document | Purpose |
|----------|---------|
| `competitive-strategy.md` | Full strategic analysis (read for context) |
| `strategic-enhancement-roadmap.md` | Feature prioritization & sprint timeline |
| `sprint-1-implementation-guide.md` | Detailed Sprint 1 implementation |
| `developer-tasks.md` | Checkbox tracker for all tasks |

---

## Sprint Overview (41.5 Days Total)

### Sprint 1: Trust & Quick Wins (6 days)
**Goal:** Increase conversion from <1% to 1.5%

| Day | Feature | Priority |
|-----|---------|----------|
| 1 | Trust Badges (KATO, TATO, Pesapal, SSL) | P1 |
| 2 | Social Proof Counters | P1 |
| 3 | Urgency Indicators (spots left, recent bookings) | P1 |
| 4 | Free Cancellation Badge + WhatsApp Button | P1 |
| 5 | M-Pesa Hero Banner + Price Comparison | P2 |
| 6 | Guarantees Section | P2 |

### Sprint 2: Retention & Recovery (7.5 days)
**Goal:** Recover 5-10% of abandoned carts

| Day | Feature | Priority |
|-----|---------|----------|
| 1-4 | Abandoned Cart Recovery System | P1 |
| 5-6 | Recently Viewed Tours | P2 |
| 7 | Exit Intent Popup | P2 |
| 8 | Return Visitor Recognition | P3 |

### Sprint 3: Discovery & Collections (7 days)
**Goal:** Increase engagement by 20-30%

| Day | Feature | Priority |
|-----|---------|----------|
| 1-3 | Curated Collections | P2 |
| 4-6 | Deals & Offers Page | P2 |
| 7 | Search Suggestions | P3 |

### Sprint 4: Growth & Loyalty (7 days)
**Goal:** Achieve 1.2-1.5 viral coefficient

| Day | Feature | Priority |
|-----|---------|----------|
| 1-4 | Referral Program | P1 |
| 5-6 | Review Incentives | P3 |
| 7-8 | Photo Reviews Enhancement | P3 |

### Sprint 5: Mobile & Technical (8 days)
**Goal:** 10-15% mobile conversion lift

| Day | Feature | Priority |
|-----|---------|----------|
| 1-3 | PWA Implementation | P2 |
| 4-8 | Multi-Gateway Payment (Flutterwave) | P2 |

### Sprint 6: Agent Tools (6 days)
**Goal:** +25% agent satisfaction

| Day | Feature | Priority |
|-----|---------|----------|
| 1-4 | Agent Promotional Tools | P2 |
| 5-6 | Tour Comparison Tool | P3 |

---

## Feature Quick Reference

### Sprint 1 Features (Implement First)

#### 1. Trust Badges
**Files:** `src/components/trust/trust-badges.tsx`
**Placement:** Homepage, Footer, Checkout, Tour Detail
**Assets Needed:** KATO, TATO, Pesapal, SSL badge images

```tsx
// Usage
<TrustBadges variant="full" />
<TrustBadges variant="compact" />
<TrustBadges variant="payment-only" />
```

#### 2. Social Proof Counters
**Files:**
- `src/app/api/stats/platform/route.ts` (API)
- `src/components/trust/social-proof-banner.tsx` (UI)

**Data Source:** Database aggregates (cached 5 min)
- Total bookings (CONFIRMED/COMPLETED)
- Verified operators count
- Average rating
- Total paid to agents

#### 3. Urgency Indicators
**Files:**
- `src/components/urgency/spots-left-badge.tsx`
- `src/components/urgency/recent-bookings-badge.tsx`
- `src/components/urgency/viewing-now-badge.tsx`

**Logic:**
- Show spots badge only when < 6 remaining
- Show recent bookings from last 24h
- Use pulsing animation for urgency

#### 4. Free Cancellation Badge
**Files:** `src/components/trust/free-cancellation-badge.tsx`
**Data Source:** `tour.freeCancellationDays` (already in schema)

#### 5. WhatsApp Button
**Files:** `src/components/engagement/whatsapp-button.tsx`
**Config:** `NEXT_PUBLIC_WHATSAPP_NUMBER` env variable
**Link:** `https://wa.me/{phone}?text={encoded_message}`

#### 6. M-Pesa Hero Banner
**Files:** `src/components/trust/mpesa-hero-banner.tsx`
**Placement:** Homepage hero section

#### 7. Price Comparison
**Files:** `src/components/trust/price-comparison.tsx`
**Schema Change:** Add `viatorPrice` and `comparisonNote` to Tour model

#### 8. Guarantees Section
**Files:** `src/components/trust/guarantees-section.tsx`
**Content:**
- Best Price Guarantee
- Free Cancellation
- Secure Payment
- Verified Operators
- 24/7 Support

---

## Database Migrations Required

### Sprint 1 (Optional)
```prisma
model Tour {
  // Add to existing model
  viatorPrice      Float?
  comparisonNote   String?
}
```

### Sprint 2
```prisma
model AbandonedCart {
  id                String    @id @default(cuid())
  sessionId         String?
  userId            String?
  tourId            String
  startDate         DateTime?
  travelers         Int       @default(1)
  email             String?
  phone             String?
  stage             String    // tour_view, date_selected, checkout_started, payment_started
  recoveryEmailsSent Int      @default(0)
  lastEmailSentAt   DateTime?
  convertedAt       DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  user              User?     @relation(fields: [userId], references: [id])
  tour              Tour      @relation(fields: [tourId], references: [id])

  @@index([sessionId])
  @@index([email])
  @@index([stage])
}
```

### Sprint 3
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

  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  tour         Tour       @relation(fields: [tourId], references: [id], onDelete: Cascade)

  @@unique([collectionId, tourId])
}

model PromoCode {
  id              String    @id @default(cuid())
  code            String    @unique
  description     String?
  discountType    String    // PERCENTAGE | FIXED
  discountValue   Float
  minBookingValue Float?
  maxUses         Int?
  usedCount       Int       @default(0)
  agentId         String?
  tourId          String?
  startDate       DateTime
  endDate         DateTime
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())

  agent           Agent?    @relation(fields: [agentId], references: [id])
  tour            Tour?     @relation(fields: [tourId], references: [id])

  @@index([code])
  @@index([agentId])
}
```

### Sprint 4
```prisma
model Referral {
  id             String    @id @default(cuid())
  referrerId     String
  referralCode   String    @unique
  referredEmail  String?
  referredId     String?
  status         String    @default("PENDING") // PENDING, SIGNED_UP, BOOKED, CREDITED
  referrerCredit Float     @default(50)
  referredDiscount Float   @default(50)
  creditedAt     DateTime?
  createdAt      DateTime  @default(now())

  referrer       User      @relation("Referrer", fields: [referrerId], references: [id])
  referred       User?     @relation("Referred", fields: [referredId], references: [id])

  @@index([referralCode])
  @@index([referrerId])
}

model UserCredit {
  id        String    @id @default(cuid())
  userId    String
  amount    Float
  source    String    // REFERRAL, PROMO, REFUND
  usedAt    DateTime?
  expiresAt DateTime?
  createdAt DateTime  @default(now())

  user      User      @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

---

## API Endpoints to Create

### Sprint 1
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/stats/platform` | Social proof counters |

### Sprint 2
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/cart/track` | Track abandoned carts |
| GET | `/api/tours/batch` | Batch fetch for recently viewed |

### Sprint 3
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/collections` | List collections |
| GET | `/api/collections/[slug]` | Collection detail with tours |
| POST | `/api/admin/collections` | Create collection |
| PUT | `/api/admin/collections/[id]` | Update collection |
| DELETE | `/api/admin/collections/[id]` | Delete collection |
| POST | `/api/promo/validate` | Validate promo code |
| GET | `/api/deals` | Get deals/offers |

### Sprint 4
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/referral/create` | Generate referral code |
| GET | `/api/referral/stats` | User's referral stats |
| POST | `/api/referral/apply` | Apply referral at signup |
| GET | `/api/user/credits` | User credit balance |

### Sprint 5
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/payments/flutterwave/initiate` | Start Flutterwave payment |
| POST | `/api/webhooks/flutterwave` | Flutterwave IPN handler |
| GET | `/api/payments/flutterwave/status` | Check payment status |

---

## Component File Structure

Create these directories and files:

```
src/components/
├── trust/
│   ├── trust-badges.tsx
│   ├── social-proof-banner.tsx
│   ├── guarantees-section.tsx
│   ├── price-comparison.tsx
│   ├── free-cancellation-badge.tsx
│   └── mpesa-hero-banner.tsx
├── urgency/
│   ├── spots-left-badge.tsx
│   ├── viewing-now-badge.tsx
│   └── recent-bookings-badge.tsx
├── engagement/
│   ├── whatsapp-button.tsx
│   ├── exit-intent-popup.tsx
│   └── return-visitor-banner.tsx
├── discovery/
│   ├── recently-viewed.tsx
│   ├── collection-card.tsx
│   ├── collection-list.tsx
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

## Environment Variables

Add these to `.env`:

```env
# WhatsApp Integration (Sprint 1)
NEXT_PUBLIC_WHATSAPP_NUMBER=+254XXXXXXXXX

# Flutterwave (Sprint 5)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxx
FLUTTERWAVE_ENCRYPTION_KEY=xxx
FLUTTERWAVE_WEBHOOK_SECRET=xxx
```

---

## Assets Required

### Badge Images (public/badges/)
- [ ] kato.png - KATO member badge
- [ ] tato.png - TATO member badge
- [ ] pesapal.png - Pesapal verified badge
- [ ] ssl.png - SSL secure badge
- [ ] mpesa.png - M-Pesa logo
- [ ] airtel-money.png - Airtel Money logo
- [ ] visa.png - Visa logo
- [ ] mastercard.png - Mastercard logo
- [ ] verified-operators.png - Custom verification badge

### PWA Icons (public/)
- [ ] icon-192.png - 192x192 app icon
- [ ] icon-512.png - 512x512 app icon
- [ ] icon-maskable.png - Maskable icon for Android

---

## Success Metrics

Track these KPIs after each sprint:

| Metric | Baseline | After Sprint 1 | Target (6 months) |
|--------|----------|----------------|-------------------|
| Conversion Rate | <1% | 1.5% | 3% |
| Bounce Rate | Unknown | -20% | -40% |
| Cart Abandonment | Unknown | Track | Recover 10% |
| Referral Signups | 0 | N/A | 100/month |
| PWA Installs | 0 | N/A | 500/month |

---

## Implementation Notes

### Best Practices
1. **Test on mobile first** - 72% of users are mobile
2. **Use skeleton loaders** - Don't block UI while fetching stats
3. **Cache aggressively** - Stats API caches for 5 minutes
4. **Fail gracefully** - Hide components if data fails to load
5. **A/B test urgency** - Ensure it's not too pushy

### Common Pitfalls
- Don't show fake urgency (only real data)
- Don't spam users with exit popups (once per session)
- Don't over-promise in guarantees
- Don't block checkout with too many popups

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/sprint-1-trust-badges

# Commit format
git commit -m "feat(trust): add KATO/TATO trust badges component

- Create TrustBadges component with full/compact/payment variants
- Add to homepage, footer, and checkout pages
- Include responsive design for mobile

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# After approval, merge to dev
git checkout dev
git merge feature/sprint-1-trust-badges
```

---

## Contact & Support

For questions about this roadmap:
- Review `competitive-strategy.md` for strategic context
- Check `sprint-1-implementation-guide.md` for detailed code
- Reference `developer-tasks.md` for checkbox tracking

---

**Start with Sprint 1, Day 1: Trust Badges**

The quick wins in Sprint 1 are designed to provide immediate conversion lift with minimal backend changes. Begin implementation and mark tasks complete in `developer-tasks.md`.
