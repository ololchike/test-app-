"use client"

import { CalendarX, Shield, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface FreeCancellationBadgeProps {
  days?: number // Number of days/hours before tour for free cancellation
  variant?: "inline" | "card" | "banner"
  className?: string
}

export function FreeCancellationBadge({
  days = 48,
  variant = "inline",
  className,
}: FreeCancellationBadgeProps) {
  // Banner variant - full width promotional
  if (variant === "banner") {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-3 bg-green-50 border border-green-100 rounded-lg px-4 py-3",
          className
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
          <Shield className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-green-800">Free Cancellation</p>
          <p className="text-sm text-green-600">
            Cancel up to {days} hours before for a full refund
          </p>
        </div>
      </div>
    )
  }

  // Card variant - more detailed with icon
  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100",
          className
        )}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
          <CalendarX className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-semibold text-green-800">Free Cancellation</p>
          <p className="text-sm text-green-600 mt-0.5">
            Cancel up to {days} hours before your tour starts and get a full refund.
            No questions asked.
          </p>
        </div>
      </div>
    )
  }

  // Inline variant - simple text with icon
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-green-600",
        className
      )}
    >
      <CalendarX className="h-4 w-4" />
      <span className="text-sm font-medium">
        Free cancellation up to {days}h before
      </span>
    </div>
  )
}
