"use client"

import Link from "next/link"
import { ArrowRight, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DealCard } from "./deal-card"
import { cn } from "@/lib/utils"

interface Deal {
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
}

interface FeaturedDealsProps {
  deals: Deal[]
  className?: string
}

export function FeaturedDeals({ deals, className }: FeaturedDealsProps) {
  if (deals.length === 0) return null

  return (
    <section className={cn("py-12 sm:py-16 bg-gradient-to-b from-red-50/50 to-transparent dark:from-red-950/10", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold text-sm uppercase tracking-wider">
                Limited Time Offers
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Deals & Special Offers
            </h2>
            <p className="text-muted-foreground mt-1">
              Save big on your next safari adventure
            </p>
          </div>

          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/deals">
              View All Deals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {deals.slice(0, 3).map((deal, index) => (
            <DealCard
              key={deal.id}
              deal={deal}
              index={index}
              variant="featured"
            />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline">
            <Link href="/deals">
              View All Deals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
