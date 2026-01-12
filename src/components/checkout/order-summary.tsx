"use client"

import Image from "next/image"
import { format } from "date-fns"
import { CalendarIcon, UsersIcon, MapPin, Sparkles, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface OrderSummaryProps {
  tour: {
    title: string
    coverImage?: string
    destination: string
  }
  startDate: Date
  endDate: Date
  adults: number
  children: number
  infants: number
  pricing: {
    baseAmount: number
    accommodationAmount: number
    activitiesAmount: number
    taxAmount: number
    discountAmount: number
    totalAmount: number
  }
  currency: string
}

export function OrderSummary({
  tour,
  startDate,
  endDate,
  adults,
  children,
  infants,
  pricing,
  currency,
}: OrderSummaryProps) {
  const totalGuests = adults + children + infants

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="sticky top-6 border-border/50 shadow-premium overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Order Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Tour Image and Title */}
        <div className="space-y-3">
          {tour.coverImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50">
              <Image
                src={tour.coverImage}
                alt={tour.title}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-semibold text-white text-base line-clamp-1">{tour.title}</h3>
                <p className="text-white/80 text-xs flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {tour.destination}
                </p>
              </div>
            </div>
          )}
          {!tour.coverImage && (
            <div className="p-4 rounded-xl bg-muted/50">
              <h3 className="font-semibold text-base">{tour.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {tour.destination}
              </p>
            </div>
          )}
        </div>

        <Separator className="bg-border/50" />

        {/* Travel Dates */}
        <div className="p-3 rounded-xl bg-muted/50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-medium text-sm">Travel Dates</span>
          </div>
          <div className="text-sm text-muted-foreground pl-10">
            {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
          </div>
        </div>

        {/* Guests */}
        <div className="p-3 rounded-xl bg-muted/50 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <UsersIcon className="h-4 w-4 text-purple-600" />
            </div>
            <span className="font-medium text-sm">Guests</span>
          </div>
          <div className="text-sm text-muted-foreground pl-10">
            {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
            {adults > 0 && ` (${adults} ${adults === 1 ? "Adult" : "Adults"}`}
            {children > 0 && `, ${children} ${children === 1 ? "Child" : "Children"}`}
            {infants > 0 && `, ${infants} ${infants === 1 ? "Infant" : "Infants"}`}
            {adults > 0 && ")"}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Price Breakdown
          </h4>

          <div className="space-y-2">
            {/* Base Price */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tour base price</span>
              <span className="font-medium">{formatCurrency(pricing.baseAmount)}</span>
            </div>

            {/* Accommodations */}
            {pricing.accommodationAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Accommodations</span>
                <span className="font-medium">{formatCurrency(pricing.accommodationAmount)}</span>
              </div>
            )}

            {/* Activities */}
            {pricing.activitiesAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Activity add-ons</span>
                <span className="font-medium">{formatCurrency(pricing.activitiesAmount)}</span>
              </div>
            )}

            {/* Tax */}
            {pricing.taxAmount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Taxes & fees</span>
                <span className="font-medium">{formatCurrency(pricing.taxAmount)}</span>
              </div>
            )}

            {/* Discount */}
            {pricing.discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-emerald-600 flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Discount
                </span>
                <span className="text-emerald-600 font-medium">-{formatCurrency(pricing.discountAmount)}</span>
              </div>
            )}
          </div>

          <Separator className="bg-border/50" />

          {/* Total */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(pricing.totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
