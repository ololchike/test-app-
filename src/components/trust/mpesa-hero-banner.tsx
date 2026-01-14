"use client"

import { cn } from "@/lib/utils"
import { Smartphone, CreditCard, Shield, Zap } from "lucide-react"

interface MpesaHeroBannerProps {
  variant?: "full" | "compact" | "inline"
  className?: string
}

// Payment method logos as simple styled elements
const paymentMethods = [
  { name: "M-Pesa", color: "bg-green-600", textColor: "text-white" },
  { name: "Airtel", color: "bg-red-600", textColor: "text-white" },
  { name: "Visa", color: "bg-blue-800", textColor: "text-white" },
  { name: "Mastercard", color: "bg-orange-500", textColor: "text-white" },
]

export function MpesaHeroBanner({
  variant = "full",
  className,
}: MpesaHeroBannerProps) {
  // Inline variant - simple payment icons
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="text-sm text-muted-foreground">Pay with:</span>
        {paymentMethods.map((method) => (
          <div
            key={method.name}
            className={cn(
              "px-2 py-1 rounded text-[10px] font-bold",
              method.color,
              method.textColor
            )}
          >
            {method.name}
          </div>
        ))}
      </div>
    )
  }

  // Compact variant - single line
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-4 bg-green-600 text-white py-2 px-4 rounded-lg",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span className="font-semibold text-sm">M-Pesa Accepted</span>
        </div>
        <div className="h-4 w-px bg-white/30" />
        <span className="text-sm text-green-100">
          Pay instantly with mobile money
        </span>
      </div>
    )
  }

  // Full variant - promotional banner
  return (
    <section
      className={cn(
        "bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white py-4 overflow-hidden",
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          {/* Main message */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2 justify-center md:justify-start">
                <Zap className="h-5 w-5 text-yellow-300" />
                NOW ACCEPTING M-PESA
              </h3>
              <p className="text-green-100 text-sm">
                The only safari platform with native mobile money support
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-12 w-px bg-white/20" />

          {/* Payment methods */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-bold shadow-sm",
                    method.color,
                    method.textColor
                  )}
                >
                  {method.name}
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="hidden lg:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-green-200" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span>Instant</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
