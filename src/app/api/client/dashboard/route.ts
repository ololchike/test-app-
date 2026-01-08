import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()

    // Get all bookings for the user
    const bookings = await prisma.booking.findMany({
      where: { userId },
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
            businessName: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    })

    // Calculate stats
    const upcomingBookings = bookings.filter(
      (b) => new Date(b.startDate) >= now && b.status !== "CANCELLED"
    )
    const completedBookings = bookings.filter(
      (b) => new Date(b.endDate) < now || b.status === "COMPLETED"
    )
    const totalSpent = bookings
      .filter((b) => b.paymentStatus === "COMPLETED")
      .reduce((sum, b) => sum + b.totalAmount, 0)

    // Get next upcoming trip
    const nextTrip = upcomingBookings[0]
    const daysUntilNextTrip = nextTrip
      ? Math.ceil(
          (new Date(nextTrip.startDate).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null

    // Get last completed trip date
    const lastCompletedTrip = completedBookings
      .sort(
        (a, b) =>
          new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      )[0]

    // Format upcoming bookings for display (limit to 3)
    const upcomingTrips = upcomingBookings.slice(0, 3).map((b) => ({
      id: b.id,
      bookingReference: b.bookingReference,
      tourTitle: b.tour.title,
      tourSlug: b.tour.slug,
      operator: b.agent.businessName,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      status: b.status,
      paymentStatus: b.paymentStatus,
      image: b.tour.coverImage,
      guests: b.adults + b.children,
      totalAmount: b.totalAmount,
    }))

    return NextResponse.json({
      stats: {
        upcomingTrips: upcomingBookings.length,
        completedTrips: completedBookings.length,
        totalSpent,
        daysUntilNextTrip,
        lastTripDate: lastCompletedTrip
          ? lastCompletedTrip.endDate.toISOString()
          : null,
      },
      upcomingBookings: upcomingTrips,
    })
  } catch (error) {
    console.error("Error fetching client dashboard:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
