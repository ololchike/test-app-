import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createLogger } from "@/lib/logger"

const log = createLogger("Admin Agent Search API")

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""

    if (!query || query.length < 2) {
      return NextResponse.json({ agents: [] })
    }

    // Search agents by business name, email, or user name
    const agents = await prisma.agent.findMany({
      where: {
        AND: [
          {
            OR: [
              { businessName: { contains: query } },
              { businessEmail: { contains: query } },
              {
                user: {
                  OR: [
                    { email: { contains: query } },
                    { name: { contains: query } },
                  ],
                },
              },
            ],
          },
          {
            // Only show active or verified agents
            status: {
              in: ["ACTIVE", "PENDING"],
            },
          },
        ],
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      take: 10,
      orderBy: [
        { isVerified: "desc" },
        { businessName: "asc" },
      ],
    })

    const formattedAgents = agents.map((agent) => ({
      id: agent.id,
      businessName: agent.businessName,
      email: agent.user.email,
      businessEmail: agent.businessEmail,
      isVerified: agent.isVerified,
      status: agent.status,
    }))

    return NextResponse.json({ agents: formattedAgents })
  } catch (error) {
    log.error("Error searching agents", error)
    return NextResponse.json(
      { error: "Failed to search agents" },
      { status: 500 }
    )
  }
}
