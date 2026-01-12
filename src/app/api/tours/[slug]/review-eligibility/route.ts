import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    const { slug } = await params

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Find the tour by slug
    const tour = await prisma.tour.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!tour) {
      return NextResponse.json(
        { success: false, error: "Tour not found" },
        { status: 404 }
      )
    }

    // Check if user has any completed bookings for this tour
    // Include both COMPLETED status and CONFIRMED bookings where the tour has ended
    const now = new Date()
    const completedBookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        tourId: tour.id,
        paymentStatus: "COMPLETED",
        OR: [
          { status: "COMPLETED" },
          {
            status: "CONFIRMED",
            endDate: { lt: now },
          },
        ],
      },
      include: {
        review: {
          select: { id: true },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    })

    // Check if user already has a review for this tour
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        tourId: tour.id,
      },
    })

    if (existingReview) {
      return NextResponse.json({
        success: true,
        canReview: false,
        hasExistingReview: true,
        eligibleBooking: null,
      })
    }

    // Find a booking without a review
    const eligibleBooking = completedBookings.find((booking) => !booking.review)

    if (!eligibleBooking) {
      return NextResponse.json({
        success: true,
        canReview: false,
        hasExistingReview: false,
        eligibleBooking: null,
        message: completedBookings.length > 0
          ? "All your completed bookings already have reviews"
          : "You need to complete a booking for this tour before writing a review",
      })
    }

    return NextResponse.json({
      success: true,
      canReview: true,
      hasExistingReview: false,
      eligibleBooking: {
        id: eligibleBooking.id,
        startDate: eligibleBooking.startDate.toISOString(),
        hasReview: false,
      },
    })
  } catch (error) {
    console.error("Error checking review eligibility:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check review eligibility" },
      { status: 500 }
    )
  }
}
