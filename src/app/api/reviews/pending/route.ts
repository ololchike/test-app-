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

    // Find completed bookings without reviews
    const completedBookingsWithoutReviews = await prisma.booking.findMany({
      where: {
        userId,
        status: "COMPLETED",
        review: null, // No review exists
      },
      orderBy: {
        endDate: "desc",
      },
      take: 10,
      include: {
        tour: {
          select: {
            id: true,
            slug: true,
            title: true,
            coverImage: true,
          },
        },
      },
    })

    const pendingReviews = completedBookingsWithoutReviews.map((booking) => ({
      bookingId: booking.id,
      tourId: booking.tour.id,
      tourSlug: booking.tour.slug,
      tourTitle: booking.tour.title,
      tourImage: booking.tour.coverImage || "",
      completedAt: booking.endDate.toISOString(),
    }))

    return NextResponse.json({ pendingReviews })
  } catch (error) {
    console.error("Error fetching pending reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
