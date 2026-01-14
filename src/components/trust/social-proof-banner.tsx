"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, BadgeCheck, Star, DollarSign, Map } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlatformStats {
  totalBookings: number
  verifiedOperators: number
  averageRating: number
  totalPaidToAgents: number
  activeTours: number
}

interface SocialProofBannerProps {
  variant?: "full" | "compact" | "minimal"
  className?: string
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${Math.floor(num / 1000)}k`
  }
  return num.toString()
}

function formatCurrency(num: number): string {
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `$${Math.floor(num / 1000)}k`
  }
  return `$${num}`
}

const statItems = [
  {
    key: "totalBookings",
    label: "Bookings Made",
    icon: Users,
    format: formatNumber,
    suffix: "+",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    key: "verifiedOperators",
    label: "Verified Operators",
    icon: BadgeCheck,
    format: formatNumber,
    suffix: "+",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    key: "averageRating",
    label: "Average Rating",
    icon: Star,
    format: (n: number) => n.toFixed(1),
    suffix: "★",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    key: "totalPaidToAgents",
    label: "Paid to Agents",
    icon: DollarSign,
    format: formatCurrency,
    suffix: "+",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
] as const

export function SocialProofBanner({
  variant = "full",
  className,
}: SocialProofBannerProps) {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats/platform")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Failed to fetch platform stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Don't render anything while loading or if no stats
  if (isLoading) {
    return (
      <div className={cn("bg-primary/5 border-y border-primary/10 py-4", className)}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) return null

  // Minimal variant - just numbers inline
  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-4 py-2", className)}>
        {statItems.slice(0, 3).map((item) => {
          const value = stats[item.key as keyof PlatformStats]
          if (typeof value !== "number" || value === 0) return null

          return (
            <div key={item.key} className="flex items-center gap-1.5 text-sm">
              <item.icon className={cn("h-4 w-4", item.color)} />
              <span className="font-semibold">
                {item.format(value)}
                {item.key !== "averageRating" && item.suffix}
              </span>
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // Compact variant - smaller, horizontal
  if (variant === "compact") {
    return (
      <div className={cn("bg-muted/50 py-3", className)}>
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {statItems.map((item) => {
              const value = stats[item.key as keyof PlatformStats]
              if (typeof value !== "number" || value === 0) return null

              return (
                <div key={item.key} className="flex items-center gap-2">
                  <item.icon className={cn("h-4 w-4", item.color)} />
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">
                      {item.format(value)}
                      {item.key !== "averageRating" && item.suffix}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Full variant - with icons and animation
  return (
    <section className={cn("bg-primary/5 border-y border-primary/10 py-6", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 },
            },
          }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:gap-16"
        >
          {statItems.map((item) => {
            const value = stats[item.key as keyof PlatformStats]
            if (typeof value !== "number" || value === 0) return null

            return (
              <motion.div
                key={item.key}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="flex items-center gap-3"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    item.bgColor
                  )}
                >
                  <item.icon className={cn("h-6 w-6", item.color)} />
                </div>
                <div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold text-foreground">
                      {item.format(value)}
                    </span>
                    {item.key !== "averageRating" && (
                      <span className="text-lg font-bold text-muted-foreground ml-0.5">
                        {item.suffix}
                      </span>
                    )}
                    {item.key === "averageRating" && (
                      <span className="text-lg text-amber-500 ml-1">{item.suffix}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
