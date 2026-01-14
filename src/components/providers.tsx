"use client"

import * as React from "react"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { PWAInstallPrompt, OfflineIndicator } from "@/components/pwa"
import { ComparisonProvider } from "@/lib/contexts/comparison-context"
import { ComparisonBar } from "@/components/tours/comparison-bar"

interface ProvidersProps {
  children: React.ReactNode
}

// Clear any invalid theme values from localStorage on mount
function useCleanupInvalidTheme() {
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme")
      // Valid themes should not contain spaces
      if (storedTheme && storedTheme.includes(" ")) {
        localStorage.removeItem("theme")
      }
    }
  }, [])
}

export function Providers({ children }: ProvidersProps) {
  useCleanupInvalidTheme()

  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        themes={["light", "dark", "system"]}
        enableSystem
        disableTransitionOnChange
      >
        <ComparisonProvider>
          <OfflineIndicator />
          {children}
          <ComparisonBar />
          <PWAInstallPrompt />
          <Toaster position="top-right" richColors closeButton />
        </ComparisonProvider>
      </NextThemesProvider>
    </SessionProvider>
  )
}
