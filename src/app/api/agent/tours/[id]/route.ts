import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema for tour update (all fields optional for partial updates)
const updateTourSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  subtitle: z.string().max(200).optional().nullable(),
  description: z.string().min(50).optional(),
  destination: z.string().min(2).optional(),
  country: z.enum(["Kenya", "Tanzania", "Uganda", "Rwanda"]).optional(),
  durationDays: z.number().int().min(1).max(30).optional(),
  durationNights: z.number().int().min(0).max(30).optional(),
  basePrice: z.number().min(0).optional(),
  childPrice: z.number().min(0).optional().nullable(),
  infantPrice: z.number().min(0).optional().nullable(),
  singleSupplement: z.number().min(0).optional().nullable(),
  maxGroupSize: z.number().int().min(1).max(50).optional(),
  difficulty: z.enum(["Easy", "Moderate", "Challenging"]).optional(),
  tourType: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
  bestSeason: z.array(z.string()).optional(),
  coverImage: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  // Deposit settings
  depositEnabled: z.boolean().optional(),
  depositPercentage: z.number().min(10).max(90).optional(),
  freeCancellationDays: z.number().int().min(0).max(90).optional(),
})

// GET single tour for editing
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isAgent = session.user.role === "AGENT"

    if (!isAdmin && !isAgent) {
      return NextResponse.json(
        { error: "Only agents or admins can access this resource" },
        { status: 403 }
      )
    }

    // Find agent profile (only for agents)
    let agent = null
    if (isAgent) {
      agent = await prisma.agent.findUnique({
        where: { userId: session.user.id },
      })

      if (!agent) {
        return NextResponse.json(
          { error: "Agent profile not found" },
          { status: 404 }
        )
      }
    }

    // Fetch tour
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        itinerary: { orderBy: { dayNumber: "asc" } },
        accommodationOptions: { orderBy: { pricePerNight: "asc" } },
        activityAddons: true,
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Verify ownership (agents can only access their own tours, admins can access all)
    if (isAgent && tour.agentId !== agent?.id) {
      return NextResponse.json(
        { error: "You don't have permission to access this tour" },
        { status: 403 }
      )
    }

    // Transform JSON fields
    const transformedTour = {
      ...tour,
      childPrice: tour.childPrice,
      infantPrice: tour.infantPrice,
      singleSupplement: tour.singleSupplement,
      tourType: JSON.parse(tour.tourType || "[]"),
      highlights: JSON.parse(tour.highlights || "[]"),
      included: JSON.parse(tour.included || "[]"),
      excluded: JSON.parse(tour.excluded || "[]"),
      bestSeason: JSON.parse(tour.bestSeason || "[]"),
      images: JSON.parse(tour.images || "[]"),
      itinerary: tour.itinerary.map((day) => ({
        ...day,
        meals: JSON.parse(day.meals || "[]"),
        activities: JSON.parse(day.activities || "[]"),
      })),
      accommodationOptions: tour.accommodationOptions.map((acc) => ({
        ...acc,
        images: JSON.parse(acc.images || "[]"),
        amenities: JSON.parse(acc.amenities || "[]"),
      })),
      activityAddons: tour.activityAddons.map((addon) => ({
        ...addon,
        images: JSON.parse(addon.images || "[]"),
        dayAvailable: JSON.parse(addon.dayAvailable || "[]"),
      })),
    }

    return NextResponse.json({ tour: transformedTour })
  } catch (error) {
    console.error("Error fetching tour:", error)
    return NextResponse.json(
      { error: "Failed to fetch tour" },
      { status: 500 }
    )
  }
}

// UPDATE tour
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isAgent = session.user.role === "AGENT"

    if (!isAdmin && !isAgent) {
      return NextResponse.json(
        { error: "Only agents or admins can update tours" },
        { status: 403 }
      )
    }

    // Find agent profile (only for agents)
    let agent = null
    if (isAgent) {
      agent = await prisma.agent.findUnique({
        where: { userId: session.user.id },
      })

      if (!agent) {
        return NextResponse.json(
          { error: "Agent profile not found" },
          { status: 404 }
        )
      }
    }

    // Check tour exists
    const existingTour = await prisma.tour.findUnique({
      where: { id },
    })

    if (!existingTour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Verify ownership (agents can only update their own tours, admins can update all)
    if (isAgent && existingTour.agentId !== agent?.id) {
      return NextResponse.json(
        { error: "You don't have permission to update this tour" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateTourSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Build update data (convert arrays to JSON strings)
    const updateData: Record<string, unknown> = {}

    if (data.title !== undefined) updateData.title = data.title
    if (data.subtitle !== undefined) updateData.subtitle = data.subtitle
    if (data.description !== undefined) updateData.description = data.description
    if (data.destination !== undefined) updateData.destination = data.destination
    if (data.country !== undefined) updateData.country = data.country
    if (data.durationDays !== undefined) updateData.durationDays = data.durationDays
    if (data.durationNights !== undefined) updateData.durationNights = data.durationNights
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice
    if (data.childPrice !== undefined) updateData.childPrice = data.childPrice
    if (data.infantPrice !== undefined) updateData.infantPrice = data.infantPrice
    if (data.singleSupplement !== undefined) updateData.singleSupplement = data.singleSupplement
    if (data.maxGroupSize !== undefined) updateData.maxGroupSize = data.maxGroupSize
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage
    if (data.tourType !== undefined) updateData.tourType = JSON.stringify(data.tourType)
    if (data.highlights !== undefined) updateData.highlights = JSON.stringify(data.highlights)
    if (data.included !== undefined) updateData.included = JSON.stringify(data.included)
    if (data.excluded !== undefined) updateData.excluded = JSON.stringify(data.excluded)
    if (data.bestSeason !== undefined) updateData.bestSeason = JSON.stringify(data.bestSeason)
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images)
    // Deposit settings
    if (data.depositEnabled !== undefined) updateData.depositEnabled = data.depositEnabled
    if (data.depositPercentage !== undefined) updateData.depositPercentage = data.depositPercentage
    if (data.freeCancellationDays !== undefined) updateData.freeCancellationDays = data.freeCancellationDays

    // Update tour
    const tour = await prisma.tour.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      message: "Tour updated successfully",
      tour: {
        id: tour.id,
        slug: tour.slug,
        title: tour.title,
        status: tour.status,
      },
    })
  } catch (error) {
    console.error("Error updating tour:", error)
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    )
  }
}

// DELETE tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = session.user.role === "ADMIN"
    const isAgent = session.user.role === "AGENT"

    if (!isAdmin && !isAgent) {
      return NextResponse.json(
        { error: "Only agents or admins can delete tours" },
        { status: 403 }
      )
    }

    // Find agent profile (only for agents)
    let agent = null
    if (isAgent) {
      agent = await prisma.agent.findUnique({
        where: { userId: session.user.id },
      })

      if (!agent) {
        return NextResponse.json(
          { error: "Agent profile not found" },
          { status: 404 }
        )
      }
    }

    // Check tour exists
    const existingTour = await prisma.tour.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ["PENDING", "CONFIRMED"] },
              },
            },
          },
        },
      },
    })

    if (!existingTour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Verify ownership (agents can only delete their own tours, admins can delete all)
    if (isAgent && existingTour.agentId !== agent?.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this tour" },
        { status: 403 }
      )
    }

    // Check for active bookings
    if (existingTour._count.bookings > 0) {
      return NextResponse.json(
        { error: "Cannot delete tour with active bookings. Please cancel or complete all bookings first." },
        { status: 400 }
      )
    }

    // Delete tour (cascade will handle related records)
    await prisma.tour.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Tour deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting tour:", error)
    return NextResponse.json(
      { error: "Failed to delete tour" },
      { status: 500 }
    )
  }
}
