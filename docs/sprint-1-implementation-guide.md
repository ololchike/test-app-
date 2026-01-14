# Sprint 1: Trust & Quick Wins - Implementation Guide

**Sprint Duration:** Week 1-2 (6 working days)
**Goal:** Increase conversion rate from <1% to 1.5% through trust signals and urgency

---

## Day 1: Trust Badges Component

### Task QW-1: Trust Badges

**Files to create/modify:**
- `src/components/trust/trust-badges.tsx` (new)
- `src/app/(main)/page.tsx` (modify - add to homepage)
- `src/app/(main)/tours/[slug]/page.tsx` (modify - add to tour detail)
- `src/components/layout/footer.tsx` (modify - add badges)

**Implementation:**

```typescript
// src/components/trust/trust-badges.tsx
import Image from 'next/image';

interface TrustBadgesProps {
  variant?: 'full' | 'compact' | 'payment-only';
  className?: string;
}

const badges = [
  { name: 'KATO Member', src: '/badges/kato.png', alt: 'Kenya Association of Tour Operators' },
  { name: 'TATO Member', src: '/badges/tato.png', alt: 'Tanzania Association of Tour Operators' },
  { name: 'Pesapal Verified', src: '/badges/pesapal.png', alt: 'Pesapal Verified Merchant' },
  { name: 'SSL Secure', src: '/badges/ssl.png', alt: '256-bit SSL Encryption' },
];

const paymentMethods = [
  { name: 'M-Pesa', src: '/badges/mpesa.png' },
  { name: 'Visa', src: '/badges/visa.png' },
  { name: 'Mastercard', src: '/badges/mastercard.png' },
];

export function TrustBadges({ variant = 'full', className }: TrustBadgesProps) {
  // Implementation
}
```

**Badge images needed (public/badges/):**
- [ ] kato.png (KATO logo)
- [ ] tato.png (TATO logo)
- [ ] pesapal.png (Pesapal verified badge)
- [ ] ssl.png (SSL secure badge)
- [ ] mpesa.png (M-Pesa logo)
- [ ] visa.png (Visa logo)
- [ ] mastercard.png (Mastercard logo)
- [ ] verified-operators.png (custom badge)

**Acceptance Criteria:**
- [ ] Trust badges display on homepage below hero
- [ ] Trust badges display in footer on all pages
- [ ] Trust badges display on checkout page
- [ ] Payment method logos display on tour detail booking card
- [ ] Responsive design (badges wrap on mobile)

---

## Day 2: Social Proof Counters

### Task QW-2: Platform Stats API + Banner

**Files to create/modify:**
- `src/app/api/stats/platform/route.ts` (new)
- `src/components/trust/social-proof-banner.tsx` (new)
- `src/app/(main)/page.tsx` (modify - add banner)
- `src/app/(main)/tours/page.tsx` (modify - add banner)

**API Implementation:**

```typescript
// src/app/api/stats/platform/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Cache for 5 minutes
let cache: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  const now = Date.now();

  if (cache && (now - cache.timestamp) < CACHE_DURATION) {
    return NextResponse.json(cache.data);
  }

  const [bookingsCount, operatorsCount, avgRating, totalPaid] = await Promise.all([
    prisma.booking.count({
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } }
    }),
    prisma.agent.count({
      where: { isVerified: true }
    }),
    prisma.review.aggregate({
      _avg: { rating: true }
    }),
    prisma.withdrawalRequest.aggregate({
      _sum: { amount: true },
      where: { status: 'COMPLETED' }
    })
  ]);

  const data = {
    totalBookings: bookingsCount,
    verifiedOperators: operatorsCount,
    averageRating: avgRating._avg.rating || 4.8,
    totalPaidToAgents: totalPaid._sum.amount || 0,
    lastUpdated: new Date().toISOString()
  };

  cache = { data, timestamp: now };
  return NextResponse.json(data);
}
```

**Component Implementation:**

```typescript
// src/components/trust/social-proof-banner.tsx
'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalBookings: number;
  verifiedOperators: number;
  averageRating: number;
  totalPaidToAgents: number;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
  return num.toString();
}

export function SocialProofBanner() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats/platform')
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="bg-green-50 border-y border-green-100 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-center">
          <div>
            <span className="text-2xl font-bold text-green-700">
              {formatNumber(stats.totalBookings)}+
            </span>
            <p className="text-sm text-green-600">Bookings Made</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-green-700">
              {stats.verifiedOperators}+
            </span>
            <p className="text-sm text-green-600">Verified Operators</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-green-700">
              {stats.averageRating.toFixed(1)}
            </span>
            <p className="text-sm text-green-600">Average Rating</p>
          </div>
          <div>
            <span className="text-2xl font-bold text-green-700">
              ${formatNumber(stats.totalPaidToAgents)}+
            </span>
            <p className="text-sm text-green-600">Paid to Agents</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] API returns accurate counts from database
- [ ] API response is cached for 5 minutes
- [ ] Banner displays animated counters
- [ ] Banner is responsive (stacks on mobile)
- [ ] Numbers format appropriately (1k+, 1M+)

---

## Day 3: Urgency Indicators

### Task QW-3: Spots Left & Viewing Badges

**Files to create/modify:**
- `src/components/urgency/spots-left-badge.tsx` (new)
- `src/components/urgency/viewing-now-badge.tsx` (new)
- `src/components/urgency/recent-bookings-badge.tsx` (new)
- `src/components/tours/tour-card.tsx` (modify - add badges)
- `src/app/api/tours/[slug]/route.ts` (modify - add urgency data)

**Badge Components:**

```typescript
// src/components/urgency/spots-left-badge.tsx
interface SpotsLeftBadgeProps {
  spots: number;
  maxSpots: number;
}

export function SpotsLeftBadge({ spots, maxSpots }: SpotsLeftBadgeProps) {
  if (spots > 5) return null; // Only show when urgency is real

  const percentage = (spots / maxSpots) * 100;

  return (
    <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
      </span>
      Only {spots} {spots === 1 ? 'spot' : 'spots'} left
    </div>
  );
}

// src/components/urgency/recent-bookings-badge.tsx
export function RecentBookingsBadge({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <div className="flex items-center gap-1 text-green-600 text-sm">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
      </svg>
      {count} booked in last 24h
    </div>
  );
}
```

**API Enhancement:**

```typescript
// Add to GET /api/tours/[slug]/route.ts response
const recentBookings = await prisma.booking.count({
  where: {
    tourId: tour.id,
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    status: { in: ['CONFIRMED', 'COMPLETED', 'PAID'] }
  }
});

// Calculate spots remaining for next available date
const nextAvailableDate = await prisma.tourAvailability.findFirst({
  where: {
    tourId: tour.id,
    date: { gte: new Date() },
    type: { in: ['AVAILABLE', 'LIMITED'] }
  },
  orderBy: { date: 'asc' }
});

const bookingsForDate = nextAvailableDate ? await prisma.booking.count({
  where: {
    tourId: tour.id,
    startDate: nextAvailableDate.date,
    status: { notIn: ['CANCELLED', 'REFUNDED'] }
  }
}) : 0;

const spotsRemaining = tour.maxGroupSize - bookingsForDate;
```

**Acceptance Criteria:**
- [ ] Spots left badge shows only when < 6 spots remain
- [ ] Spots left badge has pulsing animation
- [ ] Recent bookings count is accurate (last 24h)
- [ ] Badges display on tour cards
- [ ] Badges display on tour detail page

---

## Day 4: Free Cancellation + WhatsApp

### Task QW-4: Free Cancellation Badge

**Files to create/modify:**
- `src/components/trust/free-cancellation-badge.tsx` (new)
- `src/components/tours/tour-card.tsx` (modify)
- `src/components/tours/booking-card.tsx` (modify)

**Implementation:**

```typescript
// src/components/trust/free-cancellation-badge.tsx
import { CalendarX } from 'lucide-react';

interface FreeCancellationBadgeProps {
  days: number;
  variant?: 'inline' | 'card';
}

export function FreeCancellationBadge({ days, variant = 'inline' }: FreeCancellationBadgeProps) {
  if (variant === 'card') {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
        <CalendarX className="w-5 h-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Free Cancellation</p>
          <p className="text-sm text-green-600">
            Cancel up to {days} hours before for full refund
          </p>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-green-600 text-sm">
      <CalendarX className="w-4 h-4" />
      Free cancellation
    </span>
  );
}
```

### Task QW-5: WhatsApp Button

**Files to create/modify:**
- `src/components/engagement/whatsapp-button.tsx` (new)
- `src/app/(main)/layout.tsx` (modify - add floating button)

**Implementation:**

```typescript
// src/components/engagement/whatsapp-button.tsx
'use client';

interface WhatsAppButtonProps {
  phone: string;
  message?: string;
  variant?: 'floating' | 'inline' | 'card';
  className?: string;
}

export function WhatsAppButton({
  phone,
  message = "Hi, I'm interested in booking a safari on SafariPlus",
  variant = 'floating',
  className
}: WhatsAppButtonProps) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    );
  }

  // inline and card variants...
}
```

**Environment Variable:**
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=+254XXXXXXXXX
```

**Acceptance Criteria:**
- [ ] Free cancellation badge shows days from tour.freeCancellationDays
- [ ] Badge displays on tour cards
- [ ] Badge displays prominently on booking card
- [ ] WhatsApp floating button appears on all pages
- [ ] WhatsApp button opens WhatsApp with pre-filled message
- [ ] Button is positioned correctly and doesn't overlap content

---

## Day 5: M-Pesa Banner + Price Comparison

### Task QW-6: M-Pesa Hero Banner

**Files to create/modify:**
- `src/components/trust/mpesa-hero-banner.tsx` (new)
- `src/app/(main)/page.tsx` (modify - add to hero section)

**Implementation:**

```typescript
// src/components/trust/mpesa-hero-banner.tsx
import Image from 'next/image';

export function MpesaHeroBanner() {
  return (
    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-bold text-lg">NOW ACCEPTING M-PESA</h3>
              <p className="text-green-100 text-sm">
                The only safari booking platform with native M-Pesa support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
            <Image src="/badges/mpesa.png" alt="M-Pesa" width={40} height={24} />
            <Image src="/badges/airtel-money.png" alt="Airtel Money" width={40} height={24} />
            <Image src="/badges/visa.png" alt="Visa" width={40} height={24} />
            <Image src="/badges/mastercard.png" alt="Mastercard" width={40} height={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task QW-7: Price Comparison

**Files to create/modify:**
- `prisma/schema.prisma` (modify - add viatorPrice field)
- `src/components/trust/price-comparison.tsx` (new)
- `src/components/tours/booking-card.tsx` (modify)

**Schema Update:**

```prisma
model Tour {
  // ... existing fields
  viatorPrice      Float?    // Optional competitor price for comparison
  comparisonNote   String?   // e.g., "Same tour, lower fees"
}
```

**Component:**

```typescript
// src/components/trust/price-comparison.tsx
interface PriceComparisonProps {
  ourPrice: number;
  viatorPrice?: number;
  currency?: string;
}

export function PriceComparison({ ourPrice, viatorPrice, currency = 'USD' }: PriceComparisonProps) {
  if (!viatorPrice || viatorPrice <= ourPrice) return null;

  const savings = viatorPrice - ourPrice;
  const savingsPercent = Math.round((savings / viatorPrice) * 100);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded">
          BEST VALUE
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="font-semibold text-green-700">SafariPlus Price</span>
          <span className="font-bold text-green-700">${ourPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Viator Price</span>
          <span className="line-through">${viatorPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-amber-700 font-medium pt-2 border-t border-amber-200">
          <span>You save</span>
          <span>${savings.toLocaleString()} ({savingsPercent}% off)</span>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-600">
        <p>Same tour, same operator - lower commission = lower price for you</p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] M-Pesa banner displays prominently on homepage
- [ ] All payment logos load correctly
- [ ] Price comparison shows only when viatorPrice is higher
- [ ] Savings amount and percentage are calculated correctly
- [ ] Price comparison displays on booking card

---

## Day 6: Guarantees Section

### Task QW-8: Guarantees Component

**Files to create/modify:**
- `src/components/trust/guarantees-section.tsx` (new)
- `src/app/(main)/page.tsx` (modify)
- `src/app/(main)/checkout/[bookingId]/page.tsx` (modify)

**Implementation:**

```typescript
// src/components/trust/guarantees-section.tsx
import { Shield, Calendar, Lock, UserCheck, HeadphonesIcon } from 'lucide-react';

const guarantees = [
  {
    icon: Shield,
    title: 'Best Price Guarantee',
    description: 'Find it cheaper elsewhere, we\'ll match it + 10% off',
  },
  {
    icon: Calendar,
    title: 'Free Cancellation',
    description: 'Cancel up to 48 hours before for a full refund',
  },
  {
    icon: Lock,
    title: 'Secure Payment',
    description: 'Bank-level encryption protects your payment',
  },
  {
    icon: UserCheck,
    title: 'Verified Operators',
    description: 'Every operator is verified by our team',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'We\'re here to help, anytime',
  },
];

interface GuaranteesSectionProps {
  variant?: 'full' | 'compact';
}

export function GuaranteesSection({ variant = 'full' }: GuaranteesSectionProps) {
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {guarantees.map((guarantee) => (
          <div key={guarantee.title} className="flex items-center gap-2 text-sm">
            <guarantee.icon className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-gray-600">{guarantee.title}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Book with Confidence</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {guarantees.map((guarantee) => (
            <div key={guarantee.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                <guarantee.icon className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">{guarantee.title}</h3>
              <p className="text-sm text-gray-600">{guarantee.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Acceptance Criteria:**
- [ ] Full variant displays on homepage
- [ ] Compact variant displays on checkout page
- [ ] All icons render correctly
- [ ] Section is responsive (stacks on mobile)
- [ ] Copy is clear and compelling

---

## Sprint 1 Checklist

### Pre-Sprint
- [ ] Badge images collected and optimized
- [ ] Environment variables configured
- [ ] Component directories created

### Day 1
- [ ] Trust badges component created
- [ ] Added to homepage
- [ ] Added to footer
- [ ] Added to checkout

### Day 2
- [ ] Platform stats API created
- [ ] API caching implemented
- [ ] Social proof banner created
- [ ] Added to homepage
- [ ] Added to tour listing

### Day 3
- [ ] Spots left badge created
- [ ] Recent bookings badge created
- [ ] Tour API enhanced with urgency data
- [ ] Badges integrated into tour cards
- [ ] Badges integrated into tour detail page

### Day 4
- [ ] Free cancellation badge created
- [ ] WhatsApp floating button created
- [ ] Environment variable set
- [ ] Button tested on mobile

### Day 5
- [ ] M-Pesa hero banner created
- [ ] Schema migration for viatorPrice
- [ ] Price comparison component created
- [ ] Integrated into booking card

### Day 6
- [ ] Guarantees section created (full variant)
- [ ] Guarantees section created (compact variant)
- [ ] Added to homepage
- [ ] Added to checkout

### Post-Sprint
- [ ] All features tested on mobile
- [ ] Performance audit (Lighthouse)
- [ ] Cross-browser testing
- [ ] Deploy to staging
- [ ] QA review
- [ ] Deploy to production

---

## Testing Scenarios

### Trust Badges
1. Homepage displays all trust badges
2. Footer displays badges on all pages
3. Checkout shows payment security badges
4. All badge images load (no broken images)

### Social Proof
1. Stats load within 2 seconds
2. Stats refresh after 5 minutes
3. Zero values handled gracefully (don't show 0)
4. Numbers format correctly (1000 -> 1k)

### Urgency
1. Spots badge only shows when < 6 spots
2. Recent bookings shows accurate 24h count
3. Badges don't show when no urgency (good UX)

### WhatsApp
1. Button opens WhatsApp on mobile
2. Button opens WhatsApp web on desktop
3. Pre-filled message is correct
4. Phone number is correct

### Price Comparison
1. Shows only when viator price is higher
2. Savings calculation is accurate
3. Handles missing viator price gracefully

---

## Rollback Plan

If issues arise:
1. Trust badges: Remove component imports (no data changes)
2. Social proof: Disable API route, remove component
3. Urgency badges: Conditional render based on flag
4. WhatsApp: Remove floating button component
5. Price comparison: Hide with CSS until fix

All changes are additive (no existing functionality modified) so rollback is straightforward.
