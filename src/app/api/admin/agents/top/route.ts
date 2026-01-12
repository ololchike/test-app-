import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/agents/top
 * Fetch top performing agents by revenue this month
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

    // Get limit from query params, default to 5
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "5", 10)

    // Calculate start of current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch all active agents
    const agents = await prisma.agent.findMany({
      where: {
        isVerified: true,
        status: "ACTIVE",
      },
      include: {
        bookings: {
          where: {
            createdAt: {
              gte: startOfMonth,
            },
            status: {
              in: ["CONFIRMED", "PAID", "IN_PROGRESS", "COMPLETED"],
            },
          },
          select: {
            agentEarnings: true,
            totalAmount: true,
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

    // Calculate revenue and stats for each agent
    const agentStats = agents
      .map((agent) => {
        // Calculate total revenue from bookings this month
        const revenue = agent.bookings.reduce(
          (sum, booking) => sum + booking.agentEarnings,
          0
        )

        // Count bookings this month
        const bookingsCount = agent.bookings.length

        // Calculate average rating from all tour reviews
        const allReviews = agent.tours.flatMap((tour) => tour.reviews)
        const totalRating = allReviews.reduce(
          (sum, review) => sum + review.rating,
          0
        )
        const avgRating = allReviews.length > 0
          ? totalRating / allReviews.length
          : 0

        return {
          id: agent.id,
          name: agent.businessName,
          revenue,
          bookings: bookingsCount,
          rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
        }
      })
      // Filter out agents with no revenue
      .filter((agent) => agent.revenue > 0)
      // Sort by revenue descending
      .sort((a, b) => b.revenue - a.revenue)
      // Take top N
      .slice(0, limit)

    return NextResponse.json(agentStats)
  } catch (error) {
    console.error("Admin top agents API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch top agents" },
      { status: 500 }
    )
  }
}
