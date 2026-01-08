import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateAddonSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  duration: z.string().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  maxCapacity: z.number().int().min(1).optional().nullable(),
  dayAvailable: z.array(z.number().int().min(1)).optional(),
})

// PUT update an activity addon
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addonId: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId, addonId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can update activity addons" },
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

    // Check addon exists
    const existing = await prisma.activityAddon.findUnique({
      where: { id: addonId },
    })

    if (!existing || existing.tourId !== tourId) {
      return NextResponse.json(
        { error: "Activity addon not found" },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = updateAddonSchema.safeParse(body)

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
    if (data.price !== undefined) updateData.price = data.price
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images)
    if (data.maxCapacity !== undefined) updateData.maxCapacity = data.maxCapacity
    if (data.dayAvailable !== undefined) updateData.dayAvailable = JSON.stringify(data.dayAvailable)

    // Update addon
    const addon = await prisma.activityAddon.update({
      where: { id: addonId },
      data: updateData,
    })

    return NextResponse.json({
      message: "Activity addon updated successfully",
      addon: {
        ...addon,
        images: JSON.parse(addon.images || "[]"),
        dayAvailable: JSON.parse(addon.dayAvailable || "[]"),
      },
    })
  } catch (error) {
    console.error("Error updating addon:", error)
    return NextResponse.json(
      { error: "Failed to update activity addon" },
      { status: 500 }
    )
  }
}

// DELETE remove an activity addon
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; addonId: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId, addonId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can delete activity addons" },
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

    // Check addon exists
    const existing = await prisma.activityAddon.findUnique({
      where: { id: addonId },
    })

    if (!existing || existing.tourId !== tourId) {
      return NextResponse.json(
        { error: "Activity addon not found" },
        { status: 404 }
      )
    }

    // Delete addon
    await prisma.activityAddon.delete({
      where: { id: addonId },
    })

    return NextResponse.json({ message: "Activity addon deleted successfully" })
  } catch (error) {
    console.error("Error deleting addon:", error)
    return NextResponse.json(
      { error: "Failed to delete activity addon" },
      { status: 500 }
    )
  }
}
