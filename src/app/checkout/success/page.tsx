"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircleIcon, DownloadIcon, EyeIcon, Loader2Icon, XCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

interface PaymentStatusResponse {
  status: PaymentStatus
  bookingId?: string
  bookingReference?: string
  amount?: number
  currency?: string
  message?: string
}

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderTrackingId = searchParams.get("orderTrackingId")
  const bookingId = searchParams.get("bookingId")

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  // Poll payment status
  useEffect(() => {
    if (!orderTrackingId) {
      setError("Missing payment tracking information")
      setIsPolling(false)
      return
    }

    let pollInterval: NodeJS.Timeout

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payments/status?orderTrackingId=${orderTrackingId}`)

        if (!response.ok) {
          throw new Error("Failed to check payment status")
        }

        const data: PaymentStatusResponse = await response.json()
        setPaymentStatus(data)

        // Stop polling if payment is completed or failed
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          setIsPolling(false)
          clearInterval(pollInterval)
        }

        setPollCount((prev) => prev + 1)

        // Stop polling after 30 attempts (5 minutes with 10-second intervals)
        if (pollCount >= 30) {
          setIsPolling(false)
          clearInterval(pollInterval)
          if (data.status !== "COMPLETED" && data.status !== "FAILED") {
            setError("Payment verification is taking longer than expected. Please check your booking status.")
          }
        }
      } catch (err) {
        console.error("Error checking payment status:", err)
        setError("Failed to verify payment status")
        setIsPolling(false)
        clearInterval(pollInterval)
      }
    }

    // Initial check
    checkPaymentStatus()

    // Poll every 10 seconds
    pollInterval = setInterval(checkPaymentStatus, 10000)

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [orderTrackingId, pollCount])

  // Loading/Polling state
  if (isPolling && (!paymentStatus || paymentStatus.status === "PENDING" || paymentStatus.status === "PROCESSING")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Verifying Payment</h1>
                <p className="text-muted-foreground">
                  Please wait while we confirm your payment. This should only take a moment...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Failed state
  if (error || paymentStatus?.status === "FAILED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircleIcon className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Payment Failed</h1>
                <p className="text-muted-foreground">
                  {error || paymentStatus?.message || "We couldn't process your payment. Please try again."}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {bookingId && (
                  <Button asChild>
                    <Link href={`/checkout/${bookingId}`}>Try Again</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link href="/support">Contact Support</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (paymentStatus?.status === "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-2xl w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-lg text-muted-foreground">
                Thank you for your booking. Your payment has been confirmed.
              </p>
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to your email address.
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Booking Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {paymentStatus.bookingReference && (
                  <div>
                    <p className="text-muted-foreground">Booking Reference</p>
                    <p className="font-mono font-semibold text-lg">
                      {paymentStatus.bookingReference}
                    </p>
                  </div>
                )}
                {paymentStatus.amount && paymentStatus.currency && (
                  <div>
                    <p className="text-muted-foreground">Amount Paid</p>
                    <p className="font-semibold text-lg">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: paymentStatus.currency,
                        minimumFractionDigits: 0,
                      }).format(paymentStatus.amount)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="font-semibold">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>Your booking has been confirmed and the tour operator has been notified</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>You will receive a detailed itinerary and travel information via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span>The tour operator will contact you within 24 hours with next steps</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {paymentStatus.bookingId && (
                <>
                  <Button asChild className="flex-1">
                    <Link href={`/booking/confirmation/${paymentStatus.bookingId}`}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View Booking Details
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/booking/confirmation/${paymentStatus.bookingId}?download=true`}>
                      <DownloadIcon className="h-4 w-4 mr-2" />
                      Download Itinerary
                    </Link>
                  </Button>
                </>
              )}
            </div>

            <div className="text-center pt-4">
              <Button variant="ghost" asChild>
                <Link href="/tours">Browse More Tours</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Processing...</p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-lg w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Loading...</h1>
                <p className="text-muted-foreground">
                  Please wait while we load your payment status.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
