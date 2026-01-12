import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/reports/revenue
 * Revenue analytics data
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

    // Fetch completed payments in date range
    const payments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        booking: {
          include: {
            tour: {
              select: {
                destination: true,
                country: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: "asc",
      },
    })

    // Calculate daily revenue
    const dailyRevenueMap = new Map<string, { amount: number; commission: number; count: number }>()
    const paymentMethodMap = new Map<string, { amount: number; count: number }>()
    const destinationMap = new Map<string, { amount: number; count: number }>()

    let totalRevenue = 0
    let totalCommission = 0

    payments.forEach((payment) => {
      const date = payment.completedAt?.toISOString().split("T")[0] || ""
      const amount = payment.amount
      const commission = payment.booking.platformCommission

      // Daily revenue
      const existing = dailyRevenueMap.get(date) || { amount: 0, commission: 0, count: 0 }
      dailyRevenueMap.set(date, {
        amount: existing.amount + amount,
        commission: existing.commission + commission,
        count: existing.count + 1,
      })

      // By payment method
      const method =
        payment.method === "MPESA"
          ? "M-Pesa"
          : payment.method === "CARD"
          ? "Card"
          : payment.method === "BANK_TRANSFER"
          ? "Bank Transfer"
          : payment.method
      const methodExisting = paymentMethodMap.get(method) || { amount: 0, count: 0 }
      paymentMethodMap.set(method, {
        amount: methodExisting.amount + amount,
        count: methodExisting.count + 1,
      })

      // By destination
      const destination = payment.booking.tour.destination
      const destExisting = destinationMap.get(destination) || { amount: 0, count: 0 }
      destinationMap.set(destination, {
        amount: destExisting.amount + amount,
        count: destExisting.count + 1,
      })

      totalRevenue += amount
      totalCommission += commission
    })

    // Convert maps to arrays
    const dailyRevenue = Array.from(dailyRevenueMap.entries()).map(([date, data]) => ({
      date,
      amount: data.amount,
      commission: data.commission,
      count: data.count,
    }))

    const byPaymentMethod = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
    }))

    const byDestination = Array.from(destinationMap.entries())
      .map(([destination, data]) => ({
        destination,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10) // Top 10 destinations

    return NextResponse.json({
      dailyRevenue,
      byPaymentMethod,
      byDestination,
      totals: {
        revenue: totalRevenue,
        commission: totalCommission,
        bookings: payments.length,
      },
    })
  } catch (error) {
    console.error("Error fetching revenue data:", error)
    return NextResponse.json(
      { error: "Failed to fetch revenue data" },
      { status: 500 }
    )
  }
}
