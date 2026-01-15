"use client"

import { useState } from "react"
import { Plus, Trash2, Calendar, MapPin, Utensils, Hotel, Sparkles, ChevronDown, ChevronUp, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useTourForm } from "../tour-form-context"
import { MEAL_OPTIONS } from "../types"
import {
  AccommodationTier,
  AccommodationTierLabels,
} from "@/lib/constants"

export function ItineraryStep() {
  const {
    formData,
    addItineraryDay,
    updateItineraryDay,
    removeItineraryDay,
    toggleMeal,
    addActivity,
    removeActivity,
    toggleDayAccommodation,
    setDefaultAccommodation,
    toggleDayAddon,
  } = useTourForm()

  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())
  const [activityInputs, setActivityInputs] = useState<Record<string, string>>({})

  const toggleExpanded = (dayId: string) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayId)) {
        next.delete(dayId)
      } else {
        next.add(dayId)
      }
      return next
    })
  }

  const handleAddActivity = (dayId: string) => {
    const activity = activityInputs[dayId]
    if (activity?.trim()) {
      addActivity(dayId, activity)
      setActivityInputs((prev) => ({ ...prev, [dayId]: "" }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Day-by-Day Itinerary</h3>
          <p className="text-sm text-muted-foreground">
            Plan each day of the tour with activities, meals, and accommodations
          </p>
        </div>
        <Button onClick={addItineraryDay}>
          <Plus className="h-4 w-4 mr-2" />
          Add Day
        </Button>
      </div>

      {/* Quick add based on duration */}
      {formData.itinerary.length === 0 && formData.durationDays > 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <h4 className="font-medium mb-1">No Days Added</h4>
            <p className="text-sm text-muted-foreground mb-4">
              You have a {formData.durationDays}-day tour. Add days to create your itinerary.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addItineraryDay}>
                <Plus className="h-4 w-4 mr-2" />
                Add One Day
              </Button>
              <Button
                onClick={() => {
                  for (let i = 0; i < formData.durationDays; i++) {
                    addItineraryDay()
                  }
                }}
              >
                Add All {formData.durationDays} Days
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Itinerary Days */}
      <div className="space-y-4">
        {formData.itinerary.map((day) => {
          const isExpanded = expandedDays.has(day.id)
          const defaultAcc = formData.accommodations.find((a) => a.id === day.defaultAccommodationId)

          return (
            <Collapsible
              key={day.id}
              open={isExpanded}
              onOpenChange={() => toggleExpanded(day.id)}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {day.dayNumber}
                        </div>
                        <div>
                          <CardTitle className="text-base">{day.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
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
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {day.meals.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {day.meals.length} meals
                          </Badge>
                        )}
                        {day.availableAddonIds.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {day.availableAddonIds.length} add-ons
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <CardContent className="space-y-6 pt-0">
                    {/* Title & Location */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Day Title</Label>
                        <Input
                          value={day.title}
                          onChange={(e) => updateItineraryDay(day.id, { title: e.target.value })}
                          placeholder="e.g., Arrival in Nairobi"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={day.location}
                          onChange={(e) => updateItineraryDay(day.id, { location: e.target.value })}
                          placeholder="e.g., Masai Mara National Reserve"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Day Description</Label>
                      <Textarea
                        value={day.description}
                        onChange={(e) => updateItineraryDay(day.id, { description: e.target.value })}
                        placeholder="Describe what happens on this day..."
                        rows={3}
                      />
                    </div>

                    {/* Meals */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        Meals Included
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {MEAL_OPTIONS.map((meal) => (
                          <Badge
                            key={meal}
                            variant={day.meals.includes(meal) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => toggleMeal(day.id, meal)}
                          >
                            {meal}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Activities */}
                    <div className="space-y-2">
                      <Label>Planned Activities</Label>
                      <div className="flex gap-2">
                        <Input
                          value={activityInputs[day.id] || ""}
                          onChange={(e) => setActivityInputs((prev) => ({ ...prev, [day.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddActivity(day.id))}
                          placeholder="e.g., Morning game drive"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => handleAddActivity(day.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {day.activities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {day.activities.map((activity, idx) => (
                            <Badge key={idx} variant="secondary">
                              {activity}
                              <button
                                type="button"
                                onClick={() => removeActivity(day.id, idx)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Accommodations for this night */}
                    {formData.accommodations.length > 0 && (
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Hotel className="h-4 w-4" />
                          Overnight Accommodation Options
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Select which accommodations are available this night
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {formData.accommodations.map((acc) => {
                            const isSelected = day.availableAccommodationIds.includes(acc.id)
                            const isDefault = day.defaultAccommodationId === acc.id

                            return (
                              <div
                                key={acc.id}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                                  isSelected ? "border-primary bg-primary/5" : "border-border"
                                )}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleDayAccommodation(day.id, acc.id)}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm truncate">{acc.name}</span>
                                    {isDefault && (
                                      <Badge variant="default" className="text-xs shrink-0">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {AccommodationTierLabels[acc.tier as AccommodationTier] || acc.tier}
                                    {acc.pricePerNight > 0 && ` • +$${acc.pricePerNight}/night`}
                                  </div>
                                  {isSelected && !isDefault && (
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="h-auto p-0 text-xs"
                                      onClick={() => setDefaultAccommodation(day.id, acc.id)}
                                    >
                                      Set as default
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Add-ons for this day */}
                    {formData.addons.length > 0 && (
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Available Add-ons for This Day
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Select which optional activities are available on this day
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {formData.addons.map((addon) => {
                            const isSelected = day.availableAddonIds.includes(addon.id)

                            return (
                              <div
                                key={addon.id}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                                  isSelected ? "border-primary bg-primary/5" : "border-border"
                                )}
                                onClick={() => toggleDayAddon(day.id, addon.id)}
                              >
                                <Checkbox checked={isSelected} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm truncate">{addon.name}</span>
                                    {addon.isPopular && (
                                      <Badge variant="secondary" className="text-xs shrink-0 bg-amber-100 text-amber-800">
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    ${addon.price}
                                    {addon.duration && ` • ${addon.duration}`}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delete Day */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItineraryDay(day.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Day
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      {formData.itinerary.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={addItineraryDay}>
            <Plus className="h-4 w-4 mr-2" />
            Add Another Day
          </Button>
        </div>
      )}
    </div>
  )
}
