/**
 * Tour Wizard Types
 * Shared interfaces for the modular tour creation wizard
 */

import type { LucideIcon } from "lucide-react"

// ============================================================================
// ITINERARY DATA
// ============================================================================

export interface ItineraryData {
  id: string // temporary id for UI
  dayNumber: number
  title: string
  description: string
  location: string // e.g., "Masai Mara National Reserve"
  meals: string[]
  activities: string[] // planned activities (free text)
  // Accommodation references
  availableAccommodationIds: string[] // IDs of accommodations available this night
  defaultAccommodationId: string | null // the default selection (first by default)
  // Add-on references
  availableAddonIds: string[] // IDs of add-ons available this day
}

// ============================================================================
// ACCOMMODATION DATA
// ============================================================================

export interface AccommodationData {
  id: string // temporary id for UI
  name: string
  description: string
  tier: string
  pricePerNight: number
  location: string
  rating: number | null
  amenities: string[]
  roomType?: string
  images?: string[]
}

// ============================================================================
// ADD-ON DATA
// ============================================================================

export interface AddonData {
  id: string // temporary id for UI
  name: string
  description: string
  price: number
  duration: string
  maxCapacity: number | null
  dayAvailable: number[]
  type?: string
  category?: string
  priceType?: "PER_PERSON" | "PER_GROUP" | "FLAT"
  childPrice?: number | null
  isPopular?: boolean
  images?: string[]
}

// ============================================================================
// VEHICLE DATA
// ============================================================================

export type VehicleType =
  | "SAFARI_VAN"
  | "LAND_CRUISER"
  | "EXTENDED_CRUISER"
  | "OVERLAND_TRUCK"
  | "PRIVATE_VEHICLE"

export interface VehicleData {
  id: string // temporary id for UI
  type: VehicleType
  name: string
  description: string
  maxPassengers: number
  pricePerDay: number
  features: string[]
  images: string[]
  isDefault: boolean
  isActive: boolean
}

// ============================================================================
// PRICING CONFIG
// ============================================================================

export interface PricingConfigData {
  childDiscountPercent: number
  childMinAge: number
  childMaxAge: number
  infantMaxAge: number
  infantPrice: number
  serviceFeePercent: number
  serviceFeeFixed: number | null
  depositPercent: number | null
  depositMinimum: number | null
  groupDiscountThreshold: number | null
  groupDiscountPercent: number | null
  earlyBirdDays: number | null
  earlyBirdPercent: number | null
}

// ============================================================================
// FORM DATA
// ============================================================================

export interface TourFormData {
  // Basic info
  title: string
  subtitle: string
  description: string
  destination: string
  country: string
  region?: string
  startLocation?: string
  endLocation?: string

  // Duration
  durationDays: number
  durationNights: number

  // Pricing
  basePrice: number
  currency: string
  childPrice: number | null
  infantPrice: number | null
  singleSupplement: number | null

  // Capacity
  minGroupSize: number
  maxGroupSize: number

  // Deposit & Cancellation
  depositEnabled: boolean
  depositPercentage: number
  freeCancellationDays: number

  // Categorization
  difficulty: string
  tourType: string[]
  highlights: string[]
  included: string[]
  excluded: string[]
  bestSeason: string[]

  // Media
  coverImage: string
  images: string[]
  videoUrl?: string

  // Related data
  itinerary: ItineraryData[]
  accommodations: AccommodationData[]
  addons: AddonData[]
  vehicles: VehicleData[]

  // Advanced pricing config (optional)
  pricingConfig?: PricingConfigData
}

// ============================================================================
// WIZARD STEP
// ============================================================================

export interface WizardStep {
  id: number
  title: string
  description?: string
  icon: LucideIcon
}

// ============================================================================
// FORM CONTEXT
// ============================================================================

export interface TourFormContextType {
  formData: TourFormData
  updateFormData: <K extends keyof TourFormData>(field: K, value: TourFormData[K]) => void
  errors: Record<string, string>
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  clearError: (field: string) => void

  // List helpers
  toggleArrayItem: (field: keyof TourFormData, item: string) => void
  addListItem: (field: keyof TourFormData, value: string) => void
  removeListItem: (field: keyof TourFormData, index: number) => void

  // Itinerary helpers
  addItineraryDay: () => void
  updateItineraryDay: (id: string, data: Partial<ItineraryData>) => void
  removeItineraryDay: (id: string) => void
  toggleMeal: (dayId: string, meal: string) => void
  addActivity: (dayId: string, activity: string) => void
  removeActivity: (dayId: string, index: number) => void
  toggleDayAccommodation: (dayId: string, accId: string) => void
  setDefaultAccommodation: (dayId: string, accId: string) => void
  toggleDayAddon: (dayId: string, addonId: string) => void

  // Accommodation helpers
  addAccommodation: (acc: Omit<AccommodationData, "id">) => void
  updateAccommodation: (id: string, data: Partial<AccommodationData>) => void
  removeAccommodation: (id: string) => void

  // Add-on helpers
  addAddon: (addon: Omit<AddonData, "id">) => void
  updateAddon: (id: string, data: Partial<AddonData>) => void
  removeAddon: (id: string) => void

  // Vehicle helpers
  addVehicle: (vehicle: Omit<VehicleData, "id">) => void
  updateVehicle: (id: string, data: Partial<VehicleData>) => void
  removeVehicle: (id: string) => void
  setDefaultVehicle: (id: string) => void
}

// ============================================================================
// STEP PROPS
// ============================================================================

export interface StepProps {
  formData: TourFormData
  updateFormData: <K extends keyof TourFormData>(field: K, value: TourFormData[K]) => void
  errors: Record<string, string>
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_PRICING_CONFIG: PricingConfigData = {
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

export const INITIAL_FORM_DATA: TourFormData = {
  title: "",
  subtitle: "",
  description: "",
  destination: "",
  country: "",
  durationDays: 1,
  durationNights: 0,
  basePrice: 0,
  currency: "USD",
  childPrice: null,
  infantPrice: null,
  singleSupplement: null,
  minGroupSize: 1,
  maxGroupSize: 12,
  depositEnabled: false,
  depositPercentage: 30,
  freeCancellationDays: 14,
  difficulty: "MODERATE",
  tourType: [],
  highlights: [],
  included: [],
  excluded: [],
  bestSeason: [],
  coverImage: "",
  images: [],
  itinerary: [],
  accommodations: [],
  addons: [],
  vehicles: [],
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const COUNTRIES = ["Kenya", "Tanzania", "Uganda", "Rwanda"]

export const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"]

export const SEASONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  SAFARI_VAN: "Safari Van (7-seater)",
  LAND_CRUISER: "Land Cruiser 4x4 (6 pax)",
  EXTENDED_CRUISER: "Extended Land Cruiser (8 pax)",
  OVERLAND_TRUCK: "Overland Truck (20+ pax)",
  PRIVATE_VEHICLE: "Private/Own Vehicle",
}

export const VEHICLE_DEFAULTS: Record<VehicleType, Partial<VehicleData>> = {
  SAFARI_VAN: {
    name: "Toyota Safari Van",
    maxPassengers: 7,
    features: ["Pop-up roof", "Large windows", "Air conditioning"],
  },
  LAND_CRUISER: {
    name: "Toyota Land Cruiser 4x4",
    maxPassengers: 6,
    features: ["Pop-up roof", "4x4 capability", "Air conditioning", "Refrigerator"],
  },
  EXTENDED_CRUISER: {
    name: "Extended Land Cruiser",
    maxPassengers: 8,
    features: ["Extended wheelbase", "Pop-up roof", "4x4 capability", "Premium seating", "Charging ports"],
  },
  OVERLAND_TRUCK: {
    name: "Overland Safari Truck",
    maxPassengers: 24,
    features: ["Elevated seating", "Large windows", "Storage compartments", "Group friendly"],
  },
  PRIVATE_VEHICLE: {
    name: "Customer's Own Vehicle",
    maxPassengers: 4,
    features: ["Self-drive option"],
  },
}
