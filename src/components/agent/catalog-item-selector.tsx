"use client"

import { useState, useEffect } from "react"
import { Plus, X, Check, Search, DollarSign, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Types
interface CatalogAddon {
  id: string
  name: string
  description?: string | null
  basePrice: number
  duration?: string | null
  type: string
  category: string
  priceType: string
  childPrice?: number | null
  images: string[]
}

interface CatalogVehicle {
  id: string
  name: string
  description?: string | null
  type: string
  maxPassengers: number
  basePricePerDay: number
  features: string[]
  images: string[]
}

interface CatalogAccommodation {
  id: string
  name: string
  description?: string | null
  tier: string
  basePricePerNight: number
  location?: string | null
  rating?: number | null
  roomType?: string | null
  amenities: string[]
  images: string[]
}

interface TourAddon {
  id: string
  catalog: CatalogAddon
  priceOverride?: number | null
  childPriceOverride?: number | null
  effectivePrice: number
  dayNumbers: number[]
  isRecommended: boolean
  isActive: boolean
}

interface TourVehicle {
  id: string
  catalog: CatalogVehicle
  pricePerDayOverride?: number | null
  effectivePricePerDay: number
  isDefault: boolean
  isIncludedInBase: boolean
  isActive: boolean
}

interface TourAccommodation {
  id: string
  catalog: CatalogAccommodation
  pricePerNightOverride?: number | null
  effectivePricePerNight: number
  availableDays: number[]
  tierOverride?: string | null
  isDefault: boolean
  isActive: boolean
}

// ============================================================================
// ADDON SELECTOR
// ============================================================================
interface AddonSelectorProps {
  tourId: string
  tourDays: number
  assignedAddons: TourAddon[]
  onUpdate: () => void
}

export function AddonSelector({ tourId, tourDays, assignedAddons, onUpdate }: AddonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [catalogAddons, setCatalogAddons] = useState<CatalogAddon[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAddon, setSelectedAddon] = useState<CatalogAddon | null>(null)
  const [priceOverride, setPriceOverride] = useState<string>("")
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [isRecommended, setIsRecommended] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch catalog addons
  useEffect(() => {
    if (isOpen) {
      fetchCatalogAddons()
    }
  }, [isOpen])

  const fetchCatalogAddons = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/agent/catalog/addons?isActive=true")
      const data = await res.json()
      if (data.success) {
        setCatalogAddons(data.addons)
      }
    } catch (error) {
      console.error("Failed to fetch catalog addons:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAddon = (addon: CatalogAddon) => {
    setSelectedAddon(addon)
    setPriceOverride("")
    setSelectedDays([])
    setIsRecommended(false)
  }

  const handleAssignAddon = async () => {
    if (!selectedAddon) return

    setSaving(true)
    try {
      const res = await fetch(`/api/agent/tours/${tourId}/catalog-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "addon",
          addonCatalogId: selectedAddon.id,
          priceOverride: priceOverride ? parseFloat(priceOverride) : null,
          dayNumbers: selectedDays,
          isRecommended,
        }),
      })

      if (res.ok) {
        toast.success("Add-on assigned to tour")
        setIsOpen(false)
        setSelectedAddon(null)
        onUpdate()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to assign add-on")
      }
    } catch (error) {
      toast.error("Failed to assign add-on")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAddon = async (addonId: string) => {
    try {
      const res = await fetch(
        `/api/agent/tours/${tourId}/catalog-items?type=addon&itemId=${addonId}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        toast.success("Add-on removed from tour")
        onUpdate()
      } else {
        toast.error("Failed to remove add-on")
      }
    } catch (error) {
      toast.error("Failed to remove add-on")
    }
  }

  const filteredCatalog = catalogAddons.filter(
    (addon) =>
      addon.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !assignedAddons.some((a) => a.catalog.id === addon.id)
  )

  const dayOptions = Array.from({ length: tourDays }, (_, i) => i + 1)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Activity Add-ons</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add from Catalog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Activity from Catalog</DialogTitle>
              <DialogDescription>
                Select an add-on from your catalog and customize pricing for this tour
              </DialogDescription>
            </DialogHeader>

            {!selectedAddon ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search add-ons..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No add-ons available in catalog</p>
                    <Button
                      variant="link"
                      onClick={() => window.open("/agent/catalog/addons", "_blank")}
                    >
                      Create new add-on in catalog
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                    {filteredCatalog.map((addon) => (
                      <button
                        key={addon.id}
                        onClick={() => handleSelectAddon(addon)}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                      >
                        <div>
                          <p className="font-medium">{addon.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {addon.category} &bull; {addon.priceType.replace("_", " ")}
                          </p>
                        </div>
                        <Badge variant="secondary">${addon.basePrice}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{selectedAddon.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAddon(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Catalog Price: ${selectedAddon.basePrice}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Price Override (leave empty to use catalog price)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder={selectedAddon.basePrice.toString()}
                      value={priceOverride}
                      onChange={(e) => setPriceOverride(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {priceOverride && (
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(priceOverride) < selectedAddon.basePrice
                        ? `${Math.round(((selectedAddon.basePrice - parseFloat(priceOverride)) / selectedAddon.basePrice) * 100)}% discount`
                        : `${Math.round(((parseFloat(priceOverride) - selectedAddon.basePrice) / selectedAddon.basePrice) * 100)}% markup`}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Available Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map((day) => (
                      <Badge
                        key={day}
                        variant={selectedDays.includes(day) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedDays((prev) =>
                            prev.includes(day)
                              ? prev.filter((d) => d !== day)
                              : [...prev, day]
                          )
                        }
                      >
                        Day {day}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which days this add-on is available
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommended"
                    checked={isRecommended}
                    onCheckedChange={(checked) => setIsRecommended(!!checked)}
                  />
                  <Label htmlFor="recommended">Mark as Recommended</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignAddon}
                disabled={!selectedAddon || saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add to Tour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {assignedAddons.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No add-ons assigned to this tour
          </p>
        ) : (
          <div className="space-y-3">
            {assignedAddons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{addon.catalog.name}</p>
                    {addon.isRecommended && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      ${addon.effectivePrice}
                      {addon.priceOverride && (
                        <span className="line-through ml-1 text-xs">
                          ${addon.catalog.basePrice}
                        </span>
                      )}
                    </span>
                    {addon.dayNumbers.length > 0 && (
                      <span>Days: {addon.dayNumbers.join(", ")}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAddon(addon.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// VEHICLE SELECTOR
// ============================================================================
interface VehicleSelectorProps {
  tourId: string
  tourDays: number
  assignedVehicles: TourVehicle[]
  onUpdate: () => void
}

export function VehicleSelector({ tourId, tourDays, assignedVehicles, onUpdate }: VehicleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [catalogVehicles, setCatalogVehicles] = useState<CatalogVehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<CatalogVehicle | null>(null)
  const [priceOverride, setPriceOverride] = useState<string>("")
  const [isDefault, setIsDefault] = useState(false)
  const [isIncludedInBase, setIsIncludedInBase] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCatalogVehicles()
    }
  }, [isOpen])

  const fetchCatalogVehicles = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/agent/catalog/vehicles?isActive=true")
      const data = await res.json()
      if (data.success) {
        setCatalogVehicles(data.vehicles)
      }
    } catch (error) {
      console.error("Failed to fetch catalog vehicles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectVehicle = (vehicle: CatalogVehicle) => {
    setSelectedVehicle(vehicle)
    setPriceOverride("")
    setIsDefault(false)
    setIsIncludedInBase(false)
  }

  const handleAssignVehicle = async () => {
    if (!selectedVehicle) return

    setSaving(true)
    try {
      const res = await fetch(`/api/agent/tours/${tourId}/catalog-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "vehicle",
          vehicleCatalogId: selectedVehicle.id,
          pricePerDayOverride: priceOverride ? parseFloat(priceOverride) : null,
          isDefault,
          isIncludedInBase,
        }),
      })

      if (res.ok) {
        toast.success("Vehicle assigned to tour")
        setIsOpen(false)
        setSelectedVehicle(null)
        onUpdate()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to assign vehicle")
      }
    } catch (error) {
      toast.error("Failed to assign vehicle")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveVehicle = async (vehicleId: string) => {
    try {
      const res = await fetch(
        `/api/agent/tours/${tourId}/catalog-items?type=vehicle&itemId=${vehicleId}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        toast.success("Vehicle removed from tour")
        onUpdate()
      } else {
        toast.error("Failed to remove vehicle")
      }
    } catch (error) {
      toast.error("Failed to remove vehicle")
    }
  }

  const filteredCatalog = catalogVehicles.filter(
    (vehicle) => !assignedVehicles.some((v) => v.catalog.id === vehicle.id)
  )

  const vehicleTypeLabels: Record<string, string> = {
    SAFARI_VAN: "Safari Van",
    LAND_CRUISER: "Land Cruiser",
    EXTENDED_CRUISER: "Extended Cruiser",
    OVERLAND_TRUCK: "Overland Truck",
    PRIVATE_VEHICLE: "Private Vehicle",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Tour Vehicles</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Vehicle from Catalog</DialogTitle>
              <DialogDescription>
                Select a vehicle and set tour-specific pricing
              </DialogDescription>
            </DialogHeader>

            {!selectedVehicle ? (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No vehicles available in catalog</p>
                    <Button
                      variant="link"
                      onClick={() => window.open("/agent/catalog/vehicles", "_blank")}
                    >
                      Create new vehicle in catalog
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {filteredCatalog.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => handleSelectVehicle(vehicle)}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                      >
                        <div>
                          <p className="font-medium">{vehicle.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicleTypeLabels[vehicle.type] || vehicle.type} &bull;{" "}
                            {vehicle.maxPassengers} passengers
                          </p>
                        </div>
                        <Badge variant="secondary">${vehicle.basePricePerDay}/day</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{selectedVehicle.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVehicle(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedVehicle.maxPassengers} passengers &bull; Catalog Price: $
                    {selectedVehicle.basePricePerDay}/day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Price Override per Day</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder={selectedVehicle.basePricePerDay.toString()}
                      value={priceOverride}
                      onChange={(e) => setPriceOverride(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isDefault"
                      checked={isDefault}
                      onCheckedChange={(checked) => setIsDefault(!!checked)}
                    />
                    <Label htmlFor="isDefault">Set as Default Vehicle</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isIncluded"
                      checked={isIncludedInBase}
                      onCheckedChange={(checked) => setIsIncludedInBase(!!checked)}
                    />
                    <Label htmlFor="isIncluded">Included in Base Price</Label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignVehicle}
                disabled={!selectedVehicle || saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add to Tour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {assignedVehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No vehicles assigned to this tour
          </p>
        ) : (
          <div className="space-y-3">
            {assignedVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{vehicle.catalog.name}</p>
                    {vehicle.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                    {vehicle.isIncludedInBase && (
                      <Badge variant="secondary" className="text-xs">
                        Included
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.catalog.maxPassengers} passengers &bull; $
                    {vehicle.effectivePricePerDay}/day
                    {vehicle.pricePerDayOverride && (
                      <span className="line-through ml-1 text-xs">
                        ${vehicle.catalog.basePricePerDay}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveVehicle(vehicle.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ACCOMMODATION SELECTOR
// ============================================================================
interface AccommodationSelectorProps {
  tourId: string
  tourDays: number
  assignedAccommodations: TourAccommodation[]
  onUpdate: () => void
}

export function AccommodationSelector({
  tourId,
  tourDays,
  assignedAccommodations,
  onUpdate,
}: AccommodationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [catalogAccommodations, setCatalogAccommodations] = useState<CatalogAccommodation[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedAccommodation, setSelectedAccommodation] = useState<CatalogAccommodation | null>(null)
  const [priceOverride, setPriceOverride] = useState<string>("")
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [isDefault, setIsDefault] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCatalogAccommodations()
    }
  }, [isOpen])

  const fetchCatalogAccommodations = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/agent/catalog/accommodations?isActive=true")
      const data = await res.json()
      if (data.success) {
        setCatalogAccommodations(data.accommodations)
      }
    } catch (error) {
      console.error("Failed to fetch catalog accommodations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAccommodation = (accommodation: CatalogAccommodation) => {
    setSelectedAccommodation(accommodation)
    setPriceOverride("")
    setSelectedDays([])
    setIsDefault(false)
  }

  const handleAssignAccommodation = async () => {
    if (!selectedAccommodation) return

    setSaving(true)
    try {
      const res = await fetch(`/api/agent/tours/${tourId}/catalog-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "accommodation",
          accommodationCatalogId: selectedAccommodation.id,
          pricePerNightOverride: priceOverride ? parseFloat(priceOverride) : null,
          availableDays: selectedDays,
          isDefault,
        }),
      })

      if (res.ok) {
        toast.success("Accommodation assigned to tour")
        setIsOpen(false)
        setSelectedAccommodation(null)
        onUpdate()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to assign accommodation")
      }
    } catch (error) {
      toast.error("Failed to assign accommodation")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveAccommodation = async (accommodationId: string) => {
    try {
      const res = await fetch(
        `/api/agent/tours/${tourId}/catalog-items?type=accommodation&itemId=${accommodationId}`,
        { method: "DELETE" }
      )

      if (res.ok) {
        toast.success("Accommodation removed from tour")
        onUpdate()
      } else {
        toast.error("Failed to remove accommodation")
      }
    } catch (error) {
      toast.error("Failed to remove accommodation")
    }
  }

  const filteredCatalog = catalogAccommodations.filter(
    (acc) => !assignedAccommodations.some((a) => a.catalog.id === acc.id)
  )

  const dayOptions = Array.from({ length: tourDays }, (_, i) => i + 1)

  const tierLabels: Record<string, string> = {
    BUDGET: "Budget",
    MID_RANGE: "Mid-Range",
    LUXURY: "Luxury",
    ULTRA_LUXURY: "Ultra Luxury",
  }

  const tierColors: Record<string, string> = {
    BUDGET: "bg-gray-100 text-gray-700",
    MID_RANGE: "bg-blue-100 text-blue-700",
    LUXURY: "bg-amber-100 text-amber-700",
    ULTRA_LUXURY: "bg-purple-100 text-purple-700",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Accommodations</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Accommodation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Accommodation from Catalog</DialogTitle>
              <DialogDescription>
                Select an accommodation and set tour-specific pricing
              </DialogDescription>
            </DialogHeader>

            {!selectedAccommodation ? (
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No accommodations available in catalog</p>
                    <Button
                      variant="link"
                      onClick={() => window.open("/agent/catalog/accommodations", "_blank")}
                    >
                      Create new accommodation in catalog
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                    {filteredCatalog.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => handleSelectAccommodation(acc)}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent text-left transition-colors"
                      >
                        <div>
                          <p className="font-medium">{acc.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge className={cn("text-xs", tierColors[acc.tier])}>
                              {tierLabels[acc.tier]}
                            </Badge>
                            {acc.location && <span>{acc.location}</span>}
                          </div>
                        </div>
                        <Badge variant="secondary">${acc.basePricePerNight}/night</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{selectedAccommodation.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAccommodation(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tierLabels[selectedAccommodation.tier]} &bull; Catalog Price: $
                    {selectedAccommodation.basePricePerNight}/night
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Price Override per Night</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder={selectedAccommodation.basePricePerNight.toString()}
                      value={priceOverride}
                      onChange={(e) => setPriceOverride(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Nights</Label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map((day) => (
                      <Badge
                        key={day}
                        variant={selectedDays.includes(day) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedDays((prev) =>
                            prev.includes(day)
                              ? prev.filter((d) => d !== day)
                              : [...prev, day]
                          )
                        }
                      >
                        Night {day}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select which nights this accommodation is available
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="accDefault"
                    checked={isDefault}
                    onCheckedChange={(checked) => setIsDefault(!!checked)}
                  />
                  <Label htmlFor="accDefault">Set as Default Accommodation</Label>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAssignAccommodation}
                disabled={!selectedAccommodation || saving}
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add to Tour
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {assignedAccommodations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No accommodations assigned to this tour
          </p>
        ) : (
          <div className="space-y-3">
            {assignedAccommodations.map((acc) => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{acc.catalog.name}</p>
                    <Badge className={cn("text-xs", tierColors[acc.catalog.tier])}>
                      {tierLabels[acc.catalog.tier]}
                    </Badge>
                    {acc.isDefault && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      ${acc.effectivePricePerNight}/night
                      {acc.pricePerNightOverride && (
                        <span className="line-through ml-1 text-xs">
                          ${acc.catalog.basePricePerNight}
                        </span>
                      )}
                    </span>
                    {acc.availableDays.length > 0 && (
                      <span>Nights: {acc.availableDays.join(", ")}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAccommodation(acc.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
