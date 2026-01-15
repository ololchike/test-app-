"use client"

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react"
import { useSession } from "next-auth/react"
import { addDays } from "date-fns"
import {
  CheckoutState,
  CheckoutContextValue,
  CheckoutInitParams,
  CheckoutStep,
  ValidationResult,
  ContactInfo,
  Traveler,
  DEFAULT_CHECKOUT_STATE,
  DEFAULT_PRICING_CONFIG,
  PromoCode,
  PricingConfig,
  PaymentType,
  PaymentMethod,
  VehicleSelection,
  calculateVehicleSuggestion,
} from "./types"

const CheckoutContext = createContext<CheckoutContextValue | null>(null)

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (!context) {
    throw new Error("useCheckout must be used within CheckoutProvider")
  }
  return context
}

interface CheckoutProviderProps {
  children: ReactNode
}

export function CheckoutProvider({ children }: CheckoutProviderProps) {
  const { data: session } = useSession()
  const [state, setState] = useState<CheckoutState>(DEFAULT_CHECKOUT_STATE)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Prefill contact from session
  useEffect(() => {
    if (session?.user && !state.contact.email) {
      setState(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          name: prev.contact.name || session.user.name || "",
          email: prev.contact.email || session.user.email || "",
          phone: prev.contact.phone || (session.user as { phone?: string }).phone || "",
        },
      }))
    }
  }, [session, state.contact.email])

  // Recalculate pricing when selections change
  const recalculatePricing = useCallback(() => {
    setState(prev => {
      if (!prev.tour) return prev

      const { tour, adults, children, infants, startDate, selections, vehicles, accommodationOptions, addonOptions, promoCode, pricingConfig } = prev

      // Base pricing for adults
      const baseTotal = tour.basePrice * adults

      // Child pricing - use configurable discount or tour-specific price
      const childDiscount = pricingConfig.childDiscountPercent / 100
      const childPricePerPerson = tour.childPrice ?? Math.round(tour.basePrice * (1 - childDiscount))
      const childTotal = childPricePerPerson * children

      // Infant pricing - use configurable or 0
      const infantTotal = (pricingConfig.infantPrice || tour.infantPrice || 0) * infants

      // Vehicle pricing (supports multiple vehicles with quantities)
      let vehicleTotal = 0
      const defaultVehicle = vehicles.find(v => v.isDefault)

      // Use new vehicles array if available, fall back to single vehicleId
      if (selections.vehicles && selections.vehicles.length > 0) {
        selections.vehicles.forEach(({ vehicleId, quantity }) => {
          const vehicle = vehicles.find(v => v.id === vehicleId)
          if (vehicle) {
            if (defaultVehicle) {
              // Calculate upgrade cost (difference from default)
              const priceDiff = vehicle.pricePerDay - defaultVehicle.pricePerDay
              vehicleTotal += priceDiff * tour.durationDays * quantity
            } else {
              vehicleTotal += vehicle.pricePerDay * tour.durationDays * quantity
            }
          }
        })
      } else if (selections.vehicleId) {
        // Legacy single vehicle support
        const selectedVehicle = vehicles.find(v => v.id === selections.vehicleId)
        if (selectedVehicle && defaultVehicle) {
          const priceDiff = selectedVehicle.pricePerDay - defaultVehicle.pricePerDay
          vehicleTotal = priceDiff * tour.durationDays
        } else if (selectedVehicle) {
          vehicleTotal = selectedVehicle.pricePerDay * tour.durationDays
        }
      }

      // Accommodation pricing
      let accommodationTotal = 0
      Object.values(selections.accommodations).forEach(accId => {
        const acc = accommodationOptions.find(a => a.id === accId)
        if (acc) {
          accommodationTotal += acc.pricePerNight
        }
      })

      // Add-ons pricing
      let addonsTotal = 0
      selections.addons.forEach(({ id, quantity }) => {
        const addon = addonOptions.find(a => a.id === id)
        if (addon) {
          if (addon.priceType === "PER_PERSON") {
            addonsTotal += addon.price * quantity
          } else if (addon.priceType === "PER_GROUP") {
            addonsTotal += addon.price
          } else {
            addonsTotal += addon.price
          }
        }
      })

      // Calculate subtotal before fees and discounts
      const subtotal = baseTotal + childTotal + infantTotal + vehicleTotal + accommodationTotal + addonsTotal

      // Service fee - use configurable percentage
      let serviceFee = 0
      if (pricingConfig.serviceFeeFixed !== null) {
        serviceFee = pricingConfig.serviceFeeFixed
      } else {
        serviceFee = Math.round(subtotal * (pricingConfig.serviceFeePercent / 100))
      }

      // Calculate automatic discounts
      let discount = 0

      // 1. Group discount
      const totalGuests = adults + children
      if (
        pricingConfig.groupDiscountThreshold !== null &&
        pricingConfig.groupDiscountPercent !== null &&
        totalGuests >= pricingConfig.groupDiscountThreshold
      ) {
        discount += Math.round(subtotal * (pricingConfig.groupDiscountPercent / 100))
      }

      // 2. Early bird discount
      if (
        startDate &&
        pricingConfig.earlyBirdDays !== null &&
        pricingConfig.earlyBirdPercent !== null
      ) {
        const daysUntilTrip = Math.floor((startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (daysUntilTrip >= pricingConfig.earlyBirdDays) {
          discount += Math.round(subtotal * (pricingConfig.earlyBirdPercent / 100))
        }
      }

      // 3. Promo code discount (on top of other discounts)
      if (promoCode) {
        if (promoCode.discountType === "PERCENTAGE") {
          discount += Math.round(subtotal * (promoCode.discountAmount / 100))
        } else {
          discount += promoCode.discountAmount
        }
      }

      const total = Math.max(0, subtotal + serviceFee - discount)

      // Deposit calculations - use configurable or tour defaults
      const depositPercent = pricingConfig.depositPercent ?? tour.depositPercentage
      let depositAmount = tour.depositEnabled
        ? Math.round(total * (depositPercent / 100))
        : total

      // Apply minimum deposit if set
      if (pricingConfig.depositMinimum !== null && depositAmount < pricingConfig.depositMinimum) {
        depositAmount = Math.min(pricingConfig.depositMinimum, total)
      }

      const balanceAmount = total - depositAmount

      return {
        ...prev,
        pricing: {
          baseTotal,
          childTotal,
          infantTotal,
          vehicleTotal,
          accommodationTotal,
          addonsTotal,
          serviceFee,
          discount,
          subtotal,
          total,
          depositAmount,
          balanceAmount,
        },
      }
    })
  }, [])

  // Initialize checkout for new booking
  const initializeCheckout = useCallback(async (params: CheckoutInitParams) => {
    setIsLoading(true)
    setError(null)

    try {
      // Create checkout session with availability hold
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to initialize checkout")
      }

      const { session: checkoutSession, tour, vehicles, accommodations, addons, itinerary, pricingConfig } = await response.json()

      const startDate = new Date(params.startDate)
      const endDate = addDays(startDate, tour.durationNights)

      // Initialize travelers array
      const travelers: Traveler[] = [
        ...Array(params.adults).fill(null).map(() => ({
          type: "adult" as const,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          nationality: "",
          passportNumber: "",
        })),
        ...Array(params.children).fill(null).map(() => ({
          type: "child" as const,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          nationality: "",
          passportNumber: "",
        })),
        ...Array(params.infants).fill(null).map(() => ({
          type: "infant" as const,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          nationality: "",
          passportNumber: "",
        })),
      ]

      // Calculate total group size for vehicle capacity
      const totalGroupSize = params.adults + params.children

      // Calculate suggested vehicles based on group size
      const suggestedVehicles = calculateVehicleSuggestion(vehicles, totalGroupSize)

      // Set default vehicle if available (for legacy support)
      const defaultVehicle = vehicles.find((v: { isDefault: boolean }) => v.isDefault)

      // Set default accommodations per day
      const defaultAccommodations: Record<number, string> = {}
      itinerary.forEach((day: { dayNumber: number; defaultAccommodationId?: string }) => {
        if (day.defaultAccommodationId) {
          defaultAccommodations[day.dayNumber] = day.defaultAccommodationId
        }
      })

      // Apply preselections with capacity-based vehicle suggestion
      const initialSelections = {
        vehicleId: params.preselectedVehicle || defaultVehicle?.id || null,
        vehicles: suggestedVehicles.length > 0 ? suggestedVehicles : (defaultVehicle ? [{ vehicleId: defaultVehicle.id, quantity: 1 }] : []),
        accommodations: params.preselectedAccommodations || defaultAccommodations,
        addons: params.preselectedAddons?.map(id => ({ id, quantity: params.adults + params.children })) || [],
      }

      setState({
        sessionId: checkoutSession.id,
        expiresAt: new Date(checkoutSession.expiresAt),
        tour,
        startDate,
        endDate,
        adults: params.adults,
        children: params.children,
        infants: params.infants,
        vehicles,
        accommodationOptions: accommodations,
        addonOptions: addons,
        itinerary,
        pricingConfig: pricingConfig || DEFAULT_PRICING_CONFIG,
        selections: initialSelections,
        contact: DEFAULT_CHECKOUT_STATE.contact,
        travelers,
        pricing: DEFAULT_CHECKOUT_STATE.pricing,
        promoCode: null,
        paymentType: "FULL",
        paymentMethod: null,
        existingBookingId: null,
        bookingReference: null,
      })

      // Trigger pricing recalculation
      setTimeout(recalculatePricing, 0)
    } catch (err) {
      console.error("Error initializing checkout:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize checkout")
    } finally {
      setIsLoading(false)
    }
  }, [recalculatePricing])

  // Load existing booking for payment completion
  const loadExistingBooking = useCallback(async (bookingId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/bookings/${bookingId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Booking not found")
        } else if (response.status === 403) {
          throw new Error("You don't have access to this booking")
        }
        throw new Error("Failed to load booking")
      }

      const data = await response.json()
      const booking = data.booking || data

      // Parse contact from booking
      const nameParts = (booking.contactName || "").split(" ")
      const contact: ContactInfo = {
        name: booking.contactName || "",
        email: booking.contactEmail || "",
        phone: booking.contactPhone || "",
        specialRequests: booking.specialRequests || "",
      }

      // Create travelers from booking data
      const travelers: Traveler[] = [
        ...Array(booking.adults || 0).fill(null).map(() => ({
          type: "adult" as const,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          nationality: "",
          passportNumber: "",
        })),
        ...Array(booking.children || 0).fill(null).map(() => ({
          type: "child" as const,
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          nationality: "",
          passportNumber: "",
        })),
      ]

      // Set first traveler with contact name
      if (travelers.length > 0 && nameParts.length > 0) {
        travelers[0] = {
          ...travelers[0],
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
        }
      }

      setState({
        sessionId: null,
        expiresAt: null,
        tour: {
          id: booking.tour?.id || "",
          title: booking.tour?.title || "",
          slug: booking.tour?.slug || "",
          coverImage: booking.tour?.coverImage || null,
          destination: booking.tour?.destination || "",
          country: booking.tour?.country || "",
          durationDays: booking.tour?.durationDays || 0,
          durationNights: booking.tour?.durationNights || 0,
          basePrice: booking.baseAmount / (booking.adults || 1),
          depositEnabled: false,
          depositPercentage: 0,
          freeCancellationDays: 0,
          agent: {
            id: booking.tour?.agent?.id || "",
            businessName: booking.tour?.agent?.businessName || "",
            isVerified: booking.tour?.agent?.isVerified || false,
          },
        },
        startDate: booking.startDate ? new Date(booking.startDate) : null,
        endDate: booking.endDate ? new Date(booking.endDate) : null,
        adults: booking.adults || 0,
        children: booking.children || 0,
        infants: booking.infants || 0,
        vehicles: [],
        accommodationOptions: [],
        addonOptions: [],
        itinerary: [],
        pricingConfig: DEFAULT_PRICING_CONFIG,
        selections: {
          vehicleId: null,
          vehicles: [],
          accommodations: {},
          addons: [],
        },
        contact,
        travelers,
        pricing: {
          baseTotal: booking.baseAmount || 0,
          childTotal: 0,
          infantTotal: 0,
          vehicleTotal: booking.vehicleAmount || 0,
          accommodationTotal: booking.accommodationAmount || 0,
          addonsTotal: booking.activitiesAmount || 0,
          serviceFee: booking.taxAmount || 0,
          discount: booking.discountAmount || 0,
          subtotal: 0,
          total: booking.totalAmount || 0,
          depositAmount: booking.depositAmount || booking.totalAmount || 0,
          balanceAmount: booking.balanceAmount || 0,
        },
        promoCode: null,
        paymentType: "FULL",
        paymentMethod: null,
        existingBookingId: booking.id,
        bookingReference: booking.bookingReference,
      })
    } catch (err) {
      console.error("Error loading booking:", err)
      setError(err instanceof Error ? err.message : "Failed to load booking")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Selection handlers
  const setVehicle = useCallback((vehicleId: string | null) => {
    setState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        vehicleId,
        // Clear vehicles array when using legacy single vehicle
        vehicles: vehicleId ? [{ vehicleId, quantity: 1 }] : [],
      },
    }))
    setTimeout(recalculatePricing, 0)
  }, [recalculatePricing])

  // Set multiple vehicles with quantities (for capacity-based selection)
  const setVehicles = useCallback((vehicles: VehicleSelection[]) => {
    setState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        vehicles,
        // Keep vehicleId in sync for legacy support
        vehicleId: vehicles.length > 0 ? vehicles[0].vehicleId : null,
      },
    }))
    setTimeout(recalculatePricing, 0)
  }, [recalculatePricing])

  const setAccommodation = useCallback((dayNumber: number, accommodationId: string) => {
    setState(prev => ({
      ...prev,
      selections: {
        ...prev.selections,
        accommodations: {
          ...prev.selections.accommodations,
          [dayNumber]: accommodationId,
        },
      },
    }))
    setTimeout(recalculatePricing, 0)
  }, [recalculatePricing])

  const toggleAddon = useCallback((addonId: string, quantity?: number, dayNumber?: number) => {
    setState(prev => {
      const existing = prev.selections.addons.findIndex(a => a.id === addonId)

      if (existing >= 0) {
        // Remove addon
        return {
          ...prev,
          selections: {
            ...prev.selections,
            addons: prev.selections.addons.filter((_, i) => i !== existing),
          },
        }
      } else {
        // Add addon
        const defaultQuantity = quantity ?? (prev.adults + prev.children)
        return {
          ...prev,
          selections: {
            ...prev.selections,
            addons: [
              ...prev.selections.addons,
              { id: addonId, quantity: defaultQuantity, dayNumber },
            ],
          },
        }
      }
    })
    setTimeout(recalculatePricing, 0)
  }, [recalculatePricing])

  // Contact and traveler handlers
  const setContact = useCallback((contact: ContactInfo) => {
    setState(prev => ({ ...prev, contact }))
  }, [])

  const setTravelers = useCallback((travelers: Traveler[]) => {
    setState(prev => ({ ...prev, travelers }))
  }, [])

  // Promo code handlers
  const applyPromoCode = useCallback(async (code: string): Promise<boolean> => {
    if (!state.tour) return false

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          tourId: state.tour.id,
          bookingAmount: state.pricing.subtotal + state.pricing.serviceFee,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        return false
      }

      const promo: PromoCode = {
        id: data.promoCode.id,
        code: data.promoCode.code,
        discountAmount: data.promoCode.discountAmount,
        discountType: data.promoCode.discountType,
      }

      setState(prev => ({ ...prev, promoCode: promo }))
      setTimeout(recalculatePricing, 0)
      return true
    } catch (err) {
      console.error("Error validating promo:", err)
      return false
    }
  }, [state.tour, state.pricing.subtotal, state.pricing.serviceFee, recalculatePricing])

  const removePromoCode = useCallback(() => {
    setState(prev => ({ ...prev, promoCode: null }))
    setTimeout(recalculatePricing, 0)
  }, [recalculatePricing])

  const setPaymentType = useCallback((type: PaymentType) => {
    setState(prev => ({ ...prev, paymentType: type }))
  }, [])

  const setPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({ ...prev, paymentMethod: method }))
  }, [])

  // Validation
  const validateStep = useCallback((step: CheckoutStep): ValidationResult => {
    const errors: Record<string, string> = {}

    switch (step) {
      case "selections":
        // Vehicle and options are optional, no validation needed
        break

      case "travelers":
        state.travelers.forEach((traveler, index) => {
          if (!traveler.firstName.trim()) {
            errors[`traveler_${index}_firstName`] = "First name is required"
          }
          if (!traveler.lastName.trim()) {
            errors[`traveler_${index}_lastName`] = "Last name is required"
          }
        })
        break

      case "contact":
        if (!state.contact.name.trim()) {
          errors.contact_name = "Full name is required"
        }
        if (!state.contact.email.trim()) {
          errors.contact_email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.contact.email)) {
          errors.contact_email = "Please enter a valid email"
        }
        if (!state.contact.phone.trim()) {
          errors.contact_phone = "Phone number is required"
        }
        break

      case "payment":
        // Validate payment method is selected (unless paying later)
        if (state.paymentType !== "PAY_LATER" && !state.paymentMethod) {
          errors.payment_method = "Please select a payment method"
        }
        break
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    }
  }, [state.travelers, state.contact, state.paymentType, state.paymentMethod])

  // Submit booking
  const submitBooking = useCallback(async (): Promise<string> => {
    if (!state.tour) {
      throw new Error("Tour data not loaded")
    }

    // Calculate deposit if applicable
    const depositAmount = state.paymentType === "DEPOSIT" && state.tour.depositEnabled
      ? state.pricing.depositAmount
      : state.pricing.total
    const balanceAmount = state.paymentType === "DEPOSIT" && state.tour.depositEnabled
      ? state.pricing.balanceAmount
      : 0

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tourId: state.tour.id,
        sessionId: state.sessionId,
        startDate: state.startDate,
        endDate: state.endDate,
        adults: state.adults,
        children: state.children,
        infants: state.infants,
        vehicleId: state.selections.vehicleId,
        accommodations: state.selections.accommodations,
        addons: state.selections.addons,
        travelers: state.travelers,
        contact: state.contact,
        pricing: state.pricing,
        promoCodeId: state.promoCode?.id,
        paymentType: state.paymentType,
        depositAmount: state.paymentType === "DEPOSIT" ? depositAmount : null,
        balanceAmount: state.paymentType === "DEPOSIT" ? balanceAmount : null,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to create booking")
    }

    const booking = await response.json()

    setState(prev => ({
      ...prev,
      existingBookingId: booking.id,
      bookingReference: booking.bookingReference,
    }))

    return booking.id
  }, [state])

  // Initiate payment
  const initiatePayment = useCallback(async (): Promise<string> => {
    const bookingId = state.existingBookingId
    if (!bookingId) {
      throw new Error("No booking to pay for")
    }

    const response = await fetch("/api/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        paymentMethod: state.paymentMethod,
        paymentType: state.paymentType,
      }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Failed to initiate payment")
    }

    const { redirectUrl } = await response.json()

    if (!redirectUrl) {
      throw new Error("No payment redirect URL received")
    }

    return redirectUrl
  }, [state.existingBookingId, state.paymentMethod, state.paymentType])

  const value: CheckoutContextValue = {
    state,
    isLoading,
    error,
    initializeCheckout,
    loadExistingBooking,
    setVehicle,
    setVehicles,
    setAccommodation,
    toggleAddon,
    setContact,
    setTravelers,
    applyPromoCode,
    removePromoCode,
    setPaymentType,
    setPaymentMethod,
    acceptedTerms,
    setAcceptedTerms,
    submitBooking,
    initiatePayment,
    recalculatePricing,
    validateStep,
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  )
}
