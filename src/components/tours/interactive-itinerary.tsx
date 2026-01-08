"use client"

import { useMemo } from "react"
import { Hotel, Utensils, Sparkles, MapPin, Check, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  ItineraryDay,
  AccommodationOption,
  ActivityAddon,
  BookingState,
} from "./tour-customizer"

interface InteractiveItineraryProps {
  itinerary: ItineraryDay[]
  accommodationOptions: AccommodationOption[]
  activityAddons: ActivityAddon[]
  bookingState: BookingState
  onAccommodationChange: (dayNumber: number, accommodationId: string) => void
  onAddonToggle: (addonId: string) => void
  durationDays: number
}

export function InteractiveItinerary({
  itinerary,
  accommodationOptions,
  activityAddons,
  bookingState,
  onAccommodationChange,
  onAddonToggle,
  durationDays,
}: InteractiveItineraryProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Customize Your Itinerary</h2>
      <p className="text-muted-foreground mb-6">
        Personalize your safari experience by selecting your preferred accommodations and activities for each day.
      </p>

      <div className="space-y-4">
        {itinerary.map((day) => (
          <ItineraryDayCard
            key={day.id}
            day={day}
            accommodationOptions={accommodationOptions}
            activityAddons={activityAddons}
            selectedAccommodationId={bookingState.accommodationsByNight[day.dayNumber]}
            selectedAddonIds={bookingState.selectedAddons}
            onAccommodationChange={onAccommodationChange}
            onAddonToggle={onAddonToggle}
            isLastDay={day.dayNumber === durationDays}
          />
        ))}
      </div>
    </div>
  )
}

interface ItineraryDayCardProps {
  day: ItineraryDay
  accommodationOptions: AccommodationOption[]
  activityAddons: ActivityAddon[]
  selectedAccommodationId: string | undefined
  selectedAddonIds: string[]
  onAccommodationChange: (dayNumber: number, accommodationId: string) => void
  onAddonToggle: (addonId: string) => void
  isLastDay: boolean
}

function ItineraryDayCard({
  day,
  accommodationOptions,
  activityAddons,
  selectedAccommodationId,
  selectedAddonIds,
  onAccommodationChange,
  onAddonToggle,
  isLastDay,
}: ItineraryDayCardProps) {
  // Get available accommodations for this day
  const availableAccommodations = useMemo(() => {
    if (day.availableAccommodationIds.length > 0) {
      return accommodationOptions.filter((acc) =>
        day.availableAccommodationIds.includes(acc.id)
      )
    }
    // Fallback: if no specific accommodations defined, show all
    return accommodationOptions
  }, [day.availableAccommodationIds, accommodationOptions])

  // Get default accommodation for price comparison
  const defaultAccommodation = useMemo(() => {
    if (day.defaultAccommodationId) {
      return accommodationOptions.find((acc) => acc.id === day.defaultAccommodationId)
    }
    return availableAccommodations[0]
  }, [day.defaultAccommodationId, accommodationOptions, availableAccommodations])

  // Get available add-ons for this day
  const availableAddons = useMemo(() => {
    if (day.availableAddonIds.length > 0) {
      return activityAddons.filter((addon) =>
        day.availableAddonIds.includes(addon.id)
      )
    }
    return []
  }, [day.availableAddonIds, activityAddons])

  // Calculate price difference from default
  const getPriceDifference = (accommodation: AccommodationOption) => {
    if (!defaultAccommodation) return 0
    return accommodation.pricePerNight - defaultAccommodation.pricePerNight
  }

  // Get selected accommodation details
  const selectedAccommodation = accommodationOptions.find(
    (acc) => acc.id === selectedAccommodationId
  )

  const hasOvernightStay = !isLastDay
  const hasMultipleAccommodations = availableAccommodations.length > 1
  const hasAddons = availableAddons.length > 0

  return (
    <Card className="overflow-hidden">
      {/* Day Header */}
      <div className="bg-primary/5 px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {day.dayNumber}
          </div>
          <div>
            <h3 className="font-semibold">{day.title}</h3>
            {day.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {day.location}
              </p>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-4 space-y-4">
        {/* Description */}
        <p className="text-muted-foreground text-sm">{day.description}</p>

        {/* Meals */}
        {day.meals.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Utensils className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Meals:</span>
            <span className="text-muted-foreground">{day.meals.join(", ")}</span>
          </div>
        )}

        {/* Activities */}
        {day.activities.length > 0 && (
          <div className="text-sm">
            <span className="font-medium">Activities:</span>
            <ul className="mt-1 space-y-1">
              {day.activities.map((activity, idx) => (
                <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accommodation Selection */}
        {hasOvernightStay && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Hotel className="h-4 w-4 text-primary" />
              <span className="font-medium">Where You&apos;ll Stay</span>
            </div>

            {hasMultipleAccommodations ? (
              <div className="space-y-2">
                {availableAccommodations.map((accommodation) => {
                  const priceDiff = getPriceDifference(accommodation)
                  const isDefault = accommodation.id === day.defaultAccommodationId
                  const isSelected = accommodation.id === selectedAccommodationId

                  return (
                    <div
                      key={accommodation.id}
                      onClick={() => onAccommodationChange(day.dayNumber, accommodation.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-primary" : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{accommodation.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {accommodation.tier}
                            </Badge>
                            {isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default
                              </Badge>
                            )}
                          </div>
                          {accommodation.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {accommodation.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {priceDiff === 0 ? (
                          <span className="text-sm text-muted-foreground">Included</span>
                        ) : priceDiff > 0 ? (
                          <span className="text-sm text-amber-600 flex items-center gap-1">
                            <ArrowUp className="h-3 w-3" />
                            +${priceDiff}/night
                          </span>
                        ) : (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <ArrowDown className="h-3 w-3" />
                            -${Math.abs(priceDiff)}/night
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Single accommodation - just display it
              <div className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">
                      {selectedAccommodation?.name || day.overnight || "Accommodation"}
                    </span>
                    {selectedAccommodation?.tier && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {selectedAccommodation.tier}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">Included</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Available Add-ons */}
        {hasAddons && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">Available Add-ons</span>
            </div>

            <div className="space-y-2">
              {availableAddons.map((addon) => {
                const isSelected = selectedAddonIds.includes(addon.id)

                return (
                  <div
                    key={addon.id}
                    className={`flex items-start justify-between p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`${day.id}-addon-${addon.id}`}
                        checked={isSelected}
                        onCheckedChange={() => onAddonToggle(addon.id)}
                        className="mt-0.5"
                      />
                      <Label
                        htmlFor={`${day.id}-addon-${addon.id}`}
                        className="cursor-pointer"
                      >
                        <div className="font-medium">{addon.name}</div>
                        {addon.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {addon.description}
                          </p>
                        )}
                        {addon.duration && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Duration: {addon.duration}
                          </p>
                        )}
                      </Label>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-medium">${addon.price}</span>
                      <span className="text-xs text-muted-foreground block">per person</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
