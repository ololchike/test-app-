"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface ComparisonTour {
  id: string
  slug: string
  title: string
  destination: string
  country: string
  coverImage: string
  basePrice: number
  durationDays: number
  durationNights: number
  tourType: string[]
  rating?: number
  reviewCount?: number
  agent: {
    businessName: string
    isVerified: boolean
  }
}

interface ComparisonContextType {
  tours: ComparisonTour[]
  addTour: (tour: ComparisonTour) => void
  removeTour: (tourId: string) => void
  clearAll: () => void
  isTourSelected: (tourId: string) => boolean
  canAddMore: boolean
  maxTours: number
}

const MAX_COMPARISON_TOURS = 4

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [tours, setTours] = useState<ComparisonTour[]>([])

  const addTour = useCallback((tour: ComparisonTour) => {
    setTours((prev) => {
      if (prev.length >= MAX_COMPARISON_TOURS) {
        return prev
      }
      if (prev.some((t) => t.id === tour.id)) {
        return prev
      }
      return [...prev, tour]
    })
  }, [])

  const removeTour = useCallback((tourId: string) => {
    setTours((prev) => prev.filter((t) => t.id !== tourId))
  }, [])

  const clearAll = useCallback(() => {
    setTours([])
  }, [])

  const isTourSelected = useCallback(
    (tourId: string) => {
      return tours.some((t) => t.id === tourId)
    },
    [tours]
  )

  const canAddMore = tours.length < MAX_COMPARISON_TOURS

  return (
    <ComparisonContext.Provider
      value={{
        tours,
        addTour,
        removeTour,
        clearAll,
        isTourSelected,
        canAddMore,
        maxTours: MAX_COMPARISON_TOURS,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export function useComparison() {
  const context = useContext(ComparisonContext)
  if (context === undefined) {
    throw new Error("useComparison must be used within a ComparisonProvider")
  }
  return context
}
