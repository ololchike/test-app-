import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/agents/pending
 * Fetch pending agent applications
 * Requires ADMIN role
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    // Fetch pending agents with user info
    const pendingAgents = await prisma.agent.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format response with readable time differences
    const formattedAgents = pendingAgents.map((agent) => {
      const now = new Date()
      const submittedAt = new Date(agent.createdAt)
      const diffInMs = now.getTime() - submittedAt.getTime()
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

      let timeAgo: string
      if (diffInMinutes < 60) {
        timeAgo = diffInMinutes === 0 ? "just now" : `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
      } else if (diffInHours < 24) {
        timeAgo = `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
      } else {
        timeAgo = `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
      }

      const ownerName = agent.user.name ||
        (agent.user.firstName && agent.user.lastName
          ? `${agent.user.firstName} ${agent.user.lastName}`
          : agent.user.email)

      return {
        id: agent.id,
        businessName: agent.businessName,
        ownerName,
        email: agent.user.email,
        submittedAt: timeAgo,
        location: agent.city && agent.country
          ? `${agent.city}, ${agent.country}`
          : agent.country || "Not specified",
        description: agent.description,
        website: agent.website,
        phone: agent.businessPhone,
        licenseNumber: agent.licenseNumber,
        katoMember: agent.katoMember,
        tatoMember: agent.tatoMember,
        autoMember: agent.autoMember,
        yearsInBusiness: agent.yearsInBusiness,
        createdAt: agent.createdAt,
      }
    })

    return NextResponse.json(formattedAgents)
  } catch (error) {
    console.error("Admin pending agents API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending agents" },
      { status: 500 }
    )
  }
}
