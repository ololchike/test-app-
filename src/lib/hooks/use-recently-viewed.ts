"use client"

import { useState, useEffect, useCallback } from "react"

interface ViewedTour {
  id: string
  slug: string
  title: string
  destination: string
  coverImage: string
  basePrice: number
  viewedAt: number
}

const STORAGE_KEY = "safariplus_recently_viewed"
const MAX_ITEMS = 10

export function useRecentlyViewed() {
  const [viewedTours, setViewedTours] = useState<ViewedTour[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as ViewedTour[]
        // Filter out items older than 30 days
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        const filtered = parsed.filter((t) => t.viewedAt > thirtyDaysAgo)
        setViewedTours(filtered)
      }
    } catch (error) {
      console.error("Error loading recently viewed:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage when viewedTours changes
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined") return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewedTours))
    } catch (error) {
      console.error("Error saving recently viewed:", error)
    }
  }, [viewedTours, isLoaded])

  // Add a tour to recently viewed
  const addTour = useCallback(
    (tour: Omit<ViewedTour, "viewedAt">) => {
      setViewedTours((prev) => {
        // Remove if already exists
        const filtered = prev.filter((t) => t.id !== tour.id)

        // Add to beginning with timestamp
        const newTour: ViewedTour = {
          ...tour,
          viewedAt: Date.now(),
        }

        // Keep only MAX_ITEMS
        return [newTour, ...filtered].slice(0, MAX_ITEMS)
      })
    },
    []
  )

  // Remove a tour from recently viewed
  const removeTour = useCallback((tourId: string) => {
    setViewedTours((prev) => prev.filter((t) => t.id !== tourId))
  }, [])

  // Clear all recently viewed
  const clearAll = useCallback(() => {
    setViewedTours([])
  }, [])

  return {
    viewedTours,
    addTour,
    removeTour,
    clearAll,
    isLoaded,
  }
}
