import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  broadcastNewMessage,
  notifyUser,
  broadcastMessageRead,
} from "@/lib/pusher/server"
import { z } from "zod"

// GET - Get messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
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

    // Verify user has access to conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Get conversation details with participants
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    })

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Mark messages as read
    const unreadMessages = messages.filter(
      (m) => !m.isRead && m.senderId !== session.user.id
    )

    if (unreadMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: unreadMessages.map((m) => m.id) },
        },
        data: { isRead: true },
      })

      // Update participant's last read time
      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: session.user.id,
          },
        },
        data: { lastReadAt: new Date() },
      })

      // Broadcast read receipts (fire and forget)
      broadcastMessageRead(conversationId, {
        userId: session.user.id,
        readAt: new Date(),
      }).catch(console.error)
    }

    return NextResponse.json({
      success: true,
      data: {
        conversation,
        messages: messages.reverse(), // Return in chronological order
        hasMore: messages.length === limit,
        nextCursor:
          messages.length > 0
            ? messages[messages.length - 1].createdAt.toISOString()
            : null,
      },
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST - Send a message
const sendMessageSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(2000),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = sendMessageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { conversationId, content } = validation.data

    // Verify user has access to conversation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      )
    }

    // Get all participants to notify
    const allParticipants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
      select: { userId: true },
    })

    // Create message and update conversation
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId,
          senderId: session.user.id,
          content,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ])

    // Broadcast to conversation channel (fire and forget)
    broadcastNewMessage(conversationId, {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      createdAt: message.createdAt,
      sender: message.sender,
    }).catch(console.error)

    // Notify other participants (fire and forget)
    const otherParticipants = allParticipants.filter(
      (p) => p.userId !== session.user.id
    )

    for (const recipient of otherParticipants) {
      notifyUser(recipient.userId, {
        conversationId,
        message: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          senderName: message.sender.name,
        },
      }).catch(console.error)
    }

    return NextResponse.json(
      { success: true, data: message },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    )
  }
}
