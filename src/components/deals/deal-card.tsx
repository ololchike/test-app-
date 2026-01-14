"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Clock, Tag, Percent, Zap, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DealCardProps {
  deal: {
    id: string
    slug: string
    title: string
    description?: string | null
    type: string
    discountValue: number
    startDate: Date | string
    endDate: Date | string
    coverImage?: string | null
    badge?: string | null
    couponCode?: string | null
    minBookingValue?: number | null
  }
  index?: number
  variant?: "default" | "compact" | "featured"
  className?: string
}

function getTimeRemaining(endDate: Date | string) {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return "Expired"

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 7) return `${days} days left`
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours} hours left`
}

function getDiscountDisplay(type: string, value: number) {
  switch (type) {
    case "PERCENTAGE_OFF":
    case "EARLY_BIRD":
    case "LAST_MINUTE":
    case "FLASH_SALE":
      return `${value}% OFF`
    case "FIXED_AMOUNT_OFF":
      return `$${value} OFF`
    case "SEASONAL":
      return "Special Offer"
    default:
      return `${value}% OFF`
  }
}

function getDealIcon(type: string) {
  switch (type) {
    case "FLASH_SALE":
      return Zap
    case "EARLY_BIRD":
      return Calendar
    case "LAST_MINUTE":
      return Clock
    default:
      return Tag
  }
}

export function DealCard({
  deal,
  index = 0,
  variant = "default",
  className,
}: DealCardProps) {
  const timeRemaining = getTimeRemaining(deal.endDate)
  const discountDisplay = getDiscountDisplay(deal.type, deal.discountValue)
  const DealIcon = getDealIcon(deal.type)
  const isExpiringSoon = timeRemaining.includes("hours") || timeRemaining.includes("1d") || timeRemaining.includes("2d")

  if (variant === "compact") {
    return (
      <Link
        href={`/deals/${deal.slug}`}
        className={cn(
          "group flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-md transition-all",
          className
        )}
      >
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Percent className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {deal.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {discountDisplay} • {timeRemaining}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </Link>
    )
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={className}
      >
        <Link
          href={`/deals/${deal.slug}`}
          className="group block relative rounded-2xl overflow-hidden h-full"
        >
          <div className="relative aspect-[4/3] sm:aspect-[16/9]">
            <Image
              src={deal.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600"}
              alt={deal.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {deal.badge && (
                <Badge variant="secondary" className="bg-white/90 text-foreground">
                  <DealIcon className="h-3 w-3 mr-1" />
                  {deal.badge}
                </Badge>
              )}
            </div>

            {/* Discount Badge */}
            <div className="absolute top-4 right-4">
              <div className="bg-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm">
                {discountDisplay}
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-primary-foreground transition-colors">
                {deal.title}
              </h3>
              {deal.description && (
                <p className="text-white/80 text-sm line-clamp-2 mb-3 hidden sm:block">
                  {deal.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className={cn(
                  "flex items-center gap-1 text-sm",
                  isExpiringSoon ? "text-red-300" : "text-white/80"
                )}>
                  <Clock className="h-4 w-4" />
                  <span>{timeRemaining}</span>
                </div>

                {deal.couponCode && (
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm font-mono">{deal.couponCode}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={className}
    >
      <Link
        href={`/deals/${deal.slug}`}
        className="group block rounded-xl overflow-hidden border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg transition-all"
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={deal.coverImage || "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=600"}
            alt={deal.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Discount Badge */}
          <div className="absolute top-3 right-3">
            <div className="bg-red-500 text-white px-2.5 py-1 rounded-full font-bold text-sm">
              {discountDisplay}
            </div>
          </div>

          {/* Timer Badge */}
          <div className={cn(
            "absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium",
            isExpiringSoon
              ? "bg-red-500/90 text-white"
              : "bg-white/90 text-foreground"
          )}>
            <Clock className="h-3 w-3 inline-block mr-1" />
            {timeRemaining}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {deal.badge && (
              <Badge variant="secondary" className="text-xs">
                <DealIcon className="h-3 w-3 mr-1" />
                {deal.badge}
              </Badge>
            )}
          </div>

          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {deal.title}
          </h3>
          {deal.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {deal.description}
            </p>
          )}

          {deal.couponCode && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Use code:</span>
              <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {deal.couponCode}
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-1 text-primary text-sm font-medium">
            <span>View deal</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
