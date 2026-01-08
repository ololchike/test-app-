import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPesapalClient, mapPaymentMethod, mapPaymentStatus, validateIPNNotification } from "@/lib/pesapal"
import { renderToBuffer } from "@react-pdf/renderer"
import { ItineraryPDF } from "@/lib/pdf/itinerary-template"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { format } from "date-fns"
import React from "react"

/**
 * Pesapal IPN (Instant Payment Notification) Webhook Handler
 *
 * This endpoint receives payment status updates from Pesapal
 * It verifies the notification, updates payment and booking status,
 * and triggers confirmation emails for successful payments
 *
 * SECURITY:
 * - Validates notification structure
 * - Verifies transaction status with Pesapal API
 * - Implements idempotency to handle duplicate notifications
 * - Logs all events for audit trail
 */

// Track processed notifications to prevent duplicate processing within same request cycle
const processedNotifications = new Set<string>()

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let notificationData: any = null

  try {
    // Parse request body
    const body = await request.json()
    notificationData = body

    const {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
    } = body

    console.log(`[Pesapal IPN] Received notification:`, {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
      timestamp: new Date().toISOString(),
    })

    // Validate notification structure
    if (!validateIPNNotification(body)) {
      console.error("[Pesapal IPN] Invalid notification structure:", body)
      return NextResponse.json(
        { error: "Invalid notification structure" },
        { status: 400 }
      )
    }

    // Check for duplicate processing in current request cycle
    const notificationKey = `${OrderTrackingId}-${OrderMerchantReference}`
    if (processedNotifications.has(notificationKey)) {
      console.log(`[Pesapal IPN] Duplicate notification detected: ${notificationKey}`)
      return NextResponse.json({
        message: "Notification already processed",
        orderNotificationType: OrderNotificationType,
        orderTrackingId: OrderTrackingId,
        orderMerchantReference: OrderMerchantReference,
        status: 200,
      })
    }

    // Mark as processing
    processedNotifications.add(notificationKey)

    // Verify transaction status with Pesapal
    const pesapal = getPesapalClient()
    let transactionStatus
    try {
      transactionStatus = await pesapal.getTransactionStatus(OrderTrackingId)
    } catch (statusError) {
      console.error("[Pesapal IPN] Failed to verify transaction status:", statusError)
      return NextResponse.json(
        {
          error: "Failed to verify transaction status",
          details: statusError instanceof Error ? statusError.message : "Unknown error",
        },
        { status: 500 }
      )
    }

    console.log(`[Pesapal IPN] Transaction status:`, {
      statusCode: transactionStatus.status_code,
      description: transactionStatus.payment_status_description,
      amount: transactionStatus.amount,
      currency: transactionStatus.currency,
    })

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { pesapalOrderId: OrderTrackingId },
          { pesapalTrackingId: OrderTrackingId },
          { pesapalMerchantRef: OrderMerchantReference },
        ],
      },
      include: {
        booking: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                destination: true,
                durationDays: true,
                durationNights: true,
                itinerary: {
                  orderBy: { dayNumber: "asc" },
                },
              },
            },
            agent: {
              select: {
                id: true,
                businessName: true,
                businessEmail: true,
                businessPhone: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            accommodations: {
              include: {
                accommodationOption: {
                  select: {
                    name: true,
                    tier: true,
                  },
                },
              },
            },
            activities: {
              include: {
                activityAddon: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!payment) {
      console.error(`[Pesapal IPN] Payment not found:`, {
        OrderTrackingId,
        OrderMerchantReference,
      })
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 }
      )
    }

    // Check if payment is already in final state (idempotency)
    if (payment.status === "COMPLETED" || payment.status === "REFUNDED") {
      console.log(`[Pesapal IPN] Payment already in final state: ${payment.status}`)
      return NextResponse.json({
        message: "Payment already processed",
        orderNotificationType: OrderNotificationType,
        orderTrackingId: OrderTrackingId,
        orderMerchantReference: OrderMerchantReference,
        status: 200,
      })
    }

    // Map Pesapal status to our internal status
    const newPaymentStatus = mapPaymentStatus(transactionStatus.status_code)
    const paymentMethod = mapPaymentMethod(transactionStatus.payment_method)

    console.log(`[Pesapal IPN] Updating payment status:`, {
      paymentId: payment.id,
      oldStatus: payment.status,
      newStatus: newPaymentStatus,
      method: paymentMethod,
    })

    // Update payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        method: paymentMethod,
        pesapalTrackingId: transactionStatus.confirmation_code,
        statusMessage: transactionStatus.payment_status_description,
        completedAt: newPaymentStatus === "COMPLETED" ? new Date() : null,
        failedAt: newPaymentStatus === "FAILED" ? new Date() : null,
      },
    })

    // Handle payment completion
    if (newPaymentStatus === "COMPLETED") {
      console.log(`[Pesapal IPN] Processing successful payment for booking: ${payment.booking.bookingReference}`)

      // Use transaction to ensure all updates succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Update booking status
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "COMPLETED",
          },
        })

        // Create agent earning record
        await tx.agentEarning.create({
          data: {
            agentId: payment.booking.agentId,
            bookingId: payment.booking.id,
            amount: payment.booking.agentEarnings,
            currency: payment.booking.currency,
            description: `Earnings from booking ${payment.booking.bookingReference}`,
            type: "booking",
          },
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: payment.booking.userId,
            action: "PAYMENT_COMPLETED",
            resource: "Payment",
            resourceId: payment.id,
            metadata: {
              bookingId: payment.booking.id,
              bookingReference: payment.booking.bookingReference,
              amount: payment.amount,
              currency: payment.currency,
              method: paymentMethod,
              pesapalTrackingId: transactionStatus.confirmation_code,
              paymentAccount: transactionStatus.payment_account,
            },
          },
        })
      })

      // Send confirmation email with PDF itinerary (non-blocking)
      sendConfirmationEmailWithPDF(payment.booking)
        .then(() => {
          console.log(`[Pesapal IPN] Confirmation email sent for booking: ${payment.booking.bookingReference}`)
        })
        .catch((error) => {
          console.error(`[Pesapal IPN] Error sending confirmation email:`, error)
        })
    }

    // Handle payment failure
    if (newPaymentStatus === "FAILED") {
      console.log(`[Pesapal IPN] Processing failed payment for booking: ${payment.booking.bookingReference}`)

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          paymentStatus: "FAILED",
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: payment.booking.userId,
          action: "PAYMENT_FAILED",
          resource: "Payment",
          resourceId: payment.id,
          metadata: {
            bookingId: payment.booking.id,
            bookingReference: payment.booking.bookingReference,
            amount: payment.amount,
            currency: payment.currency,
            reason: transactionStatus.message,
          },
        },
      })
    }

    // Handle refunds
    if (newPaymentStatus === "REFUNDED") {
      console.log(`[Pesapal IPN] Processing refund for booking: ${payment.booking.bookingReference}`)

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: "REFUNDED",
          paymentStatus: "REFUNDED",
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: payment.booking.userId,
          action: "PAYMENT_REFUNDED",
          resource: "Payment",
          resourceId: payment.id,
          metadata: {
            bookingId: payment.booking.id,
            bookingReference: payment.booking.bookingReference,
            amount: payment.amount,
            currency: payment.currency,
          },
        },
      })
    }

    const processingTime = Date.now() - startTime
    console.log(`[Pesapal IPN] Notification processed successfully in ${processingTime}ms`)

    // Return success response to Pesapal
    return NextResponse.json({
      message: "Notification processed successfully",
      orderNotificationType: OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: 200,
    })
  } catch (error) {
    console.error("[Pesapal IPN] Error processing notification:", error)

    // Log error to database for investigation
    try {
      await prisma.auditLog.create({
        data: {
          action: "WEBHOOK_ERROR",
          resource: "PesapalIPN",
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
            notification: notificationData,
            timestamp: new Date().toISOString(),
          },
        },
      })
    } catch (logError) {
      console.error("[Pesapal IPN] Failed to log error:", logError)
    }

    return NextResponse.json(
      {
        error: "Failed to process notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  } finally {
    // Clean up processed notification after request
    if (notificationData?.OrderTrackingId && notificationData?.OrderMerchantReference) {
      const key = `${notificationData.OrderTrackingId}-${notificationData.OrderMerchantReference}`
      setTimeout(() => processedNotifications.delete(key), 5000) // Remove after 5 seconds
    }
  }
}

/**
 * Send confirmation email with PDF itinerary
 * Extracted from payment initiate route for reuse
 */
async function sendConfirmationEmailWithPDF(booking: any) {
  try {
    // Parse itinerary JSON fields
    const itinerary = booking.tour.itinerary.map((day: any) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description || "",
      location: day.location,
      meals: JSON.parse(day.meals || "[]"),
      activities: JSON.parse(day.activities || "[]"),
      overnight: day.overnight,
    }))

    // Calculate pricing breakdown
    const baseTotal = Math.round(
      booking.baseAmount -
        (booking.baseAmount * 0.3 * booking.children) /
          (booking.adults + booking.children * 0.7)
    )
    const childTotal = booking.baseAmount - baseTotal
    const accommodationTotal = booking.accommodationAmount
    const addonsTotal = booking.activitiesAmount
    const serviceFee = booking.taxAmount
    const total = booking.totalAmount

    // Prepare booking data for PDF
    const pdfData = {
      booking: {
        bookingReference: booking.bookingReference,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        adults: booking.adults,
        children: booking.children,
        totalAmount: booking.totalAmount,
        contactName: booking.contactName,
        contactEmail: booking.contactEmail,
        contactPhone: booking.contactPhone,
        specialRequests: booking.specialRequests,
        tour: {
          title: booking.tour.title,
          destination: booking.tour.destination,
          durationDays: booking.tour.durationDays,
          durationNights: booking.tour.durationNights,
        },
        agent: booking.agent,
        accommodations: booking.accommodations,
        activities: booking.activities,
      },
      itinerary,
      pricing: {
        baseTotal,
        childTotal,
        accommodationTotal,
        addonsTotal,
        serviceFee,
        total,
      },
    }

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(ItineraryPDF, pdfData) as any
    )

    // Send confirmation email
    await sendBookingConfirmationEmail({
      to: booking.contactEmail,
      bookingReference: booking.bookingReference,
      customerName: booking.contactName,
      tourTitle: booking.tour.title,
      startDate: format(new Date(booking.startDate), "MMM d, yyyy"),
      endDate: format(new Date(booking.endDate), "MMM d, yyyy"),
      adults: booking.adults,
      children: booking.children,
      totalAmount: booking.totalAmount,
      agentName: booking.agent.businessName,
      pdfBuffer: pdfBuffer,
    })
  } catch (error) {
    console.error("[Pesapal IPN] Error in sendConfirmationEmailWithPDF:", error)
    throw error
  }
}

/**
 * Handle GET requests (if IPN is configured for GET method)
 * Parse query parameters and process similar to POST
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const body = {
      OrderTrackingId: searchParams.get("OrderTrackingId"),
      OrderMerchantReference: searchParams.get("OrderMerchantReference"),
      OrderNotificationType: searchParams.get("OrderNotificationType"),
    }

    console.log("[Pesapal IPN] GET request received:", body)

    // Forward to POST handler logic
    return POST(
      new NextRequest(request.url, {
        method: "POST",
        body: JSON.stringify(body),
      })
    )
  } catch (error) {
    console.error("[Pesapal IPN] Error processing GET notification:", error)
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    )
  }
}
