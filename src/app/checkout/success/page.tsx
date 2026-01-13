"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  CheckCircleIcon,
  DownloadIcon,
  EyeIcon,
  Loader2Icon,
  XCircleIcon,
  Sparkles,
  PartyPopper,
  Mail,
  Calendar,
  Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Confetti from "react-confetti"
import { useWindowSize } from "usehooks-ts"

type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

interface PaymentStatusResponse {
  status: PaymentStatus
  bookingId?: string
  bookingReference?: string
  amount?: number
  currency?: string
  message?: string
}

const nextSteps = [
  {
    icon: CheckCircleIcon,
    text: "Your booking has been confirmed and the tour operator has been notified",
  },
  {
    icon: Mail,
    text: "You will receive a detailed itinerary and travel information via email",
  },
  {
    icon: Phone,
    text: "The tour operator will contact you within 24 hours with next steps",
  },
]

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderTrackingId = searchParams.get("orderTrackingId")
  const bookingId = searchParams.get("bookingId")
  const { width, height } = useWindowSize()

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

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

          if (data.status === "COMPLETED") {
            setShowConfetti(true)
            setTimeout(() => setShowConfetti(false), 5000)
          }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-lg w-full mx-4 border-border/50 shadow-premium">
            <CardContent className="pt-8 pb-10">
              <div className="text-center space-y-8">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                  <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                    <Loader2Icon className="h-10 w-10 text-primary animate-spin" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h1 className="text-2xl font-bold">Verifying Payment</h1>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Please wait while we confirm your payment. This should only take a moment...
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-3 w-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-3 w-3 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Failed state
  if (error || paymentStatus?.status === "FAILED") {
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
        >
          <Card className="max-w-lg w-full mx-4 border-border/50 shadow-premium">
            <CardContent className="pt-8 pb-10">
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-destructive/10 to-destructive/20 flex items-center justify-center"
                >
                  <XCircleIcon className="h-12 w-12 text-destructive" />
                </motion.div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">Payment Failed</h1>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    {error || paymentStatus?.message || "We couldn't process your payment. Please try again."}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  {bookingId && (
                    <Button asChild size="lg" className="rounded-xl">
                      <Link href={`/checkout/${bookingId}`}>Try Again</Link>
                    </Button>
                  )}
                  <Button variant="outline" asChild size="lg" className="rounded-xl">
                    <Link href="/support">Contact Support</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Success state
  if (paymentStatus?.status === "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 py-4 sm:py-8">
        {showConfetti && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.2}
          />
        )}

        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full"
        >
          <Card className="max-w-2xl w-full mx-4 border-border/50 shadow-premium overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

            <CardHeader className="text-center relative pb-2 pt-6 sm:pt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6, delay: 0.1 }}
                className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-3 sm:mb-4"
              >
                <CheckCircleIcon className="h-10 w-10 sm:h-14 sm:w-14 text-emerald-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <PartyPopper className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                  <span className="text-xs sm:text-sm font-medium text-amber-600">Congratulations!</span>
                </div>
                <CardTitle className="text-2xl sm:text-3xl font-bold">Payment Successful!</CardTitle>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 relative pb-6 sm:pb-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-2"
              >
                <p className="text-base sm:text-lg text-muted-foreground">
                  Thank you for your booking. Your payment has been confirmed.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  A confirmation email has been sent to your email address.
                </p>
              </motion.div>

              <Separator className="bg-border/50" />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Booking Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {paymentStatus.bookingReference && (
                    <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs sm:text-sm text-muted-foreground">Booking Reference</p>
                      <p className="font-mono font-bold text-lg sm:text-xl mt-1">
                        {paymentStatus.bookingReference}
                      </p>
                    </div>
                  )}
                  {paymentStatus.amount && paymentStatus.currency && (
                    <div className="p-3 sm:p-4 rounded-xl bg-muted/50 border border-border/50">
                      <p className="text-xs sm:text-sm text-muted-foreground">Amount Paid</p>
                      <p className="font-bold text-lg sm:text-xl mt-1 text-emerald-600">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: paymentStatus.currency,
                          minimumFractionDigits: 0,
                        }).format(paymentStatus.amount)}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              <Separator className="bg-border/50" />

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 sm:space-y-4"
              >
                <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  What&apos;s Next?
                </h3>
                <ul className="space-y-2 sm:space-y-3">
                  {nextSteps.map((step, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                    >
                      <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <step.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground">{step.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4"
              >
                {paymentStatus.bookingId && (
                  <>
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                    >
                      <Link href={`/booking/confirmation/${paymentStatus.bookingId}`}>
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Booking Details
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      size="lg"
                      className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base rounded-xl border-border/50 hover:bg-muted/50"
                    >
                      <Link href={`/booking/confirmation/${paymentStatus.bookingId}?download=true`}>
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download Itinerary
                      </Link>
                    </Button>
                  </>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center pt-3 sm:pt-4"
              >
                <Button variant="ghost" asChild className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                  <Link href="/tours">Browse More Tours</Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Processing...</p>
      </motion.div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <Card className="max-w-lg w-full mx-4 border-border/50 shadow-premium">
          <CardContent className="pt-8 pb-10">
            <div className="text-center space-y-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <Loader2Icon className="h-8 w-8 text-primary animate-spin" />
                </div>
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
