# SafariPlus - Complete Page Structure (MVP)

## Overview

This document defines the complete page structure for the SafariPlus MVP. All pages are designed following mobile-first principles optimized for the East African market.

---

## PUBLIC PAGES (No Login Required)

### 1. Home Page
**Route**: `/`

**Sections**:
- Hero banner with background image/video
- Featured tours carousel
- Search bar (destination, dates, travelers)
- Why Choose SafariPlus (trust signals)
- Testimonials/Reviews slider
- Popular destinations grid
- How it works (3-step guide)
- Become an Agent CTA banner
- Footer with links and contact info

**Components Used**: Hero, SearchBar, TourCard, TestimonialCard, DestinationCard, ProcessSteps, CTABanner, Footer

---

### 2. About Us
**Route**: `/about`

**Sections**:
- Company story and founding narrative
- Mission and vision statements
- Team section with photos and bios
- Why SafariPlus (differentiators)
- Company statistics (tours, agents, travelers)
- Partners and affiliations

**Components Used**: PageHeader, TeamCard, StatCard, ContentSection

---

### 3. Tours/Packages (Browse All Tours)
**Route**: `/tours`

**Sections**:
- Search bar (persistent)
- Filter panel (sidebar on desktop, sheet on mobile)
  - Price range slider
  - Location/Destination dropdown
  - Duration filter (1-3 days, 4-7 days, 8+ days)
  - Tour type (Safari, Beach, Mountain, Cultural, etc.)
  - Sort options (Featured, Price, Rating, Newest)
- Results count and active filters
- Tour cards grid (responsive)
- Pagination or infinite scroll
- No results state with suggestions

**Components Used**: SearchBar, TourFilters, TourCard, Pagination, EmptyState

---

### 4. Tour Details (Single Tour Page)
**Route**: `/tours/[slug]`

**Sections**:
- Photo gallery (swipeable carousel on mobile)
- Tour title, rating, and review count
- Location with map preview
- Quick info badges (duration, group size, difficulty)
- Pricing breakdown (per person, group discounts)
- Sticky booking bar (mobile: bottom fixed, desktop: sidebar)
- Tab navigation:
  - Overview (description, highlights)
  - Day-by-Day Itinerary (collapsible)
  - Inclusions & Exclusions (clear lists)
  - Reviews (with rating breakdown)
- Operator/Agent info card with verification badge
- WhatsApp contact button
- Book Now button
- Similar tours section

**Components Used**: TourGallery, TourInfo, ItineraryAccordion, BookingWidget, AgentCard, ReviewSection, TourCard

---

### 5. Contact Us
**Route**: `/contact`

**Sections**:
- Contact form (name, email, subject, message)
- Phone number with click-to-call
- Email address with mailto link
- WhatsApp contact with deep link
- Office location with embedded Google Map
- Business hours
- Social media links

**Components Used**: ContactForm, ContactCard, MapEmbed

---

### 6. FAQs
**Route**: `/faqs`

**Sections**:
- Search/filter FAQs
- Category tabs (Booking, Payments, Cancellations, Tours, Agents)
- Accordion-style Q&A list
- Still have questions CTA to contact

**Categories**:
- **Booking**: How to book, group bookings, special requests
- **Payments**: Accepted methods, M-Pesa process, refunds
- **Cancellations**: Cancellation policy, refund timeline
- **Tours**: What to expect, what to bring, safety
- **For Agents**: Commission, payouts, tour management

**Components Used**: FAQAccordion, CategoryTabs, SearchInput

---

### 7. How It Works
**Route**: `/how-it-works`

**Sections**:
- Step-by-step visual guide for travelers:
  1. Browse and Search Tours
  2. Select Your Perfect Safari
  3. Book and Pay Securely
  4. Enjoy Your Adventure
- Benefits for each step
- Video tutorial (optional)
- CTA to start browsing

**Components Used**: ProcessSteps, IllustrationCard, CTAButton

---

### 8. Become an Agent
**Route**: `/become-agent`

**Sections**:
- Hero with value proposition for operators
- Benefits of joining (reach, tools, payments)
- How it works for agents (4-step process)
- Commission structure overview
- Success stories/testimonials from agents
- Requirements to join
- Application CTA button leading to signup
- Contact for partnership inquiries

**Components Used**: Hero, BenefitCard, TestimonialCard, RequirementsList, CTAButton

---

### 9. Terms & Conditions
**Route**: `/terms`

**Sections**:
- Table of contents with anchor links
- Legal terms organized by section:
  - General Terms
  - User Accounts
  - Booking Terms
  - Payment Terms
  - Cancellation Policy
  - Agent Terms
  - Liability
  - Dispute Resolution
  - Privacy References
- Last updated date
- Contact for legal inquiries

**Components Used**: LegalContent, TableOfContents

---

### 10. Privacy Policy
**Route**: `/privacy`

**Sections**:
- Table of contents
- Privacy policy sections:
  - Information We Collect
  - How We Use Information
  - Data Sharing & Third Parties
  - Cookies and Tracking
  - Data Security
  - User Rights (GDPR/POPIA compliance)
  - Children's Privacy
  - Policy Updates
  - Contact Information
- Last updated date

**Components Used**: LegalContent, TableOfContents

---

### 11. Login / Signup (Authentication Pages)
**Routes**: `/login`, `/signup`, `/forgot-password`, `/reset-password`

**Login Page** (`/login`):
- Email input
- Password input with show/hide toggle
- Remember me checkbox
- Forgot password link
- Login button
- Google OAuth button
- Signup link for new users
- Agent login tab/toggle

**Signup Page** (`/signup`):
- Account type selector (Client / Agent)
- Full name input
- Email input
- Phone number input (with country code)
- Password input with strength indicator
- Confirm password input
- Terms acceptance checkbox
- Signup button
- Google OAuth button
- Login link for existing users

**Forgot Password** (`/forgot-password`):
- Email input
- Submit button
- Back to login link

**Reset Password** (`/reset-password`):
- New password input
- Confirm password input
- Submit button

**Components Used**: AuthForm, SocialAuthButton, PasswordInput, AccountTypeSelector

---

## CLIENT PAGES (Login Required)

**Layout**: Client dashboard layout with header and mobile bottom nav

### 1. My Dashboard
**Route**: `/dashboard`

**Sections**:
- Welcome message with user name
- Quick stats cards:
  - Total bookings
  - Upcoming trips
  - Completed trips
- Upcoming booking highlight (next trip)
- Recent bookings list (3-5 items)
- Quick actions (Browse Tours, View Bookings)
- Recommended tours based on history

**Components Used**: StatsCard, BookingCard, TourCard, QuickActions

---

### 2. My Bookings
**Route**: `/dashboard/bookings`

**Sections**:
- Status filter tabs (All, Upcoming, Completed, Cancelled)
- Search bookings input
- Bookings list with:
  - Tour thumbnail
  - Tour name
  - Travel date
  - Status badge
  - Price paid
  - Action button (View Details)
- Empty state for no bookings
- Pagination

**Components Used**: BookingCard, StatusTabs, SearchInput, EmptyState, Pagination

---

### 3. Booking Details
**Route**: `/dashboard/bookings/[id]`

**Sections**:
- Booking reference number
- Status banner (Confirmed, Pending Payment, Cancelled)
- Tour summary card (image, name, dates, travelers)
- Payment status section:
  - Amount paid
  - Payment method
  - Transaction reference
  - Payment date
- Itinerary preview (collapsible)
- Agent contact information:
  - Agent name and company
  - Phone number
  - WhatsApp button
  - Email
- Actions:
  - Download itinerary PDF
  - Cancel booking (if eligible)
  - Contact support
- Cancellation policy reminder

**Components Used**: BookingStatus, TourSummary, PaymentDetails, AgentContact, ActionButtons

---

### 4. My Profile
**Route**: `/dashboard/profile`

**Sections**:
- Profile photo upload
- Personal information form:
  - Full name
  - Email (read-only if OAuth)
  - Phone number
  - Nationality
  - Date of birth
- Password change section:
  - Current password
  - New password
  - Confirm new password
- Notification preferences:
  - Email notifications toggle
  - SMS notifications toggle
- Delete account option (with confirmation)
- Save changes button

**Components Used**: ProfileForm, PasswordChangeForm, NotificationSettings, ImageUpload

---

### 5. Checkout
**Route**: `/checkout/[bookingId]`

**Sections**:
- Order summary sidebar:
  - Tour details
  - Selected date
  - Number of travelers
  - Price breakdown
  - Total amount
- Traveler details form (for each traveler):
  - Full name
  - Email
  - Phone
  - Special requirements
- Payment method selection:
  - M-Pesa (phone number input)
  - Card payment (Pesapal hosted)
  - Airtel Money
- Promo code input
- Terms acceptance checkbox
- Pay Now button
- Secure payment badges
- Cancellation policy summary

**Components Used**: OrderSummary, TravelerForm, PaymentMethodSelector, PromoCodeInput, SecureBadges

---

### 6. Booking Confirmation
**Route**: `/booking/confirmation/[id]`

**Sections**:
- Success animation/icon
- Booking confirmed message
- Booking reference number (copyable)
- What happens next steps:
  1. Confirmation email sent
  2. Agent will contact you
  3. Prepare for your trip
- Booking summary card
- Download confirmation PDF
- Add to calendar button
- Share booking button
- Continue browsing CTA

**Components Used**: SuccessState, BookingSummary, NextSteps, ActionButtons

---

## AGENT PAGES (Agent Login Required)

**Layout**: Agent dashboard layout with sidebar navigation

### 1. Agent Dashboard
**Route**: `/agent`

**Sections**:
- Welcome message with company name
- Stats overview cards:
  - Total earnings (this month)
  - Total bookings (this month)
  - Active tours count
  - Average rating
- Earnings chart (last 6 months)
- Recent bookings list (5 items)
- Recent activity feed
- Quick actions:
  - Create New Tour
  - Request Withdrawal
  - View All Bookings

**Components Used**: StatsCard, EarningsChart, BookingCard, ActivityFeed, QuickActions

---

### 2. My Tours
**Route**: `/agent/tours`

**Sections**:
- Add New Tour button (primary CTA)
- Status filter tabs (All, Published, Draft, Inactive)
- Search tours input
- Tours list/grid with:
  - Tour thumbnail
  - Tour name
  - Price
  - Status badge
  - Views count
  - Bookings count
  - Rating
  - Actions (Edit, View, Duplicate, Delete)
- Empty state for no tours
- Pagination

**Components Used**: TourManagementCard, StatusTabs, SearchInput, EmptyState

---

### 3. Create Tour
**Route**: `/agent/tours/create`

**Sections**: Multi-step form wizard

**Step 1 - Basic Details**:
- Tour title
- Description (rich text editor)
- Destination/Location
- Tour type/category
- Duration (days/nights)
- Group size (min/max)
- Difficulty level

**Step 2 - Itinerary**:
- Day-by-day builder
- Add activities per day
- Accommodation details per night
- Meals included per day

**Step 3 - Photos**:
- Cover image upload
- Gallery images upload (drag and drop)
- Image reordering
- Alt text for images

**Step 4 - Pricing**:
- Base price per person
- Group discounts (optional)
- Seasonal pricing (optional)
- What's included list
- What's excluded list

**Step 5 - Review & Publish**:
- Preview of complete tour
- Publish or Save as Draft
- Terms acceptance

**Components Used**: FormWizard, RichTextEditor, ItineraryBuilder, ImageUploader, PricingForm, TourPreview

---

### 4. Edit Tour
**Route**: `/agent/tours/[id]/edit`

**Sections**:
- Same as Create Tour but pre-populated
- Additional options:
  - Unpublish tour
  - Duplicate tour
  - Delete tour (with confirmation)
- Change history/audit log

**Components Used**: Same as Create Tour + ChangeLog

---

### 5. Bookings (Agent View)
**Route**: `/agent/bookings`

**Sections**:
- Stats summary (Today's bookings, Pending, Confirmed)
- Filter options:
  - Status (All, Pending, Confirmed, Completed, Cancelled)
  - Date range
  - Tour filter
- Bookings table/list:
  - Booking reference
  - Client name
  - Tour name
  - Travel date
  - Travelers count
  - Total amount
  - Payment status
  - Booking status
  - Actions (View, Update Status)
- Export to CSV button
- Pagination

**Components Used**: StatsBar, BookingFilters, BookingTable, ExportButton, Pagination

---

### 6. Booking Details (Agent View)
**Route**: `/agent/bookings/[id]`

**Sections**:
- Booking reference and status
- Client information:
  - Full name
  - Email
  - Phone number
  - WhatsApp button
  - Special requests
- Tour details summary
- Traveler details (all travelers)
- Payment information:
  - Amount
  - Commission deducted
  - Net amount
  - Payment status
  - Transaction reference
- Status management:
  - Update booking status dropdown
  - Add internal notes
- Action buttons:
  - Contact client
  - Send reminder
  - Cancel booking (if applicable)

**Components Used**: BookingHeader, ClientInfo, TravelersList, PaymentBreakdown, StatusUpdater, NotesSection

---

### 7. My Earnings
**Route**: `/agent/earnings`

**Sections**:
- Earnings overview cards:
  - Total earnings (all time)
  - This month earnings
  - Pending clearance
  - Available for withdrawal
- Earnings chart (monthly trend)
- Revenue breakdown:
  - Gross bookings
  - Platform commission
  - Net earnings
- Commission rate display
- Recent transactions list:
  - Date
  - Booking reference
  - Gross amount
  - Commission
  - Net amount
- Withdrawal history:
  - Date requested
  - Amount
  - Status
  - Date processed
- Request Withdrawal button (opens modal)
  - Amount input (max: available balance)
  - Payment method (M-Pesa/Bank)
  - Account details
  - Submit request

**Components Used**: EarningsCard, EarningsChart, TransactionTable, WithdrawalHistory, WithdrawalModal

---

### 8. My Profile (Agent)
**Route**: `/agent/profile`

**Sections**:
- Profile completion progress bar
- Business Information:
  - Company/Business name
  - Registration number
  - Business type
  - Logo upload
  - Business description
- Contact Information:
  - Contact person name
  - Email
  - Phone number
  - WhatsApp number
  - Physical address
- Verification Documents:
  - Business registration certificate
  - Tourism license
  - ID document
  - Upload status and verification status
- Payment Details:
  - Preferred payment method
  - M-Pesa details (phone number)
  - Bank details (bank name, account number, branch)
- Account Settings:
  - Change password
  - Notification preferences
- Save changes button

**Components Used**: ProfileProgress, BusinessForm, DocumentUploader, PaymentDetailsForm, AccountSettings

---

## ADMIN PAGES (Admin Login Required)

**Layout**: Admin dashboard layout with collapsible sidebar

### 1. Admin Dashboard
**Route**: `/admin`

**Sections**:
- Platform overview stats cards:
  - Total revenue (this month)
  - Total bookings (this month)
  - Active users count
  - Active agents count
  - Pending agent approvals
  - Pending withdrawals
- Revenue chart (last 12 months)
- Bookings trend chart
- Recent activity feed
- Alerts/Notifications:
  - New agent applications
  - Withdrawal requests
  - Reported issues
- Quick actions

**Components Used**: StatsCard, RevenueChart, BookingsChart, ActivityFeed, AlertsList

---

### 2. Manage Agents
**Route**: `/admin/agents`

**Sections**:
- Stats bar (Total, Active, Pending, Suspended)
- Filter options:
  - Status (All, Active, Pending Approval, Suspended)
  - Search by name/email
  - Date joined range
- Agents table:
  - Agent ID
  - Company name
  - Contact email
  - Phone
  - Status badge
  - Tours count
  - Bookings count
  - Total earnings
  - Date joined
  - Actions
- Actions per agent:
  - View details
  - Approve (for pending)
  - Suspend/Activate
  - Reset password
  - Delete
- Bulk actions
- Export to CSV
- Pagination

**Agent Detail Modal/Page**:
- Full profile view
- Verification documents viewer
- Tour listings
- Booking history
- Earnings summary
- Activity log
- Admin notes

**Components Used**: StatsBar, AgentFilters, AgentTable, AgentDetailModal, BulkActions

---

### 3. Manage Clients
**Route**: `/admin/clients`

**Sections**:
- Stats bar (Total, Active, New this month)
- Search and filter:
  - Search by name/email
  - Status filter
  - Date joined range
- Clients table:
  - Client ID
  - Full name
  - Email
  - Phone
  - Bookings count
  - Total spent
  - Date joined
  - Last active
  - Actions
- Actions per client:
  - View profile
  - View bookings
  - Reset password
  - Suspend/Activate
- Export to CSV
- Pagination

**Components Used**: StatsBar, ClientFilters, ClientTable, ClientDetailModal

---

### 4. All Bookings
**Route**: `/admin/bookings`

**Sections**:
- Stats bar (Total, Today, Pending, Completed)
- Comprehensive filters:
  - Status
  - Payment status
  - Date range
  - Agent filter
  - Tour filter
  - Amount range
- Bookings table:
  - Booking reference
  - Client name
  - Agent name
  - Tour name
  - Travel date
  - Travelers
  - Amount
  - Commission
  - Payment status
  - Booking status
  - Actions
- Actions:
  - View details
  - Update status
  - Process refund
  - Contact client
  - Contact agent
- Export to CSV
- Pagination

**Components Used**: StatsBar, BookingFilters, BookingTable, BookingDetailModal, RefundModal

---

### 5. All Tours
**Route**: `/admin/tours`

**Sections**:
- Stats bar (Total, Active, Pending Review, Flagged)
- Filter options:
  - Status
  - Agent
  - Destination
  - Price range
  - Date created
- Tours table:
  - Tour ID
  - Title
  - Agent name
  - Destination
  - Price
  - Status
  - Bookings count
  - Rating
  - Date created
  - Actions
- Actions per tour:
  - View details
  - Preview (as client sees)
  - Approve/Reject (for pending)
  - Feature/Unfeature
  - Suspend/Activate
  - Delete
- Moderation queue for flagged tours
- Export to CSV
- Pagination

**Components Used**: StatsBar, TourFilters, TourTable, TourDetailModal, ModerationQueue

---

### 6. Withdrawals
**Route**: `/admin/withdrawals`

**Sections**:
- Stats bar (Pending, Approved, Rejected, Total Processed)
- Filter options:
  - Status (Pending, Approved, Rejected, Processing)
  - Date range
  - Agent filter
  - Amount range
- Withdrawals table:
  - Request ID
  - Agent name
  - Amount requested
  - Payment method
  - Account details
  - Date requested
  - Status
  - Actions
- Actions per request:
  - View agent details
  - Approve (opens confirmation with transaction ID input)
  - Reject (requires reason)
  - Mark as Processing
- Bulk approve option
- Export to CSV
- Pagination

**Approval Modal**:
- Confirm amount
- Transaction reference input
- Payment date
- Notes
- Confirm button

**Components Used**: StatsBar, WithdrawalFilters, WithdrawalTable, ApprovalModal, RejectionModal

---

### 7. Commission Settings
**Route**: `/admin/settings/commission`

**Sections**:
- Current commission rate display
- Commission rate form:
  - Default commission percentage
  - Effective date
  - Apply to new bookings only / all future
- Commission history:
  - Previous rates
  - Date changed
  - Changed by
- Commission earnings overview:
  - Total commission earned (all time)
  - This month commission
  - Average commission per booking
- Commission breakdown chart

**Components Used**: CommissionForm, CommissionHistory, EarningsOverview, CommissionChart

---

### 8. Reports
**Route**: `/admin/reports`

**Sections**:
- Report type selector:
  - Revenue Report
  - Bookings Report
  - Agent Performance
  - Tour Performance
  - User Growth
- Date range selector
- Generate report button
- Report display area:
  - Summary stats
  - Charts/graphs
  - Detailed table
- Export options:
  - Export as PDF
  - Export as CSV
  - Export as Excel
- Scheduled reports (optional):
  - Daily/Weekly/Monthly email
  - Recipients list

**Available Reports**:
1. **Revenue Report**: Gross revenue, commissions, net payouts, trends
2. **Bookings Report**: Total bookings, by status, by agent, by tour
3. **Agent Performance**: Ranking, earnings, ratings, activity
4. **Tour Performance**: Popular tours, conversion rates, reviews
5. **User Growth**: New signups, active users, retention

**Components Used**: ReportSelector, DateRangePicker, ReportViewer, ChartComponents, ExportButtons

---

## HOME PAGE WIREFRAME

```
+------------------------------------------------------------------+
|  [Logo]    Tours  About  Contact  How it Works    [Login] [Signup]|
+------------------------------------------------------------------+
|                                                                   |
|                    ================================                |
|                    |                              |                |
|                    |      HERO IMAGE/VIDEO        |                |
|                    |                              |                |
|                    |    Discover East Africa's    |                |
|                    |    Most Incredible Safaris   |                |
|                    |                              |                |
|                    ================================                |
|                                                                   |
|    +----------------------------------------------------------+   |
|    | Where to?  |  When?      |  Travelers  |  [Search]       |   |
|    +----------------------------------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|                    FEATURED TOURS                                 |
|                                                                   |
|    +----------+  +----------+  +----------+  +----------+        |
|    |  [img]   |  |  [img]   |  |  [img]   |  |  [img]   |        |
|    |  Title   |  |  Title   |  |  Title   |  |  Title   |        |
|    |  3 Days  |  |  5 Days  |  |  4 Days  |  |  7 Days  |        |
|    |  $450    |  |  $850    |  |  $650    |  |  $1200   |        |
|    +----------+  +----------+  +----------+  +----------+        |
|                                                                   |
|                        [View All Tours]                           |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|                    WHY CHOOSE SAFARIPLUS                          |
|                                                                   |
|    +-------------+  +-------------+  +-------------+              |
|    |   [icon]    |  |   [icon]    |  |   [icon]    |              |
|    |   Verified  |  |   Secure    |  |   Local     |              |
|    |   Agents    |  |   Payments  |  |   Experts   |              |
|    +-------------+  +-------------+  +-------------+              |
|                                                                   |
|    +-------------+  +-------------+  +-------------+              |
|    |   [icon]    |  |   [icon]    |  |   [icon]    |              |
|    |   Best      |  |   24/7      |  |   Mobile    |              |
|    |   Prices    |  |   Support   |  |   Friendly  |              |
|    +-------------+  +-------------+  +-------------+              |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|                    POPULAR DESTINATIONS                           |
|                                                                   |
|    +----------+  +----------+  +----------+  +----------+        |
|    |  [img]   |  |  [img]   |  |  [img]   |  |  [img]   |        |
|    |  Masai   |  |  Zanzibar|  |  Amboseli|  |  Serengeti|       |
|    |  Mara    |  |          |  |          |  |          |        |
|    |  45 Tours|  |  32 Tours|  |  28 Tours|  |  38 Tours|        |
|    +----------+  +----------+  +----------+  +----------+        |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|                      HOW IT WORKS                                 |
|                                                                   |
|       (1)              (2)               (3)                      |
|    +-------+        +-------+         +-------+                   |
|    |  O    |  --->  |  O    |  --->   |  O    |                   |
|    +-------+        +-------+         +-------+                   |
|    Browse &         Book &            Enjoy Your                  |
|    Search           Pay Securely      Safari                      |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|                    WHAT TRAVELERS SAY                             |
|                                                                   |
|    +----------------------------------------------------------+   |
|    |  "Amazing experience! The booking was seamless..."        |   |
|    |                                                           |   |
|    |  - Sarah M., United States                                |   |
|    |  *****(5 stars)                                           |   |
|    +----------------------------------------------------------+   |
|                                                                   |
|    [<]  o o o o o  [>]  (testimonial slider)                      |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|    +----------------------------------------------------------+   |
|    |                                                           |   |
|    |        ARE YOU A TOUR OPERATOR?                           |   |
|    |                                                           |   |
|    |    Join SafariPlus and reach thousands of travelers       |   |
|    |                                                           |   |
|    |              [Become an Agent]                            |   |
|    |                                                           |   |
|    +----------------------------------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
|                                                                   |
|  FOOTER                                                          |
|                                                                   |
|  SafariPlus          Quick Links       Support       Follow Us   |
|  [Logo]              - Tours           - FAQs        [FB] [IG]   |
|                      - About           - Contact     [TW] [YT]   |
|  Your trusted        - How it Works    - Terms                   |
|  safari partner      - Become Agent    - Privacy                 |
|                                                                   |
|  Contact Us:                                                     |
|  +254 700 000 000 | hello@safariplus.co.ke                       |
|                                                                   |
|  (c) 2026 SafariPlus. All rights reserved.                       |
|                                                                   |
+------------------------------------------------------------------+
```

---

## SUMMARY TABLE

| Category | Page Count | Routes |
|----------|------------|--------|
| Public/Landing | 11 | `/`, `/about`, `/tours`, `/tours/[slug]`, `/contact`, `/faqs`, `/how-it-works`, `/become-agent`, `/terms`, `/privacy`, `/login`, `/signup` |
| Client Dashboard | 6 | `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/[id]`, `/dashboard/profile`, `/checkout/[id]`, `/booking/confirmation/[id]` |
| Agent Dashboard | 8 | `/agent`, `/agent/tours`, `/agent/tours/create`, `/agent/tours/[id]/edit`, `/agent/bookings`, `/agent/bookings/[id]`, `/agent/earnings`, `/agent/profile` |
| Admin Dashboard | 8 | `/admin`, `/admin/agents`, `/admin/clients`, `/admin/bookings`, `/admin/tours`, `/admin/withdrawals`, `/admin/settings/commission`, `/admin/reports` |
| **Total** | **33 pages** | |

---

## Route Protection Matrix

| Route Pattern | Required Role | Redirect If Unauthorized |
|---------------|---------------|--------------------------|
| `/` (public pages) | None | N/A |
| `/dashboard/*` | Client | `/login` |
| `/agent/*` | Agent | `/login` |
| `/admin/*` | Admin | `/login` |
| `/checkout/*` | Client | `/login?redirect=/checkout/...` |

---

## Mobile Navigation Structure

### Public Pages
- Bottom navigation: Home, Tours, About, Menu (hamburger)
- Menu contains: Contact, FAQs, How it Works, Become Agent, Login/Signup

### Client Dashboard
- Bottom navigation: Dashboard, Bookings, Profile, Tours (browse)

### Agent Dashboard
- Bottom navigation: Dashboard, Tours, Bookings, Earnings, Profile

### Admin Dashboard
- Sidebar navigation (collapsible on tablet)
- No bottom nav (admin primarily desktop)

---

## SEO Considerations

### Static Pages (SSG)
- Home, About, Contact, FAQs, How it Works, Become Agent, Terms, Privacy

### Dynamic Pages (SSR/ISR)
- Tours listing (ISR with revalidation)
- Tour details (ISR with revalidation)
- All dashboard pages (SSR with auth)

### Meta Tags Required
- Title, description, keywords
- Open Graph tags for social sharing
- Canonical URLs
- Structured data (JSON-LD) for tours

---

## Approval

- [ ] Page structure approved
- [ ] Routes confirmed
- [ ] Component mapping complete
- [ ] Mobile navigation approved

**Approver**: ____________________
**Date**: ____________________

---

---

## PACKAGE BUILDER PAGES (New Feature)

The Package Builder is SafariPlus's KEY DIFFERENTIATOR - enabling flexible, customizable tour packages with real-time pricing.

### Agent Package Builder Pages

#### 1. Package Templates List
**Route**: `/agent/packages`

**Sections**:
- Stats summary (Total packages, Published, Draft)
- Create New Package button (primary CTA)
- Status filter tabs (All, Published, Draft, Archived)
- Search packages input
- Packages grid/list with:
  - Package thumbnail
  - Package title
  - Duration (days/nights)
  - Base price
  - Status badge
  - Bookings count
  - Actions (Edit, Preview, Duplicate, Archive)
- Empty state for no packages
- Pagination

**Components Used**: StatsBar, PackageCard, StatusTabs, SearchInput, EmptyState, Pagination

---

#### 2. Create Package Template
**Route**: `/agent/packages/create`

**Sections**: Multi-step wizard

**Step 1 - Basic Details**:
- Package title
- Short description
- Full description (rich text editor)
- Total days/nights
- Base price
- Price type (per person/per group)
- Min/max group size

**Step 2 - Itinerary Builder**:
- Add days interface
- For each day:
  - Day title
  - Location
  - Description
  - Included activities (text list)
  - Meals included (checkboxes)
  - Requires accommodation (toggle)
- Drag to reorder days

**Step 3 - Accommodation Options**:
- For each day requiring accommodation:
  - Add Accommodation Option button
  - List of added options showing:
    - Tier (Budget/Standard/Comfort/Luxury/Ultra-Luxury)
    - Name
    - Price per person
    - Edit/Delete actions
- Accommodation modal for adding/editing:
  - Tier selection
  - Property name
  - Description
  - Pricing (per person/per room)
  - Single supplement
  - Child pricing
  - Images upload
  - Amenities checklist
  - Mark as default option

**Step 4 - Optional Activities**:
- Add Activity button
- List of added activities showing:
  - Category badge
  - Activity name
  - Price
  - Available days
  - Edit/Delete actions
- Activity modal for adding/editing:
  - Activity name
  - Category selection
  - Description
  - Duration
  - Pricing model (per person/per group/minimum)
  - Price
  - Available on which days
  - Requirements/Restrictions
  - Min age
  - Inclusions
  - Images upload
  - Mark as popular

**Step 5 - Pricing Rules**:
- Child Pricing Policy section:
  - Age bands configuration
  - Infant pricing (free/percentage/fixed)
  - Child pricing (percentage/fixed)
  - Teen pricing (percentage/adult rate)
- Seasonal Pricing section:
  - Add Season button
  - List of seasons with date ranges
  - Adjustment type and value
- Group Discounts section:
  - Discount tiers configuration

**Step 6 - Media & Settings**:
- Package images upload (drag & drop)
- Cover image selection
- Availability dates
- Blackout dates
- What's included (base package)
- What's excluded

**Step 7 - Review & Publish**:
- Full package preview (as tourist sees it)
- Checklist validation:
  - [ ] Basic details complete
  - [ ] At least one day added
  - [ ] Accommodations configured
  - [ ] Images uploaded
- Save as Draft / Publish buttons

**Components Used**: FormWizard, RichTextEditor, ItineraryBuilder, AccommodationModal, ActivityModal, ImageUploader, PricingRulesForm, PackagePreview, ValidationChecklist

---

#### 3. Edit Package Template
**Route**: `/agent/packages/[id]/edit`

**Sections**:
- Same as Create Package but pre-populated
- Additional options:
  - Unpublish package
  - Duplicate package
  - Archive package
  - View booking history
- Change history/audit log

**Components Used**: Same as Create Package + ChangeLog

---

#### 4. Package Preview (Agent View)
**Route**: `/agent/packages/[id]/preview`

**Sections**:
- Full package configurator view (as tourist sees it)
- Preview banner at top: "You are previewing this package"
- All functionality works (selection, pricing)
- Cannot actually book (disabled)
- Edit button to return to editor

**Components Used**: PackageConfigurator (read-only mode), PreviewBanner

---

### Tourist Package Configurator Pages

#### 1. Package Configurator
**Route**: `/packages/[slug]`

**Layout**: Full-width, immersive configurator

**Desktop Layout** (Side-by-side):
```
+------------------------------------------------------------------+
|  Header with Logo, Back to Tours, Currency Selector               |
+------------------------------------------------------------------+
|                                                                   |
|  +---------------------------+  +------------------------------+ |
|  |  PACKAGE PREVIEW          |  |  CONFIGURATOR                | |
|  |  (Image Carousel)         |  |                              | |
|  |                           |  |  GROUP COMPOSITION           | |
|  |  Package Title            |  |  [2 Adults] [1 Child] [Edit] | |
|  |  Duration | Rating        |  |                              | |
|  |                           |  |  TRAVEL DATE                 | |
|  +---------------------------+  |  [Calendar picker]           | |
|  |  YOUR SELECTION           |  |                              | |
|  |  (Sticky sidebar)         |  |  ITINERARY                   | |
|  |                           |  |  Day 1: Masai Mara           | |
|  |  Travelers: 2A + 1C       |  |  [Select Accommodation v]    | |
|  |  Date: Aug 15, 2026       |  |   [ ] Budget - $80           | |
|  |                           |  |   [x] Comfort - $150         | |
|  |  Base Package:    $1,350  |  |   [ ] Luxury - $300          | |
|  |  Accommodations:  $450    |  |                              | |
|  |  Activities:      $900    |  |  Day 2: Safari Day           | |
|  |  Seasonal (High): +$270   |  |  [Same as Day 1]             | |
|  |  Child discount:  -$337   |  |                              | |
|  |  ----------------         |  |  Day 3: Departure            | |
|  |  TOTAL:          $2,633   |  |  (No accommodation)          | |
|  |                           |  |                              | |
|  |  [Book Now]               |  |  OPTIONAL ACTIVITIES         | |
|  |  [Save] [Share]           |  |  [ ] Hot Air Balloon - $450  | |
|  +---------------------------+  |  [ ] Bush Dinner - $120      | |
|                                 |  [ ] Maasai Village - $50    | |
|                                 |                              | |
|                                 +------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

**Mobile Layout** (Stacked):
```
+----------------------------+
|  Header | Back | Currency  |
+----------------------------+
|                            |
|  [Image Carousel]          |
|                            |
|  Package Title             |
|  Duration | Rating         |
|                            |
+----------------------------+
|  TRAVELERS & DATE          |
|  [2 Adults] [1 Child]      |
|  [Aug 15, 2026]   [Edit]   |
+----------------------------+
|                            |
|  DAY 1: MASAI MARA         |
|  Morning arrival and...    |
|                            |
|  SELECT ACCOMMODATION      |
|  +------------------------+|
|  | [img] Budget           ||
|  | Wildebeest Camp        ||
|  | $80/person [Select]    ||
|  +------------------------+|
|  +------------------------+|
|  | [img] Comfort          ||
|  | Mara Serena            ||
|  | $150/person [Selected] ||
|  +------------------------+|
|                            |
|  ...more days...           |
|                            |
+----------------------------+
|  OPTIONAL ACTIVITIES       |
|  +------------------------+|
|  | Hot Air Balloon        ||
|  | $450/person [+ Add]    ||
|  +------------------------+|
+----------------------------+
|                            |
|  +----------------------+  |
|  | YOUR TOTAL           |  |
|  | Base: $1,350         |  |
|  | Accommodation: $450  |  |
|  | Activities: $0       |  |
|  | High Season: +$270   |  |
|  | Child: -$337         |  |
|  | ---------------      |  |
|  | TOTAL: $1,733        |  |
|  |                      |  |
|  | [Book Now - $1,733]  |  |
|  | [Save] [Share]       |  |
|  +----------------------+  |
|                            |
+----------------------------+
```

**Sections**:
- Package header (title, rating, duration)
- Image gallery
- Group composition selector (adults, children, teens, infants)
- Travel date picker
- Day-by-day itinerary with:
  - Day title and description
  - Location
  - Meals included
  - Accommodation selection (if required)
- Optional activities section
- Price breakdown (sticky on desktop, fixed bottom on mobile)
- Book Now CTA
- Save Configuration button
- Share Configuration button

**Real-time Updates**:
- Price updates within 200ms of any change
- Animated price transitions
- Visual feedback on selection

**Components Used**: PackageHeader, ImageGallery, TravelerSelector, DatePicker, ItineraryDay, AccommodationSelector, AccommodationCard, AccommodationDetailModal, ActivitySelector, ActivityCard, ActivityDetailModal, PriceBreakdown, BookingCTA, SaveShareButtons

---

#### 2. Accommodation Detail Modal
**Route**: Modal overlay on `/packages/[slug]`

**Sections**:
- Image gallery carousel
- Property name and tier badge
- Star rating and guest rating
- Full description
- Highlights
- Amenities grid
- Room types selection (if available)
- Pricing details
- External links (website, TripAdvisor)
- Select This Accommodation button

**Components Used**: ModalOverlay, ImageCarousel, TierBadge, RatingStars, AmenitiesGrid, RoomTypeSelector, PricingDisplay

---

#### 3. Activity Detail Modal
**Route**: Modal overlay on `/packages/[slug]`

**Sections**:
- Image gallery carousel
- Activity name and category badge
- Duration
- Full description
- What's included
- What's not included
- Requirements and restrictions
- Age/fitness requirements
- What to bring
- Time slot selection (if applicable)
- Pricing for group
- Add to Package button

**Components Used**: ModalOverlay, ImageCarousel, CategoryBadge, InclusionsList, RequirementsList, TimeSlotSelector, PricingDisplay

---

#### 4. Saved Configuration View
**Route**: `/packages/configure/[shareToken]`

**Sections**:
- Shared configuration banner
- Full package configurator (read-only or editable)
- Shows all saved selections
- Price as calculated at save time
- Book This Configuration CTA
- Modify Configuration button (creates new config)

**Components Used**: SharedBanner, PackageConfigurator, ModifyButton

---

#### 5. Package Checkout (Enhanced)
**Route**: `/checkout/[bookingId]`

**Enhanced for Package Builder**:
- Order summary shows:
  - Package name
  - Travel date
  - Group composition breakdown
  - Accommodation selections (per day)
  - Activity selections
  - Full price breakdown
  - Seasonal adjustments shown
  - Child pricing shown
- Rest of checkout same as standard

**Components Used**: EnhancedOrderSummary, TravelerForm, PaymentMethodSelector

---

### Package Builder Summary Table

| Category | Page Count | Routes |
|----------|------------|--------|
| Agent Package Builder | 4 | `/agent/packages`, `/agent/packages/create`, `/agent/packages/[id]/edit`, `/agent/packages/[id]/preview` |
| Tourist Configurator | 4 | `/packages/[slug]`, (modals), `/packages/configure/[shareToken]`, `/checkout/[id]` (enhanced) |
| **Total New Pages** | **8** | |

---

### Updated Route Protection Matrix

| Route Pattern | Required Role | Notes |
|---------------|---------------|-------|
| `/packages/[slug]` | None | Public package configurator |
| `/packages/configure/[shareToken]` | None | Public shared configuration |
| `/agent/packages/*` | Agent | Package management |
| `/checkout/*` | Client | Booking checkout |

---

### Mobile Navigation Updates

#### Agent Dashboard
Updated bottom navigation:
- Dashboard | **Packages** | Tours | Bookings | Earnings

The Packages tab now takes agents to the new Package Templates management area.

---

### Component Library Additions

New components required for Package Builder:

**Agent Components**:
- `PackageCard` - Package template card in list
- `ItineraryBuilder` - Day-by-day builder interface
- `AccommodationModal` - Add/edit accommodation modal
- `ActivityModal` - Add/edit activity modal
- `PricingRulesForm` - Child pricing and seasonal pricing config
- `PackagePreview` - Full package preview component
- `ValidationChecklist` - Publishing requirements checklist

**Tourist Components**:
- `PackageConfigurator` - Main configurator container
- `TravelerSelector` - Group composition picker
- `ItineraryDay` - Single day in itinerary
- `AccommodationSelector` - Accommodation options for a day
- `AccommodationCard` - Single accommodation option card
- `AccommodationDetailModal` - Full accommodation details
- `ActivitySelector` - Activities list
- `ActivityCard` - Single activity card
- `ActivityDetailModal` - Full activity details
- `PriceBreakdown` - Live price breakdown display
- `SaveShareButtons` - Save and share configuration

**Shared Components**:
- `TierBadge` - Accommodation tier indicator
- `CategoryBadge` - Activity category indicator
- `PricingDisplay` - Formatted price display
- `ImageGallery` - Zoomable image gallery
- `AmenitiesGrid` - Grid of amenities with icons

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2026 | Initial page structure defined |
| 1.1 | Jan 2026 | Added Package Builder pages and components |
