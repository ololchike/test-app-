"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Loader2, Search, Trash2, Pencil, Hotel, Star, MapPin } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { ImageUploader } from "@/components/ui/image-uploader"

const ACCOMMODATION_TIERS = [
  { value: "BUDGET", label: "Budget" },
  { value: "MID_RANGE", label: "Mid-Range" },
  { value: "LUXURY", label: "Luxury" },
  { value: "ULTRA_LUXURY", label: "Ultra Luxury" },
]

const ROOM_TYPES = [
  { value: "SINGLE", label: "Single" },
  { value: "DOUBLE", label: "Double" },
  { value: "TWIN", label: "Twin" },
  { value: "TRIPLE", label: "Triple" },
  { value: "FAMILY", label: "Family" },
  { value: "SUITE", label: "Suite" },
  { value: "TENT", label: "Tent" },
  { value: "COTTAGE", label: "Cottage" },
  { value: "AIRBNB", label: "Airbnb" },
]

interface Accommodation {
  id: string
  name: string
  description?: string | null
  tier: string
  basePricePerNight: number
  currency: string
  location?: string | null
  rating?: number | null
  roomType?: string | null
  numberOfRooms?: number | null
  numberOfBeds?: number | null
  amenities: string[]
  images: string[]
  isActive: boolean
  toursUsingThis: number
}

interface AccommodationFormData {
  name: string
  description: string
  tier: string
  basePricePerNight: string
  location: string
  rating: string
  roomType: string
  numberOfRooms: string
  numberOfBeds: string
  amenities: string
  images: string[]
}

const initialFormData: AccommodationFormData = {
  name: "",
  description: "",
  tier: "MID_RANGE",
  basePricePerNight: "",
  location: "",
  rating: "",
  roomType: "DOUBLE",
  numberOfRooms: "",
  numberOfBeds: "",
  amenities: "",
  images: [],
}

export default function AccommodationsCatalogPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | null>(null)
  const [formData, setFormData] = useState<AccommodationFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAccommodations()
  }, [])

  const fetchAccommodations = async () => {
    try {
      const res = await fetch("/api/agent/catalog/accommodations")
      const data = await res.json()
      if (data.success) {
        setAccommodations(data.accommodations)
      }
    } catch (error) {
      console.error("Failed to fetch accommodations:", error)
      toast.error("Failed to load accommodations")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (accommodation?: Accommodation) => {
    if (accommodation) {
      setEditingAccommodation(accommodation)
      setFormData({
        name: accommodation.name,
        description: accommodation.description || "",
        tier: accommodation.tier,
        basePricePerNight: accommodation.basePricePerNight.toString(),
        location: accommodation.location || "",
        rating: accommodation.rating?.toString() || "",
        roomType: accommodation.roomType || "DOUBLE",
        numberOfRooms: accommodation.numberOfRooms?.toString() || "",
        numberOfBeds: accommodation.numberOfBeds?.toString() || "",
        amenities: accommodation.amenities.join(", "),
        images: accommodation.images || [],
      })
    } else {
      setEditingAccommodation(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.basePricePerNight) {
      toast.error("Name and price are required")
      return
    }

    setSaving(true)
    try {
      const url = editingAccommodation
        ? `/api/agent/catalog/accommodations/${editingAccommodation.id}`
        : "/api/agent/catalog/accommodations"
      const method = editingAccommodation ? "PATCH" : "POST"

      const amenities = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean)

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          tier: formData.tier,
          basePricePerNight: parseFloat(formData.basePricePerNight),
          location: formData.location || null,
          rating: formData.rating ? parseFloat(formData.rating) : null,
          roomType: formData.roomType || null,
          numberOfRooms: formData.numberOfRooms ? parseInt(formData.numberOfRooms) : null,
          numberOfBeds: formData.numberOfBeds ? parseInt(formData.numberOfBeds) : null,
          amenities,
          images: formData.images,
        }),
      })

      if (res.ok) {
        toast.success(editingAccommodation ? "Accommodation updated" : "Accommodation created")
        setIsDialogOpen(false)
        fetchAccommodations()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save accommodation")
      }
    } catch (error) {
      toast.error("Failed to save accommodation")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (accommodation: Accommodation) => {
    try {
      const res = await fetch(`/api/agent/catalog/accommodations/${accommodation.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const data = await res.json()
        if (data.deactivated) {
          toast.success("Accommodation deactivated (in use by tours)")
        } else {
          toast.success("Accommodation deleted")
        }
        fetchAccommodations()
      } else {
        toast.error("Failed to delete accommodation")
      }
    } catch (error) {
      toast.error("Failed to delete accommodation")
    }
  }

  const filteredAccommodations = accommodations.filter(
    (acc) =>
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.tier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tierLabels: Record<string, string> = Object.fromEntries(
    ACCOMMODATION_TIERS.map((t) => [t.value, t.label])
  )

  const tierColors: Record<string, string> = {
    BUDGET: "bg-gray-100 text-gray-700",
    MID_RANGE: "bg-blue-100 text-blue-700",
    LUXURY: "bg-amber-100 text-amber-700",
    ULTRA_LUXURY: "bg-purple-100 text-purple-700",
  }

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
            <Hotel className="h-6 w-6 text-amber-500" />
            Accommodations Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage your catalog of lodges, camps, and hotels
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search accommodations..."
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
                Add Accommodation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingAccommodation ? "Edit Accommodation" : "Add Accommodation"}
                </DialogTitle>
                <DialogDescription>
                  {editingAccommodation
                    ? "Update the accommodation details"
                    : "Add a new lodge, camp, or hotel to your catalog"}
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
                    placeholder="Serena Safari Lodge"
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
                    placeholder="Luxury lodge overlooking the savannah..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tier">Tier *</Label>
                    <Select
                      value={formData.tier}
                      onValueChange={(value) =>
                        setFormData({ ...formData, tier: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCOMMODATION_TIERS.map((tier) => (
                          <SelectItem key={tier.value} value={tier.value}>
                            {tier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomType">Room Type</Label>
                    <Select
                      value={formData.roomType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, roomType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Show numberOfRooms for AIRBNB type */}
                {formData.roomType === "AIRBNB" && (
                  <div className="space-y-2">
                    <Label htmlFor="numberOfRooms">Number of Rooms *</Label>
                    <Input
                      id="numberOfRooms"
                      type="number"
                      min="1"
                      value={formData.numberOfRooms}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfRooms: e.target.value })
                      }
                      placeholder="3"
                    />
                    <p className="text-xs text-muted-foreground">
                      Total number of rooms in the property
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numberOfBeds">Number of Beds</Label>
                    <Input
                      id="numberOfBeds"
                      type="number"
                      min="1"
                      value={formData.numberOfBeds}
                      onChange={(e) =>
                        setFormData({ ...formData, numberOfBeds: e.target.value })
                      }
                      placeholder="2"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value })
                      }
                      placeholder="4.5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePricePerNight">Price per Night (USD) *</Label>
                  <Input
                    id="basePricePerNight"
                    type="number"
                    value={formData.basePricePerNight}
                    onChange={(e) =>
                      setFormData({ ...formData, basePricePerNight: e.target.value })
                    }
                    placeholder="350"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Masai Mara, Kenya"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Textarea
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) =>
                      setFormData({ ...formData, amenities: e.target.value })
                    }
                    placeholder="Pool, Spa, Restaurant, WiFi, Bar, Game Drives"
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
                  {editingAccommodation ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {filteredAccommodations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No accommodations in your catalog yet</p>
              <p className="text-sm">Add your first accommodation to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAccommodations.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{acc.name}</h4>
                      <Badge className={cn("text-xs", tierColors[acc.tier])}>
                        {tierLabels[acc.tier]}
                      </Badge>
                      {acc.rating && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {acc.rating}
                        </span>
                      )}
                      {!acc.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    {acc.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {acc.location}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-medium text-primary">
                        ${acc.basePricePerNight}/night
                      </span>
                      {acc.amenities.length > 0 && (
                        <span className="text-muted-foreground">
                          {acc.amenities.slice(0, 3).join(", ")}
                          {acc.amenities.length > 3 && ` +${acc.amenities.length - 3} more`}
                        </span>
                      )}
                      {acc.toursUsingThis > 0 && (
                        <span className="text-muted-foreground">
                          Used in {acc.toursUsingThis} tour{acc.toursUsingThis !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(acc)}
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
                          <AlertDialogTitle>Delete Accommodation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{acc.name}&quot;?
                            {acc.toursUsingThis > 0 && (
                              <span className="block mt-2 text-amber-600">
                                This accommodation is used in {acc.toursUsingThis} tour(s) and will be
                                deactivated instead of deleted.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(acc)}
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
