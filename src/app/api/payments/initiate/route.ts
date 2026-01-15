import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPesapalClient, generateMerchantReference } from "@/lib/pesapal"
import { getFlutterwaveClient, generateFlutterwaveTxRef } from "@/lib/flutterwave"
import { selectPaymentGateway, type PaymentMethod } from "@/lib/payments/gateway-router"
import { createLogger } from "@/lib/logger"
import { z } from "zod"

const log = createLogger("Payment Initiate")

/**
 * Payment Initiation API Endpoint
 *
 * Validates booking, creates payment record, and submits order to selected gateway
 * Routes to Pesapal or Flutterwave based on payment method and currency
 */

// Validation schema
const initiatePaymentSchema = z.object({
  bookingId: z.string().cuid("Invalid booking ID format"),
  paymentMethod: z.enum(["MPESA", "AIRTEL_MONEY", "CARD", "BANK_TRANSFER", "PAYPAL"]).optional(),
  paymentType: z.enum(["FULL", "DEPOSIT", "PAY_LATER"]).optional(), // Payment type from checkout
  phoneNumber: z.string().optional(), // Required for M-Pesa and Airtel Money
  gateway: z.enum(["pesapal", "flutterwave"]).optional(), // Allow explicit gateway selection
  isBalancePayment: z.boolean().optional(), // True when paying remaining balance for deposit bookings
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = initiatePaymentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { bookingId, paymentMethod, phoneNumber, gateway: requestedGateway, isBalancePayment } = validation.data

    // Fetch booking with all related data
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            destination: true,
          },
        },
        agent: {
          select: {
            id: true,
            businessName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payments: {
          where: {
            status: {
              in: ["PENDING", "PROCESSING", "COMPLETED"],
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    // Validate booking exists
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    // Verify booking belongs to authenticated user
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden. This booking does not belong to you." },
        { status: 403 }
      )
    }

    // Determine if this is a balance payment for a deposit booking
    const completedPayments = booking.payments.filter(p => p.status === "COMPLETED")
    const hasCompletedDeposit = completedPayments.length > 0 &&
      booking.paymentType === "DEPOSIT" &&
      !booking.balancePaidAt

    // Handle balance payment logic
    if (isBalancePayment) {
      // Validate this is a deposit booking with unpaid balance
      if (booking.paymentType !== "DEPOSIT") {
        return NextResponse.json(
          { error: "This booking was not a deposit payment. Balance payment not applicable." },
          { status: 400 }
        )
      }

      if (booking.balancePaidAt) {
        return NextResponse.json(
          { error: "Balance has already been paid for this booking." },
          { status: 400 }
        )
      }

      if (!hasCompletedDeposit) {
        return NextResponse.json(
          { error: "Deposit must be paid before paying the balance." },
          { status: 400 }
        )
      }

      if (!booking.balanceAmount || booking.balanceAmount <= 0) {
        return NextResponse.json(
          { error: "No balance amount due for this booking." },
          { status: 400 }
        )
      }
    } else {
      // Regular payment - check if payment already exists and is completed
      if (completedPayments.length > 0 && !hasCompletedDeposit) {
        return NextResponse.json(
          { error: "Payment already completed for this booking" },
          { status: 400 }
        )
      }

      // If deposit was paid, redirect to balance payment
      if (hasCompletedDeposit) {
        return NextResponse.json(
          {
            error: "Deposit already paid. Use isBalancePayment: true to pay the remaining balance.",
            requiresBalancePayment: true,
            balanceAmount: booking.balanceAmount,
          },
          { status: 400 }
        )
      }
    }

    // Check if there's a pending/processing payment for current payment type
    const pendingPayment = booking.payments.find(
      p => p.status === "PENDING" || p.status === "PROCESSING"
    )

    if (pendingPayment) {
      // If payment was created more than 30 minutes ago, allow retry
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      if (pendingPayment.createdAt > thirtyMinutesAgo && (pendingPayment.pesapalOrderId || pendingPayment.flutterwaveRef)) {
        return NextResponse.json(
          {
            error: "A payment is already in progress for this booking",
            existingPayment: {
              id: pendingPayment.id,
              status: pendingPayment.status,
              createdAt: pendingPayment.createdAt,
            },
          },
          { status: 400 }
        )
      }
    }

    // Validate booking status
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot process payment for cancelled booking" },
        { status: 400 }
      )
    }

    // Calculate the amount to charge
    let amountToCharge = booking.totalAmount
    let paymentDescription = `Safari Booking: ${booking.tour.title} - ${booking.bookingReference}`

    if (isBalancePayment && booking.balanceAmount) {
      // Balance payment - charge only the remaining balance
      amountToCharge = booking.balanceAmount
      paymentDescription = `Balance Payment: ${booking.tour.title} - ${booking.bookingReference}`
    } else if (booking.paymentType === "DEPOSIT" && booking.depositAmount) {
      // Initial deposit payment - charge only the deposit
      amountToCharge = booking.depositAmount
      paymentDescription = `Deposit: ${booking.tour.title} - ${booking.bookingReference}`
    }

    // Determine payment gateway
    const normalizedMethod = (paymentMethod?.toLowerCase() || "card") as PaymentMethod
    const selectedGateway = requestedGateway || selectPaymentGateway(normalizedMethod, booking.currency)

    log.info(`Selected gateway: ${selectedGateway} for method: ${normalizedMethod}, currency: ${booking.currency}`)

    // Route to appropriate gateway
    if (selectedGateway === "flutterwave") {
      return await initiateFlutterwavePayment(booking, paymentMethod || "CARD", phoneNumber, amountToCharge, paymentDescription, isBalancePayment)
    } else {
      return await initiatePesapalPayment(booking, paymentMethod || "CARD", phoneNumber, amountToCharge, paymentDescription, isBalancePayment)
    }
  } catch (error) {
    console.error("Error initiating payment:", error)

    return NextResponse.json(
      {
        error: "Failed to initiate payment",
        details: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}

// Pesapal payment initiation
async function initiatePesapalPayment(
  booking: {
    id: string
    bookingReference: string
    totalAmount: number
    currency: string
    contactEmail: string
    contactPhone: string | null
    contactName: string | null
    tour: { title: string }
    user: { name: string | null }
  },
  paymentMethod: string,
  phoneNumber?: string,
  amountToCharge?: number,
  paymentDescription?: string,
  isBalancePayment?: boolean
) {
  // Use provided amount or default to totalAmount
  const amount = amountToCharge ?? booking.totalAmount
  const description = paymentDescription ?? `Safari Booking: ${booking.tour.title} - ${booking.bookingReference}`

  // Generate unique merchant reference (add BAL prefix for balance payments)
  const referencePrefix = isBalancePayment ? "BAL" : "SP"
  const merchantReference = `${referencePrefix}-${booking.bookingReference}-${Date.now()}`

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: amount,
      currency: booking.currency,
      method: paymentMethod as "MPESA" | "AIRTEL_MONEY" | "CARD" | "BANK_TRANSFER" | "PAYPAL",
      pesapalMerchantRef: merchantReference,
      gateway: "PESAPAL",
      status: "PENDING",
      idempotencyKey: merchantReference,
    },
  })

  // Initialize Pesapal client
  const pesapal = getPesapalClient()

  // Check for development mode
  const isDevMode = process.env.PESAPAL_DEV_MODE === "true"

  // In dev mode, use 1 KES for testing; otherwise use actual amount
  const pesapalAmount = isDevMode ? 1 : amount
  const pesapalCurrency = isDevMode ? "KES" : booking.currency

  if (isDevMode) {
    log.info(`Dev mode enabled: Using ${pesapalCurrency} ${pesapalAmount} for testing`, {
      bookingReference: booking.bookingReference,
    })
  }

  // Normalize phone number for Pesapal (format: 254XXXXXXXXX)
  const rawPhone = phoneNumber || booking.contactPhone || ""
  let normalizedPhone = rawPhone.replace(/\s+/g, "").replace(/[^\d+]/g, "")
  if (normalizedPhone.startsWith("+")) {
    normalizedPhone = normalizedPhone.substring(1) // Remove +
  } else if (normalizedPhone.startsWith("0")) {
    normalizedPhone = "254" + normalizedPhone.substring(1) // 07XX -> 2547XX
  }

  // Prepare order data for Pesapal
  const orderData = {
    id: merchantReference,
    currency: pesapalCurrency,
    amount: pesapalAmount,
    description: description,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/booking/confirmation/${booking.id}`,
    notification_id: process.env.PESAPAL_IPN_ID || "",
    billing_address: {
      email_address: booking.contactEmail,
      phone_number: normalizedPhone || undefined,
      first_name: booking.contactName?.split(" ")[0] || booking.user.name?.split(" ")[0] || "",
      last_name: booking.contactName?.split(" ").slice(1).join(" ") || booking.user.name?.split(" ").slice(1).join(" ") || "",
      country_code: "KE",
    },
  }

  // Submit order to Pesapal
  let pesapalResponse
  try {
    pesapalResponse = await pesapal.submitOrder(orderData)
  } catch (pesapalError) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        statusMessage: pesapalError instanceof Error ? pesapalError.message : "Failed to submit order to Pesapal",
        failedAt: new Date(),
      },
    })

    console.error("Pesapal order submission failed:", pesapalError)

    return NextResponse.json(
      {
        error: "Failed to initiate payment with payment processor",
        details: pesapalError instanceof Error ? pesapalError.message : "Unknown error",
      },
      { status: 500 }
    )
  }

  // Update payment record with Pesapal tracking ID
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      pesapalOrderId: pesapalResponse.order_tracking_id,
      pesapalTrackingId: pesapalResponse.order_tracking_id,
      status: "PROCESSING",
      statusMessage: "Payment initiated, awaiting completion",
    },
  })

  // Update booking status to processing
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "PROCESSING",
    },
  })

  log.info(`Pesapal payment initiated`, {
    paymentId: payment.id,
    bookingReference: booking.bookingReference,
    amount: `${booking.currency} ${amount}`,
    isBalancePayment: isBalancePayment || false,
  })

  return NextResponse.json({
    success: true,
    gateway: "pesapal",
    paymentId: payment.id,
    orderTrackingId: pesapalResponse.order_tracking_id,
    merchantReference: pesapalResponse.merchant_reference,
    redirectUrl: pesapalResponse.redirect_url,
    message: "Payment initiated successfully. Redirecting to payment page...",
  })
}

// Flutterwave payment initiation
async function initiateFlutterwavePayment(
  booking: {
    id: string
    bookingReference: string
    totalAmount: number
    currency: string
    contactEmail: string
    contactPhone: string | null
    contactName: string | null
    tour: { title: string }
    user: { name: string | null }
  },
  paymentMethod: string,
  phoneNumber?: string,
  amountToCharge?: number,
  paymentDescription?: string,
  isBalancePayment?: boolean
) {
  // Use provided amount or default to totalAmount
  const amount = amountToCharge ?? booking.totalAmount
  const description = paymentDescription ?? `Safari Booking: ${booking.tour.title}`

  // Generate unique transaction reference (add BAL prefix for balance payments)
  const referencePrefix = isBalancePayment ? "FLW-BAL" : "FLW"
  const timestamp = Date.now()
  const random = require("crypto").randomBytes(4).toString("hex")
  const txRef = `${referencePrefix}-${booking.bookingReference}-${timestamp}-${random}`

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: amount,
      currency: booking.currency,
      method: paymentMethod as "MPESA" | "AIRTEL_MONEY" | "CARD" | "BANK_TRANSFER" | "PAYPAL",
      flutterwaveRef: txRef,
      gateway: "FLUTTERWAVE",
      status: "PENDING",
      idempotencyKey: txRef,
    },
  })

  // Initialize Flutterwave client
  const flutterwave = getFlutterwaveClient()

  // Check for development mode
  const isDevMode = process.env.FLUTTERWAVE_DEV_MODE === "true"

  // In dev mode, use 10 USD for testing (Flutterwave minimum)
  const flutterwaveAmount = isDevMode ? 10 : amount
  const flutterwaveCurrency = isDevMode ? "USD" : booking.currency

  if (isDevMode) {
    log.info(`Dev mode enabled: Using ${flutterwaveCurrency} ${flutterwaveAmount} for testing`, {
      bookingReference: booking.bookingReference,
    })
  }

  // Prepare payment data for Flutterwave
  const paymentData = {
    tx_ref: txRef,
    amount: flutterwaveAmount,
    currency: flutterwaveCurrency,
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/booking/confirmation/${booking.id}?gateway=flutterwave`,
    customer: {
      email: booking.contactEmail,
      phone_number: phoneNumber || booking.contactPhone || undefined,
      name: booking.contactName || booking.user.name || "Customer",
    },
    customizations: {
      title: "SafariPlus",
      description: description,
      logo: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/icons/icon.svg`,
    },
    meta: {
      booking_id: booking.id,
      booking_reference: booking.bookingReference,
      is_balance_payment: isBalancePayment ? "true" : "false",
    },
  }

  // Submit payment to Flutterwave
  let flutterwaveResponse
  try {
    flutterwaveResponse = await flutterwave.initiatePayment(paymentData)
  } catch (flutterwaveError) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        statusMessage: flutterwaveError instanceof Error ? flutterwaveError.message : "Failed to submit order to Flutterwave",
        failedAt: new Date(),
      },
    })

    console.error("Flutterwave payment initiation failed:", flutterwaveError)

    return NextResponse.json(
      {
        error: "Failed to initiate payment with payment processor",
        details: flutterwaveError instanceof Error ? flutterwaveError.message : "Unknown error",
      },
      { status: 500 }
    )
  }

  // Update payment record
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "PROCESSING",
      statusMessage: "Payment initiated, awaiting completion",
    },
  })

  // Update booking status to processing
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: "PROCESSING",
    },
  })

  log.info(`Flutterwave payment initiated`, {
    paymentId: payment.id,
    bookingReference: booking.bookingReference,
    amount: `${booking.currency} ${amount}`,
    isBalancePayment: isBalancePayment || false,
  })

  return NextResponse.json({
    success: true,
    gateway: "flutterwave",
    paymentId: payment.id,
    txRef: txRef,
    redirectUrl: flutterwaveResponse.data?.link,
    message: "Payment initiated successfully. Redirecting to payment page...",
  })
}
