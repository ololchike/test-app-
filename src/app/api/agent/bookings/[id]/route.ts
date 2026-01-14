import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { BookingStatus } from "@prisma/client"

// Schema for booking status update
const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().max(2000).optional(),
})

// GET - Get single booking details for agent
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Fetch booking with security check - agent can only view their own bookings
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        agentId: agent.id,
      },
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
            freeCancellationDays: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
                price: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            method: true,
            status: true,
            initiatedAt: true,
            completedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error fetching agent booking:", error)
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status (agent only)
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
    const validation = updateBookingSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { status, notes } = validation.data

    // Get agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Verify booking belongs to agent
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        agentId: agent.id,
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Validate status transitions
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PAID", "IN_PROGRESS", "CANCELLED"],
      PAID: ["IN_PROGRESS", "COMPLETED", "CANCELLED", "REFUNDED"],
      IN_PROGRESS: ["COMPLETED", "CANCELLED"],
      COMPLETED: ["REFUNDED"],
      CANCELLED: [],
      REFUNDED: [],
    }

    if (status && !validTransitions[existingBooking.status].includes(status as BookingStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${existingBooking.status} to ${status}`,
          allowedTransitions: validTransitions[existingBooking.status],
        },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (status) {
      updateData.status = status

      // Handle cancellation
      if (status === "CANCELLED") {
        updateData.cancelledAt = new Date()
        updateData.cancellationReason = notes || "Cancelled by agent"
      }
    }

    if (notes && !status) {
      updateData.specialRequests = existingBooking.specialRequests
        ? `${existingBooking.specialRequests}\n\n[Agent Note]: ${notes}`
        : `[Agent Note]: ${notes}`
    }

    // Update booking
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        bookingReference: true,
        status: true,
        cancelledAt: true,
        cancellationReason: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Error updating agent booking:", error)
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    )
  }
}
