"use client"

import { MapPin, Clock, Users, DollarSign, Calendar, Hotel, Sparkles, Car, Check, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTourForm } from "../tour-form-context"
import { VEHICLE_TYPE_LABELS } from "../types"
import {
  TourType,
  TourTypeLabels,
  DifficultyLevel,
  DifficultyLevelLabels,
  AccommodationTier,
  AccommodationTierLabels,
} from "@/lib/constants"

export function ReviewStep() {
  const { formData } = useTourForm()

  const warnings: string[] = []

  // Validation warnings
  if (!formData.coverImage) {
    warnings.push("No cover image uploaded")
  }
  if (formData.itinerary.length === 0) {
    warnings.push("No itinerary days added")
  }
  if (formData.itinerary.length !== formData.durationDays) {
    warnings.push(`Itinerary has ${formData.itinerary.length} days but tour duration is ${formData.durationDays} days`)
  }
  if (formData.accommodations.length === 0) {
    warnings.push("No accommodation options added")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review Your Tour</h3>
        <p className="text-sm text-muted-foreground">
          Please review all details before submitting
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Some items need attention:
                </p>
                <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  {warnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {formData.coverImage && (
              <img
                src={formData.coverImage}
                alt="Cover"
                className="w-32 h-24 object-cover rounded-lg shrink-0"
              />
            )}
            <div className="space-y-1 min-w-0">
              <h4 className="font-semibold text-lg truncate">{formData.title || "Untitled Tour"}</h4>
              {formData.subtitle && (
                <p className="text-sm text-muted-foreground">{formData.subtitle}</p>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{formData.country}</Badge>
                <span className="text-muted-foreground">{formData.destination}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formData.durationDays} days / {formData.durationNights} nights</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Max {formData.maxGroupSize} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>${formData.basePrice} per person</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Difficulty:</span>
              <span>{DifficultyLevelLabels[formData.difficulty as DifficultyLevel] || formData.difficulty}</span>
            </div>
          </div>

          {/* Tour Types */}
          {formData.tourType.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tourType.map((type) => (
                <Badge key={type} variant="outline">
                  {TourTypeLabels[type as TourType] || type}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Adult Price</span>
              <p className="font-medium">${formData.basePrice}</p>
            </div>
            {formData.childPrice && (
              <div>
                <span className="text-muted-foreground">Child Price</span>
                <p className="font-medium">${formData.childPrice}</p>
              </div>
            )}
            {formData.infantPrice !== null && (
              <div>
                <span className="text-muted-foreground">Infant Price</span>
                <p className="font-medium">${formData.infantPrice}</p>
              </div>
            )}
            {formData.singleSupplement && (
              <div>
                <span className="text-muted-foreground">Single Supplement</span>
                <p className="font-medium">+${formData.singleSupplement}</p>
              </div>
            )}
          </div>

          {formData.depositEnabled && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm">
                <Check className="h-4 w-4 inline mr-1 text-green-600" />
                Deposit payment enabled: <strong>{formData.depositPercentage}%</strong> deposit required
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Free cancellation up to {formData.freeCancellationDays} days before
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicles */}
      {formData.vehicles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicles ({formData.vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {formData.vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{vehicle.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {VEHICLE_TYPE_LABELS[vehicle.type]} • Max {vehicle.maxPassengers} pax
                    </p>
                  </div>
                  <div className="text-right">
                    {vehicle.isDefault ? (
                      <Badge>Default</Badge>
                    ) : (
                      <span className="text-sm font-medium">
                        +${vehicle.pricePerDay}/day
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accommodations */}
      {formData.accommodations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Accommodations ({formData.accommodations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {formData.accommodations.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{acc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {AccommodationTierLabels[acc.tier as AccommodationTier] || acc.tier}
                      {acc.location && ` • ${acc.location}`}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    {acc.pricePerNight > 0 ? `+$${acc.pricePerNight}/night` : "Included"}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add-ons */}
      {formData.addons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Activity Add-ons ({formData.addons.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {formData.addons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {addon.duration && `${addon.duration} • `}
                      {addon.priceType === "PER_PERSON" ? "Per person" : addon.priceType === "PER_GROUP" ? "Per group" : "Flat rate"}
                    </p>
                  </div>
                  <div className="text-sm font-medium">${addon.price}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Itinerary Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Itinerary ({formData.itinerary.length} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.itinerary.length === 0 ? (
            <p className="text-sm text-muted-foreground">No itinerary days added yet</p>
          ) : (
            <div className="space-y-2">
              {formData.itinerary.map((day) => {
                const defaultAcc = formData.accommodations.find((a) => a.id === day.defaultAccommodationId)
                const dayAddons = formData.addons.filter((a) => day.availableAddonIds.includes(a.id))

                return (
                  <div
                    key={day.id}
                    className="flex gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                      {day.dayNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{day.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        {day.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {day.location}
                          </span>
                        )}
                        {defaultAcc && (
                          <span className="flex items-center gap-1">
                            <Hotel className="h-3 w-3" />
                            {defaultAcc.name}
                          </span>
                        )}
                        {day.meals.length > 0 && (
                          <span>{day.meals.join(", ")}</span>
                        )}
                        {dayAddons.length > 0 && (
                          <span>{dayAddons.length} add-on{dayAddons.length > 1 ? "s" : ""} available</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Highlights & Included/Excluded */}
      <div className="grid gap-6 sm:grid-cols-2">
        {formData.highlights.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm space-y-1">
                {formData.highlights.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {formData.included.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-700 dark:text-green-400">
                  Included ({formData.included.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  {formData.included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {formData.excluded.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-red-700 dark:text-red-400">
                  Not Included ({formData.excluded.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {formData.excluded.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Gallery Images Count */}
      <div className="text-sm text-muted-foreground">
        <strong>{formData.images.length}</strong> gallery images uploaded
        {formData.videoUrl && (
          <span> • Video URL added</span>
        )}
      </div>
    </div>
  )
}
