import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { VehicleType } from "@prisma/client"

const vehicleUpdateSchema = z.object({
  type: z.enum([
    "SAFARI_VAN",
    "LAND_CRUISER",
    "EXTENDED_CRUISER",
    "OVERLAND_TRUCK",
    "PRIVATE_VEHICLE",
  ] as const).optional(),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  description: z.string().optional().nullable(),
  maxPassengers: z.number().int().min(1).max(50).optional(),
  pricePerDay: z.number().min(0).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// GET a single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleId: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId, vehicleId } = await params

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

    // Fetch vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!vehicle || vehicle.tourId !== tourId) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({
      vehicle: {
        ...vehicle,
        features: JSON.parse(vehicle.features || "[]"),
        images: JSON.parse(vehicle.images || "[]"),
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

// PATCH update a vehicle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleId: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId, vehicleId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can update vehicles" },
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

    // Verify vehicle belongs to tour
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!existingVehicle || existingVehicle.tourId !== tourId) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = vehicleUpdateSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await prisma.vehicle.updateMany({
        where: { tourId, id: { not: vehicleId }, isDefault: true },
        data: { isDefault: false },
      })
    }

    // Build update object
    const updateData: Record<string, unknown> = {}
    if (data.type !== undefined) updateData.type = data.type as VehicleType
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.maxPassengers !== undefined) updateData.maxPassengers = data.maxPassengers
    if (data.pricePerDay !== undefined) updateData.pricePerDay = data.pricePerDay
    if (data.features !== undefined) updateData.features = JSON.stringify(data.features)
    if (data.images !== undefined) updateData.images = JSON.stringify(data.images)
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // Update vehicle
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    })

    return NextResponse.json({
      message: "Vehicle updated successfully",
      vehicle: {
        ...vehicle,
        features: JSON.parse(vehicle.features || "[]"),
        images: JSON.parse(vehicle.images || "[]"),
      },
    })
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return NextResponse.json(
      { error: "Failed to update vehicle" },
      { status: 500 }
    )
  }
}

// DELETE a vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleId: string }> }
) {
  try {
    const session = await auth()
    const { id: tourId, vehicleId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "AGENT") {
      return NextResponse.json(
        { error: "Only agents can delete vehicles" },
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

    // Verify vehicle belongs to tour
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    })

    if (!existingVehicle || existingVehicle.tourId !== tourId) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    const wasDefault = existingVehicle.isDefault

    // Delete vehicle
    await prisma.vehicle.delete({
      where: { id: vehicleId },
    })

    // If deleted vehicle was default, set first remaining as default
    if (wasDefault) {
      const firstVehicle = await prisma.vehicle.findFirst({
        where: { tourId },
        orderBy: { pricePerDay: "asc" },
      })
      if (firstVehicle) {
        await prisma.vehicle.update({
          where: { id: firstVehicle.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return NextResponse.json(
      { error: "Failed to delete vehicle" },
      { status: 500 }
    )
  }
}
