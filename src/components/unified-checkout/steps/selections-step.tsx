"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { Car, Hotel, Ticket, Check, Users, Sparkles, ChevronDown, AlertCircle, Plus, Minus, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useCheckout } from "../checkout-context"
import { VehicleSelection, calculateVehicleSuggestion } from "../types"

export function SelectionsStep() {
  const { state, setVehicle, setVehicles, setAccommodation, toggleAddon } = useCheckout()
  const { vehicles, accommodationOptions, addonOptions, itinerary, selections, adults, children } = state

  const totalGroupSize = adults + children

  const [vehicleExpanded, setVehicleExpanded] = useState(true)
  const [accommodationExpanded, setAccommodationExpanded] = useState(false)
  const [addonsExpanded, setAddonsExpanded] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const defaultVehicle = vehicles.find(v => v.isDefault)

  // Calculate current total capacity from selected vehicles
  const currentCapacity = useMemo(() => {
    return (selections.vehicles || []).reduce((total, sel) => {
      const vehicle = vehicles.find(v => v.id === sel.vehicleId)
      return total + (vehicle ? vehicle.maxPassengers * sel.quantity : 0)
    }, 0)
  }, [selections.vehicles, vehicles])

  const hasCapacityIssue = totalGroupSize > currentCapacity && vehicles.length > 0

  // Get suggested vehicle combination
  const suggestedVehicles = useMemo(() => {
    return calculateVehicleSuggestion(vehicles, totalGroupSize)
  }, [vehicles, totalGroupSize])

  // Check if selection matches suggestion
  const matchesSuggestion = useMemo(() => {
    if (!selections.vehicles || selections.vehicles.length === 0) return false
    if (selections.vehicles.length !== suggestedVehicles.length) return false
    return suggestedVehicles.every(sv =>
      selections.vehicles.some(sel => sel.vehicleId === sv.vehicleId && sel.quantity === sv.quantity)
    )
  }, [selections.vehicles, suggestedVehicles])

  // Helper to update vehicle quantity
  const updateVehicleQuantity = (vehicleId: string, delta: number) => {
    const currentVehicles = selections.vehicles || []
    const existing = currentVehicles.find(v => v.vehicleId === vehicleId)

    if (existing) {
      const newQuantity = existing.quantity + delta
      if (newQuantity <= 0) {
        // Remove vehicle
        setVehicles(currentVehicles.filter(v => v.vehicleId !== vehicleId))
      } else {
        // Update quantity
        setVehicles(currentVehicles.map(v =>
          v.vehicleId === vehicleId ? { ...v, quantity: newQuantity } : v
        ))
      }
    } else if (delta > 0) {
      // Add new vehicle
      setVehicles([...currentVehicles, { vehicleId, quantity: delta }])
    }
  }

  // Helper to get selected quantity for a vehicle
  const getVehicleQuantity = (vehicleId: string) => {
    return (selections.vehicles || []).find(v => v.vehicleId === vehicleId)?.quantity || 0
  }

  return (
    <div className="space-y-6">
      {/* Vehicle Selection */}
      {vehicles.length > 0 && (
        <Collapsible open={vehicleExpanded} onOpenChange={setVehicleExpanded}>
          <Card className="border-border/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Car className="h-4 w-4 text-emerald-600" />
                    </div>
                    Safari Vehicles
                    {hasCapacityIssue && (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {(selections.vehicles?.length || 0) > 0 && (
                      <Badge variant="secondary">
                        {selections.vehicles?.reduce((t, v) => t + v.quantity, 0) || 0} vehicle(s)
                      </Badge>
                    )}
                    <ChevronDown className={cn("h-5 w-5 transition-transform", vehicleExpanded && "rotate-180")} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0 space-y-4">
                {/* Capacity Info */}
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  hasCapacityIssue ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-muted/50"
                )}>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>
                      Your group: <strong>{totalGroupSize}</strong> travelers
                      {currentCapacity > 0 && (
                        <> | Current capacity: <strong>{currentCapacity}</strong> seats</>
                      )}
                    </span>
                  </div>
                  {hasCapacityIssue && (
                    <p className="mt-1 text-amber-700">
                      Please add more vehicles to accommodate all travelers.
                    </p>
                  )}
                </div>

                {/* Suggestion Button */}
                {suggestedVehicles.length > 0 && !matchesSuggestion && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setVehicles(suggestedVehicles)}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    Use Recommended: {suggestedVehicles.map(sv => {
                      const v = vehicles.find(veh => veh.id === sv.vehicleId)
                      return `${sv.quantity}x ${v?.name || "Vehicle"}`
                    }).join(", ")}
                  </Button>
                )}

                <p className="text-sm text-muted-foreground">
                  Select vehicles for your group. All vehicles include a professional driver-guide.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  {vehicles.map(vehicle => {
                    const quantity = getVehicleQuantity(vehicle.id)
                    const isSelected = quantity > 0
                    const priceDiff = defaultVehicle
                      ? (vehicle.pricePerDay - defaultVehicle.pricePerDay) * (state.tour?.durationDays || 1)
                      : vehicle.pricePerDay * (state.tour?.durationDays || 1)

                    return (
                      <div
                        key={vehicle.id}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        )}
                      >
                        {vehicle.isDefault && (
                          <Badge className="absolute -top-2 left-4 text-xs">Default</Badge>
                        )}
                        {/* Vehicle Image */}
                        {vehicle.images && vehicle.images.length > 0 && (
                          <div className="relative w-full h-28 mb-3 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={vehicle.images[0]}
                              alt={vehicle.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <h4 className="font-semibold">{vehicle.name}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {vehicle.description || `${vehicle.type.replace(/_/g, " ")} - Up to ${vehicle.maxPassengers} passengers`}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{vehicle.maxPassengers} passengers max</span>
                          </div>
                          {vehicle.features.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {vehicle.features.slice(0, 3).map((feature, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="pt-2 border-t mt-2 flex items-center justify-between">
                            <div>
                              {priceDiff > 0 ? (
                                <span className="text-sm font-semibold text-primary">
                                  +{formatCurrency(priceDiff)}/vehicle
                                </span>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Included in base price
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateVehicleQuantity(vehicle.id, -1)}
                                disabled={quantity === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateVehicleQuantity(vehicle.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Accommodation Selection */}
      {accommodationOptions.length > 0 && itinerary.some(day => day.availableAccommodationIds?.length > 0) && (
        <Collapsible open={accommodationExpanded} onOpenChange={setAccommodationExpanded}>
          <Card className="border-border/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Hotel className="h-4 w-4 text-blue-600" />
                    </div>
                    Accommodations
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {Object.keys(selections.accommodations).length > 0 && (
                      <Badge variant="secondary">
                        {Object.keys(selections.accommodations).length} nights selected
                      </Badge>
                    )}
                    <ChevronDown className={cn("h-5 w-5 transition-transform", accommodationExpanded && "rotate-180")} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Select your preferred accommodation for each night of the tour.
                </p>
                <div className="space-y-4">
                  {itinerary
                    .filter(day => day.availableAccommodationIds?.length > 0)
                    .map(day => {
                      const availableAccs = accommodationOptions.filter(
                        acc => day.availableAccommodationIds.includes(acc.id)
                      )
                      const selectedAccId = selections.accommodations[day.dayNumber]

                      return (
                        <div key={day.dayNumber} className="p-4 rounded-xl bg-muted/30">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">Night {day.dayNumber}</h4>
                              <p className="text-sm text-muted-foreground">{day.location || day.title}</p>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            {availableAccs.map(acc => {
                              const isSelected = selectedAccId === acc.id ||
                                (!selectedAccId && day.defaultAccommodationId === acc.id)

                              return (
                                <div
                                  key={acc.id}
                                  onClick={() => setAccommodation(day.dayNumber, acc.id)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                                    isSelected
                                      ? "border-primary bg-primary/5"
                                      : "border-border hover:border-primary/50"
                                  )}
                                >
                                  {/* Accommodation Thumbnail */}
                                  {acc.images && acc.images.length > 0 ? (
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                                      <Image
                                        src={acc.images[0]}
                                        alt={acc.name}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                      <Hotel className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                      {isSelected && (
                                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                          <Check className="h-3 w-3 text-white" />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{acc.name}</p>
                                        <div className="flex items-center gap-2">
                                          <Badge variant="outline" className="text-xs">
                                            {acc.tier}
                                          </Badge>
                                          {acc.rating && (
                                            <span className="text-xs text-muted-foreground">
                                              {acc.rating} stars
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-sm flex-shrink-0">
                                      {formatCurrency(acc.pricePerNight)}/night
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Add-ons Selection */}
      {addonOptions.length > 0 && (
        <Collapsible open={addonsExpanded} onOpenChange={setAddonsExpanded}>
          <Card className="border-border/50">
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Ticket className="h-4 w-4 text-purple-600" />
                    </div>
                    Optional Activities
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {selections.addons.length > 0 && (
                      <Badge variant="secondary">{selections.addons.length} selected</Badge>
                    )}
                    <ChevronDown className={cn("h-5 w-5 transition-transform", addonsExpanded && "rotate-180")} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Enhance your experience with optional activities and add-ons.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {addonOptions.map(addon => {
                    const isSelected = selections.addons.some(a => a.id === addon.id)

                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={cn(
                          "relative p-4 rounded-xl border cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {addon.isPopular && (
                          <Badge className="absolute -top-2 left-4 text-xs bg-amber-500">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        )}
                        {/* Addon Image */}
                        {addon.images && addon.images.length > 0 && (
                          <div className="relative w-full h-24 mb-3 rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={addon.images[0]}
                              alt={addon.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <h4 className="font-semibold pr-8">{addon.name}</h4>
                          {addon.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {addon.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {addon.category.replace("_", " ")}
                            </Badge>
                            {addon.duration && (
                              <span className="text-xs text-muted-foreground">
                                {addon.duration}
                              </span>
                            )}
                          </div>
                          <div className="pt-2 border-t mt-2">
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(addon.price)}
                              {addon.priceType === "PER_PERSON" && " per person"}
                              {addon.priceType === "PER_GROUP" && ` per group${addon.maxCapacity ? ` (up to ${addon.maxCapacity})` : ""}`}
                            </span>
                            {addon.childPrice && addon.childPrice < addon.price && (
                              <span className="text-xs text-muted-foreground block">
                                Children: {formatCurrency(addon.childPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Empty State */}
      {vehicles.length === 0 && accommodationOptions.length === 0 && addonOptions.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">All Set!</h3>
            <p className="text-sm text-muted-foreground">
              This tour package is all-inclusive. Continue to the next step.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
