import Pusher from "pusher"

// Server-side Pusher instance
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// Event types for real-time messaging
export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
  CONVERSATION_UPDATED: "conversation-updated",
} as const

// Channel naming conventions
export function getConversationChannel(conversationId: string): string {
  return `private-conversation-${conversationId}`
}

export function getUserChannel(userId: string): string {
  return `private-user-${userId}`
}

// Broadcast a new message to a conversation
export async function broadcastNewMessage(
  conversationId: string,
  message: {
    id: string
    content: string
    senderId: string
    createdAt: Date
    sender: { id: string; name: string | null; avatar: string | null }
  }
) {
  await pusher.trigger(
    getConversationChannel(conversationId),
    PUSHER_EVENTS.NEW_MESSAGE,
    message
  )
}

// Notify a user of a new message (for notification badge)
export async function notifyUser(
  userId: string,
  data: {
    conversationId: string
    message: {
      id: string
      content: string
      senderId: string
      senderName: string | null
    }
  }
) {
  await pusher.trigger(getUserChannel(userId), PUSHER_EVENTS.NEW_MESSAGE, data)
}

// Broadcast message read status
export async function broadcastMessageRead(
  conversationId: string,
  data: {
    userId: string
    readAt: Date
  }
) {
  await pusher.trigger(
    getConversationChannel(conversationId),
    PUSHER_EVENTS.MESSAGE_READ,
    data
  )
}

// Broadcast typing indicator
export async function broadcastTyping(
  conversationId: string,
  userId: string,
  isTyping: boolean
) {
  await pusher.trigger(
    getConversationChannel(conversationId),
    isTyping ? PUSHER_EVENTS.TYPING_START : PUSHER_EVENTS.TYPING_STOP,
    { userId }
  )
}
