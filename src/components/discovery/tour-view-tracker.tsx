"use client"

import { useEffect } from "react"
import { useRecentlyViewed } from "@/lib/hooks/use-recently-viewed"

interface TourViewTrackerProps {
  tour: {
    id: string
    slug: string
    title: string
    destination: string
    coverImage: string
    basePrice: number
  }
}

export function TourViewTracker({ tour }: TourViewTrackerProps) {
  const { addTour } = useRecentlyViewed()

  useEffect(() => {
    // Track the tour view after a short delay (to ensure user is actually viewing)
    const timeoutId = setTimeout(() => {
      addTour({
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        destination: tour.destination,
        coverImage: tour.coverImage,
        basePrice: tour.basePrice,
      })
    }, 2000) // Track after 2 seconds of viewing

    return () => clearTimeout(timeoutId)
  }, [tour, addTour])

  // This component doesn't render anything
  return null
}
