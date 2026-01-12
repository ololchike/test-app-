"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface UnreadBadgeProps {
  className?: string
  variant?: "default" | "secondary"
}

export function UnreadBadge({ className, variant = "default" }: UnreadBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/messages/unread")
        const data = await response.json()
        if (data.success) {
          setUnreadCount(data.data.unreadCount)
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error)
      }
    }

    fetchUnreadCount()

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  if (unreadCount === 0) return null

  return (
    <Badge
      variant={variant}
      className={cn(
        "h-5 min-w-5 flex items-center justify-center text-xs",
        className
      )}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  )
}
