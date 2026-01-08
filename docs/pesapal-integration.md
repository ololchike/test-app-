# SafariPlus - Pesapal Payment Integration

## Overview

This document details the integration requirements for Pesapal API 3.0, enabling SafariPlus to accept payments via M-Pesa, Airtel Money, credit/debit cards, and other payment methods popular in East Africa.

---

## Pesapal Overview

### What is Pesapal?
Pesapal is East Africa's leading payment service provider, regulated by Central Banks of Kenya, Uganda, Tanzania, and Rwanda. Founded in 2009, it provides secure payment processing for online and offline businesses.

### Supported Payment Methods

| Method | Countries | Processing Time |
|--------|-----------|-----------------|
| M-Pesa | Kenya, Tanzania | Instant |
| Airtel Money | Kenya, Tanzania, Uganda | Instant |
| Visa | All | 1-3 business days |
| Mastercard | All | 1-3 business days |
| American Express | Kenya | 1-3 business days |
| Equity Bank | Kenya | Instant |
| Cooperative Bank | Kenya | Instant |
| PesaPal Wallet | All | Instant |

### Supported Currencies
- KES (Kenya Shilling)
- TZS (Tanzania Shilling)
- UGX (Uganda Shilling)
- USD (US Dollar)

### Fee Structure
- **Transaction Fee**: 3.5% per transaction
- **Setup Fee**: Free
- **Monthly Fee**: Free
- **Settlement**: Next business day for mobile money, 1-3 days for cards

---

## API 3.0 Integration

### Prerequisites

1. **Business Registration**
   - Valid business registration in Kenya/Tanzania/Uganda
   - Bank account for settlements
   - Valid email and phone number

2. **Account Setup**
   - Register at [pesapal.com/business](https://www.pesapal.com/business)
   - Complete KYC verification
   - Obtain Consumer Key and Consumer Secret
   - Configure IPN (Instant Payment Notification) URL

3. **Sandbox Testing**
   - Sandbox URL: `https://cybqa.pesapal.com/pesapalv3`
   - Production URL: `https://pay.pesapal.com/v3`

### API Authentication

Pesapal 3.0 uses JWT (JSON Web Token) authentication.

```typescript
// lib/pesapal.ts

interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  apiUrl: string
  ipnUrl: string
}

interface AuthResponse {
  token: string
  expiryDate: string
  error?: string
  status: string
}

class PesapalClient {
  private config: PesapalConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: PesapalConfig) {
    this.config = config
  }

  // Get or refresh access token
  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch(`${this.config.apiUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      }),
    })

    const data: AuthResponse = await response.json()

    if (data.error || data.status !== "200") {
      throw new Error(`Pesapal auth failed: ${data.error}`)
    }

    this.accessToken = data.token
    this.tokenExpiry = new Date(data.expiryDate)

    return this.accessToken
  }
}
```

### Register IPN URL

Before processing payments, register the callback URL where Pesapal will send payment notifications.

```typescript
interface IPNRegistrationResponse {
  url: string
  created_date: string
  ipn_id: string
  error?: string
  status: string
}

async registerIPN(): Promise<string> {
  const token = await this.getAccessToken()

  const response = await fetch(`${this.config.apiUrl}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: this.config.ipnUrl,
      ipn_notification_type: "POST", // or "GET"
    }),
  })

  const data: IPNRegistrationResponse = await response.json()

  if (data.error || data.status !== "200") {
    throw new Error(`IPN registration failed: ${data.error}`)
  }

  return data.ipn_id
}
```

### Submit Order Request

```typescript
interface OrderRequest {
  id: string                    // Unique order ID (your reference)
  currency: string             // KES, USD, TZS, UGX
  amount: number
  description: string
  callback_url: string         // Where to redirect after payment
  notification_id: string      // IPN ID from registration
  branch?: string
  billing_address: {
    email_address: string
    phone_number?: string
    country_code?: string      // e.g., "KE"
    first_name?: string
    middle_name?: string
    last_name?: string
    line_1?: string
    line_2?: string
    city?: string
    state?: string
    postal_code?: string
    zip_code?: string
  }
}

interface OrderResponse {
  order_tracking_id: string    // Pesapal's tracking ID
  merchant_reference: string   // Your order ID
  redirect_url: string         // URL to redirect customer
  error?: {
    error_type: string
    code: string
    message: string
  }
  status: string
}

async submitOrder(order: OrderRequest): Promise<OrderResponse> {
  const token = await this.getAccessToken()

  const response = await fetch(`${this.config.apiUrl}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(order),
  })

  const data: OrderResponse = await response.json()

  if (data.error || data.status !== "200") {
    throw new Error(`Order submission failed: ${data.error?.message}`)
  }

  return data
}
```

### Get Transaction Status

```typescript
interface TransactionStatusResponse {
  payment_method: string
  amount: number
  created_date: string
  confirmation_code: string
  payment_status_description: string
  description: string
  message: string
  payment_account: string      // Phone number or card last 4
  call_back_url: string
  status_code: number          // 0 = Invalid, 1 = Completed, 2 = Failed, 3 = Reversed
  merchant_reference: string
  payment_status_code: string
  currency: string
  error?: {
    error_type: string
    code: string
    message: string
  }
  status: string
}

async getTransactionStatus(orderTrackingId: string): Promise<TransactionStatusResponse> {
  const token = await this.getAccessToken()

  const response = await fetch(
    `${this.config.apiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  )

  const data: TransactionStatusResponse = await response.json()

  if (data.error || data.status !== "200") {
    throw new Error(`Status check failed: ${data.error?.message}`)
  }

  return data
}
```

---

## Payment Flow Implementation

### Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Client    │     │  SafariPlus  │     │   Pesapal    │     │   M-Pesa/    │
│              │     │   Backend    │     │    API       │     │    Card      │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │ 1. Click "Pay Now" │                    │                    │
       │───────────────────>│                    │                    │
       │                    │                    │                    │
       │                    │ 2. Create Payment  │                    │
       │                    │    record          │                    │
       │                    │────┐               │                    │
       │                    │<───┘               │                    │
       │                    │                    │                    │
       │                    │ 3. Submit Order    │                    │
       │                    │───────────────────>│                    │
       │                    │                    │                    │
       │                    │ 4. order_tracking_id                    │
       │                    │    + redirect_url  │                    │
       │                    │<───────────────────│                    │
       │                    │                    │                    │
       │ 5. Redirect to     │                    │                    │
       │    Pesapal checkout│                    │                    │
       │<───────────────────│                    │                    │
       │                    │                    │                    │
       │ 6. Select payment method & complete     │                    │
       │─────────────────────────────────────────>                    │
       │                    │                    │                    │
       │                    │                    │ 7. Process payment │
       │                    │                    │───────────────────>│
       │                    │                    │<───────────────────│
       │                    │                    │                    │
       │                    │ 8. IPN Callback    │                    │
       │                    │<───────────────────│                    │
       │                    │                    │                    │
       │                    │ 9. Verify & Update │                    │
       │                    │    Payment Status  │                    │
       │                    │────┐               │                    │
       │                    │<───┘               │                    │
       │                    │                    │                    │
       │ 10. Redirect to callback_url            │                    │
       │<────────────────────────────────────────│                    │
       │                    │                    │                    │
       │ 11. Show confirmation                   │                    │
       │<───────────────────│                    │                    │
       │                    │                    │                    │
```

### Backend Implementation

#### 1. Payment Initiation Endpoint

```typescript
// app/api/payments/initiate/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pesapal } from "@/lib/pesapal"
import { z } from "zod"

const initiateSchema = z.object({
  bookingId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId } = initiateSchema.parse(body)

    // Get booking with tour and agent info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tour: true,
        agent: true,
        client: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.clientId !== session.user.id) {
      return NextResponse.json({ error: "Not your booking" }, { status: 403 })
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    })

    if (existingPayment?.status === "COMPLETED") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 })
    }

    // Generate unique merchant reference
    const merchantReference = `SP-${booking.bookingNumber}-${Date.now()}`

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        amount: booking.totalPrice,
        currency: booking.currency,
        merchantReference,
        status: "PENDING",
      },
      update: {
        merchantReference,
        status: "PENDING",
        failedAt: null,
        failureReason: null,
      },
    })

    // Submit order to Pesapal
    const pesapalResponse = await pesapal.submitOrder({
      id: merchantReference,
      currency: booking.currency,
      amount: booking.totalPrice,
      description: `Safari booking: ${booking.tour.title}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}/confirmation`,
      notification_id: process.env.PESAPAL_IPN_ID!,
      billing_address: {
        email_address: booking.contactEmail,
        phone_number: booking.contactPhone,
        first_name: booking.client.name?.split(" ")[0] || "",
        last_name: booking.client.name?.split(" ").slice(1).join(" ") || "",
      },
    })

    // Update payment with Pesapal tracking ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        pesapalOrderId: pesapalResponse.order_tracking_id,
        status: "PROCESSING",
      },
    })

    return NextResponse.json({
      success: true,
      redirectUrl: pesapalResponse.redirect_url,
      orderTrackingId: pesapalResponse.order_tracking_id,
    })
  } catch (error) {
    console.error("Payment initiation failed:", error)
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    )
  }
}
```

#### 2. IPN Webhook Handler

```typescript
// app/api/webhooks/pesapal/route.ts

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { pesapal } from "@/lib/pesapal"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
    } = body

    // Verify the transaction status with Pesapal
    const status = await pesapal.getTransactionStatus(OrderTrackingId)

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { pesapalOrderId: OrderTrackingId },
          { merchantReference: OrderMerchantReference },
        ],
      },
      include: {
        booking: {
          include: {
            agent: true,
          },
        },
      },
    })

    if (!payment) {
      console.error("Payment not found for IPN:", OrderTrackingId)
      return NextResponse.json({ status: "Payment not found" }, { status: 404 })
    }

    // Map Pesapal status codes
    // 0 = Invalid, 1 = Completed, 2 = Failed, 3 = Reversed
    const statusMap: Record<number, "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED"> = {
      0: "PENDING",
      1: "COMPLETED",
      2: "FAILED",
      3: "REFUNDED",
    }

    const newStatus = statusMap[status.status_code] || "PENDING"

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        pesapalTrackingId: status.confirmation_code,
        method: mapPaymentMethod(status.payment_method),
        paymentAccount: status.payment_account,
        paymentConfirmation: status.confirmation_code,
        processedAt: newStatus === "COMPLETED" ? new Date() : null,
        failedAt: newStatus === "FAILED" ? new Date() : null,
        failureReason: newStatus === "FAILED" ? status.message : null,
      },
    })

    // If payment completed, update booking and agent earnings
    if (newStatus === "COMPLETED") {
      await prisma.$transaction([
        // Update booking status
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        }),

        // Update agent pending balance
        prisma.agent.update({
          where: { id: payment.booking.agentId },
          data: {
            pendingBalance: {
              increment: payment.booking.agentEarnings,
            },
          },
        }),

        // Create audit log
        prisma.auditLog.create({
          data: {
            action: "PAYMENT_COMPLETED",
            entityType: "Payment",
            entityId: payment.id,
            newValue: {
              amount: payment.amount,
              method: status.payment_method,
              confirmation: status.confirmation_code,
            },
          },
        }),
      ])

      // TODO: Send confirmation email to client
      // TODO: Send notification to agent
    }

    // Return success to Pesapal
    return NextResponse.json({
      orderNotificationType: OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: 200,
    })
  } catch (error) {
    console.error("IPN processing failed:", error)
    return NextResponse.json({ error: "Processing failed" }, { status: 500 })
  }
}

function mapPaymentMethod(pesapalMethod: string): "MPESA" | "CARD" | "BANK_TRANSFER" | "PAYPAL" {
  const methodMap: Record<string, "MPESA" | "CARD" | "BANK_TRANSFER" | "PAYPAL"> = {
    "MPESA": "MPESA",
    "Airtel Money": "MPESA", // Grouping mobile money
    "Visa": "CARD",
    "Mastercard": "CARD",
    "American Express": "CARD",
    "Equity": "BANK_TRANSFER",
    "Cooperative Bank": "BANK_TRANSFER",
  }
  return methodMap[pesapalMethod] || "CARD"
}
```

#### 3. Payment Status Check Endpoint

```typescript
// app/api/payments/status/route.ts

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pesapal } from "@/lib/pesapal"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get("bookingId")

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID required" }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // If payment is still processing, check with Pesapal
    if (payment.status === "PROCESSING" && payment.pesapalOrderId) {
      const status = await pesapal.getTransactionStatus(payment.pesapalOrderId)

      // Status will be updated via IPN, but return current for UI
      return NextResponse.json({
        status: payment.status,
        pesapalStatus: status.payment_status_description,
        amount: payment.amount,
        currency: payment.currency,
      })
    }

    return NextResponse.json({
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      confirmation: payment.paymentConfirmation,
      processedAt: payment.processedAt,
    })
  } catch (error) {
    console.error("Status check failed:", error)
    return NextResponse.json(
      { error: "Status check failed" },
      { status: 500 }
    )
  }
}
```

---

## Frontend Implementation

### Payment Button Component

```typescript
// components/bookings/payment-button.tsx

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"

interface PaymentButtonProps {
  bookingId: string
  amount: number
  currency: string
  disabled?: boolean
}

export function PaymentButton({
  bookingId,
  amount,
  currency,
  disabled,
}: PaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Payment initiation failed")
      }

      // Redirect to Pesapal checkout
      window.location.href = data.redirectUrl
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment failed. Please try again.")
      setIsLoading(false)
    }
  }

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay {formattedAmount}
        </>
      )}
    </Button>
  )
}
```

### Payment Confirmation Page

```typescript
// app/(client)/bookings/[id]/confirmation/page.tsx

import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CheckCircle, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  params: { id: string }
  searchParams: { OrderTrackingId?: string }
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      tour: { include: { images: { where: { isPrimary: true } } } },
      payment: true,
      agent: true,
    },
  })

  if (!booking) notFound()
  if (booking.clientId !== session.user.id) redirect("/")

  const status = booking.payment?.status || "PENDING"

  return (
    <div className="container max-w-2xl py-12">
      <div className="text-center space-y-6">
        {status === "COMPLETED" && (
          <>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your booking has been confirmed. You will receive a confirmation
              email shortly.
            </p>
          </>
        )}

        {status === "FAILED" && (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Payment Failed</h1>
            <p className="text-muted-foreground">
              {booking.payment?.failureReason ||
                "Something went wrong with your payment. Please try again."}
            </p>
          </>
        )}

        {(status === "PENDING" || status === "PROCESSING") && (
          <>
            <Clock className="h-16 w-16 text-yellow-500 mx-auto animate-pulse" />
            <h1 className="text-2xl font-bold">Payment Processing</h1>
            <p className="text-muted-foreground">
              Your payment is being processed. This page will update
              automatically.
            </p>
          </>
        )}

        {/* Booking Details */}
        <div className="mt-8 p-6 bg-muted rounded-lg text-left">
          <h2 className="font-semibold mb-4">Booking Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Booking Reference</dt>
              <dd className="font-mono">{booking.bookingNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tour</dt>
              <dd>{booking.tour.title}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Travel Date</dt>
              <dd>{new Date(booking.travelDate).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Travelers</dt>
              <dd>{booking.numberOfTravelers}</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>
                {booking.currency} {booking.totalPrice.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center mt-6">
          <Button asChild>
            <Link href="/bookings">View All Bookings</Link>
          </Button>
          {status === "FAILED" && (
            <Button variant="outline" asChild>
              <Link href={`/book/${booking.tourId}`}>Try Again</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Testing

### Sandbox Testing Credentials

Pesapal provides sandbox credentials for testing:

| Payment Method | Test Credentials |
|----------------|------------------|
| M-Pesa | Phone: 0700000000-0700000003 (auto-success) |
| Visa | Card: 4111111111111111, Exp: Any future, CVV: 123 |
| Mastercard | Card: 5500000000000004, Exp: Any future, CVV: 123 |

### Test Scenarios

| Scenario | Expected Behavior | Test Steps |
|----------|-------------------|------------|
| Successful M-Pesa | Payment completes, IPN received | Use test phone, complete STK push |
| Successful Card | Payment completes, IPN received | Use test card, complete 3DS |
| Failed Payment | Error displayed, can retry | Use invalid credentials |
| IPN Retry | System handles duplicate IPNs | Manually trigger IPN twice |
| Timeout | Payment remains pending | Start payment, don't complete |

---

## Security Considerations

### Best Practices

1. **Never store card data** - Pesapal handles all card information
2. **Verify IPN origin** - Validate requests come from Pesapal IPs
3. **Use HTTPS** - All payment URLs must be HTTPS
4. **Idempotency** - Handle duplicate IPN callbacks gracefully
5. **Audit logging** - Log all payment events for reconciliation

### IPN Validation

```typescript
// Validate IPN is from Pesapal
const PESAPAL_IPS = [
  "196.201.214.0/24",
  "197.248.0.0/16",
  // Add Pesapal production IPs
]

function validateIPNSource(request: NextRequest): boolean {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const ip = forwardedFor?.split(",")[0] || request.ip

  // Validate IP is from Pesapal range
  // In production, use a proper IP range validation library
  return true // Implement proper validation
}
```

---

## Error Handling

### Common Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| AUTH_FAILED | Invalid consumer credentials | Check API keys |
| INVALID_CURRENCY | Currency not supported | Use KES, TZS, UGX, or USD |
| DUPLICATE_ORDER | Order ID already used | Generate unique merchant reference |
| IPN_NOT_REGISTERED | IPN URL not configured | Register IPN URL first |

### Retry Strategy

```typescript
// Implement exponential backoff for API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, i)))
    }
  }
  throw new Error("Max retries exceeded")
}
```

---

## Withdrawal System

### Agent Withdrawal Flow

```
Agent requests withdrawal
        ↓
System validates available balance
        ↓
Creates withdrawal record (PENDING)
        ↓
Admin reviews request
        ↓
Admin approves/rejects
        ↓
If approved: Process via bank/M-Pesa
        ↓
Update withdrawal status & agent balance
```

### Implementation Notes

- Minimum withdrawal: $50 (configurable)
- Processing time: 1-3 business days
- Withdrawal methods: M-Pesa, Bank Transfer
- Admin must verify withdrawal requests manually (Phase 1)
- Future: Automated payouts via Pesapal B2C API

---

## Approval Checklist

- [ ] Pesapal sandbox account created
- [ ] API integration tested
- [ ] IPN URL registered and tested
- [ ] Payment flow verified end-to-end
- [ ] Error handling reviewed
- [ ] Security measures approved

**Approver**: ____________________
**Date**: ____________________

---

## References

- [Pesapal API 3.0 Documentation](https://developer.pesapal.com/)
- [Pesapal Developer Portal](https://developer.pesapal.com/)
- [Pesapal Support](https://www.pesapal.com/support)
