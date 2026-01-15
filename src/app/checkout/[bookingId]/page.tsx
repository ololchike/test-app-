"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * Redirect from old booking checkout URL to new unified checkout
 * Old: /checkout/[bookingId]
 * New: /checkout?bookingId=[bookingId]
 */
export default function LegacyBookingCheckoutRedirect() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  useEffect(() => {
    if (bookingId) {
      router.replace(`/checkout?bookingId=${bookingId}`)
    }
  }, [router, bookingId])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting to checkout...</p>
      </div>
    </div>
  )
}
