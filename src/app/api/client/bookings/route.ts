import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
      },
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
