"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  getPusherClient,
  PUSHER_EVENTS,
  getConversationChannel,
  getUserChannel,
} from "@/lib/pusher/client"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  isRead: boolean
  sender: {
    id: string
    name: string | null
    avatar: string | null
  }
}

interface Participant {
  id: string
  name: string | null
  avatar: string | null
  role: string
}

interface Conversation {
  id: string
  subject: string | null
  bookingId: string | null
  lastMessageAt: string
  participants: Array<{
    userId: string
    user: Participant
  }>
}

interface UseMessagesOptions {
  conversationId: string
  onNewMessage?: (message: Message) => void
}

export function useMessages({ conversationId, onNewMessage }: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const channelRef = useRef<ReturnType<Exclude<ReturnType<typeof getPusherClient>, null>["subscribe"]> | null>(null)

  // Fetch initial messages
  const fetchMessages = useCallback(async (cursor?: string) => {
    try {
      setIsLoading(true)
      const url = new URL("/api/messages", window.location.origin)
      url.searchParams.set("conversationId", conversationId)
      if (cursor) {
        url.searchParams.set("cursor", cursor)
      }

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.success) {
        if (cursor) {
          setMessages((prev) => [...data.data.messages, ...prev])
        } else {
          setMessages(data.data.messages)
          setConversation(data.data.conversation)
        }
        setHasMore(data.data.hasMore)
        setNextCursor(data.data.nextCursor)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch messages")
    } finally {
      setIsLoading(false)
    }
  }, [conversationId])

  // Load more messages
  const loadMore = useCallback(() => {
    if (nextCursor && !isLoading) {
      fetchMessages(nextCursor)
    }
  }, [nextCursor, isLoading, fetchMessages])

  // Send a message
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content }),
        })
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error)
        }
        return data.data
      } catch (err) {
        throw err
      }
    },
    [conversationId]
  )

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Subscribe to real-time updates
  useEffect(() => {
    const pusher = getPusherClient()
    if (!pusher) return // Skip if Pusher not configured

    const channel = pusher.subscribe(getConversationChannel(conversationId))

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (message: Message) => {
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
      onNewMessage?.(message)
    })

    channel.bind(
      PUSHER_EVENTS.MESSAGE_READ,
      (data: { userId: string; readAt: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId !== data.userId ? { ...m, isRead: true } : m
          )
        )
      }
    )

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(getConversationChannel(conversationId))
    }
  }, [conversationId, onNewMessage])

  return {
    messages,
    conversation,
    isLoading,
    error,
    hasMore,
    loadMore,
    sendMessage,
    refetch: () => fetchMessages(),
  }
}

// Hook for unread message count
export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { data: session } = useSession()

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch("/api/messages/unread")
      const data = await response.json()
      if (data.success) {
        setUnreadCount(data.data.unreadCount)
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount()
    }
  }, [session?.user?.id, fetchUnreadCount])

  // Subscribe to user channel for new message notifications
  useEffect(() => {
    if (!session?.user?.id) return

    const pusher = getPusherClient()
    if (!pusher) return // Skip if Pusher not configured

    const channel = pusher.subscribe(getUserChannel(session.user.id))

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, () => {
      setUnreadCount((prev) => prev + 1)
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(getUserChannel(session.user.id))
    }
  }, [session?.user?.id])

  return { unreadCount, isLoading, refetch: fetchUnreadCount }
}

// Hook for conversations list
export function useConversations() {
  const [conversations, setConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 0 })
  const { data: session } = useSession()

  const fetchConversations = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/messages/conversations?page=${page}&limit=20`
      )
      const data = await response.json()

      if (data.success) {
        setConversations(data.data)
        setMeta(data.meta)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Failed to fetch conversations")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.id) {
      fetchConversations()
    }
  }, [session?.user?.id, fetchConversations])

  // Subscribe to user channel for updates
  useEffect(() => {
    if (!session?.user?.id) return

    const pusher = getPusherClient()
    if (!pusher) return // Skip if Pusher not configured

    const channel = pusher.subscribe(getUserChannel(session.user.id))

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, () => {
      // Refetch conversations to update the list
      fetchConversations(meta.page)
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(getUserChannel(session.user.id))
    }
  }, [session?.user?.id, fetchConversations, meta.page])

  return {
    conversations,
    isLoading,
    error,
    meta,
    refetch: () => fetchConversations(meta.page),
    goToPage: (page: number) => fetchConversations(page),
  }
}
