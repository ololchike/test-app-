import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/reports/bookings
 * Booking analytics data
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

    // Fetch bookings in date range
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tour: {
          select: {
            destination: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Calculate daily bookings
    const dailyBookingsMap = new Map<string, { count: number; value: number }>()
    const statusMap = new Map<string, number>()
    const destinationMap = new Map<string, number>()

    let totalValue = 0
    let totalCount = 0

    bookings.forEach((booking) => {
      const date = booking.createdAt.toISOString().split("T")[0]
      const value = booking.totalAmount

      // Daily bookings
      const existing = dailyBookingsMap.get(date) || { count: 0, value: 0 }
      dailyBookingsMap.set(date, {
        count: existing.count + 1,
        value: existing.value + value,
      })

      // By status
      const statusCount = statusMap.get(booking.status) || 0
      statusMap.set(booking.status, statusCount + 1)

      // By destination
      const destination = booking.tour.destination
      const destCount = destinationMap.get(destination) || 0
      destinationMap.set(destination, destCount + 1)

      totalValue += value
      totalCount += 1
    })

    // Convert maps to arrays
    const dailyBookings = Array.from(dailyBookingsMap.entries()).map(([date, data]) => ({
      date,
      count: data.count,
      value: data.value,
    }))

    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
      status: status.replace(/_/g, " "),
      count,
    }))

    const byDestination = Array.from(destinationMap.entries())
      .map(([destination, count]) => ({
        destination,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10) // Top 10 destinations

    const averageValue = totalCount > 0 ? totalValue / totalCount : 0

    return NextResponse.json({
      dailyBookings,
      byStatus,
      byDestination,
      averageValue,
      totalCount,
      totalValue,
    })
  } catch (error) {
    console.error("Error fetching bookings data:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings data" },
      { status: 500 }
    )
  }
}
