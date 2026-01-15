"use client"

// Unified Checkout Types

// Payment method options
export const PAYMENT_METHODS = {
  MPESA: "MPESA",
  AIRTEL_MONEY: "AIRTEL_MONEY",
  CARD: "CARD",
} as const

export type PaymentMethod = keyof typeof PAYMENT_METHODS | null

export const PAYMENT_METHOD_CONFIG: Record<keyof typeof PAYMENT_METHODS, {
  label: string
  description: string
  icon: string
  available: boolean
}> = {
  MPESA: {
    label: "M-Pesa",
    description: "Pay instantly with M-Pesa mobile money",
    icon: "smartphone",
    available: true,
  },
  AIRTEL_MONEY: {
    label: "Airtel Money",
    description: "Pay with Airtel Money mobile wallet",
    icon: "wallet",
    available: true,
  },
  CARD: {
    label: "Credit/Debit Card",
    description: "Pay securely with Visa, Mastercard via PesaPal",
    icon: "credit-card",
    available: false, // Coming soon
  },
}

// Payment type options
export const PAYMENT_TYPES = {
  FULL: "FULL",
  DEPOSIT: "DEPOSIT",
  PAY_LATER: "PAY_LATER",
} as const

export type PaymentType = keyof typeof PAYMENT_TYPES

export const PAYMENT_TYPE_CONFIG: Record<PaymentType, {
  label: string
  description: string
}> = {
  FULL: {
    label: "Pay in Full",
    description: "Pay the complete amount now",
  },
  DEPOSIT: {
    label: "Pay Deposit",
    description: "Pay a deposit now, balance due later",
  },
  PAY_LATER: {
    label: "Book Now, Pay Later",
    description: "Reserve your spot, pay before your trip",
  },
}

export interface TourSummary {
  id: string
  title: string
  slug: string
  coverImage: string | null
  destination: string
  country: string
  durationDays: number
  durationNights: number
  basePrice: number
  childPrice?: number
  infantPrice?: number
  depositEnabled: boolean
  depositPercentage: number
  freeCancellationDays: number
  agent: {
    id: string
    businessName: string
    isVerified: boolean
  }
}

export interface VehicleOption {
  id: string
  type: string
  name: string
  description: string | null
  maxPassengers: number
  pricePerDay: number
  features: string[]
  images: string[]
  isDefault: boolean
}

export interface AccommodationOption {
  id: string
  name: string
  description: string | null
  tier: "BUDGET" | "STANDARD" | "PREMIUM" | "LUXURY"
  pricePerNight: number
  location: string | null
  rating: number | null
  amenities: string[]
  roomType: string | null
}

export interface AddonOption {
  id: string
  name: string
  description: string | null
  price: number
  childPrice: number | null
  duration: string | null
  maxCapacity: number | null
  type: string
  category: string
  priceType: "PER_PERSON" | "PER_GROUP" | "FLAT_RATE"
  isPopular: boolean
  dayAvailable: number[] | null
}

export interface ItineraryDay {
  dayNumber: number
  title: string
  description: string | null
  location: string | null
  meals: string[]
  activities: string[]
  overnight: string | null
  availableAccommodationIds: string[]
  defaultAccommodationId: string | null
  availableAddonIds: string[]
}

// Configurable pricing rules
export interface PricingConfig {
  // Child pricing
  childDiscountPercent: number   // e.g., 30 means 30% discount from adult price
  childMinAge: number            // Minimum age to be considered child
  childMaxAge: number            // Maximum age to be considered child

  // Infant pricing
  infantMaxAge: number           // Max age for infant (usually free)
  infantPrice: number            // Usually 0

  // Service fees
  serviceFeePercent: number      // Platform service fee percentage
  serviceFeeFixed: number | null // Optional fixed service fee

  // Deposit overrides
  depositPercent: number | null  // Override deposit percentage
  depositMinimum: number | null  // Minimum deposit amount

  // Group discounts
  groupDiscountThreshold: number | null // Min group size for discount
  groupDiscountPercent: number | null   // Discount percentage for groups

  // Early bird discount
  earlyBirdDays: number | null    // Days before trip for early bird
  earlyBirdPercent: number | null // Early bird discount percentage
}

export interface Traveler {
  type: "adult" | "child" | "infant"
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
}

export interface ContactInfo {
  name: string
  email: string
  phone: string
  specialRequests: string
}

export interface PromoCode {
  id: string
  code: string
  discountAmount: number
  discountType: "PERCENTAGE" | "FIXED"
}

export interface PricingBreakdown {
  // Base pricing
  baseTotal: number         // Tour base price * adults
  childTotal: number        // Child price * children
  infantTotal: number       // Infant price * infants

  // Selected options
  vehicleTotal: number      // Vehicle upgrades
  accommodationTotal: number // Selected accommodations
  addonsTotal: number       // Selected add-ons

  // Fees and discounts
  serviceFee: number        // Platform service fee
  discount: number          // Applied promo discount

  // Final amounts
  subtotal: number          // Before fees and discounts
  total: number             // Final amount to pay

  // Deposit option
  depositAmount: number     // Amount if paying deposit
  balanceAmount: number     // Remaining balance after deposit
}

export interface CheckoutSelections {
  // Selected vehicle (optional upgrade from default)
  vehicleId: string | null

  // Selected accommodations per day
  accommodations: Record<number, string> // dayNumber -> accommodationId

  // Selected add-ons with quantities
  addons: Array<{
    id: string
    quantity: number
    dayNumber?: number // For day-specific add-ons
  }>
}

export interface CheckoutState {
  // Session info
  sessionId: string | null
  expiresAt: Date | null

  // Tour and booking info
  tour: TourSummary | null
  startDate: Date | null
  endDate: Date | null
  adults: number
  children: number
  infants: number

  // Available options (loaded from tour)
  vehicles: VehicleOption[]
  accommodationOptions: AccommodationOption[]
  addonOptions: AddonOption[]
  itinerary: ItineraryDay[]

  // Configurable pricing rules
  pricingConfig: PricingConfig

  // User selections
  selections: CheckoutSelections

  // Contact and travelers
  contact: ContactInfo
  travelers: Traveler[]

  // Pricing
  pricing: PricingBreakdown
  promoCode: PromoCode | null

  // Payment options
  paymentType: PaymentType
  paymentMethod: PaymentMethod

  // For existing bookings
  existingBookingId: string | null
  bookingReference: string | null
}

export interface CheckoutContextValue {
  state: CheckoutState
  isLoading: boolean
  error: string | null

  // Actions
  initializeCheckout: (params: CheckoutInitParams) => Promise<void>
  loadExistingBooking: (bookingId: string) => Promise<void>

  // Selection updates
  setVehicle: (vehicleId: string | null) => void
  setAccommodation: (dayNumber: number, accommodationId: string) => void
  toggleAddon: (addonId: string, quantity?: number, dayNumber?: number) => void

  // Contact and travelers
  setContact: (contact: ContactInfo) => void
  setTravelers: (travelers: Traveler[]) => void

  // Promo and payment
  applyPromoCode: (code: string) => Promise<boolean>
  removePromoCode: () => void
  setPaymentType: (type: PaymentType) => void
  setPaymentMethod: (method: PaymentMethod) => void

  // Terms acceptance
  acceptedTerms: boolean
  setAcceptedTerms: (accepted: boolean) => void

  // Submission
  submitBooking: () => Promise<string> // Returns booking ID
  initiatePayment: () => Promise<string> // Returns payment redirect URL

  // Utility
  recalculatePricing: () => void
  validateStep: (step: CheckoutStep) => ValidationResult
}

export interface CheckoutInitParams {
  tourId: string
  startDate: string
  adults: number
  children: number
  infants: number
  preselectedAccommodations?: Record<number, string>
  preselectedAddons?: string[]
  preselectedVehicle?: string
}

export type CheckoutStep =
  | "selections"    // Vehicle, accommodations, add-ons
  | "travelers"     // Traveler details
  | "contact"       // Contact information
  | "payment"       // Payment method and promo

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export const CHECKOUT_STEPS: Array<{
  id: CheckoutStep
  title: string
  description: string
}> = [
  { id: "selections", title: "Customize", description: "Vehicle & options" },
  { id: "travelers", title: "Travelers", description: "Passenger details" },
  { id: "contact", title: "Contact", description: "Your information" },
  { id: "payment", title: "Payment", description: "Complete booking" },
]

// Default pricing configuration
export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  childDiscountPercent: 30,
  childMinAge: 3,
  childMaxAge: 11,
  infantMaxAge: 2,
  infantPrice: 0,
  serviceFeePercent: 5,
  serviceFeeFixed: null,
  depositPercent: null,
  depositMinimum: null,
  groupDiscountThreshold: null,
  groupDiscountPercent: null,
  earlyBirdDays: null,
  earlyBirdPercent: null,
}

// Default empty state
export const DEFAULT_CHECKOUT_STATE: CheckoutState = {
  sessionId: null,
  expiresAt: null,
  tour: null,
  startDate: null,
  endDate: null,
  adults: 2,
  children: 0,
  infants: 0,
  vehicles: [],
  accommodationOptions: [],
  addonOptions: [],
  itinerary: [],
  pricingConfig: DEFAULT_PRICING_CONFIG,
  selections: {
    vehicleId: null,
    accommodations: {},
    addons: [],
  },
  contact: {
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  },
  travelers: [],
  pricing: {
    baseTotal: 0,
    childTotal: 0,
    infantTotal: 0,
    vehicleTotal: 0,
    accommodationTotal: 0,
    addonsTotal: 0,
    serviceFee: 0,
    discount: 0,
    subtotal: 0,
    total: 0,
    depositAmount: 0,
    balanceAmount: 0,
  },
  promoCode: null,
  paymentType: "FULL",
  paymentMethod: null,
  existingBookingId: null,
  bookingReference: null,
}
