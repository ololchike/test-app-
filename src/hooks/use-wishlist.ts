"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

interface WishlistItem {
  id: string
  tourId: string
  createdAt: string
  tour: {
    id: string
    slug: string
    title: string
    subtitle: string | null
    coverImage: string | null
    destination: string
    country: string
    durationDays: number
    durationNights: number
    basePrice: number
    currency: string
    status: string
    agent: {
      businessName: string
      isVerified: boolean
    }
    rating: number | null
    reviewCount: number
  }
}

// Hook for checking if a tour is in wishlist
export function useWishlistStatus(tourId: string) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  const checkStatus = useCallback(async () => {
    if (!session?.user?.id || !tourId) {
      setIsInWishlist(false)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/wishlist/check?tourId=${tourId}`)
      const data = await response.json()
      setIsInWishlist(data.isInWishlist)
    } catch (error) {
      console.error("Error checking wishlist status:", error)
      setIsInWishlist(false)
    } finally {
      setIsLoading(false)
    }
  }, [tourId, session?.user?.id])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  const toggle = useCallback(async () => {
    if (!session?.user?.id) return false

    try {
      if (isInWishlist) {
        await fetch(`/api/wishlist?tourId=${tourId}`, {
          method: "DELETE",
        })
        setIsInWishlist(false)
      } else {
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tourId }),
        })
        setIsInWishlist(true)
      }
      return true
    } catch (error) {
      console.error("Error toggling wishlist:", error)
      return false
    }
  }, [tourId, isInWishlist, session?.user?.id])

  return { isInWishlist, isLoading, toggle, refetch: checkStatus }
}

// Hook for fetching full wishlist
export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 0 })
  const { data: session } = useSession()

  const fetchWishlist = useCallback(async (page = 1) => {
    if (!session?.user?.id) {
      setItems([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/wishlist?page=${page}&limit=12`)
      const data = await response.json()

      if (data.success) {
        setItems(data.data)
        setMeta(data.meta)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch wishlist")
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  const removeItem = useCallback(
    async (tourId: string) => {
      try {
        await fetch(`/api/wishlist?tourId=${tourId}`, {
          method: "DELETE",
        })
        setItems((prev) => prev.filter((item) => item.tourId !== tourId))
        setMeta((prev) => ({ ...prev, total: prev.total - 1 }))
        return true
      } catch (error) {
        console.error("Error removing from wishlist:", error)
        return false
      }
    },
    []
  )

  return {
    items,
    isLoading,
    error,
    meta,
    refetch: () => fetchWishlist(meta.page),
    goToPage: (page: number) => fetchWishlist(page),
    removeItem,
  }
}
