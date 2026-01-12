# Feature: Booking Flow & Checkout

## Status
- [x] Requirements Approved
- [x] Design Complete
- [x] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Last Updated
2026-01-08

## Overview

The booking flow provides a seamless experience for clients to book tours, from tour selection through payment completion. The flow includes tour customization, checkout with traveler details, payment processing via Pesapal, and confirmation with PDF itinerary.

## User Journey

1. **Tour Selection** - Client browses and selects a tour
2. **Tour Customization** - Client customizes accommodations and add-ons
3. **Checkout** - Client enters traveler details and special requests
4. **Payment** - Client selects payment method and completes payment
5. **Confirmation** - Client receives confirmation with booking details

## Implemented Pages

### 1. Checkout Page (`/checkout`)
**File**: `src/app/checkout/page.tsx`

**Features**:
- Order summary sidebar with tour details
- Lead traveler details form (name, email, phone, nationality)
- Additional travelers form (expandable for group bookings)
- Special requests textarea
- Payment method selection (M-Pesa, Card)
- M-Pesa phone number input with Kenyan format validation
- Terms and conditions acceptance checkbox
- Responsive layout (sidebar on desktop, stacked on mobile)
- Real-time price calculation display

**Components**:
- `src/components/checkout/order-summary.tsx` - Tour and pricing summary
- `src/components/checkout/traveler-form.tsx` - Traveler information form
- `src/components/checkout/payment-method-selector.tsx` - Payment method selection

### 2. Payment Page (`/booking/payment`)
**File**: `src/app/booking/payment/page.tsx`

**Features**:
- Payment processing status display
- Loading state with animation
- Pesapal redirect handling
- Error state with retry option
- Mobile-responsive design

### 3. Confirmation Page (`/booking/confirmation/[id]`)
**File**: `src/app/booking/confirmation/[id]/page.tsx`

**Features**:
- Success animation and messaging
- Booking reference number display
- "What happens next" instructions
- Booking summary card (tour, dates, travelers, price)
- Download PDF itinerary button
- Add to calendar button
- Continue browsing CTA
- Agent contact information

### 4. Cancel/Error Page
**Features**:
- Payment failure messaging
- Retry payment option
- Contact support information
- Return to booking option

## API Endpoints

### POST /api/payments/initiate
**Purpose**: Initialize payment with Pesapal

**Request**:
```json
{
  "bookingId": "string",
  "paymentMethod": "MPESA" | "CARD",
  "phone": "string (optional, required for M-Pesa)"
}
```

**Response**:
```json
{
  "success": true,
  "redirectUrl": "https://pay.pesapal.com/...",
  "orderTrackingId": "string"
}
```

### GET /api/payments/status
**Purpose**: Check payment status

**Query Parameters**:
- `orderTrackingId`: Pesapal order tracking ID

**Response**:
```json
{
  "status": "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
  "bookingId": "string",
  "paymentMethod": "MPESA" | "CARD"
}
```

### POST /api/webhooks/pesapal
**Purpose**: Handle Pesapal IPN callbacks

**Features**:
- Signature verification
- Idempotent processing
- Booking status update
- Commission calculation
- Email notification trigger

### GET /api/bookings/[id]/itinerary
**Purpose**: Generate PDF itinerary

**Response**: PDF file download

## UI Components

### OrderSummary Component
**File**: `src/components/checkout/order-summary.tsx`

Displays:
- Tour image and title
- Travel dates
- Number of travelers
- Base price breakdown
- Accommodation selections with prices
- Add-on selections with prices
- Total price

### TravelerForm Component
**File**: `src/components/checkout/traveler-form.tsx`

Fields:
- Full name (required)
- Email (required, validated)
- Phone (required, formatted)
- Nationality (dropdown)
- Date of birth (optional)
- Passport number (optional)
- Special requirements (textarea)

### PaymentMethodSelector Component
**File**: `src/components/checkout/payment-method-selector.tsx`

Options:
- M-Pesa (with phone number input)
- Card (Visa, Mastercard)
- Display of secure payment badges

## State Management

The checkout flow uses React state and URL parameters:

1. **Booking Data**: Passed via URL query parameters or fetched from API
2. **Form State**: React Hook Form with Zod validation
3. **Payment State**: Managed via API polling and Pesapal callbacks

## Validation Rules

### Traveler Form
- Name: Required, min 2 characters
- Email: Required, valid email format
- Phone: Required, valid phone format
- Nationality: Required

### Payment
- M-Pesa: Valid Kenyan phone number (07XX or 01XX format)
- Terms: Must be accepted

## Error Handling

1. **Form Validation Errors**: Inline field errors
2. **API Errors**: Toast notifications
3. **Payment Failures**: Dedicated error page with retry
4. **Network Errors**: Loading states with retry

## Mobile Responsiveness

- Stacked layout on mobile (< 768px)
- Sidebar layout on tablet/desktop (>= 768px)
- Touch-friendly input sizes
- Floating action buttons on mobile

## Integration Points

### Pesapal Integration
- API 3.0 with OAuth token management
- M-Pesa STK Push
- Card payment redirect
- IPN webhook for status updates

### Email Integration
- Booking confirmation email on successful payment
- PDF itinerary attachment
- Resend API for delivery

### PDF Generation
- React-PDF for itinerary generation
- Branded template with SafariPlus styling
- Day-by-day itinerary
- Price breakdown

## File Structure

```
src/
├── app/
│   ├── checkout/
│   │   └── page.tsx
│   ├── booking/
│   │   ├── payment/
│   │   │   └── page.tsx
│   │   └── confirmation/
│   │       └── [id]/
│   │           └── page.tsx
│   └── api/
│       ├── payments/
│       │   ├── initiate/
│       │   │   └── route.ts
│       │   └── status/
│       │       └── route.ts
│       ├── webhooks/
│       │   └── pesapal/
│       │       └── route.ts
│       └── bookings/
│           └── [id]/
│               └── itinerary/
│                   └── route.ts
├── components/
│   └── checkout/
│       ├── order-summary.tsx
│       ├── traveler-form.tsx
│       └── payment-method-selector.tsx
└── lib/
    ├── pesapal.ts
    ├── email/
    │   └── index.ts
    └── pdf/
        └── itinerary-template.tsx
```

## Future Enhancements (Phase 2)

- [ ] Save payment methods for returning customers
- [ ] Promo code / discount code support
- [ ] Split payment options
- [ ] Group booking with multiple payers
- [ ] Travel insurance add-on
- [ ] Express checkout for logged-in users
