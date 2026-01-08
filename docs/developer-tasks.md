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

- [ ] **Implement email verification**
  - [ ] Set up Resend email service
  - [ ] Create verification token generation
  - [ ] Send verification email on registration
  - [ ] Create verification endpoint
  - [ ] Update emailVerified on success

- [ ] **Implement password reset**
  - [ ] Create forgot password endpoint
  - [ ] Generate time-limited reset token
  - [ ] Send reset email with link
  - [ ] Create reset password endpoint
  - [ ] Validate token and update password

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

- [ ] **Create Forgot Password page** (`/forgot-password`)
  - [ ] Email input
  - [ ] Submit button
  - [ ] Success state
  - [ ] Back to login link

- [ ] **Create Reset Password page** (`/reset-password`)
  - [ ] New password input
  - [ ] Confirm password input
  - [ ] Submit button
  - [ ] Token validation
  - [ ] Redirect to login on success

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

- [ ] **Create Checkout page** (`/checkout/[bookingId]`)
  - [ ] Order summary sidebar
  - [ ] Traveler details form (lead traveler)
  - [ ] Additional travelers form (expandable)
  - [ ] Special requests textarea
  - [ ] Payment method placeholder
  - [ ] Terms acceptance
  - [ ] Submit button
  - [ ] Mobile responsive layout

- [ ] **Create Booking confirmation page** (`/booking/confirmation/[id]`)
  - [ ] Success animation/icon
  - [ ] Booking reference number
  - [ ] What happens next steps
  - [ ] Booking summary card
  - [ ] Download PDF button (placeholder)
  - [ ] Add to calendar button
  - [ ] Continue browsing CTA

- [x] **Create Client Dashboard** (`/dashboard`)
  - [x] Welcome message
  - [x] Stats cards (total, upcoming, completed)
  - [x] Next trip highlight card
  - [x] Recent bookings list
  - [x] Recommended tours
  - [x] Quick actions

- [ ] **Create My Bookings page** (`/dashboard/bookings`)
  - [ ] Status filter tabs
  - [ ] Search input
  - [ ] Booking cards list
  - [ ] Empty state per tab
  - [ ] Load more/pagination

- [ ] **Create Booking detail page** (`/dashboard/bookings/[id]`)
  - [ ] Status banner
  - [ ] Booking reference
  - [ ] Tour summary card
  - [ ] Travel details section
  - [ ] Payment details section
  - [ ] Operator contact card
  - [ ] Actions (Download, Cancel)
  - [ ] Cancellation policy

- [x] **Create Agent Dashboard** (`/agent`)
  - [x] Welcome message
  - [x] Stats cards (earnings, bookings, rating)
  - [x] Earnings chart placeholder
  - [x] Recent bookings table
  - [x] Activity feed
  - [x] Quick actions

- [ ] **Create Agent Bookings page** (`/agent/bookings`)
  - [ ] Stats bar
  - [ ] Filter controls
  - [ ] Bookings data table
  - [ ] Actions column
  - [ ] Export button
  - [ ] Pagination

- [ ] **Create Agent Booking detail** (`/agent/bookings/[id]`)
  - [ ] Booking header with status
  - [ ] Client information card
  - [ ] Traveler details list
  - [ ] Payment breakdown
  - [ ] Status update dropdown
  - [ ] Internal notes section
  - [ ] Action buttons

---

### Sprint 7-8: Payments & Admin (Weeks 13-16)

#### Payment Backend

- [ ] **Create Payment database model**
  - [ ] Add all required fields
  - [ ] Set up unique indexes
  - [ ] Run migration

- [ ] **Implement Pesapal client class**
  - [ ] Token management with caching
  - [ ] Submit order method
  - [ ] Get transaction status method
  - [ ] IPN signature verification

- [ ] **Implement Payment initiation** (`POST /api/payments/initiate`)
  - [ ] Verify client authentication
  - [ ] Verify booking ownership
  - [ ] Check no existing payment
  - [ ] Validate payment method
  - [ ] Generate merchant reference
  - [ ] Submit to Pesapal
  - [ ] Create/update payment record
  - [ ] Return redirect URL

- [ ] **Implement Pesapal webhook** (`POST /api/webhooks/pesapal`)
  - [ ] Parse IPN payload
  - [ ] Get transaction status from Pesapal
  - [ ] Find payment by order ID
  - [ ] Update payment status
  - [ ] Update booking to CONFIRMED
  - [ ] Update agent pending balance
  - [ ] Increment tour booking count
  - [ ] Send confirmation email
  - [ ] Handle idempotency

- [ ] **Implement Payment status check** (`GET /api/payments/status`)
  - [ ] Verify access
  - [ ] Return current status
  - [ ] Poll Pesapal if PROCESSING

#### Agent & Admin Backend

- [ ] **Implement Agent profile API** (`GET/PUT /api/agents/[id]`)
  - [ ] Get agent profile
  - [ ] Update profile (verify ownership)
  - [ ] Calculate profile completion

- [ ] **Implement Agent earnings API** (`GET /api/agents/[id]/earnings`)
  - [ ] Verify ownership
  - [ ] Return balance summary
  - [ ] Return monthly breakdown
  - [ ] Return recent transactions

- [ ] **Implement Admin agents list** (`GET /api/admin/agents`)
  - [ ] Verify admin role
  - [ ] Filter by status
  - [ ] Search by name/email
  - [ ] Return with counts
  - [ ] Paginate

- [ ] **Implement Agent status update** (`PUT /api/admin/agents/[id]/status`)
  - [ ] Verify admin role
  - [ ] Approve agent
  - [ ] Suspend agent (unpublish tours)
  - [ ] Send notification email
  - [ ] Create audit log

- [ ] **Implement Commission rate update** (`PUT /api/admin/agents/[id]/commission`)
  - [ ] Verify admin role
  - [ ] Update commission rate
  - [ ] Create audit log

- [ ] **Implement Admin dashboard stats** (`GET /api/admin/stats`)
  - [ ] Revenue metrics
  - [ ] Booking counts
  - [ ] User counts
  - [ ] Pending actions

- [ ] **Implement Commission config** (`GET/POST /api/admin/commission`)
  - [ ] List commission tiers
  - [ ] Create/update tier

#### Payment & Admin Frontend

- [ ] **Enhance Checkout with payment**
  - [ ] Payment method selector
  - [ ] M-Pesa phone number input
  - [ ] Card payment redirect info
  - [ ] Submit and redirect flow
  - [ ] Payment processing state

- [ ] **Create payment status display**
  - [ ] Processing indicator
  - [ ] Success state
  - [ ] Failure state with retry

- [ ] **Create Agent Earnings page** (`/agent/earnings`)
  - [ ] Balance cards (available, pending)
  - [ ] Commission rate display
  - [ ] Earnings chart
  - [ ] Transaction table
  - [ ] Withdrawal history (placeholder)

- [ ] **Create Agent Profile page** (`/agent/profile`)
  - [ ] Profile completion bar
  - [ ] Business information form
  - [ ] Contact information form
  - [ ] Payment details form
  - [ ] Save changes button

- [x] **Create Admin Dashboard** (`/admin`)
  - [x] Stats grid
  - [x] Revenue chart placeholder
  - [x] Pending actions cards
  - [x] Activity feed

- [ ] **Create Admin Agents page** (`/admin/agents`)
  - [ ] Stats bar
  - [ ] Filters
  - [ ] Agents data table
  - [ ] Action menu
  - [ ] Approval modal
  - [ ] Suspension modal

- [ ] **Create Admin Commission page** (`/admin/settings/commission`)
  - [ ] Current tiers table
  - [ ] Edit tier modal
  - [ ] Add tier button
  - [ ] Commission history
  - [ ] Summary stats

---

## Phase 2: Growth Features

### Sprint 9-10: Communication & Reviews

#### Messaging

- [ ] **Set up Pusher**
  - [ ] Create Pusher account
  - [ ] Configure environment variables
  - [ ] Create server client
  - [ ] Create browser client
  - [ ] Set up authentication endpoint

- [ ] **Implement Conversations API**
  - [ ] List conversations
  - [ ] Create/get conversation
  - [ ] Get messages with pagination
  - [ ] Send message
  - [ ] Mark as read
  - [ ] Real-time broadcast

- [ ] **Create Chat UI**
  - [ ] Conversation list
  - [ ] Message thread
  - [ ] Message input
  - [ ] Real-time updates
  - [ ] Read receipts
  - [ ] Unread badge

#### Reviews

- [ ] **Implement Reviews API**
  - [ ] Submit review (verified booking)
  - [ ] Update review (7 day window)
  - [ ] Agent response
  - [ ] List reviews
  - [ ] Rating calculation

- [ ] **Create Review components**
  - [ ] Review form
  - [ ] Star rating input
  - [ ] Review card
  - [ ] Rating breakdown chart
  - [ ] Agent response section

---

### Sprint 11-12: Enhanced Agent Tools

#### Withdrawals

- [ ] **Implement Withdrawal API**
  - [ ] Create withdrawal request
  - [ ] List withdrawals
  - [ ] Admin approve
  - [ ] Admin reject
  - [ ] Statistics

- [ ] **Create Withdrawal UI**
  - [ ] Request modal
  - [ ] Withdrawal history
  - [ ] Admin management page
  - [ ] Approval/Rejection modals

---

### Sprint 13-14: Discovery & Profiles

- [ ] **Advanced search features**
- [ ] **Map-based search**
- [ ] **Client profile page**
- [ ] **Wishlist feature**
- [ ] **Admin reports**

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
| Sprint 1-2 | Week 1 | Week 4 | [ ] Not Started |
| Sprint 3-4 | Week 5 | Week 8 | [ ] Not Started |
| Sprint 5-6 | Week 9 | Week 12 | [ ] Not Started |
| Sprint 7-8 | Week 13 | Week 16 | [ ] Not Started |
| Sprint 9-10 | Week 17 | Week 20 | [ ] Not Started |
| Sprint 11-12 | Week 21 | Week 24 | [ ] Not Started |
| Sprint 13-14 | Week 25 | Week 28 | [ ] Not Started |

### Milestone Progress

| Milestone | Target | Status |
|-----------|--------|--------|
| Alpha | Week 12 | [ ] Not Started |
| Beta | Week 16 | [ ] Not Started |
| v1.0 | Week 20 | [ ] Not Started |
| v1.5 | Week 28 | [ ] Not Started |

---

## Notes

- Update this document as tasks are completed
- Add blockers and notes to individual tasks as needed
- Reference the implementation guide for detailed specifications
- Link to PRs/commits when tasks are completed
