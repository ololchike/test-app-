# SafariPlus - Master Implementation Guide

## Overview

This document provides a complete, sprint-by-sprint implementation guide for SafariPlus. Developers can use this as the single source of truth for what needs to be built in each phase.

---

## Phase 1: MVP (Weeks 1-16)

### Sprint 1-2: Foundation (Weeks 1-4)

**Goal**: Set up infrastructure and authentication

#### Backend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Project setup (Next.js 15, TypeScript, ESLint, Prettier) | 3 | - |
| Database setup (PostgreSQL, Prisma schema) | 5 | [database-schema.md](./database-schema.md) |
| Authentication system (NextAuth v5) | 8 | [feature-authentication.md](./backend/feature-authentication.md) |
| Role-based access control middleware | 5 | [feature-authentication.md](./backend/feature-authentication.md) |
| Email service setup (Resend) | 3 | - |

**Database Models (Sprint 1-2)**:
- User, Account, Session, VerificationToken
- Agent (basic)

**API Endpoints (Sprint 1-2)**:
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

#### Frontend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Base UI components (shadcn/ui setup) | 8 | [frontend/README.md](./frontend/README.md) |
| Responsive layout shell (Header, Footer, MobileNav) | 5 | [frontend/pages.md](./frontend/pages.md) |
| Authentication pages (Login, Register, Forgot Password) | 5 | [frontend/pages.md](./frontend/pages.md) |

**Pages (Sprint 1-2)**:
- `/login` - Login page
- `/signup` - Registration page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/verify-email` - Email verification status

**Components (Sprint 1-2)**:
- Button, Input, Label, Card (shadcn/ui)
- Header, Footer, MobileNav
- AuthForm, PasswordInput, SocialAuthButton

#### DevOps Tasks

| Task | Story Points |
|------|--------------|
| CI/CD pipeline setup (GitHub Actions) | 3 |
| Environment configuration (dev, staging, prod) | 2 |

**Sprint 1-2 Deliverable**: Working auth system with role separation

---

### Sprint 3-4: Tour Management (Weeks 5-8)

**Goal**: Agent tour creation and client browsing

#### Backend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Tour database schema & models | 5 | [database-schema.md](./database-schema.md) |
| Tour CRUD API endpoints | 8 | [feature-tours.md](./backend/feature-tours.md) |
| Image upload integration (Cloudinary) | 5 | [feature-tours.md](./backend/feature-tours.md) |
| Search and filter implementation | 5 | [feature-tours.md](./backend/feature-tours.md) |
| Tour publishing workflow | 3 | [feature-tours.md](./backend/feature-tours.md) |

**Database Models (Sprint 3-4)**:
- Tour
- TourImage

**API Endpoints (Sprint 3-4)**:
- `GET /api/tours` - List tours with filters
- `GET /api/tours/[slug]` - Tour details
- `POST /api/tours` - Create tour (Agent)
- `PUT /api/tours/[id]` - Update tour (Agent)
- `DELETE /api/tours/[id]` - Delete tour (Agent)
- `POST /api/tours/[id]/publish` - Publish tour
- `POST /api/upload` - Image upload

#### Frontend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Tour creation form (multi-step wizard) | 8 | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) |
| Tour edit functionality | 5 | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) |
| Tour listing page (Client) | 5 | [frontend/pages.md](./frontend/pages.md) |
| Tour detail page (Client) | 5 | [frontend/pages.md](./frontend/pages.md) |
| Search and filter UI | 5 | [frontend/pages.md](./frontend/pages.md) |
| Agent tour list/management | 5 | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) |

**Pages (Sprint 3-4)**:
- `/tours` - Tour listing with filters
- `/tours/[slug]` - Tour detail page
- `/agent/tours` - Agent tour management
- `/agent/tours/create` - Tour creation wizard
- `/agent/tours/[id]/edit` - Tour editing

**Components (Sprint 3-4)**:
- TourCard, TourGallery, TourFilters
- TourForm (wizard), ItineraryBuilder
- ImageUploader, RichTextEditor
- SearchBar, FilterPanel
- TourCustomizer (state management for tour customization)
- InteractiveItinerary (per-day accommodation/addon selection)
- BookingCard (sticky price summary with real-time updates)
- FloatingBookButton (IntersectionObserver-based CTA)

**Sprint 3-4 Deliverable**: Agents can create tours; Clients can browse and customize

---

### Sprint 5-6: Booking System (Weeks 9-12)

**Goal**: End-to-end booking without payment

#### Backend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Booking database schema & models | 5 | [database-schema.md](./database-schema.md) |
| Booking CRUD API | 8 | [feature-bookings.md](./backend/feature-bookings.md) |
| Booking status management | 5 | [feature-bookings.md](./backend/feature-bookings.md) |
| Availability checking | 5 | [feature-bookings.md](./backend/feature-bookings.md) |
| Email notification setup | 5 | [feature-bookings.md](./backend/feature-bookings.md) | COMPLETE |
| Commission calculation | 5 | [feature-bookings.md](./backend/feature-bookings.md) |

**Database Models (Sprint 5-6)**:
- Booking
- Commission tracking fields on Agent

**API Endpoints (Sprint 5-6)**:
- `GET /api/bookings` - List bookings (filtered by role)
- `GET /api/bookings/[id]` - Booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/[id]/status` - Update booking status
- `GET /api/client/dashboard` - Client dashboard statistics (COMPLETE)
- `GET /api/client/bookings` - Client bookings list (COMPLETE)
- `GET /api/agent/bookings` - Agent bookings list (COMPLETE)
- `GET /api/bookings/[id]/itinerary` - PDF itinerary generation (COMPLETE)

#### Frontend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Booking flow UI (date selection, details) | 8 | [frontend/pages.md](./frontend/pages.md) |
| Booking confirmation page | 3 | [frontend/pages.md](./frontend/pages.md) |
| Agent booking management dashboard | 8 | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) | COMPLETE |
| Client booking history | 5 | [feature-client-dashboard.md](./frontend/feature-client-dashboard.md) | COMPLETE |
| Client dashboard home | 5 | [feature-client-dashboard.md](./frontend/feature-client-dashboard.md) | COMPLETE |

**Pages (Sprint 5-6)**:
- `/checkout/[bookingId]` - Checkout flow
- `/booking/confirmation/[id]` - Booking confirmation
- `/dashboard` - Client dashboard
- `/dashboard/bookings` - Client booking list
- `/dashboard/bookings/[id]` - Client booking detail
- `/agent/bookings` - Agent booking management
- `/agent/bookings/[id]` - Agent booking detail
- `/agent` - Agent dashboard home

**Components (Sprint 5-6)**:
- BookingForm, DatePicker, TravelerCounter
- BookingCard, BookingStatusBadge
- DashboardStats, BookingFilters
- OrderSummary, TravelerForm

**Sprint 5-6 Deliverable**: Complete booking flow (minus payment)

---

### Sprint 7-8: Payments & Admin (Weeks 13-16)

**Goal**: Pesapal integration and admin foundation

#### Backend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Pesapal API 3.0 integration | 13 | [feature-payments.md](./backend/feature-payments.md), [pesapal-integration.md](./pesapal-integration.md) |
| Payment webhook handling | 8 | [feature-payments.md](./backend/feature-payments.md) |
| Payment status tracking | 5 | [feature-payments.md](./backend/feature-payments.md) |
| Agent management API (Admin) | 5 | [feature-agents.md](./backend/feature-agents.md), [feature-admin.md](./backend/feature-admin.md) |
| Commission configuration (Admin) | 3 | [feature-admin.md](./backend/feature-admin.md) |
| Agent earnings tracking | 5 | [feature-agents.md](./backend/feature-agents.md) |

**Database Models (Sprint 7-8)**:
- Payment
- CommissionConfig
- PlatformSettings

**API Endpoints (Sprint 7-8)**:
- `POST /api/payments/initiate` - Start payment
- `GET /api/payments/status` - Check status
- `POST /api/webhooks/pesapal` - Payment IPN
- `GET /api/agents/[id]/earnings` - Agent earnings
- `GET /api/admin/agents` - List agents (Admin)
- `PUT /api/admin/agents/[id]/status` - Approve/suspend agent
- `GET /api/admin/stats` - Platform statistics

#### Frontend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Payment flow UI | 5 | [frontend/pages.md](./frontend/pages.md) |
| Payment method selection (M-Pesa, Card) | 3 | [frontend/pages.md](./frontend/pages.md) |
| Payment status display | 3 | [frontend/pages.md](./frontend/pages.md) |
| Agent earnings dashboard | 5 | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) |
| Admin dashboard foundation | 8 | [feature-admin-dashboard.md](./frontend/feature-admin-dashboard.md) |
| Admin agent management | 5 | [feature-admin-dashboard.md](./frontend/feature-admin-dashboard.md) |
| Admin commission configuration | 3 | [feature-admin-dashboard.md](./frontend/feature-admin-dashboard.md) |

**Pages (Sprint 7-8)**:
- `/checkout/[id]` - Enhanced with payment
- `/agent/earnings` - Earnings overview
- `/agent/profile` - Agent profile management
- `/admin` - Admin dashboard
- `/admin/agents` - Agent management
- `/admin/settings/commission` - Commission config

**Components (Sprint 7-8)**:
- PaymentMethodSelector, MPesaInput
- PaymentStatus, SecureBadges
- EarningsChart, TransactionTable
- AdminSidebar, AgentTable, StatusBadge

**Sprint 7-8 Deliverable**: Full booking + payment + admin basics

---

## Recently Completed Features (January 2026)

### PDF Itinerary Generation
**Status**: COMPLETE

**Implementation Files**:
- Template: `src/lib/pdf/itinerary-template.tsx`
- API: `src/app/api/bookings/[id]/itinerary/route.ts`

**Features**:
- Multi-page PDF document generation
- SafariPlus branded header with logo
- Booking reference and confirmation status
- Travel dates, duration, and traveler count
- Day-by-day itinerary with activities and meals
- Selected accommodations per night with pricing
- Selected add-ons and activities with pricing
- Complete pricing breakdown (base price, accommodations, add-ons, total)

### Email Confirmation with PDF
**Status**: COMPLETE

**Implementation Files**:
- Email service: `src/lib/email/index.ts`
- Payment integration: `src/app/api/payments/initiate/route.ts`

**Features**:
- Resend API integration for reliable email delivery
- Automatic email on payment completion
- PDF itinerary attached to confirmation email
- Booking details in email body

### Client Dashboard (Real Data)
**Status**: COMPLETE

**Implementation Files**:
- Dashboard page: `src/app/(dashboard)/dashboard/page.tsx`
- Bookings page: `src/app/(dashboard)/dashboard/bookings/page.tsx`
- Dashboard API: `src/app/api/client/dashboard/route.ts`
- Bookings API: `src/app/api/client/bookings/route.ts`

**Features**:
- Real statistics (total bookings, upcoming trips, completed trips)
- Upcoming bookings display
- Booking history with filters (status, search)
- PDF itinerary download from booking details
- Responsive mobile-first design

### Agent Dashboard & Booking Management (Real Data)
**Status**: COMPLETE

**Implementation Files**:
- Dashboard page: `src/app/(agent)/agent/dashboard/page.tsx`
- Bookings page: `src/app/(agent)/agent/bookings/page.tsx`
- Bookings API: `src/app/api/agent/bookings/route.ts`

**Features**:
- Real revenue metrics and statistics
- Booking counts (today, this week, this month, pending)
- Tour performance overview
- Full booking list with search and filters
- Status filtering (All, Pending, Confirmed, Completed, Cancelled)
- Booking details with client information
- Pagination support

---

## Phase 1 MVP Completion Checklist

### Functional Requirements
- [ ] Users can register as Client or Agent
- [ ] Email verification working
- [ ] Agents can create/edit/delete tours
- [ ] Tours display with images and details
- [ ] Search and filter tours by destination, price, duration
- [ ] Clients can book tours with date selection
- [ ] Pesapal payment processing functional (M-Pesa + Cards)
- [x] Agents see bookings and payment status (COMPLETE - `/agent/bookings`)
- [x] Clients see booking history (COMPLETE - `/dashboard/bookings`)
- [ ] Admin can manage agents
- [ ] Commission tracking operational
- [ ] Mobile responsive on all pages
- [x] PDF itinerary generation (COMPLETE - `/api/bookings/[id]/itinerary`)
- [x] Email confirmation with PDF attachment (COMPLETE - via Resend API)

### Non-Functional Requirements
- [ ] Performance: <3s page loads on 3G
- [ ] Security: All endpoints authenticated
- [ ] Testing: Core flows have test coverage
- [ ] Monitoring: Error tracking (Sentry)

---

## Phase 2: Growth Features (Weeks 17-28)

### Sprint 9-10: Communication & Reviews (Weeks 17-20)

#### Backend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Pusher setup (real-time) | 5 | [feature-messaging.md](./backend/feature-messaging.md) |
| Messaging API | 8 | [feature-messaging.md](./backend/feature-messaging.md) |
| Conversation management | 5 | [feature-messaging.md](./backend/feature-messaging.md) |
| Review submission API | 5 | [feature-reviews.md](./backend/feature-reviews.md) |
| Review moderation | 3 | [feature-reviews.md](./backend/feature-reviews.md) |
| Agent review response | 3 | [feature-reviews.md](./backend/feature-reviews.md) |
| Email notification templates | 5 | - |

**Database Models (Sprint 9-10)**:
- Conversation
- Message
- Review

**API Endpoints (Sprint 9-10)**:
- `GET /api/messages/conversations` - List conversations
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `POST /api/reviews` - Submit review
- `PUT /api/reviews/[id]` - Update review
- `POST /api/reviews/[id]/response` - Agent response

#### Frontend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Chat UI | 8 | - |
| Real-time message updates | 5 | - |
| Conversation list | 3 | - |
| Review submission form | 3 | - |
| Review display on tours | 3 | - |
| Review rating breakdown | 2 | - |
| Notification system | 5 | - |

**Pages (Sprint 9-10)**:
- `/dashboard/messages` - Client messages
- `/agent/messages` - Agent messages
- `/dashboard/bookings/[id]` - Add review button

**Sprint 9-10 Deliverable**: Real-time messaging and review system

---

### Sprint 11-12: Enhanced Agent Tools (Weeks 21-24)

#### Backend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Withdrawal system API | 8 | [feature-withdrawals.md](./backend/feature-withdrawals.md) |
| Withdrawal approval workflow | 5 | [feature-withdrawals.md](./backend/feature-withdrawals.md) |
| Agent analytics API | 5 | - |
| Availability calendar API | 5 | - |
| Itinerary builder enhancement | 3 | - |

**Database Models (Sprint 11-12)**:
- Withdrawal

**API Endpoints (Sprint 11-12)**:
- `GET /api/withdrawals` - Agent withdrawals
- `POST /api/withdrawals` - Request withdrawal
- `GET /api/admin/withdrawals` - All withdrawals (Admin)
- `POST /api/admin/withdrawals/[id]/approve` - Approve
- `POST /api/admin/withdrawals/[id]/reject` - Reject

#### Frontend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Withdrawal request modal | 3 | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) |
| Withdrawal history | 3 | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) |
| Admin withdrawal management | 5 | [feature-admin-dashboard.md](./frontend/feature-admin-dashboard.md) |
| Agent analytics charts | 8 | - |
| Availability calendar UI | 5 | - |

**Pages (Sprint 11-12)**:
- `/agent/earnings` - Enhanced with withdrawals
- `/admin/withdrawals` - Withdrawal management

**Sprint 11-12 Deliverable**: Withdrawal system and enhanced agent tools

---

### Sprint 13-14: Discovery & Profiles (Weeks 25-28)

#### Backend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Advanced search (location, filters) | 8 | - |
| Client profile API | 5 | - |
| Wishlists API | 3 | - |
| Featured tours system | 3 | - |
| Platform analytics API | 8 | [feature-admin.md](./backend/feature-admin.md) |

**API Endpoints (Sprint 13-14)**:
- `GET /api/tours/search` - Advanced search
- `GET /api/users/me` - Profile
- `PUT /api/users/me` - Update profile
- `GET /api/wishlist` - Wishlists
- `POST /api/wishlist` - Add to wishlist
- `GET /api/admin/reports` - Platform reports

#### Frontend Tasks

| Task | Story Points | Documentation |
|------|--------------|---------------|
| Map-based search | 8 | - |
| Advanced filter panel | 5 | - |
| Client profile page | 5 | [feature-client-dashboard.md](./frontend/feature-client-dashboard.md) |
| Wishlist UI | 3 | - |
| Admin reports dashboard | 8 | [feature-admin-dashboard.md](./frontend/feature-admin-dashboard.md) |

**Pages (Sprint 13-14)**:
- `/tours` - Enhanced with map view
- `/dashboard/profile` - Full profile page
- `/dashboard/wishlist` - Saved tours
- `/admin/reports` - Reports dashboard

**Sprint 13-14 Deliverable**: Advanced discovery and comprehensive analytics

---

## Phase 2 Completion Checklist

- [ ] Clients and Agents can message in real-time
- [ ] Clients can leave verified reviews
- [ ] Agents can build detailed itineraries
- [ ] Agents can request withdrawals
- [ ] Admin can approve/reject withdrawals
- [ ] Map-based tour search available
- [ ] Featured tour placements working
- [ ] Comprehensive analytics for all roles

---

## Phase 3: Scale & Expansion (Weeks 29-40)

### Sprint 15-16: Mobile Foundation (Weeks 29-32)

- React Native project setup
- Mobile authentication
- Mobile tour browsing
- Mobile booking flow

### Sprint 17-18: Mobile Agent & Advanced (Weeks 33-36)

- Mobile agent dashboard
- Offline capabilities
- Push notifications

### Sprint 19-20: Intelligence & Expansion (Weeks 37-40)

- AI recommendations
- Multi-language support
- Multi-country expansion
- Group booking

---

## Cross-Reference: Documentation Index

### Backend Feature Specs
| Feature | Document | Sprint |
|---------|----------|--------|
| Authentication | [feature-authentication.md](./backend/feature-authentication.md) | 1-2 |
| Tours | [feature-tours.md](./backend/feature-tours.md) | 3-4 |
| Bookings | [feature-bookings.md](./backend/feature-bookings.md) | 5-6 |
| Payments | [feature-payments.md](./backend/feature-payments.md) | 7-8 |
| Agents | [feature-agents.md](./backend/feature-agents.md) | 7-8 |
| Admin | [feature-admin.md](./backend/feature-admin.md) | 7-8 |
| Reviews | [feature-reviews.md](./backend/feature-reviews.md) | 9-10 |
| Messaging | [feature-messaging.md](./backend/feature-messaging.md) | 9-10 |
| Withdrawals | [feature-withdrawals.md](./backend/feature-withdrawals.md) | 11-12 |

### Frontend Feature Specs
| Feature | Document | Sprint |
|---------|----------|--------|
| Page Structure | [frontend/pages.md](./frontend/pages.md) | All |
| Client Dashboard | [feature-client-dashboard.md](./frontend/feature-client-dashboard.md) | 5-6 |
| Agent Dashboard | [feature-agent-dashboard.md](./frontend/feature-agent-dashboard.md) | 3-8 |
| Admin Dashboard | [feature-admin-dashboard.md](./frontend/feature-admin-dashboard.md) | 7-8 |
| Package Configurator | [feature-package-configurator.md](./frontend/feature-package-configurator.md) | 3-4 |

### Core Documents
| Document | Description |
|----------|-------------|
| [overview.md](./overview.md) | Business overview and market analysis |
| [roadmap.md](./roadmap.md) | Product roadmap with MoSCoW prioritization |
| [database-schema.md](./database-schema.md) | Complete Prisma schema |
| [technical-architecture.md](./technical-architecture.md) | System architecture |
| [pesapal-integration.md](./pesapal-integration.md) | Payment integration guide |

### Package Builder Feature Docs
| Feature | Document | Sprint |
|---------|----------|--------|
| Package Builder Overview | [features/package-builder.md](./features/package-builder.md) | 3-4 |
| Dynamic Pricing | [features/dynamic-pricing.md](./features/dynamic-pricing.md) | 3-4 |
| Accommodation System | [features/accommodation-system.md](./features/accommodation-system.md) | 3-4 |
| Activities & Add-ons | [features/activities-addons.md](./features/activities-addons.md) | 3-4 |

---

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Pesapal
PESAPAL_CONSUMER_KEY=your_key
PESAPAL_CONSUMER_SECRET=your_secret
PESAPAL_API_URL=https://pay.pesapal.com/v3
PESAPAL_IPN_ID=your_ipn_id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# Email
RESEND_API_KEY=your_key

# Pusher (Phase 2)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# Monitoring
SENTRY_DSN=your_dsn
```

---

## Getting Started Checklist

### Project Setup
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Set up PostgreSQL database
- [ ] Configure environment variables
- [ ] Run database migrations (`npx prisma migrate dev`)
- [ ] Seed initial data (`npx prisma db seed`)
- [ ] Start development server (`npm run dev`)

### Third-Party Setup
- [ ] Create Pesapal business account
- [ ] Configure Cloudinary account
- [ ] Set up Resend email account
- [ ] Configure Google OAuth (optional)
- [ ] Set up Sentry for monitoring

---

## Success Criteria

| Release | Date | Key Features | Success Metrics |
|---------|------|--------------|-----------------|
| Alpha | Week 12 | Core booking (no payment) | 10 internal testers |
| Beta | Week 16 | Full MVP with payments | 25 agents, 100 bookings |
| v1.0 | Week 20 | MVP + messaging + reviews | 50 agents, 300 bookings |
| v1.5 | Week 28 | Phase 2 complete | 100 agents, 600 bookings |
| v2.0 | Week 40 | Phase 3 complete | Mobile apps live |
