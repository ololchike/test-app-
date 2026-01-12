import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/dashboard
 * Fetch platform statistics for admin dashboard
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

    // Calculate start of current and previous month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

    // Fetch all stats in parallel for performance
    const [
      currentMonthRevenue,
      lastMonthRevenue,
      activeAgentsCount,
      lastMonthActiveAgentsCount,
      currentMonthBookings,
      lastMonthBookings,
      totalUsers,
      lastMonthTotalUsers
    ] = await Promise.all([
      // Current month revenue
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          completedAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Last month revenue
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          completedAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),

      // Current active agents
      prisma.agent.count({
        where: {
          isVerified: true,
          status: "ACTIVE",
        },
      }),

      // Last month active agents (those created before this month)
      prisma.agent.count({
        where: {
          isVerified: true,
          status: "ACTIVE",
          createdAt: {
            lt: startOfMonth,
          },
        },
      }),

      // Current month bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Last month bookings
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),

      // Total registered users
      prisma.user.count(),

      // Total users at start of this month
      prisma.user.count({
        where: {
          createdAt: {
            lt: startOfMonth,
          },
        },
      }),
    ])

    // Calculate values
    const currentRevenue = currentMonthRevenue._sum.amount || 0
    const previousRevenue = lastMonthRevenue._sum.amount || 0
    const revenueChange = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 100

    const agentChange = activeAgentsCount - lastMonthActiveAgentsCount

    const bookingsChange = lastMonthBookings > 0
      ? ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
      : 100

    const userChange = totalUsers - lastMonthTotalUsers

    // Format response
    const stats = {
      revenue: {
        value: currentRevenue,
        formatted: `$${currentRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
        change: revenueChange >= 0 ? `+${revenueChange.toFixed(1)}%` : `${revenueChange.toFixed(1)}%`,
        trend: revenueChange >= 0 ? "up" : "down",
        description: "This month",
      },
      agents: {
        value: activeAgentsCount,
        formatted: activeAgentsCount.toLocaleString(),
        change: agentChange >= 0 ? `+${agentChange}` : `${agentChange}`,
        trend: agentChange >= 0 ? "up" : "down",
        description: "Verified operators",
      },
      bookings: {
        value: currentMonthBookings,
        formatted: currentMonthBookings.toLocaleString(),
        change: bookingsChange >= 0 ? `+${bookingsChange.toFixed(1)}%` : `${bookingsChange.toFixed(1)}%`,
        trend: bookingsChange >= 0 ? "up" : "down",
        description: "This month",
      },
      users: {
        value: totalUsers,
        formatted: totalUsers.toLocaleString(),
        change: userChange >= 0 ? `+${userChange}` : `${userChange}`,
        trend: userChange >= 0 ? "up" : "down",
        description: "Registered users",
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Admin dashboard API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
