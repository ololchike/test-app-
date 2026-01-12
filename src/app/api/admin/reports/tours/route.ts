import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/reports/tours
 * Tour analytics data
 */
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get date range from query params (for bookings)
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    const now = new Date()
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30) // Default: last 30 days
    const endDate = endDateParam ? new Date(endDateParam) : now

    // Most booked tours
    const tours = await prisma.tour.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
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
          },
        },
        reviews: {
          where: {
            isApproved: true,
          },
          select: {
            rating: true,
          },
        },
        agent: {
          select: {
            businessName: true,
          },
        },
      },
    })

    const mostBooked = tours
      .map((tour) => {
        const bookingsCount = tour.bookings.length
        const revenue = tour.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0)

        return {
          id: tour.id,
          title: tour.title,
          agent: tour.agent.businessName,
          bookings: bookingsCount,
          revenue,
        }
      })
      .filter((tour) => tour.bookings > 0)
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10) // Top 10 tours

    // Tours by status
    const statusGroups = await prisma.tour.groupBy({
      by: ["status"],
      _count: true,
    })

    const byStatus = statusGroups.map((group) => ({
      status: group.status,
      count: group._count,
    }))

    // Tours by destination
    const destinationGroups = await prisma.tour.groupBy({
      by: ["destination"],
      where: {
        status: { in: ["ACTIVE", "PAUSED"] },
      },
      _count: true,
    })

    const byDestination = destinationGroups
      .map((group) => ({
        destination: group.destination,
        count: group._count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 destinations

    // Top rated tours
    const topRated = tours
      .map((tour) => {
        const reviews = tour.reviews
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0

        return {
          id: tour.id,
          title: tour.title,
          agent: tour.agent.businessName,
          rating: Math.round(avgRating * 10) / 10,
          reviews: reviews.length,
        }
      })
      .filter((tour) => tour.reviews >= 3) // At least 3 reviews
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10) // Top 10 rated

    // Average rating by agent
    const agents = await prisma.agent.findMany({
      where: {
        isVerified: true,
        status: "ACTIVE",
      },
      include: {
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

    const agentRatings = agents
      .map((agent) => {
        const allReviews = agent.tours.flatMap((tour) => tour.reviews)
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
        const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0

        return {
          agent: agent.businessName,
          rating: Math.round(avgRating * 10) / 10,
          reviews: allReviews.length,
        }
      })
      .filter((agent) => agent.reviews > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10) // Top 10 agents by rating

    return NextResponse.json({
      mostBooked,
      byStatus,
      byDestination,
      topRated,
      agentRatings,
    })
  } catch (error) {
    console.error("Error fetching tours data:", error)
    return NextResponse.json(
      { error: "Failed to fetch tours data" },
      { status: 500 }
    )
  }
}
