"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Clock, CreditCard, Smartphone, ChevronLeft } from "lucide-react"
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
      // In production, this would call Pesapal API
      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          method: selectedMethod,
          amount: booking.totalAmount,
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/booking/checkout?tourId=${booking.tour?.slug || ""}`}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-semibold">Complete Payment</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Booking Reference</span>
                <span className="font-mono font-medium">{booking.bookingReference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tour</span>
                <span className="font-medium">{booking.tour?.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Contact</span>
                <span>{booking.contactName}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span>${booking.totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* M-Pesa Option */}
              <div
                onClick={() => setSelectedMethod("mpesa")}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "mpesa"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`p-3 rounded-full ${
                  selectedMethod === "mpesa" ? "bg-primary text-white" : "bg-muted"
                }`}>
                  <Smartphone className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">M-Pesa</p>
                  <p className="text-sm text-muted-foreground">
                    Pay directly from your M-Pesa account
                  </p>
                </div>
                {selectedMethod === "mpesa" && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>

              {/* Card Option */}
              <div
                onClick={() => setSelectedMethod("card")}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === "card"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className={`p-3 rounded-full ${
                  selectedMethod === "card" ? "bg-primary text-white" : "bg-muted"
                }`}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Credit/Debit Card</p>
                  <p className="text-sm text-muted-foreground">
                    Visa, Mastercard, or American Express
                  </p>
                </div>
                {selectedMethod === "card" && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>

              {/* Pay Button */}
              <Button
                className="w-full mt-4"
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
                  `Pay $${booking.totalAmount.toLocaleString()}`
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
