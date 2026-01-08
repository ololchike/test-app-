import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const itinerarySchema = z.object({
  dayNumber: z.number().int().min(1),
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  meals: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  overnight: z.string().optional().nullable(),
  // New fields for accommodation/addon references
  availableAccommodationIds: z.array(z.string()).optional(),
  defaultAccommodationId: z.string().optional().nullable(),
  availableAddonIds: z.array(z.string()).optional(),
})

// GET all itinerary days for a tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can access this resource" },
        { status: 403 }
      )
    }

    // Find agent and verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this tour" },
        { status: 403 }
      )
    }

    // Fetch itinerary
    const itinerary = await prisma.itinerary.findMany({
      where: { tourId },
      orderBy: { dayNumber: "asc" },
    })

    // Transform JSON fields
    const transformed = itinerary.map((day) => ({
      ...day,
      meals: JSON.parse(day.meals || "[]"),
      activities: JSON.parse(day.activities || "[]"),
      availableAccommodationIds: JSON.parse(day.availableAccommodationIds || "[]"),
      availableAddonIds: JSON.parse(day.availableAddonIds || "[]"),
    }))

    return NextResponse.json({ itinerary: transformed })
  } catch (error) {
    console.error("Error fetching itinerary:", error)
    return NextResponse.json(
      { error: "Failed to fetch itinerary" },
      { status: 500 }
    )
  }
}

// POST create a new itinerary day
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can add itinerary days" },
        { status: 403 }
      )
    }

    // Find agent and verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this tour" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = itinerarySchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Check if day number already exists
    const existingDay = await prisma.itinerary.findUnique({
      where: {
        tourId_dayNumber: {
          tourId,
          dayNumber: data.dayNumber,
        },
      },
    })

    if (existingDay) {
      // Update existing day instead
      const updatedDay = await prisma.itinerary.update({
        where: { id: existingDay.id },
        data: {
          title: data.title,
          description: data.description || "",
          meals: JSON.stringify(data.meals || []),
          activities: JSON.stringify(data.activities || []),
          overnight: data.overnight || null,
        },
      })

      return NextResponse.json({
        message: "Itinerary day updated",
        itinerary: {
          ...updatedDay,
          meals: JSON.parse(updatedDay.meals || "[]"),
          activities: JSON.parse(updatedDay.activities || "[]"),
        },
      })
    }

    // Create itinerary day
    const itineraryDay = await prisma.itinerary.create({
      data: {
        tourId,
        dayNumber: data.dayNumber,
        title: data.title,
        description: data.description || "",
        location: data.location || null,
        meals: JSON.stringify(data.meals || []),
        activities: JSON.stringify(data.activities || []),
        overnight: data.overnight || null,
        availableAccommodationIds: JSON.stringify(data.availableAccommodationIds || []),
        defaultAccommodationId: data.defaultAccommodationId || null,
        availableAddonIds: JSON.stringify(data.availableAddonIds || []),
      },
    })

    return NextResponse.json(
      {
        message: "Itinerary day added successfully",
        itinerary: {
          ...itineraryDay,
          meals: JSON.parse(itineraryDay.meals || "[]"),
          activities: JSON.parse(itineraryDay.activities || "[]"),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating itinerary day:", error)
    return NextResponse.json(
      { error: "Failed to add itinerary day" },
      { status: 500 }
    )
  }
}

// PUT update all itinerary days (bulk update)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can update itinerary" },
        { status: 403 }
      )
    }

    // Find agent and verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this tour" },
        { status: 403 }
      )
    }

    // Parse request body - expects array of itinerary days
    const body = await request.json()
    const { itinerary } = body

    if (!Array.isArray(itinerary)) {
      return NextResponse.json(
        { error: "Expected itinerary array" },
        { status: 400 }
      )
    }

    // Delete existing itinerary and create new
    await prisma.itinerary.deleteMany({
      where: { tourId },
    })

    // Create all itinerary days
    const createdDays = await Promise.all(
      itinerary.map((day: z.infer<typeof itinerarySchema>) =>
        prisma.itinerary.create({
          data: {
            tourId,
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description || "",
            location: day.location || null,
            meals: JSON.stringify(day.meals || []),
            activities: JSON.stringify(day.activities || []),
            overnight: day.overnight || null,
            availableAccommodationIds: JSON.stringify(day.availableAccommodationIds || []),
            defaultAccommodationId: day.defaultAccommodationId || null,
            availableAddonIds: JSON.stringify(day.availableAddonIds || []),
          },
        })
      )
    )

    // Transform JSON fields
    const transformed = createdDays.map((day) => ({
      ...day,
      meals: JSON.parse(day.meals || "[]"),
      activities: JSON.parse(day.activities || "[]"),
      availableAccommodationIds: JSON.parse(day.availableAccommodationIds || "[]"),
      availableAddonIds: JSON.parse(day.availableAddonIds || "[]"),
    }))

    return NextResponse.json({
      message: "Itinerary updated successfully",
      itinerary: transformed,
    })
  } catch (error) {
    console.error("Error updating itinerary:", error)
    return NextResponse.json(
      { error: "Failed to update itinerary" },
      { status: 500 }
    )
  }
}

// DELETE all itinerary days for a tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can delete itinerary" },
        { status: 403 }
      )
    }

    // Find agent and verify tour ownership
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to modify this tour" },
        { status: 403 }
      )
    }

    // Delete all itinerary days
    await prisma.itinerary.deleteMany({
      where: { tourId },
    })

    return NextResponse.json({
      message: "Itinerary deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    return NextResponse.json(
      { error: "Failed to delete itinerary" },
      { status: 500 }
    )
  }
}
