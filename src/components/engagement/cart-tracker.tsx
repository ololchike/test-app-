"use client"

import { useEffect } from "react"
import { useAbandonedCart } from "@/lib/hooks/use-abandoned-cart"

interface CartTrackerProps {
  bookingId: string
  tourId: string
  tourSlug: string
  tourTitle: string
  tourImage: string
  departureDate: string
  travelers: number
  totalPrice: number
}

export function CartTracker({
  bookingId,
  tourId,
  tourSlug,
  tourTitle,
  tourImage,
  departureDate,
  travelers,
  totalPrice,
}: CartTrackerProps) {
  const { saveCart } = useAbandonedCart()

  useEffect(() => {
    // Save cart data when entering checkout
    saveCart({
      bookingId,
      tourId,
      tourSlug,
      tourTitle,
      tourImage,
      departureDate,
      travelers,
      totalPrice,
    })
  }, [bookingId, tourId, tourSlug, tourTitle, tourImage, departureDate, travelers, totalPrice, saveCart])

  // This component doesn't render anything
  return null
}

// Hook to clear cart on successful payment
export function useClearCartOnSuccess() {
  const { clearCart } = useAbandonedCart()
  return clearCart
}
