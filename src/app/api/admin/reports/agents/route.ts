import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/reports/agents
 * Agent analytics data
 */
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    const now = new Date()
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30) // Default: last 30 days
    const endDate = endDateParam ? new Date(endDateParam) : now

    // Fetch agents with bookings and reviews
    const agents = await prisma.agent.findMany({
      where: {
        isVerified: true,
      },
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
          },
        },
        bookings: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: { in: ["CONFIRMED", "PAID", "IN_PROGRESS", "COMPLETED"] },
          },
          select: {
            totalAmount: true,
            agentEarnings: true,
          },
        },
        tours: {
          include: {
            reviews: {
              where: {
                isApproved: true,
              },
              select: {
                rating: true,
              },
            },
          },
        },
      },
    })

    // Calculate top agents
    const topAgents = agents
      .map((agent) => {
        const revenue = agent.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)
        const earnings = agent.bookings.reduce((sum, booking) => sum + booking.agentEarnings, 0)
        const bookingsCount = agent.bookings.length

        // Calculate average rating
        const allReviews = agent.tours.flatMap((tour) => tour.reviews)
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
        const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0

        const name =
          agent.user.name ||
          (agent.user.firstName && agent.user.lastName
            ? `${agent.user.firstName} ${agent.user.lastName}`
            : agent.businessName)

        return {
          id: agent.id,
          name: agent.businessName,
          ownerName: name,
          revenue,
          earnings,
          bookings: bookingsCount,
          rating: Math.round(avgRating * 10) / 10,
        }
      })
      .filter((agent) => agent.bookings > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10) // Top 10 agents

    // Agent status distribution
    const allAgents = await prisma.agent.groupBy({
      by: ["status"],
      _count: true,
    })

    const byStatus = allAgents.map((group) => ({
      status: group.status,
      count: group._count,
    }))

    // Monthly commission payouts (last 12 months)
    const twelveMonthsAgo = new Date(now)
    twelveMonthsAgo.setMonth(now.getMonth() - 12)

    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: {
        status: { in: ["COMPLETED", "PROCESSING"] },
        createdAt: {
          gte: twelveMonthsAgo,
          lte: endDate,
        },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    })

    // Group by month
    const monthlyPayoutsMap = new Map<string, number>()
    withdrawals.forEach((withdrawal) => {
      const month = withdrawal.createdAt.toISOString().slice(0, 7) // YYYY-MM
      const existing = monthlyPayoutsMap.get(month) || 0
      monthlyPayoutsMap.set(month, existing + withdrawal.amount)
    })

    const commissionPayouts = Array.from(monthlyPayoutsMap.entries())
      .map(([month, amount]) => ({
        month,
        amount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Agent registrations over time
    const agentRegistrations = await prisma.agent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    const registrationsMap = new Map<string, number>()
    agentRegistrations.forEach((agent) => {
      const date = agent.createdAt.toISOString().split("T")[0]
      const count = registrationsMap.get(date) || 0
      registrationsMap.set(date, count + 1)
    })

    const registrations = Array.from(registrationsMap.entries()).map(([date, count]) => ({
      date,
      count,
    }))

    return NextResponse.json({
      topAgents,
      byStatus,
      commissionPayouts,
      registrations,
    })
  } catch (error) {
    console.error("Error fetching agents data:", error)
    return NextResponse.json(
      { error: "Failed to fetch agents data" },
      { status: 500 }
    )
  }
}
