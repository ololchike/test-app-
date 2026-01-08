"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { ArrowLeftIcon, CreditCardIcon, ShieldCheckIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { OrderSummary } from "@/components/checkout/order-summary"
import { PaymentMethodSelector, PaymentMethod } from "@/components/checkout/payment-method-selector"
import { TravelerForm, TravelerFormData } from "@/components/checkout/traveler-form"
import { toast } from "sonner"

// Validation schema
const travelerSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
})

const checkoutSchema = z.object({
  leadTraveler: travelerSchema,
  additionalTravelers: z.array(travelerSchema),
  specialRequests: z.string().optional(),
})

interface Booking {
  id: string
  bookingReference: string
  startDate: string
  endDate: string
  adults: number
  children: number
  infants: number
  baseAmount: number
  accommodationAmount: number
  activitiesAmount: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  currency: string
  contactName: string
  contactEmail: string
  contactPhone: string
  specialRequests?: string
  status: string
  paymentStatus: string
  tour: {
    title: string
    destination: string
    coverImage?: string
  }
}

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MPESA")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneNumberError, setPhoneNumberError] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  // Initialize form
  const form = useForm<TravelerFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      leadTraveler: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      },
      additionalTravelers: [],
      specialRequests: "",
    },
  })

  // Fetch booking details
  useEffect(() => {
    async function fetchBooking() {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/bookings/${bookingId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Booking not found")
          } else if (response.status === 403) {
            setError("You don't have access to this booking")
          } else {
            setError("Failed to load booking details")
          }
          return
        }

        const data = await response.json()
        const bookingData = data.booking || data
        setBooking(bookingData)

        // Pre-fill form with contact info
        if (bookingData.contactName) {
          const nameParts = bookingData.contactName.split(" ")
          form.setValue("leadTraveler.firstName", nameParts[0] || "")
          form.setValue("leadTraveler.lastName", nameParts.slice(1).join(" ") || "")
        }
        form.setValue("leadTraveler.email", bookingData.contactEmail || "")
        form.setValue("leadTraveler.phone", bookingData.contactPhone || "")
        form.setValue("specialRequests", bookingData.specialRequests || "")

        // Initialize additional travelers array
        const additionalCount = Math.max(0, bookingData.adults + bookingData.children + bookingData.infants - 1)
        form.setValue(
          "additionalTravelers",
          Array.from({ length: additionalCount }, () => ({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dateOfBirth: "",
          }))
        )

        // Set phone number for M-Pesa
        if (bookingData.contactPhone) {
          setPhoneNumber(bookingData.contactPhone.replace(/\s/g, ""))
        }
      } catch (err) {
        console.error("Error fetching booking:", err)
        setError("An error occurred while loading the booking")
      } finally {
        setIsLoading(false)
      }
    }

    if (bookingId) {
      fetchBooking()
    }
  }, [bookingId, form])

  // Validate phone number for M-Pesa
  useEffect(() => {
    if (paymentMethod === "MPESA") {
      if (!phoneNumber) {
        setPhoneNumberError("Phone number is required for M-Pesa")
      } else if (!/^254\d{9}$/.test(phoneNumber)) {
        setPhoneNumberError("Please enter a valid Kenyan phone number")
      } else {
        setPhoneNumberError("")
      }
    } else {
      setPhoneNumberError("")
    }
  }, [paymentMethod, phoneNumber])

  const handlePayment = async () => {
    // Validate form
    const isValid = await form.trigger()
    if (!isValid) {
      toast.error("Please fill in all required traveler details")
      return
    }

    // Validate terms
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions")
      return
    }

    // Validate phone for M-Pesa
    if (paymentMethod === "MPESA" && phoneNumberError) {
      toast.error("Please enter a valid phone number")
      return
    }

    setIsProcessing(true)

    try {
      // Prepare payment data
      const paymentData = {
        bookingId,
        paymentMethod,
        phoneNumber: paymentMethod === "MPESA" ? phoneNumber : undefined,
      }

      // Initiate payment
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to initiate payment")
        return
      }

      // Redirect to Pesapal
      if (result.redirectUrl) {
        toast.success("Redirecting to payment...")
        window.location.href = result.redirectUrl
      } else {
        toast.error("No redirect URL received")
      }
    } catch (err) {
      console.error("Payment error:", err)
      toast.error("An error occurred while processing payment")
    } finally {
      setIsProcessing(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="rounded-full bg-destructive/10 h-16 w-16 flex items-center justify-center mx-auto">
            <ShieldCheckIcon className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Unable to Load Checkout</h1>
          <p className="text-muted-foreground">{error || "Booking not found"}</p>
          <Button asChild>
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Check if already paid
  if (booking.paymentStatus === "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 h-16 w-16 flex items-center justify-center mx-auto">
            <ShieldCheckIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold">Payment Already Completed</h1>
          <p className="text-muted-foreground">
            This booking has already been paid for.
          </p>
          <Button asChild>
            <Link href={`/booking/confirmation/${booking.id}`}>View Booking</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Check if cancelled
  if (booking.status === "CANCELLED") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="rounded-full bg-destructive/10 h-16 w-16 flex items-center justify-center mx-auto">
            <ShieldCheckIcon className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Booking Cancelled</h1>
          <p className="text-muted-foreground">
            This booking has been cancelled and cannot be paid for.
          </p>
          <Button asChild>
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isFormValid = form.formState.isValid && acceptedTerms && !phoneNumberError

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            asChild
            className="mb-4"
          >
            <Link href={`/tours/${booking.tour.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Tour
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Complete Your Booking</h1>
          <p className="text-muted-foreground mt-2">
            Booking Reference: <span className="font-mono font-semibold">{booking.bookingReference}</span>
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Traveler Details */}
            <Card>
              <CardHeader>
                <CardTitle>Traveler Information</CardTitle>
              </CardHeader>
              <CardContent>
                <TravelerForm
                  form={form}
                  adults={booking.adults}
                  children={booking.children}
                  infants={booking.infants}
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  phoneNumber={phoneNumber}
                  onPhoneNumberChange={setPhoneNumber}
                  phoneNumberError={phoneNumberError}
                />
              </CardContent>
            </Card>

            {/* Terms & Conditions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      I accept the terms and conditions
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      By proceeding, you agree to our{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              tour={{
                title: booking.tour.title,
                coverImage: booking.tour.coverImage,
                destination: booking.tour.destination,
              }}
              startDate={new Date(booking.startDate)}
              endDate={new Date(booking.endDate)}
              adults={booking.adults}
              children={booking.children}
              infants={booking.infants}
              pricing={{
                baseAmount: booking.baseAmount,
                accommodationAmount: booking.accommodationAmount,
                activitiesAmount: booking.activitiesAmount,
                taxAmount: booking.taxAmount,
                discountAmount: booking.discountAmount,
                totalAmount: booking.totalAmount,
              }}
              currency={booking.currency}
            />

            {/* Pay Button */}
            <div className="mt-6 space-y-4">
              <Button
                onClick={handlePayment}
                disabled={!isFormValid || isProcessing}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-5 w-5 mr-2" />
                    Pay {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: booking.currency,
                      minimumFractionDigits: 0,
                    }).format(booking.totalAmount)}
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                You will be redirected to complete your payment securely
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
