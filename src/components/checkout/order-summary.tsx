"use client"

import Image from "next/image"
import { format } from "date-fns"
import { CalendarIcon, UsersIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

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
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tour Image and Title */}
        <div className="space-y-3">
          {tour.coverImage && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={tour.coverImage}
                alt={tour.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-base">{tour.title}</h3>
            <p className="text-sm text-muted-foreground">{tour.destination}</p>
          </div>
        </div>

        <Separator />

        {/* Travel Dates */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Travel Dates</span>
          </div>
          <div className="text-sm text-muted-foreground pl-6">
            {format(startDate, "MMM dd, yyyy")} - {format(endDate, "MMM dd, yyyy")}
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Guests</span>
          </div>
          <div className="text-sm text-muted-foreground pl-6">
            {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
            {adults > 0 && ` (${adults} ${adults === 1 ? "Adult" : "Adults"}`}
            {children > 0 && `, ${children} ${children === 1 ? "Child" : "Children"}`}
            {infants > 0 && `, ${infants} ${infants === 1 ? "Infant" : "Infants"}`}
            {adults > 0 && ")"}
          </div>
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Price Breakdown</h4>

          <div className="space-y-2 text-sm">
            {/* Base Price */}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tour base price</span>
              <span>{formatCurrency(pricing.baseAmount)}</span>
            </div>

            {/* Accommodations */}
            {pricing.accommodationAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Accommodations</span>
                <span>{formatCurrency(pricing.accommodationAmount)}</span>
              </div>
            )}

            {/* Activities */}
            {pricing.activitiesAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Activity add-ons</span>
                <span>{formatCurrency(pricing.activitiesAmount)}</span>
              </div>
            )}

            {/* Tax */}
            {pricing.taxAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxes & fees</span>
                <span>{formatCurrency(pricing.taxAmount)}</span>
              </div>
            )}

            {/* Discount */}
            {pricing.discountAmount > 0 && (
              <div className="flex items-center justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(pricing.discountAmount)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-lg">{formatCurrency(pricing.totalAmount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
