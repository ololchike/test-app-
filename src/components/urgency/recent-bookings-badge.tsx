"use client"

import { CheckCircle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface RecentBookingsBadgeProps {
  count: number
  period?: "24h" | "7d" | "30d"
  className?: string
  variant?: "default" | "compact"
}

const periodLabels = {
  "24h": "in the last 24 hours",
  "7d": "this week",
  "30d": "this month",
}

export function RecentBookingsBadge({
  count,
  period = "24h",
  className,
  variant = "default",
}: RecentBookingsBadgeProps) {
  // Don't show if no recent bookings
  if (count === 0) return null

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 text-xs text-green-600",
          className
        )}
      >
        <TrendingUp className="h-3 w-3" />
        <span>{count} booked recently</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-green-600",
        className
      )}
    >
      <CheckCircle className="h-4 w-4" />
      <span>
        {count} {count === 1 ? "person" : "people"} booked {periodLabels[period]}
      </span>
    </div>
  )
}
