"use client"

import { useState } from "react"
import { Plus, Trash2, Sparkles, Clock, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
import type { AddonData } from "../types"

const ADDON_TYPES = [
  { value: "ACTIVITY", label: "Activity" },
  { value: "SERVICE", label: "Service" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "UPGRADE", label: "Upgrade" },
]

const ADDON_CATEGORIES = [
  { value: "ADVENTURE", label: "Adventure" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "WILDLIFE", label: "Wildlife" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "WELLNESS", label: "Wellness" },
  { value: "DINING", label: "Dining" },
]

const PRICE_TYPES = [
  { value: "PER_PERSON", label: "Per Person" },
  { value: "PER_GROUP", label: "Per Group" },
  { value: "FLAT", label: "Flat Rate" },
]

interface AddonFormData {
  name: string
  description: string
  price: number
  duration: string
  maxCapacity: number | null
  dayAvailable: number[]
  type: string
  category: string
  priceType: "PER_PERSON" | "PER_GROUP" | "FLAT"
  childPrice: number | null
  isPopular: boolean
}

const initialAddonForm: AddonFormData = {
  name: "",
  description: "",
  price: 0,
  duration: "",
  maxCapacity: null,
  dayAvailable: [],
  type: "ACTIVITY",
  category: "ADVENTURE",
  priceType: "PER_PERSON",
  childPrice: null,
  isPopular: false,
}

export function AddonsStep() {
  const { formData, addAddon, removeAddon } = useTourForm()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addonForm, setAddonForm] = useState<AddonFormData>(initialAddonForm)

  const handleSubmit = () => {
    if (!addonForm.name.trim()) return

    addAddon({
      name: addonForm.name,
      description: addonForm.description,
      price: addonForm.price,
      duration: addonForm.duration,
      maxCapacity: addonForm.maxCapacity,
      dayAvailable: addonForm.dayAvailable,
      type: addonForm.type,
      category: addonForm.category,
      priceType: addonForm.priceType,
      childPrice: addonForm.childPrice,
      isPopular: addonForm.isPopular,
    })

    setAddonForm(initialAddonForm)
    setDialogOpen(false)
  }

  const resetForm = () => {
    setAddonForm(initialAddonForm)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ADVENTURE":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200"
      case "CULTURAL":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200"
      case "WILDLIFE":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
      case "TRANSFER":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
      case "EQUIPMENT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200"
      case "WELLNESS":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-200"
      case "DINING":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Activity Add-ons</h3>
          <p className="text-sm text-muted-foreground">
            Define optional activities and upgrades customers can add
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Activity / Add-on</DialogTitle>
              <DialogDescription>
                Create an optional activity or upgrade for this tour
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label>Activity Name *</Label>
                <Input
                  placeholder="e.g., Hot Air Balloon Safari"
                  value={addonForm.name}
                  onChange={(e) => setAddonForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what's included in this activity..."
                  value={addonForm.description}
                  onChange={(e) => setAddonForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={addonForm.type}
                    onValueChange={(value) => setAddonForm((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDON_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={addonForm.category}
                    onValueChange={(value) => setAddonForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDON_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (USD) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={addonForm.price}
                    onChange={(e) => setAddonForm((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price Type</Label>
                  <Select
                    value={addonForm.priceType}
                    onValueChange={(value) => setAddonForm((prev) => ({ ...prev, priceType: value as AddonFormData["priceType"] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Child Price (optional) */}
              {addonForm.priceType === "PER_PERSON" && (
                <div className="space-y-2">
                  <Label>Child Price (Optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Leave empty to use adult price"
                    value={addonForm.childPrice ?? ""}
                    onChange={(e) => setAddonForm((prev) => ({ ...prev, childPrice: e.target.value ? parseFloat(e.target.value) : null }))}
                  />
                </div>
              )}

              {/* Duration & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input
                    placeholder="e.g., 2 hours"
                    value={addonForm.duration}
                    onChange={(e) => setAddonForm((prev) => ({ ...prev, duration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Capacity</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Leave empty for unlimited"
                    value={addonForm.maxCapacity ?? ""}
                    onChange={(e) => setAddonForm((prev) => ({ ...prev, maxCapacity: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>
              </div>

              {/* Popular Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <Label className="text-sm">Mark as Popular</Label>
                  <p className="text-xs text-muted-foreground">
                    Highlighted to customers as recommended
                  </p>
                </div>
                <Switch
                  checked={addonForm.isPopular}
                  onCheckedChange={(checked) => setAddonForm((prev) => ({ ...prev, isPopular: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!addonForm.name.trim()}>
                Add Activity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addon List */}
      {formData.addons.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="font-medium mb-1">No Add-ons Created</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add optional activities to enhance the tour experience
            </p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Activity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formData.addons.map((addon) => (
            <Card key={addon.id} className="relative">
              {addon.isPopular && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500">
                  Popular
                </Badge>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium">{addon.name}</CardTitle>
                    <Badge className={getCategoryColor(addon.category || "ADVENTURE")} variant="secondary">
                      {addon.category || "Activity"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeAddon(addon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="text-lg font-semibold text-primary">
                  ${addon.price}
                  <span className="text-xs font-normal text-muted-foreground ml-1">
                    /{addon.priceType === "PER_PERSON" ? "person" : addon.priceType === "PER_GROUP" ? "group" : "flat"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {addon.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {addon.duration}
                    </span>
                  )}
                  {addon.maxCapacity && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Max {addon.maxCapacity}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
        <p className="text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Create a pool of add-ons here. In the Itinerary step,
          you&apos;ll link specific activities to each day of the tour.
        </p>
      </div>
    </div>
  )
}
