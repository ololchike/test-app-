# Feature: Payment Processing

## Status
- [x] Requirements Approved
- [ ] Design Complete
- [ ] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Overview

The payment system integrates with Pesapal to process payments via M-Pesa, card payments, and other East African payment methods. It handles payment initiation, webhook processing, status tracking, and refunds.

## User Stories

### Client
- As a client, I want to pay for my booking using M-Pesa so that I can use my preferred payment method
- As a client, I want to pay using my debit/credit card so that I have payment flexibility
- As a client, I want to see real-time payment status updates so that I know if my payment succeeded
- As a client, I want to receive a payment confirmation email with receipt details
- As a client, I want to request a refund if I cancel my booking within the allowed window

### Agent
- As an agent, I want to see payment status for all my bookings
- As an agent, I want to be notified when a booking payment is complete
- As an agent, I want to see my earnings breakdown per booking

### Admin
- As an admin, I want to view all payment transactions on the platform
- As an admin, I want to process refund requests
- As an admin, I want to reconcile payments with Pesapal
- As an admin, I want to see payment analytics and reports

## Acceptance Criteria

### Payment Initiation
- [ ] Client can select from available payment methods (M-Pesa, Card, Airtel Money)
- [ ] M-Pesa requires valid Kenyan phone number (format: 254XXXXXXXXX)
- [ ] Card payment redirects to Pesapal hosted checkout
- [ ] Payment request includes correct amount, currency, and booking reference
- [ ] Payment timeout is set to 30 minutes
- [ ] Client cannot initiate multiple payments for same booking simultaneously

### Payment Processing
- [ ] IPN webhook endpoint receives Pesapal notifications
- [ ] Webhook validates Pesapal signature before processing
- [ ] Payment status updates are idempotent (safe to receive multiple times)
- [ ] Successful payment moves booking to CONFIRMED status
- [ ] Failed payment keeps booking in PENDING status
- [ ] Agent's pending balance is updated on successful payment

### Payment Status
- [ ] Client can check payment status from booking details
- [ ] Status polling available for pending payments (every 10 seconds)
- [ ] Clear error messages for failed payments
- [ ] Retry option available for failed payments

### Refunds
- [ ] Admin can initiate full refund for cancelled bookings
- [ ] Partial refunds supported (Phase 2)
- [ ] Refund updates payment status to REFUNDED
- [ ] Refund adjusts agent balance accordingly
- [ ] Client receives refund confirmation email

## Technical Requirements

### Pesapal API 3.0 Integration

```typescript
// lib/pesapal/client.ts
import crypto from "crypto"

interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  apiUrl: string
  ipnId: string
}

export class PesapalClient {
  private config: PesapalConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor() {
    this.config = {
      consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
      apiUrl: process.env.PESAPAL_API_URL || "https://pay.pesapal.com/v3",
      ipnId: process.env.PESAPAL_IPN_ID!,
    }
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch(`${this.config.apiUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get Pesapal token: ${response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.token
    this.tokenExpiry = new Date(data.expiryDate)

    return this.accessToken
  }

  async submitOrder(order: PesapalOrder): Promise<PesapalOrderResponse> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.config.apiUrl}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: order.merchantReference,
        currency: order.currency,
        amount: order.amount,
        description: order.description,
        callback_url: order.callbackUrl,
        notification_id: this.config.ipnId,
        billing_address: order.billingAddress,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Pesapal order submission failed: ${error.message}`)
    }

    return response.json()
  }

  async getTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `${this.config.apiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.statusText}`)
    }

    return response.json()
  }

  verifyIpnSignature(payload: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", this.config.consumerSecret)
      .update(payload)
      .digest("hex")
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  }
}

export const pesapal = new PesapalClient()
```

### Payment Initiation API

```typescript
// app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pesapal } from "@/lib/pesapal/client"
import { z } from "zod"

const initiateSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.enum(["MPESA", "CARD", "AIRTEL_MONEY"]),
  phoneNumber: z.string().optional(), // Required for M-Pesa
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = initiateSchema.parse(body)

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
      include: {
        tour: true,
        payment: true,
        client: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify ownership
    if (booking.clientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if payment already exists and is not failed
    if (booking.payment && booking.payment.status !== "FAILED") {
      return NextResponse.json(
        { error: "Payment already initiated" },
        { status: 400 }
      )
    }

    // Validate phone number for M-Pesa
    if (data.paymentMethod === "MPESA" && !data.phoneNumber) {
      return NextResponse.json(
        { error: "Phone number required for M-Pesa" },
        { status: 400 }
      )
    }

    // Generate merchant reference
    const merchantReference = `SP-${booking.bookingNumber}-${Date.now()}`

    // Submit to Pesapal
    const pesapalResponse = await pesapal.submitOrder({
      merchantReference,
      currency: booking.currency,
      amount: booking.totalPrice,
      description: `Booking ${booking.bookingNumber} - ${booking.tour.title}`,
      callbackUrl: `${process.env.NEXT_PUBLIC_URL}/booking/confirmation/${booking.id}`,
      billingAddress: {
        email_address: booking.contactEmail,
        phone_number: data.phoneNumber || booking.contactPhone,
        first_name: booking.client.name?.split(" ")[0] || "Customer",
        last_name: booking.client.name?.split(" ").slice(1).join(" ") || "",
      },
    })

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        merchantReference,
        pesapalOrderId: pesapalResponse.order_tracking_id,
        method: data.paymentMethod,
        status: "PROCESSING",
        paymentAccount: data.phoneNumber,
        initiatedAt: new Date(),
        failedAt: null,
        failureReason: null,
      },
      create: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        currency: booking.currency,
        merchantReference,
        pesapalOrderId: pesapalResponse.order_tracking_id,
        method: data.paymentMethod,
        status: "PROCESSING",
        paymentAccount: data.phoneNumber,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        redirectUrl: pesapalResponse.redirect_url,
        orderTrackingId: pesapalResponse.order_tracking_id,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Payment initiation error:", error)
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 }
    )
  }
}
```

### Pesapal IPN Webhook

```typescript
// app/api/webhooks/pesapal/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { pesapal } from "@/lib/pesapal/client"
import { sendBookingConfirmationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = body

    console.log("Pesapal IPN received:", { OrderTrackingId, OrderMerchantReference, OrderNotificationType })

    // Get transaction status from Pesapal
    const status = await pesapal.getTransactionStatus(OrderTrackingId)

    // Find payment by order tracking ID
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
            client: true,
            tour: true,
            agent: true,
          },
        },
      },
    })

    if (!payment) {
      console.error("Payment not found for IPN:", OrderTrackingId)
      return NextResponse.json({ status: "ok" })
    }

    // Map Pesapal status to our status
    const statusMap: Record<string, string> = {
      COMPLETED: "COMPLETED",
      PENDING: "PROCESSING",
      INVALID: "FAILED",
      FAILED: "FAILED",
    }

    const newStatus = statusMap[status.payment_status_description] || "PROCESSING"

    // Update payment (idempotent)
    if (payment.status !== newStatus) {
      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: newStatus,
            pesapalTrackingId: status.confirmation_code,
            paymentConfirmation: status.confirmation_code,
            processedAt: newStatus === "COMPLETED" ? new Date() : undefined,
            failedAt: newStatus === "FAILED" ? new Date() : undefined,
            failureReason: newStatus === "FAILED" ? status.description : undefined,
          },
        })

        // If payment completed, update booking and agent balance
        if (newStatus === "COMPLETED" && payment.booking.status === "PENDING") {
          await tx.booking.update({
            where: { id: payment.booking.id },
            data: {
              status: "CONFIRMED",
              confirmedAt: new Date(),
            },
          })

          // Add to agent's pending balance
          await tx.agent.update({
            where: { id: payment.booking.agentId },
            data: {
              pendingBalance: { increment: payment.booking.agentEarnings },
            },
          })

          // Update tour booking count
          await tx.tour.update({
            where: { id: payment.booking.tourId },
            data: {
              bookingCount: { increment: 1 },
            },
          })
        }
      })

      // Send confirmation email if payment completed
      if (newStatus === "COMPLETED") {
        await sendBookingConfirmationEmail(payment.booking)
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Pesapal IPN error:", error)
    return NextResponse.json({ status: "ok" }) // Always return ok to Pesapal
  }
}
```

### Payment Status API

```typescript
// app/api/payments/status/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pesapal } from "@/lib/pesapal/client"

export async function GET(request: NextRequest) {
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
      booking: {
        select: {
          clientId: true,
          agentId: true,
          status: true,
        },
      },
    },
  })

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 })
  }

  // Verify access
  const isClient = payment.booking.clientId === session.user.id
  const isAdmin = session.user.role === "ADMIN"

  if (!isClient && !isAdmin) {
    // Check if agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })
    if (!agent || agent.id !== payment.booking.agentId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  // If payment is processing, check status with Pesapal
  if (payment.status === "PROCESSING" && payment.pesapalOrderId) {
    try {
      const pesapalStatus = await pesapal.getTransactionStatus(payment.pesapalOrderId)

      // Return live status
      return NextResponse.json({
        success: true,
        data: {
          status: payment.status,
          pesapalStatus: pesapalStatus.payment_status_description,
          bookingStatus: payment.booking.status,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          confirmation: payment.paymentConfirmation,
        },
      })
    } catch (error) {
      console.error("Error fetching Pesapal status:", error)
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      status: payment.status,
      bookingStatus: payment.booking.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      confirmation: payment.paymentConfirmation,
      processedAt: payment.processedAt,
      failureReason: payment.failureReason,
    },
  })
}
```

### Refund API

```typescript
// app/api/payments/refund/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const refundSchema = z.object({
  paymentId: z.string(),
  amount: z.number().positive().optional(), // Full refund if not specified
  reason: z.string().min(10),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = refundSchema.parse(body)

    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: {
        booking: {
          include: { agent: true },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only refund completed payments" },
        { status: 400 }
      )
    }

    if (payment.refundedAt) {
      return NextResponse.json(
        { error: "Payment already refunded" },
        { status: 400 }
      )
    }

    const refundAmount = data.amount || payment.amount

    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "REFUNDED",
          refundedAt: new Date(),
          refundAmount,
          refundReason: data.reason,
        },
      })

      // Update booking status
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: `Refund: ${data.reason}`,
        },
      })

      // Adjust agent balance
      const agentEarningsRefund =
        (refundAmount / payment.amount) * payment.booking.agentEarnings

      // If booking was completed, deduct from available
      // If still pending completion, deduct from pending
      if (payment.booking.completedAt) {
        await tx.agent.update({
          where: { id: payment.booking.agentId },
          data: {
            availableBalance: { decrement: agentEarningsRefund },
            totalEarnings: { decrement: agentEarningsRefund },
          },
        })
      } else {
        await tx.agent.update({
          where: { id: payment.booking.agentId },
          data: {
            pendingBalance: { decrement: agentEarningsRefund },
          },
        })
      }
    })

    // TODO: Process actual refund via Pesapal
    // TODO: Send refund confirmation email

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Refund error:", error)
    return NextResponse.json({ error: "Refund failed" }, { status: 500 })
  }
}
```

### Type Definitions

```typescript
// types/pesapal.ts
export interface PesapalOrder {
  merchantReference: string
  currency: string
  amount: number
  description: string
  callbackUrl: string
  billingAddress: {
    email_address: string
    phone_number: string
    first_name: string
    last_name: string
    country_code?: string
  }
}

export interface PesapalOrderResponse {
  order_tracking_id: string
  merchant_reference: string
  redirect_url: string
  error?: {
    error_type: string
    code: string
    message: string
  }
}

export interface PesapalTransactionStatus {
  payment_method: string
  amount: number
  created_date: string
  confirmation_code: string
  payment_status_description: string
  description: string
  message: string
  payment_account: string
  currency: string
  status_code: number
  merchant_reference: string
}
```

## Dependencies

- Pesapal API 3.0
- crypto (Node.js built-in)
- Email service for notifications
- Prisma for database operations

## MVP Phase
Phase 1 - Core MVP (Sprint 7-8)

## Estimated Effort
21 story points

## Implementation Notes

### Payment Flow

```
Client selects payment method
         |
         v
POST /api/payments/initiate
         |
         v
Pesapal Submit Order API
         |
         v
Client redirected to Pesapal checkout
         |
         v
Client completes payment on Pesapal
         |
         v
Pesapal sends IPN to POST /api/webhooks/pesapal
         |
         v
Verify and update payment status
         |
         v
Update booking to CONFIRMED
         |
         v
Send confirmation email
```

### Security Checklist
- [ ] IPN webhook validates Pesapal signatures
- [ ] Payment amounts verified against booking
- [ ] Idempotent webhook processing
- [ ] Rate limiting on payment initiation
- [ ] Secure storage of Pesapal credentials

### Testing Checklist
- [ ] M-Pesa payment flow (sandbox)
- [ ] Card payment flow (sandbox)
- [ ] IPN webhook processing
- [ ] Duplicate IPN handling
- [ ] Failed payment handling
- [ ] Refund processing
- [ ] Balance updates

### Environment Variables
```bash
PESAPAL_CONSUMER_KEY=your_consumer_key
PESAPAL_CONSUMER_SECRET=your_consumer_secret
PESAPAL_API_URL=https://cybqa.pesapal.com/pesapalv3  # Sandbox
PESAPAL_IPN_ID=your_ipn_id
```

## Approval
- [ ] User Approved
- Date:
- Notes:
