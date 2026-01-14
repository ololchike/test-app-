/**
 * Payment Gateway Router
 * Routes payments to the appropriate gateway based on payment method and currency
 */

export type PaymentGateway = "pesapal" | "flutterwave"

export type PaymentMethod = "mpesa" | "card" | "bank_transfer"

interface GatewayRoutingConfig {
  // M-Pesa is always routed to Pesapal (best rates for East Africa)
  mpesa: PaymentGateway
  // Cards can be routed based on currency/region
  card: {
    default: PaymentGateway
    // Override for specific currencies
    currencies?: Record<string, PaymentGateway>
  }
  // Bank transfer routing
  bank_transfer: PaymentGateway
}

const ROUTING_CONFIG: GatewayRoutingConfig = {
  // M-Pesa: Pesapal has better M-Pesa integration for East Africa
  mpesa: "pesapal",

  // Cards: Flutterwave for international cards, Pesapal for local
  card: {
    default: "flutterwave",
    currencies: {
      // Use Pesapal for Kenya, Tanzania, Uganda (better local rates)
      KES: "pesapal",
      TZS: "pesapal",
      UGX: "pesapal",
      // Use Flutterwave for international currencies (better rates & coverage)
      USD: "flutterwave",
      EUR: "flutterwave",
      GBP: "flutterwave",
      // Use Flutterwave for other African countries
      NGN: "flutterwave",
      GHS: "flutterwave",
      ZAR: "flutterwave",
      RWF: "flutterwave",
    },
  },

  // Bank transfers: Pesapal for East Africa
  bank_transfer: "pesapal",
}

/**
 * Determine which payment gateway to use based on payment method and currency
 *
 * @param method - The payment method selected by the user
 * @param currency - The currency of the transaction
 * @returns The payment gateway to use
 */
export function selectPaymentGateway(
  method: PaymentMethod,
  currency: string
): PaymentGateway {
  const normalizedCurrency = currency.toUpperCase()

  switch (method) {
    case "mpesa":
      return ROUTING_CONFIG.mpesa

    case "card":
      // Check for currency-specific routing
      const currencyGateway = ROUTING_CONFIG.card.currencies?.[normalizedCurrency]
      if (currencyGateway) {
        return currencyGateway
      }
      return ROUTING_CONFIG.card.default

    case "bank_transfer":
      return ROUTING_CONFIG.bank_transfer

    default:
      // Default to Flutterwave for unknown methods
      return "flutterwave"
  }
}

/**
 * Get the gateway name for display purposes
 */
export function getGatewayDisplayName(gateway: PaymentGateway): string {
  const names: Record<PaymentGateway, string> = {
    pesapal: "Pesapal",
    flutterwave: "Flutterwave",
  }
  return names[gateway]
}

/**
 * Get supported payment methods for a gateway
 */
export function getGatewayPaymentMethods(gateway: PaymentGateway): PaymentMethod[] {
  switch (gateway) {
    case "pesapal":
      return ["mpesa", "card", "bank_transfer"]
    case "flutterwave":
      return ["card", "bank_transfer"]
    default:
      return ["card"]
  }
}

/**
 * Check if a gateway supports a specific currency
 */
export function isGatewaySupportedCurrency(
  gateway: PaymentGateway,
  currency: string
): boolean {
  const normalizedCurrency = currency.toUpperCase()

  const pesapalCurrencies = ["KES", "TZS", "UGX", "USD"]
  const flutterwaveCurrencies = [
    "NGN", "USD", "EUR", "GBP", "KES", "GHS", "ZAR", "TZS", "UGX", "RWF"
  ]

  switch (gateway) {
    case "pesapal":
      return pesapalCurrencies.includes(normalizedCurrency)
    case "flutterwave":
      return flutterwaveCurrencies.includes(normalizedCurrency)
    default:
      return false
  }
}

/**
 * Get recommended gateway for a currency
 */
export function getRecommendedGateway(currency: string): PaymentGateway {
  const normalizedCurrency = currency.toUpperCase()

  // For East African currencies, prefer Pesapal
  const eastAfricanCurrencies = ["KES", "TZS", "UGX"]
  if (eastAfricanCurrencies.includes(normalizedCurrency)) {
    return "pesapal"
  }

  // For everything else, use Flutterwave
  return "flutterwave"
}

/**
 * Get available payment methods based on currency
 */
export function getAvailablePaymentMethods(currency: string): {
  method: PaymentMethod
  gateway: PaymentGateway
  label: string
  description: string
}[] {
  const normalizedCurrency = currency.toUpperCase()
  const methods: {
    method: PaymentMethod
    gateway: PaymentGateway
    label: string
    description: string
  }[] = []

  // M-Pesa is only available for East African currencies
  const mpesaCurrencies = ["KES", "TZS", "UGX"]
  if (mpesaCurrencies.includes(normalizedCurrency)) {
    methods.push({
      method: "mpesa",
      gateway: "pesapal",
      label: "M-Pesa",
      description: "Pay with M-Pesa mobile money",
    })
  }

  // Card payments
  const cardGateway = selectPaymentGateway("card", currency)
  methods.push({
    method: "card",
    gateway: cardGateway,
    label: "Credit/Debit Card",
    description: "Pay with Visa, Mastercard, or American Express",
  })

  // Bank transfer for supported currencies
  const bankTransferCurrencies = ["KES", "TZS", "UGX", "NGN", "GHS"]
  if (bankTransferCurrencies.includes(normalizedCurrency)) {
    methods.push({
      method: "bank_transfer",
      gateway: selectPaymentGateway("bank_transfer", currency),
      label: "Bank Transfer",
      description: "Pay directly from your bank account",
    })
  }

  return methods
}
