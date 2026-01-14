"use client"

import { useRef, useEffect } from "react"
import { useMessages } from "@/hooks/use-messages"
import { useSession } from "next-auth/react"
import { format, isToday, isYesterday } from "date-fns"
import { Loader2, CheckCheck, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface MessageThreadProps {
  conversationId: string
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { data: session } = useSession()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, hasMore, loadMore } = useMessages({
    conversationId,
    onNewMessage: () => {
      // Scroll to bottom on new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    },
  })

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView()
    }
  }, [isLoading, messages.length])

  // Handle scroll for loading more
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current
      if (scrollTop === 0 && hasMore && !isLoading) {
        loadMore()
      }
    }
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-2",
              i % 2 === 0 ? "justify-start" : "justify-end"
            )}
          >
            {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full" />}
            <Skeleton className="h-16 w-48 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "MMMM d, yyyy")
  }

  const formatMessageTime = (dateStr: string) => {
    return format(new Date(dateStr), "h:mm a")
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: typeof messages }[] = []
  let currentDate = ""

  messages.forEach((message) => {
    const messageDate = formatMessageDate(message.createdAt)
    if (messageDate !== currentDate) {
      currentDate = messageDate
      groupedMessages.push({ date: messageDate, messages: [message] })
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message)
    }
  })

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {hasMore && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin inline mr-1" />
            ) : null}
            Load earlier messages
          </button>
        </div>
      )}

      {groupedMessages.map((group) => (
        <div key={group.date}>
          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 border-t" />
            <span className="text-xs text-muted-foreground">{group.date}</span>
            <div className="flex-1 border-t" />
          </div>

          <div className="space-y-3">
            {group.messages.map((message, index) => {
              const isOwn = message.senderId === session?.user?.id
              const showAvatar =
                !isOwn &&
                (index === 0 ||
                  group.messages[index - 1].senderId !== message.senderId)

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  {!isOwn && (
                    <div className="w-8">
                      {showAvatar && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={message.sender.avatar || undefined}
                            alt={message.sender.name || "User"}
                          />
                          <AvatarFallback className="text-xs">
                            {message.sender.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[10px]",
                          isOwn
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isOwn && (
                        <span
                          className={cn(
                            "text-primary-foreground/70",
                            message.isRead && "text-primary-foreground"
                          )}
                        >
                          {message.isRead ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <p className="text-muted-foreground">No messages yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Send a message to start the conversation
          </p>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
