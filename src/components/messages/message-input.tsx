"use client"

import { useState, useRef, useCallback } from "react"
import { Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  conversationId: string
  disabled?: boolean
  onSend?: (content: string) => Promise<void>
}

export function MessageInput({
  conversationId,
  disabled,
  onSend,
}: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(async () => {
    if (!content.trim() || isSending) return

    try {
      setIsSending(true)

      if (onSend) {
        await onSend(content.trim())
      } else {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content: content.trim() }),
        })

        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error)
        }
      }

      setContent("")
      textareaRef.current?.focus()
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }, [content, conversationId, isSending, onSend])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)

    // Reset height to auto to properly calculate new height
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled || isSending}
            rows={1}
            className={cn(
              "min-h-[44px] max-h-[150px] resize-none pr-12",
              "focus-visible:ring-1"
            )}
          />
        </div>

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || isSending || disabled}
          className="h-11 w-11 shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
