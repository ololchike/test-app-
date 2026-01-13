import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPesapalClient } from "@/lib/pesapal"
import { createLogger } from "@/lib/logger"
import { z } from "zod"
import { PaymentStatus, BookingStatus, PaymentStatus as BookingPaymentStatus } from "@prisma/client"
import { EarningType } from "@/lib/constants"

const log = createLogger("Payment Status")

/**
 * Payment Status Check API Endpoint
 *
 * Allows clients to poll for payment status updates
 * Can optionally query Pesapal directly for real-time status
 *
 * Query Parameters:
 * - bookingId: Required - The booking ID to check payment status for
 * - refreshFromPesapal: Optional - If true, fetches latest status from Pesapal API
 */

const statusQuerySchema = z.object({
  bookingId: z.string().cuid("Invalid booking ID format"),
  refreshFromPesapal: z
    .string()
    .optional()
    .transform((val) => val === "true"),
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to continue." },
        { status: 401 }
      )
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url)
    const validation = statusQuerySchema.safeParse({
      bookingId: searchParams.get("bookingId"),
      refreshFromPesapal: searchParams.get("refreshFromPesapal"),
    })

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { bookingId, refreshFromPesapal } = validation.data

    // Fetch booking with payment details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        userId: true,
        agentId: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        currency: true,
        bookingReference: true,
        agentEarnings: true,
        payments: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        tour: {
          select: {
            title: true,
            destination: true,
          },
        },
      },
    })

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

    // Check if payment exists
    if (!booking.payments || booking.payments.length === 0) {
      return NextResponse.json({
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        paymentStatus: "PENDING",
        message: "No payment has been initiated for this booking",
        booking: {
          status: booking.status,
          totalAmount: booking.totalAmount,
          currency: booking.currency,
          tour: booking.tour,
        },
      })
    }

    const payment = booking.payments[0]

    // If payment is in progress and refresh is requested, check with Pesapal
    if (
      refreshFromPesapal &&
      payment.pesapalOrderId &&
      (payment.status === "PENDING" || payment.status === "PROCESSING")
    ) {
      try {
        const pesapal = getPesapalClient()
        const transactionStatus = await pesapal.getTransactionStatus(payment.pesapalOrderId)

        log.debug("Refreshed status from Pesapal", {
          paymentId: payment.id,
          pesapalStatus: transactionStatus.payment_status_description,
          statusCode: transactionStatus.status_code,
        })

        // Map Pesapal status code to our status
        // Status codes: 0 = INVALID, 1 = COMPLETED, 2 = FAILED, 3 = REVERSED
        let newPaymentStatus: PaymentStatus = payment.status
        let newBookingStatus: BookingStatus = booking.status
        let newPaymentBookingStatus: BookingPaymentStatus = booking.paymentStatus

        if (transactionStatus.status_code === 1) {
          newPaymentStatus = PaymentStatus.COMPLETED
          newBookingStatus = BookingStatus.CONFIRMED
          newPaymentBookingStatus = BookingPaymentStatus.COMPLETED
        } else if (transactionStatus.status_code === 2) {
          newPaymentStatus = PaymentStatus.FAILED
          newPaymentBookingStatus = BookingPaymentStatus.FAILED
        } else if (transactionStatus.status_code === 3) {
          newPaymentStatus = PaymentStatus.REFUNDED
          newBookingStatus = BookingStatus.REFUNDED
          newPaymentBookingStatus = BookingPaymentStatus.REFUNDED
        }

        // Update database if status changed
        if (newPaymentStatus !== payment.status) {
          log.info("Updating payment status from Pesapal refresh", {
            paymentId: payment.id,
            oldStatus: payment.status,
            newStatus: newPaymentStatus,
          })

          // Update payment
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: newPaymentStatus,
              statusMessage: transactionStatus.payment_status_description,
              pesapalTrackingId: transactionStatus.confirmation_code || payment.pesapalTrackingId,
              completedAt: newPaymentStatus === PaymentStatus.COMPLETED ? new Date() : payment.completedAt,
              failedAt: newPaymentStatus === PaymentStatus.FAILED ? new Date() : payment.failedAt,
            },
          })

          // Update booking
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: newBookingStatus,
              paymentStatus: newPaymentBookingStatus,
            },
          })

          // Create agent earning if payment completed
          if (newPaymentStatus === PaymentStatus.COMPLETED && (payment.status as PaymentStatus) !== PaymentStatus.COMPLETED) {
            try {
              await prisma.agentEarning.create({
                data: {
                  agentId: booking.agentId,
                  bookingId: booking.id,
                  amount: booking.agentEarnings,
                  currency: booking.currency,
                  description: `Earnings from booking ${booking.bookingReference}`,
                  type: EarningType.BOOKING,
                },
              })
            } catch (earningError) {
              // Earning might already exist, ignore duplicate error
              log.debug("Agent earning creation skipped (may already exist)", { error: earningError })
            }
          }
        }

        // Return the updated status
        return NextResponse.json({
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
          paymentId: payment.id,
          paymentStatus: newPaymentStatus,
          pesapalStatus: {
            statusCode: transactionStatus.status_code,
            description: transactionStatus.payment_status_description,
            paymentMethod: transactionStatus.payment_method,
            amount: transactionStatus.amount,
            currency: transactionStatus.currency,
            confirmationCode: transactionStatus.confirmation_code,
            createdDate: transactionStatus.created_date,
          },
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          booking: {
            status: newBookingStatus,
            paymentStatus: newPaymentBookingStatus,
            totalAmount: booking.totalAmount,
            currency: booking.currency,
            tour: booking.tour,
          },
          message: newPaymentStatus !== payment.status
            ? "Payment status updated from Pesapal"
            : "Payment status refreshed from Pesapal",
          updated: newPaymentStatus !== payment.status,
        })
      } catch (pesapalError) {
        console.error("[Payment Status] Error fetching from Pesapal:", pesapalError)
        // Continue with database status if Pesapal query fails
      }
    }

    // Return current payment status from database
    return NextResponse.json({
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      paymentId: payment.id,
      paymentStatus: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      statusMessage: payment.statusMessage,
      pesapalTrackingId: payment.pesapalTrackingId,
      pesapalMerchantRef: payment.pesapalMerchantRef,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      completedAt: payment.completedAt,
      failedAt: payment.failedAt,
      booking: {
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        currency: booking.currency,
        tour: booking.tour,
      },
      message: getStatusMessage(payment.status),
    })
  } catch (error) {
    console.error("[Payment Status] Error:", error)

    return NextResponse.json(
      {
        error: "Failed to retrieve payment status",
        details: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    )
  }
}

/**
 * Get user-friendly message for payment status
 */
function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    PENDING: "Payment is pending. Please complete the payment process.",
    PROCESSING: "Payment is being processed. This may take a few moments.",
    COMPLETED: "Payment completed successfully. Your booking is confirmed!",
    FAILED: "Payment failed. Please try again or use a different payment method.",
    REFUNDED: "Payment has been refunded to your account.",
    PARTIALLY_REFUNDED: "Payment has been partially refunded to your account.",
  }

  return messages[status] || "Payment status unknown"
}

/**
 * POST method for webhook-style updates
 * This can be used by frontend to trigger status check
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId, refreshFromPesapal = true } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      )
    }

    // Build query URL and forward to GET handler
    const url = new URL(request.url)
    url.searchParams.set("bookingId", bookingId)
    if (refreshFromPesapal) {
      url.searchParams.set("refreshFromPesapal", "true")
    }

    const getRequest = new NextRequest(url, { method: "GET" })
    return GET(getRequest)
  } catch (error) {
    console.error("[Payment Status POST] Error:", error)
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    )
  }
}
