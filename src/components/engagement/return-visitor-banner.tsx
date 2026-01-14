"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Gift, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useVisitorRecognition } from "@/lib/hooks/use-visitor-recognition"
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ReturnVisitorBannerProps {
  className?: string
  discountCode?: string
  discountPercent?: number
}

const BANNER_DISMISSED_KEY = "safariplus_return_banner_dismissed"
const DISMISS_COOLDOWN_HOURS = 12

export function ReturnVisitorBanner({
  className,
  discountCode = "WELCOMEBACK",
  discountPercent = 5,
}: ReturnVisitorBannerProps) {
  const { isReturningVisitor, isLoaded, visitCount, visitorData } = useVisitorRecognition()
  const { viewedTours } = useRecentlyViewed()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (!isLoaded || !isReturningVisitor) return

    // Check if recently dismissed
    const dismissed = localStorage.getItem(BANNER_DISMISSED_KEY)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10)
      const hoursSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60)
      if (hoursSinceDismissed < DISMISS_COOLDOWN_HOURS) {
        setIsDismissed(true)
        return
      }
    }

    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isLoaded, isReturningVisitor])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString())
  }

  // Don't render if not a returning visitor or dismissed
  if (!isLoaded || !isReturningVisitor || isDismissed) return null

  // Get personalized message based on visit count
  const getMessage = () => {
    if (visitCount >= 5) {
      return {
        title: "You're one of our loyal explorers!",
        subtitle: `Visit #${visitCount} - Thank you for your continued trust`,
      }
    } else if (visitCount >= 3) {
      return {
        title: "Great to see you again!",
        subtitle: "We've missed you. Here's something special.",
      }
    } else {
      return {
        title: "Welcome back, adventurer!",
        subtitle: "Ready to continue planning your safari?",
      }
    }
  }

  const message = getMessage()
  const lastViewedTour = viewedTours[0]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-primary-foreground shadow-lg",
            className
          )}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Message */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {visitorData?.name ? `Welcome back, ${visitorData.name}!` : message.title}
                  </p>
                  <p className="text-xs sm:text-sm text-primary-foreground/80 truncate">
                    {message.subtitle}
                  </p>
                </div>
              </div>

              {/* Center: Discount or Last Viewed */}
              <div className="hidden md:flex items-center gap-4">
                {lastViewedTour ? (
                  <Link
                    href={`/tours/${lastViewedTour.slug}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm"
                  >
                    <span>Continue viewing: {lastViewedTour.title.slice(0, 30)}...</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10">
                    <Gift className="h-4 w-4" />
                    <span className="text-sm">
                      Use code <span className="font-mono font-bold">{discountCode}</span> for {discountPercent}% off
                    </span>
                  </div>
                )}
              </div>

              {/* Right: CTA and Close */}
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="hidden sm:inline-flex"
                >
                  <Link href="/tours">
                    Explore Tours
                  </Link>
                </Button>
                <button
                  onClick={handleDismiss}
                  className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mobile: Show discount on second line */}
            <div className="md:hidden mt-2 flex items-center justify-between gap-2">
              {lastViewedTour ? (
                <Link
                  href={`/tours/${lastViewedTour.slug}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs"
                >
                  <span className="truncate">Continue: {lastViewedTour.title.slice(0, 25)}...</span>
                  <ArrowRight className="h-3 w-3 flex-shrink-0" />
                </Link>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs">
                  <Gift className="h-3 w-3" />
                  <span>
                    Code: <span className="font-mono font-bold">{discountCode}</span> = {discountPercent}% off
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
