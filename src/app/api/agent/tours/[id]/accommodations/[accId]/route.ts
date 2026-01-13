import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { AccommodationTier, getEnumValues } from "@/lib/constants"

const updateAccommodationSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  tier: z.enum(getEnumValues(AccommodationTier) as [string, ...string[]]).optional(),
  pricePerNight: z.number().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  amenities: z.array(z.string()).optional(),
  location: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  dayNumber: z.number().int().min(1).optional().nullable(),
})

// PUT update an accommodation option
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accId: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId, accId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can update accommodations" },
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

    // Check accommodation exists
    const existing = await prisma.accommodationOption.findUnique({
      where: { id: accId },
    })

    if (!existing || existing.tourId !== tourId) {
      return NextResponse.json(
        { error: "Accommodation not found" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateAccommodationSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Build update data
    const updateData: Record<string, unknown> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.tier !== undefined) updateData.tier = data.tier
    if (data.pricePerNight !== undefined) updateData.pricePerNight = data.pricePerNight
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images)
    if (data.amenities !== undefined) updateData.amenities = JSON.stringify(data.amenities)
    if (data.location !== undefined) updateData.location = data.location
    if (data.rating !== undefined) updateData.rating = data.rating
    if (data.dayNumber !== undefined) updateData.dayNumber = data.dayNumber

    // Update accommodation
    const accommodation = await prisma.accommodationOption.update({
      where: { id: accId },
      data: updateData,
    })

    return NextResponse.json({
      message: "Accommodation updated successfully",
      accommodation: {
        ...accommodation,
        images: JSON.parse(accommodation.images || "[]"),
        amenities: JSON.parse(accommodation.amenities || "[]"),
      },
    })
  } catch (error) {
    console.error("Error updating accommodation:", error)
    return NextResponse.json(
      { error: "Failed to update accommodation" },
      { status: 500 }
    )
  }
}

// DELETE remove an accommodation option
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; accId: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId, accId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can delete accommodations" },
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

    // Check accommodation exists
    const existing = await prisma.accommodationOption.findUnique({
      where: { id: accId },
    })

    if (!existing || existing.tourId !== tourId) {
      return NextResponse.json(
        { error: "Accommodation not found" },
        { status: 404 }
      )
    }

    // Delete accommodation
    await prisma.accommodationOption.delete({
      where: { id: accId },
    })

    return NextResponse.json({ message: "Accommodation deleted successfully" })
  } catch (error) {
    console.error("Error deleting accommodation:", error)
    return NextResponse.json(
      { error: "Failed to delete accommodation" },
      { status: 500 }
    )
  }
}
