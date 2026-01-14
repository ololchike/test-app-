# SafariPlus - Developer Task Breakdown

## Overview

This document provides a checkbox-based task list for developers to track implementation progress. All major features are implemented and production-ready.

**Last Updated**: January 14, 2026
**Status**: Phase 3 - Competitive Enhancement COMPLETE

---

## Phase 1: MVP - COMPLETE

### Sprint 1-2: Foundation (Weeks 1-4)

#### Project Setup

- [x] **Initialize Next.js 15 project with TypeScript**
  - [x] Create project with `create-next-app`
  - [x] Configure TypeScript strict mode
  - [x] Set up path aliases (@/components, @/lib, etc.)
  - [x] Configure ESLint and Prettier

- [x] **Set up Tailwind CSS and shadcn/ui**
  - [x] Install Tailwind CSS
  - [x] Configure design tokens (colors, fonts, spacing)
  - [x] Install shadcn/ui CLI
  - [x] Add base components: Button, Input, Card, Label

- [x] **Configure database (PostgreSQL + Prisma)**
  - [x] Install Prisma
  - [x] Create initial schema
  - [x] Create seed script
  - [x] Test database connection

#### Authentication System

- [x] **Implement NextAuth.js v5**
  - [x] Install NextAuth.js and Prisma adapter
  - [x] Configure JWT session strategy
  - [x] Set up Credentials provider
  - [x] Set up Google OAuth provider
  - [x] Extend session types with role and id

- [x] **Create registration API**
  - [x] Create registration via server actions
  - [x] Implement Zod validation schema
  - [x] Hash passwords with bcrypt (cost 12)
  - [x] Create user record in database
  - [x] Handle duplicate email errors

- [x] **Create Agent registration flow**
  - [x] Extend registration to accept role selection
  - [x] Create Agent record when role is AGENT
  - [x] Set Agent status to PENDING
  - [x] Validate business name and phone

- [x] **Implement email verification**
  - [x] Set up Resend email service
  - [x] Create verification token generation
  - [x] Send verification email on registration
  - [x] Create verification endpoint
  - [x] Update emailVerified on success

- [x] **Implement password reset**
  - [x] Create forgot password endpoint
  - [x] Generate time-limited reset token (1 hour expiry)
  - [x] Send reset email with link
  - [x] Create reset password endpoint
  - [x] Validate token and update password

- [x] **Configure route protection middleware**
  - [x] Define public routes list
  - [x] Define role-protected routes
  - [x] Implement authentication check
  - [x] Implement role-based access control
  - [x] Handle redirects for unauthorized access

- [x] **Security Features**
  - [x] Brute force protection (5 attempts = 15 min lockout)
  - [x] Rate limiting on auth endpoints
  - [x] Bot protection (honeypot + timing)
  - [x] Security headers (CSP, HSTS, XSS)

#### Authentication Frontend

- [x] **Create Login page** (`/login`)
  - [x] Email input with validation
  - [x] Password input with show/hide toggle
  - [x] Remember me checkbox
  - [x] Forgot password link
  - [x] Google OAuth button
  - [x] Sign up link
  - [x] Role-based redirect after login
  - [x] Bot protection

- [x] **Create Registration page** (`/signup`)
  - [x] Account type selector (Client/Agent)
  - [x] Full name, email, phone inputs
  - [x] Password with strength indicator
  - [x] Terms acceptance checkbox
  - [x] Conditional business fields for agents
  - [x] Bot protection

- [x] **Create Forgot Password page** (`/forgot-password`)
  - [x] Email input
  - [x] Submit button
  - [x] Success state
  - [x] Back to login link

- [x] **Create Reset Password page** (`/reset-password`)
  - [x] New password input
  - [x] Confirm password input
  - [x] Submit button
  - [x] Token validation
  - [x] Redirect to login on success

#### Layout Components

- [x] **Create Header component**
  - [x] Logo with home link
  - [x] Navigation links (Tours, About, Contact)
  - [x] Auth buttons (Login, Sign up)
  - [x] User menu when logged in
  - [x] Mobile hamburger menu

- [x] **Create Footer component**
  - [x] Logo and tagline
  - [x] Quick links section
  - [x] Support section
  - [x] Social media links
  - [x] Copyright notice

---

### Sprint 3-4: Tour Management (Weeks 5-8)

#### Tour Backend

- [x] **Create Tour database models**
  - [x] Tour model with all fields
  - [x] Itinerary, AccommodationOption, ActivityAddon models
  - [x] Set up relations
  - [x] Create indexes for search fields
  - [x] Run and test migration

- [x] **Implement Tour listing API** (`GET /api/tours`)
  - [x] Accept filter parameters (destination, price, duration, type)
  - [x] Implement search by title/description
  - [x] Implement sort options
  - [x] Paginate results (12 per page)
  - [x] Return only ACTIVE tours for public
  - [x] Include primary image and agent info

- [x] **Implement Tour detail API** (`GET /api/tours/[slug]`)
  - [x] Fetch tour by slug
  - [x] Include all images (ordered)
  - [x] Include agent profile
  - [x] Include reviews summary
  - [x] Increment view count (async)

- [x] **Implement Tour creation API** (`POST /api/agent/tours`)
  - [x] Verify agent authentication
  - [x] Verify agent ACTIVE status
  - [x] Validate input with Zod
  - [x] Generate unique slug from title
  - [x] Create tour in DRAFT status

- [x] **Implement Tour update API** (`PUT /api/agent/tours/[id]`)
  - [x] Verify agent owns tour
  - [x] Partial update support
  - [x] Update timestamp

- [x] **Implement Tour delete API** (`DELETE /api/agent/tours/[id]`)
  - [x] Verify agent owns tour
  - [x] Check no active bookings
  - [x] Cascade delete

- [x] **Implement Tour publish API** (`POST /api/agent/tours/[id]/publish`)
  - [x] Validate tour completeness
  - [x] Update status to ACTIVE
  - [x] Set publishedAt timestamp

- [x] **Configure Cloudinary**
  - [x] Create Cloudinary account
  - [x] Configure environment variables
  - [x] Test upload connection

- [x] **Implement image upload**
  - [x] Verify authentication
  - [x] Validate file type and size
  - [x] Upload to Cloudinary with transformations
  - [x] Delete images

#### Tour Frontend

- [x] **Create Tour listing page** (`/tours`)
  - [x] Search bar component
  - [x] Filter panel (mobile: sheet, desktop: sidebar)
  - [x] Price range filter
  - [x] Duration filter
  - [x] Tour type filter
  - [x] Destination dropdown
  - [x] Sort dropdown
  - [x] Tour cards grid (responsive)
  - [x] Results count
  - [x] Load more pagination
  - [x] Empty state
  - [x] Grid/List view toggle

- [x] **Create TourCard component**
  - [x] Primary image with lazy loading
  - [x] Tour title
  - [x] Rating stars and count
  - [x] Location badge
  - [x] Duration badge
  - [x] Price display
  - [x] Click to navigate

- [x] **Create Tour detail page** (`/tours/[slug]`)
  - [x] Image gallery (swipeable on mobile)
  - [x] Tour header (title, rating, location)
  - [x] Quick info badges
  - [x] Tab navigation (Overview, Itinerary, Reviews)
  - [x] Overview content
  - [x] Day-by-day itinerary (collapsible)
  - [x] Inclusions/Exclusions lists
  - [x] Agent profile card
  - [x] Sticky booking bar

- [x] **Create Agent tour list** (`/agent/tours`)
  - [x] Status filter tabs (All, Active, Draft)
  - [x] Search input
  - [x] Tour management cards
  - [x] Action menu (Edit, View, Duplicate, Delete)
  - [x] Create tour button
  - [x] Empty state

- [x] **Create Tour creation wizard** (`/agent/tours/new`)
  - [x] Step indicator
  - [x] Step 1: Basic details form
  - [x] Step 2: Itinerary builder
  - [x] Step 3: Image upload
  - [x] Step 4: Features and inclusions
  - [x] Step 5: Review and create
  - [x] Navigation between steps
  - [x] Validation per step

---

### Sprint 5-6: Booking System (Weeks 9-12)

#### Booking Backend

- [x] **Create Booking database model**
  - [x] Add all required fields
  - [x] Set up relations
  - [x] Create indexes
  - [x] Run migration

- [x] **Implement Booking creation API** (`POST /api/bookings`)
  - [x] Verify client authentication (or guest)
  - [x] Validate tour exists and is published
  - [x] Validate traveler count
  - [x] Calculate total price
  - [x] Calculate commission
  - [x] Generate booking number
  - [x] Create booking in PENDING status
  - [x] Input sanitization
  - [x] Rate limiting

- [x] **Implement Booking list API** (`GET /api/bookings`)
  - [x] Filter by user role
  - [x] Filter by status
  - [x] Include tour info
  - [x] Include payment status
  - [x] Paginate results
  - [x] Sort by travel date

- [x] **Implement Booking detail API** (`GET /api/bookings/[id]`)
  - [x] Verify access (owner, agent, admin)
  - [x] Include full tour info
  - [x] Include agent contact
  - [x] Include payment details

- [x] **Implement Booking status update**
  - [x] Verify authorization
  - [x] Validate status transition
  - [x] Handle CONFIRMED status (after payment)
  - [x] Handle CANCELLED status
  - [x] Handle COMPLETED status
  - [x] Send notification emails

#### Booking Frontend

- [x] **Create Checkout page** (`/checkout/[bookingId]`)
  - [x] Order summary sidebar
  - [x] Traveler details form (lead traveler)
  - [x] Additional travelers form (expandable)
  - [x] Special requests textarea
  - [x] Payment method selection (M-Pesa, Card)
  - [x] Terms acceptance
  - [x] Submit button
  - [x] Mobile responsive layout

- [x] **Create Booking confirmation page** (`/booking/confirmation/[id]`)
  - [x] Success animation/icon
  - [x] Booking reference number
  - [x] What happens next steps
  - [x] Booking summary card
  - [x] Download PDF button
  - [x] Add to calendar button
  - [x] Continue browsing CTA

- [x] **Create Client Dashboard** (`/dashboard`)
  - [x] Welcome message
  - [x] Stats cards (total, upcoming, completed)
  - [x] Next trip highlight card
  - [x] Recent bookings list
  - [x] Recommended tours
  - [x] Quick actions

- [x] **Create My Bookings page** (`/dashboard/bookings`)
  - [x] Status filter tabs
  - [x] Search input
  - [x] Booking cards list
  - [x] Empty state per tab
  - [x] Load more/pagination

- [x] **Create Booking detail page** (`/dashboard/bookings/[id]`)
  - [x] Status banner
  - [x] Booking reference
  - [x] Tour summary card
  - [x] Travel details section
  - [x] Payment details section
  - [x] Operator contact card
  - [x] Actions (Download, Cancel)
  - [x] Cancellation policy

- [x] **Create Agent Dashboard** (`/agent`)
  - [x] Welcome message
  - [x] Stats cards (earnings, bookings, rating)
  - [x] Earnings chart
  - [x] Recent bookings table
  - [x] Activity feed
  - [x] Quick actions

- [x] **Create Agent Bookings page** (`/agent/bookings`)
  - [x] Stats bar
  - [x] Filter controls
  - [x] Bookings data table
  - [x] Actions column
  - [x] Export button
  - [x] Pagination

---

### Sprint 7-8: Payments & Admin (Weeks 13-16)

#### Payment Backend

- [x] **Create Payment database model**
  - [x] Add all required fields
  - [x] Set up unique indexes
  - [x] Run migration

- [x] **Implement Pesapal client class**
  - [x] Token management with caching
  - [x] Submit order method
  - [x] Get transaction status method
  - [x] IPN signature verification

- [x] **Implement Payment initiation** (`POST /api/payments/initiate`)
  - [x] Verify client authentication
  - [x] Verify booking ownership
  - [x] Check no existing payment
  - [x] Validate payment method
  - [x] Generate merchant reference
  - [x] Submit to Pesapal
  - [x] Create/update payment record
  - [x] Return redirect URL

- [x] **Implement Pesapal webhook** (`POST /api/webhooks/pesapal`)
  - [x] Parse IPN payload
  - [x] IP validation
  - [x] Get transaction status from Pesapal
  - [x] Find payment by order ID
  - [x] Update payment status
  - [x] Update booking to CONFIRMED
  - [x] Update agent pending balance
  - [x] Increment tour booking count
  - [x] Send confirmation email
  - [x] Handle idempotency

- [x] **Implement Payment status check** (`GET /api/payments/status`)
  - [x] Verify access
  - [x] Return current status
  - [x] Poll Pesapal if PROCESSING

#### Admin Backend

- [x] **Implement Admin agents list** (`GET /api/admin/agents`)
  - [x] Verify admin role
  - [x] Filter by status
  - [x] Search by name/email
  - [x] Return with counts
  - [x] Paginate

- [x] **Implement Agent status update**
  - [x] Verify admin role
  - [x] Approve agent
  - [x] Suspend agent
  - [x] Verify agent
  - [x] Unverify agent
  - [x] Send notification email
  - [x] Create audit log

- [x] **Implement Commission rate update**
  - [x] Verify admin role
  - [x] Update commission rate
  - [x] Create audit log

- [x] **Implement Commission tiers**
  - [x] Commission tier model
  - [x] CRUD API endpoints
  - [x] Admin UI for management

- [x] **Implement Admin dashboard stats** (`GET /api/admin/stats`)
  - [x] Revenue metrics
  - [x] Booking counts
  - [x] User counts
  - [x] Pending actions

---

## Phase 2: Enhanced Features - COMPLETE

### Messaging System

- [x] **Real-time chat**
  - [x] Conversation model
  - [x] Message model
  - [x] Create conversation API
  - [x] Send message API
  - [x] Get messages API
  - [x] Mark as read

- [x] **Pusher Integration**
  - [x] Server-side setup
  - [x] Client-side hooks
  - [x] Real-time message delivery
  - [x] Read receipts

- [x] **UI Components**
  - [x] Conversation list
  - [x] Message thread
  - [x] Message input
  - [x] Unread badge

### Reviews & Ratings

- [x] **Review submission**
  - [x] Rating (1-5 stars)
  - [x] Title and content
  - [x] Image uploads
  - [x] Verified purchase flag

- [x] **Review display**
  - [x] Reviews list
  - [x] Rating breakdown
  - [x] Filtering/sorting
  - [x] Helpful votes

- [x] **Agent responses**
  - [x] Response to reviews
  - [x] Admin moderation

### Withdrawals

- [x] **Agent withdrawal requests**
  - [x] Request form
  - [x] Bank/M-Pesa details
  - [x] Amount validation

- [x] **Admin approval workflow**
  - [x] Pending queue
  - [x] Approve/reject
  - [x] Process payment
  - [x] Status tracking

### Other Features

- [x] **Wishlist**
  - [x] Add/remove tours
  - [x] View wishlist page
  - [x] Check status

- [x] **Notifications**
  - [x] Notification model
  - [x] Multiple types
  - [x] Read/unread status

- [x] **Site Content Management**
  - [x] Privacy policy
  - [x] Terms of service
  - [x] Cookies policy
  - [x] Rich text editor

- [x] **Agent Analytics**
  - [x] Tour views
  - [x] Booking stats
  - [x] Revenue metrics
  - [x] Conversion rates

- [x] **Tour Availability**
  - [x] Calendar management
  - [x] Availability types
  - [x] Spot tracking

---

## Security Implementation - COMPLETE

- [x] **Authentication Security**
  - [x] Brute force protection
  - [x] Timing attack prevention
  - [x] Bot protection (honeypot + timing)
  - [x] Rate limiting

- [x] **API Security**
  - [x] Input sanitization
  - [x] CSRF protection
  - [x] Rate limiting per endpoint
  - [x] Authorization checks

- [x] **Security Headers**
  - [x] Content Security Policy
  - [x] Strict-Transport-Security
  - [x] X-Frame-Options
  - [x] X-Content-Type-Options
  - [x] X-XSS-Protection
  - [x] Referrer-Policy

- [x] **Webhook Security**
  - [x] IP validation
  - [x] Signature verification
  - [x] Idempotency handling

---

## Summary

**Phase 1-2 Status**: 100% Complete
**Phase 3 Status**: 100% Complete

| Category | Status |
|----------|--------|
| Authentication | ✅ Complete |
| Tour Management | ✅ Complete |
| Booking System | ✅ Complete |
| Payment Integration | ✅ Complete |
| Client Dashboard | ✅ Complete |
| Agent Dashboard | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| Messaging | ✅ Complete |
| Reviews | ✅ Complete |
| Withdrawals | ✅ Complete |
| Security | ✅ Complete |
| **Phase 3: Competitive Enhancement** | **✅ Complete** |

**Application is production-ready with all competitive enhancements.**

---

## Phase 3: Competitive Enhancement - ✅ COMPLETE

**Reference:** See `ENHANCEMENT-ROADMAP.md` for full implementation details.

### Sprint 1: Trust & Quick Wins (Week 1-2) - ✅ COMPLETE

#### Day 1: Trust Badges

- [x] **Create TrustBadges component**
  - [x] Create `src/components/trust/trust-badges.tsx`
  - [x] Support variants: full, compact, payment-only
  - [x] Add badge images to `public/badges/`
  - [x] Add to homepage hero section
  - [x] Add to footer (all pages)
  - [x] Add to checkout page
  - [x] Add to tour detail booking card

#### Day 2: Social Proof Counters

- [x] **Create platform stats API**
  - [x] Create `src/app/api/stats/platform/route.ts`
  - [x] Query: bookings count (CONFIRMED/COMPLETED)
  - [x] Query: verified operators count
  - [x] Query: average rating
  - [x] Query: total paid to agents
  - [x] Implement 5-minute cache

- [x] **Create SocialProofBanner component**
  - [x] Create `src/components/trust/social-proof-banner.tsx`
  - [x] Add animated counters
  - [x] Add to homepage
  - [x] Add to tour listing page

#### Day 3: Urgency Indicators

- [x] **Create urgency badge components**
  - [x] Create `src/components/urgency/spots-left-badge.tsx`
  - [x] Create `src/components/urgency/recent-bookings-badge.tsx`
  - [x] Create `src/components/urgency/viewing-now-badge.tsx`
  - [x] Add pulsing animation for spots left

- [x] **Enhance tour API with urgency data**
  - [x] Add `spotsRemaining` calculation
  - [x] Add `recentBookings24h` count
  - [x] Integrate badges into tour cards
  - [x] Integrate badges into tour detail page

#### Day 4: Free Cancellation + WhatsApp

- [x] **Free Cancellation Badge**
  - [x] Create `src/components/trust/free-cancellation-badge.tsx`
  - [x] Support inline and card variants
  - [x] Use `tour.freeCancellationDays` data
  - [x] Add to tour cards
  - [x] Add to booking card

- [x] **WhatsApp Button**
  - [x] Create `src/components/engagement/whatsapp-button.tsx`
  - [x] Support floating, inline, card variants
  - [x] Add `NEXT_PUBLIC_WHATSAPP_NUMBER` env var
  - [x] Add floating button to main layout
  - [x] Add to tour detail page

#### Day 5: M-Pesa Banner + Price Comparison

- [x] **M-Pesa Hero Banner**
  - [x] Create `src/components/trust/mpesa-hero-banner.tsx`
  - [x] Add payment method logos
  - [x] Add to homepage hero section

- [x] **Price Comparison**
  - [x] Add `viatorPrice` field to Tour schema
  - [x] Add `comparisonNote` field to Tour schema
  - [x] Run database migration
  - [x] Create `src/components/trust/price-comparison.tsx`
  - [x] Add to booking card
  - [x] Calculate savings percentage

#### Day 6: Guarantees Section

- [x] **Guarantees Section**
  - [x] Create `src/components/trust/guarantees-section.tsx`
  - [x] Support full and compact variants
  - [x] Add icons: Shield, Calendar, Lock, UserCheck, Headphones
  - [x] Add to homepage
  - [x] Add to checkout page

---

### Sprint 2: Retention & Recovery (Weeks 3-4) - ✅ COMPLETE

#### Days 1-4: Abandoned Cart Recovery

- [x] **Cart Tracking (Client-side)**
  - [x] Create `src/components/engagement/cart-tracker.tsx`
  - [x] Create `src/lib/hooks/use-abandoned-cart.ts`
  - [x] Track checkout stages via localStorage
  - [x] Store tour and booking info

- [x] **Abandoned Cart Banner**
  - [x] Create `src/components/engagement/abandoned-cart-banner.tsx`
  - [x] Show reminder to complete booking
  - [x] Include tour image and details

#### Days 5-6: Recently Viewed Tours

- [x] **Client-side Tracking**
  - [x] Create `src/components/discovery/tour-view-tracker.tsx`
  - [x] Store in localStorage (max 10)
  - [x] Update on tour detail page visit

- [x] **RecentlyViewed Component**
  - [x] Create `src/components/discovery/recently-viewed.tsx`
  - [x] Show horizontal scroll of tour cards
  - [x] Add to homepage
  - [x] Add to tour listing page

#### Day 7: Exit Intent Popup

- [x] **Exit Intent Detection**
  - [x] Create `src/components/engagement/exit-intent-popup.tsx`
  - [x] Detect mouse leaving viewport (desktop)
  - [x] Show only once per session (localStorage)
  - [x] Include email capture form

#### Day 8: Return Visitor Recognition

- [x] **Welcome Back Banner**
  - [x] Create `src/components/engagement/return-visitor-banner.tsx`
  - [x] Check last visit in localStorage
  - [x] Show personalized message
  - [x] Link to recently viewed tours

---

### Sprint 3: Discovery & Collections (Weeks 5-6) - ✅ COMPLETE

#### Days 1-3: Curated Collections

- [x] **Database Models**
  - [x] Create `Collection` model
  - [x] Create `CollectionTour` junction table
  - [x] Run migration

- [x] **Admin CRUD API**
  - [x] Create `GET /api/collections`
  - [x] Create `GET /api/collections/[slug]`
  - [x] Create `POST /api/admin/collections`
  - [x] Create `PUT /api/admin/collections/[id]`
  - [x] Create `DELETE /api/admin/collections/[id]`

- [x] **Admin UI**
  - [x] Create collection management page
  - [x] Add/remove tours to collections
  - [x] Set cover image and description
  - [x] Reorder collections

- [x] **Public Display**
  - [x] Create `/collections` page
  - [x] Create `/collections/[slug]` page
  - [x] Add featured collections to homepage

#### Days 4-6: Deals & Offers Page

- [x] **PromoCode Model**
  - [x] Create `PromoCode` model in schema
  - [x] Support percentage and fixed discounts
  - [x] Add agent-specific codes option
  - [x] Run migration

- [x] **Promo API**
  - [x] Create `POST /api/promo/validate`
  - [x] Create `GET /api/deals`
  - [x] Check validity (dates, usage limits)
  - [x] Return discount amount

- [x] **Deals Page**
  - [x] Create `/deals` page
  - [x] Create `/deals/[slug]` page
  - [x] Deal categories and filtering

- [x] **Checkout Integration**
  - [x] Add promo code input to checkout
  - [x] Validate and apply discount
  - [x] Show savings in order summary

#### Day 7: Search Suggestions

- [x] **Search API Enhancement**
  - [x] Create suggestions endpoint
  - [x] Return matching tours, destinations

- [x] **Autocomplete UI**
  - [x] Add autocomplete to search input
  - [x] Show suggestions dropdown

---

### Sprint 4: Growth & Loyalty (Weeks 7-8) - ✅ COMPLETE

#### Days 1-4: Referral Program

- [x] **Database Models**
  - [x] Create `Referral` model
  - [x] Create `ReferralCredit` model
  - [x] Run migration

- [x] **Referral API**
  - [x] Create `GET /api/referrals`
  - [x] Generate unique referral codes
  - [x] Track referral stats

- [x] **User Dashboard**
  - [x] Create `src/components/referral/referral-share-card.tsx`
  - [x] Create `src/components/referral/referral-stats-card.tsx`
  - [x] Create `/dashboard/referrals` page
  - [x] Show credits balance

- [x] **Signup Integration**
  - [x] Accept referral code at signup
  - [x] Credit referrer when friend books

#### Days 5-6: Review Incentives

- [x] **Review Incentive System**
  - [x] Photo reviews supported
  - [x] Review moderation system

#### Days 7-8: Photo Reviews Enhancement

- [x] **Enhanced Review Form**
  - [x] Image upload support
  - [x] Preview uploaded images

- [x] **Review Display Enhancement**
  - [x] Display review photos
  - [x] Filter reviews

---

### Sprint 5: Mobile & Technical (Weeks 9-10) - ✅ COMPLETE

#### Days 1-3: PWA Implementation

- [x] **PWA Foundation**
  - [x] Create `public/manifest.json`
  - [x] Configure service worker via next-pwa
  - [x] Add PWA icons (72x72 to 512x512)
  - [x] Configure Next.js for PWA
  - [x] Add screenshots for install prompt

- [x] **Offline Support**
  - [x] Cache static assets
  - [x] Cache tour listings (stale-while-revalidate)
  - [x] Cache images (Cloudinary, Unsplash)

- [x] **Install Prompt**
  - [x] PWA installable on supported browsers
  - [x] App shortcuts configured

#### Days 4-8: Multi-Gateway Payment (Flutterwave)

- [x] **Flutterwave Client**
  - [x] Create `src/lib/flutterwave/index.ts`
  - [x] Implement payment initiation
  - [x] Implement payment verification
  - [x] Add environment variables

- [x] **Payment Routing**
  - [x] Create `src/lib/payments/gateway-router.ts`
  - [x] Route M-Pesa to Pesapal
  - [x] Route international cards to Flutterwave

- [x] **Checkout UI Updates**
  - [x] Show gateway based on selection
  - [x] Handle both redirect flows
  - [x] Consistent success/failure handling

- [x] **Webhook Handler**
  - [x] Create `POST /api/webhooks/flutterwave`
  - [x] Verify webhook signature
  - [x] Update payment and booking status
  - [x] Handle idempotency

---

### Sprint 6: Agent Tools (Weeks 11-12) - ✅ COMPLETE

#### Days 1-4: Agent Promotional Tools

- [x] **Promo Code Creator**
  - [x] Create `src/components/agent/promo-code-creator.tsx`
  - [x] Agent can create codes for their tours
  - [x] Set discount type, amount, validity
  - [x] View usage stats
  - [x] API endpoints for CRUD operations

- [x] **QR Code Generator**
  - [x] QR codes in `src/components/agent/marketing-tools.tsx`
  - [x] Generate QR for tour links
  - [x] Download as PNG
  - [x] Uses qrserver.com API

- [x] **WhatsApp Share**
  - [x] Share buttons in marketing tools
  - [x] Pre-format message with tour details
  - [x] Include booking link

- [x] **Embeddable Widget**
  - [x] Create `/embed/operators/[id]` page
  - [x] Generate embed code for agents
  - [x] Responsive design
  - [x] Minimal layout for iframe

- [x] **Agent Marketing Hub**
  - [x] Create `/agent/marketing` page
  - [x] Tabs for all marketing tools
  - [x] Shareable links section

#### Days 5-6: Tour Comparison Tool

- [x] **Comparison State**
  - [x] Create `src/lib/contexts/comparison-context.tsx`
  - [x] Add "compare" button to tour cards
  - [x] Store selected tours in context
  - [x] Max 4 tours

- [x] **Comparison View**
  - [x] Create `src/components/tours/comparison-bar.tsx`
  - [x] Create `src/components/tours/comparison-table.tsx`
  - [x] Create `/tours/compare` page
  - [x] Show price, duration, rating, features
  - [x] Link to book each tour

---

## Future Enhancements (Backlog)

### Content & SEO - ✅ COMPLETE
- [x] Destination guides (rich content with FAQs)
  - [x] DestinationGuide database model
  - [x] Admin CRUD pages `/admin/destinations`
  - [x] FAQ management for destinations
  - [x] Public API endpoints
- [x] Blog system
  - [x] BlogPost and BlogCategory models
  - [x] Admin management `/admin/blog`
  - [x] Public blog pages `/blog` and `/blog/[slug]`
  - [x] Article JSON-LD schema
- [x] Video content integration (videoUrl fields in models)
- [x] FAQ schema markup
  - [x] SiteFAQ model
  - [x] Admin management `/admin/faqs`
  - [x] Public FAQ page with JSON-LD FAQPage schema
  - [x] Destination-specific FAQs

### Additional Payment Gateways
- [ ] PayPal integration
- [ ] Wise Business integration
- [ ] BNPL (Lipa Later) integration

### Advanced Features
- [ ] Loyalty points system
- [ ] Video reviews
- [ ] Live chat widget (Crisp/Intercom)
- [ ] SMS notifications
- [ ] Multi-language support

### Performance & Security
- [ ] Performance monitoring setup
- [ ] Uptime monitoring
- [ ] 2FA for agents
- [ ] Advanced fraud detection
