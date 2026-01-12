import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfMonth, subMonths, format, eachMonthOfInterval } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Get date ranges
    const now = new Date()
    const thisMonth = startOfMonth(now)
    const lastMonth = startOfMonth(subMonths(now, 1))
    const sixMonthsAgo = subMonths(now, 6)

    // Get tour views
    const [tours, lastMonthTours] = await Promise.all([
      prisma.tour.findMany({
        where: { agentId: agent.id },
        select: { viewCount: true },
      }),
      prisma.tour.aggregate({
        where: { agentId: agent.id },
        _sum: { viewCount: true },
      }),
    ])

    const totalViews = tours.reduce((sum, t) => sum + t.viewCount, 0)

    // Get bookings statistics
    const [allBookings, thisMonthBookings, lastMonthBookings] = await Promise.all([
      prisma.booking.findMany({
        where: { agentId: agent.id },
        select: {
          id: true,
          userId: true,
          totalAmount: true,
          status: true,
          createdAt: true,
          agentEarnings: true,
        },
      }),
      prisma.booking.count({
        where: {
          agentId: agent.id,
          createdAt: { gte: thisMonth },
        },
      }),
      prisma.booking.count({
        where: {
          agentId: agent.id,
          createdAt: { gte: lastMonth, lt: thisMonth },
        },
      }),
    ])

    // Calculate stats
    const totalBookings = allBookings.length
    const completedBookings = allBookings.filter(
      (b) => b.status === "COMPLETED"
    ).length
    const conversionRate = totalViews > 0 ? (totalBookings / totalViews) * 100 : 0

    // Average booking value
    const totalRevenue = allBookings.reduce((sum, b) => sum + b.totalAmount, 0)
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Return customers (users with more than 1 booking)
    const userBookingCounts = new Map<string, number>()
    allBookings.forEach((b) => {
      const count = userBookingCounts.get(b.userId) || 0
      userBookingCounts.set(b.userId, count + 1)
    })
    const uniqueCustomers = userBookingCounts.size
    const returnCustomers = Array.from(userBookingCounts.values()).filter(
      (count) => count > 1
    ).length
    const returnRate =
      uniqueCustomers > 0 ? (returnCustomers / uniqueCustomers) * 100 : 0

    // Monthly earnings (last 6 months)
    const monthlyEarnings = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: now,
    }).map((month) => {
      const monthStart = startOfMonth(month)
      const monthEnd = startOfMonth(subMonths(month, -1))

      const monthBookings = allBookings.filter((b) => {
        const date = new Date(b.createdAt)
        return date >= monthStart && date < monthEnd
      })

      return {
        month: format(month, "MMM yyyy"),
        earnings: monthBookings.reduce((sum, b) => sum + b.agentEarnings, 0),
        bookings: monthBookings.length,
      }
    })

    // Top performing tours
    const tourStats = await prisma.tour.findMany({
      where: { agentId: agent.id },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { viewCount: "desc" },
      take: 5,
    })

    const topTours = tourStats.map((tour) => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      views: tour.viewCount,
      bookings: tour._count.bookings,
      conversionRate:
        tour.viewCount > 0
          ? ((tour._count.bookings / tour.viewCount) * 100).toFixed(1)
          : "0",
    }))

    // Booking status breakdown
    const statusCounts = {
      pending: allBookings.filter((b) => b.status === "PENDING").length,
      confirmed: allBookings.filter((b) => b.status === "CONFIRMED").length,
      inProgress: allBookings.filter((b) => b.status === "IN_PROGRESS").length,
      completed: allBookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: allBookings.filter((b) => b.status === "CANCELLED").length,
    }

    // Calculate growth (this month vs last month)
    const bookingGrowth =
      lastMonthBookings > 0
        ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
        : thisMonthBookings > 0
          ? 100
          : 0

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalViews,
          totalBookings,
          completedBookings,
          conversionRate: conversionRate.toFixed(1),
          avgBookingValue: avgBookingValue.toFixed(2),
          totalRevenue: totalRevenue.toFixed(2),
          returnRate: returnRate.toFixed(1),
          uniqueCustomers,
          bookingGrowth: bookingGrowth.toFixed(1),
        },
        monthlyEarnings,
        topTours,
        statusBreakdown: statusCounts,
      },
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
