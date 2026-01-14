"use client"

import { cn } from "@/lib/utils"
import { Check, TrendingDown, Award } from "lucide-react"

interface PriceComparisonProps {
  ourPrice: number
  competitorPrice?: number
  competitorName?: string
  currency?: string
  className?: string
  variant?: "full" | "compact" | "badge"
}

export function PriceComparison({
  ourPrice,
  competitorPrice,
  competitorName = "Viator",
  currency = "USD",
  className,
  variant = "full",
}: PriceComparisonProps) {
  // Don't show if no competitor price or we're not cheaper
  if (!competitorPrice || competitorPrice <= ourPrice) return null

  const savings = competitorPrice - ourPrice
  const savingsPercent = Math.round((savings / competitorPrice) * 100)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Badge variant - minimal
  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-medium",
          className
        )}
      >
        <TrendingDown className="h-3 w-3" />
        <span>Save {savingsPercent}%</span>
      </div>
    )
  }

  // Compact variant - single line
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm",
          className
        )}
      >
        <span className="text-muted-foreground line-through">
          {formatPrice(competitorPrice)}
        </span>
        <span className="font-semibold text-green-600">
          {formatPrice(ourPrice)}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
          Save {savingsPercent}%
        </span>
      </div>
    )
  }

  // Full variant - detailed card
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 p-4",
        className
      )}
    >
      {/* Header badge */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-bold">
          <Award className="h-3.5 w-3.5" />
          BEST VALUE
        </div>
      </div>

      {/* Price comparison */}
      <div className="space-y-2">
        {/* Our price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-green-700">SafariPlus</span>
          </div>
          <span className="text-xl font-bold text-green-700">
            {formatPrice(ourPrice)}
          </span>
        </div>

        {/* Competitor price */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>{competitorName}</span>
          <span className="line-through">{formatPrice(competitorPrice)}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-amber-200 my-2" />

        {/* Savings */}
        <div className="flex items-center justify-between">
          <span className="font-medium text-amber-800">You save</span>
          <div className="text-right">
            <span className="text-lg font-bold text-amber-700">
              {formatPrice(savings)}
            </span>
            <span className="ml-2 text-sm text-amber-600">
              ({savingsPercent}% off)
            </span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <p className="mt-3 text-xs text-amber-700">
        Same tour, same operator — we charge lower fees so you pay less.
      </p>
    </div>
  )
}
