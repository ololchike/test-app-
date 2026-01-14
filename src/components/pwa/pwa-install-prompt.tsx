"use client"

import { useState, useEffect } from "react"
import { X, Download, Smartphone, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error - navigator.standalone is iOS-specific
      window.navigator.standalone === true

    setIsStandalone(isInStandaloneMode)

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window)
    setIsIOS(isIOSDevice)

    // Check if previously dismissed
    const wasDismissed = localStorage.getItem("pwa-install-dismissed")
    if (wasDismissed) {
      const dismissedTime = parseInt(wasDismissed, 10)
      // Show again after 7 days
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
      }
    }

    // Listen for beforeinstallprompt event (Chrome/Edge/Firefox)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a delay (better UX)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // For iOS, show prompt after delay if not installed
    if (isIOSDevice && !isInStandaloneMode && !wasDismissed) {
      setTimeout(() => setShowPrompt(true), 5000)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show install prompt
    await deferredPrompt.prompt()

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice

    // Track install event
    if (outcome === "accepted") {
      console.log("PWA installed")
    }

    // Clear the prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    localStorage.setItem("pwa-install-dismissed", Date.now().toString())
  }

  // Don't show if already installed, dismissed, or no prompt available
  if (isStandalone || dismissed || (!showPrompt && !isIOS)) {
    return null
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 animate-slide-up">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm">Install SafariPlus</h3>
                <button
                  onClick={handleDismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isIOS
                  ? "Tap the share button and select \"Add to Home Screen\""
                  : "Get quick access to tours, bookings, and offline browsing"}
              </p>
              <div className="mt-3 flex gap-2">
                {isIOS ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 flex-1"
                    onClick={handleDismiss}
                  >
                    <Share className="h-4 w-4" />
                    Got it
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={handleInstall}
                      disabled={!deferredPrompt}
                      className="gap-2 flex-1"
                    >
                      <Download className="h-4 w-4" />
                      Install
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDismiss}
                    >
                      Later
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
