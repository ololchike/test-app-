import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPesapalClient, generateMerchantReference } from "@/lib/pesapal"
import { createLogger } from "@/lib/logger"
import { z } from "zod"

const log = createLogger("Payment Initiate")

/**
 * Payment Initiation API Endpoint
 *
 * Validates booking, creates payment record, and submits order to Pesapal
 * Returns redirect URL for customer to complete payment
 */

// Validation schema
const initiatePaymentSchema = z.object({
  bookingId: z.string().cuid("Invalid booking ID format"),
  paymentMethod: z.enum(["MPESA", "CARD", "BANK_TRANSFER", "PAYPAL"]).optional(),
  phoneNumber: z.string().optional(), // Required for M-Pesa
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

    const { bookingId, paymentMethod, phoneNumber } = validation.data

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
          take: 1,
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

    // Check if payment already exists and is completed
    if (booking.payments.length > 0 && booking.payments[0].status === "COMPLETED") {
      return NextResponse.json(
        { error: "Payment already completed for this booking" },
        { status: 400 }
      )
    }

    // Check if there's a pending/processing payment
    if (
      booking.payments.length > 0 &&
      (booking.payments[0].status === "PENDING" || booking.payments[0].status === "PROCESSING")
    ) {
      const existingPayment = booking.payments[0]

      // If payment was created more than 30 minutes ago, allow retry
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
      if (existingPayment.createdAt > thirtyMinutesAgo && existingPayment.pesapalOrderId) {
        return NextResponse.json(
          {
            error: "A payment is already in progress for this booking",
            existingPayment: {
              id: existingPayment.id,
              status: existingPayment.status,
              createdAt: existingPayment.createdAt,
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

    // Generate unique merchant reference
    const merchantReference = generateMerchantReference(booking.bookingReference)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        currency: booking.currency,
        method: paymentMethod || "CARD",
        pesapalMerchantRef: merchantReference,
        status: "PENDING",
        idempotencyKey: merchantReference,
      },
    })

    // Initialize Pesapal client
    const pesapal = getPesapalClient()

    // Check for development mode
    const isDevMode = process.env.PESAPAL_DEV_MODE === "true"

    // In dev mode, use 1 KES for testing; otherwise use actual amount
    const pesapalAmount = isDevMode ? 1 : booking.totalAmount
    const pesapalCurrency = isDevMode ? "KES" : booking.currency

    // Log dev mode status for debugging
    if (isDevMode) {
      log.info(`Dev mode enabled: Using ${pesapalCurrency} ${pesapalAmount} for testing (actual: ${booking.currency} ${booking.totalAmount})`, {
        bookingReference: booking.bookingReference,
      })
    }

    // Prepare order data for Pesapal
    const orderData = {
      id: merchantReference,
      currency: pesapalCurrency,
      amount: pesapalAmount,
      description: `Safari Booking: ${booking.tour.title} - ${booking.bookingReference}`,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}/booking/confirmation/${booking.id}`,
      notification_id: process.env.PESAPAL_IPN_ID || "",
      billing_address: {
        email_address: booking.contactEmail,
        phone_number: phoneNumber || booking.contactPhone || undefined,
        first_name: booking.contactName?.split(" ")[0] || booking.user.name?.split(" ")[0] || "",
        last_name: booking.contactName?.split(" ").slice(1).join(" ") || booking.user.name?.split(" ").slice(1).join(" ") || "",
        country_code: "KE", // Default to Kenya, can be made dynamic based on tour location
      },
    }

    // Submit order to Pesapal
    let pesapalResponse
    try {
      pesapalResponse = await pesapal.submitOrder(orderData)
    } catch (pesapalError) {
      // If Pesapal submission fails, update payment status
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

    // Log the payment initiation
    log.info(`Payment initiated`, {
      paymentId: payment.id,
      bookingReference: booking.bookingReference,
      amount: `${booking.currency} ${booking.totalAmount}`,
    })

    // Return success response with redirect URL
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      orderTrackingId: pesapalResponse.order_tracking_id,
      merchantReference: pesapalResponse.merchant_reference,
      redirectUrl: pesapalResponse.redirect_url,
      message: "Payment initiated successfully. Redirecting to payment page...",
    })
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
