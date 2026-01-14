import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Parse query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build where clause
    const whereClause: Record<string, unknown> = {
      agentId: agent.id,
    }

    // Status filter
    if (status && status !== "all") {
      whereClause.status = status as BookingStatus
    }

    // Search filter (booking reference or contact name)
    if (search) {
      whereClause.OR = [
        { bookingReference: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ]
    }

    // Date range filter
    if (startDate) {
      whereClause.startDate = {
        ...(whereClause.startDate as object || {}),
        gte: new Date(startDate),
      }
    }
    if (endDate) {
      whereClause.endDate = {
        ...(whereClause.endDate as object || {}),
        lte: new Date(endDate),
      }
    }

    // Get all bookings for the agent's tours
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            destination: true,
            durationDays: true,
            durationNights: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Calculate summary stats
    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    }

    return NextResponse.json({ bookings, stats })
  } catch (error) {
    console.error("Error fetching agent bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
