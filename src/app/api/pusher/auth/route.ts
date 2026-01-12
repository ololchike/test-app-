import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pusher } from "@/lib/pusher/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const socketId = formData.get("socket_id") as string
    const channel = formData.get("channel_name") as string

    if (!socketId || !channel) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      )
    }

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
    } else {
      return NextResponse.json({ error: "Invalid channel" }, { status: 400 })
    }

    // Authorize the channel subscription
    const authResponse = pusher.authorizeChannel(socketId, channel, {
      user_id: session.user.id,
      user_info: {
        name: session.user.name,
        role: session.user.role,
      },
    })

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error("Pusher auth error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

async function verifyConversationAccess(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  })
  return !!participant
}
