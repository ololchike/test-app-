"use client"

import { Suspense } from "react"
import { UnifiedCheckout } from "@/components/unified-checkout"
import { SectionError } from "@/components/error"
import { Loader2 } from "lucide-react"

function CheckoutLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30">
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-muted-foreground">Loading checkout...</p>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <SectionError name="Checkout">
      <Suspense fallback={<CheckoutLoading />}>
        <UnifiedCheckout />
      </Suspense>
    </SectionError>
  )
}
