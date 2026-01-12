"use client"

import { useState, useMemo, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { format, addDays } from "date-fns"

// Types for the tour data
export interface ItineraryDay {
  id: string
  dayNumber: number
  title: string
  description: string
  location: string | null
  meals: string[]
  activities: string[]
  overnight: string | null
  availableAccommodationIds: string[]
  defaultAccommodationId: string | null
  availableAddonIds: string[]
}

export interface AccommodationOption {
  id: string
  tier: string
  name: string
  description: string | null
  pricePerNight: number
  images: string[]
  amenities: string[]
  location: string | null
  rating: number | null
}

export interface ActivityAddon {
  id: string
  name: string
  description: string | null
  price: number
  duration: string | null
  images: string[]
  dayAvailable: number[]
}

export interface TourData {
  id: string
  slug: string
  title: string
  basePrice: number
  durationDays: number
  durationNights: number
  maxGroupSize: number
  itinerary: ItineraryDay[]
  accommodationOptions: AccommodationOption[]
  activityAddons: ActivityAddon[]
}

// Booking state interface
export interface BookingState {
  accommodationsByNight: Record<number, string> // dayNumber -> accommodationId
  selectedAddons: string[] // addon IDs
  adults: number
  children: number
  startDate: Date | undefined
}

// Pricing breakdown interface
export interface PricingBreakdown {
  baseTotal: number
  childTotal: number
  accommodationBreakdown: { dayNumber: number; name: string; price: number; isUpgrade: boolean }[]
  accommodationTotal: number
  addonsBreakdown: { id: string; name: string; price: number; perPerson: number }[]
  addonsTotal: number
  serviceFee: number
  subtotal: number
  total: number
}

interface TourCustomizerProps {
  tour: TourData
  children: (props: {
    bookingState: BookingState
    pricing: PricingBreakdown
    updateAccommodation: (dayNumber: number, accommodationId: string) => void
    toggleAddon: (addonId: string) => void
    setAdults: (count: number) => void
    setChildren: (count: number) => void
    setStartDate: (date: Date | undefined) => void
    handleBooking: () => void
    isLoading: boolean
    endDate: Date | undefined
  }) => ReactNode
}

export function TourCustomizer({ tour, children }: TourCustomizerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize accommodations with defaults from itinerary
  const initialAccommodations = useMemo(() => {
    const defaults: Record<number, string> = {}
    tour.itinerary.forEach((day) => {
      // Only set accommodation for days with overnight stay (not last day typically)
      if (day.dayNumber < tour.durationDays) {
        if (day.defaultAccommodationId) {
          defaults[day.dayNumber] = day.defaultAccommodationId
        } else if (day.availableAccommodationIds.length > 0) {
          // Fall back to first available
          defaults[day.dayNumber] = day.availableAccommodationIds[0]
        } else if (tour.accommodationOptions.length > 0) {
          // Fall back to first global accommodation
          defaults[day.dayNumber] = tour.accommodationOptions[0].id
        }
      }
    })
    return defaults
  }, [tour.itinerary, tour.durationDays, tour.accommodationOptions])

  // Booking state
  const [bookingState, setBookingState] = useState<BookingState>({
    accommodationsByNight: initialAccommodations,
    selectedAddons: [],
    adults: 2,
    children: 0,
    startDate: undefined,
  })

  const totalGuests = bookingState.adults + bookingState.children
  const endDate = bookingState.startDate
    ? addDays(bookingState.startDate, tour.durationNights)
    : undefined

  // Get the default accommodation for a day (for price comparison)
  const getDefaultAccommodation = useCallback(
    (dayNumber: number) => {
      const day = tour.itinerary.find((d) => d.dayNumber === dayNumber)
      if (day?.defaultAccommodationId) {
        return tour.accommodationOptions.find((a) => a.id === day.defaultAccommodationId)
      }
      return null
    },
    [tour.itinerary, tour.accommodationOptions]
  )

  // Calculate pricing
  const pricing = useMemo<PricingBreakdown>(() => {
    // Base price calculations
    const baseTotal = tour.basePrice * bookingState.adults
    const childTotal = tour.basePrice * 0.7 * bookingState.children

    // Accommodation breakdown (per night)
    const accommodationBreakdown: PricingBreakdown["accommodationBreakdown"] = []
    let accommodationTotal = 0

    Object.entries(bookingState.accommodationsByNight).forEach(([dayNumStr, accId]) => {
      const dayNumber = parseInt(dayNumStr, 10)
      const accommodation = tour.accommodationOptions.find((a) => a.id === accId)
      const defaultAcc = getDefaultAccommodation(dayNumber)

      if (accommodation) {
        const isUpgrade = defaultAcc ? accommodation.pricePerNight > defaultAcc.pricePerNight : false
        accommodationBreakdown.push({
          dayNumber,
          name: accommodation.name,
          price: accommodation.pricePerNight,
          isUpgrade,
        })
        accommodationTotal += accommodation.pricePerNight
      }
    })

    // Sort by day number
    accommodationBreakdown.sort((a, b) => a.dayNumber - b.dayNumber)

    // Add-ons breakdown
    const addonsBreakdown: PricingBreakdown["addonsBreakdown"] = []
    let addonsTotal = 0

    bookingState.selectedAddons.forEach((addonId) => {
      const addon = tour.activityAddons.find((a) => a.id === addonId)
      if (addon) {
        const perPersonPrice = addon.price
        const totalPrice = perPersonPrice * totalGuests
        addonsBreakdown.push({
          id: addon.id,
          name: addon.name,
          price: totalPrice,
          perPerson: perPersonPrice,
        })
        addonsTotal += totalPrice
      }
    })

    const subtotal = baseTotal + childTotal + accommodationTotal + addonsTotal
    const serviceFee = Math.round(subtotal * 0.05)

    return {
      baseTotal,
      childTotal,
      accommodationBreakdown,
      accommodationTotal,
      addonsBreakdown,
      addonsTotal,
      serviceFee,
      subtotal,
      total: subtotal + serviceFee,
    }
  }, [
    bookingState.adults,
    bookingState.children,
    bookingState.accommodationsByNight,
    bookingState.selectedAddons,
    tour.basePrice,
    tour.accommodationOptions,
    tour.activityAddons,
    totalGuests,
    getDefaultAccommodation,
  ])

  // Update accommodation for a specific night
  const updateAccommodation = useCallback((dayNumber: number, accommodationId: string) => {
    setBookingState((prev) => ({
      ...prev,
      accommodationsByNight: {
        ...prev.accommodationsByNight,
        [dayNumber]: accommodationId,
      },
    }))
  }, [])

  // Toggle add-on selection
  const toggleAddon = useCallback((addonId: string) => {
    setBookingState((prev) => ({
      ...prev,
      selectedAddons: prev.selectedAddons.includes(addonId)
        ? prev.selectedAddons.filter((id) => id !== addonId)
        : [...prev.selectedAddons, addonId],
    }))
  }, [])

  // Update adults count
  const setAdults = useCallback(
    (count: number) => {
      setBookingState((prev) => ({
        ...prev,
        adults: Math.max(1, Math.min(tour.maxGroupSize - prev.children, count)),
      }))
    },
    [tour.maxGroupSize]
  )

  // Update children count
  const setChildrenCount = useCallback(
    (count: number) => {
      setBookingState((prev) => ({
        ...prev,
        children: Math.max(0, Math.min(tour.maxGroupSize - prev.adults, count)),
      }))
    },
    [tour.maxGroupSize]
  )

  // Update start date
  const setStartDate = useCallback((date: Date | undefined) => {
    setBookingState((prev) => ({
      ...prev,
      startDate: date,
    }))
  }, [])

  // Handle booking
  const handleBooking = useCallback(() => {
    if (!bookingState.startDate) return

    setIsLoading(true)

    // Build URL with booking state
    const params = new URLSearchParams({
      tourId: tour.id,
      startDate: format(bookingState.startDate, "yyyy-MM-dd"),
      adults: bookingState.adults.toString(),
      children: bookingState.children.toString(),
      accommodations: JSON.stringify(bookingState.accommodationsByNight),
      addons: bookingState.selectedAddons.join(","),
    })

    router.push(`/booking/checkout?${params.toString()}`)
  }, [bookingState, tour.id, router])

  return (
    <>
      {children({
        bookingState,
        pricing,
        updateAccommodation,
        toggleAddon,
        setAdults,
        setChildren: setChildrenCount,
        setStartDate,
        handleBooking,
        isLoading,
        endDate,
      })}
    </>
  )
}
