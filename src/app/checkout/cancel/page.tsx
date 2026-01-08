"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { XCircleIcon, ArrowLeftIcon, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function PaymentCancelContent() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const reason = searchParams.get("reason")

  const getReasonMessage = () => {
    switch (reason) {
      case "user_cancelled":
        return "You cancelled the payment process."
      case "timeout":
        return "The payment session has expired. Please try again."
      case "insufficient_funds":
        return "The payment was declined due to insufficient funds."
      case "network_error":
        return "A network error occurred during payment processing."
      default:
        return "The payment was not completed."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="max-w-2xl w-full mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
            <XCircleIcon className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-3xl">Payment Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-muted-foreground">
              {getReasonMessage()}
            </p>
            <p className="text-sm text-muted-foreground">
              Your booking is still reserved and no charges were made.
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">What happened?</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                The payment process was interrupted or cancelled before completion.
                Your booking has not been confirmed and will remain in pending status.
              </p>
              <p>
                Don't worry - you can try again at any time, and your booking details are still saved.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold">Next Steps</h3>
            <div className="space-y-3">
              {bookingId && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                  <ArrowLeftIcon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Try Payment Again</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Return to checkout and complete your payment using the same or a different payment method
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
                <MailIcon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Need Help?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact our support team if you're experiencing issues or have questions about your booking
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {bookingId ? (
              <>
                <Button asChild className="flex-1">
                  <Link href={`/checkout/${bookingId}`}>
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Return to Checkout
                  </Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/support">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="flex-1">
                  <Link href="/tours">Browse Tours</Link>
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/support">
                    <MailIcon className="h-4 w-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-3">
              Your booking will be held for 24 hours. After that, it may be released if payment is not completed.
            </p>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tours">Browse More Tours</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}
