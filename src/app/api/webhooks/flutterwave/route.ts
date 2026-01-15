import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getFlutterwaveClient,
  mapFlutterwavePaymentMethod,
  mapFlutterwaveStatus,
  validateFlutterwaveWebhook,
  type WebhookPayload,
} from "@/lib/flutterwave"
import { createLogger } from "@/lib/logger"
import { EarningType } from "@/lib/constants"
import { sendBookingConfirmationEmail } from "@/lib/email"
import { renderToBuffer } from "@react-pdf/renderer"
import { ItineraryPDF } from "@/lib/pdf/itinerary-template"
import { format } from "date-fns"
import React from "react"

const log = createLogger("Flutterwave Webhook")

/**
 * Flutterwave Webhook Handler
 *
 * Receives payment notifications from Flutterwave and updates
 * payment and booking statuses accordingly.
 */
export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get("verif-hash")

    // Verify webhook signature
    const flutterwave = getFlutterwaveClient()
    if (!flutterwave.verifyWebhookSignature(signature || "")) {
      log.warn("Invalid webhook signature received")
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const payload: WebhookPayload = await request.json()

    log.info("Flutterwave webhook received", {
      event: payload.event,
      txRef: payload.data?.tx_ref,
      status: payload.data?.status,
    })

    // Validate payload structure
    if (!validateFlutterwaveWebhook(payload)) {
      log.warn("Invalid webhook payload structure", { payload })
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      )
    }

    // Only process charge events
    if (!payload.event.startsWith("charge.")) {
      log.info(`Ignoring non-charge event: ${payload.event}`)
      return NextResponse.json({ status: "ignored" })
    }

    const { data } = payload
    const txRef = data.tx_ref

    // Find payment by Flutterwave reference with full booking details
    const payment = await prisma.payment.findFirst({
      where: { flutterwaveRef: txRef },
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
                    images: true,
                  },
                },
              },
            },
            activities: {
              include: {
                activityAddon: {
                  select: {
                    name: true,
                    priceType: true,
                    maxCapacity: true,
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!payment) {
      log.warn(`Payment not found for tx_ref: ${txRef}`)
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    // Check if already processed (idempotency)
    if (payment.status === "COMPLETED" && data.status === "successful") {
      log.info(`Payment ${payment.id} already completed, skipping`)
      return NextResponse.json({ status: "already_processed" })
    }

    // Verify transaction with Flutterwave API
    let verifiedTransaction
    try {
      verifiedTransaction = await flutterwave.verifyTransaction(data.id)
    } catch (verifyError) {
      log.error("Failed to verify transaction with Flutterwave", verifyError)
      // Don't fail the webhook, but log the error
    }

    // Use verified data if available, otherwise use webhook data
    const transactionData = verifiedTransaction?.data || data
    const transactionStatus = transactionData.status

    // Map Flutterwave status to our internal status
    const mappedStatus = mapFlutterwaveStatus(transactionStatus)
    const mappedMethod = mapFlutterwavePaymentMethod(transactionData.payment_type)

    // Update payment record
    const updateData: {
      status: "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED"
      statusMessage: string
      flutterwaveTxId: string
      method: "MPESA" | "CARD" | "BANK_TRANSFER" | "PAYPAL"
      completedAt?: Date
      failedAt?: Date
      cardLastFour?: string
      cardType?: string
    } = {
      status: mappedStatus,
      statusMessage: transactionData.processor_response || `Payment ${transactionStatus}`,
      flutterwaveTxId: String(transactionData.id),
      method: mappedMethod,
    }

    if (mappedStatus === "COMPLETED") {
      updateData.completedAt = new Date()
      // Store card details if available
      if (transactionData.card) {
        updateData.cardLastFour = transactionData.card.last_4digits
        updateData.cardType = transactionData.card.type
      }
    } else if (mappedStatus === "FAILED") {
      updateData.failedAt = new Date()
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data: updateData,
    })

    // Update booking status based on payment status
    if (mappedStatus === "COMPLETED") {
      // Check if this is a balance payment (tx_ref contains "FLW-BAL")
      const isBalancePayment = payment.flutterwaveRef?.includes("FLW-BAL")

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
          where: { id: payment.booking.id },
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
              method: mappedMethod,
              gateway: "FLUTTERWAVE",
              flutterwaveTxId: String(transactionData.id),
              isBalancePayment: isBalancePayment,
            },
          },
        })
      })

      log.info(`Payment ${payment.id} completed successfully`, {
        bookingId: payment.booking.id,
        amount: `${transactionData.currency} ${transactionData.amount}`,
        isBalancePayment: isBalancePayment,
      })

      // Send confirmation email with PDF itinerary (non-blocking)
      // Only send for initial payment, not balance payment (user already has itinerary)
      if (!isBalancePayment) {
        sendConfirmationEmailWithPDF(payment.booking)
          .then(() => {
            log.info(`Confirmation email sent for booking: ${payment.booking.bookingReference}`)
          })
          .catch((error) => {
            log.error("Error sending confirmation email", error)
          })
      } else {
        log.info(`Balance paid for booking: ${payment.booking.bookingReference} - skipping full itinerary email`)
        // TODO: Send balance payment confirmation email (simpler template)
      }
    } else if (mappedStatus === "FAILED") {
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: {
          paymentStatus: "FAILED",
        },
      })

      log.warn(`Payment ${payment.id} failed`, {
        bookingId: payment.booking.id,
        reason: transactionData.processor_response,
      })
    }

    return NextResponse.json({
      status: "success",
      message: `Webhook processed for tx_ref: ${txRef}`,
    })
  } catch (error) {
    log.error("Flutterwave webhook processing error", error)

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Handle GET requests (webhook verification)
export async function GET(request: NextRequest) {
  // Flutterwave may send a GET request to verify the webhook URL
  return NextResponse.json({
    status: "ok",
    message: "Flutterwave webhook endpoint is active",
  })
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
      images: string
    }
  }>
  activities: Array<{
    price: number
    quantity: number
    dayNumber: number | null
    activityAddon: {
      name: string
      priceType: string
      maxCapacity: number | null
      images: string
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
 * Send confirmation email with PDF itinerary
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
        accommodations: booking.accommodations.map((acc) => ({
          dayNumber: acc.dayNumber,
          price: acc.price,
          accommodationOption: {
            name: acc.accommodationOption.name,
            tier: acc.accommodationOption.tier,
            images: JSON.parse(acc.accommodationOption.images || "[]") as string[],
          },
        })),
        activities: booking.activities.map((act) => ({
          price: act.price,
          quantity: act.quantity,
          dayNumber: act.dayNumber,
          activityAddon: {
            name: act.activityAddon.name,
            priceType: act.activityAddon.priceType as "PER_PERSON" | "PER_GROUP" | "FLAT_RATE",
            maxCapacity: act.activityAddon.maxCapacity,
            images: JSON.parse(act.activityAddon.images || "[]") as string[],
          },
        })),
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
