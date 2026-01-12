/**
 * Pesapal Payment Gateway Integration
 * API v3.0 Client Library
 *
 * @see https://developer.pesapal.com/
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  apiUrl: string
  ipnUrl: string
  ipnId?: string
}

interface AuthResponse {
  token: string
  expiryDate: string
  error?: {
    error_type: string
    code: string
    message: string
  }
  status: string
}

interface IPNRegistrationRequest {
  url: string
  ipn_notification_type: "GET" | "POST"
}

interface IPNRegistrationResponse {
  url: string
  created_date: string
  ipn_id: string
  error?: {
    error_type: string
    code: string
    message: string
  }
  status: string
}

interface BillingAddress {
  email_address: string
  phone_number?: string
  country_code?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  line_1?: string
  line_2?: string
  city?: string
  state?: string
  postal_code?: string
  zip_code?: string
}

interface OrderRequest {
  id: string
  currency: string
  amount: number
  description: string
  callback_url: string
  notification_id: string
  branch?: string
  billing_address: BillingAddress
}

interface OrderResponse {
  order_tracking_id: string
  merchant_reference: string
  redirect_url: string
  error?: {
    error_type: string
    code: string
    message: string
  }
  status: string
}

interface TransactionStatusResponse {
  payment_method: string
  amount: number
  created_date: string
  confirmation_code: string
  payment_status_description: string
  description: string
  message: string
  payment_account: string
  call_back_url: string
  status_code: number // 0 = Invalid, 1 = Completed, 2 = Failed, 3 = Reversed
  merchant_reference: string
  payment_status_code: string
  currency: string
  error?: {
    error_type: string
    code: string
    message: string
  }
  status: string
}

// ============================================================================
// PESAPAL CLIENT CLASS
// ============================================================================

export class PesapalClient {
  private config: PesapalConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: PesapalConfig) {
    // Validate configuration
    if (!config.consumerKey || !config.consumerSecret) {
      throw new Error("Pesapal consumer key and secret are required")
    }
    if (!config.apiUrl) {
      throw new Error("Pesapal API URL is required")
    }
    if (!config.ipnUrl) {
      throw new Error("Pesapal IPN URL is required")
    }

    this.config = config
  }

  /**
   * Get or refresh access token
   * Tokens are valid for 5 minutes as per Pesapal documentation
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 30 second buffer)
    if (this.accessToken && this.tokenExpiry) {
      const now = new Date()
      const bufferTime = new Date(this.tokenExpiry.getTime() - 30000) // 30 seconds before expiry

      if (now < bufferTime) {
        return this.accessToken
      }
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/api/Auth/RequestToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          consumer_key: this.config.consumerKey,
          consumer_secret: this.config.consumerSecret,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AuthResponse = await response.json()

      if (data.error || data.status !== "200") {
        throw new Error(`Pesapal authentication failed: ${data.error?.message || "Unknown error"}`)
      }

      if (!data.token || !data.expiryDate) {
        throw new Error("Invalid authentication response: missing token or expiry date")
      }

      this.accessToken = data.token
      this.tokenExpiry = new Date(data.expiryDate)

      return this.accessToken
    } catch (error) {
      console.error("Pesapal authentication error:", error)
      throw new Error(`Failed to authenticate with Pesapal: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Register IPN (Instant Payment Notification) URL
   * This should be called once during setup
   *
   * @param url - The URL where Pesapal will send payment notifications
   * @param notificationType - "GET" or "POST" (default: "POST")
   * @returns The IPN ID to be used in order submissions
   */
  async registerIPN(
    url?: string,
    notificationType: "GET" | "POST" = "POST"
  ): Promise<string> {
    const ipnUrl = url || this.config.ipnUrl

    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.config.apiUrl}/api/URLSetup/RegisterIPN`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          url: ipnUrl,
          ipn_notification_type: notificationType,
        } as IPNRegistrationRequest),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: IPNRegistrationResponse = await response.json()

      if (data.error || data.status !== "200") {
        throw new Error(`IPN registration failed: ${data.error?.message || "Unknown error"}`)
      }

      if (!data.ipn_id) {
        throw new Error("Invalid IPN registration response: missing ipn_id")
      }

      return data.ipn_id
    } catch (error) {
      console.error("Pesapal IPN registration error:", error)
      throw new Error(`Failed to register IPN with Pesapal: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Submit an order to Pesapal for payment
   *
   * @param order - Order details including amount, currency, and billing info
   * @returns Order tracking ID and redirect URL for customer payment
   */
  async submitOrder(order: OrderRequest): Promise<OrderResponse> {
    // Validate order data
    if (!order.id || !order.currency || !order.amount) {
      throw new Error("Order ID, currency, and amount are required")
    }

    if (!order.billing_address?.email_address) {
      throw new Error("Billing email address is required")
    }

    if (order.amount <= 0) {
      throw new Error("Order amount must be greater than zero")
    }

    // Validate currency
    const validCurrencies = ["KES", "TZS", "UGX", "USD"]
    if (!validCurrencies.includes(order.currency.toUpperCase())) {
      throw new Error(`Invalid currency. Supported currencies: ${validCurrencies.join(", ")}`)
    }

    // Use configured IPN ID if not provided in order
    const orderWithIpnId = {
      ...order,
      notification_id: order.notification_id || this.config.ipnId,
    }

    if (!orderWithIpnId.notification_id) {
      throw new Error("IPN ID is required. Please register your IPN URL first.")
    }

    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.config.apiUrl}/api/Transactions/SubmitOrderRequest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderWithIpnId),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: OrderResponse = await response.json()

      if (data.error || data.status !== "200") {
        throw new Error(`Order submission failed: ${data.error?.message || "Unknown error"}`)
      }

      if (!data.order_tracking_id || !data.redirect_url) {
        throw new Error("Invalid order response: missing tracking ID or redirect URL")
      }

      return data
    } catch (error) {
      console.error("Pesapal order submission error:", error)
      throw new Error(`Failed to submit order to Pesapal: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Get transaction status from Pesapal
   *
   * @param orderTrackingId - The order tracking ID returned from submitOrder
   * @returns Transaction status details including payment status
   */
  async getTransactionStatus(orderTrackingId: string): Promise<TransactionStatusResponse> {
    if (!orderTrackingId) {
      throw new Error("Order tracking ID is required")
    }

    try {
      const token = await this.getAccessToken()

      const response = await fetch(
        `${this.config.apiUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TransactionStatusResponse = await response.json()

      if (data.error) {
        throw new Error(`Status check failed: ${data.error.message || "Unknown error"}`)
      }

      return data
    } catch (error) {
      console.error("Pesapal transaction status error:", error)
      throw new Error(`Failed to get transaction status from Pesapal: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Get a list of registered IPN URLs (admin use)
   */
  async getRegisteredIPNs(): Promise<IPNRegistrationResponse[]> {
    try {
      const token = await this.getAccessToken()

      const response = await fetch(`${this.config.apiUrl}/api/URLSetup/GetIpnList`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Pesapal get IPNs error:", error)
      throw new Error(`Failed to get registered IPNs: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let pesapalInstance: PesapalClient | null = null

/**
 * Get the configured Pesapal client instance
 * Singleton pattern ensures only one instance exists
 */
export function getPesapalClient(): PesapalClient {
  if (!pesapalInstance) {
    const config: PesapalConfig = {
      consumerKey: process.env.PESAPAL_CONSUMER_KEY || "",
      consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || "",
      apiUrl: process.env.PESAPAL_API_URL || "https://cybqa.pesapal.com/pesapalv3",
      ipnUrl: process.env.PESAPAL_IPN_URL || "",
      ipnId: process.env.PESAPAL_IPN_ID,
    }

    pesapalInstance = new PesapalClient(config)
  }

  return pesapalInstance
}

// Export the singleton instance as default
export const pesapal = getPesapalClient()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Map Pesapal payment method to our internal payment method enum
 */
export function mapPaymentMethod(pesapalMethod: string): "MPESA" | "CARD" | "BANK_TRANSFER" | "PAYPAL" {
  const methodMap: Record<string, "MPESA" | "CARD" | "BANK_TRANSFER" | "PAYPAL"> = {
    "MPESA": "MPESA",
    "M-Pesa": "MPESA",
    "Airtel Money": "MPESA", // Group mobile money together
    "Visa": "CARD",
    "Mastercard": "CARD",
    "MasterCard": "CARD",
    "American Express": "CARD",
    "Amex": "CARD",
    "Equity": "BANK_TRANSFER",
    "Equity Bank": "BANK_TRANSFER",
    "Cooperative Bank": "BANK_TRANSFER",
    "Co-op": "BANK_TRANSFER",
    "PesaPal": "PAYPAL",
    "PesaPal Wallet": "PAYPAL",
  }

  return methodMap[pesapalMethod] || "CARD"
}

/**
 * Map Pesapal status code to our internal payment status
 */
export function mapPaymentStatus(statusCode: number): "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED" {
  const statusMap: Record<number, "COMPLETED" | "FAILED" | "PENDING" | "REFUNDED"> = {
    0: "PENDING",     // Invalid
    1: "COMPLETED",   // Completed
    2: "FAILED",      // Failed
    3: "REFUNDED",    // Reversed
  }

  return statusMap[statusCode] || "PENDING"
}

/**
 * Generate a unique merchant reference for a booking
 */
export function generateMerchantReference(bookingReference: string): string {
  const timestamp = Date.now()
  return `SP-${bookingReference}-${timestamp}`
}

// Pesapal IPN notification type
interface IPNNotification {
  OrderTrackingId?: string
  OrderMerchantReference?: string
  OrderNotificationType?: string
}

/**
 * Validate Pesapal IPN notification
 * Validates structure and optionally validates source IP
 */
export function validateIPNNotification(notification: IPNNotification): boolean {
  // Check required fields
  if (!notification.OrderTrackingId || !notification.OrderMerchantReference) {
    return false
  }

  return true
}

/**
 * Validate that the request is from Pesapal's IP range
 * Note: This is an additional security measure - the primary security
 * is verifying transactions by calling back to Pesapal API
 */
export function validatePesapalIP(ip: string | null): boolean {
  if (!ip) return false

  // Pesapal IP ranges (expand as needed from Pesapal documentation)
  const pesapalIPRanges = [
    "196.201.214.", // 196.201.214.0/24
    "197.248.",      // 197.248.0.0/16
  ]

  // In development, allow localhost
  if (process.env.NODE_ENV === "development") {
    if (ip === "127.0.0.1" || ip === "::1" || ip === "localhost") {
      return true
    }
  }

  return pesapalIPRanges.some(range => ip.startsWith(range))
}

// Export types for use in other modules
export type {
  PesapalConfig,
  AuthResponse,
  IPNRegistrationRequest,
  IPNRegistrationResponse,
  BillingAddress,
  OrderRequest,
  OrderResponse,
  TransactionStatusResponse,
}
