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

    // Parse query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const upcoming = searchParams.get("upcoming")

    // Build where clause - SECURITY: Always filter by authenticated user
    const whereClause: Record<string, unknown> = {
      userId: session.user.id,
    }

    // Status filter
    if (status && status !== "all") {
      whereClause.status = status as BookingStatus
    }

    // Upcoming trips filter (trips starting in the future)
    if (upcoming === "true") {
      whereClause.startDate = { gte: new Date() }
      whereClause.status = { notIn: ["CANCELLED", "REFUNDED"] }
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        tour: {
          select: {
            title: true,
            slug: true,
            coverImage: true,
            destination: true,
            durationDays: true,
            durationNights: true,
          },
        },
        agent: {
          select: {
            id: true,
            businessName: true,
          },
        },
        review: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Map bookings to include hasReview flag
    const mappedBookings = bookings.map((booking) => ({
      ...booking,
      hasReview: !!booking.review,
      review: undefined, // Don't expose full review object
    }))

    return NextResponse.json({ bookings: mappedBookings })
  } catch (error) {
    console.error("Error fetching client bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}
