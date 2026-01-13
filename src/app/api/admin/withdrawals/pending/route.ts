import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WithdrawalMethod, WithdrawalMethodLabels } from "@/lib/constants"

/**
 * GET /api/admin/withdrawals/pending
 * Fetch pending withdrawal requests
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

    // Fetch pending withdrawal requests with agent info
    const pendingWithdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        status: "PENDING",
      },
      include: {
        agent: {
          select: {
            businessName: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Limit to 50 most recent pending withdrawals
    })

    // Format response with readable time differences
    const formattedWithdrawals = pendingWithdrawals.map((withdrawal) => {
      const now = new Date()
      const requestedAt = new Date(withdrawal.createdAt)
      const diffInMs = now.getTime() - requestedAt.getTime()
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

      return {
        id: withdrawal.id,
        agentName: withdrawal.agent.businessName,
        agentId: withdrawal.agentId,
        amount: withdrawal.amount,
        currency: withdrawal.currency,
        method: WithdrawalMethodLabels[withdrawal.method as WithdrawalMethod] || withdrawal.method,
        requestedAt: timeAgo,
        status: withdrawal.status.toLowerCase(),
        createdAt: withdrawal.createdAt,
      }
    })

    return NextResponse.json(formattedWithdrawals)
  } catch (error) {
    console.error("Admin pending withdrawals API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch pending withdrawals" },
      { status: 500 }
    )
  }
}
