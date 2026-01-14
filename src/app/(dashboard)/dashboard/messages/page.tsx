"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { MessageSquare, Users, Clock, Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChatContainer } from "@/components/messages/chat-container"
import { useUnreadCount, useConversations } from "@/hooks/use-messages"
import { toast } from "sonner"

function ClientMessagesContent() {
  const { unreadCount } = useUnreadCount()
  const { conversations, refetch: refetchConversations } = useConversations()
  const [hasPusherConfig, setHasPusherConfig] = useState(true)
  const [initialConversationId, setInitialConversationId] = useState<string | undefined>()
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Check if Pusher is configured
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_PUSHER_KEY ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      setHasPusherConfig(false)
    }
  }, [])

  // Handle query parameters for starting new conversations
  useEffect(() => {
    const agentId = searchParams.get("agentId")
    const tourId = searchParams.get("tourId")
    const bookingRef = searchParams.get("bookingRef")

    if (agentId && !isCreatingConversation) {
      setIsCreatingConversation(true)

      // Build subject based on context
      let subject = ""
      if (tourId) {
        subject = `Inquiry about tour`
      } else if (bookingRef) {
        subject = `Regarding booking ${bookingRef}`
      }

      // Create or get existing conversation with the agent
      fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: agentId,
          subject: subject || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInitialConversationId(data.data.id)
            refetchConversations()
            // Clear query params from URL without page reload
            router.replace("/dashboard/messages", { scroll: false })
          } else {
            toast.error(data.error || "Failed to start conversation")
          }
        })
        .catch((error) => {
          console.error("Error creating conversation:", error)
          toast.error("Failed to start conversation")
        })
        .finally(() => {
          setIsCreatingConversation(false)
        })
    }
  }, [searchParams, router, refetchConversations, isCreatingConversation])

  const activeConversations = conversations.filter(
    (c) => c.lastMessage !== null
  )

  if (!hasPusherConfig) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Chat with tour operators
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Configuration Required</CardTitle>
            <CardDescription className="text-sm">
              Real-time messaging requires Pusher to be configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Messaging Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Direct messaging with tour operators will be available soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Chat with tour operators about your bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Unread Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount === 1 ? "New message" : "New messages"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Conversations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{activeConversations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              With tour operators
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-2 sm:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
              Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{"< 2 hrs"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. operator response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Container */}
      {isCreatingConversation ? (
        <Card className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Starting conversation...</p>
          </div>
        </Card>
      ) : (
        <ChatContainer initialConversationId={initialConversationId} />
      )}
    </div>
  )
}

export default function ClientMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ClientMessagesContent />
    </Suspense>
  )
}
