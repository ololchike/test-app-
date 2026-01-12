import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/admin/reports/users
 * User analytics data
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

    // Fetch users in date range
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Calculate daily registrations
    const dailyRegistrationsMap = new Map<string, { clients: number; agents: number }>()
    const roleMap = new Map<string, number>()

    users.forEach((user) => {
      const date = user.createdAt.toISOString().split("T")[0]

      // Daily registrations
      const existing = dailyRegistrationsMap.get(date) || { clients: 0, agents: 0 }
      if (user.role === "CLIENT") {
        existing.clients += 1
      } else if (user.role === "AGENT") {
        existing.agents += 1
      }
      dailyRegistrationsMap.set(date, existing)

      // By role
      const roleCount = roleMap.get(user.role) || 0
      roleMap.set(user.role, roleCount + 1)
    })

    // Fetch top customers by spending (all time)
    const topCustomers = await prisma.user.findMany({
      where: {
        role: "CLIENT",
      },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PAID", "IN_PROGRESS", "COMPLETED"] },
          },
          select: {
            totalAmount: true,
          },
        },
      },
    })

    const topCustomersWithSpending = topCustomers
      .map((customer) => {
        const totalSpent = customer.bookings.reduce(
          (sum, booking) => sum + booking.totalAmount,
          0
        )
        const bookingsCount = customer.bookings.length

        const name =
          customer.name ||
          (customer.firstName && customer.lastName
            ? `${customer.firstName} ${customer.lastName}`
            : null) ||
          customer.email.split("@")[0]

        return {
          id: customer.id,
          name,
          email: customer.email,
          totalSpent,
          bookings: bookingsCount,
        }
      })
      .filter((customer) => customer.bookings > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10) // Top 10 customers

    // Convert maps to arrays
    const registrations = Array.from(dailyRegistrationsMap.entries()).map(([date, data]) => ({
      date,
      clients: data.clients,
      agents: data.agents,
    }))

    const byRole = Array.from(roleMap.entries()).map(([role, count]) => ({
      role,
      count,
    }))

    return NextResponse.json({
      registrations,
      byRole,
      topCustomers: topCustomersWithSpending,
    })
  } catch (error) {
    console.error("Error fetching users data:", error)
    return NextResponse.json(
      { error: "Failed to fetch users data" },
      { status: 500 }
    )
  }
}
