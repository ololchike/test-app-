import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateAccommodationSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  tier: z.enum(["BUDGET", "MID_RANGE", "LUXURY", "ULTRA_LUXURY"]).optional(),
  basePricePerNight: z.number().min(0).optional(),
  currency: z.string().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  location: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  roomType: z.string().optional().nullable(),
  numberOfRooms: z.number().int().min(1).optional().nullable(),
  numberOfBeds: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET - Get single accommodation from catalog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const accommodation = await prisma.accommodationCatalog.findFirst({
      where: { id, agentId: agent.id },
      include: {
        tourAccommodations: {
          include: {
            tour: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    })

    if (!accommodation) {
      return NextResponse.json({ error: "Accommodation not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      accommodation: {
        ...accommodation,
        images: JSON.parse(accommodation.images),
        amenities: JSON.parse(accommodation.amenities),
        toursUsing: accommodation.tourAccommodations.map((ta) => ({
          id: ta.tour.id,
          title: ta.tour.title,
          slug: ta.tour.slug,
          priceOverride: ta.pricePerNightOverride,
          availableDays: JSON.parse(ta.availableDays),
          isDefault: ta.isDefault,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching accommodation:", error)
    return NextResponse.json(
      { error: "Failed to fetch accommodation" },
      { status: 500 }
    )
  }
}

// PATCH - Update accommodation in catalog
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const existingAcc = await prisma.accommodationCatalog.findFirst({
      where: { id, agentId: agent.id },
    })

    if (!existingAcc) {
      return NextResponse.json({ error: "Accommodation not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateAccommodationSchema.parse(body)

    const accommodation = await prisma.accommodationCatalog.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.tier !== undefined && { tier: validatedData.tier }),
        ...(validatedData.basePricePerNight !== undefined && { basePricePerNight: validatedData.basePricePerNight }),
        ...(validatedData.currency !== undefined && { currency: validatedData.currency }),
        ...(validatedData.images !== undefined && { images: JSON.stringify(validatedData.images) }),
        ...(validatedData.amenities !== undefined && { amenities: JSON.stringify(validatedData.amenities) }),
        ...(validatedData.location !== undefined && { location: validatedData.location }),
        ...(validatedData.rating !== undefined && { rating: validatedData.rating }),
        ...(validatedData.roomType !== undefined && { roomType: validatedData.roomType }),
        ...(validatedData.numberOfRooms !== undefined && { numberOfRooms: validatedData.numberOfRooms }),
        ...(validatedData.numberOfBeds !== undefined && { numberOfBeds: validatedData.numberOfBeds }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      accommodation: {
        ...accommodation,
        images: JSON.parse(accommodation.images),
        amenities: JSON.parse(accommodation.amenities),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error updating accommodation:", error)
    return NextResponse.json(
      { error: "Failed to update accommodation" },
      { status: 500 }
    )
  }
}

// DELETE - Delete accommodation from catalog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const existingAcc = await prisma.accommodationCatalog.findFirst({
      where: { id, agentId: agent.id },
      include: { _count: { select: { tourAccommodations: true } } },
    })

    if (!existingAcc) {
      return NextResponse.json({ error: "Accommodation not found" }, { status: 404 })
    }

    if (existingAcc._count.tourAccommodations > 0) {
      await prisma.accommodationCatalog.update({
        where: { id },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        message: "Accommodation is used by tours. Deactivated instead of deleted.",
        deactivated: true,
      })
    }

    await prisma.accommodationCatalog.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Accommodation deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting accommodation:", error)
    return NextResponse.json(
      { error: "Failed to delete accommodation" },
      { status: 500 }
    )
  }
}
