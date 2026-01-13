/**
 * Shared Enums and Constants
 *
 * This file contains all enums and constants used across the application.
 * These values are shared between frontend and backend for consistency.
 *
 * IMPORTANT: When updating these values, ensure Prisma schema is also updated
 * if the enum is used in the database.
 */

// ============================================
// USER & AUTH ENUMS
// ============================================

export const UserRole = {
  CLIENT: "CLIENT",
  AGENT: "AGENT",
  ADMIN: "ADMIN",
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const AccountStatus = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DEACTIVATED: "DEACTIVATED",
} as const

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus]

// ============================================
// TOUR ENUMS
// ============================================

export const TourStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  ARCHIVED: "ARCHIVED",
} as const

export type TourStatus = (typeof TourStatus)[keyof typeof TourStatus]

export const TourType = {
  SAFARI: "SAFARI",
  BEACH: "BEACH",
  MOUNTAIN: "MOUNTAIN",
  CULTURAL: "CULTURAL",
  ADVENTURE: "ADVENTURE",
  WILDLIFE: "WILDLIFE",
  GORILLA_TREKKING: "GORILLA_TREKKING",
  BIRD_WATCHING: "BIRD_WATCHING",
  PHOTOGRAPHY: "PHOTOGRAPHY",
  HONEYMOON: "HONEYMOON",
  FAMILY: "FAMILY",
  LUXURY: "LUXURY",
  BUDGET: "BUDGET",
} as const

export type TourType = (typeof TourType)[keyof typeof TourType]

// Tour type display labels for UI
export const TourTypeLabels: Record<TourType, string> = {
  [TourType.SAFARI]: "Safari",
  [TourType.BEACH]: "Beach",
  [TourType.MOUNTAIN]: "Mountain",
  [TourType.CULTURAL]: "Cultural",
  [TourType.ADVENTURE]: "Adventure",
  [TourType.WILDLIFE]: "Wildlife",
  [TourType.GORILLA_TREKKING]: "Gorilla Trekking",
  [TourType.BIRD_WATCHING]: "Bird Watching",
  [TourType.PHOTOGRAPHY]: "Photography",
  [TourType.HONEYMOON]: "Honeymoon",
  [TourType.FAMILY]: "Family",
  [TourType.LUXURY]: "Luxury",
  [TourType.BUDGET]: "Budget",
}

export const DifficultyLevel = {
  EASY: "EASY",
  MODERATE: "MODERATE",
  CHALLENGING: "CHALLENGING",
} as const

export type DifficultyLevel = (typeof DifficultyLevel)[keyof typeof DifficultyLevel]

// Difficulty level display labels for UI
export const DifficultyLevelLabels: Record<DifficultyLevel, string> = {
  [DifficultyLevel.EASY]: "Easy",
  [DifficultyLevel.MODERATE]: "Moderate",
  [DifficultyLevel.CHALLENGING]: "Challenging",
}

// ============================================
// ACCOMMODATION ENUMS
// ============================================

export const AccommodationTier = {
  BUDGET: "BUDGET",
  MID_RANGE: "MID_RANGE",
  LUXURY: "LUXURY",
  ULTRA_LUXURY: "ULTRA_LUXURY",
} as const

export type AccommodationTier = (typeof AccommodationTier)[keyof typeof AccommodationTier]

// Accommodation tier display labels for UI
export const AccommodationTierLabels: Record<AccommodationTier, string> = {
  [AccommodationTier.BUDGET]: "Budget",
  [AccommodationTier.MID_RANGE]: "Mid-Range",
  [AccommodationTier.LUXURY]: "Luxury",
  [AccommodationTier.ULTRA_LUXURY]: "Ultra-Luxury",
}

// ============================================
// BOOKING ENUMS
// ============================================

export const BookingStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  PAID: "PAID",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

export const BookingStatusLabels: Record<BookingStatus, string> = {
  [BookingStatus.PENDING]: "Pending",
  [BookingStatus.CONFIRMED]: "Confirmed",
  [BookingStatus.PAID]: "Paid",
  [BookingStatus.IN_PROGRESS]: "In Progress",
  [BookingStatus.COMPLETED]: "Completed",
  [BookingStatus.CANCELLED]: "Cancelled",
  [BookingStatus.REFUNDED]: "Refunded",
}

// ============================================
// PAYMENT ENUMS
// ============================================

export const PaymentStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const PaymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.PROCESSING]: "Processing",
  [PaymentStatus.COMPLETED]: "Completed",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
  [PaymentStatus.PARTIALLY_REFUNDED]: "Partially Refunded",
}

export const PaymentType = {
  FULL: "FULL",
  DEPOSIT: "DEPOSIT",
} as const

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType]

export const PaymentTypeLabels: Record<PaymentType, string> = {
  [PaymentType.FULL]: "Full Payment",
  [PaymentType.DEPOSIT]: "Deposit",
}

export const PaymentMethod = {
  MPESA: "MPESA",
  CARD: "CARD",
  BANK_TRANSFER: "BANK_TRANSFER",
  PAYPAL: "PAYPAL",
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.MPESA]: "M-Pesa",
  [PaymentMethod.CARD]: "Credit/Debit Card",
  [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
  [PaymentMethod.PAYPAL]: "PayPal",
}

// ============================================
// WITHDRAWAL ENUMS
// ============================================

export const WithdrawalStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  REJECTED: "REJECTED",
} as const

export type WithdrawalStatus = (typeof WithdrawalStatus)[keyof typeof WithdrawalStatus]

export const WithdrawalStatusLabels: Record<WithdrawalStatus, string> = {
  [WithdrawalStatus.PENDING]: "Pending",
  [WithdrawalStatus.APPROVED]: "Approved",
  [WithdrawalStatus.PROCESSING]: "Processing",
  [WithdrawalStatus.COMPLETED]: "Completed",
  [WithdrawalStatus.REJECTED]: "Rejected",
}

export const WithdrawalMethod = {
  MPESA: "MPESA",
  BANK: "BANK",
} as const

export type WithdrawalMethod = (typeof WithdrawalMethod)[keyof typeof WithdrawalMethod]

export const WithdrawalMethodLabels: Record<WithdrawalMethod, string> = {
  [WithdrawalMethod.MPESA]: "M-Pesa",
  [WithdrawalMethod.BANK]: "Bank Transfer",
}

// ============================================
// NOTIFICATION ENUMS
// ============================================

export const NotificationType = {
  BOOKING: "BOOKING",
  PAYMENT: "PAYMENT",
  REVIEW: "REVIEW",
  SYSTEM: "SYSTEM",
  AGENT: "AGENT",
  USER: "USER",
  WITHDRAWAL: "WITHDRAWAL",
  MESSAGE: "MESSAGE",
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

// ============================================
// CONTACT MESSAGE ENUMS
// ============================================

export const ContactMessageStatus = {
  NEW: "NEW",
  READ: "READ",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  NEEDS_INFO: "NEEDS_INFO",
} as const

export type ContactMessageStatus = (typeof ContactMessageStatus)[keyof typeof ContactMessageStatus]

export const ContactMessageStatusLabels: Record<ContactMessageStatus, string> = {
  [ContactMessageStatus.NEW]: "New",
  [ContactMessageStatus.READ]: "Read",
  [ContactMessageStatus.IN_PROGRESS]: "In Progress",
  [ContactMessageStatus.RESOLVED]: "Resolved",
  [ContactMessageStatus.CLOSED]: "Closed",
  [ContactMessageStatus.ACKNOWLEDGED]: "Acknowledged",
  [ContactMessageStatus.NEEDS_INFO]: "Needs Info",
}

// Admin-allowed statuses for contact messages
export const AdminContactStatuses = [
  ContactMessageStatus.NEW,
  ContactMessageStatus.READ,
  ContactMessageStatus.IN_PROGRESS,
  ContactMessageStatus.RESOLVED,
  ContactMessageStatus.CLOSED,
] as const

// Agent-allowed statuses for contact messages
export const AgentContactStatuses = [
  ContactMessageStatus.ACKNOWLEDGED,
  ContactMessageStatus.IN_PROGRESS,
  ContactMessageStatus.NEEDS_INFO,
  ContactMessageStatus.RESOLVED,
] as const

export const ContactReplyRole = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
} as const

export type ContactReplyRole = (typeof ContactReplyRole)[keyof typeof ContactReplyRole]

// ============================================
// AVAILABILITY ENUMS
// ============================================

export const AvailabilityType = {
  AVAILABLE: "AVAILABLE",
  BLOCKED: "BLOCKED",
  LIMITED: "LIMITED",
} as const

export type AvailabilityType = (typeof AvailabilityType)[keyof typeof AvailabilityType]

// ============================================
// AUDIT LOG ENUMS
// ============================================

export const AuditAction = {
  // Withdrawal actions
  WITHDRAWAL_REQUESTED: "WITHDRAWAL_REQUESTED",
  WITHDRAWAL_APPROVED: "WITHDRAWAL_APPROVED",
  WITHDRAWAL_REJECTED: "WITHDRAWAL_REJECTED",
  WITHDRAWAL_PROCESSING: "WITHDRAWAL_PROCESSING",
  WITHDRAWAL_COMPLETED: "WITHDRAWAL_COMPLETED",
  // Payment actions
  PAYMENT_INITIATED: "PAYMENT_INITIATED",
  PAYMENT_COMPLETED: "PAYMENT_COMPLETED",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_REFUNDED: "PAYMENT_REFUNDED",
  // Booking actions
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  // Agent actions
  AGENT_REGISTERED: "AGENT_REGISTERED",
  AGENT_APPROVED: "AGENT_APPROVED",
  AGENT_SUSPENDED: "AGENT_SUSPENDED",
  AGENT_DEACTIVATED: "AGENT_DEACTIVATED",
  // Tour actions
  TOUR_CREATED: "TOUR_CREATED",
  TOUR_APPROVED: "TOUR_APPROVED",
  TOUR_REJECTED: "TOUR_REJECTED",
  TOUR_ARCHIVED: "TOUR_ARCHIVED",
  // Commission actions
  COMMISSION_UPDATED: "COMMISSION_UPDATED",
} as const

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction]

// ============================================
// AGENT EARNING ENUMS
// ============================================

export const EarningType = {
  BOOKING: "BOOKING",
  BONUS: "BONUS",
  ADJUSTMENT: "ADJUSTMENT",
  REFUND: "REFUND",
} as const

export type EarningType = (typeof EarningType)[keyof typeof EarningType]

export const EarningTypeLabels: Record<EarningType, string> = {
  [EarningType.BOOKING]: "Booking",
  [EarningType.BONUS]: "Bonus",
  [EarningType.ADJUSTMENT]: "Adjustment",
  [EarningType.REFUND]: "Refund",
}

// ============================================
// MEAL OPTIONS
// ============================================

export const MealType = {
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
} as const

export type MealType = (typeof MealType)[keyof typeof MealType]

export const MealTypeLabels: Record<MealType, string> = {
  [MealType.BREAKFAST]: "Breakfast",
  [MealType.LUNCH]: "Lunch",
  [MealType.DINNER]: "Dinner",
}

// ============================================
// CURRENCY
// ============================================

export const Currency = {
  USD: "USD",
  KES: "KES",
  TZS: "TZS",
  UGX: "UGX",
  EUR: "EUR",
  GBP: "GBP",
} as const

export type Currency = (typeof Currency)[keyof typeof Currency]

export const CurrencyLabels: Record<Currency, string> = {
  [Currency.USD]: "US Dollar",
  [Currency.KES]: "Kenyan Shilling",
  [Currency.TZS]: "Tanzanian Shilling",
  [Currency.UGX]: "Ugandan Shilling",
  [Currency.EUR]: "Euro",
  [Currency.GBP]: "British Pound",
}

export const CurrencySymbols: Record<Currency, string> = {
  [Currency.USD]: "$",
  [Currency.KES]: "KSh",
  [Currency.TZS]: "TSh",
  [Currency.UGX]: "USh",
  [Currency.EUR]: "€",
  [Currency.GBP]: "£",
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all values from an enum object
 */
export function getEnumValues<T extends Record<string, string>>(enumObj: T): T[keyof T][] {
  return Object.values(enumObj) as T[keyof T][]
}

/**
 * Check if a value is a valid enum value
 */
export function isValidEnumValue<T extends Record<string, string>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] {
  return typeof value === "string" && Object.values(enumObj).includes(value as T[keyof T])
}

/**
 * Get label for an enum value
 */
export function getEnumLabel<T extends string>(
  labels: Record<T, string>,
  value: T
): string {
  return labels[value] || value
}
