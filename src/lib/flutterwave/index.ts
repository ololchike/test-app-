/**
 * Flutterwave Payment Gateway Integration
 * API v3 Client Library
 *
 * @see https://developer.flutterwave.com/docs
 */

import crypto from "crypto"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface FlutterwaveConfig {
  publicKey: string
  secretKey: string
  encryptionKey: string
  apiUrl: string
  webhookSecret?: string
}

interface Customer {
  email: string
  phone_number?: string
  name?: string
}

interface Customizations {
  title?: string
  description?: string
  logo?: string
}

interface PaymentMeta {
  consumer_id?: string
  consumer_mac?: string
  [key: string]: string | undefined
}

interface PaymentRequest {
  tx_ref: string
  amount: number
  currency: string
  redirect_url: string
  customer: Customer
  customizations?: Customizations
  meta?: PaymentMeta
  payment_options?: string
  subaccounts?: Array<{
    id: string
    transaction_split_ratio?: number
    transaction_charge_type?: "flat" | "percentage"
    transaction_charge?: number
  }>
}

interface PaymentResponse {
  status: "success" | "error"
  message: string
  data?: {
    link: string
  }
}

interface TransactionVerifyResponse {
  status: "success" | "error"
  message: string
  data?: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    currency: string
    charged_amount: number
    app_fee: number
    merchant_fee: number
    processor_response: string
    auth_model: string
    ip: string
    narration: string
    status: "successful" | "failed" | "pending"
    payment_type: string
    created_at: string
    account_id: number
    customer: {
      id: number
      name: string
      phone_number: string
      email: string
      created_at: string
    }
    card?: {
      first_6digits: string
      last_4digits: string
      issuer: string
      country: string
      type: string
      token: string
      expiry: string
    }
  }
}

interface WebhookPayload {
  event: string
  "event.type": string
  data: {
    id: number
    tx_ref: string
    flw_ref: string
    device_fingerprint: string
    amount: number
    currency: string
    charged_amount: number
    app_fee: number
    merchant_fee: number
    processor_response: string
    auth_model: string
    ip: string
    narration: string
    status: "successful" | "failed" | "pending"
    payment_type: string
    created_at: string
    account_id: number
    customer: {
      id: number
      name: string
      phone_number: string
      email: string
      created_at: string
    }
    card?: {
      first_6digits: string
      last_4digits: string
      issuer: string
      country: string
      type: string
      token: string
      expiry: string
    }
  }
}

// ============================================================================
// FLUTTERWAVE CLIENT CLASS
// ============================================================================

export class FlutterwaveClient {
  private config: FlutterwaveConfig

  constructor(config: FlutterwaveConfig) {
    if (!config.publicKey || !config.secretKey) {
      throw new Error("Flutterwave public key and secret key are required")
    }
    if (!config.apiUrl) {
      throw new Error("Flutterwave API URL is required")
    }

    this.config = config
  }

  /**
   * Initialize a payment and get redirect URL
   *
   * @param payment - Payment details including amount, currency, and customer info
   * @returns Redirect URL for customer payment
   */
  async initiatePayment(payment: PaymentRequest): Promise<PaymentResponse> {
    // Validate payment data
    if (!payment.tx_ref || !payment.amount || !payment.currency) {
      throw new Error("Transaction reference, amount, and currency are required")
    }

    if (!payment.customer?.email) {
      throw new Error("Customer email is required")
    }

    if (payment.amount <= 0) {
      throw new Error("Payment amount must be greater than zero")
    }

    // Validate currency
    const validCurrencies = ["NGN", "USD", "EUR", "GBP", "KES", "GHS", "ZAR", "TZS", "UGX", "RWF"]
    if (!validCurrencies.includes(payment.currency.toUpperCase())) {
      throw new Error(`Invalid currency. Supported currencies: ${validCurrencies.join(", ")}`)
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/v3/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.secretKey}`,
        },
        body: JSON.stringify(payment),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`)
      }

      const data: PaymentResponse = await response.json()

      if (data.status !== "success") {
        throw new Error(`Payment initiation failed: ${data.message}`)
      }

      if (!data.data?.link) {
        throw new Error("Invalid payment response: missing redirect link")
      }

      return data
    } catch (error) {
      console.error("Flutterwave payment initiation error:", error)
      throw new Error(`Failed to initiate payment with Flutterwave: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Verify a transaction by its ID
   *
   * @param transactionId - The Flutterwave transaction ID
   * @returns Transaction verification details
   */
  async verifyTransaction(transactionId: number | string): Promise<TransactionVerifyResponse> {
    if (!transactionId) {
      throw new Error("Transaction ID is required")
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/v3/transactions/${transactionId}/verify`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.config.secretKey}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`)
      }

      const data: TransactionVerifyResponse = await response.json()

      if (data.status !== "success") {
        throw new Error(`Transaction verification failed: ${data.message}`)
      }

      return data
    } catch (error) {
      console.error("Flutterwave transaction verification error:", error)
      throw new Error(`Failed to verify transaction: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Verify a transaction by its reference
   *
   * @param txRef - The transaction reference used when initiating payment
   * @returns Transaction verification details
   */
  async verifyTransactionByRef(txRef: string): Promise<TransactionVerifyResponse> {
    if (!txRef) {
      throw new Error("Transaction reference is required")
    }

    try {
      const response = await fetch(
        `${this.config.apiUrl}/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.config.secretKey}`,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || "Unknown error"}`)
      }

      const data: TransactionVerifyResponse = await response.json()

      if (data.status !== "success") {
        throw new Error(`Transaction verification failed: ${data.message}`)
      }

      return data
    } catch (error) {
      console.error("Flutterwave transaction verification error:", error)
      throw new Error(`Failed to verify transaction: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Verify webhook signature
   *
   * @param signature - The verif-hash header from the webhook request
   * @returns Boolean indicating if the signature is valid
   */
  verifyWebhookSignature(signature: string): boolean {
    if (!this.config.webhookSecret) {
      console.warn("Webhook secret not configured, skipping signature verification")
      return true
    }

    return signature === this.config.webhookSecret
  }

  /**
   * Get payment link for inline/modal payment
   * Used for frontend integration with Flutterwave inline
   */
  getInlineConfig(payment: PaymentRequest): Record<string, unknown> {
    return {
      public_key: this.config.publicKey,
      tx_ref: payment.tx_ref,
      amount: payment.amount,
      currency: payment.currency,
      payment_options: payment.payment_options || "card,mobilemoney,ussd",
      customer: payment.customer,
      customizations: payment.customizations || {
        title: "SafariPlus",
        description: "Safari Tour Booking Payment",
      },
      meta: payment.meta,
      redirect_url: payment.redirect_url,
    }
  }

  /**
   * Get the public key for frontend use
   */
  getPublicKey(): string {
    return this.config.publicKey
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let flutterwaveInstance: FlutterwaveClient | null = null

/**
 * Get the configured Flutterwave client instance
 * Singleton pattern ensures only one instance exists
 */
export function getFlutterwaveClient(): FlutterwaveClient {
  if (!flutterwaveInstance) {
    const config: FlutterwaveConfig = {
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || "",
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY || "",
      encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || "",
      apiUrl: process.env.FLUTTERWAVE_API_URL || "https://api.flutterwave.com",
      webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET,
    }

    flutterwaveInstance = new FlutterwaveClient(config)
  }

  return flutterwaveInstance
}

// Export the singleton instance as default
export const flutterwave = getFlutterwaveClient()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map Flutterwave payment type to our internal payment method enum
 */
export function mapFlutterwavePaymentMethod(paymentType: string): "MPESA" | "CARD" | "BANK_TRANSFER" | "PAYPAL" {
  const methodMap: Record<string, "MPESA" | "CARD" | "BANK_TRANSFER" | "PAYPAL"> = {
    "card": "CARD",
    "mobilemoney": "MPESA",
    "mobilemoneyghana": "MPESA",
    "mobilemoneyfranco": "MPESA",
    "mobilemoneyuganda": "MPESA",
    "mobilemoneyrwanda": "MPESA",
    "mobilemoneyzambia": "MPESA",
    "mpesa": "MPESA",
    "ussd": "BANK_TRANSFER",
    "bank_transfer": "BANK_TRANSFER",
    "account": "BANK_TRANSFER",
    "banktransfer": "BANK_TRANSFER",
    "qr": "BANK_TRANSFER",
    "paypal": "PAYPAL",
  }

  return methodMap[paymentType.toLowerCase()] || "CARD"
}

/**
 * Map Flutterwave status to our internal payment status
 */
export function mapFlutterwaveStatus(status: string): "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED" {
  const statusMap: Record<string, "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED"> = {
    "successful": "COMPLETED",
    "failed": "FAILED",
    "pending": "PENDING",
    "cancelled": "FAILED",
  }

  return statusMap[status.toLowerCase()] || "PENDING"
}

/**
 * Generate a unique transaction reference for a booking
 */
export function generateFlutterwaveTxRef(bookingReference: string): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString("hex")
  return `FLW-${bookingReference}-${timestamp}-${random}`
}

/**
 * Validate Flutterwave webhook payload
 */
export function validateFlutterwaveWebhook(payload: WebhookPayload): boolean {
  // Check required fields
  if (!payload.event || !payload.data?.id || !payload.data?.tx_ref) {
    return false
  }

  // Check event type
  const validEvents = ["charge.completed", "charge.successful", "charge.failed"]
  if (!validEvents.includes(payload.event)) {
    return false
  }

  return true
}

// Export types for use in other modules
export type {
  FlutterwaveConfig,
  Customer,
  Customizations,
  PaymentMeta,
  PaymentRequest,
  PaymentResponse,
  TransactionVerifyResponse,
  WebhookPayload,
}
