"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Gift, Mail, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ExitIntentPopupProps {
  discountCode?: string
  discountPercent?: number
  className?: string
}

const STORAGE_KEY = "safariplus_exit_popup_shown"
const COOLDOWN_HOURS = 24 // Don't show again for 24 hours

export function ExitIntentPopup({
  discountCode = "WELCOME10",
  discountPercent = 10,
  className,
}: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const shouldShowPopup = useCallback(() => {
    if (typeof window === "undefined") return false

    // Check if already shown recently
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown) {
      const lastShownTime = parseInt(lastShown, 10)
      const hoursSinceShown = (Date.now() - lastShownTime) / (1000 * 60 * 60)
      if (hoursSinceShown < COOLDOWN_HOURS) return false
    }

    return true
  }, [])

  const markAsShown = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!shouldShowPopup()) return

    let triggered = false

    // Desktop: Detect mouse leaving viewport (exit intent)
    const handleMouseLeave = (e: MouseEvent) => {
      if (triggered) return
      if (e.clientY <= 0) {
        triggered = true
        setIsOpen(true)
        markAsShown()
      }
    }

    // Mobile: Detect scroll up after scrolling down (intent to leave)
    let lastScrollTop = 0
    let scrollDownDistance = 0

    const handleScroll = () => {
      if (triggered) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      if (scrollTop > lastScrollTop) {
        // Scrolling down
        scrollDownDistance += scrollTop - lastScrollTop
      } else if (scrollTop < lastScrollTop && scrollDownDistance > 500) {
        // Scrolling up after significant scroll down
        triggered = true
        setIsOpen(true)
        markAsShown()
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop
    }

    // Add event listeners
    document.addEventListener("mouseleave", handleMouseLeave)
    window.addEventListener("scroll", handleScroll, { passive: true })

    // Cleanup
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [shouldShowPopup, markAsShown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)

    try {
      // Here you would typically send to your API
      // await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSubmitted(true)

      // Close popup after showing success
      setTimeout(() => {
        setIsOpen(false)
      }, 3000)
    } catch (error) {
      console.error("Newsletter signup error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-[90%] max-w-md",
              className
            )}
          >
            <div className="relative rounded-2xl bg-card shadow-2xl overflow-hidden">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-white text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-4">
                  <Gift className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Wait! Don't Go Yet</h2>
                <p className="mt-2 text-white/90">
                  Get {discountPercent}% off your first booking
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">You're All Set!</h3>
                    <p className="text-muted-foreground mt-2">
                      Use code <span className="font-mono font-bold text-primary">{discountCode}</span> at checkout
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-center text-muted-foreground mb-6">
                      Subscribe to our newsletter and receive an exclusive discount code for your safari adventure.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-12"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Subscribing..."
                        ) : (
                          <>
                            Get My {discountPercent}% Off
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-xs text-center text-muted-foreground mt-4">
                      No spam, unsubscribe anytime. By subscribing, you agree to our Privacy Policy.
                    </p>
                  </>
                )}
              </div>

              {/* Discount code preview */}
              <div className="bg-muted/50 px-6 py-4 text-center border-t">
                <p className="text-sm text-muted-foreground">
                  Your discount code:{" "}
                  <span className="font-mono font-bold text-primary">{discountCode}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
