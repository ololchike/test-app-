"use client"

import { useConversations } from "@/hooks/use-messages"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface ConversationListProps {
  selectedId?: string
  onSelect: (conversationId: string) => void
}

export function ConversationList({
  selectedId,
  onSelect,
}: ConversationListProps) {
  const { conversations, isLoading, error } = useConversations()

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>Failed to load conversations</p>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold">No conversations yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Start a conversation with a client or agent
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.otherParticipants[0]
        const isSelected = selectedId === conversation.id
        const hasUnread = conversation.unreadCount > 0

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
              isSelected && "bg-muted",
              hasUnread && "bg-primary/5"
            )}
          >
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

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "font-medium truncate",
                    hasUnread && "font-semibold"
                  )}
                >
                  {otherParticipant?.name || "Unknown User"}
                </span>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(
                      new Date(conversation.lastMessage.createdAt),
                      { addSuffix: true }
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-0.5">
                {conversation.lastMessage ? (
                  <p
                    className={cn(
                      "text-sm truncate flex-1",
                      hasUnread
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {conversation.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No messages yet
                  </p>
                )}

                {hasUnread && (
                  <Badge
                    variant="default"
                    className="h-5 min-w-[20px] rounded-full px-1.5 text-xs"
                  >
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>

              {conversation.subject && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Re: {conversation.subject}
                </p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
