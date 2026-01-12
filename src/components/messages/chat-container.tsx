"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { MessageSquare, ArrowLeft, User } from "lucide-react"
import { ConversationList } from "./conversation-list"
import { MessageThread } from "./message-thread"
import { MessageInput } from "./message-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface ChatContainerProps {
  className?: string
  initialConversationId?: string
}

export function ChatContainer({
  className,
  initialConversationId,
}: ChatContainerProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | undefined
  >(initialConversationId)
  const [conversation, setConversation] = useState<any>(null)
  const [isLoadingConversation, setIsLoadingConversation] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const { data: session } = useSession()

  // Handle responsive view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch conversation details when selected
  useEffect(() => {
    if (!selectedConversationId) {
      setConversation(null)
      return
    }

    const fetchConversation = async () => {
      setIsLoadingConversation(true)
      try {
        const response = await fetch(
          `/api/messages/${selectedConversationId}`
        )
        const data = await response.json()
        if (data.success) {
          setConversation(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch conversation:", error)
      } finally {
        setIsLoadingConversation(false)
      }
    }

    fetchConversation()
  }, [selectedConversationId])

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
  }

  const handleBack = () => {
    setSelectedConversationId(undefined)
    setConversation(null)
  }

  const otherParticipant = conversation?.otherParticipants?.[0]

  // Mobile view - show either list or chat
  if (isMobileView) {
    if (selectedConversationId && conversation) {
      return (
        <Card className={cn("flex flex-col h-[calc(100vh-12rem)]", className)}>
          {/* Header */}
          <CardHeader className="flex-row items-center gap-3 py-3 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {isLoadingConversation ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : (
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={otherParticipant?.avatar || undefined}
                  alt={otherParticipant?.name || "User"}
                />
                <AvatarFallback>
                  {otherParticipant?.name?.[0]?.toUpperCase() || (
                    <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="flex-1 min-w-0">
              {isLoadingConversation ? (
                <Skeleton className="h-5 w-32" />
              ) : (
                <>
                  <h3 className="font-semibold truncate">
                    {otherParticipant?.name || "Unknown User"}
                  </h3>
                  {conversation?.subject && (
                    <p className="text-xs text-muted-foreground truncate">
                      {conversation.subject}
                    </p>
                  )}
                </>
              )}
            </div>
          </CardHeader>

          {/* Messages */}
          <MessageThread conversationId={selectedConversationId} />

          {/* Input */}
          <MessageInput conversationId={selectedConversationId} />
        </Card>
      )
    }

    return (
      <Card className={cn("h-[calc(100vh-12rem)]", className)}>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto h-[calc(100%-4rem)]">
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
          />
        </CardContent>
      </Card>
    )
  }

  // Desktop view - split panel
  return (
    <div className={cn("flex h-[calc(100vh-12rem)] gap-4", className)}>
      {/* Conversation list */}
      <Card className="w-80 shrink-0 flex flex-col">
        <CardHeader className="border-b py-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto flex-1">
          <ConversationList
            selectedId={selectedConversationId}
            onSelect={handleSelectConversation}
          />
        </CardContent>
      </Card>

      {/* Message panel */}
      <Card className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Header */}
            <CardHeader className="flex-row items-center gap-3 py-3 border-b">
              {isLoadingConversation ? (
                <>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </>
              ) : (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={otherParticipant?.avatar || undefined}
                      alt={otherParticipant?.name || "User"}
                    />
                    <AvatarFallback>
                      {otherParticipant?.name?.[0]?.toUpperCase() || (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {otherParticipant?.name || "Unknown User"}
                    </h3>
                    {conversation?.subject && (
                      <p className="text-sm text-muted-foreground">
                        {conversation.subject}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardHeader>

            {/* Messages */}
            <MessageThread conversationId={selectedConversationId} />

            {/* Input */}
            <MessageInput conversationId={selectedConversationId} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4" />
            <h3 className="text-lg font-medium">Select a conversation</h3>
            <p className="text-sm">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
