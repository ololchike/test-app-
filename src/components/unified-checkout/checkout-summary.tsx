"use client"

import Image from "next/image"
import { format } from "date-fns"
import {
  CalendarIcon,
  UsersIcon,
  MapPin,
  Sparkles,
  Tag,
  Car,
  Hotel,
  Ticket,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCheckout } from "./checkout-context"
import { cn } from "@/lib/utils"

interface CheckoutSummaryProps {
  className?: string
  showVehicle?: boolean
  showAccommodations?: boolean
  showAddons?: boolean
}

export function CheckoutSummary({
  className,
  showVehicle = true,
  showAccommodations = true,
  showAddons = true,
}: CheckoutSummaryProps) {
  const { state } = useCheckout()
  const { tour, startDate, endDate, adults, children, infants, pricing, selections, vehicles, accommodationOptions, addonOptions, promoCode, expiresAt, paymentType } = state

  if (!tour) return null

  const totalGuests = adults + children + infants

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get selected vehicle details
  const selectedVehicle = selections.vehicleId
    ? vehicles.find(v => v.id === selections.vehicleId)
    : vehicles.find(v => v.isDefault)

  // Get selected accommodations
  const selectedAccommodations = Object.entries(selections.accommodations).map(([day, accId]) => {
    const acc = accommodationOptions.find(a => a.id === accId)
    return acc ? { dayNumber: parseInt(day), ...acc } : null
  }).filter(Boolean)

  // Get selected addons
  const selectedAddons = selections.addons.map(({ id, quantity }) => {
    const addon = addonOptions.find(a => a.id === id)
    return addon ? { ...addon, quantity } : null
  }).filter(Boolean)

  return (
    <Card className={cn("border-border/50 shadow-premium overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Booking Summary
          </CardTitle>
          {tour.agent.isVerified && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Verified
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Operated by {tour.agent.businessName}
        </p>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        {/* Session Timer */}
        {expiresAt && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3">
            <Clock className="h-4 w-4" />
            <span>
              Reservation held for{" "}
              {Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60000))} minutes
            </span>
          </div>
        )}

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
                  {tour.destination}, {tour.country}
                </p>
              </div>
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
            {startDate && format(startDate, "MMM dd, yyyy")} -{" "}
            {endDate && format(endDate, "MMM dd, yyyy")}
            <span className="block text-xs mt-1">
              {tour.durationDays} days / {tour.durationNights} nights
            </span>
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

        {/* Selected Vehicle */}
        {showVehicle && selectedVehicle && (
          <div className="p-3 rounded-xl bg-muted/50 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Car className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="font-medium text-sm">Vehicle</span>
            </div>
            <div className="text-sm text-muted-foreground pl-10">
              {selectedVehicle.name}
              {pricing.vehicleTotal > 0 && (
                <span className="block text-xs mt-1">
                  +{formatCurrency(pricing.vehicleTotal)} upgrade
                </span>
              )}
            </div>
          </div>
        )}

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
              <span className="text-muted-foreground">
                {formatCurrency(tour.basePrice)} x {adults} adult{adults !== 1 ? "s" : ""}
              </span>
              <span className="font-medium">{formatCurrency(pricing.baseTotal)}</span>
            </div>

            {/* Children */}
            {children > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {children} {children === 1 ? "child" : "children"} (30% off)
                </span>
                <span className="font-medium">{formatCurrency(pricing.childTotal)}</span>
              </div>
            )}

            {/* Infants */}
            {infants > 0 && pricing.infantTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {infants} {infants === 1 ? "infant" : "infants"}
                </span>
                <span className="font-medium">{formatCurrency(pricing.infantTotal)}</span>
              </div>
            )}

            {/* Vehicle Upgrade */}
            {pricing.vehicleTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  Vehicle upgrade
                </span>
                <span className="font-medium">{formatCurrency(pricing.vehicleTotal)}</span>
              </div>
            )}

            {/* Accommodations */}
            {showAccommodations && pricing.accommodationTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Hotel className="h-3 w-3" />
                  Accommodations
                </span>
                <span className="font-medium">{formatCurrency(pricing.accommodationTotal)}</span>
              </div>
            )}

            {/* Add-ons */}
            {showAddons && pricing.addonsTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Ticket className="h-3 w-3" />
                  Add-on activities
                </span>
                <span className="font-medium">{formatCurrency(pricing.addonsTotal)}</span>
              </div>
            )}

            {/* Service Fee */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Service fee (5%)</span>
              <span className="font-medium">{formatCurrency(pricing.serviceFee)}</span>
            </div>

            {/* Discount */}
            {pricing.discount > 0 && promoCode && (
              <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Promo ({promoCode.code})
                </span>
                <span className="text-emerald-600 font-medium">-{formatCurrency(pricing.discount)}</span>
              </div>
            )}
          </div>

          <Separator className="bg-border/50" />

          {/* Total */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(pricing.total)}</span>
          </div>

          {/* Deposit Info */}
          {tour.depositEnabled && paymentType === "DEPOSIT" && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due today (deposit)</span>
                <span className="font-semibold">{formatCurrency(pricing.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Balance due later</span>
                <span>{formatCurrency(pricing.balanceAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          All prices in USD. Taxes included.
        </p>
      </CardContent>
    </Card>
  )
}
