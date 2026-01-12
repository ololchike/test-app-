"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Image as ImageIcon,
  FileText,
  X,
  Plus,
  Hotel,
  Sparkles,
  Star,
  Users,
  Trash2,
  Calendar,
  Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Dynamic import for RichTextEditor to avoid SSR issues
const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <div className="h-[200px] rounded-md border animate-pulse bg-muted" /> }
)

// Logical flow: Define options first, then build itinerary using those options
const STEPS = [
  { id: 1, title: "Details", icon: FileText },
  { id: 2, title: "Features", icon: Check },
  { id: 3, title: "Stays", icon: Hotel },        // Define accommodation pool first
  { id: 4, title: "Add-ons", icon: Sparkles },   // Define activities pool
  { id: 5, title: "Itinerary", icon: Calendar }, // Now link stays/add-ons to days
  { id: 6, title: "Images", icon: ImageIcon },
  { id: 7, title: "Review", icon: MapPin },
]

const MEAL_OPTIONS = ["Breakfast", "Lunch", "Dinner"]

const COUNTRIES = ["Kenya", "Tanzania", "Uganda", "Rwanda"]
const TOUR_TYPES = [
  "Safari",
  "Beach",
  "Mountain",
  "Cultural",
  "Adventure",
  "Wildlife",
  "Gorilla Trekking",
  "Bird Watching",
  "Photography",
  "Honeymoon",
  "Family",
  "Luxury",
  "Budget",
]
const SEASONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const DIFFICULTIES = ["Easy", "Moderate", "Challenging"]
const ACCOMMODATION_TIERS = [
  { value: "budget", label: "Budget" },
  { value: "mid-range", label: "Mid-Range" },
  { value: "luxury", label: "Luxury" },
  { value: "ultra-luxury", label: "Ultra Luxury" },
]

interface ItineraryData {
  id: string // temporary id for UI
  dayNumber: number
  title: string
  description: string
  location: string // e.g., "Masai Mara National Reserve"
  meals: string[]
  activities: string[] // planned activities (free text)
  // Accommodation references
  availableAccommodationIds: string[] // IDs of accommodations available this night
  defaultAccommodationId: string | null // the default selection (first by default)
  // Add-on references
  availableAddonIds: string[] // IDs of add-ons available this day
}

interface AccommodationData {
  id: string // temporary id for UI
  name: string
  description: string
  tier: string
  pricePerNight: number
  location: string
  rating: number | null
  amenities: string[]
}

interface AddonData {
  id: string // temporary id for UI
  name: string
  description: string
  price: number
  duration: string
  maxCapacity: number | null
  dayAvailable: number[]
}

interface TourFormData {
  title: string
  subtitle: string
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
  coverImage: string
  images: string[]
  itinerary: ItineraryData[]
  accommodations: AccommodationData[]
  addons: AddonData[]
}

const initialFormData: TourFormData = {
  title: "",
  subtitle: "",
  description: "",
  destination: "",
  country: "",
  durationDays: 1,
  durationNights: 0,
  basePrice: 0,
  childPrice: null,
  infantPrice: null,
  singleSupplement: null,
  maxGroupSize: 12,
  difficulty: "Moderate",
  tourType: [],
  highlights: [],
  included: [],
  excluded: [],
  bestSeason: [],
  coverImage: "",
  images: [],
  itinerary: [],
  accommodations: [],
  addons: [],
}

export default function CreateTourPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<TourFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Input states for list items
  const [highlightInput, setHighlightInput] = useState("")
  const [includedInput, setIncludedInput] = useState("")
  const [excludedInput, setExcludedInput] = useState("")
  const [imageInput, setImageInput] = useState("")
  const [customTourTypeInput, setCustomTourTypeInput] = useState("")

  // Dialog states
  const [accommodationDialogOpen, setAccommodationDialogOpen] = useState(false)
  const [addonDialogOpen, setAddonDialogOpen] = useState(false)

  const updateFormData = (field: keyof TourFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const toggleArrayItem = (field: keyof TourFormData, item: string) => {
    const currentArray = formData[field] as string[]
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item]
    updateFormData(field, newArray)
  }

  const addListItem = (field: keyof TourFormData, value: string, setter: (val: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[]
      if (!currentArray.includes(value.trim())) {
        updateFormData(field, [...currentArray, value.trim()])
      }
      setter("")
    }
  }

  const removeListItem = (field: keyof TourFormData, index: number) => {
    const currentArray = formData[field] as string[]
    updateFormData(field, currentArray.filter((_, i) => i !== index))
  }

  // Itinerary helpers
  const addItineraryDay = () => {
    const nextDayNumber = formData.itinerary.length + 1
    // Auto-select first accommodation as default if available
    const defaultAccId = formData.accommodations.length > 0 ? formData.accommodations[0].id : null
    const newDay: ItineraryData = {
      id: `temp-${Date.now()}`,
      dayNumber: nextDayNumber,
      title: `Day ${nextDayNumber}`,
      description: "",
      location: "",
      meals: [],
      activities: [],
      availableAccommodationIds: formData.accommodations.map(a => a.id), // All accommodations available by default
      defaultAccommodationId: defaultAccId,
      availableAddonIds: [], // No add-ons selected by default
    }
    updateFormData("itinerary", [...formData.itinerary, newDay])
  }

  const updateItineraryDay = (id: string, data: Partial<ItineraryData>) => {
    updateFormData(
      "itinerary",
      formData.itinerary.map((day) => (day.id === id ? { ...day, ...data } : day))
    )
  }

  const removeItineraryDay = (id: string) => {
    const filtered = formData.itinerary.filter((d) => d.id !== id)
    // Re-number days
    const renumbered = filtered.map((day, index) => ({
      ...day,
      dayNumber: index + 1,
      title: day.title.startsWith("Day ") ? `Day ${index + 1}` : day.title,
    }))
    updateFormData("itinerary", renumbered)
  }

  const toggleMeal = (dayId: string, meal: string) => {
    const day = formData.itinerary.find((d) => d.id === dayId)
    if (!day) return
    const meals = day.meals.includes(meal)
      ? day.meals.filter((m) => m !== meal)
      : [...day.meals, meal]
    updateItineraryDay(dayId, { meals })
  }

  const addActivity = (dayId: string, activity: string) => {
    const day = formData.itinerary.find((d) => d.id === dayId)
    if (!day || !activity.trim()) return
    updateItineraryDay(dayId, { activities: [...day.activities, activity.trim()] })
  }

  const removeActivity = (dayId: string, index: number) => {
    const day = formData.itinerary.find((d) => d.id === dayId)
    if (!day) return
    updateItineraryDay(dayId, { activities: day.activities.filter((_, i) => i !== index) })
  }

  // Toggle accommodation availability for a day
  const toggleDayAccommodation = (dayId: string, accId: string) => {
    const day = formData.itinerary.find((d) => d.id === dayId)
    if (!day) return
    const isSelected = day.availableAccommodationIds.includes(accId)
    let newAvailable: string[]
    let newDefault = day.defaultAccommodationId

    if (isSelected) {
      // Removing - filter it out
      newAvailable = day.availableAccommodationIds.filter((id) => id !== accId)
      // If we removed the default, pick the first available or null
      if (newDefault === accId) {
        newDefault = newAvailable.length > 0 ? newAvailable[0] : null
      }
    } else {
      // Adding
      newAvailable = [...day.availableAccommodationIds, accId]
      // If no default was set, set this as default
      if (!newDefault) {
        newDefault = accId
      }
    }
    updateItineraryDay(dayId, {
      availableAccommodationIds: newAvailable,
      defaultAccommodationId: newDefault
    })
  }

  // Set default accommodation for a day
  const setDefaultAccommodation = (dayId: string, accId: string) => {
    updateItineraryDay(dayId, { defaultAccommodationId: accId })
  }

  // Toggle add-on availability for a day
  const toggleDayAddon = (dayId: string, addonId: string) => {
    const day = formData.itinerary.find((d) => d.id === dayId)
    if (!day) return
    const isSelected = day.availableAddonIds.includes(addonId)
    const newAvailable = isSelected
      ? day.availableAddonIds.filter((id) => id !== addonId)
      : [...day.availableAddonIds, addonId]
    updateItineraryDay(dayId, { availableAddonIds: newAvailable })
  }

  // Accommodation helpers
  const addAccommodation = (acc: Omit<AccommodationData, "id">) => {
    const newAcc: AccommodationData = {
      ...acc,
      id: `temp-${Date.now()}`,
    }
    updateFormData("accommodations", [...formData.accommodations, newAcc])
  }

  const removeAccommodation = (id: string) => {
    updateFormData("accommodations", formData.accommodations.filter((a) => a.id !== id))
  }

  // Addon helpers
  const addAddon = (addon: Omit<AddonData, "id">) => {
    const newAddon: AddonData = {
      ...addon,
      id: `temp-${Date.now()}`,
    }
    updateFormData("addons", [...formData.addons, newAddon])
  }

  const removeAddon = (id: string) => {
    updateFormData("addons", formData.addons.filter((a) => a.id !== id))
  }

  // Helper to strip HTML tags for text length validation
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.title || formData.title.length < 5) {
        newErrors.title = "Title must be at least 5 characters"
      }
      const descriptionText = stripHtml(formData.description)
      if (!descriptionText || descriptionText.length < 50) {
        newErrors.description = "Description must be at least 50 characters"
      }
      if (!formData.destination) {
        newErrors.destination = "Destination is required"
      }
      if (!formData.country) {
        newErrors.country = "Country is required"
      }
      if (formData.durationDays < 1) {
        newErrors.durationDays = "Duration must be at least 1 day"
      }
      if (formData.basePrice <= 0) {
        newErrors.basePrice = "Price must be greater than 0"
      }
    }

    if (step === 2) {
      if (formData.tourType.length === 0) {
        newErrors.tourType = "Select at least one tour type"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      // Create the tour first
      const response = await fetch("/api/agent/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          description: formData.description,
          destination: formData.destination,
          country: formData.country,
          durationDays: formData.durationDays,
          durationNights: formData.durationNights,
          basePrice: formData.basePrice,
          childPrice: formData.childPrice,
          infantPrice: formData.infantPrice,
          singleSupplement: formData.singleSupplement,
          maxGroupSize: formData.maxGroupSize,
          difficulty: formData.difficulty,
          tourType: formData.tourType,
          highlights: formData.highlights,
          included: formData.included,
          excluded: formData.excluded,
          bestSeason: formData.bestSeason,
          coverImage: formData.coverImage || null,
          images: formData.images,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create tour")
      }

      const tourId = data.tour.id

      // Create accommodations
      for (const acc of formData.accommodations) {
        await fetch(`/api/agent/tours/${tourId}/accommodations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: acc.name,
            description: acc.description || null,
            tier: acc.tier,
            pricePerNight: acc.pricePerNight,
            location: acc.location || null,
            rating: acc.rating,
            amenities: acc.amenities,
          }),
        })
      }

      // Create itinerary
      for (const day of formData.itinerary) {
        // Get the default accommodation name for overnight display
        const defaultAcc = formData.accommodations.find(a => a.id === day.defaultAccommodationId)
        await fetch(`/api/agent/tours/${tourId}/itinerary`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description || null,
            location: day.location || null,
            meals: day.meals,
            activities: day.activities,
            overnight: defaultAcc?.name || null,
            // New fields for accommodation/addon references
            availableAccommodationIds: day.availableAccommodationIds,
            defaultAccommodationId: day.defaultAccommodationId,
            availableAddonIds: day.availableAddonIds,
          }),
        })
      }

      // Create addons
      for (const addon of formData.addons) {
        await fetch(`/api/agent/tours/${tourId}/addons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: addon.name,
            description: addon.description || null,
            price: addon.price,
            duration: addon.duration || null,
            maxCapacity: addon.maxCapacity,
            dayAvailable: addon.dayAvailable,
          }),
        })
      }

      toast.success("Tour created successfully!")
      router.push("/agent/tours")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create tour")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/agent/tours">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Tour</h1>
          <p className="text-muted-foreground">
            Fill in the details to create your tour listing
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium hidden sm:block",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tour Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., 7-Day Masai Mara Safari Adventure"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                <Input
                  id="subtitle"
                  placeholder="e.g., Experience the magic of the African savannah"
                  value={formData.subtitle}
                  onChange={(e) => updateFormData("subtitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description *</Label>
                <RichTextEditor
                  content={formData.description}
                  onChange={(content) => updateFormData("description", content)}
                  placeholder="Describe your tour in detail... Use formatting to highlight key features, include lists of activities, and make the description engaging."
                  className={errors.description ? "border-destructive" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Masai Mara"
                    value={formData.destination}
                    onChange={(e) => updateFormData("destination", e.target.value)}
                    className={errors.destination ? "border-destructive" : ""}
                  />
                  {errors.destination && (
                    <p className="text-sm text-destructive">{errors.destination}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => updateFormData("country", value)}
                  >
                    <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="durationDays">Duration (Days) *</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min={1}
                    max={30}
                    value={formData.durationDays}
                    onChange={(e) => updateFormData("durationDays", parseInt(e.target.value) || 1)}
                    className={errors.durationDays ? "border-destructive" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationNights">Nights</Label>
                  <Input
                    id="durationNights"
                    type="number"
                    min={0}
                    max={30}
                    value={formData.durationNights}
                    onChange={(e) => updateFormData("durationNights", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxGroupSize">Max Group Size</Label>
                  <Input
                    id="maxGroupSize"
                    type="number"
                    min={1}
                    max={50}
                    value={formData.maxGroupSize}
                    onChange={(e) => updateFormData("maxGroupSize", parseInt(e.target.value) || 12)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Adult Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="basePrice"
                      type="number"
                      min={0}
                      value={formData.basePrice}
                      onChange={(e) => updateFormData("basePrice", parseFloat(e.target.value) || 0)}
                      className={cn("pl-9", errors.basePrice ? "border-destructive" : "")}
                    />
                  </div>
                  {errors.basePrice && (
                    <p className="text-sm text-destructive">{errors.basePrice}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => updateFormData("difficulty", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
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
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="childPrice" className="text-sm">Child Price (2-11 yrs)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="childPrice"
                        type="number"
                        min={0}
                        placeholder="Optional"
                        value={formData.childPrice ?? ""}
                        onChange={(e) => updateFormData("childPrice", e.target.value ? parseFloat(e.target.value) : null)}
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
                        value={formData.infantPrice ?? ""}
                        onChange={(e) => updateFormData("infantPrice", e.target.value ? parseFloat(e.target.value) : null)}
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
                        value={formData.singleSupplement ?? ""}
                        onChange={(e) => updateFormData("singleSupplement", e.target.value ? parseFloat(e.target.value) : null)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Tour Types *</Label>
                <p className="text-sm text-muted-foreground">Select from common types or add your own</p>
                <div className="flex flex-wrap gap-2">
                  {TOUR_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={formData.tourType.includes(type) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("tourType", type)}
                    >
                      {type}
                    </Badge>
                  ))}
                  {/* Show custom types that aren't in the predefined list */}
                  {formData.tourType
                    .filter((type) => !TOUR_TYPES.includes(type))
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
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add custom type..."
                    value={customTourTypeInput}
                    onChange={(e) => setCustomTourTypeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (customTourTypeInput.trim() && !formData.tourType.includes(customTourTypeInput.trim())) {
                          updateFormData("tourType", [...formData.tourType, customTourTypeInput.trim()])
                          setCustomTourTypeInput("")
                        }
                      }
                    }}
                    className="max-w-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (customTourTypeInput.trim() && !formData.tourType.includes(customTourTypeInput.trim())) {
                        updateFormData("tourType", [...formData.tourType, customTourTypeInput.trim()])
                        setCustomTourTypeInput("")
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.tourType && (
                  <p className="text-sm text-destructive">{errors.tourType}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Best Season to Visit</Label>
                <div className="flex flex-wrap gap-2">
                  {SEASONS.map((season) => (
                    <Badge
                      key={season}
                      variant={formData.bestSeason.includes(season) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem("bestSeason", season)}
                    >
                      {season}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Tour Highlights</Label>
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
                    type="button"
                    variant="outline"
                    onClick={() => addListItem("highlights", highlightInput, setHighlightInput)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.highlights.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <span className="text-sm">{item}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeListItem("highlights", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label>What&apos;s Included</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Airport transfers"
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
                      type="button"
                      variant="outline"
                      onClick={() => addListItem("included", includedInput, setIncludedInput)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.included.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                      >
                        <span>{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListItem("included", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>What&apos;s Not Included</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Travel insurance"
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
                      type="button"
                      variant="outline"
                      onClick={() => addListItem("excluded", excludedInput, setExcludedInput)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.excluded.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-2 text-sm"
                      >
                        <span>{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListItem("excluded", index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Itinerary (after Stays & Add-ons are defined) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Day-by-Day Itinerary
                    </CardTitle>
                    <CardDescription>
                      Plan each day of the tour with activities, meals, and accommodation
                    </CardDescription>
                  </div>
                  <Button onClick={addItineraryDay}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Day
                  </Button>
                </CardHeader>
                <CardContent>
                  {formData.itinerary.length === 0 ? (
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
                      {formData.itinerary.map((day) => (
                        <ItineraryDayCard
                          key={day.id}
                          day={day}
                          accommodations={formData.accommodations}
                          addons={formData.addons}
                          onUpdate={(data) => updateItineraryDay(day.id, data)}
                          onRemove={() => removeItineraryDay(day.id)}
                          onToggleMeal={(meal) => toggleMeal(day.id, meal)}
                          onAddActivity={(activity) => addActivity(day.id, activity)}
                          onRemoveActivity={(index) => removeActivity(day.id, index)}
                          onToggleAccommodation={(accId) => toggleDayAccommodation(day.id, accId)}
                          onSetDefaultAccommodation={(accId) => setDefaultAccommodation(day.id, accId)}
                          onToggleAddon={(addonId) => toggleDayAddon(day.id, addonId)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Stays (Accommodations) - Define accommodation pool */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      Accommodation Options
                    </CardTitle>
                    <CardDescription>
                      Add different accommodation tiers for travelers to choose from (optional)
                    </CardDescription>
                  </div>
                  <Dialog open={accommodationDialogOpen} onOpenChange={setAccommodationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stay
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Accommodation Option</DialogTitle>
                        <DialogDescription>
                          Add a new accommodation tier for this tour
                        </DialogDescription>
                      </DialogHeader>
                      <AccommodationFormCreate
                        onSubmit={(acc) => {
                          addAccommodation(acc)
                          setAccommodationDialogOpen(false)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {formData.accommodations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Hotel className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No accommodation options added yet</p>
                      <p className="text-sm">Add accommodation tiers like Budget, Mid-range, or Luxury</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.accommodations.map((acc) => (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAccommodation(acc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Add-ons - Define activities pool */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Activity Add-ons
                    </CardTitle>
                    <CardDescription>
                      Optional activities travelers can add to their booking
                    </CardDescription>
                  </div>
                  <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Activity
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Activity Add-on</DialogTitle>
                        <DialogDescription>
                          Add an optional activity for this tour
                        </DialogDescription>
                      </DialogHeader>
                      <AddonFormCreate
                        durationDays={formData.durationDays}
                        onSubmit={(addon) => {
                          addAddon(addon)
                          setAddonDialogOpen(false)
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {formData.addons.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No activity add-ons yet</p>
                      <p className="text-sm">Add optional experiences like hot air balloon rides or cultural visits</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.addons.map((addon) => (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAddon(addon.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 6: Images */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label>Cover Image URL</Label>
                <p className="text-sm text-muted-foreground">
                  Enter a URL for your main tour image
                </p>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.coverImage}
                  onChange={(e) => updateFormData("coverImage", e.target.value)}
                />
                {formData.coverImage && (
                  <div className="mt-2 relative aspect-video rounded-lg overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none"
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Gallery Images</Label>
                <p className="text-sm text-muted-foreground">
                  Add URLs for additional tour images
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/gallery-image.jpg"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addListItem("images", imageInput, setImageInput)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addListItem("images", imageInput, setImageInput)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E"
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeListItem("images", index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  File upload coming soon
                </p>
                <p className="text-xs text-muted-foreground">
                  For now, please use image URLs from services like Unsplash or Cloudinary
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Your Tour</h3>

              <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Basic Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title:</span>
                      <span className="font-medium">{formData.title || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destination:</span>
                      <span>{formData.destination}, {formData.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formData.durationDays}D / {formData.durationNights}N</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adult Price:</span>
                      <span className="font-medium">${formData.basePrice}</span>
                    </div>
                    {formData.childPrice !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Child Price:</span>
                        <span>${formData.childPrice}</span>
                      </div>
                    )}
                    {formData.infantPrice !== null && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Infant Price:</span>
                        <span>${formData.infantPrice}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Group Size:</span>
                      <span>Max {formData.maxGroupSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span>{formData.difficulty}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tour Types:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.tourType.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                        {formData.tourType.length === 0 && (
                          <span className="text-muted-foreground">None selected</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Highlights:</span>
                      <span className="ml-2">{formData.highlights.length} items</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Included:</span>
                      <span className="ml-2">{formData.included.length} items</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Excluded:</span>
                      <span className="ml-2">{formData.excluded.length} items</span>
                    </div>
                    <div className="pt-2 border-t">
                      <span className="text-muted-foreground">Itinerary:</span>
                      <span className="ml-2">{formData.itinerary.length} days planned</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accommodations:</span>
                      <span className="ml-2">{formData.accommodations.length} options</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Activity Add-ons:</span>
                      <span className="ml-2">{formData.addons.length} activities</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {formData.coverImage ? (
                      <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.coverImage}
                          alt="Cover"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-20 rounded-lg border-2 border-dashed flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-sm">
                      <p>{formData.coverImage ? "Cover image set" : "No cover image"}</p>
                      <p className="text-muted-foreground">
                        {formData.images.length} gallery images
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Your tour will be saved as a <strong>Draft</strong>. You can edit it and add
                  an itinerary before publishing it to make it visible to travelers.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Create Tour
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}

// Accommodation Form Component for Creating
function AccommodationFormCreate({
  onSubmit,
}: {
  onSubmit: (acc: Omit<AccommodationData, "id">) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tier, setTier] = useState("mid-range")
  const [pricePerNight, setPricePerNight] = useState(0)
  const [location, setLocation] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState("")

  const handleSubmit = () => {
    if (!name || pricePerNight <= 0) return
    onSubmit({
      name,
      description,
      tier,
      pricePerNight,
      location,
      rating,
      amenities,
    })
  }

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()])
      setAmenityInput("")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="acc-name">Name *</Label>
        <Input
          id="acc-name"
          placeholder="e.g., Sarova Mara Game Camp"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="acc-description">Description</Label>
        <Textarea
          id="acc-description"
          placeholder="Describe the accommodation..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="acc-tier">Tier *</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger>
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              {ACCOMMODATION_TIERS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="acc-price">Price per Night (USD) *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="acc-price"
              type="number"
              min={0}
              value={pricePerNight}
              onChange={(e) => setPricePerNight(parseFloat(e.target.value) || 0)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="acc-location">Location</Label>
          <Input
            id="acc-location"
            placeholder="e.g., Inside the reserve"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            value={rating ?? ""}
            onChange={(e) => setRating(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Amenities</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Swimming pool"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addAmenity()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addAmenity}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {amenities.map((a, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {a}
                <button
                  onClick={() => setAmenities(amenities.filter((_, idx) => idx !== i))}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!name || pricePerNight <= 0}>
          Add Accommodation
        </Button>
      </DialogFooter>
    </div>
  )
}

// Addon Form Component for Creating
function AddonFormCreate({
  durationDays,
  onSubmit,
}: {
  durationDays: number
  onSubmit: (addon: Omit<AddonData, "id">) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState(0)
  const [duration, setDuration] = useState("")
  const [maxCapacity, setMaxCapacity] = useState<number | null>(null)
  const [dayAvailable, setDayAvailable] = useState<number[]>([])

  const handleSubmit = () => {
    if (!name || price <= 0) return
    onSubmit({
      name,
      description,
      price,
      duration,
      maxCapacity,
      dayAvailable,
    })
  }

  const toggleDay = (day: number) => {
    if (dayAvailable.includes(day)) {
      setDayAvailable(dayAvailable.filter((d) => d !== day))
    } else {
      setDayAvailable([...dayAvailable, day].sort((a, b) => a - b))
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="addon-name">Activity Name *</Label>
        <Input
          id="addon-name"
          placeholder="e.g., Hot Air Balloon Safari"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="addon-description">Description</Label>
        <Textarea
          id="addon-description"
          placeholder="Describe the activity..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="addon-price">Price (USD) *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="addon-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="addon-duration">Duration</Label>
          <Input
            id="addon-duration"
            placeholder="e.g., 1.5 hours"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="addon-capacity">Max Capacity</Label>
        <Input
          id="addon-capacity"
          type="number"
          min={1}
          placeholder="Leave empty for unlimited"
          value={maxCapacity ?? ""}
          onChange={(e) => setMaxCapacity(e.target.value ? parseInt(e.target.value) : null)}
        />
      </div>

      {durationDays > 1 && (
        <div className="space-y-2">
          <Label>Available Days</Label>
          <p className="text-sm text-muted-foreground">
            Select which days this activity is available (leave empty for all days)
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: durationDays }, (_, i) => i + 1).map((day) => (
              <Badge
                key={day}
                variant={dayAvailable.includes(day) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleDay(day)}
              >
                Day {day}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={!name || price <= 0}>
          Add Activity
        </Button>
      </DialogFooter>
    </div>
  )
}

// Itinerary Day Card Component - Enhanced with accommodation and add-on selection
function ItineraryDayCard({
  day,
  accommodations,
  addons,
  onUpdate,
  onRemove,
  onToggleMeal,
  onAddActivity,
  onRemoveActivity,
  onToggleAccommodation,
  onSetDefaultAccommodation,
  onToggleAddon,
}: {
  day: ItineraryData
  accommodations: AccommodationData[]
  addons: AddonData[]
  onUpdate: (data: Partial<ItineraryData>) => void
  onRemove: () => void
  onToggleMeal: (meal: string) => void
  onAddActivity: (activity: string) => void
  onRemoveActivity: (index: number) => void
  onToggleAccommodation: (accId: string) => void
  onSetDefaultAccommodation: (accId: string) => void
  onToggleAddon: (addonId: string) => void
}) {
  const [activityInput, setActivityInput] = useState("")

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {day.dayNumber}
            </div>
            <div className="space-y-1">
              <Input
                value={day.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="font-semibold"
                placeholder={`Day ${day.dayNumber} Title`}
              />
              <Input
                value={day.location}
                onChange={(e) => onUpdate({ location: e.target.value })}
                className="text-sm"
                placeholder="Location (e.g., Masai Mara National Reserve)"
              />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onRemove}>
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
            onChange={(e) => onUpdate({ description: e.target.value })}
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
                onClick={() => onToggleMeal(meal)}
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
              value={activityInput}
              onChange={(e) => setActivityInput(e.target.value)}
              placeholder="Add an activity..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  onAddActivity(activityInput)
                  setActivityInput("")
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onAddActivity(activityInput)
                setActivityInput("")
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {day.activities.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {day.activities.map((activity, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {activity}
                  <button
                    onClick={() => onRemoveActivity(i)}
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
        {accommodations.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <Label className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Overnight Stay Options
            </Label>
            <p className="text-xs text-muted-foreground">
              Select which accommodations are available for this night. Clients can choose from these options when booking.
            </p>
            <div className="space-y-2">
              {accommodations.map((acc) => {
                const isAvailable = day.availableAccommodationIds.includes(acc.id)
                const isDefault = day.defaultAccommodationId === acc.id
                return (
                  <div
                    key={acc.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                      isAvailable ? "bg-primary/5 border-primary" : "hover:bg-muted"
                    )}
                    onClick={() => onToggleAccommodation(acc.id)}
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
                          onSetDefaultAccommodation(acc.id)
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
        {addons.length > 0 && (
          <div className="space-y-2 pt-3 border-t">
            <Label className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Available Add-ons This Day
            </Label>
            <p className="text-xs text-muted-foreground">
              Select which add-on activities can be purchased for this day.
            </p>
            <div className="flex flex-wrap gap-2">
              {addons.map((addon) => {
                const isSelected = day.availableAddonIds.includes(addon.id)
                return (
                  <Badge
                    key={addon.id}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => onToggleAddon(addon.id)}
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
  )
}
