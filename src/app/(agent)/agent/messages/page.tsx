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
import { SectionError } from "@/components/error"

function AgentMessagesContent() {
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

  // Handle query parameters for starting new conversations (e.g., from booking details)
  useEffect(() => {
    const clientId = searchParams.get("clientId")
    const bookingRef = searchParams.get("bookingRef")

    if (clientId && !isCreatingConversation) {
      setIsCreatingConversation(true)

      // Build subject based on context
      let subject = ""
      if (bookingRef) {
        subject = `Regarding booking ${bookingRef}`
      }

      // Create or get existing conversation with the client
      fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: clientId,
          subject: subject || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInitialConversationId(data.data.id)
            refetchConversations()
            // Clear query params from URL without page reload
            router.replace("/agent/messages", { scroll: false })
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

  // Calculate average response time (placeholder for now)
  const avgResponseTime = "< 1 hour"

  if (!hasPusherConfig) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Communicate with your customers
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Required</CardTitle>
            <CardDescription>
              Real-time messaging requires Pusher to be configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                Pusher Not Configured
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                To enable real-time messaging, please add the following
                environment variables:
              </p>
              <div className="mt-4 text-left max-w-md mx-auto bg-muted p-4 rounded-lg font-mono text-sm">
                <p>PUSHER_APP_ID=your_app_id</p>
                <p>PUSHER_KEY=your_key</p>
                <p>PUSHER_SECRET=your_secret</p>
                <p>PUSHER_CLUSTER=your_cluster</p>
                <p>NEXT_PUBLIC_PUSHER_KEY=your_key</p>
                <p>NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SectionError name="Messages Chat">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">
            Communicate with your customers
          </p>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unread Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {unreadCount === 1 ? "New message" : "New messages"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Conversations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConversations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Ongoing chats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg. response time
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
    </SectionError>
  )
}

export default function AgentMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <AgentMessagesContent />
    </Suspense>
  )
}
