import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Publish a tour (change status from DRAFT to ACTIVE)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can publish tours" },
        { status: 403 }
      )
    }

    // Find agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    // Check agent is active
    if (agent.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Your agent account must be approved before publishing tours" },
        { status: 403 }
      )
    }

    // Fetch tour with itinerary count
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            itinerary: true,
          },
        },
      },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Verify ownership
    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to publish this tour" },
        { status: 403 }
      )
    }

    // Check if already published
    if (tour.status === "ACTIVE") {
      return NextResponse.json(
        { error: "Tour is already published" },
        { status: 400 }
      )
    }

    // Validate tour completeness
    const errors: string[] = []

    if (!tour.title || tour.title.length < 5) {
      errors.push("Title must be at least 5 characters")
    }
    if (!tour.description || tour.description.length < 50) {
      errors.push("Description must be at least 50 characters")
    }
    if (!tour.destination) {
      errors.push("Destination is required")
    }
    if (!tour.country) {
      errors.push("Country is required")
    }
    if (tour.basePrice <= 0) {
      errors.push("Price must be greater than 0")
    }
    if (tour.durationDays < 1) {
      errors.push("Duration must be at least 1 day")
    }

    // Check tour types
    const tourTypes = JSON.parse(tour.tourType || "[]")
    if (tourTypes.length === 0) {
      errors.push("At least one tour type is required")
    }

    // Check for at least 1 itinerary day (required per documentation)
    if (tour._count.itinerary === 0) {
      errors.push("At least one itinerary day is required")
    }

    // Check for at least 1 image (cover image or gallery images required)
    const images = JSON.parse(tour.images || "[]")
    if (!tour.coverImage && images.length === 0) {
      errors.push("At least one image is required (cover image or gallery)")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Tour is not ready to publish",
          details: errors,
        },
        { status: 400 }
      )
    }

    // Update tour status
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: {
        status: "ACTIVE",
      },
    })

    return NextResponse.json({
      message: "Tour published successfully",
      tour: {
        id: updatedTour.id,
        slug: updatedTour.slug,
        title: updatedTour.title,
        status: updatedTour.status,
      },
    })
  } catch (error) {
    console.error("Error publishing tour:", error)
    return NextResponse.json(
      { error: "Failed to publish tour" },
      { status: 500 }
    )
  }
}

// DELETE - Unpublish a tour (change status from ACTIVE to PAUSED)
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

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can unpublish tours" },
        { status: 403 }
      )
    }

    // Find agent profile
    const agent = await prisma.agent.findUnique({
      where: { userId: session.user.id },
    })

    if (!agent) {
      return NextResponse.json(
        { error: "Agent profile not found" },
        { status: 404 }
      )
    }

    // Fetch tour
    const tour = await prisma.tour.findUnique({
      where: { id },
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    // Verify ownership
    if (tour.agentId !== agent.id) {
      return NextResponse.json(
        { error: "You don't have permission to unpublish this tour" },
        { status: 403 }
      )
    }

    // Check if not published
    if (tour.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Tour is not currently published" },
        { status: 400 }
      )
    }

    // Update tour status to PAUSED
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: {
        status: "PAUSED",
      },
    })

    return NextResponse.json({
      message: "Tour unpublished successfully",
      tour: {
        id: updatedTour.id,
        slug: updatedTour.slug,
        title: updatedTour.title,
        status: updatedTour.status,
      },
    })
  } catch (error) {
    console.error("Error unpublishing tour:", error)
    return NextResponse.json(
      { error: "Failed to unpublish tour" },
      { status: 500 }
    )
  }
}
