"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  FileText,
  Sparkles,
  Hotel,
  Calendar,
  Image as ImageIcon,
  MapPin,
  Car,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { TourFormProvider, useTourForm } from "./tour-form-context"
import {
  DetailsStep,
  FeaturesStep,
  VehiclesStep,
  AccommodationsStep,
  AddonsStep,
  ItineraryStep,
  ImagesStep,
  ReviewStep,
} from "./steps"
import type { WizardStep, TourFormData } from "./types"

// Step configuration
const STEPS: WizardStep[] = [
  { id: 1, title: "Details", icon: FileText, description: "Basic information" },
  { id: 2, title: "Features", icon: Tag, description: "Tour types & highlights" },
  { id: 3, title: "Vehicles", icon: Car, description: "Safari vehicles" },
  { id: 4, title: "Stays", icon: Hotel, description: "Accommodation options" },
  { id: 5, title: "Add-ons", icon: Sparkles, description: "Optional activities" },
  { id: 6, title: "Itinerary", icon: Calendar, description: "Day-by-day plan" },
  { id: 7, title: "Images", icon: ImageIcon, description: "Photos & media" },
  { id: 8, title: "Review", icon: MapPin, description: "Final check" },
]

interface TourWizardContentProps {
  onSubmit?: (data: TourFormData) => Promise<void>
  isEditing?: boolean
  tourId?: string
  backUrl?: string
}

function TourWizardContent({ onSubmit, isEditing, tourId, backUrl = "/agent/tours" }: TourWizardContentProps) {
  const router = useRouter()
  const { formData, errors, setErrors } = useTourForm()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Helper to strip HTML tags for text length validation
  const stripHtml = (html: string) => {
    if (typeof document === "undefined") return html
    const tmp = document.createElement("div")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Validation for each step
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
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        // Default submission logic
        await submitTour(formData, tourId)
      }
      toast.success(isEditing ? "Tour updated successfully!" : "Tour created successfully!")
      router.push("/agent/tours")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save tour")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Current step component
  const StepComponent = useMemo(() => {
    switch (currentStep) {
      case 1:
        return <DetailsStep />
      case 2:
        return <FeaturesStep />
      case 3:
        return <VehiclesStep />
      case 4:
        return <AccommodationsStep />
      case 5:
        return <AddonsStep />
      case 6:
        return <ItineraryStep />
      case 7:
        return <ImagesStep />
      case 8:
        return <ReviewStep />
      default:
        return null
    }
  }, [currentStep])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href={backUrl}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Tour" : "Create New Tour"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update your tour listing details"
              : "Fill in the details to create your tour listing"}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-max">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => {
                  // Allow navigation to previous steps
                  if (step.id < currentStep) {
                    setCurrentStep(step.id)
                  }
                }}
                disabled={step.id > currentStep}
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground cursor-pointer"
                      : currentStep === step.id
                      ? "border-primary text-primary"
                      : "border-muted text-muted-foreground cursor-not-allowed"
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
                    "mt-2 text-xs font-medium hidden sm:block whitespace-nowrap",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </button>
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
          {StepComponent}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        {currentStep === STEPS.length ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {isEditing ? "Update Tour" : "Create Tour"}
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Default tour submission function
async function submitTour(formData: TourFormData, existingTourId?: string) {
  const isEditing = !!existingTourId

  // Create or update the tour
  const tourResponse = await fetch(
    isEditing ? `/api/agent/tours/${existingTourId}` : "/api/agent/tours",
    {
      method: isEditing ? "PUT" : "POST",
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
        minGroupSize: formData.minGroupSize,
        maxGroupSize: formData.maxGroupSize,
        depositEnabled: formData.depositEnabled,
        depositPercentage: formData.depositPercentage,
        freeCancellationDays: formData.freeCancellationDays,
        difficulty: formData.difficulty,
        tourType: formData.tourType,
        highlights: formData.highlights,
        included: formData.included,
        excluded: formData.excluded,
        bestSeason: formData.bestSeason,
        coverImage: formData.coverImage || null,
        images: formData.images,
        videoUrl: formData.videoUrl || null,
      }),
    }
  )

  const tourData = await tourResponse.json()

  if (!tourResponse.ok) {
    throw new Error(tourData.error || "Failed to save tour")
  }

  const tourId = existingTourId || tourData.tour.id

  // Create vehicles
  for (const vehicle of formData.vehicles) {
    await fetch(`/api/agent/tours/${tourId}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: vehicle.type,
        name: vehicle.name,
        description: vehicle.description || null,
        maxPassengers: vehicle.maxPassengers,
        pricePerDay: vehicle.pricePerDay,
        features: vehicle.features,
        images: vehicle.images,
        isDefault: vehicle.isDefault,
        isActive: vehicle.isActive,
      }),
    })
  }

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
        roomType: acc.roomType || null,
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
        type: addon.type || "ACTIVITY",
        category: addon.category || "ADVENTURE",
        priceType: addon.priceType || "PER_PERSON",
        childPrice: addon.childPrice,
        isPopular: addon.isPopular || false,
      }),
    })
  }

  // Create itinerary
  for (const day of formData.itinerary) {
    const defaultAcc = formData.accommodations.find(
      (a) => a.id === day.defaultAccommodationId
    )
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
        availableAccommodationIds: day.availableAccommodationIds,
        defaultAccommodationId: day.defaultAccommodationId,
        availableAddonIds: day.availableAddonIds,
      }),
    })
  }

  return tourData
}

// Main export with provider
interface TourWizardProps {
  initialData?: Partial<TourFormData>
  onSubmit?: (data: TourFormData) => Promise<void>
  isEditing?: boolean
  tourId?: string
  backUrl?: string
}

export function TourWizard({
  initialData,
  onSubmit,
  isEditing,
  tourId,
  backUrl,
}: TourWizardProps) {
  return (
    <TourFormProvider initialData={initialData}>
      <TourWizardContent
        onSubmit={onSubmit}
        isEditing={isEditing}
        tourId={tourId}
        backUrl={backUrl}
      />
    </TourFormProvider>
  )
}
