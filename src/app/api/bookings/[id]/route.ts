import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

// Schema for cancellation request
const cancelBookingSchema = z.object({
  reason: z.string().min(1, "Cancellation reason is required").max(1000).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
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
            businessEmail: true,
            businessPhone: true,
          },
        },
        accommodations: {
          include: {
            accommodationOption: {
              select: {
                name: true,
                tier: true,
              },
            },
          },
        },
        activities: {
          include: {
            activityAddon: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    )
  }
}

// PATCH - Cancel booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Validate request body
    const validation = cancelBookingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { reason } = validation.data

    // Fetch booking with tour details for cancellation policy
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        tour: {
          select: {
            freeCancellationDays: true,
          },
        },
        payments: {
          where: { status: "COMPLETED" },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verify ownership - user must own the booking or be an admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (booking.userId !== session.user.id && user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You can only cancel your own bookings" },
        { status: 403 }
      )
    }

    // Check if booking can be cancelled
    if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      )
    }

    if (booking.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Cannot cancel a completed booking" },
        { status: 400 }
      )
    }

    // Calculate refund based on cancellation policy
    const now = new Date()
    const startDate = new Date(booking.startDate)
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    const freeCancellationDays = booking.tour.freeCancellationDays || 14

    let refundAmount = 0
    let refundPercentage = 0

    // Calculate total paid amount
    const totalPaid = booking.payments.reduce((sum, p) => sum + p.amount, 0)

    if (daysUntilStart >= freeCancellationDays) {
      // Full refund - within free cancellation period
      refundPercentage = 100
      refundAmount = totalPaid
    } else if (daysUntilStart >= 7) {
      // 50% refund - 7+ days before
      refundPercentage = 50
      refundAmount = Math.round(totalPaid * 0.5 * 100) / 100
    } else if (daysUntilStart >= 3) {
      // 25% refund - 3-6 days before
      refundPercentage = 25
      refundAmount = Math.round(totalPaid * 0.25 * 100) / 100
    } else {
      // No refund - less than 3 days
      refundPercentage = 0
      refundAmount = 0
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: now,
        cancellationReason: reason || "Cancelled by user",
        refundAmount,
      },
      include: {
        tour: {
          select: {
            title: true,
            slug: true,
          },
        },
        agent: {
          select: {
            businessName: true,
            businessEmail: true,
          },
        },
      },
    })

    // If there's a refund, update the agent's earnings
    if (refundAmount > 0 && totalPaid > 0) {
      // Reverse the agent earnings proportionally
      const refundRatio = refundAmount / totalPaid
      const earningsRefund = Math.round(booking.agentEarnings * refundRatio * 100) / 100

      await prisma.agentEarning.create({
        data: {
          agentId: booking.agentId,
          bookingId: booking.id,
          amount: -earningsRefund,
          currency: booking.currency,
          description: `Refund for cancelled booking ${booking.bookingReference}`,
          type: "REFUND",
        },
      })
    }

    // TODO: Send cancellation emails to user and agent
    // TODO: Initiate actual refund through payment gateway if applicable

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        bookingReference: updatedBooking.bookingReference,
        status: updatedBooking.status,
        cancelledAt: updatedBooking.cancelledAt,
        cancellationReason: updatedBooking.cancellationReason,
      },
      refund: {
        amount: refundAmount,
        percentage: refundPercentage,
        message: refundPercentage === 100
          ? "Full refund will be processed"
          : refundPercentage > 0
            ? `${refundPercentage}% refund ($${refundAmount}) will be processed`
            : "No refund applicable based on cancellation policy",
        daysUntilStart,
        freeCancellationDays,
      },
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    )
  }
}
