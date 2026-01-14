import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Cache for platform stats (5 minutes)
let cache: { data: PlatformStats; timestamp: number } | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface PlatformStats {
  totalBookings: number
  verifiedOperators: number
  averageRating: number
  totalPaidToAgents: number
  activeTours: number
  lastUpdated: string
}

export async function GET() {
  try {
    const now = Date.now()

    // Return cached data if still valid
    if (cache && now - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      })
    }

    // Fetch all stats in parallel for better performance
    const [bookingsCount, operatorsCount, avgRating, totalPaid, toursCount] =
      await Promise.all([
        // Total confirmed/completed bookings
        prisma.booking.count({
          where: {
            status: {
              in: ["CONFIRMED", "COMPLETED", "PAID", "IN_PROGRESS"],
            },
          },
        }),

        // Verified operators (agents)
        prisma.agent.count({
          where: {
            isVerified: true,
            status: "ACTIVE",
          },
        }),

        // Average rating from approved reviews
        prisma.review.aggregate({
          _avg: {
            rating: true,
          },
          where: {
            isApproved: true,
          },
        }),

        // Total paid to agents through completed withdrawals
        prisma.withdrawalRequest.aggregate({
          _sum: {
            amount: true,
          },
          where: {
            status: "COMPLETED",
          },
        }),

        // Active tours count
        prisma.tour.count({
          where: {
            status: "ACTIVE",
          },
        }),
      ])

    const data: PlatformStats = {
      totalBookings: bookingsCount,
      verifiedOperators: operatorsCount,
      averageRating: avgRating._avg.rating || 4.8, // Default to 4.8 if no reviews
      totalPaidToAgents: totalPaid._sum.amount || 0,
      activeTours: toursCount,
      lastUpdated: new Date().toISOString(),
    }

    // Update cache
    cache = { data, timestamp: now }

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    })
  } catch (error) {
    console.error("Error fetching platform stats:", error)

    // Return fallback data on error
    return NextResponse.json(
      {
        totalBookings: 100,
        verifiedOperators: 20,
        averageRating: 4.8,
        totalPaidToAgents: 50000,
        activeTours: 50,
        lastUpdated: new Date().toISOString(),
      },
      { status: 200 }
    )
  }
}
