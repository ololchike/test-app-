"use client"

import { Calendar as CalendarIcon, Minus, Plus, Shield, ChevronDown, ChevronUp, Sparkles, Check, AlertCircle } from "lucide-react"
import { format, startOfDay } from "date-fns"
import { useState, RefObject, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { BookingState, PricingBreakdown, ActivityAddon } from "./tour-customizer"
import { TrustBadges } from "@/components/trust/trust-badges"
import { FreeCancellationBadge } from "@/components/trust/free-cancellation-badge"

interface BookingCardProps {
  tourSlug: string
  basePrice: number
  durationNights: number
  maxGroupSize: number
  bookingState: BookingState
  pricing: PricingBreakdown
  activityAddons: ActivityAddon[]
  onAdultsChange: (count: number) => void
  onChildrenChange: (count: number) => void
  onStartDateChange: (date: Date | undefined) => void
  onAddonToggle: (addonId: string) => void
  onBooking: () => void
  isLoading: boolean
  endDate: Date | undefined
  bookNowButtonRef?: RefObject<HTMLButtonElement | null>
  freeCancellationDays?: number
  dateError?: string | null
  onClearDateError?: () => void
}

interface AvailabilityData {
  date: string
  available: boolean
  type: string
  spotsAvailable: number
  bookedSpots: number
  reason?: string
}

export function BookingCard({
  tourSlug,
  basePrice,
  durationNights,
  maxGroupSize,
  bookingState,
  pricing,
  activityAddons,
  onAdultsChange,
  onChildrenChange,
  onStartDateChange,
  onAddonToggle,
  onBooking,
  isLoading,
  endDate,
  bookNowButtonRef,
  freeCancellationDays = 48,
  dateError,
  onClearDateError,
}: BookingCardProps) {
  const [isAccommodationOpen, setIsAccommodationOpen] = useState(false)
  const [isAddonsOpen, setIsAddonsOpen] = useState(false)
  const [availability, setAvailability] = useState<AvailabilityData[]>([])
  const [availabilityLoading, setAvailabilityLoading] = useState(true)
  const dateFieldRef = useRef<HTMLButtonElement>(null)

  // Scroll to date field when there's an error
  useEffect(() => {
    if (dateError && dateFieldRef.current) {
      dateFieldRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      dateFieldRef.current.focus()
    }
  }, [dateError])

  // Clear error when date is selected
  const handleDateChange = (date: Date | undefined) => {
    if (date && onClearDateError) {
      onClearDateError()
    }
    onStartDateChange(date)
  }

  const totalGuests = bookingState.adults + bookingState.children

  // Fetch availability data from public API
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setAvailabilityLoading(true)
        const response = await fetch(`/api/tours/${tourSlug}/availability?guests=${totalGuests}`)
        if (response.ok) {
          const data = await response.json()
          setAvailability(data.data?.availability || [])
        }
      } catch (error) {
        console.error("Error fetching availability:", error)
      } finally {
        setAvailabilityLoading(false)
      }
    }

    fetchAvailability()
  }, [tourSlug, totalGuests])

  // Check if a date is disabled based on availability
  const isDateDisabled = (date: Date): boolean => {
    // Past dates are always disabled
    if (date < startOfDay(new Date())) {
      return true
    }

    // If no availability data yet, allow all future dates
    if (availabilityLoading || availability.length === 0) {
      return false
    }

    const dateStr = format(date, "yyyy-MM-dd")
    const availEntry = availability.find((a) => a.date === dateStr)

    // If no entry found, date is available by default
    if (!availEntry) {
      return false
    }

    // Date is disabled if not available
    return !availEntry.available
  }

  return (
    <div className="sticky top-24">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-sm text-muted-foreground">From </span>
              <span className="text-3xl font-bold">${basePrice.toLocaleString()}</span>
              <span className="text-muted-foreground"> / person</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className={cn("text-sm font-medium", dateError && "text-destructive")}>
              Travel Date {dateError && <span className="text-destructive">*</span>}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  ref={dateFieldRef}
                  variant="outline"
                  className={cn(
                    "w-full h-12 justify-start text-left font-normal rounded-xl border-border/50 hover:border-primary/50 transition-all gap-3",
                    !bookingState.startDate && "text-muted-foreground",
                    dateError && "border-destructive ring-2 ring-destructive/20 hover:border-destructive"
                  )}
                >
                  <CalendarIcon className={cn("h-5 w-5 shrink-0", dateError ? "text-destructive" : "text-primary")} />
                  {bookingState.startDate ? (
                    <span className="font-medium">
                      {format(bookingState.startDate, "MMM d")} -{" "}
                      {endDate && format(endDate, "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span>Select start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={bookingState.startDate}
                  onSelect={handleDateChange}
                  disabled={isDateDisabled}
                  modifiers={{
                    limited: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      const availEntry = availability.find((a) => a.date === dateStr)
                      return availEntry?.type === "LIMITED" && availEntry.available
                    },
                    blocked: (date) => {
                      const dateStr = format(date, "yyyy-MM-dd")
                      const availEntry = availability.find((a) => a.date === dateStr)
                      return availEntry?.type === "BLOCKED"
                    },
                  }}
                  modifiersClassNames={{
                    limited: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400",
                    blocked: "bg-red-100 text-red-900 line-through dark:bg-red-900/20 dark:text-red-400",
                  }}
                  initialFocus
                />
                {availabilityLoading && (
                  <div className="p-3 text-sm text-muted-foreground text-center border-t">
                    Loading availability...
                  </div>
                )}
                {!availabilityLoading && availability.length > 0 && (
                  <div className="p-3 text-xs text-muted-foreground border-t space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                      <span>Limited availability</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      <span>Blocked dates are disabled</span>
                    </div>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            {dateError && (
              <p className="text-sm text-destructive flex items-center gap-1.5 mt-1">
                <AlertCircle className="h-4 w-4" />
                {dateError}
              </p>
            )}
          </div>

          {/* Guest Selection */}
          <div className="space-y-3">
            <Label>Guests</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Adults</p>
                  <p className="text-sm text-muted-foreground">Age 12+</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onAdultsChange(bookingState.adults - 1)}
                    disabled={bookingState.adults <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{bookingState.adults}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onAdultsChange(bookingState.adults + 1)}
                    disabled={totalGuests >= maxGroupSize}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Children</p>
                  <p className="text-sm text-muted-foreground">Age 2-11</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onChildrenChange(bookingState.children - 1)}
                    disabled={bookingState.children <= 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{bookingState.children}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onChildrenChange(bookingState.children + 1)}
                    disabled={totalGuests >= maxGroupSize}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Add-ons Selection */}
          {activityAddons.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <Label>Optional Add-ons</Label>
              </div>
              <div className="space-y-2">
                {activityAddons.map((addon) => {
                  const isSelected = bookingState.selectedAddons.includes(addon.id)
                  return (
                    <div
                      key={addon.id}
                      onClick={() => onAddonToggle(addon.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center mt-0.5 shrink-0",
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground"
                        )}
                      >
                        {isSelected && (
                          <Check className="h-3 w-3 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">
                          {addon.name}
                        </span>
                        {addon.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {addon.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-medium">${addon.price}</span>
                        <span className="text-xs text-muted-foreground block">/person</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ${basePrice.toLocaleString()} x {bookingState.adults} adult{bookingState.adults > 1 ? "s" : ""}
              </span>
              <span>${pricing.baseTotal.toLocaleString()}</span>
            </div>
            {bookingState.children > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ${Math.round(basePrice * 0.7).toLocaleString()} x {bookingState.children} child
                  {bookingState.children > 1 ? "ren" : ""} (30% off)
                </span>
                <span>${pricing.childTotal.toLocaleString()}</span>
              </div>
            )}

            {/* Accommodation Breakdown (Collapsible) */}
            <Collapsible open={isAccommodationOpen} onOpenChange={setIsAccommodationOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex w-full justify-between items-center hover:text-foreground transition-colors">
                  <span className="text-muted-foreground flex items-center gap-1">
                    Accommodation ({durationNights} nights)
                    {isAccommodationOpen ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </span>
                  <span>${pricing.accommodationTotal.toLocaleString()}</span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 space-y-1">
                {pricing.accommodationBreakdown.map((item) => (
                  <div key={item.dayNumber} className="flex justify-between pl-4 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Night {item.dayNumber}: {item.name}
                      {item.isUpgrade && (
                        <span className="text-amber-600 text-[10px]">(upgraded)</span>
                      )}
                    </span>
                    <span className="text-muted-foreground">${item.price.toLocaleString()}</span>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Add-ons Breakdown (Collapsible) */}
            {pricing.addonsTotal > 0 && (
              <Collapsible open={isAddonsOpen} onOpenChange={setIsAddonsOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex w-full justify-between items-center hover:text-foreground transition-colors">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Add-ons
                      {isAddonsOpen ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                    <span>${pricing.addonsTotal.toLocaleString()}</span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1 space-y-1">
                  {pricing.addonsBreakdown.map((item) => (
                    <div key={item.id} className="flex justify-between pl-4 text-xs">
                      <span className="text-muted-foreground">
                        {item.name} (${item.perPerson} x {totalGuests})
                      </span>
                      <span className="text-muted-foreground">${item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Service fee (5%)</span>
              <span>${pricing.serviceFee.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>${pricing.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4">
          <Button
            ref={bookNowButtonRef}
            className="w-full"
            size="lg"
            onClick={onBooking}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Book Now"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You won&apos;t be charged yet. Review your booking on the next page.
          </p>

          <FreeCancellationBadge days={freeCancellationDays} variant="inline" />
        </CardFooter>
      </Card>

      {/* Trust Indicators */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="font-medium text-foreground">Verified</p>
          <p>Licensed operator</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="font-medium text-foreground">Secure</p>
          <p>SSL encrypted</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="font-medium text-foreground">Support</p>
          <p>24/7 assistance</p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <TrustBadges variant="payment-only" />
      </div>
    </div>
  )
}
