"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Loader2, Search, Trash2, Pencil, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Addon {
  id: string
  name: string
  description?: string | null
  basePrice: number
  duration?: string | null
  type: string
  category: string
  priceType: string
  childPrice?: number | null
  maxCapacity?: number | null
  images: string[]
  isActive: boolean
  toursUsingThis: number
}

interface AddonFormData {
  name: string
  description: string
  basePrice: string
  duration: string
  type: string
  category: string
  priceType: string
  childPrice: string
  maxCapacity: string
  images: string[]
}

const initialFormData: AddonFormData = {
  name: "",
  description: "",
  basePrice: "",
  duration: "",
  type: "ACTIVITY",
  category: "ADVENTURE",
  priceType: "PER_PERSON",
  childPrice: "",
  maxCapacity: "",
  images: [],
}

export default function AddonsCatalogPage() {
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [formData, setFormData] = useState<AddonFormData>(initialFormData)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAddons()
  }, [])

  const fetchAddons = async () => {
    try {
      const res = await fetch("/api/agent/catalog/addons")
      const data = await res.json()
      if (data.success) {
        setAddons(data.addons)
      }
    } catch (error) {
      console.error("Failed to fetch addons:", error)
      toast.error("Failed to load add-ons")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (addon?: Addon) => {
    if (addon) {
      setEditingAddon(addon)
      setFormData({
        name: addon.name,
        description: addon.description || "",
        basePrice: addon.basePrice.toString(),
        duration: addon.duration || "",
        type: addon.type,
        category: addon.category,
        priceType: addon.priceType,
        childPrice: addon.childPrice?.toString() || "",
        maxCapacity: addon.maxCapacity?.toString() || "",
        images: addon.images || [],
      })
    } else {
      setEditingAddon(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.basePrice) {
      toast.error("Name and base price are required")
      return
    }

    setSaving(true)
    try {
      const url = editingAddon
        ? `/api/agent/catalog/addons/${editingAddon.id}`
        : "/api/agent/catalog/addons"
      const method = editingAddon ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          basePrice: parseFloat(formData.basePrice),
          duration: formData.duration || null,
          type: formData.type,
          category: formData.category,
          priceType: formData.priceType,
          childPrice: formData.childPrice ? parseFloat(formData.childPrice) : null,
          maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : null,
          images: formData.images,
        }),
      })

      if (res.ok) {
        toast.success(editingAddon ? "Add-on updated" : "Add-on created")
        setIsDialogOpen(false)
        fetchAddons()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to save add-on")
      }
    } catch (error) {
      toast.error("Failed to save add-on")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (addon: Addon) => {
    try {
      const res = await fetch(`/api/agent/catalog/addons/${addon.id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const data = await res.json()
        if (data.deactivated) {
          toast.success("Add-on deactivated (in use by tours)")
        } else {
          toast.success("Add-on deleted")
        }
        fetchAddons()
      } else {
        toast.error("Failed to delete add-on")
      }
    } catch (error) {
      toast.error("Failed to delete add-on")
    }
  }

  const filteredAddons = addons.filter(
    (addon) =>
      addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      addon.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categoryLabels: Record<string, string> = Object.fromEntries(
    ADDON_CATEGORIES.map((c) => [c.value, c.label])
  )

  const typeLabels: Record<string, string> = Object.fromEntries(
    ADDON_TYPES.map((t) => [t.value, t.label])
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
            <Sparkles className="h-6 w-6 text-purple-500" />
            Activity Add-ons Catalog
          </h1>
          <p className="text-muted-foreground">
            Manage your catalog of optional activities and services
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search add-ons..."
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
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingAddon ? "Edit Add-on" : "Create Add-on"}
                </DialogTitle>
                <DialogDescription>
                  {editingAddon
                    ? "Update the add-on details"
                    : "Add a new activity or service to your catalog"}
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
                    placeholder="Hot Air Balloon Ride"
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
                    placeholder="Experience the Masai Mara from above..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
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
                        {ADDON_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category: value })
                      }
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price (USD) *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      placeholder="450"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceType">Price Type</Label>
                    <Select
                      value={formData.priceType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priceType: value })
                      }
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

                {/* Show maxCapacity only for PER_GROUP pricing */}
                {formData.priceType === "PER_GROUP" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxCapacity">People per Group *</Label>
                    <Input
                      id="maxCapacity"
                      type="number"
                      value={formData.maxCapacity}
                      onChange={(e) =>
                        setFormData({ ...formData, maxCapacity: e.target.value })
                      }
                      placeholder="4"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of people included in the group price
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="childPrice">Child Price (USD)</Label>
                    <Input
                      id="childPrice"
                      type="number"
                      value={formData.childPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, childPrice: e.target.value })
                      }
                      placeholder="225"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="1 hour"
                    />
                  </div>
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
                  {editingAddon ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {filteredAddons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No add-ons in your catalog yet</p>
              <p className="text-sm">Create your first add-on to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{addon.name}</h4>
                      <Badge variant="outline">{categoryLabels[addon.category]}</Badge>
                      <Badge variant="secondary">{typeLabels[addon.type]}</Badge>
                      {!addon.isActive && (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                    </div>
                    {addon.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {addon.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-medium text-primary">
                        ${addon.basePrice}
                      </span>
                      {addon.duration && (
                        <span className="text-muted-foreground">
                          {addon.duration}
                        </span>
                      )}
                      {addon.toursUsingThis > 0 && (
                        <span className="text-muted-foreground">
                          Used in {addon.toursUsingThis} tour{addon.toursUsingThis !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(addon)}
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
                          <AlertDialogTitle>Delete Add-on</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete &quot;{addon.name}&quot;?
                            {addon.toursUsingThis > 0 && (
                              <span className="block mt-2 text-amber-600">
                                This add-on is used in {addon.toursUsingThis} tour(s) and will be
                                deactivated instead of deleted.
                              </span>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(addon)}
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
