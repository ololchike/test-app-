"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, X, Clock, ArrowRight, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAbandonedCart } from "@/lib/hooks/use-abandoned-cart"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface AbandonedCartBannerProps {
  className?: string
  variant?: "banner" | "floating"
  discountPercent?: number
  discountCode?: string
}

const BANNER_DISMISSED_KEY = "safariplus_cart_banner_dismissed"
const DISMISS_COOLDOWN_HOURS = 4

export function AbandonedCartBanner({
  className,
  variant = "floating",
  discountPercent = 5,
  discountCode = "COMPLETE5",
}: AbandonedCartBannerProps) {
  const { abandonedCart, isLoaded, hasAbandonedCart, getTimeSinceAbandoned, clearCart } = useAbandonedCart()
  const [isVisible, setIsVisible] = useState(false)
  const [showDiscount, setShowDiscount] = useState(false)

  useEffect(() => {
    if (!isLoaded || !hasAbandonedCart) return

    // Check if recently dismissed
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed < DISMISS_COOLDOWN_HOURS) {
        return
      }
    }

    // Show banner after delay
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Show discount if cart is more than 1 hour old
      if (abandonedCart) {
        const hoursOld = (Date.now() - abandonedCart.lastUpdated) / (1000 * 60 * 60)
        setShowDiscount(hoursOld > 1)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [isLoaded, hasAbandonedCart, abandonedCart])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString())
  }

  const handleClearCart = () => {
    clearCart()
    setIsVisible(false)
    localStorage.removeItem(BANNER_DISMISSED_KEY)
  }

  if (!isLoaded || !hasAbandonedCart || !abandonedCart) return null

  // Floating card variant
  if (variant === "floating") {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "fixed bottom-24 right-4 z-50 w-[320px] rounded-xl bg-card border border-border shadow-xl overflow-hidden",
              className
            )}
          >
            {/* Header */}
            <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">You left something behind</span>
              </div>
              <button
                onClick={handleDismiss}
                className="h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Tour preview */}
              <Link
                href={`/checkout/${abandonedCart.bookingId}`}
                className="flex gap-3 group"
              >
                <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={abandonedCart.tourImage}
                    alt={abandonedCart.tourTitle}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {abandonedCart.tourTitle}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Started {getTimeSinceAbandoned()}</span>
                  </div>
                </div>
              </Link>

              {/* Price and discount */}
              <div className="mt-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {abandonedCart.travelers} traveler{abandonedCart.travelers > 1 ? "s" : ""} • {new Date(abandonedCart.departureDate).toLocaleDateString()}
                  </span>
                  <span className="font-bold">${abandonedCart.totalPrice.toLocaleString()}</span>
                </div>

                {showDiscount && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <Percent className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">
                      Use code {discountCode} for {discountPercent}% off
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Button asChild className="flex-1" size="sm">
                  <Link href={`/checkout/${abandonedCart.bookingId}`}>
                    Complete Booking
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-muted-foreground"
                >
                  Remove
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  // Banner variant
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg",
            className
          )}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Cart info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 hidden sm:block">
                  <Image
                    src={abandonedCart.tourImage}
                    alt={abandonedCart.tourTitle}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Complete your booking</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {abandonedCart.tourTitle} • ${abandonedCart.totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Center: Discount */}
              {showDiscount && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-700">
                  <Percent className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {discountPercent}% off with {discountCode}
                  </span>
                </div>
              )}

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button asChild size="sm">
                  <Link href={`/checkout/${abandonedCart.bookingId}`}>
                    Complete Now
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <button
                  onClick={handleDismiss}
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
