"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  XCircleIcon,
  ArrowLeftIcon,
  MailIcon,
  Clock,
  AlertTriangle,
  RefreshCw,
  HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const reason = searchParams.get("reason")

  const getReasonDetails = () => {
    switch (reason) {
      case "user_cancelled":
        return {
          title: "Payment Cancelled",
          message: "You cancelled the payment process.",
          icon: XCircleIcon,
          color: "orange",
        }
      case "timeout":
        return {
          title: "Session Expired",
          message: "The payment session has expired. Please try again.",
          icon: Clock,
          color: "amber",
        }
      case "insufficient_funds":
        return {
          title: "Payment Declined",
          message: "The payment was declined due to insufficient funds.",
          icon: AlertTriangle,
          color: "red",
        }
      case "network_error":
        return {
          title: "Connection Error",
          message: "A network error occurred during payment processing.",
          icon: RefreshCw,
          color: "blue",
        }
      default:
        return {
          title: "Payment Not Completed",
          message: "The payment was not completed.",
          icon: XCircleIcon,
          color: "orange",
        }
    }
  }

  const reasonDetails = getReasonDetails()
  const Icon = reasonDetails.icon

  const colorClasses = {
    orange: {
      bg: "from-orange-500/10 to-orange-500/20",
      icon: "text-orange-600",
      border: "border-orange-500/20",
    },
    amber: {
      bg: "from-amber-500/10 to-amber-500/20",
      icon: "text-amber-600",
      border: "border-amber-500/20",
    },
    red: {
      bg: "from-red-500/10 to-red-500/20",
      icon: "text-red-600",
      border: "border-red-500/20",
    },
    blue: {
      bg: "from-blue-500/10 to-blue-500/20",
      icon: "text-blue-600",
      border: "border-blue-500/20",
    },
  }

  const colors = colorClasses[reasonDetails.color as keyof typeof colorClasses]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 py-8">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-muted/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <Card className="max-w-2xl w-full mx-4 border-border/50 shadow-premium overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5" />

          <CardHeader className="text-center relative pb-2 pt-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={`mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center mb-4`}
            >
              <Icon className={`h-14 w-14 ${colors.icon}`} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold">{reasonDetails.title}</CardTitle>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6 relative pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-2"
            >
              <p className="text-lg text-muted-foreground">
                {reasonDetails.message}
              </p>
              <p className="text-sm text-muted-foreground">
                Your booking is still reserved and no charges were made.
              </p>
            </motion.div>

            <Separator className="bg-border/50" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                What happened?
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p className="text-sm">
                  The payment process was interrupted or cancelled before completion.
                  Your booking has not been confirmed and will remain in pending status.
                </p>
                <p className="text-sm">
                  Don&apos;t worry - you can try again at any time, and your booking details are still saved.
                </p>
              </div>
            </motion.div>

            <Separator className="bg-border/50" />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <h3 className="font-semibold flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Next Steps
              </h3>
              <div className="space-y-3">
                {bookingId && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ArrowLeftIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Try Payment Again</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Return to checkout and complete your payment using the same or a different payment method
                      </p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <MailIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Need Help?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact our support team if you&apos;re experiencing issues or have questions about your booking
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-3 pt-4"
            >
              {bookingId ? (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    <Link href={`/checkout/${bookingId}`}>
                      <ArrowLeftIcon className="h-4 w-4 mr-2" />
                      Return to Checkout
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    size="lg"
                    className="flex-1 rounded-xl border-border/50 hover:bg-muted/50"
                  >
                    <Link href="/support">
                      <MailIcon className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg"
                  >
                    <Link href="/tours">Browse Tours</Link>
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    size="lg"
                    className="flex-1 rounded-xl border-border/50 hover:bg-muted/50"
                  >
                    <Link href="/support">
                      <MailIcon className="h-4 w-4 mr-2" />
                      Contact Support
                    </Link>
                  </Button>
                </>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center pt-6 border-t border-border/50"
            >
              <div className="flex items-center justify-center gap-2 text-amber-600 mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Booking Reserved</span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Your booking will be held for 24 hours. After that, it may be released if payment is not completed.
              </p>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link href="/tours">Browse More Tours</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
        {/* Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="text-center space-y-6 relative z-10">
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}
