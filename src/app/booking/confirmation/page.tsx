"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * Redirect handler for Pesapal callbacks with query parameters
 * Redirects from /booking/confirmation?bookingId=xxx to /booking/confirmation/xxx
 */
function ConfirmationRedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const bookingId = searchParams.get("bookingId")
    const orderTrackingId = searchParams.get("OrderTrackingId")
    const merchantReference = searchParams.get("OrderMerchantReference")

    if (bookingId) {
      // Build the new URL with Pesapal params preserved
      let newUrl = `/booking/confirmation/${bookingId}`
      const params = new URLSearchParams()

      if (orderTrackingId) params.set("OrderTrackingId", orderTrackingId)
      if (merchantReference) params.set("OrderMerchantReference", merchantReference)

      if (params.toString()) {
        newUrl += `?${params.toString()}`
      }

      router.replace(newUrl)
    } else {
      // No bookingId, redirect to dashboard
      router.replace("/dashboard/bookings")
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redirecting to your booking...</p>
      </div>
    </div>
  )
}

export default function ConfirmationRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationRedirectContent />
    </Suspense>
  )
}
