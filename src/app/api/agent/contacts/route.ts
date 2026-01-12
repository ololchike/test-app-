import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const log = createLogger("Agent Contacts API")

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "AGENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent profile not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: Record<string, unknown> = {
      assignedAgentId: agent.id,
    }

    if (status) {
      where.status = status
    }

    const skip = (page - 1) * limit

    const [messages, total, statusCounts] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: {
          assignedAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.groupBy({
        by: ["status"],
        where: {
          assignedAgentId: agent.id,
        },
        _count: {
          id: true,
        },
      }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
      statusCounts: statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.id
          return acc
        },
        {} as Record<string, number>
      ),
    })
  } catch (error) {
    log.error("Error fetching agent contact messages", error)
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: 500 }
    )
  }
}
