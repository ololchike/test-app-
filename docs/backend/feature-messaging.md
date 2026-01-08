# Feature: Real-Time Messaging

## Status
- [x] Requirements Approved
- [ ] Design Complete
- [ ] Implementation Started
- [ ] Implementation Complete
- [ ] Testing Complete
- [ ] Deployed

## Overview

The messaging system enables real-time communication between clients and agents within the platform. Messages are tied to bookings/conversations, providing context and creating a secure channel for pre-trip and post-booking communication.

## User Stories

### Client
- As a client, I want to message an agent about a tour before booking
- As a client, I want to continue messaging after booking is confirmed
- As a client, I want to see my message history with agents
- As a client, I want to receive notifications for new messages
- As a client, I want to see when my messages are read

### Agent
- As an agent, I want to see all conversations with clients
- As an agent, I want to respond to client inquiries quickly
- As an agent, I want to see which booking a conversation relates to
- As an agent, I want to be notified of new messages
- As an agent, I want to see unread message counts

### Admin
- As an admin, I want to monitor messaging activity
- As an admin, I want to investigate reported conversations

## Acceptance Criteria

### Conversation Management
- [ ] Conversation created when booking is made
- [ ] Client can initiate conversation from tour page (pre-booking)
- [ ] One conversation per client-agent pair (not per booking)
- [ ] Conversations linked to booking when applicable
- [ ] Conversation list shows last message and timestamp

### Messaging
- [ ] Messages delivered in real-time (< 500ms)
- [ ] Messages persisted to database
- [ ] Messages show sender, content, timestamp
- [ ] Read receipts tracked
- [ ] Message history loads with pagination (50 messages per page)

### Notifications
- [ ] Real-time notification for new messages
- [ ] Unread count shown in navigation
- [ ] Email notification if user offline (30 min delay)
- [ ] Push notifications (Phase 3 - Mobile)

### Real-Time Infrastructure
- [ ] Pusher integration for real-time events
- [ ] Automatic reconnection on disconnect
- [ ] Typing indicators (optional Phase 2)
- [ ] Online presence indicators (optional Phase 2)

## Technical Requirements

### Pusher Configuration

```typescript
// lib/pusher/server.ts
import Pusher from "pusher"

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// Event types
export const PUSHER_EVENTS = {
  NEW_MESSAGE: "new-message",
  MESSAGE_READ: "message-read",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
}

// Channel naming
export function getConversationChannel(conversationId: string) {
  return `private-conversation-${conversationId}`
}

export function getUserChannel(userId: string) {
  return `private-user-${userId}`
}
```

### Pusher Client Configuration

```typescript
// lib/pusher/client.ts
import PusherClient from "pusher-js"

let pusherClient: PusherClient | null = null

export function getPusherClient() {
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    })
  }
  return pusherClient
}
```

### Pusher Auth Endpoint

```typescript
// app/api/pusher/auth/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pusher } from "@/lib/pusher/server"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const socketId = formData.get("socket_id") as string
  const channel = formData.get("channel_name") as string

  // Validate channel access
  if (channel.startsWith("private-conversation-")) {
    const conversationId = channel.replace("private-conversation-", "")
    const hasAccess = await verifyConversationAccess(
      conversationId,
      session.user.id
    )
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  } else if (channel.startsWith("private-user-")) {
    const userId = channel.replace("private-user-", "")
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const authResponse = pusher.authorizeChannel(socketId, channel, {
    user_id: session.user.id,
    user_info: {
      name: session.user.name,
      role: session.user.role,
    },
  })

  return NextResponse.json(authResponse)
}

async function verifyConversationAccess(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { clientId: userId },
        { agent: { userId } },
      ],
    },
  })
  return !!conversation
}
```

### Conversations API

```typescript
// app/api/messages/conversations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List conversations
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "20")

  let where: any = {}

  if (session.user.role === "CLIENT") {
    where.clientId = session.user.id
  } else if (session.user.role === "AGENT") {
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }
    where.agentId = agent.id
  }
  // Admin can see all - no filter

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, image: true } },
        agent: {
          select: {
            id: true,
            businessName: true,
            logo: true,
            user: { select: { name: true } },
          },
        },
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            tour: { select: { title: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.conversation.count({ where }),
  ])

  // Add unread counts
  const conversationsWithUnread = conversations.map((conv) => {
    const unreadCount =
      session.user.role === "CLIENT" ? conv.clientUnread : conv.agentUnread
    return {
      ...conv,
      unreadCount,
      lastMessage: conv.messages[0] || null,
    }
  })

  return NextResponse.json({
    success: true,
    data: conversationsWithUnread,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}

// POST - Create or get conversation
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId, bookingId } = await request.json()

  // For client initiating conversation
  if (session.user.role === "CLIENT") {
    // Check for existing conversation with this agent
    let conversation = await prisma.conversation.findUnique({
      where: {
        clientId_agentId: {
          clientId: session.user.id,
          agentId,
        },
      },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId: session.user.id,
          agentId,
          bookingId,
        },
      })
    } else if (bookingId && !conversation.bookingId) {
      // Link booking if not already linked
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { bookingId },
      })
    }

    return NextResponse.json({ success: true, data: conversation })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
```

### Messages API

```typescript
// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { pusher, PUSHER_EVENTS, getConversationChannel, getUserChannel } from "@/lib/pusher/server"
import { z } from "zod"

const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(2000),
})

// GET - Get messages for a conversation
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get("conversationId")
  const cursor = searchParams.get("cursor")
  const limit = parseInt(searchParams.get("limit") || "50")

  if (!conversationId) {
    return NextResponse.json(
      { error: "Conversation ID required" },
      { status: 400 }
    )
  }

  // Verify access
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [
        { clientId: session.user.id },
        { agent: { userId: session.user.id } },
      ],
    },
    include: {
      client: { select: { id: true, name: true, image: true } },
      agent: { select: { id: true, businessName: true, userId: true } },
      booking: { select: { bookingNumber: true, tour: { select: { title: true } } } },
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      ...(cursor && { createdAt: { lt: new Date(cursor) } }),
    },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  // Mark messages as read
  const isClient = conversation.clientId === session.user.id
  const unreadField = isClient ? "clientUnread" : "agentUnread"

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { [unreadField]: 0 },
  })

  // Mark individual messages as read
  const unreadMessageIds = messages
    .filter((m) => !m.readAt && m.senderId !== session.user.id)
    .map((m) => m.id)

  if (unreadMessageIds.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unreadMessageIds } },
      data: { readAt: new Date() },
    })

    // Notify sender that messages were read
    await pusher.trigger(
      getConversationChannel(conversationId),
      PUSHER_EVENTS.MESSAGE_READ,
      { messageIds: unreadMessageIds, readAt: new Date() }
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      conversation,
      messages: messages.reverse(),
      hasMore: messages.length === limit,
      nextCursor: messages.length > 0 ? messages[messages.length - 1].createdAt : null,
    },
  })
}

// POST - Send message
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = messageSchema.parse(body)

    // Verify access
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: data.conversationId,
        OR: [
          { clientId: session.user.id },
          { agent: { userId: session.user.id } },
        ],
      },
      include: {
        client: true,
        agent: { include: { user: true } },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    // Determine recipient
    const isClient = conversation.clientId === session.user.id
    const recipientUserId = isClient
      ? conversation.agent.userId
      : conversation.clientId

    // Create message and update conversation
    const message = await prisma.$transaction(async (tx) => {
      const newMessage = await tx.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: session.user.id,
          content: data.content,
        },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      })

      // Update conversation
      const unreadField = isClient ? "agentUnread" : "clientUnread"
      await tx.conversation.update({
        where: { id: data.conversationId },
        data: {
          lastMessageAt: new Date(),
          [unreadField]: { increment: 1 },
        },
      })

      return newMessage
    })

    // Send real-time notification
    await Promise.all([
      // To conversation channel
      pusher.trigger(
        getConversationChannel(data.conversationId),
        PUSHER_EVENTS.NEW_MESSAGE,
        message
      ),
      // To recipient's personal channel for notification
      pusher.trigger(getUserChannel(recipientUserId), PUSHER_EVENTS.NEW_MESSAGE, {
        conversationId: data.conversationId,
        message,
      }),
    ])

    // TODO: Queue email notification if recipient offline

    return NextResponse.json({ success: true, data: message }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Message error:", error)
    return NextResponse.json({ error: "Message failed" }, { status: 500 })
  }
}
```

### Unread Count API

```typescript
// app/api/messages/unread/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let totalUnread = 0

  if (session.user.role === "CLIENT") {
    const result = await prisma.conversation.aggregate({
      where: { clientId: session.user.id },
      _sum: { clientUnread: true },
    })
    totalUnread = result._sum.clientUnread || 0
  } else if (session.user.role === "AGENT") {
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })
    if (agent) {
      const result = await prisma.conversation.aggregate({
        where: { agentId: agent.id },
        _sum: { agentUnread: true },
      })
      totalUnread = result._sum.agentUnread || 0
    }
  }

  return NextResponse.json({
    success: true,
    data: { unreadCount: totalUnread },
  })
}
```

### React Hook for Real-Time Messages

```typescript
// hooks/use-messages.ts
import { useEffect, useState, useCallback } from "react"
import { getPusherClient } from "@/lib/pusher/client"
import { PUSHER_EVENTS, getConversationChannel } from "@/lib/pusher/server"

interface Message {
  id: string
  content: string
  senderId: string
  createdAt: string
  readAt: string | null
  sender: {
    id: string
    name: string
    image: string | null
  }
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`
      )
      const data = await response.json()
      if (data.success) {
        setMessages(data.data.messages)
      }
      setIsLoading(false)
    }
    fetchMessages()
  }, [conversationId])

  // Subscribe to real-time updates
  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(getConversationChannel(conversationId))

    channel.bind(PUSHER_EVENTS.NEW_MESSAGE, (message: Message) => {
      setMessages((prev) => [...prev, message])
    })

    channel.bind(
      PUSHER_EVENTS.MESSAGE_READ,
      (data: { messageIds: string[]; readAt: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            data.messageIds.includes(m.id) ? { ...m, readAt: data.readAt } : m
          )
        )
      }
    )

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(getConversationChannel(conversationId))
    }
  }, [conversationId])

  const sendMessage = useCallback(
    async (content: string) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content }),
      })
      return response.json()
    },
    [conversationId]
  )

  return { messages, isLoading, sendMessage }
}
```

## Dependencies

- Pusher (real-time)
- Prisma (database)
- Zod (validation)
- Email service for offline notifications

## MVP Phase
Phase 2 - Growth Features (Sprint 9-10)

## Estimated Effort
21 story points

## Implementation Notes

### Message Flow

```
Client sends message
         |
         v
POST /api/messages
         |
         v
Save to database
         |
    /----------\
    |          |
    v          v
Pusher      Update
broadcast   conversation
    |
    v
Real-time delivery
to recipient
```

### Channel Security

- All channels are private (require authentication)
- Conversation channels: Only participants can subscribe
- User channels: Only the user can subscribe

### Performance Considerations

1. Message pagination: Load 50 messages at a time
2. Conversation list: Show only last message preview
3. Unread counts: Aggregated at conversation level
4. Read receipts: Batch update on conversation open

### Offline Handling

1. Queue email notifications for offline users
2. Send email after 30 minutes if still unread
3. Consolidate multiple messages into single email

### Environment Variables

```bash
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

### Security Checklist
- [ ] Channel authorization validates access
- [ ] Message content sanitized
- [ ] Rate limiting on message sending
- [ ] Max message length enforced
- [ ] XSS prevention on display

### Testing Checklist
- [ ] Create conversation
- [ ] Send message
- [ ] Real-time delivery
- [ ] Read receipts
- [ ] Unread counts
- [ ] Message history pagination
- [ ] Pusher authentication
- [ ] Offline notification queueing

## Approval
- [ ] User Approved
- Date:
- Notes:
