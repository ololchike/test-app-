"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ChevronLeft, Shield, Clock, CreditCard, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingSummary } from "@/components/booking/booking-summary"
import { TravelerForm } from "@/components/booking/traveler-form"
import { ContactForm } from "@/components/booking/contact-form"
import { format, addDays } from "date-fns"

interface TourData {
  id: string
  title: string
  slug: string
  coverImage: string
  durationDays: number
  durationNights: number
  basePrice: number
  agent: {
    businessName: string
    isVerified: boolean
  }
}

interface AccommodationOption {
  id: string
  name: string
  tier: string
  pricePerNight: number
}

interface ActivityAddon {
  id: string
  name: string
  price: number
}

interface CheckoutData {
  tour: TourData | null
  startDate: Date | null
  endDate: Date | null
  adults: number
  children: number
  accommodations: Record<string, string>
  accommodationOptions: AccommodationOption[]
  addons: string[]
  activityAddons: ActivityAddon[]
  pricing: {
    baseTotal: number
    childTotal: number
    accommodationTotal: number
    addonsTotal: number
    serviceFee: number
    total: number
  }
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userDataPrefilled, setUserDataPrefilled] = useState(false)

  // Form state
  const [travelers, setTravelers] = useState<Array<{
    type: "adult" | "child"
    firstName: string
    lastName: string
    dateOfBirth: string
    nationality: string
    passportNumber: string
  }>>([])

  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  })

  // Prefill user data from session
  useEffect(() => {
    if (session?.user && !userDataPrefilled) {
      const userName = session.user.name || ""
      const userEmail = session.user.email || ""
      const userPhone = session.user.phone || ""

      // Prefill contact form
      setContact((prev) => ({
        ...prev,
        name: prev.name || userName,
        email: prev.email || userEmail,
        phone: prev.phone || userPhone,
      }))

      // Prefill first adult traveler with user's name
      setTravelers((prev) => {
        if (prev.length > 0 && !prev[0].firstName && !prev[0].lastName) {
          const nameParts = userName.split(" ")
          const firstName = nameParts[0] || ""
          const lastName = nameParts.slice(1).join(" ") || ""

          return [
            { ...prev[0], firstName, lastName },
            ...prev.slice(1),
          ]
        }
        return prev
      })

      setUserDataPrefilled(true)
    }
  }, [session, userDataPrefilled])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<{
    contact?: { name?: string; email?: string; phone?: string }
    travelers?: Record<number, { firstName?: string; lastName?: string }>
    general?: string
  }>({})

  useEffect(() => {
    async function loadCheckoutData() {
      try {
        const tourId = searchParams.get("tourId")
        const startDateStr = searchParams.get("startDate")
        const adults = parseInt(searchParams.get("adults") || "2", 10)
        const children = parseInt(searchParams.get("children") || "0", 10)
        const accommodationsStr = searchParams.get("accommodations")
        const addonsStr = searchParams.get("addons")

        if (!tourId || !startDateStr) {
          setError("Missing booking information. Please go back and try again.")
          setIsLoading(false)
          return
        }

        // Fetch tour data
        const response = await fetch(`/api/checkout/tour?id=${tourId}`)
        if (!response.ok) {
          throw new Error("Failed to load tour data")
        }
        const { tour } = await response.json()

        const startDate = new Date(startDateStr)
        const endDate = addDays(startDate, tour.durationNights)
        const accommodations = accommodationsStr ? JSON.parse(accommodationsStr) : {}
        const addons = addonsStr ? addonsStr.split(",").filter(Boolean) : []

        // Calculate pricing
        const baseTotal = tour.basePrice * adults
        const childTotal = Math.round(tour.basePrice * 0.7) * children

        // Calculate accommodation total
        let accommodationTotal = 0
        const accommodationOptions: AccommodationOption[] = tour.accommodationOptions || []
        Object.values(accommodations).forEach((accId) => {
          const acc = accommodationOptions.find((a: AccommodationOption) => a.id === accId)
          if (acc) {
            accommodationTotal += acc.pricePerNight
          }
        })

        // Calculate addons total
        let addonsTotal = 0
        const activityAddons: ActivityAddon[] = tour.activityAddons || []
        const totalGuests = adults + children
        addons.forEach((addonId) => {
          const addon = activityAddons.find((a: ActivityAddon) => a.id === addonId)
          if (addon) {
            addonsTotal += addon.price * totalGuests
          }
        })

        const subtotal = baseTotal + childTotal + accommodationTotal + addonsTotal
        const serviceFee = Math.round(subtotal * 0.05)
        const total = subtotal + serviceFee

        setCheckoutData({
          tour,
          startDate,
          endDate,
          adults,
          children,
          accommodations,
          accommodationOptions,
          addons,
          activityAddons,
          pricing: {
            baseTotal,
            childTotal,
            accommodationTotal,
            addonsTotal,
            serviceFee,
            total,
          },
        })

        // Initialize travelers array
        const initialTravelers = [
          ...Array(adults).fill(null).map(() => ({
            type: "adult" as const,
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            nationality: "",
            passportNumber: "",
          })),
          ...Array(children).fill(null).map(() => ({
            type: "child" as const,
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            nationality: "",
            passportNumber: "",
          })),
        ]
        setTravelers(initialTravelers)

        setIsLoading(false)
      } catch (err) {
        console.error("Error loading checkout data:", err)
        setError("Failed to load booking details. Please try again.")
        setIsLoading(false)
      }
    }

    loadCheckoutData()
  }, [searchParams])

  const validateForm = () => {
    const errors: typeof formErrors = {}
    let isValid = true

    // Validate contact
    const contactErrors: { name?: string; email?: string; phone?: string } = {}
    if (!contact.name.trim()) {
      contactErrors.name = "Full name is required"
      isValid = false
    }
    if (!contact.email.trim()) {
      contactErrors.email = "Email address is required"
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      contactErrors.email = "Please enter a valid email address"
      isValid = false
    }
    if (!contact.phone.trim()) {
      contactErrors.phone = "Phone number is required"
      isValid = false
    }
    if (Object.keys(contactErrors).length > 0) {
      errors.contact = contactErrors
    }

    // Validate travelers
    const travelerErrors: Record<number, { firstName?: string; lastName?: string }> = {}
    travelers.forEach((traveler, index) => {
      const tErrors: { firstName?: string; lastName?: string } = {}
      if (!traveler.firstName.trim()) {
        tErrors.firstName = "First name is required"
        isValid = false
      }
      if (!traveler.lastName.trim()) {
        tErrors.lastName = "Last name is required"
        isValid = false
      }
      if (Object.keys(tErrors).length > 0) {
        travelerErrors[index] = tErrors
      }
    })
    if (Object.keys(travelerErrors).length > 0) {
      errors.travelers = travelerErrors
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!checkoutData?.tour) return

    // Clear previous errors
    setFormErrors({})

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: checkoutData.tour.id,
          startDate: checkoutData.startDate,
          endDate: checkoutData.endDate,
          adults: checkoutData.adults,
          children: checkoutData.children,
          accommodations: checkoutData.accommodations,
          addons: checkoutData.addons,
          travelers,
          contact,
          pricing: checkoutData.pricing,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to create booking")
      }

      const booking = await response.json()

      // Redirect to payment page
      window.location.href = `/booking/payment/${booking.id}`
    } catch (err) {
      console.error("Error creating booking:", err)
      setFormErrors({ general: err instanceof Error ? err.message : "Failed to create booking. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !checkoutData?.tour) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">{error || "Booking not found"}</p>
        <Button asChild>
          <Link href="/tours">Browse Tours</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="h-8 sm:h-9">
              <Link href={`/tours/${checkoutData.tour.slug}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Back to tour</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold text-sm sm:text-base">Complete your booking</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Tour Summary Card */}
            <div className="bg-background rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Trip Summary</h2>
              <div className="flex gap-3 sm:gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={checkoutData.tour.coverImage}
                    alt={checkoutData.tour.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">{checkoutData.tour.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {checkoutData.tour.durationDays} days / {checkoutData.tour.durationNights} nights
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {checkoutData.startDate && format(checkoutData.startDate, "MMM d")} -{" "}
                    {checkoutData.endDate && format(checkoutData.endDate, "MMM d, yyyy")}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {checkoutData.adults} adult{checkoutData.adults > 1 ? "s" : ""}
                    {checkoutData.children > 0 && `, ${checkoutData.children} child${checkoutData.children > 1 ? "ren" : ""}`}
                  </p>
                </div>
              </div>
            </div>

            {/* General Error Banner */}
            {formErrors.general && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 sm:p-4 flex items-start gap-2 sm:gap-3" data-error="true">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm sm:text-base text-destructive">Booking Failed</p>
                  <p className="text-xs sm:text-sm text-destructive/80">{formErrors.general}</p>
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div className="bg-background rounded-xl p-4 sm:p-6 shadow-sm" data-error={formErrors.contact ? "true" : undefined}>
              <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact Details</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                We&apos;ll send your booking confirmation and updates to this contact.
              </p>
              <ContactForm contact={contact} onChange={setContact} errors={formErrors.contact} />
            </div>

            {/* Traveler Details */}
            <div className="bg-background rounded-xl p-4 sm:p-6 shadow-sm" data-error={formErrors.travelers ? "true" : undefined}>
              <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Traveler Details</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Enter details for each traveler as they appear on their passport/ID.
              </p>
              <TravelerForm travelers={travelers} onChange={setTravelers} errors={formErrors.travelers} />
            </div>

            {/* Special Requests */}
            <div className="bg-background rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Special Requests</h2>
              <textarea
                className="w-full min-h-[100px] p-3 text-sm sm:text-base rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Any dietary requirements, accessibility needs, or special requests..."
                value={contact.specialRequests}
                onChange={(e) => setContact({ ...contact, specialRequests: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Special requests cannot be guaranteed but we&apos;ll do our best to accommodate them.
              </p>
            </div>
          </div>

          {/* Sidebar - Booking Summary - Show on top for mobile */}
          <div className="lg:col-span-1 order-first lg:order-none">
            <div className="lg:sticky lg:top-24">
              <BookingSummary
                tour={checkoutData.tour}
                pricing={checkoutData.pricing}
                adults={checkoutData.adults}
                children={checkoutData.children}
                accommodations={checkoutData.accommodations}
                accommodationOptions={checkoutData.accommodationOptions}
                addons={checkoutData.addons}
                activityAddons={checkoutData.activityAddons}
              />

              {/* Trust Indicators */}
              <div className="mt-4 space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-600 shrink-0" />
                  <span>Secure SSL encrypted payment</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Free cancellation up to 30 days before</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-purple-600 shrink-0" />
                  <span>Pay with M-Pesa or Card</span>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                className="w-full mt-4 sm:mt-6 h-12 sm:h-auto text-sm sm:text-base"
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Confirm & Pay $${checkoutData.pricing.total.toLocaleString()}`}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-2 sm:mt-3">
                By clicking confirm, you agree to our{" "}
                <Link href="/terms" className="underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="underline">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
