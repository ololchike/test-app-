"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Users, Clock, Search } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChatContainer } from "@/components/messages/chat-container"
import { useUnreadCount, useConversations } from "@/hooks/use-messages"

export default function ClientMessagesPage() {
  const { unreadCount } = useUnreadCount()
  const { conversations } = useConversations()
  const [hasPusherConfig, setHasPusherConfig] = useState(true)

  // Check if Pusher is configured
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_PUSHER_KEY ||
      !process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    ) {
      setHasPusherConfig(false)
    }
  }, [])

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
      <ChatContainer />
    </div>
  )
}
