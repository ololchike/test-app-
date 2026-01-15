"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTourForm } from "../tour-form-context"
import { SEASONS } from "../types"
import {
  TourType,
  TourTypeLabels,
  getEnumValues,
} from "@/lib/constants"

const TOUR_TYPES = getEnumValues(TourType).map((value) => ({
  value,
  label: TourTypeLabels[value],
}))

export function FeaturesStep() {
  const { formData, updateFormData, toggleArrayItem, addListItem, removeListItem, errors } = useTourForm()

  const [highlightInput, setHighlightInput] = useState("")
  const [includedInput, setIncludedInput] = useState("")
  const [excludedInput, setExcludedInput] = useState("")
  const [customTourTypeInput, setCustomTourTypeInput] = useState("")

  const handleAddListItem = (
    field: "highlights" | "included" | "excluded",
    value: string,
    setter: (val: string) => void
  ) => {
    if (value.trim()) {
      addListItem(field, value)
      setter("")
    }
  }

  const handleAddCustomTourType = () => {
    if (customTourTypeInput.trim()) {
      // Convert to uppercase snake case for consistency
      const customValue = customTourTypeInput.trim().toUpperCase().replace(/\s+/g, "_")
      if (!formData.tourType.includes(customValue)) {
        updateFormData("tourType", [...formData.tourType, customValue])
      }
      setCustomTourTypeInput("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Tour Types */}
      <div className="space-y-3">
        <Label>Tour Types *</Label>
        <p className="text-sm text-muted-foreground">
          Select all that apply to your tour
        </p>
        <div className="flex flex-wrap gap-2">
          {TOUR_TYPES.map((type) => (
            <Badge
              key={type.value}
              variant={formData.tourType.includes(type.value) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors hover:bg-primary/90",
                formData.tourType.includes(type.value) && "bg-primary"
              )}
              onClick={() => toggleArrayItem("tourType", type.value)}
            >
              {type.label}
            </Badge>
          ))}
        </div>

        {/* Custom tour type input */}
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add custom type..."
            value={customTourTypeInput}
            onChange={(e) => setCustomTourTypeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomTourType())}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddCustomTourType}
            disabled={!customTourTypeInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {errors.tourType && (
          <p className="text-sm text-destructive">{errors.tourType}</p>
        )}
      </div>

      {/* Best Season */}
      <div className="space-y-3">
        <Label>Best Season to Visit</Label>
        <p className="text-sm text-muted-foreground">
          When is the best time to experience this tour?
        </p>
        <div className="flex flex-wrap gap-2">
          {SEASONS.map((season) => (
            <Badge
              key={season}
              variant={formData.bestSeason.includes(season) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-colors hover:bg-primary/90",
                formData.bestSeason.includes(season) && "bg-primary"
              )}
              onClick={() => toggleArrayItem("bestSeason", season)}
            >
              {season}
            </Badge>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-3">
        <Label>Tour Highlights</Label>
        <p className="text-sm text-muted-foreground">
          Key experiences and attractions
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Witness the Great Migration"
            value={highlightInput}
            onChange={(e) => setHighlightInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("highlights", highlightInput, setHighlightInput))}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleAddListItem("highlights", highlightInput, setHighlightInput)}
            disabled={!highlightInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.highlights.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.highlights.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1 px-2">
                {item}
                <button
                  type="button"
                  onClick={() => removeListItem("highlights", index)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* What's Included */}
      <div className="space-y-3">
        <Label>What&apos;s Included</Label>
        <p className="text-sm text-muted-foreground">
          Services and amenities included in the price
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., All park entrance fees"
            value={includedInput}
            onChange={(e) => setIncludedInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("included", includedInput, setIncludedInput))}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleAddListItem("included", includedInput, setIncludedInput)}
            disabled={!includedInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.included.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.included.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1 px-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                {item}
                <button
                  type="button"
                  onClick={() => removeListItem("included", index)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* What's Excluded */}
      <div className="space-y-3">
        <Label>What&apos;s Not Included</Label>
        <p className="text-sm text-muted-foreground">
          Items not covered in the tour price
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., International flights"
            value={excludedInput}
            onChange={(e) => setExcludedInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddListItem("excluded", excludedInput, setExcludedInput))}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleAddListItem("excluded", excludedInput, setExcludedInput)}
            disabled={!excludedInput.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.excluded.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.excluded.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1 px-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800">
                {item}
                <button
                  type="button"
                  onClick={() => removeListItem("excluded", index)}
                  className="ml-2 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
