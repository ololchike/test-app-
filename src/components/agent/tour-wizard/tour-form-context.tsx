"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type {
  TourFormData,
  TourFormContextType,
  ItineraryData,
  AccommodationData,
  AddonData,
  VehicleData,
} from "./types"
import { INITIAL_FORM_DATA } from "./types"

const TourFormContext = createContext<TourFormContextType | null>(null)

export function useTourForm() {
  const context = useContext(TourFormContext)
  if (!context) {
    throw new Error("useTourForm must be used within a TourFormProvider")
  }
  return context
}

interface TourFormProviderProps {
  children: ReactNode
  initialData?: Partial<TourFormData>
}

export function TourFormProvider({ children, initialData }: TourFormProviderProps) {
  const [formData, setFormData] = useState<TourFormData>({
    ...INITIAL_FORM_DATA,
    ...initialData,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ============================================================================
  // CORE FORM HELPERS
  // ============================================================================

  const updateFormData = useCallback(<K extends keyof TourFormData>(
    field: K,
    value: TourFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
      return prev
    })
  }, [])

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      }
      return prev
    })
  }, [])

  // ============================================================================
  // LIST HELPERS
  // ============================================================================

  const toggleArrayItem = useCallback((field: keyof TourFormData, item: string) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      const newArray = currentArray.includes(item)
        ? currentArray.filter((i) => i !== item)
        : [...currentArray, item]
      return { ...prev, [field]: newArray }
    })
  }, [])

  const addListItem = useCallback((field: keyof TourFormData, value: string) => {
    if (!value.trim()) return
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      if (currentArray.includes(value.trim())) return prev
      return { ...prev, [field]: [...currentArray, value.trim()] }
    })
  }, [])

  const removeListItem = useCallback((field: keyof TourFormData, index: number) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[]
      return { ...prev, [field]: currentArray.filter((_, i) => i !== index) }
    })
  }, [])

  // ============================================================================
  // ITINERARY HELPERS
  // ============================================================================

  const addItineraryDay = useCallback(() => {
    setFormData((prev) => {
      const nextDayNumber = prev.itinerary.length + 1
      const defaultAccId = prev.accommodations.length > 0 ? prev.accommodations[0].id : null
      const newDay: ItineraryData = {
        id: `temp-${Date.now()}`,
        dayNumber: nextDayNumber,
        title: `Day ${nextDayNumber}`,
        description: "",
        location: "",
        meals: [],
        activities: [],
        availableAccommodationIds: prev.accommodations.map((a) => a.id),
        defaultAccommodationId: defaultAccId,
        availableAddonIds: [],
      }
      return { ...prev, itinerary: [...prev.itinerary, newDay] }
    })
  }, [])

  const updateItineraryDay = useCallback((id: string, data: Partial<ItineraryData>) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((day) =>
        day.id === id ? { ...day, ...data } : day
      ),
    }))
  }, [])

  const removeItineraryDay = useCallback((id: string) => {
    setFormData((prev) => {
      const filtered = prev.itinerary.filter((d) => d.id !== id)
      const renumbered = filtered.map((day, index) => ({
        ...day,
        dayNumber: index + 1,
        title: day.title.startsWith("Day ") ? `Day ${index + 1}` : day.title,
      }))
      return { ...prev, itinerary: renumbered }
    })
  }, [])

  const toggleMeal = useCallback((dayId: string, meal: string) => {
    setFormData((prev) => {
      const day = prev.itinerary.find((d) => d.id === dayId)
      if (!day) return prev
      const meals = day.meals.includes(meal)
        ? day.meals.filter((m) => m !== meal)
        : [...day.meals, meal]
      return {
        ...prev,
        itinerary: prev.itinerary.map((d) =>
          d.id === dayId ? { ...d, meals } : d
        ),
      }
    })
  }, [])

  const addActivity = useCallback((dayId: string, activity: string) => {
    if (!activity.trim()) return
    setFormData((prev) => {
      const day = prev.itinerary.find((d) => d.id === dayId)
      if (!day) return prev
      return {
        ...prev,
        itinerary: prev.itinerary.map((d) =>
          d.id === dayId
            ? { ...d, activities: [...d.activities, activity.trim()] }
            : d
        ),
      }
    })
  }, [])

  const removeActivity = useCallback((dayId: string, index: number) => {
    setFormData((prev) => {
      const day = prev.itinerary.find((d) => d.id === dayId)
      if (!day) return prev
      return {
        ...prev,
        itinerary: prev.itinerary.map((d) =>
          d.id === dayId
            ? { ...d, activities: d.activities.filter((_, i) => i !== index) }
            : d
        ),
      }
    })
  }, [])

  const toggleDayAccommodation = useCallback((dayId: string, accId: string) => {
    setFormData((prev) => {
      const day = prev.itinerary.find((d) => d.id === dayId)
      if (!day) return prev
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

      return {
        ...prev,
        itinerary: prev.itinerary.map((d) =>
          d.id === dayId
            ? {
                ...d,
                availableAccommodationIds: newAvailable,
                defaultAccommodationId: newDefault,
              }
            : d
        ),
      }
    })
  }, [])

  const setDefaultAccommodation = useCallback((dayId: string, accId: string) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary.map((d) =>
        d.id === dayId ? { ...d, defaultAccommodationId: accId } : d
      ),
    }))
  }, [])

  const toggleDayAddon = useCallback((dayId: string, addonId: string) => {
    setFormData((prev) => {
      const day = prev.itinerary.find((d) => d.id === dayId)
      if (!day) return prev
      const isSelected = day.availableAddonIds.includes(addonId)
      const newAvailable = isSelected
        ? day.availableAddonIds.filter((id) => id !== addonId)
        : [...day.availableAddonIds, addonId]
      return {
        ...prev,
        itinerary: prev.itinerary.map((d) =>
          d.id === dayId ? { ...d, availableAddonIds: newAvailable } : d
        ),
      }
    })
  }, [])

  // ============================================================================
  // ACCOMMODATION HELPERS
  // ============================================================================

  const addAccommodation = useCallback((acc: Omit<AccommodationData, "id">) => {
    const newAcc: AccommodationData = {
      ...acc,
      id: `temp-${Date.now()}`,
    }
    setFormData((prev) => ({
      ...prev,
      accommodations: [...prev.accommodations, newAcc],
    }))
  }, [])

  const updateAccommodation = useCallback((id: string, data: Partial<AccommodationData>) => {
    setFormData((prev) => ({
      ...prev,
      accommodations: prev.accommodations.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    }))
  }, [])

  const removeAccommodation = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      accommodations: prev.accommodations.filter((a) => a.id !== id),
      // Also remove from itinerary references
      itinerary: prev.itinerary.map((day) => ({
        ...day,
        availableAccommodationIds: day.availableAccommodationIds.filter((accId) => accId !== id),
        defaultAccommodationId: day.defaultAccommodationId === id ? null : day.defaultAccommodationId,
      })),
    }))
  }, [])

  // ============================================================================
  // ADD-ON HELPERS
  // ============================================================================

  const addAddon = useCallback((addon: Omit<AddonData, "id">) => {
    const newAddon: AddonData = {
      ...addon,
      id: `temp-${Date.now()}`,
    }
    setFormData((prev) => ({
      ...prev,
      addons: [...prev.addons, newAddon],
    }))
  }, [])

  const updateAddon = useCallback((id: string, data: Partial<AddonData>) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.map((a) => (a.id === id ? { ...a, ...data } : a)),
    }))
  }, [])

  const removeAddon = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      addons: prev.addons.filter((a) => a.id !== id),
      // Also remove from itinerary references
      itinerary: prev.itinerary.map((day) => ({
        ...day,
        availableAddonIds: day.availableAddonIds.filter((addonId) => addonId !== id),
      })),
    }))
  }, [])

  // ============================================================================
  // VEHICLE HELPERS
  // ============================================================================

  const addVehicle = useCallback((vehicle: Omit<VehicleData, "id">) => {
    const newVehicle: VehicleData = {
      ...vehicle,
      id: `temp-${Date.now()}`,
    }
    setFormData((prev) => {
      // If this is the first vehicle or marked as default, ensure only one default
      const vehicles = vehicle.isDefault
        ? prev.vehicles.map((v) => ({ ...v, isDefault: false }))
        : prev.vehicles
      return {
        ...prev,
        vehicles: [...vehicles, newVehicle],
      }
    })
  }, [])

  const updateVehicle = useCallback((id: string, data: Partial<VehicleData>) => {
    setFormData((prev) => {
      let vehicles = prev.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v))
      // If setting as default, unset others
      if (data.isDefault) {
        vehicles = vehicles.map((v) =>
          v.id === id ? v : { ...v, isDefault: false }
        )
      }
      return { ...prev, vehicles }
    })
  }, [])

  const removeVehicle = useCallback((id: string) => {
    setFormData((prev) => {
      const filtered = prev.vehicles.filter((v) => v.id !== id)
      // If we removed the default, set first as default
      const hadDefault = prev.vehicles.find((v) => v.id === id)?.isDefault
      if (hadDefault && filtered.length > 0) {
        filtered[0].isDefault = true
      }
      return { ...prev, vehicles: filtered }
    })
  }, [])

  const setDefaultVehicle = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => ({
        ...v,
        isDefault: v.id === id,
      })),
    }))
  }, [])

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: TourFormContextType = {
    formData,
    updateFormData,
    errors,
    setErrors,
    clearError,
    toggleArrayItem,
    addListItem,
    removeListItem,
    addItineraryDay,
    updateItineraryDay,
    removeItineraryDay,
    toggleMeal,
    addActivity,
    removeActivity,
    toggleDayAccommodation,
    setDefaultAccommodation,
    toggleDayAddon,
    addAccommodation,
    updateAccommodation,
    removeAccommodation,
    addAddon,
    updateAddon,
    removeAddon,
    addVehicle,
    updateVehicle,
    removeVehicle,
    setDefaultVehicle,
  }

  return (
    <TourFormContext.Provider value={value}>
      {children}
    </TourFormContext.Provider>
  )
}
