import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { startOfDay, endOfDay, startOfMonth, endOfMonth, addMonths } from "date-fns"

const availabilitySchema = z.object({
  dates: z.array(z.string().transform((str) => new Date(str))),
  type: z.enum(["AVAILABLE", "BLOCKED", "LIMITED"]),
  spotsAvailable: z.number().optional(),
  notes: z.string().optional(),
})

// GET - Fetch availability for a tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tourId } = await params
    const { searchParams } = new URL(request.url)
    const monthOffset = parseInt(searchParams.get("monthOffset") || "0")

    // Verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const tour = await prisma.tour.findFirst({
      where: { id: tourId, agentId: agent.id },
      select: { id: true, title: true, maxGroupSize: true },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Calculate date range (3 months from current month + offset)
    const baseDate = addMonths(new Date(), monthOffset)
    const startDate = startOfMonth(baseDate)
    const endDate = endOfMonth(addMonths(baseDate, 2))

    // Get availability records
    const availability = await prisma.tourAvailability.findMany({
      where: {
        tourId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: "asc" },
    })

    // Get existing bookings to show booked dates
    const bookings = await prisma.booking.findMany({
      where: {
        tourId,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        adults: true,
        children: true,
        status: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        tour: {
          id: tour.id,
          title: tour.title,
          maxGroupSize: tour.maxGroupSize,
        },
        availability: availability.map((a) => ({
          id: a.id,
          date: a.date.toISOString(),
          type: a.type,
          spotsAvailable: a.spotsAvailable,
          notes: a.notes,
        })),
        bookings: bookings.map((b) => ({
          id: b.id,
          startDate: b.startDate.toISOString(),
          endDate: b.endDate.toISOString(),
          guests: b.adults + b.children,
          status: b.status,
        })),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    )
  }
}

// POST - Set availability for dates
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tourId } = await params
    const body = await request.json()

    const validation = availabilitySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { dates, type, spotsAvailable, notes } = validation.data

    // Verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const tour = await prisma.tour.findFirst({
      where: { id: tourId, agentId: agent.id },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Upsert availability for each date
    const results = await Promise.all(
      dates.map(async (date) => {
        const normalizedDate = startOfDay(date)

        return prisma.tourAvailability.upsert({
          where: {
            tourId_date: {
              tourId,
              date: normalizedDate,
            },
          },
          create: {
            tourId,
            date: normalizedDate,
            type,
            spotsAvailable: type === "LIMITED" ? spotsAvailable : null,
            notes,
          },
          update: {
            type,
            spotsAvailable: type === "LIMITED" ? spotsAvailable : null,
            notes,
          },
        })
      })
    )

    return NextResponse.json({
      success: true,
      message: `Updated availability for ${results.length} date(s)`,
      data: results.map((r) => ({
        id: r.id,
        date: r.date.toISOString(),
        type: r.type,
        spotsAvailable: r.spotsAvailable,
      })),
    })
  } catch (error) {
    console.error("Error setting availability:", error)
    return NextResponse.json(
      { error: "Failed to set availability" },
      { status: 500 }
    )
  }
}

// DELETE - Remove availability entries (revert to default)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: tourId } = await params
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date")

    if (!dateStr) {
      return NextResponse.json(
        { error: "Date parameter required" },
        { status: 400 }
      )
    }

    const date = startOfDay(new Date(dateStr))

    // Verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const tour = await prisma.tour.findFirst({
      where: { id: tourId, agentId: agent.id },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    await prisma.tourAvailability.deleteMany({
      where: {
        tourId,
        date,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Availability entry removed",
    })
  } catch (error) {
    console.error("Error deleting availability:", error)
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    )
  }
}
