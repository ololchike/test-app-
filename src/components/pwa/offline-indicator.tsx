"use client"

import { useOnlineStatus } from "@/lib/hooks/use-online-status"
import { WifiOff, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()
  const [showReconnected, setShowReconnected] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    } else if (wasOffline && isOnline) {
      // Show reconnected message briefly
      setShowReconnected(true)
      const timer = setTimeout(() => {
        setShowReconnected(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (isOnline && !showReconnected) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] py-2 px-4 text-center text-sm font-medium transition-all duration-300",
        isOnline
          ? "bg-green-500 text-white"
          : "bg-yellow-500 text-yellow-900"
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You&apos;re offline. Some features may be unavailable.</span>
          </>
        )}
      </div>
    </div>
  )
}
