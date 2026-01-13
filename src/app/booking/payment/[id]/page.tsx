"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Clock, ChevronLeft, AlertCircle, Shield, Lock } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface BookingData {
  id: string
  bookingReference: string
  totalAmount: number
  currency: string
  tour: {
    title: string
    slug: string
    coverImage: string
    destination: string
    durationDays: number
    durationNights: number
  }
  agent: {
    businessName: string
  }
  startDate: string
  endDate: string
  adults: number
  children: number
  infants: number
  contactName: string
  contactEmail: string
  status: string
  paymentStatus: string
  paymentType: "FULL" | "DEPOSIT"
  depositAmount: number | null
  balanceAmount: number | null
  balanceDueDate: string | null
  balancePaidAt: string | null
}

export default function PaymentPage() {
  const params = useParams()
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    async function fetchBooking() {
      try {
        const response = await fetch(`/api/bookings/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setBooking(data.booking)
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchBooking()
    }
  }, [params.id])

  const handlePayment = async () => {
    if (!booking) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl
        } else {
          window.location.href = `/booking/confirmation/${booking.id}`
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Payment initiation failed")
      }
    } catch (error) {
      console.error("Payment error:", error)
      toast.error("Payment Failed", {
        description: error instanceof Error ? error.message : "Payment failed. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate amount to pay
  const getAmountToPay = () => {
    if (!booking) return 0
    return booking.paymentType === "DEPOSIT" && booking.depositAmount
      ? booking.depositAmount
      : booking.totalAmount
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-lg text-muted-foreground">Booking not found</p>
        <Button asChild>
          <Link href="/tours">Browse Tours</Link>
        </Button>
      </div>
    )
  }

  const amountToPay = getAmountToPay()

  return (
    <div className="min-h-screen bg-muted/30 pb-32">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="h-8 sm:h-9">
              <Link href={`/tours/${booking.tour?.slug || ""}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold text-sm sm:text-base">Complete Payment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
          {/* Tour Preview */}
          {booking.tour?.coverImage && (
            <Card className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={booking.tour.coverImage}
                    alt={booking.tour.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm sm:text-base line-clamp-2">{booking.tour.title}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{booking.tour.destination}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {booking.tour.durationDays} days / {booking.tour.durationNights} nights
                  </p>
                  <p className="text-xs sm:text-sm mt-2">
                    {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Booking Summary */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Booking Reference</span>
                <span className="font-mono font-medium text-right">{booking.bookingReference}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Guests</span>
                <span>
                  {booking.adults} Adult{booking.adults > 1 ? "s" : ""}
                  {booking.children > 0 && `, ${booking.children} Child${booking.children > 1 ? "ren" : ""}`}
                  {booking.infants > 0 && `, ${booking.infants} Infant${booking.infants > 1 ? "s" : ""}`}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Contact</span>
                <span className="text-right">{booking.contactName}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span>{booking.currency} {booking.totalAmount.toLocaleString()}</span>
              </div>

              {/* Show deposit breakdown if applicable */}
              {booking.paymentType === "DEPOSIT" && booking.depositAmount && (
                <>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Deposit (Pay Now)</span>
                    <span className="text-primary font-medium">{booking.currency} {booking.depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Balance Due Later</span>
                    <span>{booking.currency} {booking.balanceAmount?.toLocaleString()}</span>
                  </div>
                  {booking.balanceDueDate && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Balance Due By</span>
                      <span>{format(new Date(booking.balanceDueDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </>
              )}

              {/* Deposit info notice */}
              {booking.paymentType === "DEPOSIT" && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-200">
                    You&apos;re paying a deposit. The remaining balance of {booking.currency} {booking.balanceAmount?.toLocaleString()}
                    {" "}will be due {booking.balanceDueDate
                      ? `by ${format(new Date(booking.balanceDueDate), "MMM d, yyyy")}`
                      : "before your trip"}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  <span>SSL Encrypted</span>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-3">
                You&apos;ll be redirected to Pesapal to complete your payment securely.
                Choose your preferred payment method (M-Pesa, Card, Bank Transfer) on the next screen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Amount to Pay</p>
                <p className="text-lg sm:text-xl font-bold text-primary">
                  {booking.currency} {amountToPay.toLocaleString()}
                </p>
              </div>
              <Button
                className="h-12 px-8 text-sm sm:text-base font-semibold min-w-[140px]"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm & Pay"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
