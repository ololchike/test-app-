"use client"

import { Eye, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface ViewingNowBadgeProps {
  count: number
  className?: string
  variant?: "default" | "compact"
}

export function ViewingNowBadge({
  count,
  className,
  variant = "default",
}: ViewingNowBadgeProps) {
  // Don't show if not many people viewing
  if (count < 2) return null

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 text-xs text-blue-600",
          className
        )}
      >
        <Eye className="h-3 w-3" />
        <span>{count} viewing</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-sm text-blue-600",
        className
      )}
    >
      <Users className="h-4 w-4" />
      <span>
        {count} {count === 1 ? "person" : "people"} viewing right now
      </span>
    </div>
  )
}
