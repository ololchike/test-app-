import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  format,
  addMonths,
} from "date-fns"

// GET - Check availability for a tour (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const startDateStr = searchParams.get("startDate")
    const endDateStr = searchParams.get("endDate")
    const guests = parseInt(searchParams.get("guests") || "1")

    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        maxGroupSize: true,
        durationDays: true,
        status: true,
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tour is not available for booking" },
        { status: 400 }
      )
    }

    // Calculate date range to check
    const now = new Date()
    const startDate = startDateStr
      ? new Date(startDateStr)
      : startOfDay(now)
    const endDate = endDateStr
      ? new Date(endDateStr)
      : addMonths(now, 6)

    // Get availability entries for the period
    const availabilityEntries = await prisma.tourAvailability.findMany({
      where: {
        tourId: tour.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Get existing bookings for the period
    const bookings = await prisma.booking.findMany({
      where: {
        tourId: tour.id,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      select: {
        startDate: true,
        endDate: true,
        adults: true,
        children: true,
      },
    })

    // Create a map of dates with their availability status
    const availabilityMap = new Map<
      string,
      {
        available: boolean
        type: string
        spotsAvailable: number
        bookedSpots: number
        reason?: string
      }
    >()

    // Initialize all dates as available with max group size
    const allDates = eachDayOfInterval({ start: startDate, end: endDate })
    allDates.forEach((date) => {
      const dateKey = format(date, "yyyy-MM-dd")
      availabilityMap.set(dateKey, {
        available: true,
        type: "AVAILABLE",
        spotsAvailable: tour.maxGroupSize,
        bookedSpots: 0,
      })
    })

    // Apply availability entries
    availabilityEntries.forEach((entry) => {
      const dateKey = format(entry.date, "yyyy-MM-dd")
      const existing = availabilityMap.get(dateKey)

      if (entry.type === "BLOCKED") {
        availabilityMap.set(dateKey, {
          available: false,
          type: "BLOCKED",
          spotsAvailable: 0,
          bookedSpots: existing?.bookedSpots || 0,
          reason: entry.notes || "Date is blocked",
        })
      } else if (entry.type === "LIMITED") {
        availabilityMap.set(dateKey, {
          available: true,
          type: "LIMITED",
          spotsAvailable: entry.spotsAvailable || 0,
          bookedSpots: existing?.bookedSpots || 0,
        })
      }
    })

    // Account for existing bookings
    bookings.forEach((booking) => {
      const bookingDates = eachDayOfInterval({
        start: booking.startDate,
        end: booking.endDate,
      })
      const bookingGuests = booking.adults + booking.children

      bookingDates.forEach((date) => {
        const dateKey = format(date, "yyyy-MM-dd")
        const existing = availabilityMap.get(dateKey)
        if (existing) {
          const newBookedSpots = existing.bookedSpots + bookingGuests
          const remainingSpots = existing.spotsAvailable - newBookedSpots

          availabilityMap.set(dateKey, {
            ...existing,
            available: remainingSpots >= guests,
            bookedSpots: newBookedSpots,
            reason:
              remainingSpots < guests
                ? `Only ${Math.max(0, remainingSpots)} spots remaining`
                : undefined,
          })
        }
      })
    })

    // Convert map to array for response
    const availability = Array.from(availabilityMap.entries()).map(
      ([date, status]) => ({
        date,
        ...status,
      })
    )

    // Find next available date
    const nextAvailableDate = availability.find(
      (a) => a.available && new Date(a.date) >= startOfDay(now)
    )

    // Calculate summary
    const totalDates = availability.length
    const availableDates = availability.filter((a) => a.available).length
    const blockedDates = availability.filter(
      (a) => a.type === "BLOCKED"
    ).length
    const limitedDates = availability.filter(
      (a) => a.type === "LIMITED"
    ).length

    return NextResponse.json({
      success: true,
      data: {
        tour: {
          id: tour.id,
          title: tour.title,
          maxGroupSize: tour.maxGroupSize,
          durationDays: tour.durationDays,
        },
        summary: {
          totalDates,
          availableDates,
          blockedDates,
          limitedDates,
          nextAvailableDate: nextAvailableDate?.date || null,
        },
        availability,
        dateRange: {
          start: format(startDate, "yyyy-MM-dd"),
          end: format(endDate, "yyyy-MM-dd"),
        },
      },
    })
  } catch (error) {
    console.error("Error checking availability:", error)
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    )
  }
}

// POST - Check if specific dates are available (for booking validation)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { startDate, endDate, guests = 1 } = body

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start date and end date are required" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Get tour
    const tour = await prisma.tour.findUnique({
      where: { slug },
      select: {
        id: true,
        maxGroupSize: true,
        status: true,
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.status !== "ACTIVE") {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: "Tour is not available for booking",
        },
      })
    }

    // Check if any dates are blocked
    const blockedDates = await prisma.tourAvailability.findMany({
      where: {
        tourId: tour.id,
        date: {
          gte: startOfDay(start),
          lte: endOfDay(end),
        },
        type: "BLOCKED",
      },
    })

    if (blockedDates.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: `Some dates are blocked: ${blockedDates
            .map((d) => format(d.date, "MMM d"))
            .join(", ")}`,
          blockedDates: blockedDates.map((d) => format(d.date, "yyyy-MM-dd")),
        },
      })
    }

    // Check limited availability dates
    const limitedDates = await prisma.tourAvailability.findMany({
      where: {
        tourId: tour.id,
        date: {
          gte: startOfDay(start),
          lte: endOfDay(end),
        },
        type: "LIMITED",
      },
    })

    // Get existing bookings that overlap
    const existingBookings = await prisma.booking.findMany({
      where: {
        tourId: tour.id,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
        startDate: { lte: end },
        endDate: { gte: start },
      },
      select: {
        startDate: true,
        endDate: true,
        adults: true,
        children: true,
      },
    })

    // Calculate booked spots for each day
    const tripDates = eachDayOfInterval({ start, end })
    let insufficientCapacityDate: string | null = null

    for (const date of tripDates) {
      const dateKey = format(date, "yyyy-MM-dd")

      // Get max spots for this date
      const limitedEntry = limitedDates.find(
        (l) => format(l.date, "yyyy-MM-dd") === dateKey
      )
      const maxSpots = limitedEntry?.spotsAvailable || tour.maxGroupSize

      // Calculate booked spots
      let bookedSpots = 0
      existingBookings.forEach((booking) => {
        if (date >= booking.startDate && date <= booking.endDate) {
          bookedSpots += booking.adults + booking.children
        }
      })

      const remainingSpots = maxSpots - bookedSpots

      if (remainingSpots < guests) {
        insufficientCapacityDate = dateKey
        break
      }
    }

    if (insufficientCapacityDate) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          reason: `Insufficient capacity on ${format(
            new Date(insufficientCapacityDate),
            "MMM d, yyyy"
          )}`,
          insufficientDate: insufficientCapacityDate,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        message: "Dates are available for booking",
      },
    })
  } catch (error) {
    console.error("Error validating availability:", error)
    return NextResponse.json(
      { error: "Failed to validate availability" },
      { status: 500 }
    )
  }
}
