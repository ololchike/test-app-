"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

/**
 * Redirect from old checkout URL to new unified checkout
 * Old: /booking/checkout?tourId=...&startDate=...
 * New: /checkout?tourId=...&startDate=...
 */
function RedirectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Preserve all query params and redirect to new checkout
    const params = searchParams.toString()
    router.replace(`/checkout${params ? `?${params}` : ""}`)
  }, [router, searchParams])

  return null
}

export default function LegacyCheckoutRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting to checkout...</p>
      </div>
      <Suspense fallback={null}>
        <RedirectContent />
      </Suspense>
    </div>
  )
}
