"use client"

import { useState } from "react"
import { Plus, Trash2, Hotel, Star, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTourForm } from "../tour-form-context"
import {
  AccommodationTier,
  AccommodationTierLabels,
  getEnumValues,
} from "@/lib/constants"
import type { AccommodationData } from "../types"

const TIERS = getEnumValues(AccommodationTier).map((value) => ({
  value,
  label: AccommodationTierLabels[value],
}))

interface AccommodationFormData {
  name: string
  description: string
  tier: string
  pricePerNight: number
  location: string
  rating: number | null
  amenities: string[]
  roomType: string
}

const initialAccForm: AccommodationFormData = {
  name: "",
  description: "",
  tier: "MID_RANGE",
  pricePerNight: 0,
  location: "",
  rating: null,
  amenities: [],
  roomType: "",
}

export function AccommodationsStep() {
  const { formData, addAccommodation, removeAccommodation } = useTourForm()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [accForm, setAccForm] = useState<AccommodationFormData>(initialAccForm)
  const [amenityInput, setAmenityInput] = useState("")

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setAccForm((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }))
      setAmenityInput("")
    }
  }

  const handleRemoveAmenity = (index: number) => {
    setAccForm((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = () => {
    if (!accForm.name.trim()) return

    addAccommodation({
      name: accForm.name,
      description: accForm.description,
      tier: accForm.tier,
      pricePerNight: accForm.pricePerNight,
      location: accForm.location,
      rating: accForm.rating,
      amenities: accForm.amenities,
      roomType: accForm.roomType,
    })

    setAccForm(initialAccForm)
    setDialogOpen(false)
  }

  const resetForm = () => {
    setAccForm(initialAccForm)
    setAmenityInput("")
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "BUDGET":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      case "MID_RANGE":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
      case "LUXURY":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200"
      case "ULTRA_LUXURY":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Accommodation Options</h3>
          <p className="text-sm text-muted-foreground">
            Define the accommodation choices available for this tour
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Accommodation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Accommodation</DialogTitle>
              <DialogDescription>
                Add a lodge, camp, or hotel option for this tour
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>Accommodation Name *</Label>
                <Input
                  placeholder="e.g., Mara Serena Safari Lodge"
                  value={accForm.name}
                  onChange={(e) => setAccForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the accommodation and its highlights..."
                  value={accForm.description}
                  onChange={(e) => setAccForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Tier & Room Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tier *</Label>
                  <Select
                    value={accForm.tier}
                    onValueChange={(value) => setAccForm((prev) => ({ ...prev, tier: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIERS.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                          {tier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Input
                    placeholder="e.g., Double Room"
                    value={accForm.roomType}
                    onChange={(e) => setAccForm((prev) => ({ ...prev, roomType: e.target.value }))}
                  />
                </div>
              </div>

              {/* Location & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="e.g., Masai Mara"
                    value={accForm.location}
                    onChange={(e) => setAccForm((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    placeholder="4.5"
                    value={accForm.rating ?? ""}
                    onChange={(e) => setAccForm((prev) => ({ ...prev, rating: e.target.value ? parseFloat(e.target.value) : null }))}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label>Price Per Night (USD)</Label>
                <Input
                  type="number"
                  min={0}
                  value={accForm.pricePerNight}
                  onChange={(e) => setAccForm((prev) => ({ ...prev, pricePerNight: parseFloat(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">
                  Additional cost per night (0 if included in base price)
                </p>
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Swimming pool"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddAmenity())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleAddAmenity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {accForm.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {accForm.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary">
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!accForm.name.trim()}>
                Add Accommodation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accommodation List */}
      {formData.accommodations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Hotel className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="font-medium mb-1">No Accommodations Added</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add lodges, camps, or hotels for customers to choose from
            </p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Accommodation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {formData.accommodations.map((acc) => (
            <Card key={acc.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{acc.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getTierColor(acc.tier)}>
                        {AccommodationTierLabels[acc.tier as AccommodationTier] || acc.tier}
                      </Badge>
                      {acc.rating && (
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-0.5" />
                          {acc.rating}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeAccommodation(acc.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {acc.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {acc.location}
                  </div>
                )}
                <div className="text-sm font-medium">
                  {acc.pricePerNight > 0
                    ? `+$${acc.pricePerNight}/night`
                    : "Included in base price"}
                </div>
                {acc.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {acc.amenities.slice(0, 3).map((amenity, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {acc.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{acc.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
        <p className="text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Create a pool of accommodations here. In the Itinerary step,
          you&apos;ll link specific accommodations to each night of the tour.
        </p>
      </div>
    </div>
  )
}
