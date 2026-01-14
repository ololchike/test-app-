"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "safariplus_abandoned_cart"
const EXPIRY_HOURS = 48 // Cart expires after 48 hours

interface AbandonedCartData {
  bookingId: string
  tourId: string
  tourSlug: string
  tourTitle: string
  tourImage: string
  departureDate: string
  travelers: number
  totalPrice: number
  createdAt: number
  lastUpdated: number
}

interface UseAbandonedCartReturn {
  abandonedCart: AbandonedCartData | null
  isLoaded: boolean
  hasAbandonedCart: boolean
  saveCart: (cart: Omit<AbandonedCartData, "createdAt" | "lastUpdated">) => void
  clearCart: () => void
  updateCart: (updates: Partial<AbandonedCartData>) => void
  getTimeSinceAbandoned: () => string
}

export function useAbandonedCart(): UseAbandonedCartReturn {
  const [abandonedCart, setAbandonedCart] = useState<AbandonedCartData | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const data = JSON.parse(stored) as AbandonedCartData
        // Check if expired
        const hoursSinceCreated = (Date.now() - data.createdAt) / (1000 * 60 * 60)
        if (hoursSinceCreated > EXPIRY_HOURS) {
          // Cart expired, remove it
          localStorage.removeItem(STORAGE_KEY)
          setAbandonedCart(null)
        } else {
          setAbandonedCart(data)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
        setAbandonedCart(null)
      }
    }
    setIsLoaded(true)
  }, [])

  const saveCart = useCallback(
    (cart: Omit<AbandonedCartData, "createdAt" | "lastUpdated">) => {
      const now = Date.now()
      const cartData: AbandonedCartData = {
        ...cart,
        createdAt: abandonedCart?.createdAt || now,
        lastUpdated: now,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartData))
      setAbandonedCart(cartData)
    },
    [abandonedCart]
  )

  const clearCart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAbandonedCart(null)
  }, [])

  const updateCart = useCallback(
    (updates: Partial<AbandonedCartData>) => {
      if (!abandonedCart) return
      const updatedCart = {
        ...abandonedCart,
        ...updates,
        lastUpdated: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCart))
      setAbandonedCart(updatedCart)
    },
    [abandonedCart]
  )

  const getTimeSinceAbandoned = useCallback(() => {
    if (!abandonedCart) return ""
    const hours = Math.floor((Date.now() - abandonedCart.lastUpdated) / (1000 * 60 * 60))
    if (hours < 1) {
      const minutes = Math.floor((Date.now() - abandonedCart.lastUpdated) / (1000 * 60))
      return minutes <= 1 ? "just now" : `${minutes} minutes ago`
    }
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days === 1 ? "" : "s"} ago`
  }, [abandonedCart])

  return {
    abandonedCart,
    isLoaded,
    hasAbandonedCart: !!abandonedCart,
    saveCart,
    clearCart,
    updateCart,
    getTimeSinceAbandoned,
  }
}
