import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPesapalClient, mapPaymentMethod, mapPaymentStatus, validateIPNNotification, validatePesapalIP } from "@/lib/pesapal"
import { renderToBuffer } from "@react-pdf/renderer"
import { ItineraryPDF } from "@/lib/pdf/itinerary-template"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { createLogger } from "@/lib/logger"
import { format } from "date-fns"
import React from "react"
import { EarningType } from "@/lib/constants"
import { rateLimiters, getClientIdentifier } from "@/lib/rate-limit"
import { getRealIp } from "@/lib/security"

const log = createLogger("Pesapal IPN")

// Type for Pesapal IPN notification
interface PesapalNotification {
  OrderTrackingId: string
  OrderMerchantReference: string
  OrderNotificationType: string
}

// Type for booking with included relations for email/PDF generation
interface BookingWithRelations {
  id: string
  bookingReference: string
  startDate: Date
  endDate: Date
  adults: number
  children: number
  baseAmount: number
  accommodationAmount: number
  activitiesAmount: number
  taxAmount: number
  totalAmount: number
  currency: string
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests: string | null
  userId: string
  agentId: string
  status: string
  paymentStatus: string
  paymentType: string
  agentEarnings: number
  platformCommission: number
  tour: {
    id: string
    title: string
    destination: string
    durationDays: number
    durationNights: number
    itinerary: Array<{
      dayNumber: number
      title: string
      description: string | null
      location: string | null
      meals: string
      activities: string
      overnight: string | null
    }>
  }
  agent: {
    id: string
    businessName: string
    businessEmail: string | null
    businessPhone: string | null
  }
  user: {
    id: string
    name: string | null
    email: string
  }
  accommodations: Array<{
    dayNumber: number
    price: number
    accommodationOption: {
      name: string
      tier: string
    }
  }>
  activities: Array<{
    price: number
    activityAddon: {
      name: string
    }
  }>
}

// Type for itinerary day
interface ItineraryDay {
  dayNumber: number
  title: string
  description: string
  location: string | null
  meals: string[]
  activities: string[]
  overnight: string | null
}

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
  let notificationData: PesapalNotification | null = null

  try {
    // SECURITY: Rate limiting for webhook endpoint
    const clientIp = getRealIp(request)
    const rateLimitResult = rateLimiters.webhook.check(clientIp)

    if (!rateLimitResult.success) {
      log.warn("Rate limit exceeded for webhook", { ip: clientIp })
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
          },
        }
      )
    }

    // SECURITY: Validate source IP (Pesapal IPs only)
    // Note: This is commented out because Pesapal may use dynamic IPs
    // Enable this if Pesapal provides a stable IP range
    // if (!validatePesapalIP(clientIp)) {
    //   log.error("Invalid source IP for webhook", { ip: clientIp })
    //   return NextResponse.json(
    //     { error: "Unauthorized source" },
    //     { status: 403 }
    //   )
    // }

    // Parse request body
    const body = await request.json() as PesapalNotification
    notificationData = body

    const {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
    } = body

    log.info("Received notification", {
      OrderTrackingId,
      OrderMerchantReference,
      OrderNotificationType,
      timestamp: new Date().toISOString(),
      sourceIp: clientIp,
    })

    // SECURITY: Validate notification structure
    if (!validateIPNNotification(body)) {
      log.error("Invalid notification structure:", body)
      return NextResponse.json(
        { error: "Invalid notification structure" },
        { status: 400 }
      )
    }

    // Check for duplicate processing in current request cycle
    const notificationKey = `${OrderTrackingId}-${OrderMerchantReference}`
    if (processedNotifications.has(notificationKey)) {
      log.info(`Duplicate notification detected: ${notificationKey}`)
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
      log.error("Failed to verify transaction status:", statusError)
      return NextResponse.json(
        {
          error: "Failed to verify transaction status",
          details: statusError instanceof Error ? statusError.message : "Unknown error",
        },
        { status: 500 }
      )
    }

    log.info("Transaction status", {
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
      log.error("Payment not found", {
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
      log.info(`Payment already in final state: ${payment.status}`)
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

    log.info("Updating payment status", {
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
      log.info(`Processing successful payment for booking: ${payment.booking.bookingReference}`)

      // Check if this is a balance payment (merchant reference starts with "BAL-")
      const isBalancePayment = payment.pesapalMerchantRef?.startsWith("BAL-")

      // Use transaction to ensure all updates succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Prepare booking update data
        const bookingUpdateData: {
          status: "CONFIRMED"
          paymentStatus: "COMPLETED"
          balancePaidAt?: Date
        } = {
          status: "CONFIRMED",
          paymentStatus: "COMPLETED",
        }

        // If this is a balance payment, set the balancePaidAt timestamp
        if (isBalancePayment) {
          bookingUpdateData.balancePaidAt = new Date()
          log.info(`Balance payment completed for booking: ${payment.booking.bookingReference}`)
        }

        // Update booking status
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: bookingUpdateData,
        })

        // Create agent earning record
        // For balance payments, calculate earnings on the balance amount only
        const earningsAmount = isBalancePayment
          ? payment.amount * (1 - (payment.booking.platformCommission || 12) / 100)
          : payment.booking.agentEarnings

        await tx.agentEarning.create({
          data: {
            agentId: payment.booking.agentId,
            bookingId: payment.booking.id,
            amount: earningsAmount,
            currency: payment.booking.currency,
            description: isBalancePayment
              ? `Balance payment earnings from booking ${payment.booking.bookingReference}`
              : `Earnings from booking ${payment.booking.bookingReference}`,
            type: EarningType.BOOKING,
          },
        })

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: payment.booking.userId,
            action: isBalancePayment ? "BALANCE_PAYMENT_COMPLETED" : "PAYMENT_COMPLETED",
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
              isBalancePayment: isBalancePayment,
            },
          },
        })
      })

      // Send confirmation email with PDF itinerary (non-blocking)
      // Only send for initial payment, not balance payment (user already has itinerary)
      if (!isBalancePayment) {
        sendConfirmationEmailWithPDF(payment.booking as BookingWithRelations)
          .then(() => {
            log.info(`Confirmation email sent for booking: ${payment.booking.bookingReference}`)
          })
          .catch((error) => {
            log.error("Error sending confirmation email", error)
          })
      } else {
        // For balance payment, send a simple balance paid confirmation
        log.info(`Balance paid for booking: ${payment.booking.bookingReference} - skipping full itinerary email`)
        // TODO: Send balance payment confirmation email (simpler template)
      }
    }

    // Handle payment failure
    if (newPaymentStatus === "FAILED") {
      log.info(`Processing failed payment for booking: ${payment.booking.bookingReference}`)

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
      log.info(`Processing refund for booking: ${payment.booking.bookingReference}`)

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
    log.info(`Notification processed successfully in ${processingTime}ms`)

    // Return success response to Pesapal
    return NextResponse.json({
      message: "Notification processed successfully",
      orderNotificationType: OrderNotificationType,
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: 200,
    })
  } catch (error) {
    log.error("Error processing notification:", error)

    // Log error to database for investigation
    try {
      await prisma.auditLog.create({
        data: {
          action: "WEBHOOK_ERROR",
          resource: "PesapalIPN",
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
            notification: notificationData ? JSON.parse(JSON.stringify(notificationData)) : null,
            timestamp: new Date().toISOString(),
          },
        },
      })
    } catch (logError) {
      log.error("Failed to log error", logError)
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
async function sendConfirmationEmailWithPDF(booking: BookingWithRelations) {
  try {
    // Parse itinerary JSON fields
    const itinerary: ItineraryDay[] = booking.tour.itinerary.map((day) => ({
      dayNumber: day.dayNumber,
      title: day.title,
      description: day.description || "",
      location: day.location,
      meals: JSON.parse(day.meals || "[]") as string[],
      activities: JSON.parse(day.activities || "[]") as string[],
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
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentType: booking.paymentType,
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
    // Note: Type assertion needed for React-PDF compatibility with renderToBuffer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfElement = React.createElement(ItineraryPDF, pdfData) as any
    const pdfBuffer = await renderToBuffer(pdfElement)

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
    log.error("Error in sendConfirmationEmailWithPDF:", error)
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

    log.info("GET request received", body)

    // Forward to POST handler logic
    return POST(
      new NextRequest(request.url, {
        method: "POST",
        body: JSON.stringify(body),
      })
    )
  } catch (error) {
    log.error("Error processing GET notification:", error)
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    )
  }
}
