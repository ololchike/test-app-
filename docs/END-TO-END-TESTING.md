# SafariPlus - End-to-End Testing Documentation

## Overview

This document provides comprehensive test cases for all features in the SafariPlus platform. Each feature is broken down into phases that cover the complete user flow from creation to public display.

**Testing Approach:**
- Each feature has multiple test phases
- Tests are ordered by dependency (Phase 1 must pass before Phase 2)
- Each test includes: Steps, Expected Results, and Edge Cases
- Tests cover all user roles: Admin, Agent, Client, Public (Guest)

**Test Environment URLs:**
- Local: `http://localhost:3000`
- Network: `http://[IP]:3000`

---

## Table of Contents

1. [Authentication System](#1-authentication-system)
2. [Tour Management](#2-tour-management)
3. [Booking System](#3-booking-system)
4. [Payment System](#4-payment-system)
5. [Reviews & Ratings](#5-reviews--ratings)
6. [Messaging System](#6-messaging-system)
7. [Wishlist](#7-wishlist)
8. [Agent Dashboard](#8-agent-dashboard)
9. [Admin Dashboard](#9-admin-dashboard)
10. [Collections & Deals](#10-collections--deals)
11. [Referral Program](#11-referral-program)
12. [Content & SEO](#12-content--seo)
13. [Contact System](#13-contact-system)
14. [Security Features](#14-security-features)

---

## 1. Authentication System

### Feature Overview
- User registration (Client and Agent)
- Email/Password login
- Google OAuth login
- Email verification
- Password reset
- Session management

### Phase 1: User Registration

#### Test 1.1.1: Client Registration
**Page:** `/signup`

**Steps:**
1. Navigate to `/signup`
2. Select "Client" account type
3. Enter valid name, email, phone
4. Enter password meeting requirements (8+ chars, uppercase, lowercase, number)
5. Accept terms and conditions
6. Click "Create Account"

**Expected Results:**
- [ ] Form validation shows real-time feedback
- [ ] Password strength indicator works
- [ ] Success message appears
- [ ] User redirected to email verification notice
- [ ] Verification email sent
- [ ] User record created in database with role=CLIENT

**Edge Cases:**
- [ ] Duplicate email shows error
- [ ] Weak password rejected
- [ ] Missing required fields blocked
- [ ] Bot protection triggers on rapid attempts

#### Test 1.1.2: Agent Registration
**Page:** `/signup`

**Steps:**
1. Navigate to `/signup`
2. Select "Tour Operator" account type
3. Enter name, email, phone
4. Enter business name, business phone
5. Enter password
6. Accept terms
7. Click "Create Account"

**Expected Results:**
- [ ] Additional business fields appear for Agent type
- [ ] Agent record created with status=PENDING
- [ ] User record created with role=AGENT
- [ ] Admin notified of pending agent
- [ ] Agent cannot access dashboard until approved

#### Test 1.1.3: Google OAuth Registration
**Page:** `/signup` or `/login`

**Steps:**
1. Click "Continue with Google"
2. Select Google account
3. Authorize application

**Expected Results:**
- [ ] Account created or linked
- [ ] User logged in automatically
- [ ] Profile populated from Google data

### Phase 2: Email Verification

#### Test 1.2.1: Email Verification Flow
**Page:** Email → `/verify-email`

**Steps:**
1. Open verification email
2. Click verification link
3. Observe verification page

**Expected Results:**
- [ ] Link valid for 24 hours
- [ ] Email marked as verified
- [ ] Success message displayed
- [ ] User can now log in

#### Test 1.2.2: Resend Verification
**Page:** `/verify-email`

**Steps:**
1. Click "Resend verification email"
2. Check email

**Expected Results:**
- [ ] New email sent
- [ ] Old token invalidated
- [ ] Rate limiting prevents spam

### Phase 3: Login

#### Test 1.3.1: Email/Password Login
**Page:** `/login`

**Steps:**
1. Navigate to `/login`
2. Enter registered email
3. Enter correct password
4. Click "Sign In"

**Expected Results:**
- [ ] Login successful
- [ ] Redirected based on role:
  - CLIENT → `/dashboard`
  - AGENT → `/agent/dashboard`
  - ADMIN → `/admin/dashboard`
- [ ] Session created

#### Test 1.3.2: Failed Login Attempts
**Steps:**
1. Enter wrong password 5 times

**Expected Results:**
- [ ] Error shown for each attempt
- [ ] Account locked after 5 attempts
- [ ] Lock duration: 15 minutes
- [ ] Clear message about lockout

#### Test 1.3.3: Login with Unverified Email
**Steps:**
1. Try to log in with unverified email account

**Expected Results:**
- [ ] Login blocked
- [ ] Message prompts email verification
- [ ] Option to resend verification

### Phase 4: Password Reset

#### Test 1.4.1: Forgot Password Flow
**Page:** `/forgot-password`

**Steps:**
1. Navigate to `/forgot-password`
2. Enter registered email
3. Click "Send Reset Link"
4. Open email
5. Click reset link
6. Enter new password
7. Confirm new password
8. Submit

**Expected Results:**
- [ ] Reset email sent
- [ ] Link valid for 1 hour
- [ ] Password updated successfully
- [ ] Redirected to login
- [ ] Can log in with new password

#### Test 1.4.2: Invalid/Expired Reset Token
**Steps:**
1. Use old or invalid reset link

**Expected Results:**
- [ ] Error message displayed
- [ ] Option to request new link

### Phase 5: Session & Logout

#### Test 1.5.1: Session Persistence
**Steps:**
1. Log in
2. Close browser
3. Reopen and navigate to protected page

**Expected Results:**
- [ ] Session maintained (if remember me checked)
- [ ] Or redirected to login

#### Test 1.5.2: Logout
**Steps:**
1. Click user menu
2. Click "Sign Out"

**Expected Results:**
- [ ] Session destroyed
- [ ] Redirected to home page
- [ ] Protected pages inaccessible

---

## 2. Tour Management

### Feature Overview
- Tour CRUD operations (Agent)
- Itinerary management
- Accommodation options
- Activity add-ons
- Image management
- Availability calendar
- Tour publishing
- Public tour display

### Phase 1: Tour Creation

#### Test 2.1.1: Create New Tour - Basic Info
**Page:** `/agent/tours/new`
**Prerequisites:** Logged in as approved Agent

**Steps:**
1. Navigate to `/agent/tours/new`
2. Fill in Step 1 - Basic Details:
   - Title
   - Subtitle
   - Description
   - Destination
   - Country
   - Duration (days/nights)
   - Base price
   - Currency
3. Click "Next"

**Expected Results:**
- [ ] Form validation works
- [ ] Progress to Step 2
- [ ] Draft tour created in database

#### Test 2.1.2: Create Tour - Itinerary
**Page:** `/agent/tours/new` (Step 2)

**Steps:**
1. Add Day 1 itinerary:
   - Title
   - Description
   - Location
   - Meals (checkboxes)
   - Activities (tags)
   - Overnight location
2. Add more days
3. Reorder days
4. Delete a day

**Expected Results:**
- [ ] Days added correctly
- [ ] Reordering works via drag-drop
- [ ] Deletion confirms before removing
- [ ] Day numbers update after reorder

#### Test 2.1.3: Create Tour - Images
**Page:** `/agent/tours/new` (Step 3)

**Steps:**
1. Upload cover image
2. Upload gallery images (5+)
3. Delete an image
4. Set different image as cover

**Expected Results:**
- [ ] Images upload to Cloudinary
- [ ] Progress indicator shown
- [ ] Cover image highlighted
- [ ] Deleted images removed from Cloudinary
- [ ] Image order maintained

#### Test 2.1.4: Create Tour - Features
**Page:** `/agent/tours/new` (Step 4)

**Steps:**
1. Add highlights (tags)
2. Add inclusions list
3. Add exclusions list
4. Set tour type(s)
5. Set difficulty level
6. Set best seasons
7. Set group size (min/max)
8. Set child/infant prices
9. Enable deposit option

**Expected Results:**
- [ ] All fields saved correctly
- [ ] Multiple tour types allowed
- [ ] Price fields validate numeric

#### Test 2.1.5: Create Tour - Review & Save
**Page:** `/agent/tours/new` (Step 5)

**Steps:**
1. Review all entered data
2. Click "Create Tour"

**Expected Results:**
- [ ] Tour saved with status=DRAFT
- [ ] Unique slug generated
- [ ] Redirected to tour edit page
- [ ] Success toast shown

### Phase 2: Tour Editing

#### Test 2.2.1: Edit Tour - Basic Info
**Page:** `/agent/tours/[id]/edit`

**Steps:**
1. Navigate to tour edit page
2. Modify title, price, description
3. Save changes

**Expected Results:**
- [ ] Changes saved
- [ ] Updated timestamp reflected
- [ ] Slug remains same (unless title significantly changed)

#### Test 2.2.2: Edit Itinerary
**API:** `/api/agent/tours/[id]/itinerary`

**Steps:**
1. Edit existing day
2. Add new day in middle
3. Remove a day

**Expected Results:**
- [ ] Day numbers adjust automatically
- [ ] Related accommodations/addons update

#### Test 2.2.3: Manage Accommodations
**Page:** `/agent/tours/[id]/edit` → Accommodations Tab
**API:** `/api/agent/tours/[id]/accommodations`

**Steps:**
1. Add accommodation option:
   - Name
   - Description
   - Tier (Budget/Mid-Range/Luxury/Ultra-Luxury)
   - Price per night
   - Amenities
   - Images
2. Edit accommodation
3. Delete accommodation

**Expected Results:**
- [ ] Accommodation created with tour link
- [ ] Images upload correctly
- [ ] Deletion removes accommodation

#### Test 2.2.4: Manage Activity Add-ons
**API:** `/api/agent/tours/[id]/addons`

**Steps:**
1. Add activity addon:
   - Name
   - Description
   - Price
   - Duration
   - Day availability
   - Max capacity
2. Edit addon
3. Delete addon

**Expected Results:**
- [ ] Addon created and linked to tour
- [ ] Day availability correctly stored as JSON array

### Phase 3: Tour Availability

#### Test 2.3.1: Set Tour Availability
**Page:** `/agent/availability`
**API:** `/api/agent/tours/[id]/availability`

**Steps:**
1. Navigate to availability calendar
2. Click a date to set as:
   - Available
   - Blocked
   - Limited (with spots count)
3. Add notes for blocked dates
4. Bulk select date range

**Expected Results:**
- [ ] Calendar shows correct status colors
- [ ] Date restrictions save correctly
- [ ] Blocked dates prevent bookings

### Phase 4: Tour Publishing

#### Test 2.4.1: Publish Tour
**API:** `/api/agent/tours/[id]/publish`

**Steps:**
1. With complete tour (all required fields)
2. Click "Publish Tour"

**Expected Results:**
- [ ] Validation checks all required fields
- [ ] Status changes to ACTIVE
- [ ] publishedAt timestamp set
- [ ] Tour appears in public listings

**Validation Checks:**
- [ ] At least 1 image required
- [ ] Description minimum length
- [ ] At least 1 day itinerary
- [ ] Base price set

#### Test 2.4.2: Unpublish Tour
**Steps:**
1. Click "Unpublish" on active tour

**Expected Results:**
- [ ] Status changes to PAUSED
- [ ] Tour removed from public listings
- [ ] Existing bookings unaffected

### Phase 5: Public Tour Display

#### Test 2.5.1: Tour Listing Page
**Page:** `/tours`

**Steps:**
1. Navigate to `/tours`
2. Observe listings
3. Apply filters:
   - Destination
   - Price range
   - Duration
   - Tour type
4. Search by keyword
5. Sort results
6. Toggle grid/list view

**Expected Results:**
- [ ] Only ACTIVE tours displayed
- [ ] Filters work correctly
- [ ] Search searches title, description
- [ ] Pagination/infinite scroll works
- [ ] Tour cards show: image, title, rating, price, duration

#### Test 2.5.2: Tour Detail Page
**Page:** `/tours/[slug]`

**Steps:**
1. Click on a tour card
2. View tour detail page
3. Navigate through tabs:
   - Overview
   - Itinerary
   - Reviews
4. View image gallery (swipe on mobile)
5. Check agent profile card

**Expected Results:**
- [ ] All tour data displayed correctly
- [ ] Gallery works (prev/next, swipe)
- [ ] View count incremented
- [ ] Similar tours shown
- [ ] Booking card sticky on desktop
- [ ] SEO meta tags set

#### Test 2.5.3: Tour Search Suggestions
**API:** `/api/search/suggestions`

**Steps:**
1. Type in search box on `/tours`
2. Observe suggestions dropdown

**Expected Results:**
- [ ] Real-time suggestions appear
- [ ] Tours matched by title
- [ ] Destinations matched
- [ ] Click suggestion navigates correctly

### Phase 6: Featured Tours & Admin Management

#### Test 2.6.1: Mark Tour as Featured
**Admin Page:** `/admin/tours`

**Steps:**
1. As Admin, go to `/admin/tours`
2. Click "Feature" on a tour

**Expected Results:**
- [ ] Tour marked as featured
- [ ] Appears in featured tours section on homepage

#### Test 2.6.2: Admin Tour Management
**Page:** `/admin/tours`

**Steps:**
1. View all tours (all agents)
2. Filter by status, agent
3. View tour details
4. Suspend inappropriate tour

**Expected Results:**
- [ ] Admin sees all tours
- [ ] Can change tour status
- [ ] Can view analytics

---

## 3. Booking System

### Feature Overview
- Tour booking flow
- Traveler details
- Date selection
- Accommodation selection
- Activity add-on selection
- Promo code application
- Booking management
- Booking cancellation

### Phase 1: Booking Creation

#### Test 3.1.1: Start Booking from Tour Page
**Page:** `/tours/[slug]`

**Steps:**
1. On tour detail page
2. Select travel date
3. Select number of travelers (adults, children, infants)
4. Click "Book Now"

**Expected Results:**
- [ ] Date picker shows only available dates
- [ ] Blocked dates disabled
- [ ] Price calculates based on travelers
- [ ] Redirected to checkout

#### Test 3.1.2: Checkout - Traveler Details
**Page:** `/checkout/[bookingId]` or `/booking/checkout`

**Steps:**
1. Enter lead traveler details:
   - Full name
   - Email
   - Phone
2. Add additional travelers if applicable
3. Enter special requests

**Expected Results:**
- [ ] Form validates required fields
- [ ] Email format validated
- [ ] Phone format validated

#### Test 3.1.3: Select Accommodations
**Page:** Checkout page

**Steps:**
1. For each night, select accommodation tier
2. View accommodation details
3. Change selection

**Expected Results:**
- [ ] Available options shown per night
- [ ] Prices update in order summary
- [ ] Total recalculates

#### Test 3.1.4: Select Activity Add-ons
**Page:** Checkout page

**Steps:**
1. View available add-ons
2. Select desired add-ons
3. Set quantity

**Expected Results:**
- [ ] Add-ons show for applicable days
- [ ] Quantity limited by max capacity
- [ ] Prices update in order summary

#### Test 3.1.5: Apply Promo Code
**API:** `/api/promo/validate`

**Steps:**
1. Enter promo code
2. Click "Apply"

**Expected Results:**
- [ ] Valid code: discount applied, shown in summary
- [ ] Invalid code: error message
- [ ] Expired code: error message
- [ ] Min booking amount enforced

### Phase 2: Payment Selection

#### Test 3.2.1: Full Payment Option
**Steps:**
1. Select "Pay Full Amount"
2. Proceed to payment

**Expected Results:**
- [ ] Full amount shown
- [ ] Payment type set to FULL

#### Test 3.2.2: Deposit Payment Option
**Steps:**
1. Select "Pay Deposit"
2. View deposit amount and balance due date
3. Proceed to payment

**Expected Results:**
- [ ] Deposit percentage calculated (e.g., 30%)
- [ ] Balance amount shown
- [ ] Due date calculated
- [ ] Payment type set to DEPOSIT

### Phase 3: Payment Processing

(See Payment System section for detailed payment tests)

### Phase 4: Booking Confirmation

#### Test 3.4.1: Booking Confirmation Page
**Page:** `/booking/confirmation/[id]`

**Steps:**
1. After successful payment
2. View confirmation page

**Expected Results:**
- [ ] Booking reference displayed
- [ ] Tour details shown
- [ ] What happens next steps listed
- [ ] Download PDF button works
- [ ] Add to calendar button works
- [ ] Confirmation email sent

### Phase 5: Booking Management (Client)

#### Test 3.5.1: View My Bookings
**Page:** `/dashboard/bookings`

**Steps:**
1. As logged in client
2. Navigate to My Bookings
3. Filter by status tabs

**Expected Results:**
- [ ] All user's bookings listed
- [ ] Status badges correct
- [ ] Upcoming bookings highlighted
- [ ] Past bookings in completed tab

#### Test 3.5.2: View Booking Details
**Page:** `/dashboard/bookings/[id]`

**Steps:**
1. Click on a booking
2. View full details

**Expected Results:**
- [ ] All booking info displayed
- [ ] Tour info shown
- [ ] Agent contact shown
- [ ] Payment history shown
- [ ] Actions available based on status

### Phase 6: Booking Cancellation

#### Test 3.6.1: Cancel Booking (Within Free Cancellation Period)
**API:** `/api/bookings/[id]`

**Steps:**
1. On booking details
2. Click "Cancel Booking"
3. Confirm cancellation

**Expected Results:**
- [ ] If within free cancellation days: full refund
- [ ] Booking status → CANCELLED
- [ ] Refund initiated
- [ ] Agent notified
- [ ] Client notified

#### Test 3.6.2: Cancel Booking (Outside Free Cancellation Period)
**Steps:**
1. Try to cancel booking close to travel date

**Expected Results:**
- [ ] Warning about partial/no refund
- [ ] Cancellation policy shown
- [ ] Refund calculated per policy

### Phase 7: Booking Management (Agent)

#### Test 3.7.1: View Agent Bookings
**Page:** `/agent/bookings`

**Steps:**
1. As agent, view bookings
2. Filter by status
3. Search bookings

**Expected Results:**
- [ ] Only bookings for agent's tours shown
- [ ] All statuses filterable
- [ ] Search by reference or client name works

#### Test 3.7.2: Update Booking (Agent)
**Steps:**
1. View booking details
2. Update status (if applicable)
3. Send message to client

**Expected Results:**
- [ ] Agent can update notes
- [ ] Can mark as in-progress/completed
- [ ] Can contact client via messaging

#### Test 3.7.3: Resend Itinerary
**API:** `/api/bookings/[id]/itinerary`

**Steps:**
1. Click "Resend Itinerary"

**Expected Results:**
- [ ] PDF itinerary generated
- [ ] Email sent to client

---

## 4. Payment System

### Feature Overview
- Multiple payment gateways (Pesapal, Flutterwave)
- M-Pesa payments
- Card payments
- Payment status tracking
- Webhook handling

### Phase 1: Payment Initiation

#### Test 4.1.1: M-Pesa Payment (Pesapal)
**Page:** `/booking/payment/[id]`
**API:** `/api/payments/initiate` (via Pesapal)

**Steps:**
1. Select M-Pesa as payment method
2. Enter M-Pesa phone number
3. Click "Pay Now"
4. Receive STK push on phone
5. Enter M-Pesa PIN

**Expected Results:**
- [ ] Redirect to Pesapal payment page
- [ ] STK push received
- [ ] After payment: redirect to success page
- [ ] Booking confirmed

#### Test 4.1.2: Card Payment (Flutterwave)
**API:** Via Flutterwave gateway

**Steps:**
1. Select Card as payment method
2. Click "Pay Now"
3. Enter card details on Flutterwave page
4. Complete 3D Secure if required

**Expected Results:**
- [ ] Redirect to Flutterwave checkout
- [ ] Card processed securely
- [ ] Success: redirect to confirmation
- [ ] Failure: redirect with error

### Phase 2: Payment Status

#### Test 4.2.1: Check Payment Status
**API:** `/api/payments/status`

**Steps:**
1. Poll payment status
2. Observe status changes

**Expected Results:**
- [ ] Status: PENDING → PROCESSING → COMPLETED
- [ ] Failed payments show FAILED status
- [ ] Error message displayed

### Phase 3: Webhooks

#### Test 4.3.1: Pesapal Webhook
**API:** `/api/webhooks/pesapal`

**Steps:**
1. Payment completed externally
2. Pesapal sends IPN notification

**Expected Results:**
- [ ] IP validated (Pesapal IPs only)
- [ ] Transaction status fetched
- [ ] Payment record updated
- [ ] Booking status → CONFIRMED
- [ ] Agent balance updated
- [ ] Confirmation email sent

#### Test 4.3.2: Flutterwave Webhook
**API:** `/api/webhooks/flutterwave`

**Steps:**
1. Payment completed on Flutterwave
2. Webhook received

**Expected Results:**
- [ ] Signature verified
- [ ] Payment record updated
- [ ] Booking confirmed

### Phase 4: Balance Payments (Deposit)

#### Test 4.4.1: Pay Remaining Balance
**Page:** `/booking/payment/[id]`

**Steps:**
1. For booking with deposit paid
2. Navigate to booking details
3. Click "Pay Balance"
4. Complete payment

**Expected Results:**
- [ ] Only balance amount charged
- [ ] Booking fully paid
- [ ] balancePaidAt timestamp set

---

## 5. Reviews & Ratings

### Feature Overview
- Review submission
- Photo reviews
- Rating system
- Agent responses
- Review moderation
- Helpful votes

### Phase 1: Review Eligibility

#### Test 5.1.1: Check Review Eligibility
**API:** `/api/tours/[slug]/review-eligibility`

**Steps:**
1. As client with completed booking
2. Navigate to tour page
3. Check if review button shown

**Expected Results:**
- [ ] Button shown only for completed bookings
- [ ] Cannot review same tour twice
- [ ] Must be logged in

### Phase 2: Review Submission

#### Test 5.2.1: Submit Text Review
**Page:** `/tours/[slug]` → Review section
**API:** `/api/tours/[slug]/reviews`

**Steps:**
1. Click "Write Review"
2. Select star rating (1-5)
3. Enter title
4. Enter review content
5. Submit

**Expected Results:**
- [ ] Review saved with isVerified=true (completed booking)
- [ ] Review pending approval (isApproved=false)
- [ ] Success message shown

#### Test 5.2.2: Submit Photo Review
**Steps:**
1. Write review
2. Upload photos (1-5)
3. Submit

**Expected Results:**
- [ ] Photos uploaded to Cloudinary
- [ ] Stored in review.images JSON
- [ ] Bonus credit earned (if incentive active)

### Phase 3: Review Display

#### Test 5.3.1: View Tour Reviews
**Page:** `/tours/[slug]` → Reviews tab

**Steps:**
1. Navigate to reviews tab
2. View all reviews
3. Filter by rating
4. Sort by date/helpful

**Expected Results:**
- [ ] Only approved reviews shown
- [ ] Rating breakdown displayed
- [ ] Verified purchase badge shown
- [ ] Photos displayed in lightbox

#### Test 5.3.2: Mark Review Helpful
**API:** `/api/reviews/[id]/helpful`

**Steps:**
1. Click "Helpful" on a review

**Expected Results:**
- [ ] Helpful count incremented
- [ ] User can only mark once
- [ ] Toggle removes helpful mark

### Phase 4: Agent Response

#### Test 5.4.1: Agent Responds to Review
**Page:** `/agent/reviews`
**API:** `/api/reviews/[id]/respond`

**Steps:**
1. As agent, view review
2. Click "Respond"
3. Enter response
4. Submit

**Expected Results:**
- [ ] Response saved
- [ ] respondedAt timestamp set
- [ ] Response shown on public review

### Phase 5: Review Moderation (Admin)

#### Test 5.5.1: Approve/Reject Review
**Page:** `/admin/reviews`

**Steps:**
1. As admin, view pending reviews
2. Approve appropriate reviews
3. Reject inappropriate reviews

**Expected Results:**
- [ ] Approved reviews become public
- [ ] Rejected reviews stay hidden
- [ ] Notification sent to user

---

## 6. Messaging System

### Feature Overview
- Real-time messaging (Pusher)
- Conversation threads
- Agent-client communication
- Unread indicators

### Phase 1: Start Conversation

#### Test 6.1.1: Client Initiates Message to Agent
**Page:** `/tours/[slug]` → Contact Agent
**API:** `/api/messages/conversations`

**Steps:**
1. On tour page, click "Contact Agent"
2. Or from booking, click "Message Agent"
3. Type message
4. Send

**Expected Results:**
- [ ] Conversation created
- [ ] Message sent
- [ ] Agent receives notification
- [ ] Real-time delivery (Pusher)

### Phase 2: Conversation Flow

#### Test 6.2.1: Send and Receive Messages
**Page:** `/dashboard/messages` or `/agent/messages`

**Steps:**
1. Open conversation
2. Type message
3. Send
4. Receive reply

**Expected Results:**
- [ ] Messages appear in order
- [ ] Real-time updates
- [ ] Timestamps shown
- [ ] Read receipts work

#### Test 6.2.2: Unread Count
**API:** `/api/messages/unread`

**Steps:**
1. Receive new message
2. Observe notification badge
3. Open conversation

**Expected Results:**
- [ ] Badge shows unread count
- [ ] Count updates in real-time
- [ ] Reading marks as read

### Phase 3: Message Features

#### Test 6.3.1: Message with Attachment
**Steps:**
1. Attach file/image
2. Send message

**Expected Results:**
- [ ] Attachment uploaded
- [ ] Preview shown
- [ ] Download available

---

## 7. Wishlist

### Feature Overview
- Add tours to wishlist
- Remove from wishlist
- View wishlist page

### Phase 1: Add to Wishlist

#### Test 7.1.1: Add Tour to Wishlist
**API:** `/api/wishlist` or `/api/client/wishlist`

**Steps:**
1. As logged in client
2. Click heart icon on tour card
3. Or click "Add to Wishlist" on tour detail

**Expected Results:**
- [ ] Tour added to wishlist
- [ ] Heart icon fills/changes color
- [ ] Count updates if shown

### Phase 2: View Wishlist

#### Test 7.2.1: View Wishlist Page
**Page:** `/dashboard/wishlist`

**Steps:**
1. Navigate to wishlist
2. View saved tours

**Expected Results:**
- [ ] All wishlisted tours shown
- [ ] Tour cards with prices
- [ ] Quick actions available

### Phase 3: Remove from Wishlist

#### Test 7.3.1: Remove Tour
**Steps:**
1. Click heart icon again
2. Or click "Remove" on wishlist page

**Expected Results:**
- [ ] Tour removed
- [ ] UI updates immediately

---

## 8. Agent Dashboard

### Feature Overview
- Dashboard overview
- Earnings tracking
- Withdrawal requests
- Promo code management
- Marketing tools
- Analytics

### Phase 1: Dashboard Overview

#### Test 8.1.1: Agent Dashboard Stats
**Page:** `/agent/dashboard`

**Steps:**
1. Log in as approved agent
2. View dashboard

**Expected Results:**
- [ ] Total earnings shown
- [ ] Pending earnings shown
- [ ] Booking count
- [ ] Average rating
- [ ] Recent bookings list
- [ ] Earnings chart

### Phase 2: Earnings & Withdrawals

#### Test 8.2.1: View Earnings
**Page:** `/agent/earnings`

**Steps:**
1. Navigate to earnings page
2. View earnings history
3. Filter by date range

**Expected Results:**
- [ ] All earnings listed
- [ ] Grouped by type
- [ ] Running balance shown

#### Test 8.2.2: Request Withdrawal
**Page:** `/agent/earnings` → Withdraw
**API:** `/api/agent/withdrawals`

**Steps:**
1. Click "Withdraw"
2. Enter amount
3. Select method (M-Pesa or Bank)
4. Confirm details
5. Submit request

**Expected Results:**
- [ ] Validation: amount <= available balance
- [ ] Minimum withdrawal enforced
- [ ] Request created with status=PENDING
- [ ] Admin notified

#### Test 8.2.3: View Withdrawal History
**Steps:**
1. View withdrawal requests
2. Check status of each

**Expected Results:**
- [ ] All requests listed
- [ ] Status shown (Pending/Approved/Processing/Completed/Rejected)
- [ ] Transaction reference shown when completed

### Phase 3: Promo Codes

#### Test 8.3.1: Create Promo Code
**Page:** `/agent/marketing` → Promo Codes
**API:** `/api/promo/agent`

**Steps:**
1. Click "Create Promo Code"
2. Enter:
   - Code (auto-generate or custom)
   - Discount type (Percentage/Fixed)
   - Discount value
   - Validity dates
   - Usage limits
   - Tour restrictions
3. Save

**Expected Results:**
- [ ] Code created and active
- [ ] Can be used at checkout
- [ ] Usage tracking starts

#### Test 8.3.2: View Promo Code Stats
**Steps:**
1. View created promo codes
2. Check usage stats

**Expected Results:**
- [ ] Usage count shown
- [ ] Revenue generated
- [ ] Active/expired status

### Phase 4: Marketing Tools

#### Test 8.4.1: Generate QR Code
**Page:** `/agent/marketing`

**Steps:**
1. Select a tour
2. Click "Generate QR Code"
3. Download QR

**Expected Results:**
- [ ] QR code generated for tour URL
- [ ] Downloadable as PNG
- [ ] Scannable and works

#### Test 8.4.2: WhatsApp Share
**Steps:**
1. Click "Share on WhatsApp"
2. Select tour

**Expected Results:**
- [ ] Pre-formatted message created
- [ ] WhatsApp opens with message
- [ ] Link included

#### Test 8.4.3: Embeddable Widget
**Page:** `/agent/marketing` → Embed

**Steps:**
1. Copy embed code
2. Paste in external website

**Expected Results:**
- [ ] Widget renders correctly
- [ ] Tours displayed
- [ ] Links work

### Phase 5: Analytics

#### Test 8.5.1: View Analytics
**Page:** `/agent/analytics`
**API:** `/api/agent/analytics`

**Steps:**
1. Navigate to analytics
2. Select date range
3. View metrics

**Expected Results:**
- [ ] Tour views count
- [ ] Booking conversion rate
- [ ] Revenue trends
- [ ] Top performing tours
- [ ] Geographic data

---

## 9. Admin Dashboard

### Feature Overview
- Platform overview
- User management
- Agent management
- Tour moderation
- Booking management
- Withdrawal processing
- Reports
- Site content management

### Phase 1: Dashboard Overview

#### Test 9.1.1: Admin Dashboard Stats
**Page:** `/admin/dashboard`

**Steps:**
1. Log in as admin
2. View dashboard

**Expected Results:**
- [ ] Total revenue
- [ ] Platform commission earned
- [ ] User/Agent/Booking counts
- [ ] Pending actions count
- [ ] Recent activity feed
- [ ] Charts and graphs

### Phase 2: User Management

#### Test 9.2.1: View Users
**Page:** `/admin/users`
**API:** `/api/admin/users`

**Steps:**
1. View all users
2. Filter by role
3. Search by name/email

**Expected Results:**
- [ ] All users listed
- [ ] Role badges shown
- [ ] Account status shown

#### Test 9.2.2: Update User Status
**API:** `/api/admin/users/[id]`

**Steps:**
1. Click on user
2. Change status (Active/Suspended/Deactivated)
3. Save

**Expected Results:**
- [ ] Status updated
- [ ] User access restricted if suspended
- [ ] Audit log created

### Phase 3: Agent Management

#### Test 9.3.1: View Pending Agents
**Page:** `/admin/agents`
**API:** `/api/admin/agents/pending`

**Steps:**
1. View pending agent applications
2. Review agent details

**Expected Results:**
- [ ] Pending agents listed
- [ ] Business details shown
- [ ] Documents if uploaded

#### Test 9.3.2: Approve Agent
**API:** `/api/admin/agents/[id]/activate`

**Steps:**
1. Click "Approve"
2. Confirm action

**Expected Results:**
- [ ] Agent status → ACTIVE
- [ ] Agent can access dashboard
- [ ] Notification email sent

#### Test 9.3.3: Verify Agent
**API:** `/api/admin/agents/[id]/verify`

**Steps:**
1. Click "Verify"

**Expected Results:**
- [ ] isVerified → true
- [ ] Verified badge shows on public profile

#### Test 9.3.4: Suspend Agent
**API:** `/api/admin/agents/[id]/suspend`

**Steps:**
1. Click "Suspend"
2. Enter reason
3. Confirm

**Expected Results:**
- [ ] Agent status → SUSPENDED
- [ ] Agent tours hidden
- [ ] Agent cannot access dashboard
- [ ] Email notification sent

#### Test 9.3.5: Update Agent Commission
**API:** `/api/admin/agents/[id]/commission`

**Steps:**
1. Click "Edit Commission"
2. Enter new rate
3. Save

**Expected Results:**
- [ ] Commission rate updated
- [ ] Future bookings use new rate

### Phase 4: Commission Tiers

#### Test 9.4.1: Manage Commission Tiers
**Page:** `/admin/commission-tiers`
**API:** `/api/admin/commission-tiers`

**Steps:**
1. Create tier (Bronze, Silver, Gold)
2. Set min bookings
3. Set commission rate
4. Activate

**Expected Results:**
- [ ] Tier created
- [ ] Agents auto-qualify based on performance

### Phase 5: Tour Moderation

#### Test 9.5.1: Review Tours
**Page:** `/admin/tours`

**Steps:**
1. View all tours
2. Filter by status
3. View tour details

**Expected Results:**
- [ ] All tours visible
- [ ] Can view any tour details

#### Test 9.5.2: Suspend Tour
**API:** `/api/admin/tours/[id]`

**Steps:**
1. Click "Suspend"
2. Enter reason

**Expected Results:**
- [ ] Tour removed from public
- [ ] Agent notified

### Phase 6: Booking Management

#### Test 9.6.1: View All Bookings
**Page:** `/admin/bookings`
**API:** `/api/admin/bookings`

**Steps:**
1. View all bookings
2. Filter by status, date
3. Search by reference

**Expected Results:**
- [ ] All platform bookings listed
- [ ] Full details accessible
- [ ] Can export data

### Phase 7: Withdrawal Processing

#### Test 9.7.1: View Pending Withdrawals
**Page:** `/admin/withdrawals`
**API:** `/api/admin/withdrawals/pending`

**Steps:**
1. View pending withdrawal requests

**Expected Results:**
- [ ] All pending requests listed
- [ ] Agent details shown
- [ ] Payment method shown

#### Test 9.7.2: Approve Withdrawal
**API:** `/api/admin/withdrawals/[id]/approve`

**Steps:**
1. Review request
2. Click "Approve"

**Expected Results:**
- [ ] Status → APPROVED
- [ ] Ready for processing

#### Test 9.7.3: Process Withdrawal
**API:** `/api/admin/withdrawals/[id]/process`

**Steps:**
1. Make actual payment (M-Pesa/Bank)
2. Enter transaction reference
3. Mark as processed

**Expected Results:**
- [ ] Status → COMPLETED
- [ ] Transaction ref saved
- [ ] Agent notified

#### Test 9.7.4: Reject Withdrawal
**API:** `/api/admin/withdrawals/[id]/reject`

**Steps:**
1. Click "Reject"
2. Enter reason

**Expected Results:**
- [ ] Status → REJECTED
- [ ] Funds returned to agent balance
- [ ] Agent notified with reason

### Phase 8: Reviews Moderation

#### Test 9.8.1: Moderate Reviews
**Page:** `/admin/reviews`

**Steps:**
1. View pending reviews
2. Approve/Reject

**Expected Results:**
- [ ] Approved reviews go public
- [ ] Rejected reviews hidden

### Phase 9: Reports

#### Test 9.9.1: Revenue Report
**Page:** `/admin/reports`
**API:** `/api/admin/reports/revenue`

**Steps:**
1. Generate revenue report
2. Select date range
3. Export

**Expected Results:**
- [ ] Revenue breakdown shown
- [ ] By tour, agent, time period
- [ ] Export to CSV

#### Test 9.9.2: Bookings Report
**API:** `/api/admin/reports/bookings`

**Expected Results:**
- [ ] Booking statistics
- [ ] Conversion rates
- [ ] Cancellation rates

#### Test 9.9.3: Users Report
**API:** `/api/admin/reports/users`

**Expected Results:**
- [ ] User growth
- [ ] Registration trends
- [ ] Active users

### Phase 10: Site Content

#### Test 9.10.1: Edit Privacy Policy
**Page:** `/admin/site-content`
**API:** `/api/admin/site-content/[key]`

**Steps:**
1. Navigate to site content
2. Edit Privacy Policy
3. Use rich text editor
4. Save

**Expected Results:**
- [ ] Content saved
- [ ] Updates reflected on `/privacy`

#### Test 9.10.2: Edit Terms of Service
**Steps:**
1. Edit Terms content
2. Save

**Expected Results:**
- [ ] Updates on `/terms`

### Phase 11: Notifications

#### Test 9.11.1: View Admin Notifications
**Page:** `/admin/notifications`
**API:** `/api/admin/notifications`

**Steps:**
1. View notification bell
2. Click to see all
3. Mark as read

**Expected Results:**
- [ ] All admin notifications shown
- [ ] Unread count accurate
- [ ] Click navigates to relevant page

---

## 10. Collections & Deals

### Feature Overview
- Curated tour collections
- Deals and offers
- Promo codes

### Phase 1: Collections

#### Test 10.1.1: View Collections Page
**Page:** `/collections`
**API:** `/api/collections`

**Steps:**
1. Navigate to collections
2. View all active collections

**Expected Results:**
- [ ] Collections displayed with images
- [ ] Tour count shown
- [ ] Click goes to collection detail

#### Test 10.1.2: View Collection Detail
**Page:** `/collections/[slug]`

**Steps:**
1. Click collection
2. View tours in collection

**Expected Results:**
- [ ] Collection header shown
- [ ] Tours matching criteria listed
- [ ] Can book from here

#### Test 10.1.3: Admin Create Collection
**Page:** `/admin/collections` (if exists)

**Steps:**
1. Create new collection
2. Set filter criteria
3. Activate

**Expected Results:**
- [ ] Collection created
- [ ] Tours auto-populate based on criteria

### Phase 2: Deals

#### Test 10.2.1: View Deals Page
**Page:** `/deals`

**Steps:**
1. Navigate to deals
2. View active deals

**Expected Results:**
- [ ] Active deals shown
- [ ] Discount info displayed
- [ ] Validity dates shown
- [ ] "Limited time" badges

#### Test 10.2.2: Apply Deal at Checkout
**Steps:**
1. Book a tour with active deal
2. Deal auto-applied or enter code

**Expected Results:**
- [ ] Discount applied
- [ ] Original vs discounted price shown

---

## 11. Referral Program

### Feature Overview
- Referral code generation
- Share and track referrals
- Credit earning and redemption

### Phase 1: Generate Referral Code

#### Test 11.1.1: Get Referral Code
**Page:** `/dashboard/referrals`
**API:** `/api/referrals`

**Steps:**
1. Navigate to referrals
2. View unique referral code

**Expected Results:**
- [ ] Unique code displayed
- [ ] Share buttons work
- [ ] Link copied to clipboard

### Phase 2: Share and Track

#### Test 11.2.1: Share Referral Link
**Steps:**
1. Click "Share via WhatsApp" or copy link
2. Send to friend

**Expected Results:**
- [ ] Link contains referral code
- [ ] Friend lands on signup with code

#### Test 11.2.2: Friend Signs Up
**Steps:**
1. Friend clicks referral link
2. Signs up

**Expected Results:**
- [ ] Referral tracked
- [ ] Status: SIGNED_UP
- [ ] Referrer sees in dashboard

### Phase 3: Earn Rewards

#### Test 11.3.1: Friend Completes Booking
**Steps:**
1. Referred user makes a booking
2. Booking completed

**Expected Results:**
- [ ] Referrer earns credit
- [ ] Credit added to wallet
- [ ] Can use on next booking

#### Test 11.3.2: Redeem Credit
**Steps:**
1. At checkout, apply referral credit

**Expected Results:**
- [ ] Credit deducted from total
- [ ] Credit marked as REDEEMED

---

## 12. Content & SEO

### Feature Overview
- Destination guides
- Blog system
- FAQ management
- SEO schema markup

### Phase 1: Destination Guides

#### Test 12.1.1: Admin Create Destination
**Page:** `/admin/destinations/new`
**API:** `/api/admin/destinations`

**Steps:**
1. Navigate to destinations admin
2. Click "Add Destination"
3. Fill in:
   - Name
   - Country
   - Overview (500+ words)
   - Wildlife section
   - Best time to visit
   - Attractions
   - Travel tips
   - Images
4. Add FAQs
5. Publish

**Expected Results:**
- [ ] Destination created
- [ ] FAQs added
- [ ] Images uploaded

#### Test 12.1.2: View Public Destination
**Page:** `/destinations/[slug]`

**Steps:**
1. Navigate to destinations
2. Click destination

**Expected Results:**
- [ ] Rich content displayed
- [ ] FAQs shown
- [ ] Related tours shown
- [ ] SEO meta tags set
- [ ] Schema markup in page source

### Phase 2: Blog

#### Test 12.2.1: Admin Create Blog Post
**Page:** `/admin/blog`
**API:** `/api/admin/blog`

**Steps:**
1. Click "New Post"
2. Enter title, content
3. Upload cover image
4. Select category
5. Add tags
6. Set SEO fields
7. Publish

**Expected Results:**
- [ ] Post created
- [ ] Cover image uploaded
- [ ] Category assigned

#### Test 12.2.2: View Blog Listing
**Page:** `/blog`

**Steps:**
1. Navigate to blog
2. Filter by category
3. Click post

**Expected Results:**
- [ ] Published posts shown
- [ ] Category filter works
- [ ] Post previews shown

#### Test 12.2.3: View Blog Post
**Page:** `/blog/[slug]`

**Steps:**
1. View blog post

**Expected Results:**
- [ ] Full content displayed
- [ ] Article JSON-LD in source
- [ ] Related posts shown
- [ ] Share buttons work

### Phase 3: FAQs

#### Test 12.3.1: Admin Manage FAQs
**Page:** `/admin/faqs`
**API:** `/api/admin/faqs`

**Steps:**
1. Add FAQ
2. Select category
3. Enter question/answer
4. Publish

**Expected Results:**
- [ ] FAQ created
- [ ] Appears in category

#### Test 12.3.2: View FAQ Page
**Page:** `/faq`

**Steps:**
1. Navigate to FAQ
2. Search FAQs
3. Expand categories

**Expected Results:**
- [ ] All published FAQs shown
- [ ] Search filters results
- [ ] Accordion works
- [ ] FAQPage JSON-LD schema in source

---

## 13. Contact System

### Feature Overview
- Contact form submission
- Admin message handling
- Agent forwarding
- Reply system

### Phase 1: Submit Contact Message

#### Test 13.1.1: Submit Contact Form
**Page:** `/contact`
**API:** `/api/contact`

**Steps:**
1. Navigate to contact page
2. Fill in:
   - Name
   - Email
   - Phone
   - Subject
   - Message
3. Submit

**Expected Results:**
- [ ] Form validates
- [ ] Message saved
- [ ] Confirmation shown
- [ ] Admin notified

### Phase 2: Admin Handling

#### Test 13.2.1: View Contact Messages
**Page:** `/admin/contacts`
**API:** `/api/admin/contacts`

**Steps:**
1. As admin, view contacts
2. Filter by status

**Expected Results:**
- [ ] All messages listed
- [ ] Status shown
- [ ] Sort by date

#### Test 13.2.2: Reply to Message
**API:** `/api/admin/contacts/[id]/replies`

**Steps:**
1. Open message
2. Type reply
3. Send

**Expected Results:**
- [ ] Reply saved
- [ ] Email sent to user
- [ ] Status updated

#### Test 13.2.3: Forward to Agent
**API:** `/api/admin/contacts/[id]/forward`

**Steps:**
1. Click "Forward to Agent"
2. Select agent
3. Add note
4. Submit

**Expected Results:**
- [ ] Message assigned to agent
- [ ] Agent notified
- [ ] Agent sees in their contacts

### Phase 3: Agent Response

#### Test 13.3.1: Agent View Assigned Messages
**Page:** `/agent/contacts`

**Steps:**
1. View assigned messages
2. Reply

**Expected Results:**
- [ ] Only assigned messages shown
- [ ] Can reply to customer

---

## 14. Security Features

### Feature Overview
- Rate limiting
- Bot protection
- CSRF protection
- Security headers

### Phase 1: Rate Limiting

#### Test 14.1.1: API Rate Limits
**Steps:**
1. Make rapid API requests
2. Exceed limit

**Expected Results:**
- [ ] 429 Too Many Requests after limit
- [ ] Retry-After header provided

### Phase 2: Bot Protection

#### Test 14.2.1: Honeypot Fields
**Steps:**
1. Fill hidden honeypot field
2. Submit form

**Expected Results:**
- [ ] Submission rejected
- [ ] No error shown (silent fail)

#### Test 14.2.2: Timing Attack Prevention
**Steps:**
1. Submit form too fast (< 2 seconds)

**Expected Results:**
- [ ] Submission rejected
- [ ] Rate limited

### Phase 3: Security Headers

#### Test 14.3.1: Verify Headers
**Steps:**
1. Inspect response headers

**Expected Results:**
- [ ] Content-Security-Policy present
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Strict-Transport-Security (HTTPS)

---

## Appendix A: Test Data Setup

### Required Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Admin | admin@safariplus.com | [secure] | Full admin access |
| Agent | agent@test.com | [secure] | Approved, verified |
| Agent | pending@test.com | [secure] | Pending approval |
| Client | client@test.com | [secure] | Verified email |

### Required Test Tours

1. **Active Tour** - Published, with availability
2. **Draft Tour** - For edit testing
3. **Featured Tour** - Marked as featured
4. **Fully Booked Tour** - No availability

### Required Test Bookings

1. **Completed Booking** - For review testing
2. **Pending Booking** - For payment testing
3. **Deposit Booking** - Partial payment

---

## Appendix B: API Endpoints Reference

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/resend-verification` - Resend email

### Tours
- `GET /api/tours` - List tours
- `GET /api/tours/[slug]` - Tour detail
- `GET /api/tours/featured` - Featured tours
- `GET /api/tours/[slug]/availability` - Availability
- `GET /api/tours/[slug]/reviews` - Tour reviews
- `GET /api/tours/[slug]/similar` - Similar tours
- `GET /api/search/suggestions` - Search suggestions

### Agent Tours
- `GET/POST /api/agent/tours` - Agent's tours
- `GET/PUT/DELETE /api/agent/tours/[id]` - Single tour
- `POST /api/agent/tours/[id]/publish` - Publish
- `GET/POST/PUT/DELETE /api/agent/tours/[id]/itinerary`
- `GET/POST /api/agent/tours/[id]/accommodations`
- `GET/POST /api/agent/tours/[id]/addons`
- `GET/POST /api/agent/tours/[id]/availability`

### Bookings
- `GET/POST /api/bookings` - Bookings
- `GET/PUT /api/bookings/[id]` - Single booking
- `GET /api/client/bookings` - Client's bookings
- `GET /api/agent/bookings` - Agent's bookings

### Payments
- `POST /api/payments/initiate` - Start payment
- `GET /api/payments/status` - Check status
- `POST /api/webhooks/pesapal` - Pesapal callback
- `POST /api/webhooks/flutterwave` - Flutterwave callback

### Reviews
- `POST /api/tours/[slug]/reviews` - Submit review
- `POST /api/reviews/[id]/respond` - Agent response
- `POST /api/reviews/[id]/helpful` - Mark helpful

### Messages
- `GET/POST /api/messages` - Messages
- `GET /api/messages/conversations` - Conversations
- `GET/POST /api/messages/[conversationId]` - Single conversation
- `GET /api/messages/unread` - Unread count

### Wishlist
- `GET/POST/DELETE /api/wishlist` - Wishlist
- `GET /api/wishlist/check` - Check if wishlisted

### Agent
- `GET/PUT /api/agent/profile` - Profile
- `GET /api/agent/balance` - Balance
- `GET/POST /api/agent/withdrawals` - Withdrawals
- `GET /api/agent/analytics` - Analytics
- `GET /api/agent/reviews` - Reviews

### Admin
- `GET /api/admin/dashboard` - Stats
- `GET /api/admin/users` - Users
- `GET /api/admin/agents` - Agents
- `POST /api/admin/agents/[id]/verify`
- `POST /api/admin/agents/[id]/suspend`
- `POST /api/admin/agents/[id]/activate`
- `GET /api/admin/tours` - Tours
- `GET /api/admin/bookings` - Bookings
- `GET /api/admin/reviews` - Reviews
- `GET /api/admin/withdrawals` - Withdrawals
- `POST /api/admin/withdrawals/[id]/approve`
- `POST /api/admin/withdrawals/[id]/process`
- `POST /api/admin/withdrawals/[id]/reject`
- `GET/PUT /api/admin/site-content/[key]` - Site content
- `GET/POST /api/admin/faqs` - FAQs
- `GET/POST /api/admin/blog` - Blog posts
- `GET/POST /api/admin/destinations` - Destinations
- `GET/POST /api/admin/collections` - Collections

---

## Appendix C: Testing Checklist Template

### Feature: [Feature Name]

| Phase | Test | Status | Notes |
|-------|------|--------|-------|
| 1 | Test 1.1 | [ ] | |
| 1 | Test 1.2 | [ ] | |
| 2 | Test 2.1 | [ ] | |

---

## Appendix D: Bug Report Template

```markdown
## Bug Report

**Feature:** [Feature name]
**Phase:** [Test phase]
**Test Case:** [Test ID]

**Description:**
[What happened]

**Expected:**
[What should happen]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]

**Screenshots:**
[Attach if applicable]

**Environment:**
- Browser:
- Device:
- User Role:
```

---

## Appendix E: QA Test Results Summary (2026-01-14)

### Testing Overview
Comprehensive QA testing was performed on all 14 sections. Multiple issues were found and fixed in both API and UI layers.

### Section 1: Authentication System ✅
| Issue | Type | Status |
|-------|------|--------|
| Login not checking email verification | Critical Security | FIXED |
| Agent registration page missing | Missing Feature | FIXED (created `/become-agent`) |
| Password reset schema inconsistent | Validation Bug | FIXED |

### Section 2: Tour Management ✅
| Issue | Type | Status |
|-------|------|--------|
| Missing itinerary validation on publish | Validation Bug | FIXED |
| Missing image validation on publish | Validation Bug | FIXED |
| UI: Publish requirements checklist missing | UX Enhancement | FIXED |
| UI: Date picker not showing availability | Feature Bug | FIXED |

### Section 3: Booking System ✅
| Issue | Type | Status |
|-------|------|--------|
| Infants field missing in booking | Missing Feature | FIXED |
| Promo code validation endpoint missing | Missing Feature | FIXED (`/api/promo/validate`) |
| Booking cancellation endpoint missing | Missing Feature | FIXED (PATCH `/api/bookings/[id]`) |
| Agent booking management endpoints missing | Missing Feature | FIXED |
| UI: Promo code input missing in checkout | UI Bug | FIXED |
| UI: Cancel booking modal missing | UI Bug | FIXED |
| UI: Activity addon quantity selector missing | UI Bug | FIXED |

### Section 4: Payment System ✅
| Issue | Type | Status |
|-------|------|--------|
| Flutterwave webhook missing agent earnings | Critical Bug | FIXED |
| Flutterwave webhook missing confirmation email | Bug | FIXED |
| Balance payment not supported | Missing Feature | FIXED |
| balancePaidAt not updated after balance payment | Bug | FIXED |

### Section 5: Reviews & Ratings ✅
| Issue | Type | Status |
|-------|------|--------|
| Review submission status check inconsistent | Bug | FIXED |
| UI: Rating breakdown showing hardcoded zeros | UI Bug | FIXED (created `ReviewStatsLoader`) |
| UI: Admin reviews total count calculation wrong | Bug | FIXED |

### Section 6: Messaging System ✅
| Issue | Type | Status |
|-------|------|--------|
| Query parameter handling for new conversations | Missing Feature | FIXED |
| Pusher notification for initial messages | Bug | FIXED |
| Pagination cursor bug | Bug | FIXED |
| UnreadBadge not updating in real-time | UI Bug | FIXED |

### Section 7: Wishlist ✅
- All features working correctly
- API returns proper data including ratings and agent info
- UI properly displays wishlist with tour cards

### Section 8: Agent Dashboard ✅
- Dashboard stats working correctly
- Earnings and withdrawals properly implemented
- Analytics endpoint comprehensive

### Section 9: Admin Dashboard ✅
- All admin endpoints properly secured
- User/Agent/Tour management working
- Withdrawal processing workflow complete
- Reports endpoints functional

### Sections 10-14 ✅
- Collections, Deals, Referrals, Content, Contact, Security all verified working

### Files Modified Summary

**API Routes Created:**
- `/api/promo/validate/route.ts` - Promo code validation
- `/api/agent/bookings/[id]/route.ts` - Agent booking management

**API Routes Modified:**
- `/api/auth/reset-password/route.ts` - Fixed password validation
- `/api/agent/tours/[id]/publish/route.ts` - Added itinerary/image validation
- `/api/bookings/route.ts` - Added infants, availability validation
- `/api/bookings/[id]/route.ts` - Added cancellation endpoint
- `/api/bookings/[id]/itinerary/route.ts` - Added resend functionality
- `/api/payments/initiate/route.ts` - Added balance payment support
- `/api/webhooks/flutterwave/route.ts` - Added earnings/email/audit
- `/api/webhooks/pesapal/route.ts` - Added balance payment handling
- `/api/reviews/route.ts` - Fixed status check
- `/api/messages/route.ts` - Fixed pagination cursor
- `/api/messages/conversations/route.ts` - Added Pusher notifications
- `/api/client/bookings/route.ts` - Added filters
- `/api/agent/bookings/route.ts` - Added filters/search/stats

**UI Components Created:**
- `/become-agent/page.tsx` - Agent registration page
- `/components/reviews/review-stats-loader.tsx` - Dynamic rating stats

**UI Components Modified:**
- `/app/booking/checkout/page.tsx` - Added infants, promo, addon qty
- `/components/booking/booking-summary.tsx` - Updated display
- `/dashboard/bookings/page.tsx` - Added cancel booking modal
- `/booking/confirmation/[id]/page.tsx` - Updated display
- `/agent/tours/[id]/edit/page.tsx` - Added publish requirements
- `/agent/tours/new/page.tsx` - Added requirements review
- `/components/tours/booking-card.tsx` - Added availability filtering
- `/components/tours/tour-detail-content.tsx` - Updated ReviewStats
- `/admin/reviews/page.tsx` - Fixed total count
- `/dashboard/messages/page.tsx` - Added query param handling
- `/agent/messages/page.tsx` - Added query param handling
- `/components/messages/unread-badge.tsx` - Added real-time updates

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-14 | SafariPlus Team | Initial documentation |
| 1.1 | 2026-01-14 | QA Team | Comprehensive QA testing and fixes |
