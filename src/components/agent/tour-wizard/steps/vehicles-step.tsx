"use client"

import { useState } from "react"
import { Plus, Trash2, Car, Check, Star, Users } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useTourForm } from "../tour-form-context"
import { VEHICLE_TYPE_LABELS, VEHICLE_DEFAULTS, type VehicleType, type VehicleData } from "../types"

const VEHICLE_TYPES = Object.entries(VEHICLE_TYPE_LABELS).map(([value, label]) => ({
  value: value as VehicleType,
  label,
}))

interface VehicleFormData {
  type: VehicleType
  name: string
  description: string
  maxPassengers: number
  pricePerDay: number
  features: string[]
  isDefault: boolean
  isActive: boolean
}

const initialVehicleForm: VehicleFormData = {
  type: "SAFARI_VAN",
  name: "",
  description: "",
  maxPassengers: 7,
  pricePerDay: 0,
  features: [],
  isDefault: false,
  isActive: true,
}

export function VehiclesStep() {
  const { formData, addVehicle, removeVehicle, setDefaultVehicle } = useTourForm()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [vehicleForm, setVehicleForm] = useState<VehicleFormData>(initialVehicleForm)
  const [featureInput, setFeatureInput] = useState("")

  const handleTypeChange = (type: VehicleType) => {
    const defaults = VEHICLE_DEFAULTS[type]
    setVehicleForm((prev) => ({
      ...prev,
      type,
      name: defaults.name || prev.name,
      maxPassengers: defaults.maxPassengers || prev.maxPassengers,
      features: defaults.features || prev.features,
    }))
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setVehicleForm((prev) => ({
        ...prev,
        features: [...prev.features, featureInput.trim()],
      }))
      setFeatureInput("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setVehicleForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = () => {
    if (!vehicleForm.name.trim()) return

    addVehicle({
      type: vehicleForm.type,
      name: vehicleForm.name,
      description: vehicleForm.description,
      maxPassengers: vehicleForm.maxPassengers,
      pricePerDay: vehicleForm.pricePerDay,
      features: vehicleForm.features,
      images: [],
      isDefault: formData.vehicles.length === 0 ? true : vehicleForm.isDefault,
      isActive: vehicleForm.isActive,
    })

    setVehicleForm(initialVehicleForm)
    setDialogOpen(false)
  }

  const resetForm = () => {
    setVehicleForm(initialVehicleForm)
    setFeatureInput("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Safari Vehicles</h3>
          <p className="text-sm text-muted-foreground">
            Define the vehicle options available for this tour
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Vehicle Option</DialogTitle>
              <DialogDescription>
                Configure a vehicle type that customers can choose for this tour
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Vehicle Type */}
              <div className="space-y-2">
                <Label>Vehicle Type</Label>
                <Select
                  value={vehicleForm.type}
                  onValueChange={(value) => handleTypeChange(value as VehicleType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Name */}
              <div className="space-y-2">
                <Label>Vehicle Name *</Label>
                <Input
                  placeholder="e.g., Toyota Land Cruiser 4x4"
                  value={vehicleForm.name}
                  onChange={(e) => setVehicleForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the vehicle and its benefits..."
                  value={vehicleForm.description}
                  onChange={(e) => setVehicleForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Capacity & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Passengers</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={vehicleForm.maxPassengers}
                    onChange={(e) => setVehicleForm((prev) => ({ ...prev, maxPassengers: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price Per Day (USD)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={vehicleForm.pricePerDay}
                    onChange={(e) => setVehicleForm((prev) => ({ ...prev, pricePerDay: parseFloat(e.target.value) || 0 }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Additional cost per day (0 for included)
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Pop-up roof"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddFeature())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={handleAddFeature}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {vehicleForm.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vehicleForm.features.map((feature, index) => (
                      <Badge key={index} variant="secondary">
                        {feature}
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Default Toggle */}
              {formData.vehicles.length > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <Label className="text-sm">Set as Default</Label>
                    <p className="text-xs text-muted-foreground">
                      Pre-selected for customers
                    </p>
                  </div>
                  <Switch
                    checked={vehicleForm.isDefault}
                    onCheckedChange={(checked) => setVehicleForm((prev) => ({ ...prev, isDefault: checked }))}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!vehicleForm.name.trim()}>
                Add Vehicle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle List */}
      {formData.vehicles.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="font-medium mb-1">No Vehicles Added</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add vehicle options for customers to choose from
            </p>
            <Button variant="outline" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {formData.vehicles.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={cn(
                "relative transition-all",
                vehicle.isDefault && "ring-2 ring-primary"
              )}
            >
              {vehicle.isDefault && (
                <Badge className="absolute -top-2 -right-2 bg-primary">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{vehicle.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {VEHICLE_TYPE_LABELS[vehicle.type]}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeVehicle(vehicle.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Max {vehicle.maxPassengers} pax</span>
                  </div>
                  <div className="font-medium">
                    {vehicle.pricePerDay > 0
                      ? `+$${vehicle.pricePerDay}/day`
                      : "Included"}
                  </div>
                </div>

                {vehicle.features.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {vehicle.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {vehicle.features.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{vehicle.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {!vehicle.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setDefaultVehicle(vehicle.id)}
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Help text */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
        <p className="text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Adding multiple vehicle options lets customers upgrade their experience.
          The default vehicle is included in the base price; others can have additional daily charges.
        </p>
      </div>
    </div>
  )
}
