"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getPusherClient,
  PUSHER_EVENTS,
  getUserChannel,
} from "@/lib/pusher/client"

interface UnreadBadgeProps {
  className?: string
  variant?: "default" | "secondary"
}

export function UnreadBadge({ className, variant = "default" }: UnreadBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: session } = useSession()

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/messages/unread")
      const data = await response.json()
      if (data.success) {
        setUnreadCount(data.data.unreadCount)
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error)
    }
  }, [])

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    if (!session?.user?.id) return

    fetchUnreadCount()

    // Poll every 30 seconds as a fallback
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id, fetchUnreadCount])

  // Subscribe to Pusher for real-time updates
  useEffect(() => {
    if (!session?.user?.id) return

    const pusher = getPusherClient()
    if (!pusher) return // Skip if Pusher not configured

    const channel = pusher.subscribe(getUserChannel(session.user.id))

    // Increment count when new message is received
    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, () => {
      setUnreadCount((prev) => prev + 1)
    })

    // Also listen for message read events to potentially decrement
    channel.bind(PUSHER_EVENTS.MESSAGE_READ, () => {
      // Refetch to get accurate count after messages are read
      fetchUnreadCount()
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(getUserChannel(session.user.id))
    }
  }, [session?.user?.id, fetchUnreadCount])

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
