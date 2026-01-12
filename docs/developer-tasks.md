# SafariPlus - Developer Task Breakdown

## Overview

This document provides a checkbox-based task list for developers to track implementation progress. Each task includes acceptance criteria and links to relevant documentation.

---

## Phase 1: MVP

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

- [x] **Configure database (SQLite + Prisma)**
  - [x] Install Prisma
  - [x] Create initial schema (User, Account, Session, Agent, Tour, Booking models)
  - [x] Create seed script for initial data (3 test users, 2 sample tours)
  - [x] Test database connection

#### Authentication System

- [x] **Implement NextAuth.js v5**
  - [x] Install NextAuth.js and Prisma adapter
  - [x] Configure JWT session strategy
  - [x] Set up Credentials provider
  - [x] Set up Google OAuth provider (configured)
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

- [x] **Implement email verification** (COMPLETE - Jan 2026)
  - [x] Set up Resend email service
  - [x] Create verification token generation
  - [x] Send verification email on registration
  - [x] Create verification endpoint (`/api/auth/verify-email`)
  - [x] Update emailVerified on success

- [x] **Implement password reset** (COMPLETE - Jan 2026)
  - [x] Create forgot password endpoint (`/api/auth/forgot-password`)
  - [x] Generate time-limited reset token (1 hour expiry)
  - [x] Send reset email with link
  - [x] Create reset password endpoint (`/api/auth/reset-password`)
  - [x] Validate token and update password

- [x] **Configure route protection middleware**
  - [x] Define public routes list
  - [x] Define role-protected routes
  - [x] Implement authentication check
  - [x] Implement role-based access control
  - [x] Handle redirects for unauthorized access

#### Authentication Frontend

- [x] **Create Login page** (`/login`)
  - [x] Email input with validation
  - [x] Password input with show/hide toggle
  - [ ] Remember me checkbox
  - [x] Forgot password link
  - [x] Google OAuth button
  - [x] Sign up link
  - [x] Role-based redirect after login

- [x] **Create Registration page** (`/signup`)
  - [x] Account type selector (Client/Agent)
  - [x] Full name, email, phone inputs
  - [x] Password with strength indicator
  - [x] Terms acceptance checkbox
  - [x] Conditional business fields for agents

- [x] **Create Forgot Password page** (`/forgot-password`) (COMPLETE - Jan 2026)
  - [x] Email input
  - [x] Submit button
  - [x] Success state
  - [x] Back to login link

- [x] **Create Reset Password page** (`/reset-password`) (COMPLETE - Jan 2026)
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

- [ ] **Create MobileNav component**
  - [ ] Bottom navigation for mobile
  - [ ] Icon-based navigation
  - [ ] Active state indication

---

### Sprint 3-4: Tour Management (Weeks 5-8)

#### Tour Backend

- [x] **Create Tour database models**
  - [x] Tour model with all fields
  - [x] Itinerary, AccommodationOption, ActivityAddon models
  - [x] Set up relations (Agent -> Tour -> Itinerary/etc.)
  - [x] Create indexes for search fields
  - [x] Run and test migration

- [x] **Implement Tour listing API** (`GET /api/tours`)
  - [x] Accept filter parameters (destination, price, duration)
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

- [ ] **Configure Cloudinary**
  - [ ] Create Cloudinary account
  - [ ] Configure environment variables
  - [ ] Test upload connection

- [ ] **Implement image upload** (`POST /api/upload`)
  - [ ] Verify authentication
  - [ ] Verify tour ownership
  - [ ] Validate file type and size
  - [ ] Upload to Cloudinary with transformations
  - [ ] Save image record to database
  - [ ] Set first image as primary

#### Tour Frontend

- [x] **Create Tour listing page** (`/tours`)
  - [x] Search bar component
  - [x] Filter panel (mobile: sheet, desktop: sidebar)
  - [x] Price range filter
  - [x] Duration filter
  - [x] Destination dropdown
  - [x] Sort dropdown
  - [x] Tour cards grid (responsive)
  - [x] Results count
  - [ ] Pagination/Load more
  - [x] Empty state

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
  - [ ] Similar tours section
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
  - [ ] Step 2: Itinerary builder (planned)
  - [x] Step 3: Image URL input (file upload planned)
  - [x] Step 4: Features and inclusions
  - [x] Step 5: Review and create
  - [ ] Draft save functionality
  - [x] Navigation between steps
  - [x] Validation per step

- [ ] **Create ImageUploader component**
  - [ ] Drag and drop zone
  - [ ] File picker fallback
  - [ ] Upload progress indicator
  - [ ] Image preview grid
  - [ ] Reorder functionality (drag)
  - [ ] Set primary image
  - [ ] Delete image
  - [ ] Max file size/count validation

- [ ] **Create ItineraryBuilder component**
  - [ ] Add day button
  - [ ] Day cards with day number
  - [ ] Day title input
  - [ ] Location input
  - [ ] Description textarea
  - [ ] Activities list (add/remove)
  - [ ] Meals checkboxes
  - [ ] Reorder days (drag)
  - [ ] Delete day

---

### Sprint 5-6: Booking System (Weeks 9-12)

#### Booking Backend

- [ ] **Create Booking database model**
  - [ ] Add all required fields
  - [ ] Set up relations
  - [ ] Create indexes
  - [ ] Run migration

- [ ] **Implement Booking creation API** (`POST /api/bookings`)
  - [ ] Verify client authentication
  - [ ] Validate tour exists and is published
  - [ ] Validate traveler count
  - [ ] Validate travel date availability
  - [ ] Calculate total price
  - [ ] Calculate commission
  - [ ] Generate booking number
  - [ ] Create booking in PENDING status
  - [ ] Create conversation for messaging

- [ ] **Implement Booking list API** (`GET /api/bookings`)
  - [ ] Filter by user role
  - [ ] Filter by status
  - [ ] Include tour info
  - [ ] Include payment status
  - [ ] Paginate results
  - [ ] Sort by travel date

- [ ] **Implement Booking detail API** (`GET /api/bookings/[id]`)
  - [ ] Verify access (owner, agent, admin)
  - [ ] Include full tour info
  - [ ] Include agent contact
  - [ ] Include payment details

- [ ] **Implement Booking status update** (`PUT /api/bookings/[id]/status`)
  - [ ] Verify authorization
  - [ ] Validate status transition
  - [ ] Handle CONFIRMED status (after payment)
  - [ ] Handle CANCELLED status (check deadline)
  - [ ] Handle COMPLETED status (update agent balance)
  - [ ] Send notification emails

- [ ] **Implement Dashboard stats API** (`GET /api/dashboard/stats`)
  - [ ] Return role-specific statistics
  - [ ] Calculate booking counts
  - [ ] Calculate earnings (agent)
  - [ ] Return recent bookings

#### Booking Frontend

- [x] **Create Checkout page** (`/checkout/[bookingId]`) (COMPLETE - Jan 2026)
  - [x] Order summary sidebar
  - [x] Traveler details form (lead traveler)
  - [x] Additional travelers form (expandable)
  - [x] Special requests textarea
  - [x] Payment method selection (M-Pesa, Card)
  - [x] Terms acceptance
  - [x] Submit button
  - [x] Mobile responsive layout

- [x] **Create Booking confirmation page** (`/booking/confirmation/[id]`) (COMPLETE - Jan 2026)
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

- [x] **Create My Bookings page** (`/dashboard/bookings`) (COMPLETE - Jan 2026)
  - [x] Status filter tabs
  - [x] Search input
  - [x] Booking cards list
  - [x] Empty state per tab
  - [x] Load more/pagination

- [x] **Create Booking detail page** (`/dashboard/bookings/[id]`) (COMPLETE - Jan 2026)
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
  - [x] Earnings chart placeholder
  - [x] Recent bookings table
  - [x] Activity feed
  - [x] Quick actions

- [x] **Create Agent Bookings page** (`/agent/bookings`) (COMPLETE - Jan 2026)
  - [x] Stats bar
  - [x] Filter controls
  - [x] Bookings data table
  - [x] Actions column
  - [x] Export button
  - [x] Pagination

- [x] **Create Agent Booking detail** (`/agent/bookings/[id]`) (COMPLETE - Jan 2026)
  - [x] Booking header with status
  - [x] Client information card
  - [x] Traveler details list
  - [x] Payment breakdown
  - [x] Status update dropdown
  - [x] Internal notes section
  - [x] Action buttons

---

### Sprint 7-8: Payments & Admin (Weeks 13-16)

#### Payment Backend

- [x] **Create Payment database model** (COMPLETE - Jan 2026)
  - [x] Add all required fields
  - [x] Set up unique indexes
  - [x] Run migration

- [x] **Implement Pesapal client class** (COMPLETE - Jan 2026)
  - [x] Token management with caching
  - [x] Submit order method
  - [x] Get transaction status method
  - [x] IPN signature verification

- [x] **Implement Payment initiation** (`POST /api/payments/initiate`) (COMPLETE - Jan 2026)
  - [x] Verify client authentication
  - [x] Verify booking ownership
  - [x] Check no existing payment
  - [x] Validate payment method
  - [x] Generate merchant reference
  - [x] Submit to Pesapal
  - [x] Create/update payment record
  - [x] Return redirect URL

- [x] **Implement Pesapal webhook** (`POST /api/webhooks/pesapal`) (COMPLETE - Jan 2026)
  - [x] Parse IPN payload
  - [x] Get transaction status from Pesapal
  - [x] Find payment by order ID
  - [x] Update payment status
  - [x] Update booking to CONFIRMED
  - [x] Update agent pending balance
  - [x] Increment tour booking count
  - [x] Send confirmation email
  - [x] Handle idempotency

- [x] **Implement Payment status check** (`GET /api/payments/status`) (COMPLETE - Jan 2026)
  - [x] Verify access
  - [x] Return current status
  - [x] Poll Pesapal if PROCESSING

#### Agent & Admin Backend

- [x] **Implement Agent profile API** (`GET/PUT /api/agents/[id]`) (COMPLETE - Jan 2026)
  - [x] Get agent profile
  - [x] Update profile (verify ownership)
  - [x] Calculate profile completion

- [x] **Implement Agent earnings API** (`GET /api/agents/[id]/earnings`) (COMPLETE - Jan 2026)
  - [x] Verify ownership
  - [x] Return balance summary
  - [x] Return monthly breakdown
  - [x] Return recent transactions

- [x] **Implement Admin agents list** (`GET /api/admin/agents`) (COMPLETE - Jan 2026)
  - [x] Verify admin role
  - [x] Filter by status
  - [x] Search by name/email
  - [x] Return with counts
  - [x] Paginate

- [x] **Implement Agent status update** (`PUT /api/admin/agents/[id]/status`) (COMPLETE - Jan 2026)
  - [x] Verify admin role
  - [x] Approve agent
  - [x] Suspend agent (unpublish tours)
  - [x] Send notification email
  - [x] Create audit log

- [x] **Implement Commission rate update** (`PUT /api/admin/agents/[id]/commission`) (COMPLETE - Jan 2026)
  - [x] Verify admin role
  - [x] Update commission rate
  - [x] Create audit log

- [x] **Implement Admin dashboard stats** (`GET /api/admin/stats`) (COMPLETE - Jan 2026)
  - [x] Revenue metrics
  - [x] Booking counts
  - [x] User counts
  - [x] Pending actions

- [ ] **Implement Commission config** (`GET/POST /api/admin/commission`)
  - [ ] List commission tiers
  - [ ] Create/update tier

#### Payment & Admin Frontend

- [x] **Enhance Checkout with payment** (COMPLETE - Jan 2026)
  - [x] Payment method selector
  - [x] M-Pesa phone number input
  - [x] Card payment redirect info
  - [x] Submit and redirect flow
  - [x] Payment processing state

- [x] **Create payment status display** (COMPLETE - Jan 2026)
  - [x] Processing indicator
  - [x] Success state
  - [x] Failure state with retry

- [x] **Create Agent Earnings page** (`/agent/earnings`) (COMPLETE - Jan 2026)
  - [x] Balance cards (available, pending)
  - [x] Commission rate display
  - [x] Earnings chart
  - [x] Transaction table
  - [ ] Withdrawal history (Phase 2)

- [x] **Create Agent Profile page** (`/agent/profile`) (COMPLETE - Jan 2026)
  - [x] Profile completion bar
  - [x] Business information form
  - [x] Contact information form
  - [x] Payment details form
  - [x] Save changes button

- [x] **Create Admin Dashboard** (`/admin`) (COMPLETE - Jan 2026)
  - [x] Stats grid
  - [x] Revenue chart placeholder
  - [x] Pending actions cards
  - [x] Activity feed

- [x] **Create Admin Agents page** (`/admin/agents`) (COMPLETE - Jan 2026)
  - [x] Stats bar
  - [x] Filters
  - [x] Agents data table
  - [x] Action menu
  - [x] Approval modal
  - [x] Suspension modal

- [ ] **Create Admin Commission page** (`/admin/settings/commission`)
  - [ ] Current tiers table
  - [ ] Edit tier modal
  - [ ] Add tier button
  - [ ] Commission history
  - [ ] Summary stats

---

## Phase 2: Growth Features

### Sprint 9-10: Communication & Reviews

#### Messaging (COMPLETE - Jan 2026)

- [x] **Set up Pusher**
  - [x] Configure environment variables
  - [x] Create server client (`src/lib/pusher/server.ts`)
  - [x] Create browser client (`src/lib/pusher/client.ts`)
  - [x] Set up authentication endpoint (`/api/pusher/auth`)

- [x] **Implement Conversations API**
  - [x] List conversations (`GET /api/messages/conversations`)
  - [x] Create/get conversation (`POST /api/messages/conversations`)
  - [x] Get messages with pagination (`GET /api/messages`)
  - [x] Send message (`POST /api/messages`)
  - [x] Mark as read (automatic on view)
  - [x] Real-time broadcast via Pusher

- [x] **Create Chat UI**
  - [x] Conversation list (`src/components/messages/conversation-list.tsx`)
  - [x] Message thread (`src/components/messages/message-thread.tsx`)
  - [x] Message input (`src/components/messages/message-input.tsx`)
  - [x] Chat container (`src/components/messages/chat-container.tsx`)
  - [x] Real-time updates via Pusher subscription
  - [x] Read receipts (checkmarks)
  - [x] Unread badge in sidebar navigation

- [x] **Create Messages Pages**
  - [x] Agent messages page (`/agent/messages`)
  - [x] Client messages page (`/dashboard/messages`)

#### Reviews (COMPLETE - Jan 2026)

- [x] **Implement Reviews API**
  - [x] Submit review (verified booking) (`POST /api/reviews`)
  - [x] Agent response (`POST /api/reviews/[id]/respond`)
  - [x] List reviews (`GET /api/tours/[slug]/reviews`)
  - [x] Rating calculation
  - [x] Helpful voting (`POST /api/reviews/[id]/helpful`)

- [x] **Create Review components**
  - [x] Review form (`src/components/reviews/review-form.tsx`)
  - [x] Star rating input
  - [x] Review card (`src/components/reviews/review-list.tsx`)
  - [x] Rating breakdown chart (`src/components/reviews/review-stats.tsx`)
  - [x] Agent response section

---

### Sprint 11-12: Enhanced Agent Tools

#### Withdrawals (COMPLETE - Jan 2026)

- [x] **Implement Withdrawal API**
  - [x] Create withdrawal request (`POST /api/agent/withdrawals`)
  - [x] List withdrawals (`GET /api/agent/withdrawals`)
  - [x] Admin approve (`POST /api/admin/withdrawals/[id]/approve`)
  - [x] Admin reject (`POST /api/admin/withdrawals/[id]/reject`)
  - [x] Process withdrawal (`POST /api/admin/withdrawals/[id]/process`)
  - [x] Balance tracking (`GET /api/agent/balance`)

- [x] **Create Withdrawal UI**
  - [x] Request form (`src/components/agent/withdrawal-form.tsx`)
  - [x] Withdrawal history (`src/components/agent/withdrawal-history.tsx`)
  - [x] Agent earnings page with withdrawals (`/agent/earnings`)
  - [x] Admin management page (`/admin/withdrawals`)

---

### Sprint 13-14: Discovery & Profiles (PARTIAL - Jan 2026)

#### Wishlist (COMPLETE)
- [x] **Implement Wishlist API**
  - [x] Get wishlist (`GET /api/wishlist`)
  - [x] Add to wishlist (`POST /api/wishlist`)
  - [x] Remove from wishlist (`DELETE /api/wishlist`)
  - [x] Check wishlist status (`GET /api/wishlist/check`)

- [x] **Create Wishlist UI**
  - [x] Wishlist button component (`src/components/tours/wishlist-button.tsx`)
  - [x] Wishlist page (`/dashboard/wishlist`)
  - [x] Wishlist hook (`src/hooks/use-wishlist.ts`)

#### Client Profile (COMPLETE)
- [x] **Implement Profile API**
  - [x] Get profile (`GET /api/client/profile`)
  - [x] Update profile (`PUT /api/client/profile`)
  - [x] Travel stats calculation

- [x] **Create Profile UI**
  - [x] Profile page (`/dashboard/profile`)
  - [x] Edit mode with form
  - [x] Travel stats display

#### Featured Tours (COMPLETE)
- [x] **Implement Featured Tours API**
  - [x] Get featured tours (`GET /api/tours/featured`)
  - [x] Featured tours component (`src/components/tours/featured-tours.tsx`)

#### Availability Calendar (COMPLETE - Jan 2026)
- [x] **Implement Availability API**
  - [x] TourAvailability model (AVAILABLE, BLOCKED, LIMITED types)
  - [x] Agent availability management (`/api/agent/tours/[tourId]/availability`)
  - [x] Public availability check (`/api/tours/[slug]/availability`)

- [x] **Create Availability UI**
  - [x] Availability calendar component (`src/components/agent/availability-calendar.tsx`)
  - [x] Agent availability page (`/agent/availability`)
  - [x] Date selection and bulk editing

#### Map-based Search (COMPLETE - Jan 2026)
- [x] **Implement Map Search**
  - [x] Add latitude/longitude to Tour model
  - [x] Filter tours by location (`hasLocation` param)
  - [x] Leaflet map integration

- [x] **Create Map UI**
  - [x] Tour map component (`src/components/tours/tour-map.tsx`)
  - [x] Map search page (`/tours/map`)
  - [x] Custom price markers
  - [x] Filter sidebar with country/type/price filters
  - [x] Map View button on tours page

#### Remaining Tasks
- [ ] **Admin reports dashboard**
- [ ] **Platform analytics**

---

## Testing Checklist

### Unit Tests
- [ ] Authentication utilities
- [ ] Pricing calculations
- [ ] Validation schemas
- [ ] Date utilities

### Integration Tests
- [ ] Registration flow
- [ ] Login flow
- [ ] Tour CRUD
- [ ] Booking flow
- [ ] Payment flow

### E2E Tests (Playwright)
- [ ] Complete booking journey
- [ ] Agent tour creation
- [ ] Admin agent management

---

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Seed data loaded
- [ ] SSL certificate configured
- [ ] Domain DNS configured

### Pesapal Setup
- [ ] Business account approved
- [ ] API credentials obtained
- [ ] IPN URL registered
- [ ] Test transactions successful

### Monitoring
- [ ] Sentry configured
- [ ] Logging configured
- [ ] Uptime monitoring set
- [ ] Error alerting enabled

---

## Progress Tracking

### Sprint Progress

| Sprint | Start | End | Status |
|--------|-------|-----|--------|
| Sprint 1-2 | Week 1 | Week 4 | [x] Complete (Jan 2026) |
| Sprint 3-4 | Week 5 | Week 8 | [x] Complete (Jan 2026) |
| Sprint 5-6 | Week 9 | Week 12 | [x] Complete (Jan 2026) |
| Sprint 7-8 | Week 13 | Week 16 | [x] Complete (Jan 2026) |
| Sprint 9-10 | Week 17 | Week 20 | [ ] Not Started |
| Sprint 11-12 | Week 21 | Week 24 | [ ] Not Started |
| Sprint 13-14 | Week 25 | Week 28 | [ ] Not Started |

### Milestone Progress

| Milestone | Target | Status |
|-----------|--------|--------|
| Alpha | Week 12 | [x] Complete (Jan 2026) |
| Beta | Week 16 | [x] Complete - MVP Features (Jan 2026) |
| v1.0 | Week 20 | [ ] In Progress |
| v1.5 | Week 28 | [ ] Not Started |

---

## Notes

- Update this document as tasks are completed
- Add blockers and notes to individual tasks as needed
- Reference the implementation guide for detailed specifications
- Link to PRs/commits when tasks are completed
