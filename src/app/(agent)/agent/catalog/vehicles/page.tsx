"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Loader2, Search, Trash2, Pencil, Car, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { ImageUploader } from "@/components/ui/image-uploader"

const VEHICLE_TYPES = [
  { value: "SAFARI_VAN", label: "Safari Van" },
  { value: "LAND_CRUISER", label: "Land Cruiser" },
  { value: "EXTENDED_CRUISER", label: "Extended Cruiser" },
  { value: "OVERLAND_TRUCK", label: "Overland Truck" },
  { value: "PRIVATE_VEHICLE", label: "Private Vehicle" },
]

interface Vehicle {
  id: string
  name: string
  description?: string | null
  type: string
  maxPassengers: number
  basePricePerDay: number
  currency: string
  features: string[]
  images: string[]
  isActive: boolean
  toursUsingThis: number
}

interface VehicleFormData {
  name: string
  description: string
  type: string
  maxPassengers: string
  basePricePerDay: string
  features: string
  images: string[]
}

const initialFormData: VehicleFormData = {
  name: "",
  description: "",
  type: "LAND_CRUISER",
  maxPassengers: "6",
  basePricePerDay: "",
  features: "",
  images: [],
}

export default function VehiclesCatalogPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/agent/catalog/vehicles")
      const data = await res.json()
      if (data.success) {
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error("Failed to fetch vehicles:", error)
      toast.error("Failed to load vehicles")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle)
      setFormData({
        name: vehicle.name,
        description: vehicle.description || "",
        type: vehicle.type,
        maxPassengers: vehicle.maxPassengers.toString(),
        basePricePerDay: vehicle.basePricePerDay.toString(),
        features: vehicle.features.join(", "),
        images: vehicle.images || [],
      })
    } else {
      setEditingVehicle(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.basePricePerDay || !formData.maxPassengers) {
      toast.error("Name, passengers, and price are required")
      return
    }

    setSaving(true)
    try {
      const url = editingVehicle
        ? `/api/agent/catalog/vehicles/${editingVehicle.id}`
        : "/api/agent/catalog/vehicles"
      const method = editingVehicle ? "PATCH" : "POST"

      const features = formData.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean)

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          type: formData.type,
          maxPassengers: parseInt(formData.maxPassengers),
          basePricePerDay: parseFloat(formData.basePricePerDay),
          features,
          images: formData.images,
        }),
      })

      if (res.ok) {
        toast.success(editingVehicle ? "Vehicle updated" : "Vehicle created")
        setIsDialogOpen(false)
        fetchVehicles()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save vehicle")
      }
    } catch (error) {
      toast.error("Failed to save vehicle")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (vehicle: Vehicle) => {
    try {
      const res = await fetch(`/api/agent/catalog/vehicles/${vehicle.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const data = await res.json()
        if (data.deactivated) {
          toast.success("Vehicle deactivated (in use by tours)")
        } else {
          toast.success("Vehicle deleted")
        }
        fetchVehicles()
      } else {
        toast.error("Failed to delete vehicle")
      }
    } catch (error) {
      toast.error("Failed to delete vehicle")
    }
  }

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const typeLabels: Record<string, string> = Object.fromEntries(
    VEHICLE_TYPES.map((t) => [t.value, t.label])
  )

  if (loading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/agent/catalog">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Car className="h-6 w-6 text-blue-500" />
            Vehicles Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage your fleet of safari vehicles
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
                </DialogTitle>
                <DialogDescription>
                  {editingVehicle
                    ? "Update the vehicle details"
                    : "Add a new vehicle to your fleet"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4 overflow-y-auto flex-1 pr-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Toyota Land Cruiser V8"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="4x4 safari vehicle with pop-up roof..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Vehicle Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
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

                  <div className="space-y-2">
                    <Label htmlFor="maxPassengers">Max Passengers *</Label>
                    <Input
                      id="maxPassengers"
                      type="number"
                      value={formData.maxPassengers}
                      onChange={(e) =>
                        setFormData({ ...formData, maxPassengers: e.target.value })
                      }
                      placeholder="6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePricePerDay">Price per Day (USD) *</Label>
                  <Input
                    id="basePricePerDay"
                    type="number"
                    value={formData.basePricePerDay}
                    onChange={(e) =>
                      setFormData({ ...formData, basePricePerDay: e.target.value })
                    }
                    placeholder="250"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({ ...formData, features: e.target.value })
                    }
                    placeholder="Pop-up roof, Charging ports, Cooler box, WiFi"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Images</Label>
                  <ImageUploader
                    value={formData.images}
                    onChange={(urls) => setFormData({ ...formData, images: urls })}
                    maxFiles={5}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingVehicle ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No vehicles in your catalog yet</p>
              <p className="text-sm">Add your first vehicle to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{vehicle.name}</h4>
                      <Badge variant="outline">{typeLabels[vehicle.type]}</Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {vehicle.maxPassengers}
                      </Badge>
                      {!vehicle.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    {vehicle.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {vehicle.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-medium text-primary">
                        ${vehicle.basePricePerDay}/day
                      </span>
                      {vehicle.features.length > 0 && (
                        <span className="text-muted-foreground">
                          {vehicle.features.slice(0, 3).join(", ")}
                          {vehicle.features.length > 3 && ` +${vehicle.features.length - 3} more`}
                        </span>
                      )}
                      {vehicle.toursUsingThis > 0 && (
                        <span className="text-muted-foreground">
                          Used in {vehicle.toursUsingThis} tour{vehicle.toursUsingThis !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(vehicle)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{vehicle.name}&quot;?
                            {vehicle.toursUsingThis > 0 && (
                              <span className="block mt-2 text-amber-600">
                                This vehicle is used in {vehicle.toursUsingThis} tour(s) and will be
                                deactivated instead of deleted.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(vehicle)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
