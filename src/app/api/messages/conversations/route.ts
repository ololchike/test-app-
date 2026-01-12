import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET - List user's conversations
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Get conversations where user is a participant
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
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
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              senderId: true,
              isRead: true,
            },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.conversation.count({
        where: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
      }),
    ])

    // Process conversations to add unread counts and other party info
    const processedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Get unread count for this user
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: session.user.id },
            isRead: false,
          },
        })

        // Find the other participant(s)
        const otherParticipants = conv.participants
          .filter((p) => p.userId !== session.user.id)
          .map((p) => p.user)

        return {
          id: conv.id,
          subject: conv.subject,
          bookingId: conv.bookingId,
          lastMessageAt: conv.lastMessageAt,
          lastMessage: conv.messages[0] || null,
          unreadCount,
          otherParticipants,
          createdAt: conv.createdAt,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: processedConversations,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

// POST - Create or get existing conversation
const createConversationSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
  bookingId: z.string().optional(),
  subject: z.string().optional(),
  initialMessage: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validation = createConversationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { recipientId, bookingId, subject, initialMessage } = validation.data

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
    })

    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient not found" },
        { status: 404 }
      )
    }

    // Check if conversation already exists between these users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: session.user.id },
            },
          },
          {
            participants: {
              some: { userId: recipientId },
            },
          },
        ],
      },
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

    if (existingConversation) {
      // If there's an initial message, add it
      if (initialMessage) {
        await prisma.message.create({
          data: {
            conversationId: existingConversation.id,
            senderId: session.user.id,
            content: initialMessage,
          },
        })

        await prisma.conversation.update({
          where: { id: existingConversation.id },
          data: { lastMessageAt: new Date() },
        })
      }

      return NextResponse.json({
        success: true,
        data: existingConversation,
        isNew: false,
      })
    }

    // Create new conversation with participants
    const conversation = await prisma.conversation.create({
      data: {
        subject,
        bookingId,
        participants: {
          create: [{ userId: session.user.id }, { userId: recipientId }],
        },
        ...(initialMessage && {
          messages: {
            create: {
              senderId: session.user.id,
              content: initialMessage,
            },
          },
        }),
      },
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: conversation,
        isNew: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating conversation:", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
