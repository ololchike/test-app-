"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Car,
  Users,
  Mail,
  CreditCard,
  Lock,
  AlertCircle,
  CalendarCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { CheckoutProvider, useCheckout } from "./checkout-context"
import { CheckoutSummary } from "./checkout-summary"
import { SelectionsStep, TravelersStep, ContactStep, PaymentStep } from "./steps"
import { CHECKOUT_STEPS, type CheckoutStep } from "./types"
import { SectionError } from "@/components/error"

// Step icons
const STEP_ICONS: Record<CheckoutStep, typeof Car> = {
  selections: Car,
  travelers: Users,
  contact: Mail,
  payment: CreditCard,
}

// Loading component
function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>
      <div className="text-center space-y-6 relative z-10">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Loading Checkout</h2>
          <p className="text-muted-foreground">Preparing your booking details...</p>
        </div>
      </div>
    </div>
  )
}

// Error component
function CheckoutError({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-muted/20 rounded-full blur-3xl" />
      </div>
      <div className="text-center space-y-6 max-w-md px-4 relative z-10">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/20 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Unable to Load Checkout</h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/tours">Browse Tours</Link>
        </Button>
      </div>
    </div>
  )
}

interface CheckoutContentProps {
  onComplete?: () => void
}

function CheckoutContent({ onComplete }: CheckoutContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    state,
    isLoading,
    error,
    initializeCheckout,
    loadExistingBooking,
    validateStep,
    submitBooking,
    initiatePayment,
    recalculatePricing,
    acceptedTerms,
  } = useCheckout()

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("selections")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Get step index for progress display
  const currentStepIndex = CHECKOUT_STEPS.findIndex(s => s.id === currentStep)

  // Initialize checkout on mount - only once
  useEffect(() => {
    if (initialized) return

    const bookingId = searchParams.get("bookingId")

    if (bookingId) {
      // Load existing booking for payment completion
      loadExistingBooking(bookingId)
      setCurrentStep("payment")
      setInitialized(true)
    } else {
      // New booking - initialize from params
      const tourId = searchParams.get("tourId")
      const startDate = searchParams.get("startDate")
      const adults = parseInt(searchParams.get("adults") || "2", 10)
      const children = parseInt(searchParams.get("children") || "0", 10)
      const infants = parseInt(searchParams.get("infants") || "0", 10)
      const accommodations = searchParams.get("accommodations")
      const addons = searchParams.get("addons")
      const vehicle = searchParams.get("vehicle")

      if (tourId && startDate) {
        let preselectedAccommodations: Record<number, string> | undefined
        try {
          preselectedAccommodations = accommodations ? JSON.parse(decodeURIComponent(accommodations)) : undefined
        } catch {
          preselectedAccommodations = undefined
        }

        initializeCheckout({
          tourId,
          startDate,
          adults,
          children,
          infants,
          preselectedAccommodations,
          preselectedAddons: addons ? addons.split(",").filter(Boolean) : undefined,
          preselectedVehicle: vehicle || undefined,
        })
        setInitialized(true)
      }
    }
  }, [searchParams, initializeCheckout, loadExistingBooking, initialized])

  // Recalculate pricing when selections change
  useEffect(() => {
    if (state.tour && initialized) {
      recalculatePricing()
    }
  }, [state.selections, state.tour, recalculatePricing, initialized])

  const handleNext = () => {
    const validation = validateStep(currentStep)

    if (!validation.isValid) {
      const firstError = document.querySelector('[data-error="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      toast.error("Please fill in all required fields")
      return
    }

    const nextIndex = currentStepIndex + 1
    if (nextIndex < CHECKOUT_STEPS.length) {
      setCurrentStep(CHECKOUT_STEPS[nextIndex].id)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(CHECKOUT_STEPS[prevIndex].id)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async () => {
    const validation = validateStep(currentStep)
    if (!validation.isValid) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions")
      return
    }

    setIsSubmitting(true)

    try {
      let bookingId = state.existingBookingId

      if (!bookingId) {
        bookingId = await submitBooking()
      }

      // Handle different payment types
      if (state.paymentType === "PAY_LATER") {
        // For pay later, just confirm the booking without payment
        toast.success("Booking confirmed! Payment details will be sent to your email.")

        if (onComplete) {
          onComplete()
        }

        // Redirect to confirmation page with reserved=true to indicate no payment yet
        router.push(`/booking/confirmation/${bookingId}?reserved=true`)
      } else {
        // For FULL or DEPOSIT payment, redirect to payment
        const redirectUrl = await initiatePayment()
        toast.success("Redirecting to payment...")

        if (onComplete) {
          onComplete()
        }

        window.location.href = redirectUrl
      }
    } catch (err) {
      console.error("Checkout error:", err)
      toast.error(err instanceof Error ? err.message : "Failed to process checkout")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while initializing
  if (isLoading || !initialized) {
    return <CheckoutLoading />
  }

  // Show error
  if (error) {
    return <CheckoutError message={error} />
  }

  // Show error if no tour data after loading
  if (!state.tour) {
    return <CheckoutError message="Missing booking information. Please try again." />
  }

  const isLastStep = currentStepIndex === CHECKOUT_STEPS.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative pt-20">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="h-9">
              <Link href={`/tours/${state.tour.slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to tour</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold">Complete your booking</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 relative z-10">
        {/* Progress Steps */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex items-center justify-between min-w-max max-w-2xl mx-auto">
            {CHECKOUT_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[step.id]
              const isComplete = index < currentStepIndex
              const isCurrent = step.id === currentStep

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (isComplete) setCurrentStep(step.id)
                    }}
                    disabled={!isComplete}
                    className="flex flex-col items-center"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                        isComplete
                          ? "bg-primary border-primary text-primary-foreground cursor-pointer"
                          : isCurrent
                          ? "border-primary text-primary"
                          : "border-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      {isComplete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-xs font-medium whitespace-nowrap",
                        isCurrent || isComplete ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                  </button>
                  {index < CHECKOUT_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mx-2",
                        isComplete ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <SectionError name={`Checkout - ${CHECKOUT_STEPS[currentStepIndex]?.title}`}>
              {currentStep === "selections" && <SelectionsStep />}
              {currentStep === "travelers" && <TravelersStep />}
              {currentStep === "contact" && <ContactStep />}
              {currentStep === "payment" && <PaymentStep />}
            </SectionError>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {CHECKOUT_STEPS.length}
              </div>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={cn(
                    state.paymentType === "PAY_LATER"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      : "bg-gradient-to-r from-primary to-primary/90"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : state.paymentType === "PAY_LATER" ? (
                    <>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Reserve Now
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <SectionError name="Booking Summary">
                <CheckoutSummary />
              </SectionError>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Wrapper with Suspense for useSearchParams
function CheckoutWithSuspense({ onComplete }: { onComplete?: () => void }) {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent onComplete={onComplete} />
    </Suspense>
  )
}

// Main export with provider
interface UnifiedCheckoutProps {
  onComplete?: () => void
}

export function UnifiedCheckout({ onComplete }: UnifiedCheckoutProps) {
  return (
    <CheckoutProvider>
      <CheckoutWithSuspense onComplete={onComplete} />
    </CheckoutProvider>
  )
}
