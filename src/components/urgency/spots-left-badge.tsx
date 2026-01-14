"use client"

import { cn } from "@/lib/utils"

interface SpotsLeftBadgeProps {
  spots: number
  maxSpots?: number
  className?: string
  showWhenAbove?: number // Only show badge when spots <= this number
}

export function SpotsLeftBadge({
  spots,
  maxSpots,
  className,
  showWhenAbove = 5,
}: SpotsLeftBadgeProps) {
  // Don't show if plenty of spots available
  if (spots > showWhenAbove) return null

  // Different urgency levels
  const isVeryLow = spots <= 2
  const isLow = spots <= 4

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium",
        isVeryLow
          ? "text-red-600"
          : isLow
          ? "text-orange-600"
          : "text-amber-600",
        className
      )}
    >
      {/* Pulsing dot indicator */}
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
            isVeryLow ? "bg-red-400" : isLow ? "bg-orange-400" : "bg-amber-400"
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2 w-2 rounded-full",
            isVeryLow ? "bg-red-500" : isLow ? "bg-orange-500" : "bg-amber-500"
          )}
        />
      </span>

      {/* Text */}
      <span>
        {spots === 0
          ? "Fully booked"
          : spots === 1
          ? "Only 1 spot left!"
          : `Only ${spots} spots left`}
      </span>
    </div>
  )
}
