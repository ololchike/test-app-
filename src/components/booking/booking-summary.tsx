"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"

interface AccommodationOption {
  id: string
  name: string
  tier: string
  pricePerNight: number
}

interface ActivityAddon {
  id: string
  name: string
  price: number
}

interface BookingSummaryProps {
  tour: {
    title: string
    basePrice: number
    agent: {
      businessName: string
      isVerified: boolean
    }
  }
  pricing: {
    baseTotal: number
    childTotal: number
    accommodationTotal: number
    addonsTotal: number
    serviceFee: number
    total: number
  }
  adults: number
  children: number
  accommodations: Record<string, string>
  accommodationOptions: AccommodationOption[]
  addons: string[]
  activityAddons: ActivityAddon[]
}

export function BookingSummary({
  tour,
  pricing,
  adults,
  children,
  accommodations,
  accommodationOptions,
  addons,
  activityAddons,
}: BookingSummaryProps) {
  const totalGuests = adults + children

  // Get selected accommodations details
  const selectedAccommodations = Object.entries(accommodations).map(([dayNum, accId]) => {
    const acc = accommodationOptions.find((a) => a.id === accId)
    return acc ? { dayNumber: parseInt(dayNum), ...acc } : null
  }).filter(Boolean) as (AccommodationOption & { dayNumber: number })[]

  // Get selected addons details
  const selectedAddons = addons.map((addonId) => {
    return activityAddons.find((a) => a.id === addonId)
  }).filter(Boolean) as ActivityAddon[]

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">Price Summary</CardTitle>
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

      <CardContent className="space-y-4">
        {/* Base Price */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              ${tour.basePrice.toLocaleString()} x {adults} adult{adults > 1 ? "s" : ""}
            </span>
            <span>${pricing.baseTotal.toLocaleString()}</span>
          </div>

          {children > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ${Math.round(tour.basePrice * 0.7).toLocaleString()} x {children} child
                {children > 1 ? "ren" : ""} (30% off)
              </span>
              <span>${pricing.childTotal.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Accommodations */}
        {selectedAccommodations.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Accommodations</p>
              {selectedAccommodations.map((acc) => (
                <div key={acc.dayNumber} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Night {acc.dayNumber}: {acc.name}
                  </span>
                  <span>${acc.pricePerNight.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium">
                <span>Accommodation Total</span>
                <span>${pricing.accommodationTotal.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}

        {/* Add-ons */}
        {selectedAddons.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Add-ons</p>
              {selectedAddons.map((addon) => (
                <div key={addon.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {addon.name} (${addon.price} x {totalGuests})
                  </span>
                  <span>${(addon.price * totalGuests).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium">
                <span>Add-ons Total</span>
                <span>${pricing.addonsTotal.toLocaleString()}</span>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Service Fee */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Service fee (5%)</span>
          <span>${pricing.serviceFee.toLocaleString()}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>${pricing.total.toLocaleString()}</span>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          All prices in USD. Taxes included.
        </p>
      </CardContent>
    </Card>
  )
}
