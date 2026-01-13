"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, CreditCard, Smartphone, ChevronLeft, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface BookingData {
  id: string
  bookingReference: string
  totalAmount: number
  tour: {
    title: string
    slug: string
    coverImage: string
  }
  agent: {
    businessName: string
  }
  startDate: string
  endDate: string
  adults: number
  children: number
  contactName: string
  contactEmail: string
  status: string
  paymentStatus: string
  // Payment type fields
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
  const [selectedMethod, setSelectedMethod] = useState<"mpesa" | "card" | null>(null)
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
    if (!selectedMethod || !booking) return

    setIsProcessing(true)

    try {
      // Calculate the amount to pay (deposit or full)
      const amountToPay = booking.paymentType === "DEPOSIT" && booking.depositAmount
        ? booking.depositAmount
        : booking.totalAmount

      // In production, this would call Pesapal API
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          method: selectedMethod,
          amount: amountToPay,
          isDeposit: booking.paymentType === "DEPOSIT",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to payment gateway or show success
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl
        } else {
          // For demo, redirect to confirmation
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

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" asChild className="h-8 sm:h-9">
              <Link href={`/booking/checkout?tourId=${booking.tour?.slug || ""}`}>
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
          {/* Booking Summary */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Booking Reference</span>
                <span className="font-mono font-medium text-right">{booking.bookingReference}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground shrink-0">Tour</span>
                <span className="font-medium text-right">{booking.tour?.title}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Contact</span>
                <span className="text-right">{booking.contactName}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span>${booking.totalAmount.toLocaleString()}</span>
              </div>

              {/* Show deposit breakdown if applicable */}
              {booking.paymentType === "DEPOSIT" && booking.depositAmount && (
                <>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Deposit Amount</span>
                    <span className="text-primary font-medium">${booking.depositAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Balance Due</span>
                    <span>${booking.balanceAmount?.toLocaleString()}</span>
                  </div>
                  {booking.balanceDueDate && (
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Balance Due By</span>
                      <span>{format(new Date(booking.balanceDueDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </>
              )}

              <Separator />
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span>{booking.paymentType === "DEPOSIT" ? "Pay Now (Deposit)" : "Pay Now"}</span>
                <span>
                  ${booking.paymentType === "DEPOSIT" && booking.depositAmount
                    ? booking.depositAmount.toLocaleString()
                    : booking.totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Deposit info notice */}
              {booking.paymentType === "DEPOSIT" && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-xs sm:text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-800 dark:text-amber-200">
                    You&apos;re paying a deposit. The remaining balance of ${booking.balanceAmount?.toLocaleString()}
                    will be due {booking.balanceDueDate
                      ? `by ${format(new Date(booking.balanceDueDate), "MMM d, yyyy")}`
                      : "before your trip"}.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {/* M-Pesa Option */}
              <div
                onClick={() => setSelectedMethod("mpesa")}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "mpesa"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`p-2 sm:p-3 rounded-full shrink-0 ${
                  selectedMethod === "mpesa" ? "bg-primary text-white" : "bg-muted"
                }`}>
                  <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">M-Pesa</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Pay directly from your M-Pesa account
                  </p>
                </div>
                {selectedMethod === "mpesa" && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>

              {/* Card Option */}
              <div
                onClick={() => setSelectedMethod("card")}
                className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`p-2 sm:p-3 rounded-full shrink-0 ${
                  selectedMethod === "card" ? "bg-primary text-white" : "bg-muted"
                }`}>
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base">Credit/Debit Card</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Visa, Mastercard, or American Express
                  </p>
                </div>
                {selectedMethod === "card" && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>

              {/* Pay Button */}
              <Button
                className="w-full mt-3 sm:mt-4 h-12 sm:h-14 text-sm sm:text-base font-semibold"
                size="lg"
                onClick={handlePayment}
                disabled={!selectedMethod || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  booking.paymentType === "DEPOSIT" && booking.depositAmount
                    ? `Pay $${booking.depositAmount.toLocaleString()} Deposit`
                    : `Pay $${booking.totalAmount.toLocaleString()}`
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Payments are secured by Pesapal. Your card details are never stored on our servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
