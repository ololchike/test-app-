import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateVehicleSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum([
    "SAFARI_VAN",
    "LAND_CRUISER",
    "EXTENDED_CRUISER",
    "OVERLAND_TRUCK",
    "PRIVATE_VEHICLE",
  ]).optional(),
  description: z.string().optional().nullable(),
  maxPassengers: z.number().min(1).optional(),
  basePricePerDay: z.number().min(0).optional(),
  currency: z.string().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
})

// GET - Get single vehicle from catalog
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

    const vehicle = await prisma.vehicleCatalog.findFirst({
      where: { id, agentId: agent.id },
      include: {
        tourVehicles: {
          include: {
            tour: { select: { id: true, title: true, slug: true } },
          },
        },
      },
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      vehicle: {
        ...vehicle,
        features: JSON.parse(vehicle.features),
        images: JSON.parse(vehicle.images),
        toursUsing: vehicle.tourVehicles.map((tv) => ({
          id: tv.tour.id,
          title: tv.tour.title,
          slug: tv.tour.slug,
          priceOverride: tv.pricePerDayOverride,
          isDefault: tv.isDefault,
          isIncludedInBase: tv.isIncludedInBase,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching vehicle:", error)
    return NextResponse.json(
      { error: "Failed to fetch vehicle" },
      { status: 500 }
    )
  }
}

// PATCH - Update vehicle in catalog
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

    const existingVehicle = await prisma.vehicleCatalog.findFirst({
      where: { id, agentId: agent.id },
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateVehicleSchema.parse(body)

    const vehicle = await prisma.vehicleCatalog.update({
      where: { id },
      data: {
        ...(validatedData.name !== undefined && { name: validatedData.name }),
        ...(validatedData.type !== undefined && { type: validatedData.type }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.maxPassengers !== undefined && { maxPassengers: validatedData.maxPassengers }),
        ...(validatedData.basePricePerDay !== undefined && { basePricePerDay: validatedData.basePricePerDay }),
        ...(validatedData.currency !== undefined && { currency: validatedData.currency }),
        ...(validatedData.features !== undefined && { features: JSON.stringify(validatedData.features) }),
        ...(validatedData.images !== undefined && { images: JSON.stringify(validatedData.images) }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
      },
    })

    return NextResponse.json({
      success: true,
      vehicle: {
        ...vehicle,
        features: JSON.parse(vehicle.features),
        images: JSON.parse(vehicle.images),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    console.error("Error updating vehicle:", error)
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    )
  }
}

// DELETE - Delete vehicle from catalog
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

    const existingVehicle = await prisma.vehicleCatalog.findFirst({
      where: { id, agentId: agent.id },
      include: { _count: { select: { tourVehicles: true } } },
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    if (existingVehicle._count.tourVehicles > 0) {
      await prisma.vehicleCatalog.update({
        where: { id },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        message: "Vehicle is used by tours. Deactivated instead of deleted.",
        deactivated: true,
      })
    }

    await prisma.vehicleCatalog.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    )
  }
}
