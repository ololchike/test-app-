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

    // Find payment by Flutterwave reference
    const payment = await prisma.payment.findFirst({
      where: { flutterwaveRef: txRef },
      include: {
        booking: true,
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
      await prisma.booking.update({
        where: { id: payment.booking.id },
        data: {
          paymentStatus: "COMPLETED",
          status: "CONFIRMED",
        },
      })

      log.info(`Payment ${payment.id} completed successfully`, {
        bookingId: payment.booking.id,
        amount: `${transactionData.currency} ${transactionData.amount}`,
      })

      // TODO: Send confirmation email
      // TODO: Update agent earnings
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
