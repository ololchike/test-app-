"use client"

import Image from "next/image"
import { Shield, Lock, CheckCircle, BadgeCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrustBadgesProps {
  variant?: "full" | "compact" | "payment-only" | "footer"
  className?: string
  showLabels?: boolean
}

// Association badges - will use placeholder icons until actual images are added
const associationBadges = [
  {
    id: "kato",
    name: "KATO Member",
    description: "Kenya Association of Tour Operators",
    // Use placeholder until actual badge images are provided
    icon: BadgeCheck,
  },
  {
    id: "tato",
    name: "TATO Member",
    description: "Tanzania Association of Tour Operators",
    icon: BadgeCheck,
  },
  {
    id: "verified",
    name: "Verified Operators",
    description: "All operators verified",
    icon: CheckCircle,
  },
]

const securityBadges = [
  {
    id: "ssl",
    name: "SSL Secure",
    description: "256-bit encryption",
    icon: Lock,
  },
  {
    id: "secure",
    name: "Secure Payments",
    description: "Bank-level security",
    icon: Shield,
  },
]

// Payment method logos
const paymentMethods = [
  { id: "mpesa", name: "M-Pesa", color: "bg-green-600" },
  { id: "visa", name: "Visa", color: "bg-blue-600" },
  { id: "mastercard", name: "Mastercard", color: "bg-orange-500" },
]

export function TrustBadges({ variant = "full", className, showLabels = true }: TrustBadgesProps) {
  // Payment-only variant - just payment logos
  if (variant === "payment-only") {
    return (
      <div className={cn("flex flex-wrap items-center gap-3", className)}>
        <span className="text-sm text-muted-foreground">We accept:</span>
        <div className="flex items-center gap-2">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={cn(
                "flex h-8 items-center justify-center rounded px-3 text-xs font-semibold text-white",
                method.color
              )}
            >
              {method.name}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Compact variant - single row, icons only
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-4 py-2", className)}>
        {associationBadges.map((badge) => (
          <div
            key={badge.id}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            title={badge.description}
          >
            <badge.icon className="h-4 w-4 text-primary" />
            {showLabels && <span>{badge.name}</span>}
          </div>
        ))}
        <div className="h-4 w-px bg-border" />
        {securityBadges.slice(0, 1).map((badge) => (
          <div
            key={badge.id}
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            title={badge.description}
          >
            <badge.icon className="h-4 w-4 text-green-600" />
            {showLabels && <span>{badge.name}</span>}
          </div>
        ))}
      </div>
    )
  }

  // Footer variant - horizontal with payment methods
  if (variant === "footer") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Security badges */}
        <div className="flex flex-wrap items-center gap-4">
          {[...associationBadges.slice(0, 2), ...securityBadges].map((badge) => (
            <div
              key={badge.id}
              className="flex items-center gap-2 text-sm text-secondary-foreground/70"
              title={badge.description}
            >
              <badge.icon className="h-4 w-4" />
              <span>{badge.name}</span>
            </div>
          ))}
        </div>
        {/* Payment methods */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-secondary-foreground/60">Payment methods:</span>
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={cn(
                "flex h-6 items-center justify-center rounded px-2 text-[10px] font-semibold text-white",
                method.color
              )}
            >
              {method.name}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Full variant - two rows with all badges
  return (
    <section className={cn("border-y bg-muted/30 py-6", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Association & Verification Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {associationBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-3 rounded-lg bg-background px-4 py-2 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <badge.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security & Payment Row */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Security badges */}
            {securityBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <badge.icon className="h-4 w-4 text-green-600" />
                <span>{badge.name}</span>
              </div>
            ))}

            <div className="hidden h-4 w-px bg-border md:block" />

            {/* Payment methods */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Payments:</span>
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={cn(
                    "flex h-7 items-center justify-center rounded px-2.5 text-xs font-semibold text-white",
                    method.color
                  )}
                >
                  {method.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
