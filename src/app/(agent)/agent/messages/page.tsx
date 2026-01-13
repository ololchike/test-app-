"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Send, Search, Users, Clock } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ChatContainer } from "@/components/messages/chat-container"
import { useUnreadCount, useConversations } from "@/hooks/use-messages"

export default function AgentMessagesPage() {
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
      <ChatContainer />
    </div>
  )
}
