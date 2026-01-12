"use client"

import PusherClient from "pusher-js"

let pusherClient: PusherClient | null = null

// Check if Pusher is configured
export function isPusherConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  )
}

export function getPusherClient(): PusherClient | null {
  // Return null if Pusher is not configured
  if (!isPusherConfigured()) {
    return null
  }

  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    })
  }
  return pusherClient
}

// Disconnect and cleanup
export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect()
    pusherClient = null
  }
}

// Event types (re-exported for client-side use)
export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
  CONVERSATION_UPDATED: "conversation-updated",
} as const

// Channel naming conventions (re-exported for client-side use)
export function getConversationChannel(conversationId: string): string {
  return `private-conversation-${conversationId}`
}

export function getUserChannel(userId: string): string {
  return `private-user-${userId}`
}
