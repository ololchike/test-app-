import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPesapalClient } from "@/lib/pesapal"
import { createLogger } from "@/lib/logger"

const log = createLogger("Payment Callback")

/**
 * Payment Callback API Endpoint
 *
 * Handles the redirect from Pesapal after payment completion.
 * Verifies payment status and updates booking accordingly.
 *
 * Query Parameters:
 * - OrderTrackingId: Pesapal order tracking ID
 * - OrderMerchantReference: Our merchant reference (SP-{bookingRef}-{timestamp})
 * - bookingId: Optional booking ID for direct lookup
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const merchantReference = searchParams.get("OrderMerchantReference")
    const bookingId = searchParams.get("bookingId")

    log.info("Payment callback received", {
      orderTrackingId,
      merchantReference,
      bookingId,
    })

    // Find the payment record
    let payment = null

    if (orderTrackingId) {
      payment = await prisma.payment.findFirst({
        where: { pesapalOrderId: orderTrackingId },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              status: true,
              paymentStatus: true,
              totalAmount: true,
              agentId: true,
              agentEarnings: true,
              currency: true,
              paymentType: true,
              depositAmount: true,
              balanceAmount: true,
            },
          },
        },
      })
    }

    if (!payment && merchantReference) {
      payment = await prisma.payment.findFirst({
        where: { pesapalMerchantRef: merchantReference },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              status: true,
              paymentStatus: true,
              totalAmount: true,
              agentId: true,
              agentEarnings: true,
              currency: true,
              paymentType: true,
              depositAmount: true,
              balanceAmount: true,
            },
          },
        },
      })
    }

    if (!payment && bookingId) {
      payment = await prisma.payment.findFirst({
        where: { bookingId },
        orderBy: { createdAt: "desc" },
        include: {
          booking: {
            select: {
              id: true,
              bookingReference: true,
              status: true,
              paymentStatus: true,
              totalAmount: true,
              agentId: true,
              agentEarnings: true,
              currency: true,
              paymentType: true,
              depositAmount: true,
              balanceAmount: true,
            },
          },
        },
      })
    }

    if (!payment) {
      return NextResponse.json({
        success: false,
        error: "Payment not found",
        message: "Could not find a payment matching the provided tracking ID",
      }, { status: 404 })
    }

    // If payment is already completed, return current status
    if (payment.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        paymentStatus: payment.status,
        bookingId: payment.booking.id,
        bookingStatus: payment.booking.status,
        bookingPaymentStatus: payment.booking.paymentStatus,
        amount: payment.amount,
        message: "Payment already completed",
      })
    }

    // Query Pesapal for current status
    let pesapalStatus = null
    if (orderTrackingId || payment.pesapalOrderId) {
      try {
        const pesapal = getPesapalClient()
        pesapalStatus = await pesapal.getTransactionStatus(
          orderTrackingId || payment.pesapalOrderId!
        )

        log.info("Pesapal status retrieved", {
          paymentId: payment.id,
          statusCode: pesapalStatus.status_code,
          description: pesapalStatus.payment_status_description,
        })
      } catch (pesapalError) {
        log.error("Failed to get Pesapal status", { error: pesapalError })

        // For local dev without Pesapal, simulate success if we have tracking ID
        if (process.env.PESAPAL_DEV_MODE === "true" && orderTrackingId) {
          log.info("Dev mode: Simulating successful payment")
          pesapalStatus = {
            status_code: 1,
            payment_status_description: "Completed (Simulated)",
            payment_method: "SIMULATED",
            amount: payment.amount,
            currency: payment.currency,
            confirmation_code: `SIM-${Date.now()}`,
          }
        }
      }
    }

    // Update based on Pesapal status
    if (pesapalStatus) {
      let newPaymentStatus = payment.status
      let newBookingStatus = payment.booking.status
      let newBookingPaymentStatus = payment.booking.paymentStatus

      // Map Pesapal status codes: 0=INVALID, 1=COMPLETED, 2=FAILED, 3=REVERSED
      if (pesapalStatus.status_code === 1) {
        newPaymentStatus = "COMPLETED"
        newBookingStatus = "CONFIRMED"
        // Mark as COMPLETED - balance tracking is handled via paymentType/balanceAmount fields
        newBookingPaymentStatus = "COMPLETED"
      } else if (pesapalStatus.status_code === 2) {
        newPaymentStatus = "FAILED"
        newBookingPaymentStatus = "FAILED"
      } else if (pesapalStatus.status_code === 3) {
        newPaymentStatus = "REFUNDED"
        newBookingStatus = "REFUNDED"
        newBookingPaymentStatus = "REFUNDED"
      }

      // Update payment record
      if (newPaymentStatus !== payment.status) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: newPaymentStatus,
            statusMessage: pesapalStatus.payment_status_description,
            pesapalTrackingId: pesapalStatus.confirmation_code || payment.pesapalTrackingId,
            completedAt: newPaymentStatus === "COMPLETED" ? new Date() : null,
            failedAt: newPaymentStatus === "FAILED" ? new Date() : null,
          },
        })

        // Update booking
        await prisma.booking.update({
          where: { id: payment.booking.id },
          data: {
            status: newBookingStatus,
            paymentStatus: newBookingPaymentStatus,
          },
        })

        // Create agent earning if payment completed
        if (newPaymentStatus === "COMPLETED") {
          try {
            await prisma.agentEarning.create({
              data: {
                agentId: payment.booking.agentId,
                bookingId: payment.booking.id,
                amount: payment.booking.agentEarnings,
                currency: payment.booking.currency,
                description: `Earnings from booking ${payment.booking.bookingReference}`,
                type: "booking",
              },
            })
          } catch {
            // Earning might already exist
            log.debug("Agent earning creation skipped (may already exist)")
          }
        }

        log.info("Payment status updated", {
          paymentId: payment.id,
          oldStatus: payment.status,
          newStatus: newPaymentStatus,
          bookingStatus: newBookingStatus,
        })
      }

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        paymentStatus: newPaymentStatus,
        bookingId: payment.booking.id,
        bookingStatus: newBookingStatus,
        bookingPaymentStatus: newBookingPaymentStatus,
        amount: payment.amount,
        pesapalStatus: {
          statusCode: pesapalStatus.status_code,
          description: pesapalStatus.payment_status_description,
          paymentMethod: pesapalStatus.payment_method,
          confirmationCode: pesapalStatus.confirmation_code,
        },
        message: newPaymentStatus === "COMPLETED"
          ? "Payment completed successfully!"
          : `Payment status: ${newPaymentStatus}`,
        updated: newPaymentStatus !== payment.status,
      })
    }

    // Return current status if we couldn't verify with Pesapal
    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentStatus: payment.status,
      bookingId: payment.booking.id,
      bookingStatus: payment.booking.status,
      bookingPaymentStatus: payment.booking.paymentStatus,
      amount: payment.amount,
      message: "Payment status retrieved from database",
    })
  } catch (error) {
    log.error("Payment callback error", { error })
    return NextResponse.json({
      success: false,
      error: "Failed to process payment callback",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}

/**
 * POST handler for Pesapal IPN (Instant Payment Notification)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    log.info("Pesapal IPN received", body)

    const { OrderTrackingId, OrderMerchantReference, OrderNotificationType } = body

    if (!OrderTrackingId) {
      return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 })
    }

    // Forward to GET handler for processing
    const url = new URL(request.url)
    url.searchParams.set("OrderTrackingId", OrderTrackingId)
    if (OrderMerchantReference) {
      url.searchParams.set("OrderMerchantReference", OrderMerchantReference)
    }

    const result = await GET(new NextRequest(url))

    // Pesapal expects specific response format for IPN
    return NextResponse.json({
      orderNotificationType: OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: 200,
    })
  } catch (error) {
    log.error("IPN processing error", { error })
    return NextResponse.json({ status: 500 }, { status: 500 })
  }
}
