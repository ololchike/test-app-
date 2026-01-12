import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get total unread message count for current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all conversations where user is a participant
    const participations = await prisma.conversationParticipant.findMany({
      where: { userId: session.user.id },
      select: { conversationId: true },
    })

    const conversationIds = participations.map((p) => p.conversationId)

    // Count unread messages in those conversations that weren't sent by user
    const unreadCount = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        senderId: { not: session.user.id },
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: { unreadCount },
    })
  } catch (error) {
    console.error("Error fetching unread count:", error)
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    )
  }
}
