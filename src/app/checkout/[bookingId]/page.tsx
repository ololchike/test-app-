"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeftIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  Sparkles,
  Lock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { OrderSummary } from "@/components/checkout/order-summary"
import { PaymentMethodSelector, PaymentMethod } from "@/components/checkout/payment-method-selector"
import { TravelerForm, TravelerFormData } from "@/components/checkout/traveler-form"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

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

const securityFeatures = [
  { icon: Lock, text: "256-bit SSL Encryption" },
  { icon: ShieldCheckIcon, text: "Secure Payment Processing" },
  { icon: CheckCircle, text: "Money-Back Guarantee" },
]

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 relative z-10"
        >
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
              <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Loading Checkout</h2>
            <p className="text-muted-foreground">Preparing your booking details...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-muted/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md px-4 relative z-10"
        >
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/20 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Unable to Load Checkout</h1>
            <p className="text-muted-foreground">{error || "Booking not found"}</p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  // Check if already paid
  if (booking.paymentStatus === "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md px-4 relative z-10"
        >
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Payment Already Completed</h1>
            <p className="text-muted-foreground">
              This booking has already been paid for.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link href={`/booking/confirmation/${booking.id}`}>View Booking</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  // Check if cancelled
  if (booking.status === "CANCELLED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-destructive/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-muted/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md px-4 relative z-10"
        >
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/20 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Booking Cancelled</h1>
            <p className="text-muted-foreground">
              This booking has been cancelled and cannot be paid for.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  const isFormValid = form.formState.isValid && acceptedTerms && !phoneNumberError

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 relative">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            asChild
            className="mb-4 hover:bg-background/80"
          >
            <Link href={`/tours/${booking.tour.title.toLowerCase().replace(/\s+/g, "-")}`}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Tour
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Complete Your Booking</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Booking Reference: <span className="font-mono font-semibold text-foreground">{booking.bookingReference}</span>
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Traveler Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    Traveler Information
                  </CardTitle>
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
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <CreditCardIcon className="h-4 w-4 text-white" />
                    </div>
                    Payment Method
                  </CardTitle>
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
            </motion.div>

            {/* Terms & Conditions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/50 hover:border-primary/30 hover:shadow-premium transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
                        <Link href="/terms" className="text-primary hover:underline font-medium">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-primary hover:underline font-medium">
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Features - Mobile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:hidden"
            >
              <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                {securityFeatures.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <feature.icon className="h-4 w-4 text-emerald-600" />
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 space-y-4"
              >
                <Button
                  onClick={handlePayment}
                  disabled={!isFormValid || isProcessing}
                  className={cn(
                    "w-full h-14 text-base font-semibold rounded-xl transition-all duration-300",
                    isFormValid && !isProcessing
                      ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl hover:shadow-primary/20"
                      : ""
                  )}
                  size="lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Pay {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: booking.currency,
                        minimumFractionDigits: 0,
                      }).format(booking.totalAmount)}
                    </span>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  You will be redirected to complete your payment securely
                </p>

                {/* Security Features - Desktop */}
                <div className="hidden lg:block pt-4 border-t border-border/50">
                  <div className="space-y-3">
                    {securityFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-sm text-muted-foreground"
                      >
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <feature.icon className="h-4 w-4 text-emerald-600" />
                        </div>
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
