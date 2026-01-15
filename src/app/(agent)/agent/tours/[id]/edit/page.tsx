"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  Loader2,
  Save,
  Trash2,
  Eye,
  Globe,
  GlobeLock,
  DollarSign,
  X,
  Plus,
  AlertTriangle,
  Hotel,
  Sparkles,
  Star,
  Clock,
  Users,
  Calendar,
  Utensils,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SectionError } from "@/components/error"

// Dynamic import for RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[200px] rounded-md border animate-pulse bg-muted" /> }
)
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ImageUploader } from "@/components/ui/image-uploader"
import {
  TourType,
  TourTypeLabels,
  DifficultyLevel,
  DifficultyLevelLabels,
  AccommodationTier,
  AccommodationTierLabels,
  MealType,
  MealTypeLabels,
  getEnumValues,
} from "@/lib/constants"
import {
  AddonSelector,
  VehicleSelector,
  AccommodationSelector,
} from "@/components/agent/catalog-item-selector"
import { Car } from "lucide-react"

const COUNTRIES = ["Kenya", "Tanzania", "Uganda", "Rwanda"]
const TOUR_TYPES = getEnumValues(TourType).map((value) => ({
  value,
  label: TourTypeLabels[value],
}))
const SEASONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]
const DIFFICULTIES = getEnumValues(DifficultyLevel).map((value) => ({
  value,
  label: DifficultyLevelLabels[value],
}))
const MEAL_OPTIONS = getEnumValues(MealType).map((value) => MealTypeLabels[value])
const ACCOMMODATION_TIERS = getEnumValues(AccommodationTier).map((value) => ({
  value,
  label: AccommodationTierLabels[value],
}))

interface Tour {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string
  destination: string
  country: string
  durationDays: number
  durationNights: number
  basePrice: number
  childPrice: number | null
  infantPrice: number | null
  singleSupplement: number | null
  maxGroupSize: number
  difficulty: string
  tourType: string[]
  highlights: string[]
  included: string[]
  excluded: string[]
  bestSeason: string[]
  coverImage: string | null
  images: string[]
  status: string
  accommodationOptions: AccommodationOption[]
  activityAddons: ActivityAddon[]
  // Deposit settings
  depositEnabled: boolean
  depositPercentage: number
  freeCancellationDays: number
}

interface AccommodationOption {
  id: string
  name: string
  description: string | null
  tier: string
  pricePerNight: number
  images: string[]
  amenities: string[]
  location: string | null
  rating: number | null
  dayNumber: number | null
}

interface ActivityAddon {
  id: string
  name: string
  description: string | null
  price: number
  duration: string | null
  images: string[]
  maxCapacity: number | null
  dayAvailable: number[]
}

interface ItineraryDay {
  id: string
  dayNumber: number
  title: string
  description: string
  location: string | null
  meals: string[]
  activities: string[]
  overnight: string | null
  availableAccommodationIds: string[]
  defaultAccommodationId: string | null
  availableAddonIds: string[]
}

// Catalog item types for the new catalog-based selection system
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

interface CatalogItems {
  addons: TourAddon[]
  vehicles: TourVehicle[]
  accommodations: TourAccommodation[]
}

interface EditTourPageProps {
  params: Promise<{ id: string }>
}

export default function EditTourPage({ params }: EditTourPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [tour, setTour] = useState<Tour | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Itinerary state
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [isLoadingItinerary, setIsLoadingItinerary] = useState(false)
  const [itineraryActivityInput, setItineraryActivityInput] = useState<Record<string, string>>({})

  // Input states for list items
  const [highlightInput, setHighlightInput] = useState("")
  const [includedInput, setIncludedInput] = useState("")
  const [excludedInput, setExcludedInput] = useState("")
  const [imageInput, setImageInput] = useState("")
  const [customTourTypeInput, setCustomTourTypeInput] = useState("")

  // Catalog items state (new catalog-based system)
  const [catalogItems, setCatalogItems] = useState<CatalogItems>({
    addons: [],
    vehicles: [],
    accommodations: [],
  })

  useEffect(() => {
    async function fetchTour() {
      try {
        const res = await fetch(`/api/agent/tours/${id}`)
        if (!res.ok) {
          throw new Error("Failed to fetch tour")
        }
        const data = await res.json()
        setTour(data.tour)
      } catch (error) {
        console.error("Error fetching tour:", error)
        toast.error("Failed to load tour")
        router.push("/agent/tours")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTour()
  }, [id, router])

  // Fetch itinerary separately
  useEffect(() => {
    async function fetchItinerary() {
      setIsLoadingItinerary(true)
      try {
        const res = await fetch(`/api/agent/tours/${id}/itinerary`)
        if (res.ok) {
          const data = await res.json()
          setItinerary(data.itinerary || [])
        }
      } catch (error) {
        console.error("Error fetching itinerary:", error)
      } finally {
        setIsLoadingItinerary(false)
      }
    }

    if (id) {
      fetchItinerary()
    }
  }, [id])

  // Fetch catalog items assigned to this tour
  const fetchCatalogItems = async () => {
    try {
      const res = await fetch(`/api/agent/tours/${id}/catalog-items`)
      if (res.ok) {
        const data = await res.json()
        setCatalogItems({
          addons: data.addons || [],
          vehicles: data.vehicles || [],
          accommodations: data.accommodations || [],
        })
      }
    } catch (error) {
      console.error("Error fetching catalog items:", error)
    }
  }

  useEffect(() => {
    if (id) {
      fetchCatalogItems()
    }
  }, [id])

  // Itinerary helpers
  const addItineraryDay = async () => {
    const nextDayNumber = itinerary.length + 1
    // Auto-select first accommodation as default if available
    const accOptions = tour?.accommodationOptions || []
    const defaultAccId = accOptions.length > 0 ? accOptions[0].id : null
    try {
      const res = await fetch(`/api/agent/tours/${id}/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayNumber: nextDayNumber,
          title: `Day ${nextDayNumber}`,
          description: "",
          location: null,
          meals: [],
          activities: [],
          overnight: accOptions.length > 0 ? accOptions[0].name : null,
          availableAccommodationIds: accOptions.map(a => a.id),
          defaultAccommodationId: defaultAccId,
          availableAddonIds: [],
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setItinerary([...itinerary, data.itinerary])
        toast.success("Day added")
      }
    } catch (error) {
      toast.error("Failed to add day")
    }
  }

  const updateItineraryDay = async (dayId: string, updates: Partial<ItineraryDay>) => {
    // Optimistic update
    setItinerary(itinerary.map((d) => (d.id === dayId ? { ...d, ...updates } : d)))
  }

  const saveItinerary = async () => {
    try {
      const res = await fetch(`/api/agent/tours/${id}/itinerary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itinerary }),
      })
      if (res.ok) {
        toast.success("Itinerary saved")
      } else {
        toast.error("Failed to save itinerary")
      }
    } catch (error) {
      toast.error("Failed to save itinerary")
    }
  }

  const removeItineraryDay = async (dayId: string) => {
    const filtered = itinerary.filter((d) => d.id !== dayId)
    // Re-number days
    const renumbered = filtered.map((day, index) => ({
      ...day,
      dayNumber: index + 1,
    }))
    setItinerary(renumbered)
    // Save immediately
    try {
      await fetch(`/api/agent/tours/${id}/itinerary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itinerary: renumbered }),
      })
      toast.success("Day removed")
    } catch (error) {
      toast.error("Failed to remove day")
    }
  }

  const toggleMeal = (dayId: string, meal: string) => {
    const day = itinerary.find((d) => d.id === dayId)
    if (!day) return
    const meals = day.meals.includes(meal)
      ? day.meals.filter((m) => m !== meal)
      : [...day.meals, meal]
    updateItineraryDay(dayId, { meals })
  }

  const addItineraryActivity = (dayId: string) => {
    const activity = itineraryActivityInput[dayId]?.trim()
    if (!activity) return
    const day = itinerary.find((d) => d.id === dayId)
    if (!day) return
    updateItineraryDay(dayId, { activities: [...day.activities, activity] })
    setItineraryActivityInput({ ...itineraryActivityInput, [dayId]: "" })
  }

  const removeItineraryActivity = (dayId: string, index: number) => {
    const day = itinerary.find((d) => d.id === dayId)
    if (!day) return
    updateItineraryDay(dayId, { activities: day.activities.filter((_, i) => i !== index) })
  }

  // Toggle accommodation availability for a day
  const toggleDayAccommodation = (dayId: string, accId: string) => {
    const day = itinerary.find((d) => d.id === dayId)
    if (!day) return
    const isSelected = day.availableAccommodationIds.includes(accId)
    let newAvailable: string[]
    let newDefault = day.defaultAccommodationId

    if (isSelected) {
      newAvailable = day.availableAccommodationIds.filter((id) => id !== accId)
      if (newDefault === accId) {
        newDefault = newAvailable.length > 0 ? newAvailable[0] : null
      }
    } else {
      newAvailable = [...day.availableAccommodationIds, accId]
      if (!newDefault) {
        newDefault = accId
      }
    }

    // Update overnight display name based on default accommodation
    const defaultAcc = tour?.accommodationOptions.find(a => a.id === newDefault)
    updateItineraryDay(dayId, {
      availableAccommodationIds: newAvailable,
      defaultAccommodationId: newDefault,
      overnight: defaultAcc?.name || null
    })
  }

  // Set default accommodation for a day
  const setDefaultAccommodation = (dayId: string, accId: string) => {
    const defaultAcc = tour?.accommodationOptions.find(a => a.id === accId)
    updateItineraryDay(dayId, {
      defaultAccommodationId: accId,
      overnight: defaultAcc?.name || null
    })
  }

  // Toggle add-on availability for a day
  const toggleDayAddon = (dayId: string, addonId: string) => {
    const day = itinerary.find((d) => d.id === dayId)
    if (!day) return
    const isSelected = day.availableAddonIds.includes(addonId)
    const newAvailable = isSelected
      ? day.availableAddonIds.filter((id) => id !== addonId)
      : [...day.availableAddonIds, addonId]
    updateItineraryDay(dayId, { availableAddonIds: newAvailable })
  }

  const updateField = (field: keyof Tour, value: unknown) => {
    if (!tour) return
    // Use functional update to avoid stale state issues
    setTour((prev) => prev ? { ...prev, [field]: value } : prev)
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleArrayItem = (field: keyof Tour, item: string) => {
    setTour((prev) => {
      if (!prev) return prev
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i) => i !== item)
        : [...currentArray, item]
      return { ...prev, [field]: newArray }
    })
  }

  const addListItem = (field: keyof Tour, value: string, setter: (val: string) => void) => {
    if (!value.trim()) return
    setTour((prev) => {
      if (!prev) return prev
      const currentArray = prev[field] as string[]
      if (currentArray.includes(value.trim())) return prev
      return { ...prev, [field]: [...currentArray, value.trim()] }
    })
    setter("")
  }

  const removeListItem = (field: keyof Tour, index: number) => {
    setTour((prev) => {
      if (!prev) return prev
      const currentArray = prev[field] as string[]
      return { ...prev, [field]: currentArray.filter((_, i) => i !== index) }
    })
  }

  const handleSave = async () => {
    if (!tour) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/agent/tours/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: tour.title,
          subtitle: tour.subtitle,
          description: tour.description,
          destination: tour.destination,
          country: tour.country,
          durationDays: tour.durationDays,
          durationNights: tour.durationNights,
          basePrice: tour.basePrice,
          childPrice: tour.childPrice,
          infantPrice: tour.infantPrice,
          singleSupplement: tour.singleSupplement,
          maxGroupSize: tour.maxGroupSize,
          difficulty: tour.difficulty,
          tourType: tour.tourType,
          highlights: tour.highlights,
          included: tour.included,
          excluded: tour.excluded,
          bestSeason: tour.bestSeason,
          coverImage: tour.coverImage,
          images: tour.images,
          // Deposit settings
          depositEnabled: tour.depositEnabled,
          depositPercentage: tour.depositPercentage,
          freeCancellationDays: tour.freeCancellationDays,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to save tour")
      }

      toast.success("Tour saved successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tour")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!tour) return

    setIsPublishing(true)
    try {
      const res = await fetch(`/api/agent/tours/${id}/publish`, {
        method: "POST",
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details && Array.isArray(data.details)) {
          // Show detailed validation errors
          const errorList = data.details.join("\n")
          toast.error(
            <div>
              <p className="font-semibold mb-2">Tour is not ready to publish:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {data.details.map((error: string, i: number) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>,
            { duration: 8000 }
          )
        } else {
          throw new Error(data.error || "Failed to publish tour")
        }
        return
      }

      setTour({ ...tour, status: "ACTIVE" })
      toast.success("Tour published successfully!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to publish tour")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    if (!tour) return

    setIsPublishing(true)
    try {
      const res = await fetch(`/api/agent/tours/${id}/publish`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to unpublish tour")
      }

      setTour({ ...tour, status: "PAUSED" })
      toast.success("Tour unpublished")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to unpublish tour")
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDelete = async () => {
    if (!tour) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/agent/tours/${id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete tour")
      }

      toast.success("Tour deleted successfully")
      router.push("/agent/tours")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tour")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px]" />
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Tour not found</p>
      </div>
    )
  }

  return (
    <SectionError name="Tour Editor">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/agent/tours">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Edit Tour</h1>
              <Badge
                className={cn(
                  tour.status === "ACTIVE" && "bg-green-100 text-green-800",
                  tour.status === "DRAFT" && "bg-yellow-100 text-yellow-800",
                  tour.status === "PAUSED" && "bg-orange-100 text-orange-800"
                )}
              >
                {tour.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{tour.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/tours/${tour.slug}`} target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          {tour.status === "DRAFT" || tour.status === "PAUSED" ? (
            <div className="relative group">
              <Button size="sm" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                Publish
              </Button>
              {/* Tooltip for unpublishable tours */}
              {(!tour.title || tour.title.length < 5 ||
                !tour.description || tour.description.length < 50 ||
                !tour.destination || !tour.country ||
                tour.basePrice <= 0 || tour.durationDays < 1 ||
                tour.tourType.length === 0 || itinerary.length === 0 ||
                (!tour.coverImage && tour.images.length === 0)) && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-nowrap">
                    Complete all requirements in Settings tab
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={handleUnpublish} disabled={isPublishing}>
              {isPublishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <GlobeLock className="h-4 w-4 mr-2" />
              )}
              Unpublish
            </Button>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 text-xs sm:text-sm">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="accommodations">Stays</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="addons">Add-ons</TabsTrigger>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Main details about your tour</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tour Title</Label>
                <Input
                  id="title"
                  value={tour.title}
                  onChange={(e) => updateField("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={tour.subtitle || ""}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  placeholder="A short catchy tagline"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <RichTextEditor
                  content={tour.description}
                  onChange={(content) => updateField("description", content)}
                  placeholder="Describe your tour in detail..."
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    value={tour.destination}
                    onChange={(e) => updateField("destination", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={tour.country}
                    onValueChange={(value) => updateField("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Days</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min={1}
                    value={tour.durationDays}
                    onChange={(e) => updateField("durationDays", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationNights">Nights</Label>
                  <Input
                    id="durationNights"
                    type="number"
                    min={0}
                    value={tour.durationNights}
                    onChange={(e) => updateField("durationNights", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGroupSize">Max Group Size</Label>
                  <Input
                    id="maxGroupSize"
                    type="number"
                    min={1}
                    value={tour.maxGroupSize}
                    onChange={(e) => updateField("maxGroupSize", parseInt(e.target.value) || 12)}
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Adult Price (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="basePrice"
                      type="number"
                      min={0}
                      value={tour.basePrice}
                      onChange={(e) => updateField("basePrice", parseFloat(e.target.value) || 0)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={tour.difficulty}
                    onValueChange={(value) => updateField("difficulty", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Guest Type Pricing */}
              <div className="space-y-3">
                <Label>Guest Type Pricing</Label>
                <p className="text-sm text-muted-foreground">
                  Set different prices for children and infants (optional)
                </p>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="childPrice" className="text-sm">Child Price (2-11 yrs)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="childPrice"
                        type="number"
                        min={0}
                        placeholder="Optional"
                        value={tour.childPrice ?? ""}
                        onChange={(e) => updateField("childPrice", e.target.value ? parseFloat(e.target.value) : null)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="infantPrice" className="text-sm">Infant Price (0-2 yrs)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="infantPrice"
                        type="number"
                        min={0}
                        placeholder="Optional"
                        value={tour.infantPrice ?? ""}
                        onChange={(e) => updateField("infantPrice", e.target.value ? parseFloat(e.target.value) : null)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="singleSupplement" className="text-sm">Single Supplement</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="singleSupplement"
                        type="number"
                        min={0}
                        placeholder="Optional"
                        value={tour.singleSupplement ?? ""}
                        onChange={(e) => updateField("singleSupplement", e.target.value ? parseFloat(e.target.value) : null)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tour Types</CardTitle>
              <CardDescription>Select from common types or add your own</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {TOUR_TYPES.map((type) => (
                  <Badge
                    key={type.value}
                    variant={tour.tourType.includes(type.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("tourType", type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
                {/* Show custom types that aren't in the predefined list */}
                {tour.tourType
                  .filter((type) => !TOUR_TYPES.some((t) => t.value === type))
                  .map((type) => (
                    <Badge
                      key={type}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("tourType", type)}
                    >
                      {type}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
              </div>
              {/* Add custom tour type */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom type..."
                  value={customTourTypeInput}
                  onChange={(e) => setCustomTourTypeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (customTourTypeInput.trim() && !tour.tourType.includes(customTourTypeInput.trim())) {
                        updateField("tourType", [...tour.tourType, customTourTypeInput.trim()])
                        setCustomTourTypeInput("")
                      }
                    }
                  }}
                  className="max-w-xs"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (customTourTypeInput.trim() && !tour.tourType.includes(customTourTypeInput.trim())) {
                      updateField("tourType", [...tour.tourType, customTourTypeInput.trim()])
                      setCustomTourTypeInput("")
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Best Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((season) => (
                  <Badge
                    key={season}
                    variant={tour.bestSeason.includes(season) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("bestSeason", season)}
                  >
                    {season}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Highlights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a highlight..."
                  value={highlightInput}
                  onChange={(e) => setHighlightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addListItem("highlights", highlightInput, setHighlightInput)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => addListItem("highlights", highlightInput, setHighlightInput)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {tour.highlights.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                    <span className="text-sm">{item}</span>
                    <Button variant="ghost" size="sm" onClick={() => removeListItem("highlights", index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add item..."
                    value={includedInput}
                    onChange={(e) => setIncludedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addListItem("included", includedInput, setIncludedInput)
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => addListItem("included", includedInput, setIncludedInput)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {tour.included.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                      <span>{item}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeListItem("included", index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Not Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add item..."
                    value={excludedInput}
                    onChange={(e) => setExcludedInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addListItem("excluded", excludedInput, setExcludedInput)
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => addListItem("excluded", excludedInput, setExcludedInput)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {tour.excluded.map((item, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                      <span>{item}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeListItem("excluded", index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="itinerary" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Day-by-Day Itinerary
                </CardTitle>
                <CardDescription>
                  Plan each day of the tour with activities, meals, and accommodation (optional)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {itinerary.length > 0 && (
                  <Button variant="outline" onClick={saveItinerary}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Itinerary
                  </Button>
                )}
                <Button onClick={addItineraryDay}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Day
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingItinerary ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : itinerary.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No itinerary days added yet</p>
                  <p className="text-sm">Click &quot;Add Day&quot; to start building your day-by-day plan</p>
                  <Button variant="outline" className="mt-4" onClick={addItineraryDay}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Day
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {itinerary.map((day) => (
                    <Card key={day.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                              {day.dayNumber}
                            </div>
                            <div className="space-y-1">
                              <Input
                                value={day.title}
                                onChange={(e) => updateItineraryDay(day.id, { title: e.target.value })}
                                className="font-semibold"
                                placeholder={`Day ${day.dayNumber} Title`}
                              />
                              <Input
                                value={day.location || ""}
                                onChange={(e) => updateItineraryDay(day.id, { location: e.target.value })}
                                className="text-sm"
                                placeholder="Location (e.g., Masai Mara National Reserve)"
                              />
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeItineraryDay(day.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Description */}
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={day.description}
                            onChange={(e) => updateItineraryDay(day.id, { description: e.target.value })}
                            placeholder="Describe what happens on this day..."
                            rows={2}
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
                              value={itineraryActivityInput[day.id] || ""}
                              onChange={(e) => setItineraryActivityInput({ ...itineraryActivityInput, [day.id]: e.target.value })}
                              placeholder="Add an activity..."
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  addItineraryActivity(day.id)
                                }
                              }}
                            />
                            <Button type="button" variant="outline" onClick={() => addItineraryActivity(day.id)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {day.activities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {day.activities.map((activity, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {activity}
                                  <button
                                    onClick={() => removeItineraryActivity(day.id, i)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Overnight Accommodation Options */}
                        {tour && tour.accommodationOptions.length > 0 && (
                          <div className="space-y-2 pt-3 border-t">
                            <Label className="flex items-center gap-2">
                              <Hotel className="h-4 w-4" />
                              Overnight Stay Options
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Select which accommodations are available for this night. Clients can choose from these options when booking.
                            </p>
                            <div className="space-y-2">
                              {tour.accommodationOptions.map((acc) => {
                                const isAvailable = day.availableAccommodationIds?.includes(acc.id) || false
                                const isDefault = day.defaultAccommodationId === acc.id
                                return (
                                  <div
                                    key={acc.id}
                                    className={cn(
                                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                                      isAvailable ? "bg-primary/5 border-primary" : "hover:bg-muted"
                                    )}
                                    onClick={() => toggleDayAccommodation(day.id, acc.id)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-4 h-4 rounded border-2 flex items-center justify-center",
                                        isAvailable ? "bg-primary border-primary" : "border-muted-foreground"
                                      )}>
                                        {isAvailable && <Check className="h-3 w-3 text-primary-foreground" />}
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{acc.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {acc.tier} • ${acc.pricePerNight}/night
                                        </p>
                                      </div>
                                    </div>
                                    {isAvailable && (
                                      <Button
                                        variant={isDefault ? "default" : "outline"}
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setDefaultAccommodation(day.id, acc.id)
                                        }}
                                      >
                                        {isDefault ? "Default" : "Set Default"}
                                      </Button>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Available Add-ons for this day */}
                        {tour && tour.activityAddons.length > 0 && (
                          <div className="space-y-2 pt-3 border-t">
                            <Label className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4" />
                              Available Add-ons This Day
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              Select which add-on activities can be purchased for this day.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {tour.activityAddons.map((addon) => {
                                const isSelected = day.availableAddonIds?.includes(addon.id) || false
                                return (
                                  <Badge
                                    key={addon.id}
                                    variant={isSelected ? "default" : "outline"}
                                    className="cursor-pointer"
                                    onClick={() => toggleDayAddon(day.id, addon.id)}
                                  >
                                    {addon.name} (+${addon.price})
                                  </Badge>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accommodations" className="space-y-6">
          {/* New Catalog-based Accommodation Selector */}
          <AccommodationSelector
            tourId={id}
            tourDays={tour.durationDays}
            assignedAccommodations={catalogItems.accommodations}
            onUpdate={fetchCatalogItems}
          />

          {/* Legacy: Tour-specific accommodations (for backward compatibility) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Tour-Specific Accommodations
                </CardTitle>
                <CardDescription>
                  Create new accommodations specific to this tour only
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Accommodation Option</DialogTitle>
                    <DialogDescription>
                      Add a new accommodation tier for this tour
                    </DialogDescription>
                  </DialogHeader>
                  <AccommodationForm
                    tourId={id}
                    onSuccess={() => {
                      // Refresh tour data
                      fetch(`/api/agent/tours/${id}`)
                        .then(res => res.json())
                        .then(data => setTour(data.tour))
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {tour.accommodationOptions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No tour-specific accommodations</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tour.accommodationOptions.map((acc) => (
                    <div key={acc.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{acc.name}</h4>
                          <Badge variant="outline" className="capitalize">{acc.tier}</Badge>
                          {acc.rating && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {acc.rating}
                            </span>
                          )}
                        </div>
                        {acc.description && (
                          <p className="text-sm text-muted-foreground">{acc.description}</p>
                        )}
                        <p className="text-sm font-medium text-primary">
                          ${acc.pricePerNight}/night
                        </p>
                        {acc.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {acc.amenities.slice(0, 4).map((a, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                            ))}
                            {acc.amenities.length > 4 && (
                              <Badge variant="secondary" className="text-xs">+{acc.amenities.length - 4}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
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
                                Are you sure you want to delete &quot;{acc.name}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={async () => {
                                  const res = await fetch(`/api/agent/tours/${id}/accommodations/${acc.id}`, {
                                    method: "DELETE",
                                  })
                                  if (res.ok) {
                                    setTour({
                                      ...tour,
                                      accommodationOptions: tour.accommodationOptions.filter(a => a.id !== acc.id)
                                    })
                                    toast.success("Accommodation deleted")
                                  } else {
                                    toast.error("Failed to delete accommodation")
                                  }
                                }}
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
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <VehicleSelector
            tourId={id}
            tourDays={tour.durationDays}
            assignedVehicles={catalogItems.vehicles}
            onUpdate={fetchCatalogItems}
          />
        </TabsContent>

        <TabsContent value="addons" className="space-y-6">
          {/* New Catalog-based Add-on Selector */}
          <AddonSelector
            tourId={id}
            tourDays={tour.durationDays}
            assignedAddons={catalogItems.addons}
            onUpdate={fetchCatalogItems}
          />

          {/* Legacy: Tour-specific add-ons (for backward compatibility) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Tour-Specific Add-ons
                </CardTitle>
                <CardDescription>
                  Create new add-ons specific to this tour only
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Activity Add-on</DialogTitle>
                    <DialogDescription>
                      Add an optional activity for this tour
                    </DialogDescription>
                  </DialogHeader>
                  <ActivityForm
                    tourId={id}
                    durationDays={tour.durationDays}
                    onSuccess={() => {
                      // Refresh tour data
                      fetch(`/api/agent/tours/${id}`)
                        .then(res => res.json())
                        .then(data => setTour(data.tour))
                    }}
                  />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {tour.activityAddons.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No tour-specific add-ons</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tour.activityAddons.map((addon) => (
                    <div key={addon.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <h4 className="font-medium">{addon.name}</h4>
                        {addon.description && (
                          <p className="text-sm text-muted-foreground">{addon.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-medium text-primary">${addon.price}</span>
                          {addon.duration && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {addon.duration}
                            </span>
                          )}
                          {addon.maxCapacity && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-3 w-3" />
                              Max {addon.maxCapacity}
                            </span>
                          )}
                        </div>
                        {addon.dayAvailable.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Available on day{addon.dayAvailable.length > 1 ? "s" : ""}: {addon.dayAvailable.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Activity Add-on</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{addon.name}&quot;? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={async () => {
                                  const res = await fetch(`/api/agent/tours/${id}/addons/${addon.id}`, {
                                    method: "DELETE",
                                  })
                                  if (res.ok) {
                                    setTour({
                                      ...tour,
                                      activityAddons: tour.activityAddons.filter(a => a.id !== addon.id)
                                    })
                                    toast.success("Activity deleted")
                                  } else {
                                    toast.error("Failed to delete activity")
                                  }
                                }}
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
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tour Images</CardTitle>
              <CardDescription>
                Upload images for your tour. The first image will be used as the cover image.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader
                value={tour.images}
                onChange={(urls) => {
                  updateField("images", urls)
                  // Set first image as cover if not already set or if cover was first image
                  if (urls.length > 0) {
                    updateField("coverImage", urls[0])
                  } else {
                    updateField("coverImage", null)
                  }
                }}
                maxFiles={10}
              />

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Upload high-quality images that showcase your tour.
                  The first image will be displayed as the cover on tour listings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tour Status</CardTitle>
              <CardDescription>Manage visibility and publication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Current Status</p>
                  <p className="text-sm text-muted-foreground">
                    {tour.status === "ACTIVE" && "Tour is live and visible to travelers"}
                    {tour.status === "DRAFT" && "Tour is not published yet"}
                    {tour.status === "PAUSED" && "Tour is hidden from travelers"}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-sm",
                    tour.status === "ACTIVE" && "bg-green-100 text-green-800",
                    tour.status === "DRAFT" && "bg-yellow-100 text-yellow-800",
                    tour.status === "PAUSED" && "bg-orange-100 text-orange-800"
                  )}
                >
                  {tour.status}
                </Badge>
              </div>

              {/* Publish Requirements Checklist */}
              {(tour.status === "DRAFT" || tour.status === "PAUSED") && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary" />
                    Publishing Requirements
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {tour.title && tour.title.length >= 5 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={tour.title && tour.title.length >= 5 ? "text-green-700" : "text-red-700"}>
                        Tour title (minimum 5 characters)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tour.description && tour.description.length >= 50 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={tour.description && tour.description.length >= 50 ? "text-green-700" : "text-red-700"}>
                        Tour description (minimum 50 characters)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tour.destination ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={tour.destination ? "text-green-700" : "text-red-700"}>
                        Destination specified
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tour.country ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={tour.country ? "text-green-700" : "text-red-700"}>
                        Country specified
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tour.basePrice > 0 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={tour.basePrice > 0 ? "text-green-700" : "text-red-700"}>
                        Price set (greater than 0)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tour.durationDays >= 1 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={tour.durationDays >= 1 ? "text-green-700" : "text-red-700"}>
                        Duration (at least 1 day)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tour.tourType.length > 0 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={tour.tourType.length > 0 ? "text-green-700" : "text-red-700"}>
                        At least one tour type selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {itinerary.length > 0 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={itinerary.length > 0 ? "text-green-700" : "text-red-700"}>
                        At least one itinerary day added
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(tour.coverImage || tour.images.length > 0) ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                      <span className={(tour.coverImage || tour.images.length > 0) ? "text-green-700" : "text-red-700"}>
                        At least one image uploaded
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Complete all requirements to publish your tour
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deposit & Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Deposit & Payment Settings
              </CardTitle>
              <CardDescription>
                Allow travelers to pay a deposit instead of the full amount
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Enable Deposit Payments</p>
                  <p className="text-sm text-muted-foreground">
                    Allow travelers to pay a percentage upfront and the balance later
                  </p>
                </div>
                <Button
                  variant={tour.depositEnabled ? "default" : "outline"}
                  onClick={() => updateField("depositEnabled", !tour.depositEnabled)}
                >
                  {tour.depositEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {tour.depositEnabled && (
                <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="depositPercentage">Deposit Percentage</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="depositPercentage"
                          type="number"
                          min={10}
                          max={90}
                          value={tour.depositPercentage}
                          onChange={(e) => updateField("depositPercentage", parseInt(e.target.value) || 30)}
                          className="max-w-[100px]"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Minimum 10%, maximum 90%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="freeCancellationDays">Free Cancellation Period</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="freeCancellationDays"
                          type="number"
                          min={0}
                          max={90}
                          value={tour.freeCancellationDays}
                          onChange={(e) => updateField("freeCancellationDays", parseInt(e.target.value) || 14)}
                          className="max-w-[100px]"
                        />
                        <span className="text-muted-foreground">days before start</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Full refund if canceled within this period
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-background p-3 border">
                    <p className="text-sm">
                      <strong>Example:</strong> For a ${tour.basePrice.toLocaleString()} tour, travelers can pay{" "}
                      <span className="text-primary font-medium">
                        ${Math.round(tour.basePrice * (tour.depositPercentage / 100)).toLocaleString()}
                      </span>{" "}
                      ({tour.depositPercentage}%) as deposit and{" "}
                      <span className="font-medium">
                        ${Math.round(tour.basePrice * (1 - tour.depositPercentage / 100)).toLocaleString()}
                      </span>{" "}
                      balance before the trip.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete this tour</p>
                  <p className="text-sm text-muted-foreground">
                    Once deleted, this tour cannot be recovered
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Tour
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Tour</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{tour.title}&quot;? This action cannot
                        be undone and all associated data will be permanently removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="sticky bottom-4 mt-6">
        <Card className="shadow-lg">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-sm text-muted-foreground">
              Make sure to save your changes
            </p>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </SectionError>
  )
}

// Accommodation Form Component
function AccommodationForm({ tourId, onSuccess }: { tourId: string; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<{
    name: string
    description: string
    tier: AccommodationTier
    pricePerNight: number
    location: string
    rating: string
    amenities: string
  }>({
    name: "",
    description: "",
    tier: AccommodationTier.MID_RANGE,
    pricePerNight: 0,
    location: "",
    rating: "",
    amenities: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/agent/tours/${tourId}/accommodations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          tier: form.tier,
          pricePerNight: form.pricePerNight,
          location: form.location || null,
          rating: form.rating ? parseFloat(form.rating) : null,
          amenities: form.amenities ? form.amenities.split(",").map(a => a.trim()).filter(Boolean) : [],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to add accommodation")
      }

      toast.success("Accommodation added!")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add accommodation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="acc-name">Name *</Label>
        <Input
          id="acc-name"
          placeholder="e.g., Serena Safari Lodge"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="acc-tier">Tier *</Label>
          <Select
            value={form.tier}
            onValueChange={(value) => setForm({ ...form, tier: value as AccommodationTier })}
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
          <Label htmlFor="acc-price">Price/Night (USD) *</Label>
          <Input
            id="acc-price"
            type="number"
            min={0}
            value={form.pricePerNight}
            onChange={(e) => setForm({ ...form, pricePerNight: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="acc-description">Description</Label>
        <Textarea
          id="acc-description"
          placeholder="Brief description of the accommodation"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="acc-location">Location</Label>
          <Input
            id="acc-location"
            placeholder="e.g., Masai Mara"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="acc-rating">Rating (1-5)</Label>
          <Input
            id="acc-rating"
            type="number"
            min={1}
            max={5}
            step={0.1}
            placeholder="e.g., 4.5"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="acc-amenities">Amenities</Label>
        <Input
          id="acc-amenities"
          placeholder="WiFi, Pool, Spa, Restaurant (comma-separated)"
          value={form.amenities}
          onChange={(e) => setForm({ ...form, amenities: e.target.value })}
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting || !form.name || form.pricePerNight <= 0}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Accommodation
        </Button>
      </DialogFooter>
    </form>
  )
}

// Activity Add-on Form Component
function ActivityForm({ tourId, durationDays, onSuccess }: { tourId: string; durationDays: number; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    duration: "",
    maxCapacity: "",
    dayAvailable: [] as number[],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/agent/tours/${tourId}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          price: form.price,
          duration: form.duration || null,
          maxCapacity: form.maxCapacity ? parseInt(form.maxCapacity) : null,
          dayAvailable: form.dayAvailable,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to add activity")
      }

      toast.success("Activity add-on added!")
      onSuccess()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add activity")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleDay = (day: number) => {
    setForm({
      ...form,
      dayAvailable: form.dayAvailable.includes(day)
        ? form.dayAvailable.filter(d => d !== day)
        : [...form.dayAvailable, day].sort((a, b) => a - b)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addon-name">Name *</Label>
        <Input
          id="addon-name"
          placeholder="e.g., Hot Air Balloon Safari"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addon-description">Description</Label>
        <Textarea
          id="addon-description"
          placeholder="Brief description of the activity"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="addon-price">Price (USD) *</Label>
          <Input
            id="addon-price"
            type="number"
            min={0}
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addon-duration">Duration</Label>
          <Input
            id="addon-duration"
            placeholder="e.g., 2 hours"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="addon-capacity">Max Capacity</Label>
          <Input
            id="addon-capacity"
            type="number"
            min={1}
            placeholder="Optional"
            value={form.maxCapacity}
            onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Available on Days</Label>
        <p className="text-xs text-muted-foreground mb-2">Select which days this activity is available</p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: durationDays }, (_, i) => i + 1).map((day) => (
            <Badge
              key={day}
              variant={form.dayAvailable.includes(day) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleDay(day)}
            >
              Day {day}
            </Badge>
          ))}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting || !form.name || form.price <= 0}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Activity
        </Button>
      </DialogFooter>
    </form>
  )
}
